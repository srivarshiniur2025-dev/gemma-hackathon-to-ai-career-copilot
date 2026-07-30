"""Internship web search pipeline — fetch, validate links, scam-check."""

from __future__ import annotations

import asyncio

from backend.agents.scam_checker import check_scam
from backend.services.job_fetcher import fetch_internships
from backend.utils.link_validator import filter_valid_postings


def _sort_results(results: list[dict]) -> list[dict]:
    order = {"legitimate": 0, "suspicious": 1, "scam": 2}

    def sort_key(item: dict) -> tuple[int, int]:
        verdict = item.get("verdict", "suspicious")
        score = item.get("spam_risk_score", 50)
        return (order.get(verdict, 1), score)

    return sorted(results, key=sort_key)


async def search_internships(
    query: str,
    location: str | None = None,
    skills: list[str] | None = None,
) -> dict:
    postings, source = await fetch_internships(query, location, skills)

    if not postings:
        return {
            "results": [],
            "source": None,
            "message": (
                "No internship postings found. Try different keywords or location. "
                "Add SERPAPI_KEY (Google Jobs — widest web coverage) or Adzuna keys in .env."
            ),
            "cached": False,
        }

    postings = await filter_valid_postings(postings)
    if not postings:
        return {
            "results": [],
            "source": source,
            "message": "Postings were found but application links could not be verified.",
            "cached": False,
        }

    scam_tasks = [check_scam(p) for p in postings]
    scam_results = await asyncio.gather(*scam_tasks, return_exceptions=True)

    combined: list[dict] = []
    for posting, scam in zip(postings, scam_results):
        if isinstance(scam, Exception):
            scam_dict = {
                "is_safe": False,
                "trust_score": 50,
                "flags": ["Scam check unavailable"],
                "verdict": "suspicious",
                "spam_risk_score": 50,
                "reasoning": "Could not complete automated safety review. Proceed with caution.",
            }
        else:
            scam_dict = scam.model_dump()

        combined.append(
            {
                "posting": posting,
                **scam_dict,
                "red_flags": scam_dict.get("flags") or scam_dict.get("red_flags") or [],
            }
        )

    return {
        "results": _sort_results(combined),
        "source": source,
        "message": None,
        "cached": False,
    }
