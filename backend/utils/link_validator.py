"""Validate internship application URLs — filter dead or unreachable links."""

from __future__ import annotations

import asyncio

import httpx

_USER_AGENT = "AI-Career-Copilot/2.0 (link-validator; +https://github.com/srivarshiniur2025-dev/gemma-hackathon-to-ai-career-copilot)"
_OK_STATUSES = frozenset(range(200, 400))


async def validate_link(url: str, *, client: httpx.AsyncClient | None = None) -> bool:
    """Return True if the URL responds with a successful HTTP status."""
    if not url or not url.startswith(("http://", "https://")):
        return False

    owns_client = client is None
    if owns_client:
        client = httpx.AsyncClient(
            timeout=httpx.Timeout(10.0, connect=5.0),
            follow_redirects=True,
            headers={"User-Agent": _USER_AGENT},
        )

    try:
        assert client is not None
        try:
            response = await client.head(url)
            if response.status_code == 405:
                response = await client.get(url)
        except httpx.HTTPError:
            try:
                response = await client.get(url)
            except httpx.HTTPError:
                return False

        return response.status_code in _OK_STATUSES
    finally:
        if owns_client and client is not None:
            await client.aclose()


async def filter_valid_postings(postings: list[dict]) -> list[dict]:
    """Concurrently validate source_url on postings; drop those with dead links."""
    if not postings:
        return []

    async with httpx.AsyncClient(
        timeout=httpx.Timeout(10.0, connect=5.0),
        follow_redirects=True,
        headers={"User-Agent": _USER_AGENT},
    ) as client:
        checks = await asyncio.gather(
            *[validate_link(p.get("source_url", ""), client=client) for p in postings],
            return_exceptions=True,
        )

    valid: list[dict] = []
    for posting, ok in zip(postings, checks):
        if ok is True:
            valid.append(posting)
    return valid
