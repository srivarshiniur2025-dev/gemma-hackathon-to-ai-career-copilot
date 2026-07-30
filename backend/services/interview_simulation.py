"""Advanced interview simulation powered by Gemma 4 structured question generation."""

import json
import re
from typing import AsyncIterator, Literal

from backend.repositories import interview_sessions as session_repo
from backend.repositories import users as user_repo
from backend.services.gemma import evaluate_interview_session, generate_interview_question, stream_interview_question

Stage = Literal["fundamentals", "system_design", "behavioral"]
Focus = Literal["fundamentals", "system_design", "behavioral", "full_pipeline"]

DEFAULT_COMPANY_CONTEXT = "a fast-growing technology company with modern engineering practices"

_memory_store: dict[str, list[dict[str, str]]] = {}


def get_memory(session_id: str) -> list[dict[str, str]]:
    if session_id not in _memory_store:
        _memory_store[session_id] = []
    return _memory_store[session_id]


def clear_memory(session_id: str) -> None:
    _memory_store.pop(session_id, None)


def _parse_json(raw: str) -> dict:
    cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw.strip(), flags=re.IGNORECASE)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if match:
            return json.loads(match.group())
        return {}


def _max_questions(focus: str) -> int:
    return 6 if focus == "full_pipeline" else 4


def _stage_for_session(focus: str, question_count: int) -> Stage:
    if focus == "fundamentals":
        return "fundamentals"
    if focus == "system_design":
        return "system_design"
    if focus == "behavioral":
        return "behavioral"
    if question_count < 2:
        return "fundamentals"
    if question_count < 4:
        return "system_design"
    return "behavioral"


def _skills_from_profile(profile: dict) -> list[str]:
    skills = list(profile.get("skills") or [])
    assessment = profile.get("assessment") or {}
    for skill in (assessment.get("skills_estimate") or {}).keys():
        if skill not in skills:
            skills.append(skill)
    if not skills:
        skills = ["Python", "Data Structures", "Problem Solving", "Communication"]
    return skills[:12]


def build_resume_summary(profile: dict | None) -> str:
    if not profile:
        return "No resume on file. Assume a computer science student preparing for an internship."

    parts: list[str] = []
    if profile.get("name"):
        parts.append(f"Name: {profile['name']}")
    if profile.get("degree"):
        parts.append(f"Degree: {profile['degree']}")
    if profile.get("target_role"):
        parts.append(f"Target role: {profile['target_role']}")

    resume = profile.get("resume") or {}
    if resume.get("summary"):
        parts.append(f"Resume summary: {resume['summary']}")
    elif profile.get("assessment", {}).get("summary"):
        parts.append(f"Assessment summary: {profile['assessment']['summary']}")

    projects = profile.get("projects") or resume.get("projects") or []
    if projects:
        if isinstance(projects[0], dict):
            project_names = [p.get("name", str(p)) for p in projects[:4]]
        else:
            project_names = [str(p) for p in projects[:4]]
        parts.append(f"Projects: {', '.join(project_names)}")

    skills = _skills_from_profile(profile)
    parts.append(f"Skills: {', '.join(skills[:10])}")
    return "\n".join(parts)


async def profile_context_for_uid(uid: str) -> tuple[str, list[str], str]:
    profile = await user_repo.get_user_by_uid(uid)
    resume_summary = build_resume_summary(profile)
    target_skills = _skills_from_profile(profile) if profile else [
        "Python",
        "Data Structures",
        "Problem Solving",
        "Communication",
    ]
    company_context = DEFAULT_COMPANY_CONTEXT
    if profile and profile.get("target_role"):
        company_context = f"a technology company hiring for {profile['target_role']} interns"
    return resume_summary, target_skills, company_context


def _normalize_question_payload(payload: dict, stage: Stage, question_number: int, raw_fallback: str = "") -> dict:
    question = (payload.get("question") or raw_fallback).strip()
    if not question:
        raise ValueError("Gemma 4 returned an empty interview question")

    question_type = payload.get("question_type") or "technical"
    hints = payload.get("what_good_answer_includes") or []
    if not isinstance(hints, list):
        hints = [str(hints)]

    return {
        "question": question,
        "question_type": question_type,
        "what_good_answer_includes": [str(h) for h in hints[:6]],
        "stage": stage,
        "question_number": question_number,
    }


async def _generate_question_payload(session: dict, question_number: int) -> dict:
    stage = _stage_for_session(session["focus"], question_number - 1)
    payload = generate_interview_question(session, question_number, stage)
    return _normalize_question_payload(payload, stage, question_number)


async def _persist_question(session_id: str, payload: dict) -> dict:
    memory = get_memory(session_id)
    memory.append({"role": "assistant", "content": payload["question"]})

    await session_repo.append_transcript(session_id, {
        "role": "assistant",
        "content": payload["question"],
        "stage": payload["stage"],
        "question_type": payload["question_type"],
        "what_good_answer_includes": payload["what_good_answer_includes"],
    })

    return await session_repo.update_session(session_id, {
        "question_count": payload["question_number"],
        "current_stage": payload["stage"],
    })


def _question_message(payload: dict) -> dict:
    return {
        "type": "question",
        "content": payload["question"],
        "stage": payload["stage"],
        "question_number": payload["question_number"],
        "question_type": payload["question_type"],
        "what_good_answer_includes": payload["what_good_answer_includes"],
    }


async def stream_question_events(session: dict, question_number: int) -> AsyncIterator[dict]:
    """Stream chunks then emit final question payload."""
    stage = _stage_for_session(session["focus"], question_number - 1)
    buffer = ""

    yield {"type": "stream_start", "question_number": question_number}

    async for chunk in stream_interview_question(session, question_number, stage):
        buffer += chunk
        yield {"type": "stream_chunk", "content": chunk}

    payload = _normalize_question_payload(_parse_json(buffer), stage, question_number, raw_fallback=buffer)
    await _persist_question(session["session_id"], payload)
    yield _question_message(payload)


async def generate_opening(session: dict) -> dict:
    payload = await _generate_question_payload(session, 1)
    updated = await _persist_question(session["session_id"], payload)
    return {**_question_message(payload), "session": updated}


async def process_answer(session_id: str, answer: str) -> dict:
    session = await session_repo.get_session(session_id)
    if not session:
        raise ValueError("Session not found")
    if session["status"] != "active":
        raise ValueError("Session is not active")

    memory = get_memory(session_id)
    memory.append({"role": "user", "content": answer})

    await session_repo.append_transcript(session_id, {
        "role": "user",
        "content": answer,
        "stage": session["current_stage"],
    })

    question_count = session.get("question_count", 0)
    max_q = session.get("total_questions") or _max_questions(session["focus"])

    if question_count >= max_q:
        await session_repo.update_session(session_id, {"status": "completed"})
        return {"type": "complete", "message": "Interview complete. Proceed to evaluation."}

    next_number = question_count + 1
    prev_stage = session["current_stage"]
    refreshed = await session_repo.get_session(session_id)
    payload = await _generate_question_payload(refreshed or session, next_number)
    await _persist_question(session_id, payload)

    stage_changed = payload["stage"] != prev_stage
    result = _question_message(payload)

    if stage_changed:
        result["stage_change"] = {
            "from": prev_stage,
            "to": payload["stage"],
            "message": f"Moving to {payload['stage'].replace('_', ' ').title()} stage.",
        }

    if next_number >= max_q:
        await session_repo.update_session(session_id, {"status": "completed"})
        result["type"] = "complete"
        result["message"] = "Interview complete. Proceed to evaluation."

    return result


async def process_answer_streaming(session_id: str, answer: str) -> AsyncIterator[dict]:
    session = await session_repo.get_session(session_id)
    if not session:
        raise ValueError("Session not found")
    if session["status"] != "active":
        raise ValueError("Session is not active")

    memory = get_memory(session_id)
    memory.append({"role": "user", "content": answer})

    await session_repo.append_transcript(session_id, {
        "role": "user",
        "content": answer,
        "stage": session["current_stage"],
    })

    question_count = session.get("question_count", 0)
    max_q = session.get("total_questions") or _max_questions(session["focus"])

    if question_count >= max_q:
        await session_repo.update_session(session_id, {"status": "completed"})
        yield {"type": "complete", "message": "Interview complete. Proceed to evaluation."}
        return

    next_number = question_count + 1
    prev_stage = session["current_stage"]
    refreshed = await session_repo.get_session(session_id)

    final_question: dict | None = None
    async for event in stream_question_events(refreshed or session, next_number):
        if event.get("type") == "question":
            final_question = event
            if event["stage"] != prev_stage:
                yield {
                    "type": "stage_change",
                    "from": prev_stage,
                    "to": event["stage"],
                    "message": f"Moving to {event['stage'].replace('_', ' ').title()} stage.",
                }
        yield event

    if final_question and next_number >= max_q:
        await session_repo.update_session(session_id, {"status": "completed"})
        yield {
            **final_question,
            "type": "complete",
            "message": "Interview complete. Proceed to evaluation.",
        }


async def evaluate_session(session_id: str, uid: str) -> dict:
    session = await session_repo.get_session(session_id, uid)
    if not session:
        raise ValueError("Session not found")

    transcript = session.get("transcript", [])
    if not transcript:
        raise ValueError("No transcript to evaluate")

    transcript_text = json.dumps(transcript, indent=2)
    evaluation = evaluate_interview_session(session, transcript_text)

    await session_repo.update_session(session_id, {
        "status": "evaluated",
        "evaluation": evaluation,
    })

    clear_memory(session_id)
    return evaluation
