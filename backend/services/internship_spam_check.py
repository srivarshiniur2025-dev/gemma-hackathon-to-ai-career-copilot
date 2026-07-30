"""Shared internship spam/scam detection — used by /spam-check and /search."""

from __future__ import annotations

import re
from typing import Literal

from backend.prompts import internship_spam as spam_prompts
from backend.services.gemma import gemma_service

Verdict = Literal["legitimate", "suspicious", "scam"]

_EMAIL_RE = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")


def extract_contact_email(text: str) -> str | None:
    if not text:
        return None
    match = _EMAIL_RE.search(text)
    return match.group(0) if match else None


def _normalize_verdict(raw: str, score: int) -> Verdict:
    value = (raw or "").strip().lower()
    if value in ("legitimate", "suspicious", "scam"):
        return value  # type: ignore[return-value]
    if score >= 70:
        return "scam"
    if score >= 40:
        return "suspicious"
    return "legitimate"


def _normalize_result(raw: dict) -> dict:
    score = raw.get("spam_risk_score", 0)
    try:
        score = max(0, min(100, int(score)))
    except (TypeError, ValueError):
        score = 50

    verdict = _normalize_verdict(str(raw.get("verdict", "")), score)
    red_flags = raw.get("red_flags") or []
    if not isinstance(red_flags, list):
        red_flags = [str(red_flags)]
    red_flags = [str(f).strip() for f in red_flags if str(f).strip()]

    reasoning = str(raw.get("reasoning") or "No detailed reasoning provided.").strip()

    trust_score = raw.get("trust_score")
    if trust_score is None:
        trust_score = 100 - score
    else:
        try:
            trust_score = max(0, min(100, int(trust_score)))
        except (TypeError, ValueError):
            trust_score = 100 - score

    is_safe = raw.get("is_safe")
    if is_safe is None:
        is_safe = verdict == "legitimate" and trust_score >= 80
    else:
        is_safe = bool(is_safe)

    return {
        "spam_risk_score": score,
        "trust_score": trust_score,
        "is_safe": is_safe,
        "verdict": verdict,
        "red_flags": red_flags,
        "flags": red_flags,
        "reasoning": reasoning,
    }


def check_internship_spam(posting: dict) -> dict:
    """Run Gemma 4 spam analysis on a single posting dict."""
    enriched = dict(posting)
    if not enriched.get("contact_email"):
        enriched["contact_email"] = extract_contact_email(
            f"{enriched.get('description', '')} {enriched.get('source_url', '')}"
        )

    raw = gemma_service.generate_json(
        spam_prompts.SYSTEM,
        spam_prompts.spam_check_prompt(enriched),
        temperature=0.2,
    )
    return _normalize_result(raw)


async def check_internship_spam_async(posting: dict) -> dict:
    """Async wrapper — spam check is CPU/API bound; run in thread pool if needed."""
    import asyncio

    return await asyncio.to_thread(check_internship_spam, posting)
