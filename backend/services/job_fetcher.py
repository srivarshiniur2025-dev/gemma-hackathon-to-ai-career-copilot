"""Live internship retrieval — Gemma web search + multiple job boards."""

from __future__ import annotations

import asyncio
import re
from typing import Any
from urllib.parse import urlparse

import httpx

from backend.config import settings
from backend.services.gemma import search_internships_on_web
from backend.services.internship_spam_check import extract_contact_email

_STRIP_HTML = re.compile(r"<[^>]+>")

# Human-readable labels for UI (comma-separated keys from fetch_internships)
SOURCE_LABELS: dict[str, str] = {
    "gemma": "Gemma + Google Search",
    "serpapi": "Google Jobs",
    "adzuna": "Adzuna",
    "remotive": "Remotive",
    "arbeitnow": "Arbeitnow",
    "jobicy": "Jobicy",
    "remoteok": "RemoteOK",
    "mock": "Demo listings",
}


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


def _search_keywords(query: str, skills: list[str] | None) -> list[str]:
    terms = build_search_terms(query, skills).lower()
    return [w for w in re.split(r"\W+", terms) if len(w) > 2]


def _matches_keywords(haystack: str, keywords: list[str]) -> bool:
    if not keywords:
        return True
    text = haystack.lower()
    return any(k in text for k in keywords)


def _normalize_url(url: str) -> str:
    url = (url or "").strip().rstrip("/")
    if not url:
        return ""
    try:
        parsed = urlparse(url)
        host = (parsed.netloc or "").lower()
        path = parsed.path.rstrip("/")
        return f"{host}{path}"
    except ValueError:
        return url.lower()


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


def _dedupe_postings(postings: list[dict]) -> list[dict]:
    seen: set[str] = set()
    unique: list[dict] = []
    for posting in postings:
        key = _normalize_url(posting.get("source_url") or "")
        if not key or key in seen:
            continue
        seen.add(key)
        unique.append(posting)
    return unique


async def _fetch_gemma_web(query: str, location: str | None, skills: list[str] | None) -> list[dict]:
    """Gemma 4 with Google Search grounding — searches the open internet."""
    if not settings.resolved_google_api_key:
        return []

    try:
        postings = await asyncio.to_thread(
            search_internships_on_web,
            query,
            location,
            skills,
        )
    except Exception:
        return []

    normalized: list[dict] = []
    for item in postings:
        posting = _normalize_posting(
            title=item.get("title") or "Internship",
            company_name=item.get("company_name") or "Unknown company",
            description=item.get("description") or "",
            location=item.get("location") or "Unspecified",
            salary=str(item.get("salary")) if item.get("salary") else None,
            source_url=item.get("source_url") or "",
        )
        if posting:
            normalized.append(posting)
    return normalized


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
    """Google Jobs — aggregates listings from LinkedIn, Indeed, Glassdoor, company sites, etc."""
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
    keywords = _search_keywords(query, skills)

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
        if not (is_intern or _matches_keywords(haystack, keywords)):
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


async def _fetch_arbeitnow(query: str, skills: list[str] | None) -> list[dict]:
    """Free European + remote jobs API — no key required."""
    keywords = _search_keywords(query, skills)

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.get("https://www.arbeitnow.com/api/job-board-api")
            response.raise_for_status()
            payload = response.json()
    except (httpx.HTTPError, ValueError):
        return []

    jobs = payload.get("data") if isinstance(payload, dict) else payload
    if not isinstance(jobs, list):
        return []

    postings: list[dict] = []
    for job in jobs:
        title = job.get("title") or ""
        company = job.get("company_name") or ""
        description = job.get("description") or ""
        tags = " ".join(job.get("tags") or [])
        haystack = f"{title} {company} {description} {tags}".lower()

        is_intern = "intern" in haystack or "graduate" in haystack or "trainee" in haystack
        if not (is_intern or _matches_keywords(haystack, keywords)):
            continue

        loc = job.get("location") or "Remote / Unspecified"
        if job.get("remote"):
            loc = f"Remote — {loc}" if loc != "Remote / Unspecified" else "Remote"

        posting = _normalize_posting(
            title=title or "Role",
            company_name=company or "Unknown company",
            description=description,
            location=loc,
            salary=None,
            source_url=job.get("url") or "",
        )
        if posting:
            postings.append(posting)
        if len(postings) >= 15:
            break

    return postings


async def _fetch_jobicy(query: str, skills: list[str] | None) -> list[dict]:
    """Free remote jobs feed — no key required."""
    keywords = _search_keywords(query, skills)
    tag = keywords[0] if keywords else "intern"

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.get(
                "https://jobicy.com/api/v2/remote-jobs",
                params={"count": 50, "tag": tag},
            )
            response.raise_for_status()
            payload = response.json()
    except (httpx.HTTPError, ValueError):
        return []

    jobs = payload.get("jobs") if isinstance(payload, dict) else []
    if not isinstance(jobs, list):
        return []

    postings: list[dict] = []
    for job in jobs:
        title = job.get("jobTitle") or ""
        company = job.get("companyName") or ""
        description = job.get("jobExcerpt") or job.get("jobDescription") or ""
        haystack = f"{title} {company} {description}".lower()

        is_intern = "intern" in haystack or "graduate" in haystack or "junior" in haystack
        if not (is_intern or _matches_keywords(haystack, keywords)):
            continue

        salary_min = job.get("annualSalaryMin")
        salary_max = job.get("annualSalaryMax")
        currency = job.get("salaryCurrency") or "USD"
        salary = None
        if salary_min and salary_max:
            salary = f"{currency} {salary_min:,} – {salary_max:,}/yr"
        elif salary_min:
            salary = f"{currency} {salary_min:,}+/yr"

        posting = _normalize_posting(
            title=title or "Remote role",
            company_name=company or "Unknown company",
            description=description,
            location=job.get("jobGeo") or "Remote",
            salary=salary,
            source_url=job.get("url") or "",
        )
        if posting:
            postings.append(posting)
        if len(postings) >= 15:
            break

    return postings


async def _fetch_remoteok(query: str, skills: list[str] | None) -> list[dict]:
    """RemoteOK public JSON feed — no key required."""
    keywords = _search_keywords(query, skills)

    try:
        async with httpx.AsyncClient(
            timeout=20.0,
            headers={"User-Agent": "AI-Career-Copilot/1.0"},
        ) as client:
            response = await client.get("https://remoteok.com/api")
            response.raise_for_status()
            data = response.json()
    except (httpx.HTTPError, ValueError):
        return []

    if not isinstance(data, list):
        return []

    postings: list[dict] = []
    for job in data:
        if not isinstance(job, dict) or not job.get("position"):
            continue

        title = job.get("position") or ""
        company = job.get("company") or ""
        description = job.get("description") or ""
        tags = " ".join(job.get("tags") or [])
        haystack = f"{title} {company} {description} {tags}".lower()

        is_intern = "intern" in haystack or "graduate" in haystack or "junior" in haystack
        if not (is_intern or _matches_keywords(haystack, keywords)):
            continue

        posting = _normalize_posting(
            title=title,
            company_name=company or "Unknown company",
            description=description,
            location=job.get("location") or "Remote",
            salary=job.get("salary") or None,
            source_url=job.get("url") or job.get("apply_url") or "",
        )
        if posting:
            postings.append(posting)
        if len(postings) >= 15:
            break

    return postings


def format_source_label(source: str | None) -> str | None:
    """Turn comma-separated source keys into readable labels."""
    if not source:
        return None
    parts = [SOURCE_LABELS.get(s.strip(), s.strip()) for s in source.split(",") if s.strip()]
    return ", ".join(parts) if parts else None


async def fetch_internships(
    query: str,
    location: str | None = None,
    skills: list[str] | None = None,
) -> tuple[list[dict], str | None]:
    """
    Fetch internship postings from multiple sources in parallel.
    Merges and deduplicates results across the web (not a single board).
    """
    fetchers: list[tuple[str, Any]] = [
        ("gemma", _fetch_gemma_web(query, location, skills)),
        ("serpapi", _fetch_serpapi(query, location, skills)),
        ("adzuna", _fetch_adzuna(query, location, skills)),
        ("remotive", _fetch_remotive(query, skills)),
        ("arbeitnow", _fetch_arbeitnow(query, skills)),
        ("jobicy", _fetch_jobicy(query, skills)),
        ("remoteok", _fetch_remoteok(query, skills)),
    ]

    results = await asyncio.gather(*[coro for _, coro in fetchers], return_exceptions=True)

    combined: list[dict] = []
    sources_used: list[str] = []

    for (source_name, _), result in zip(fetchers, results):
        if isinstance(result, Exception) or not result:
            continue
        combined.extend(result)
        sources_used.append(source_name)

    combined = _dedupe_postings(combined)

    if combined:
        return combined, ",".join(sources_used)

    return [], None
