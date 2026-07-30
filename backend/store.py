import json
import uuid
from pathlib import Path
from typing import Any

DATA_DIR = Path(__file__).resolve().parent / "data"
DATA_DIR.mkdir(exist_ok=True)
PROFILES_FILE = DATA_DIR / "profiles.json"


def _load_all() -> dict[str, Any]:
    if not PROFILES_FILE.exists():
        return {}
    return json.loads(PROFILES_FILE.read_text(encoding="utf-8"))


def _save_all(data: dict[str, Any]) -> None:
    PROFILES_FILE.write_text(json.dumps(data, indent=2), encoding="utf-8")


def create_profile(payload: dict[str, Any]) -> dict[str, Any]:
    profile_id = str(uuid.uuid4())
    profile = {
        "id": profile_id,
        "name": payload.get("name", "Student"),
        "email": payload.get("email", ""),
        "degree": payload.get("degree", ""),
        "interests": payload.get("interests", []),
        "target_role": payload.get("target_role", "Software Developer"),
        "skills": payload.get("skills", []),
        "projects": payload.get("projects", []),
        "certifications": payload.get("certifications", []),
        "assessment": {"questions_asked": 0, "history": [], "skills_estimate": {}},
        "roadmap": None,
        "resume": None,
        "internships": [],
        "interview": {"history": [], "score": None},
        "progress_log": [],
    }
    data = _load_all()
    data[profile_id] = profile
    _save_all(data)
    return profile


def get_profile(profile_id: str) -> dict[str, Any] | None:
    return _load_all().get(profile_id)


def update_profile(profile_id: str, updates: dict[str, Any]) -> dict[str, Any] | None:
    data = _load_all()
    profile = data.get(profile_id)
    if not profile:
        return None
    profile.update(updates)
    data[profile_id] = profile
    _save_all(data)
    return profile


def patch_profile(profile_id: str, key: str, value: Any) -> dict[str, Any] | None:
    data = _load_all()
    profile = data.get(profile_id)
    if not profile:
        return None
    profile[key] = value
    data[profile_id] = profile
    _save_all(data)
    return profile
