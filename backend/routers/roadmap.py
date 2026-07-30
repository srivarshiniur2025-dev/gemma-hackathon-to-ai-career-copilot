from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from backend.auth import get_current_user
from backend.services import roadmap

router = APIRouter(prefix="/roadmap", tags=["roadmap"])


@router.post("/generate")
async def generate(user: Annotated[dict, Depends(get_current_user)]):
    try:
        return await roadmap.generate_roadmap(user["uid"])
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
