from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from backend.auth import get_current_user
from backend.prompts import planner as planner_prompts
from backend.repositories import users as user_repo
from backend.services.gemma import gemma_service

router = APIRouter(prefix="/planner", tags=["planner"])


class PlannerChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    history: list[dict[str, str]] = Field(default_factory=list)


class PlannerEventIn(BaseModel):
    id: str | None = None
    title: str
    startTime: str
    endTime: str
    startHour: int
    durationHours: float = 1
    color: str | None = None
    dotColor: str | None = None
    bgColor: str | None = None
    why: str | None = None


class ConfirmPlannerRequest(BaseModel):
    events: list[PlannerEventIn]
    replace: bool = False


def _fallback_plan(profile: dict, message: str) -> dict:
    track = profile.get("learner_track") or "developer"
    answers = profile.get("onboarding_answers") or {}
    hour = 18
    if "morning" in message.lower() or answers.get("free_time") == "morning":
        hour = 8
    title = "Focused study block"
    if track == "bio":
        title = f"{answers.get('hardest') or 'Biology'} repair"
    elif track == "high_school":
        title = f"{answers.get('weak_subject') or 'Core subject'} practice"
    elif track == "grade_9_10":
        title = f"{answers.get('hard_subject') or 'Homework'} review"
    elif "dsa" in message.lower():
        title = "DSA practice"
    return {
        "needs_more": False,
        "question": "",
        "summary": "A starter week that uses your free window and the difficulty you mentioned. Confirm to add it to Planner.",
        "events": [
            {
                "title": title,
                "startTime": f"{hour % 12 or 12}:00 {'PM' if hour >= 12 else 'AM'}",
                "endTime": f"{(hour + 1) % 12 or 12}:00 {'PM' if hour + 1 >= 12 else 'AM'}",
                "startHour": hour,
                "durationHours": 1,
                "why": "Protect one realistic block before adding more.",
            },
            {
                "title": "Weekly recap",
                "startTime": "11:00 AM",
                "endTime": "12:00 PM",
                "startHour": 11,
                "durationHours": 1,
                "why": "A weekend recap keeps the plan honest.",
            },
        ],
    }


@router.post("/recommend")
async def recommend_planner(payload: PlannerChatRequest, user: Annotated[dict, Depends(get_current_user)]):
    profile = await user_repo.get_user_by_uid(user["uid"]) or {}
    prompt = planner_prompts.recommend_prompt(profile, payload.message, payload.history)
    try:
        plan = gemma_service.generate_json(planner_prompts.SYSTEM, prompt, temperature=0.5)
        if not isinstance(plan, dict):
            raise ValueError("invalid plan")
        plan.setdefault("events", [])
        plan.setdefault("needs_more", False)
        plan.setdefault("summary", "")
        return plan
    except HTTPException:
        raise
    except Exception:
        return _fallback_plan(profile, payload.message)


@router.post("/confirm")
async def confirm_planner(payload: ConfirmPlannerRequest, user: Annotated[dict, Depends(get_current_user)]):
    profile = await user_repo.get_user_by_uid(user["uid"])
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    incoming = [e.model_dump() for e in payload.events]
    current = profile.get("planner_events") or []
    merged = incoming if payload.replace else current + incoming
    updated = await user_repo.update_user(user["uid"], {"planner_events": merged})
    return {"planner_events": (updated or {}).get("planner_events", merged)}
