import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from backend.database import get_db, is_mongo_available, set_mongo_available

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


def _from_fallback(uid: str) -> dict | None:
    store = _load_fallback()
    return _serialize(store[uid]) if uid in store else None


def _upsert_fallback(uid: str, email: str, name: str, updates: dict | None = None) -> dict:
    store = _load_fallback()
    current = store.get(uid) or _empty_profile(uid, email, name)
    if email:
        current["email"] = email
    if name:
        current["name"] = name
    if updates:
        current.update(updates)
    store[uid] = current
    _save_fallback()
    return _serialize(current)


async def get_user_by_uid(uid: str) -> dict | None:
    if is_mongo_available():
        try:
            db = get_db()
            found = await db.users.find_one({"uid": uid}, {"_id": 0})
            set_mongo_available(True)
            if found:
                return _serialize(found)
        except Exception as exc:
            set_mongo_available(False)
            logging.warning("MongoDB read failed, using local profile store: %s", exc)
    return _from_fallback(uid)


async def create_user(uid: str, email: str, name: str) -> dict:
    existing = await get_user_by_uid(uid)
    if existing:
        return existing

    doc = _empty_profile(uid, email, name)
    if is_mongo_available():
        try:
            db = get_db()
            await db.users.insert_one(doc)
            set_mongo_available(True)
            return _serialize(doc)
        except Exception as exc:
            set_mongo_available(False)
            logging.warning("MongoDB write failed, using local profile store: %s", exc)
    return _upsert_fallback(uid, email, name)


async def update_user(uid: str, updates: dict) -> dict | None:
    updates = {**updates, "updated_at": _now()}
    if is_mongo_available():
        try:
            db = get_db()
            result = await db.users.find_one_and_update(
                {"uid": uid},
                {"$set": updates},
                return_document=True,
            )
            set_mongo_available(True)
            if result:
                result.pop("_id", None)
                return _serialize(result)
        except Exception as exc:
            set_mongo_available(False)
            logging.warning("MongoDB update failed, using local profile store: %s", exc)

    existing = _from_fallback(uid)
    email = (existing or {}).get("email", "") or updates.get("email", "")
    name = (existing or {}).get("name", "") or updates.get("name", "") or "Student"
    return _upsert_fallback(uid, str(email), str(name), updates)


async def patch_user_field(uid: str, key: str, value) -> dict | None:
    return await update_user(uid, {key: value})


async def delete_user(uid: str) -> bool:
    """
    Deletes a user profile from the backend store (Mongo if available, otherwise fallback JSON/memory).
    Used by DELETE /api/users/me.
    """

    deleted = False

    # Mongo path
    if is_mongo_available():
        try:
            db = get_db()
            result = await db.users.delete_one({"uid": uid})
            deleted = bool(getattr(result, "deleted_count", 0))
            set_mongo_available(True)
            return deleted
        except Exception as exc:
            set_mongo_available(False)
            logging.warning("MongoDB delete failed, using local profile store: %s", exc)

    # Fallback path (memory + optional persisted json file)
    store = _load_fallback()
    if uid in store:
        try:
            if uid in _memory:
                del _memory[uid]
            else:
                # If _memory was empty but _load_fallback read from disk into _memory,
                # ensure we delete from the canonical map.
                _memory.pop(uid, None)
            _save_fallback()
            deleted = True
        except Exception as exc:
            logging.warning("Fallback user delete failed: %s", exc)

    return deleted
