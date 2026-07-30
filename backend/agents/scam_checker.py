"""Gemma-powered scam detection with structured trust output."""

from __future__ import annotations

from backend.models.internship import ScamCheckResult
from backend.services.internship_spam_check import check_internship_spam_async


def _to_scam_check_result(raw: dict) -> ScamCheckResult:
    spam_risk_score = raw.get("spam_risk_score", 50)
    try:
        spam_risk_score = max(0, min(100, int(spam_risk_score)))
    except (TypeError, ValueError):
        spam_risk_score = 50

    trust_score = raw.get("trust_score")
    if trust_score is None:
        trust_score = 100 - spam_risk_score
    else:
        try:
            trust_score = max(0, min(100, int(trust_score)))
        except (TypeError, ValueError):
            trust_score = 100 - spam_risk_score

    verdict = raw.get("verdict", "suspicious")
    flags = raw.get("flags") or raw.get("red_flags") or []
    if not isinstance(flags, list):
        flags = [str(flags)]
    flags = [str(f).strip() for f in flags if str(f).strip()]

    is_safe = raw.get("is_safe")
    if is_safe is None:
        is_safe = verdict == "legitimate" and trust_score >= 80
    else:
        is_safe = bool(is_safe)

    return ScamCheckResult(
        is_safe=is_safe,
        trust_score=trust_score,
        flags=flags,
        red_flags=flags,
        verdict=verdict,
        spam_risk_score=spam_risk_score,
        reasoning=str(raw.get("reasoning") or "").strip(),
    )


async def check_scam(posting: dict) -> ScamCheckResult:
    """Run scam analysis on a single posting and return structured trust output."""
    raw = await check_internship_spam_async(posting)
    result = _to_scam_check_result(raw)
    if not result.is_safe or result.trust_score < 80:
        result.is_safe = False
    return result


def passes_safety_gate(result: ScamCheckResult) -> bool:
    """Keep only postings that are safe with trust_score >= 80."""
    return result.is_safe and result.trust_score >= 80
