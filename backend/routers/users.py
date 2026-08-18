from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from backend.auth import get_current_user
from backend.repositories import users as user_repo

router = APIRouter(prefix="/users", tags=["users"])


class RegisterRequest(BaseModel):
    name: str


class ProfileUpdate(BaseModel):
    name: str | None = None
    degree: str | None = None
    institution: str | None = None
    learner_track: str | None = None
    onboarding_answers: dict[str, str] | None = None
    onboarding_complete: bool | None = None
    interests: list[str] | None = None
    target_role: str | None = None
    skills: list[str] | None = None
    projects: list[str] | None = None
    certifications: list[str] | None = None
    roadmap: dict | None = None
    planner_events: list[dict] | None = None
    assessment: dict | None = None


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
    existing = await user_repo.get_user_by_uid(user["uid"])
    if not existing:
        await user_repo.create_user(
            user["uid"],
            user["email"],
            updates.get("name") or user.get("name") or "Student",
        )
        existing = await user_repo.get_user_by_uid(user["uid"]) or {}
    if "assessment" in updates and existing.get("assessment"):
        merged = {**existing.get("assessment", {}), **updates["assessment"]}
        updates["assessment"] = merged
    if not updates:
        profile = await user_repo.get_user_by_uid(user["uid"])
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        return profile
    updated = await user_repo.update_user(user["uid"], updates)
    if not updated:
        raise HTTPException(status_code=404, detail="Profile not found")
    return updated


@router.delete("/me")
async def delete_me(user: Annotated[dict, Depends(get_current_user)]):
    deleted = await user_repo.delete_user(user["uid"])
    if not deleted:
        raise HTTPException(status_code=404, detail="Profile not found")
    return {"deleted": True}
