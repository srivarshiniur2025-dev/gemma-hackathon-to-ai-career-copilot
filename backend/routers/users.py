from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from backend.auth import get_current_user
from backend.repositories import users as user_repo

router = APIRouter(prefix="/users", tags=["users"])


class RegisterRequest(BaseModel):
    name: str


class ProfileUpdate(BaseModel):
    name: str | None = None
    degree: str | None = None
    interests: list[str] | None = None
    target_role: str | None = None
    skills: list[str] | None = None
    projects: list[str] | None = None
    certifications: list[str] | None = None


@router.post("/register")
async def register(payload: RegisterRequest, user: Annotated[dict, Depends(get_current_user)]):
    profile = await user_repo.create_user(user["uid"], user["email"], payload.name)
    return profile


@router.get("/me")
async def get_me(user: Annotated[dict, Depends(get_current_user)]):
    profile = await user_repo.get_user_by_uid(user["uid"])
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found. Call POST /users/register first.")
    return profile


@router.put("/me")
async def update_me(payload: ProfileUpdate, user: Annotated[dict, Depends(get_current_user)]):
    updates = payload.model_dump(exclude_none=True)
    if not updates:
        profile = await user_repo.get_user_by_uid(user["uid"])
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        return profile
    updated = await user_repo.update_user(user["uid"], updates)
    if not updated:
        raise HTTPException(status_code=404, detail="Profile not found")
    return updated
