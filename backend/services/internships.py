from __future__ import annotations

import asyncio

from backend.agents.scam_checker import check_scam, passes_safety_gate
from backend.repositories import internship_searches as search_cache_repo
from backend.repositories import users as user_repo
from backend.services.gemma import explain_verified_internship_matches
from backend.services.internship_search import search_internships as run_internship_search
from backend.services.internship_spam_check import check_internship_spam_async
from backend.services.job_fetcher import fetch_internships
from backend.utils.link_validator import filter_valid_postings

DOMAIN_LABELS = {
    "python": "Python",
    "javascript": "JavaScript",
    "dsa": "Data structures & algorithms",
    "sql": "SQL",
    "react": "React",
    "system-design": "System design",
    "git": "Git",
    "ml": "Machine learning",
    "Overall": "Overall",
}


def _normalize_scores(raw: dict) -> dict[str, int]:
    scored: dict[str, int] = {}
    for key, value in (raw or {}).items():
        if isinstance(value, bool):
            continue
        try:
            scored[str(key)] = max(0, min(100, int(value)))
        except (TypeError, ValueError):
            continue
    return scored


def _skill_builder_profile(profile: dict) -> dict:
    assessment = profile.get("assessment") or {}
    scored = _normalize_scores(assessment.get("skills_estimate") or {})
    strengths = list(assessment.get("strengths") or [])
    weaknesses = list(assessment.get("weaknesses") or [])
    summary = str(assessment.get("summary") or "").strip()
    labeled = {
        DOMAIN_LABELS.get(k, k.replace("-", " ").title()): v for k, v in sorted(scored.items(), key=lambda x: x[1], reverse=True)
    }
    return {
        "skills_estimate": scored,
        "labeled_scores": labeled,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "summary": summary,
    }


def _profile_search_query(profile: dict) -> str:
    skill_data = _skill_builder_profile(profile)
    scored = skill_data["skills_estimate"]
    if scored:
        top = sorted(scored.items(), key=lambda x: x[1], reverse=True)[:3]
        top_names = [DOMAIN_LABELS.get(k, k.replace("-", " ")) for k, v in top if v >= 45]
        if top_names:
            return f"{' '.join(top_names)} intern"

    target = (profile.get("target_role") or "").strip()
    if target:
        return target
    skills = profile.get("skills") or []
    if skills:
        return f"{skills[0]} intern"
    return "software engineering intern"


def _profile_skills(profile: dict) -> list[str]:
    skill_data = _skill_builder_profile(profile)
    scored = skill_data["skills_estimate"]
    skills: list[str] = []

    for name, score in sorted(scored.items(), key=lambda x: x[1], reverse=True):
        label = DOMAIN_LABELS.get(name, name.replace("-", " ").title())
        if score >= 40 and label not in skills:
            skills.append(label)

    for skill in profile.get("skills") or []:
        if skill and skill not in skills:
            skills.append(skill)

    roadmap = profile.get("roadmap") or {}
    for item in roadmap.get("priority_skills") or []:
        if isinstance(item, dict):
            skill = item.get("skill")
            if skill and skill not in skills:
                skills.append(skill)

    return skills[:12]


def _merge_skill_sync(profile: dict, skill_sync: dict | None) -> dict:
    if not skill_sync:
        return profile

    assessment = dict(profile.get("assessment") or {})
    if skill_sync.get("skills_estimate") is not None:
        assessment["skills_estimate"] = _normalize_scores(skill_sync["skills_estimate"])
    if skill_sync.get("strengths") is not None:
        assessment["strengths"] = skill_sync["strengths"]
    if skill_sync.get("weaknesses") is not None:
        assessment["weaknesses"] = skill_sync["weaknesses"]
    if skill_sync.get("summary") is not None:
        assessment["summary"] = skill_sync["summary"]

    return {**profile, "assessment": assessment}


async def recommend_internships(uid: str, skill_sync: dict | None = None, force_refresh: bool = False) -> dict:
    profile = await user_repo.get_user_by_uid(uid)
    if not profile:
        raise ValueError("Profile not found")

    profile = _merge_skill_sync(profile, skill_sync)
    if skill_sync:
        await user_repo.patch_user_field(uid, "assessment", profile.get("assessment") or {})
        await search_cache_repo.clear_cached_recommend(uid)

    if not force_refresh:
        cached = await search_cache_repo.get_cached_recommend(uid)
        if cached is not None:
            skill_data = _skill_builder_profile(profile)
            return {
                **cached,
                "cached": True,
                "skill_profile_used": skill_data,
            }

    assessment = profile.get("assessment") or {}
    skill_data = _skill_builder_profile(profile)
    query = _profile_search_query(profile)
    skills = _profile_skills(profile)

    postings, source = await fetch_internships(query, location=None, skills=skills)
    if not postings:
        return {
            "recommendations": [],
            "overall_advice": (
                "No live internships found for your skill profile. Complete more skill builder tests "
                "or broaden your target role. Add SERPAPI_KEY for Google Jobs or Adzuna keys in .env."
            ),
            "source": None,
            "cached": False,
            "message": "No postings found.",
            "skill_profile_used": skill_data,
        }

    postings = await filter_valid_postings(postings)
    if not postings:
        return {
            "recommendations": [],
            "overall_advice": "Found postings but application links could not be verified.",
            "source": source,
            "cached": False,
            "message": "Link validation failed for all postings.",
            "skill_profile_used": skill_data,
        }

    scam_results = await asyncio.gather(*[check_scam(p) for p in postings])
    safe_pairs = [(p, s) for p, s in zip(postings, scam_results) if passes_safety_gate(s)]

    if not safe_pairs:
        return {
            "recommendations": [],
            "overall_advice": (
                "We found internships but none passed our safety threshold (trust score ≥ 80). "
                "Try the Find Internships tab to review individual safety reports."
            ),
            "source": source,
            "cached": False,
            "message": "No safe postings after scam screening.",
            "skill_profile_used": skill_data,
        }

    safe_postings = [p for p, _ in safe_pairs]
    safe_checks = {p["source_url"]: s for p, s in safe_pairs}

    match_raw = await asyncio.to_thread(
        explain_verified_internship_matches,
        profile,
        assessment,
        safe_postings,
    )

    recommendations: list[dict] = []
    for match in match_raw.get("matches") or []:
        try:
            index = int(match.get("index", -1))
        except (TypeError, ValueError):
            continue
        if index < 0 or index >= len(safe_postings):
            continue

        posting = safe_postings[index]
        scam = safe_checks.get(posting["source_url"])
        if not scam:
            continue

        recommendations.append(
            {
                "posting": posting,
                "is_safe": True,
                "trust_score": scam.trust_score,
                "flags": scam.flags,
                "verdict": scam.verdict,
                "match_score": max(0, min(100, int(match.get("match_score", 70)))),
                "why_recommended": str(match.get("why_recommended") or "").strip(),
                "missing_skills": match.get("missing_skills") or [],
                "improvement_plan": match.get("improvement_plan") or [],
            }
        )

    recommendations.sort(key=lambda r: r.get("match_score", 0), reverse=True)

    result = {
        "recommendations": recommendations,
        "overall_advice": str(match_raw.get("overall_advice") or "").strip(),
        "source": source,
        "cached": False,
        "message": None,
        "skill_profile_used": skill_data,
    }

    if recommendations:
        await search_cache_repo.set_cached_recommend(uid, result)
        await user_repo.patch_user_field(uid, "internships", recommendations)

    return result


async def check_spam(posting: dict) -> dict:
    return await check_internship_spam_async(posting)


async def search_internships(
    query: str,
    location: str | None = None,
    skills: list[str] | None = None,
) -> dict:
    try:
        cached = await search_cache_repo.get_cached_search(query, location, skills)
        if cached is not None:
            return {**cached, "cached": True}

        result = await run_internship_search(query, location, skills)
        if result.get("results"):
            await search_cache_repo.set_cached_search(query, location, skills, result)
        return result
    except Exception:
        return {
            "results": [],
            "source": None,
            "message": "Search is temporarily unavailable. Please try again in a few minutes.",
            "cached": False,
        }
