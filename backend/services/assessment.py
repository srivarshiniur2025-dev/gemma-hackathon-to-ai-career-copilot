from backend.prompts.assessment import MAX_QUESTIONS
from backend.repositories import users as user_repo
from backend.services.gemma import assess_skills


async def start_assessment(uid: str) -> dict:
    profile = await user_repo.get_user_by_uid(uid)
    if not profile:
        raise ValueError("Profile not found")

    result = assess_skills(profile=profile, mode="start")
    assessment = profile["assessment"]
    assessment["history"] = [{"role": "assistant", "content": result.get("question", "")}]
    assessment["questions_asked"] = 1
    await user_repo.patch_user_field(uid, "assessment", assessment)
    return result


async def answer_assessment(uid: str, answer: str) -> dict:
    profile = await user_repo.get_user_by_uid(uid)
    if not profile:
        raise ValueError("Profile not found")

    assessment = profile["assessment"]
    history = assessment.get("history", [])
    history.append({"role": "user", "content": answer})

    if assessment.get("questions_asked", 0) >= MAX_QUESTIONS:
        return await finalize_assessment(uid, history)

    result = assess_skills(
        profile=profile,
        mode="answer",
        history=history,
        questions_asked=assessment.get("questions_asked", 0),
    )

    if result.get("done"):
        assessment["skills_estimate"] = result.get("skills_estimate", {})
        assessment["summary"] = result.get("summary", "")
        assessment["strengths"] = result.get("strengths", [])
        assessment["weaknesses"] = result.get("weaknesses", [])
        assessment["history"] = history
        await user_repo.patch_user_field(uid, "assessment", assessment)
        await user_repo.update_user(uid, {
            "progress_log": profile.get("progress_log", [])
            + [{"event": "assessment_completed", "skills": result.get("skills_estimate", {})}]
        })
        return result

    history.append({"role": "assistant", "content": result.get("question", "")})
    assessment["history"] = history
    assessment["questions_asked"] = assessment.get("questions_asked", 0) + 1
    await user_repo.patch_user_field(uid, "assessment", assessment)
    return result


async def finalize_assessment(uid: str, history: list) -> dict:
    profile = await user_repo.get_user_by_uid(uid)
    result = assess_skills(mode="finalize", profile=profile or {}, history=history)
    assessment = profile["assessment"]
    assessment.update({
        "skills_estimate": result.get("skills_estimate", {}),
        "summary": result.get("summary", ""),
        "strengths": result.get("strengths", []),
        "weaknesses": result.get("weaknesses", []),
        "history": history,
    })
    await user_repo.patch_user_field(uid, "assessment", assessment)
    return result
