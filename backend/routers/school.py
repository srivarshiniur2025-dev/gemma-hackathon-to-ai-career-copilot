import asyncio
import logging
import re
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from backend.auth import get_current_user
from backend.prompts.school import (
    NOTES_SYSTEM,
    QUESTION_SYSTEM,
    chat_system_prompt,
    chat_user_prompt,
    notes_user_prompt,
    question_user_prompt,
)
from backend.services.gemma import GemmaAuthError, GemmaRateLimitError, gemma_service

router = APIRouter(prefix="/school", tags=["school"])
log = logging.getLogger(__name__)


class ChapterContext(BaseModel):
    class_level: Literal[9, 10]
    subject: Literal["science", "maths"]
    chapter_id: str
    chapter_number: int
    chapter_name: str = Field(max_length=200)
    book: str = Field(max_length=200)
    key_topics: list[str] = Field(default_factory=list, max_length=20)
    topics: list[str] = Field(default_factory=list, max_length=20)
    excluded: list[str] = Field(default_factory=list, max_length=20)


class GenerateQuestionsRequest(ChapterContext):
    difficulty: Literal["easy", "medium", "hard", "mixed"] = "medium"
    count: int = Field(default=5, ge=1, le=15)
    references: list[str] = Field(default_factory=list, max_length=6)
    recommendation: str | None = Field(default=None, max_length=600)
    own_notes: str | None = Field(default=None, max_length=4000)


class SchoolQuestionOut(BaseModel):
    question: str
    options: list[str]
    answer_index: int
    explanation: str
    reference: str
    syllabus_point: str
    difficulty: str
    chapter_id: str | None = None


class GenerateQuestionsResponse(BaseModel):
    questions: list[SchoolQuestionOut]
    model: str


class NotesRequest(ChapterContext):
    style: Literal["short", "standard", "detailed"] = "standard"
    preferences: list[str] = Field(default_factory=list, max_length=12)
    request: str | None = Field(default=None, max_length=600)


class SyllabusChapter(BaseModel):
    id: str
    number: int
    name: str = Field(max_length=200)
    key_topics: list[str] = Field(default_factory=list, max_length=20)
    excluded: list[str] = Field(default_factory=list, max_length=20)
    internal_only: bool = False


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(max_length=4000)


class ChatRequest(BaseModel):
    mode: Literal["questions", "notes"]
    class_level: Literal[9, 10]
    subject: Literal["science", "maths"]
    book: str = Field(max_length=200)
    chapters: list[SyllabusChapter] = Field(max_length=30)
    focus_chapter_id: str | None = None
    message: str = Field(min_length=1, max_length=2000)
    history: list[ChatMessage] = Field(default_factory=list, max_length=20)
    preferences: list[str] = Field(default_factory=list, max_length=12)


def _norm(text: str) -> str:
    return " ".join(text.lower().split())


def _resolve_answer(item: dict, options: list[str]) -> int | None:
    """Pick the correct option index, rejecting questions whose answer key contradicts itself."""
    normalized = [_norm(o) for o in options]
    answer_text = _norm(str(item.get("answer") or ""))
    by_text = normalized.index(answer_text) if answer_text in normalized else None
    try:
        by_index = int(item.get("answer_index"))
    except (TypeError, ValueError):
        by_index = None
    if by_index is not None and not 0 <= by_index <= 3:
        by_index = None

    if by_text is not None and by_index is not None and by_text != by_index:
        return None
    answer = by_text if by_text is not None else by_index
    if answer is None:
        return None

    explanation = _norm(str(item.get("explanation") or ""))
    mentioned = [i for i, o in enumerate(normalized) if len(o) >= 3 and o in explanation]
    if mentioned and answer not in mentioned:
        return None
    return answer


def _clean_question_items(
    items,
    *,
    count: int,
    topics: list[str],
    default_difficulty: str,
    default_reference: str,
    fallback_point: str,
    valid_chapter_ids: set[str] | None = None,
) -> list[SchoolQuestionOut]:
    allowed_points = {t.lower() for t in topics}
    out: list[SchoolQuestionOut] = []
    seen: set[str] = set()
    for item in items or []:
        if not isinstance(item, dict):
            continue
        question = str(item.get("question") or "").strip()
        options = [str(o).strip() for o in (item.get("options") or []) if str(o).strip()]
        if not question or len(options) != 4 or len({o.lower() for o in options}) != 4:
            continue
        answer = _resolve_answer(item, options)
        if answer is None or question.lower() in seen:
            continue
        seen.add(question.lower())
        point = str(item.get("syllabus_point") or "").strip()
        if allowed_points and point.lower() not in allowed_points:
            point = topics[0] if topics else fallback_point
        difficulty = str(item.get("difficulty") or default_difficulty)
        if difficulty not in {"easy", "medium", "hard"}:
            difficulty = default_difficulty if default_difficulty in {"easy", "medium", "hard"} else "medium"
        chapter_id = str(item.get("chapter_id") or "") or None
        if valid_chapter_ids is not None and chapter_id not in valid_chapter_ids:
            chapter_id = None
        out.append(
            SchoolQuestionOut(
                question=question,
                options=options,
                answer_index=answer,
                explanation=str(item.get("explanation") or "").strip(),
                reference=str(item.get("reference") or default_reference).strip(),
                syllabus_point=point or fallback_point,
                difficulty=difficulty,
                chapter_id=chapter_id,
            )
        )
    return out[:count]


def _list_of_str(value) -> list[str]:
    return [str(v).strip() for v in (value or []) if str(v).strip()] if isinstance(value, list) else []


def _clean_notes(raw: dict, title_fallback: str) -> dict | None:
    if not isinstance(raw, dict):
        return None
    sections = []
    for s in raw.get("sections") or []:
        if isinstance(s, dict) and s.get("heading"):
            sections.append({"heading": str(s["heading"]), "points": _list_of_str(s.get("points"))})
    if not sections and not raw.get("summary"):
        return None
    return {
        "title": str(raw.get("title") or title_fallback),
        "summary": str(raw.get("summary") or ""),
        "sections": sections,
        "key_terms": [
            {"term": str(k.get("term")), "meaning": str(k.get("meaning") or "")}
            for k in raw.get("key_terms") or []
            if isinstance(k, dict) and k.get("term")
        ],
        "formulas": _list_of_str(raw.get("formulas")),
        "examples": _list_of_str(raw.get("examples")),
        "mistakes": _list_of_str(raw.get("mistakes")),
        "memory_tricks": _list_of_str(raw.get("memory_tricks")),
        "exam_tips": _list_of_str(raw.get("exam_tips")),
        "quick_check": [
            {"q": str(k.get("q")), "a": str(k.get("a") or "")}
            for k in raw.get("quick_check") or []
            if isinstance(k, dict) and k.get("q")
        ],
    }


async def _gemma_json(system: str, user: str, *, temperature: float, what: str) -> dict:
    try:
        return await asyncio.to_thread(gemma_service.generate_json, system, user, temperature=temperature, fast=True)
    except (GemmaAuthError, GemmaRateLimitError):
        raise
    except Exception as exc:
        log.warning("School %s failed: %s", what, exc)
        raise HTTPException(status_code=503, detail=f"Gemma could not {what} right now. Please try again.") from exc


@router.post("/generate-questions", response_model=GenerateQuestionsResponse)
async def generate_questions(
    payload: GenerateQuestionsRequest,
    _user: Annotated[dict, Depends(get_current_user)],
):
    raw = await _gemma_json(
        QUESTION_SYSTEM,
        # Ask for a couple of spares so dropping an inconsistent question still fills the set.
        question_user_prompt({**payload.model_dump(), "count": payload.count + 2}),
        temperature=0.5,
        what="generate questions",
    )
    questions = _clean_question_items(
        raw.get("questions"),
        count=payload.count,
        topics=payload.topics or payload.key_topics,
        default_difficulty=payload.difficulty if payload.difficulty != "mixed" else "medium",
        default_reference=f"{payload.book}, Ch {payload.chapter_number}",
        fallback_point=payload.chapter_name,
    )
    if not questions:
        raise HTTPException(status_code=502, detail="Gemma returned no valid questions. Try again.")
    return GenerateQuestionsResponse(questions=questions, model=gemma_service.active_model)


@router.post("/notes")
async def generate_notes(
    payload: NotesRequest,
    _user: Annotated[dict, Depends(get_current_user)],
):
    raw = await _gemma_json(NOTES_SYSTEM, notes_user_prompt(payload.model_dump()), temperature=0.4, what="write notes")
    notes = _clean_notes(raw, payload.chapter_name)
    if not notes:
        raise HTTPException(status_code=502, detail="Gemma returned empty notes. Try again.")
    return {**notes, "model": gemma_service.active_model}


@router.post("/chat")
async def chat(
    payload: ChatRequest,
    _user: Annotated[dict, Depends(get_current_user)],
):
    data = payload.model_dump()
    raw = await _gemma_json(chat_system_prompt(data), chat_user_prompt(data), temperature=0.5, what="reply")

    reply = str(raw.get("reply") or "").strip()
    action = str(raw.get("action") or "chat")
    chapter_ids = {c.id for c in payload.chapters}
    chapter_id = str(raw.get("chapter_id") or "") or None
    if chapter_id not in chapter_ids:
        chapter_id = payload.focus_chapter_id if payload.focus_chapter_id in chapter_ids else None
    chapter = next((c for c in payload.chapters if c.id == chapter_id), None)

    questions: list[SchoolQuestionOut] = []
    notes = None
    if action == "questions":
        try:
            wanted = max(1, min(15, int(raw.get("count") or 15)))
        except (TypeError, ValueError):
            wanted = 15
        questions = _clean_question_items(
            raw.get("questions"),
            count=wanted,
            topics=[t for c in payload.chapters for t in c.key_topics] if not chapter else chapter.key_topics,
            default_difficulty="medium",
            default_reference=f"{payload.book}" + (f", Ch {chapter.number}: {chapter.name}" if chapter else ""),
            fallback_point=chapter.name if chapter else payload.subject.title(),
            valid_chapter_ids=chapter_ids,
        )
        for q in questions:
            q.chapter_id = q.chapter_id or chapter_id
        reply = re.sub(
            r"\b\d+(?=\s+(?:[\w-]+\s+){0,2}(?:questions?|MCQs?)\b)", str(len(questions)), reply, flags=re.IGNORECASE
        )
        if not questions:
            action = "chat"
            reply = reply or "I couldn't build a clean question set that time — could you tell me the chapter and how many questions you want?"
    elif action == "notes":
        notes = _clean_notes(raw.get("notes") or {}, chapter.name if chapter else "Notes")
        if not notes:
            action = "chat"
    else:
        action = "chat"

    answer = str(raw.get("answer") or "").strip()
    if action == "chat" and answer and answer not in reply:
        reply = f"{reply}\n\n{answer}" if reply else answer

    if not reply:
        reply = {
            "questions": f"Here are {len(questions)} questions for you.",
            "notes": "Here are your notes.",
        }.get(action, "Could you tell me a bit more about what you need?")

    return {
        "reply": reply,
        "action": action,
        "chapter_id": chapter_id,
        "questions": [q.model_dump() for q in questions],
        "notes": notes,
        "model": gemma_service.active_model,
    }
