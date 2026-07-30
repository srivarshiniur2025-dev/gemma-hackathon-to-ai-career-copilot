import json
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect
from pydantic import BaseModel, Field

from backend.auth import get_current_user, init_firebase
from backend.repositories import interview_sessions as session_repo
from backend.services import interview_simulation as sim
from backend.services.gemma import GemmaAuthError, GemmaNetworkError, GemmaRateLimitError

router = APIRouter(prefix="/interview", tags=["interview-simulation"])

_active_connections: dict[str, WebSocket] = {}


class CreateSessionRequest(BaseModel):
    target_role: str = Field(..., examples=["SDE Intern"])
    focus: str = Field(..., pattern="^(fundamentals|system_design|behavioral|full_pipeline)$")
    company_context: str = Field(default="", examples=["a fast-growing fintech startup"])
    resume_summary: str = Field(default="")
    target_skills: list[str] = Field(default_factory=list)


def _gemma_http_error(exc: Exception) -> HTTPException:
    if isinstance(exc, GemmaRateLimitError):
        return HTTPException(status_code=429, detail=str(exc))
    if isinstance(exc, GemmaAuthError):
        return HTTPException(status_code=401, detail=str(exc))
    if isinstance(exc, GemmaNetworkError):
        return HTTPException(status_code=503, detail=str(exc))
    return HTTPException(status_code=500, detail=str(exc))


async def _verify_ws_token(token: str) -> dict:
    from firebase_admin import auth

    init_firebase()
    try:
        decoded = auth.verify_id_token(token)
        return {"uid": decoded["uid"], "email": decoded.get("email", "")}
    except Exception as exc:
        raise ValueError("Invalid token") from exc


@router.post("/sessions")
async def create_session(
    payload: CreateSessionRequest,
    user: Annotated[dict, Depends(get_current_user)],
):
    resume_summary = payload.resume_summary
    target_skills = payload.target_skills
    company_context = payload.company_context

    if not resume_summary or not target_skills or not company_context:
        profile_resume, profile_skills, profile_company = await sim.profile_context_for_uid(user["uid"])
        if not resume_summary:
            resume_summary = profile_resume
        if not target_skills:
            target_skills = profile_skills
        if not company_context:
            company_context = profile_company

    session = await session_repo.create_session(
        uid=user["uid"],
        target_role=payload.target_role,
        focus=payload.focus,
        company_context=company_context,
        resume_summary=resume_summary,
        target_skills=target_skills,
    )
    return session


@router.get("/sessions/{session_id}")
async def get_session(
    session_id: str,
    user: Annotated[dict, Depends(get_current_user)],
):
    session = await session_repo.get_session(session_id, user["uid"])
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.post("/sessions/{session_id}/evaluate")
async def evaluate_session_endpoint(
    session_id: str,
    user: Annotated[dict, Depends(get_current_user)],
):
    try:
        evaluation = await sim.evaluate_session(session_id, user["uid"])
        return evaluation
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except (GemmaRateLimitError, GemmaAuthError, GemmaNetworkError) as exc:
        raise _gemma_http_error(exc) from exc


async def interview_websocket_handler(
    websocket: WebSocket,
    session_id: str,
    token: str = Query(...),
):
    await websocket.accept()

    try:
        user = await _verify_ws_token(token)
    except ValueError:
        await websocket.send_json({"type": "error", "content": "Authentication failed"})
        await websocket.close(code=4001)
        return

    session = await session_repo.get_session(session_id, user["uid"])
    if not session:
        await websocket.send_json({"type": "error", "content": "Session not found"})
        await websocket.close(code=4004)
        return

    _active_connections[session_id] = websocket

    if session.get("transcript"):
        memory = sim.get_memory(session_id)
        for msg in session["transcript"]:
            memory.append({"role": msg["role"], "content": msg["content"]})

    try:
        if not session.get("transcript"):
            async for event in sim.stream_question_events(session, 1):
                await websocket.send_json(event)
                if event.get("type") == "complete":
                    return

        while True:
            raw = await websocket.receive_text()
            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                await websocket.send_json({"type": "error", "content": "Invalid JSON message"})
                continue

            msg_type = data.get("type")

            if msg_type == "ping":
                await websocket.send_json({"type": "pong"})
                continue

            if msg_type == "answer":
                answer = (data.get("content") or "").strip()
                if not answer:
                    await websocket.send_json({"type": "error", "content": "Empty answer"})
                    continue

                async for result in sim.process_answer_streaming(session_id, answer):
                    await websocket.send_json(result)
                    if result.get("type") == "complete":
                        return
                continue

            await websocket.send_json({"type": "error", "content": f"Unknown message type: {msg_type}"})

    except WebSocketDisconnect:
        pass
    except (GemmaRateLimitError, GemmaAuthError, GemmaNetworkError) as exc:
        try:
            await websocket.send_json({"type": "error", "content": str(exc)})
        except Exception:
            pass
    except Exception as exc:
        try:
            await websocket.send_json({"type": "error", "content": str(exc)})
        except Exception:
            pass
    finally:
        _active_connections.pop(session_id, None)
        try:
            await websocket.close()
        except Exception:
            pass


interview_websocket = interview_websocket_handler
