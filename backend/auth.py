from typing import Annotated

import firebase_admin
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth, credentials

from backend.config import settings

_bearer = HTTPBearer(auto_error=False)
_firebase_initialized = False


def init_firebase() -> None:
    global _firebase_initialized
    if _firebase_initialized:
        return
    if settings.firebase_credentials_path:
        cred = credentials.Certificate(settings.firebase_credentials_path)
        firebase_admin.initialize_app(cred, {"projectId": settings.firebase_project_id or None})
    elif settings.firebase_project_id:
        firebase_admin.initialize_app(options={"projectId": settings.firebase_project_id})
    else:
        return
    _firebase_initialized = True


async def get_current_user(
    creds: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)],
) -> dict:
    if creds is None or not creds.credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing auth token")

    init_firebase()
    if not _firebase_initialized:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Firebase Admin not configured on server",
        )

    try:
        decoded = auth.verify_id_token(creds.credentials)
        return {
            "uid": decoded["uid"],
            "email": decoded.get("email", ""),
            "name": decoded.get("name", ""),
        }
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid auth token") from exc
