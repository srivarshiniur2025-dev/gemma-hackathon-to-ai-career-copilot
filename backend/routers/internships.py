from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from backend.auth import get_current_user
from backend.models.internship import (
    InternshipPosting,
    InternshipRecommendResponse,
    InternshipSearchRequest,
    InternshipSearchResponse,
    ScamCheckResult,
)
from backend.services import internships

router = APIRouter(prefix="/internships", tags=["internships"])


class RecommendRequest(BaseModel):
    skills_estimate: dict[str, int] | None = None
    strengths: list[str] | None = None
    weaknesses: list[str] | None = None
    summary: str | None = None
    force_refresh: bool = False


@router.post("/recommend", response_model=InternshipRecommendResponse)
async def recommend(
    user: Annotated[dict, Depends(get_current_user)],
    payload: RecommendRequest | None = None,
):
    body = payload or RecommendRequest()
    skill_sync = None
    if body.skills_estimate is not None or body.strengths is not None or body.weaknesses is not None or body.summary:
        skill_sync = {
            "skills_estimate": body.skills_estimate,
            "strengths": body.strengths,
            "weaknesses": body.weaknesses,
            "summary": body.summary,
        }
    try:
        return await internships.recommend_internships(user["uid"], skill_sync=skill_sync, force_refresh=body.force_refresh)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/spam-check", response_model=ScamCheckResult)
async def spam_check(
    payload: InternshipPosting,
    user: Annotated[dict, Depends(get_current_user)],
):
    try:
        from backend.agents.scam_checker import check_scam

        result = await check_scam(payload.model_dump())
        return result
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Spam check unavailable") from exc


@router.post("/search", response_model=InternshipSearchResponse)
async def search(
    payload: InternshipSearchRequest,
    user: Annotated[dict, Depends(get_current_user)],
):
    return await internships.search_internships(
        query=payload.query,
        location=payload.location,
        skills=payload.skills,
    )
