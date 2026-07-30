from backend.repositories import users as user_repo
from backend.services.gemma import generate_resume as gemma_generate_resume
from backend.services.gemma import optimize_resume as gemma_optimize_resume


async def generate_resume(uid: str, role_focus: str = "") -> dict:
    profile = await user_repo.get_user_by_uid(uid)
    if not profile:
        raise ValueError("Profile not found")

    focus = role_focus or profile.get("target_role", "Software Developer")
    assessment = profile.get("assessment", {})
    resume = gemma_generate_resume(profile, focus, assessment)
    await user_repo.patch_user_field(uid, "resume", resume)
    return resume


async def optimize_resume(uid: str, job_description: str) -> dict:
    profile = await user_repo.get_user_by_uid(uid)
    if not profile:
        raise ValueError("Profile not found")

    resume = profile.get("resume") or await generate_resume(uid)
    result = gemma_optimize_resume(resume, job_description)
    resume["tailoring"] = result
    await user_repo.patch_user_field(uid, "resume", resume)
    return result
