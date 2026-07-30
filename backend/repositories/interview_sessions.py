import uuid
from datetime import datetime, timezone

from backend.database import get_db

COLLECTION = "interview_sessions"


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _initial_stage(focus: str) -> str:
    mapping = {
        "fundamentals": "fundamentals",
        "system_design": "system_design",
        "behavioral": "behavioral",
        "full_pipeline": "fundamentals",
    }
    return mapping.get(focus, "fundamentals")


def _total_questions(focus: str) -> int:
    return 6 if focus == "full_pipeline" else 4


async def create_session(
    uid: str,
    target_role: str,
    focus: str,
    company_context: str = "",
    resume_summary: str = "",
    target_skills: list[str] | None = None,
    job_description: str = "",
) -> dict:
    db = get_db()
    session_id = str(uuid.uuid4())
    doc = {
        "session_id": session_id,
        "uid": uid,
        "target_role": target_role,
        "focus": focus,
        "company_context": company_context,
        "resume_summary": resume_summary,
        "target_skills": target_skills or [],
        "job_description": job_description,
        "total_questions": _total_questions(focus),
        "status": "active",
        "current_stage": _initial_stage(focus),
        "question_count": 0,
        "transcript": [],
        "evaluation": None,
        "created_at": _now(),
        "updated_at": _now(),
    }
    await db[COLLECTION].insert_one(doc)
    doc.pop("_id", None)
    return doc
