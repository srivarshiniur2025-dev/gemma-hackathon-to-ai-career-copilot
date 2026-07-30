import json
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from backend.auth import get_current_user
from backend.repositories import users as user_repo
from backend.services.gemma import (
    GemmaAuthError,
    GemmaNetworkError,
    GemmaRateLimitError,
    chat_with_career_copilot,
    stream_chat_with_career_copilot,
)

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    history: list[dict[str, str]] = Field(default_factory=list)


def _gemma_http_error(exc: Exception) -> HTTPException:
    if isinstance(exc, GemmaRateLimitError):
        return HTTPException(status_code=429, detail=str(exc))
    if isinstance(exc, GemmaAuthError):
        return HTTPException(status_code=401, detail=str(exc))
    if isinstance(exc, GemmaNetworkError):
        return HTTPException(status_code=503, detail=str(exc))
    return HTTPException(status_code=500, detail=str(exc))


@router.post("")
async def chat(payload: ChatRequest, user: Annotated[dict, Depends(get_current_user)]):
    profile = await user_repo.get_user_by_uid(user["uid"])
    try:
        reply = chat_with_career_copilot(
            message=payload.message,
            profile=profile,
            history=payload.history,
        )
        return {"reply": reply}
    except (GemmaRateLimitError, GemmaAuthError, GemmaNetworkError) as exc:
        raise _gemma_http_error(exc) from exc


@router.post("/stream")
async def chat_stream(payload: ChatRequest, user: Annotated[dict, Depends(get_current_user)]):
    profile = await user_repo.get_user_by_uid(user["uid"])

    async def event_generator():
        try:
            async for chunk in stream_chat_with_career_copilot(
                message=payload.message,
                profile=profile,
                history=payload.history,
            ):
                yield f"data: {json.dumps({'chunk': chunk})}\n\n"
            yield "data: [DONE]\n\n"
        except (GemmaRateLimitError, GemmaAuthError, GemmaNetworkError) as exc:
            yield f"data: {json.dumps({'error': str(exc)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
