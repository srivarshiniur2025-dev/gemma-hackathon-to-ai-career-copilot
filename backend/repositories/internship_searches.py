import hashlib
import json
from datetime import datetime, timedelta, timezone

from backend.database import get_db

COLLECTION = "internship_search_cache"
CACHE_TTL = timedelta(hours=1)


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _cache_key(query: str, location: str | None, skills: list[str] | None) -> str:
    payload = {
        "query": query.strip().lower(),
        "location": (location or "").strip().lower(),
        "skills": sorted([s.strip().lower() for s in (skills or []) if s.strip()]),
    }
    raw = json.dumps(payload, sort_keys=True)
    return hashlib.sha256(raw.encode()).hexdigest()


async def get_cached_search(query: str, location: str | None, skills: list[str] | None) -> dict | None:
    db = get_db()
    key = _cache_key(query, location, skills)
    doc = await db[COLLECTION].find_one({"cache_key": key}, {"_id": 0})
    if not doc:
        return None

    cached_at = doc.get("cached_at")
    if not cached_at or cached_at < _now() - CACHE_TTL:
        await db[COLLECTION].delete_one({"cache_key": key})
        return None

    return doc.get("results")


async def set_cached_search(
    query: str,
    location: str | None,
    skills: list[str] | None,
    results: dict,
) -> None:
    db = get_db()
    key = _cache_key(query, location, skills)
    await db[COLLECTION].update_one(
        {"cache_key": key},
        {
            "$set": {
                "cache_key": key,
                "query": query,
                "location": location,
                "skills": skills or [],
                "results": results,
                "cached_at": _now(),
            }
        },
        upsert=True,
    )


def _recommend_key(uid: str) -> str:
    return f"recommend:{uid}"


async def get_cached_recommend(uid: str) -> dict | None:
    db = get_db()
    key = _recommend_key(uid)
    doc = await db[COLLECTION].find_one({"cache_key": key}, {"_id": 0})
    if not doc:
        return None

    cached_at = doc.get("cached_at")
    if not cached_at or cached_at < _now() - CACHE_TTL:
        await db[COLLECTION].delete_one({"cache_key": key})
        return None

    return doc.get("results")


async def set_cached_recommend(uid: str, results: dict) -> None:
    db = get_db()
    key = _recommend_key(uid)
    await db[COLLECTION].update_one(
        {"cache_key": key},
        {
            "$set": {
                "cache_key": key,
                "uid": uid,
                "results": results,
                "cached_at": _now(),
            }
        },
        upsert=True,
    )
