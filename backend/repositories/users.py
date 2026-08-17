import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from backend.database import get_db

_FALLBACK_FILE = Path(__file__).resolve().parent.parent / "data" / "users.json"
_memory: dict[str, dict[str, Any]] = {}


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _serialize(doc: dict[str, Any]) -> dict[str, Any]:
    out = {k: v for k, v in doc.items() if k != "_id"}
    for key, value in list(out.items()):
        if isinstance(value, datetime):
            out[key] = value.isoformat()
    return out


def _empty_profile(uid: str, email: str, name: str) -> dict[str, Any]:
    return {
        "uid": uid,
        "email": email,
        "name": name,
        "degree": "",
        "institution": "",
        "learner_track": "",
        "onboarding_answers": {},
        "onboarding_complete": False,
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
        "planner_events": [],
        "created_at": _now(),
        "updated_at": _now(),
    }


def _load_fallback() -> dict[str, dict[str, Any]]:
    if _memory:
        return _memory
    if _FALLBACK_FILE.exists():
        try:
            data = json.loads(_FALLBACK_FILE.read_text(encoding="utf-8"))
            _memory.update(data)
        except Exception:
            pass
    return _memory


def _save_fallback() -> None:
    try:
        _FALLBACK_FILE.parent.mkdir(parents=True, exist_ok=True)
        serializable = {uid: _serialize(doc) for uid, doc in _memory.items()}
        _FALLBACK_FILE.write_text(json.dumps(serializable, indent=2), encoding="utf-8")
    except Exception as exc:
        logging.warning("Could not persist fallback user store: %s", exc)


async def get_user_by_uid(uid: str) -> dict | None:
    try:
        db = get_db()
        found = await db.users.find_one({"uid": uid}, {"_id": 0})
        if found:
            return found
    except Exception as exc:
        logging.warning("MongoDB read failed, using local profile store: %s", exc)
    return _serialize(_load_fallback()[uid]) if uid in _load_fallback() else None


async def create_user(uid: str, email: str, name: str) -> dict:
    existing = await get_user_by_uid(uid)
    if existing:
        return existing

    doc = _empty_profile(uid, email, name)
    try:
        db = get_db()
        await db.users.insert_one(doc)
        return _serialize(doc)
    except Exception as exc:
        logging.warning("MongoDB write failed, using local profile store: %s", exc)
        _load_fallback()[uid] = doc
        _save_fallback()
        return _serialize(doc)


async def update_user(uid: str, updates: dict) -> dict | None:
    updates = {**updates, "updated_at": _now()}
    try:
        db = get_db()
        result = await db.users.find_one_and_update(
            {"uid": uid},
            {"$set": updates},
            return_document=True,
        )
        if result:
            result.pop("_id", None)
            return result
    except Exception as exc:
        logging.warning("MongoDB update failed, using local profile store: %s", exc)

    store = _load_fallback()
    current = store.get(uid)
    if not current:
        return None
    current.update(updates)
    store[uid] = current
    _save_fallback()
    return _serialize(current)


async def patch_user_field(uid: str, key: str, value) -> dict | None:
    return await update_user(uid, {key: value})
