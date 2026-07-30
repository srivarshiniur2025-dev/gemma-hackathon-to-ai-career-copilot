"""Live internship retrieval — Adzuna, SerpAPI, or Remotive fallback."""

from __future__ import annotations

import re
from typing import Any

import httpx

from backend.config import settings
from backend.services.internship_spam_check import extract_contact_email

_STRIP_HTML = re.compile(r"<[^>]+>")


def _strip_html(text: str) -> str:
    return _STRIP_HTML.sub(" ", text or "").strip()


def build_search_terms(query: str, skills: list[str] | None) -> str:
    terms = query.strip()
    if skills:
        extra = " ".join(s.strip() for s in skills if s.strip())
        if extra and extra.lower() not in terms.lower():
            terms = f"{terms} {extra}"
    if "intern" not in terms.lower():
        terms = f"{terms} internship"
    return terms


def _normalize_posting(
    *,
    title: str,
    company_name: str,
    description: str,
    location: str,
    salary: str | None,
    source_url: str,
) -> dict | None:
    if not source_url:
        return None
    description = _strip_html(description)[:4000]
    return {
        "title": title or "Internship",
        "company_name": company_name or "Unknown company",
        "description": description,
        "location": location or "Remote / Unspecified",
        "salary": salary,
        "source_url": source_url,
        "contact_email": extract_contact_email(description),
    }


async def _fetch_adzuna(query: str, location: str | None, skills: list[str] | None) -> list[dict]:
    if not settings.adzuna_app_id or not settings.adzuna_app_key:
        return []

    search_terms = build_search_terms(query, skills)
    country = settings.adzuna_country or "us"
    url = f"https://api.adzuna.com/v1/api/jobs/{country}/search/1"
    params: dict[str, Any] = {
        "app_id": settings.adzuna_app_id,
        "app_key": settings.adzuna_app_key,
        "what": search_terms,
        "results_per_page": 20,
        "content-type": "application/json",
    }
    if location:
        params["where"] = location.strip()

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
    except (httpx.HTTPError, ValueError):
        return []

    postings: list[dict] = []
    for item in data.get("results") or []:
        description = item.get("description") or ""
        company = item.get("company") or {}
        salary_min = item.get("salary_min")
        salary_max = item.get("salary_max")
        salary = None
        if salary_min or salary_max:
            currency = item.get("salary_currency") or "USD"
            if salary_min and salary_max:
                salary = f"{currency} {salary_min:,.0f} – {salary_max:,.0f}"
            elif salary_min:
                salary = f"{currency} {salary_min:,.0f}+"
            else:
                salary = f"Up to {currency} {salary_max:,.0f}"

        location_display = item.get("location", {}).get("display_name") or location or "Remote / Unspecified"
        source_url = item.get("redirect_url") or item.get("url") or ""

        posting = _normalize_posting(
            title=item.get("title") or "Internship",
            company_name=company.get("display_name") or "Unknown company",
            description=description,
            location=location_display,
            salary=salary,
            source_url=source_url,
        )
        if posting:
            postings.append(posting)

    return postings


async def _fetch_serpapi(query: str, location: str | None, skills: list[str] | None) -> list[dict]:
    if not settings.serpapi_key:
        return []

    search_terms = build_search_terms(query, skills)
    params: dict[str, Any] = {
        "engine": "google_jobs",
        "q": search_terms,
        "api_key": settings.serpapi_key,
    }
    if location:
        params["location"] = location.strip()

    try:
        async with httpx.AsyncClient(timeout=25.0) as client:
            response = await client.get("https://serpapi.com/search.json", params=params)
            response.raise_for_status()
            data = response.json()
    except (httpx.HTTPError, ValueError):
        return []

    postings: list[dict] = []
    for item in data.get("jobs_results") or []:
        description = item.get("description") or ""
        detected = item.get("detected_extensions") or {}
        salary = detected.get("salary") or item.get("salary")
        if isinstance(salary, dict):
            salary = salary.get("text")

        apply_options = item.get("apply_options") or []
        source_url = item.get("share_link") or ""
        if apply_options and isinstance(apply_options[0], dict):
            source_url = apply_options[0].get("link") or source_url

        posting = _normalize_posting(
            title=item.get("title") or "Internship",
            company_name=item.get("company_name") or "Unknown company",
            description=description,
            location=item.get("location") or location or "Unspecified",
            salary=str(salary) if salary else None,
            source_url=source_url,
        )
        if posting:
            postings.append(posting)

    return postings


async def _fetch_remotive(query: str, skills: list[str] | None) -> list[dict]:
    """Public Remotive API — no key required."""
    search_terms = build_search_terms(query, skills).lower()
    keywords = [w for w in re.split(r"\W+", search_terms) if len(w) > 2]

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.get("https://remotive.com/api/remote-jobs")
            response.raise_for_status()
            data = response.json()
    except (httpx.HTTPError, ValueError):
        return []

    postings: list[dict] = []
    for job in data.get("jobs") or []:
        title = (job.get("title") or "").lower()
        category = (job.get("category") or "").lower()
        tags = " ".join(job.get("tags") or []).lower()
        haystack = f"{title} {category} {tags} {job.get('job_type', '')}".lower()

        is_intern = "intern" in haystack or "graduate" in haystack or "junior" in haystack
        matches_query = not keywords or any(k in haystack for k in keywords)
        if not (is_intern or matches_query):
            continue

        description = job.get("description") or ""
        posting = _normalize_posting(
            title=job.get("title") or "Remote role",
            company_name=job.get("company_name") or "Unknown company",
            description=description,
            location=job.get("candidate_required_location") or "Remote",
            salary=job.get("salary") or None,
            source_url=job.get("url") or "",
        )
        if posting:
            postings.append(posting)
        if len(postings) >= 15:
            break

    return postings


def _mock_postings(query: str, skills: list[str] | None) -> list[dict]:
    """Structured sample data when no external API keys are configured."""
    skill_hint = ", ".join(skills[:3]) if skills else "general tech"
    base_query = query.strip() or "software intern"
    return [
        _normalize_posting(
            title=f"{base_query.title()} — Engineering Intern",
            company_name="TechNova Labs",
            description=(
                f"Join our engineering team for a paid internship focused on {skill_hint}. "
                "Apply via our Greenhouse portal. No fees required."
            ),
            location="Remote",
            salary="Competitive stipend",
            source_url="https://boards.greenhouse.io/example/jobs/12345",
        ),
        _normalize_posting(
            title=f"Junior {base_query.title()} Intern",
            company_name="DataBridge Analytics",
            description=(
                f"Hybrid internship working with {skill_hint}. "
                "Corporate email only; applications through Lever."
            ),
            location="Hybrid — San Francisco",
            salary="$25–30/hr",
            source_url="https://jobs.lever.co/example/intern-2025",
        ),
        _normalize_posting(
            title="Remote Intern — Product Engineering",
            company_name="CloudScale Systems",
            description=(
                "Workday-hosted application. Mentorship, real projects, no upfront payment."
            ),
            location="Remote",
            salary=None,
            source_url="https://company.wd5.myworkdayjobs.com/internships",
        ),
    ]


async def fetch_internships(
    query: str,
    location: str | None = None,
    skills: list[str] | None = None,
) -> tuple[list[dict], str | None]:
    """
    Fetch live internship postings.
    Priority: Adzuna → SerpAPI → Remotive → mock structure.
    """
    postings = await _fetch_adzuna(query, location, skills)
    if postings:
        return postings, "adzuna"

    postings = await _fetch_serpapi(query, location, skills)
    if postings:
        return postings, "serpapi"

    postings = await _fetch_remotive(query, skills)
    if postings:
        return postings, "remotive"

    mock = [p for p in _mock_postings(query, skills) if p]
    if mock:
        return mock, "mock"

    return [], None
