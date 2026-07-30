from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from backend.auth import get_current_user
from backend.services import resume

router = APIRouter(prefix="/resume", tags=["resume"])


class ResumeOptimizeRequest(BaseModel):
    job_description: str
    role_focus: str = ""


@router.post("/generate")
async def generate(user: Annotated[dict, Depends(get_current_user)], role_focus: str = ""):
    try:
        return await resume.generate_resume(user["uid"], role_focus)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/optimize")
async def optimize(payload: ResumeOptimizeRequest, user: Annotated[dict, Depends(get_current_user)]):
    try:
        if payload.role_focus:
            await resume.generate_resume(user["uid"], payload.role_focus)
        return await resume.optimize_resume(user["uid"], payload.job_description)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
