from pathlib import Path
from typing import Annotated

import firebase_admin
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth, credentials
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token

from backend.config import settings

_bearer = HTTPBearer(auto_error=False)
_firebase_initialized = False


def init_firebase() -> None:
    global _firebase_initialized
    if _firebase_initialized or firebase_admin._apps:
        _firebase_initialized = True
        return
    cred_path = settings.firebase_credentials_path
    if cred_path and Path(cred_path).is_file():
        try:
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred, {"projectId": settings.firebase_project_id or None})
            _firebase_initialized = True
        except Exception:
            _firebase_initialized = False


def _demo_user_from_token(token: str) -> dict | None:
    if not token.startswith("demo."):
        return None
    parts = token.split(".")
    if len(parts) < 2:
        return None
    try:
        import base64

        email = base64.b64decode(parts[1] + "==").decode("utf-8")
    except Exception:
        return None
    return {"uid": email, "email": email, "name": email.split("@")[0]}


def _verify_id_token(token: str) -> dict:
    init_firebase()
    if _firebase_initialized:
        decoded = auth.verify_id_token(token)
        return {
            "uid": decoded["uid"],
            "email": decoded.get("email", ""),
            "name": decoded.get("name", ""),
        }

    if not settings.firebase_project_id:
        raise RuntimeError("Firebase is not configured")

    decoded = google_id_token.verify_firebase_token(
        token,
        google_requests.Request(),
        audience=settings.firebase_project_id,
    )
    return {
        "uid": decoded["user_id"] if "user_id" in decoded else decoded["sub"],
        "email": decoded.get("email", ""),
        "name": decoded.get("name", ""),
    }


async def get_current_user(
    creds: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)],
) -> dict:
    if creds is None or not creds.credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing auth token")

    token = creds.credentials
    demo = _demo_user_from_token(token)
    if demo and not settings.firebase_project_id:
        return demo

    try:
        return _verify_id_token(token)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid auth token") from exc
