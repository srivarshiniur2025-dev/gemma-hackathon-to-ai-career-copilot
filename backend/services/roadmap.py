import logging

from backend.repositories import users as user_repo
from backend.services.gemma import generate_roadmap as gemma_generate_roadmap


def _fallback_roadmap(profile: dict) -> dict:
    track = (profile.get("learner_track") or "developer").replace("_", " ")
    name = profile.get("name") or "Student"
    return {
        "overview": (
            f"{name}'s 8-week {track} plan. Practice a little every week, "
            "ship one small artifact, and review what still feels unclear."
        ),
        "milestones": [
            {
                "week": week,
                "title": title,
                "tasks": [f"Complete the core {track} practice for this week", "Write 5 lines on what clicked"],
                "resources": ["Khan Academy", "Official syllabus / docs"],
                "why": "Steady weekly work compounds faster than cramming.",
            }
            for week, title in enumerate(
                [
                    "Foundations",
                    "Core skills",
                    "Practice block",
                    "Mini project",
                    "Feedback loop",
                    "Stretch topic",
                    "Review week",
                    "Next-step plan",
                ],
                start=1,
            )
        ],
        "priority_skills": [
            {
                "skill": track.title(),
                "current": "beginner",
                "target": "intermediate",
                "reason": "Chosen from onboarding so the plan stays relevant.",
            }
        ],
        "project_ideas": [f"A small {track} artifact you can show a teacher or interviewer"],
        "internship_readiness_score": 40,
    }


async def generate_roadmap(uid: str) -> dict:
    profile = await user_repo.get_user_by_uid(uid)
    if not profile:
        raise ValueError("Profile not found")

    assessment = profile.get("assessment", {})
    try:
        roadmap = gemma_generate_roadmap(profile, assessment)
    except Exception as exc:
        logging.warning("Gemma roadmap generation failed, using fallback: %s", exc)
        roadmap = _fallback_roadmap(profile)

    await user_repo.patch_user_field(uid, "roadmap", roadmap)
    profile = await user_repo.get_user_by_uid(uid)
    await user_repo.update_user(uid, {
        "progress_log": (profile or {}).get("progress_log", []) + [{"event": "roadmap_generated"}]
    })
    return roadmap
