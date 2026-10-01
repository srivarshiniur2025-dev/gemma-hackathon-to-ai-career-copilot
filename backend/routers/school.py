import asyncio
import logging
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from backend.auth import get_current_user
from backend.prompts.school import NOTES_SYSTEM, QUESTION_SYSTEM, notes_user_prompt, question_user_prompt
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


class GenerateQuestionsResponse(BaseModel):
    questions: list[SchoolQuestionOut]
    model: str


class NotesRequest(ChapterContext):
    style: Literal["short", "standard", "detailed"] = "standard"
    preferences: list[str] = Field(default_factory=list, max_length=12)
    request: str | None = Field(default=None, max_length=600)


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


def _clean_questions(raw: dict, payload: GenerateQuestionsRequest) -> list[SchoolQuestionOut]:
    allowed_points = {t.lower() for t in (payload.topics or payload.key_topics)}
    out: list[SchoolQuestionOut] = []
    seen: set[str] = set()
    for item in raw.get("questions") or []:
        if not isinstance(item, dict):
            continue
        question = str(item.get("question") or "").strip()
        options = [str(o).strip() for o in (item.get("options") or []) if str(o).strip()]
        if not question or len(options) != 4 or len({o.lower() for o in options}) != 4:
            continue
        answer = _resolve_answer(item, options)
        if answer is None:
            continue
        if question.lower() in seen:
            continue
        seen.add(question.lower())
        point = str(item.get("syllabus_point") or "").strip()
        if allowed_points and point.lower() not in allowed_points:
            point = (payload.topics or payload.key_topics)[0]
        difficulty = str(item.get("difficulty") or payload.difficulty)
        if difficulty not in {"easy", "medium", "hard"}:
            difficulty = "medium" if payload.difficulty == "mixed" else payload.difficulty
        out.append(
            SchoolQuestionOut(
                question=question,
                options=options,
                answer_index=answer,
                explanation=str(item.get("explanation") or "").strip(),
                reference=str(item.get("reference") or f"{payload.book}, Ch {payload.chapter_number}").strip(),
                syllabus_point=point or payload.chapter_name,
                difficulty=difficulty,
            )
        )
    return out[: payload.count]


@router.post("/generate-questions", response_model=GenerateQuestionsResponse)
async def generate_questions(
    payload: GenerateQuestionsRequest,
    _user: Annotated[dict, Depends(get_current_user)],
):
    try:
        raw = await asyncio.to_thread(
            gemma_service.generate_json,
            QUESTION_SYSTEM,
            # Ask for a couple of spares so dropping an inconsistent question still fills the set.
            question_user_prompt({**payload.model_dump(), "count": payload.count + 2}),
            temperature=0.5,
            fast=True,
        )
    except (GemmaAuthError, GemmaRateLimitError):
        raise
    except Exception as exc:
        log.warning("School question generation failed: %s", exc)
        raise HTTPException(status_code=503, detail="Gemma could not generate questions right now.") from exc

    questions = _clean_questions(raw, payload)
    if not questions:
        raise HTTPException(status_code=502, detail="Gemma returned no valid questions. Try again.")
    return GenerateQuestionsResponse(questions=questions, model=gemma_service.active_model)


def _list_of_str(value) -> list[str]:
    return [str(v).strip() for v in (value or []) if str(v).strip()] if isinstance(value, list) else []


@router.post("/notes")
async def generate_notes(
    payload: NotesRequest,
    _user: Annotated[dict, Depends(get_current_user)],
):
    try:
        raw = await asyncio.to_thread(
            gemma_service.generate_json,
            NOTES_SYSTEM,
            notes_user_prompt(payload.model_dump()),
            temperature=0.4,
            fast=True,
        )
    except (GemmaAuthError, GemmaRateLimitError):
        raise
    except Exception as exc:
        log.warning("School notes generation failed: %s", exc)
        raise HTTPException(status_code=503, detail="Gemma could not write notes right now.") from exc

    sections = []
    for s in raw.get("sections") or []:
        if isinstance(s, dict) and s.get("heading"):
            sections.append({"heading": str(s["heading"]), "points": _list_of_str(s.get("points"))})
    key_terms = [
        {"term": str(k.get("term")), "meaning": str(k.get("meaning") or "")}
        for k in raw.get("key_terms") or []
        if isinstance(k, dict) and k.get("term")
    ]
    quick_check = [
        {"q": str(k.get("q")), "a": str(k.get("a") or "")}
        for k in raw.get("quick_check") or []
        if isinstance(k, dict) and k.get("q")
    ]
    if not sections and not raw.get("summary"):
        raise HTTPException(status_code=502, detail="Gemma returned empty notes. Try again.")
    return {
        "title": str(raw.get("title") or payload.chapter_name),
        "summary": str(raw.get("summary") or ""),
        "sections": sections,
        "key_terms": key_terms,
        "formulas": _list_of_str(raw.get("formulas")),
        "examples": _list_of_str(raw.get("examples")),
        "mistakes": _list_of_str(raw.get("mistakes")),
        "memory_tricks": _list_of_str(raw.get("memory_tricks")),
        "exam_tips": _list_of_str(raw.get("exam_tips")),
        "quick_check": quick_check,
        "model": gemma_service.active_model,
    }
