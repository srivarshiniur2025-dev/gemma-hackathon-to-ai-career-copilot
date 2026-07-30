from backend.repositories import users as user_repo
from backend.services.gemma import interview_assistant


async def start_interview(uid: str) -> dict:
    profile = await user_repo.get_user_by_uid(uid)
    if not profile:
        raise ValueError("Profile not found")

    result = interview_assistant(profile=profile, mode="start")
    interview = {"history": [{"role": "assistant", "content": result.get("question", "")}], "score": None}
    await user_repo.patch_user_field(uid, "interview", interview)
    return result


async def answer_interview(uid: str, answer: str) -> dict:
    profile = await user_repo.get_user_by_uid(uid)
    if not profile:
        raise ValueError("Profile not found")

    interview = profile.get("interview", {"history": []})
    history = interview.get("history", [])
    history.append({"role": "user", "content": answer})

    question_count = sum(1 for h in history if h["role"] == "assistant")

    if question_count >= 5:
        return await finalize_interview(uid, history)

    result = interview_assistant(
        profile=profile,
        mode="answer",
        history=history,
        question_count=question_count,
    )

    if result.get("done"):
        interview["history"] = history
        interview["score"] = result.get("overall_score")
        interview["summary"] = result.get("summary", "")
        await user_repo.patch_user_field(uid, "interview", interview)
        return result

    history.append({"role": "assistant", "content": result.get("question", "")})
    interview["history"] = history
    await user_repo.patch_user_field(uid, "interview", interview)
    return result


async def finalize_interview(uid: str, history: list) -> dict:
    profile = await user_repo.get_user_by_uid(uid)
    result = interview_assistant(profile=profile or {}, mode="finalize", history=history)
    interview = profile.get("interview", {})
    interview.update({"history": history, "score": result.get("overall_score"), "summary": result.get("summary", "")})
    await user_repo.patch_user_field(uid, "interview", interview)
    return result
