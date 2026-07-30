from backend.repositories import users as user_repo
from backend.services.gemma import generate_roadmap as gemma_generate_roadmap


async def generate_roadmap(uid: str) -> dict:
    profile = await user_repo.get_user_by_uid(uid)
    if not profile:
        raise ValueError("Profile not found")

    assessment = profile.get("assessment", {})
    roadmap = gemma_generate_roadmap(profile, assessment)
    await user_repo.patch_user_field(uid, "roadmap", roadmap)
    profile = await user_repo.get_user_by_uid(uid)
    await user_repo.update_user(uid, {
        "progress_log": profile.get("progress_log", []) + [{"event": "roadmap_generated"}]
    })
    return roadmap
