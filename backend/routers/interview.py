from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from backend.auth import get_current_user
from backend.services import interview

router = APIRouter(prefix="/interview", tags=["interview"])


class AnswerRequest(BaseModel):
    answer: str


@router.post("/start")
async def start(user: Annotated[dict, Depends(get_current_user)]):
    try:
        return await interview.start_interview(user["uid"])
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/answer")
async def answer(payload: AnswerRequest, user: Annotated[dict, Depends(get_current_user)]):
    try:
        return await interview.answer_interview(user["uid"], payload.answer)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
