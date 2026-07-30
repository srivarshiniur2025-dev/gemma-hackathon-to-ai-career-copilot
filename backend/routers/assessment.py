import json
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from backend.auth import get_current_user
from backend.prompts import assessment as assessment_prompts
from backend.repositories import users as user_repo
from backend.services import assessment
from backend.services.gemma import (
    GemmaAuthError,
    GemmaNetworkError,
    GemmaRateLimitError,
    gemma_service,
    parse_json,
)

router = APIRouter(prefix="/assessment", tags=["assessment"])


class AnswerRequest(BaseModel):
    answer: str


def _gemma_http_error(exc: Exception) -> HTTPException:
    if isinstance(exc, GemmaRateLimitError):
        return HTTPException(status_code=429, detail=str(exc))
    if isinstance(exc, GemmaAuthError):
        return HTTPException(status_code=401, detail=str(exc))
    if isinstance(exc, GemmaNetworkError):
        return HTTPException(status_code=503, detail=str(exc))
    return HTTPException(status_code=500, detail=str(exc))


@router.post("/start")
async def start(user: Annotated[dict, Depends(get_current_user)]):
    try:
        return await assessment.start_assessment(user["uid"])
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except (GemmaRateLimitError, GemmaAuthError, GemmaNetworkError) as exc:
        raise _gemma_http_error(exc) from exc


@router.post("/answer")
async def answer(payload: AnswerRequest, user: Annotated[dict, Depends(get_current_user)]):
    try:
        return await assessment.answer_assessment(user["uid"], payload.answer)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except (GemmaRateLimitError, GemmaAuthError, GemmaNetworkError) as exc:
        raise _gemma_http_error(exc) from exc


@router.post("/start/stream")
async def start_stream(user: Annotated[dict, Depends(get_current_user)]):
    profile = await user_repo.get_user_by_uid(user["uid"])
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    uid = user["uid"]
    user_prompt = assessment_prompts.start_prompt(profile)
    system = assessment_prompts.SYSTEM + "\n\nRespond with valid JSON only. No markdown fences, no commentary."

    async def event_generator():
        buffer = ""
        try:
            async for chunk in gemma_service.stream_text_async(system, user_prompt):
                buffer += chunk
                yield f"data: {json.dumps({'chunk': chunk})}\n\n"
            result = parse_json(buffer)
            assessment_data = profile["assessment"]
            assessment_data["history"] = [{"role": "assistant", "content": result.get("question", "")}]
            assessment_data["questions_asked"] = 1
            await user_repo.patch_user_field(uid, "assessment", assessment_data)
            yield f"data: {json.dumps({'result': result})}\n\n"
            yield "data: [DONE]\n\n"
        except (GemmaRateLimitError, GemmaAuthError, GemmaNetworkError) as exc:
            yield f"data: {json.dumps({'error': str(exc)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
