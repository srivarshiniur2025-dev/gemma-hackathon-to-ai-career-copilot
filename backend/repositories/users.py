from datetime import datetime, timezone

from backend.database import get_db


def _now() -> datetime:
    return datetime.now(timezone.utc)


async def get_user_by_uid(uid: str) -> dict | None:
    db = get_db()
    return await db.users.find_one({"uid": uid}, {"_id": 0})


async def create_user(uid: str, email: str, name: str) -> dict:
    db = get_db()
    existing = await get_user_by_uid(uid)
    if existing:
        return existing

    doc = {
        "uid": uid,
        "email": email,
        "name": name,
        "degree": "",
        "interests": [],
        "target_role": "Software Developer",
        "skills": [],
        "projects": [],
        "certifications": [],
        "assessment": {"questions_asked": 0, "history": [], "skills_estimate": {}},
        "roadmap": None,
        "resume": None,
        "internships": [],
        "interview": {"history": [], "score": None},
        "progress_log": [],
        "created_at": _now(),
        "updated_at": _now(),
    }
    await db.users.insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}


async def update_user(uid: str, updates: dict) -> dict | None:
    db = get_db()
    updates["updated_at"] = _now()
    result = await db.users.find_one_and_update(
        {"uid": uid},
        {"$set": updates},
        return_document=True,
    )
    if not result:
        return None
    result.pop("_id", None)
    return result


async def patch_user_field(uid: str, key: str, value) -> dict | None:
    return await update_user(uid, {key: value})
