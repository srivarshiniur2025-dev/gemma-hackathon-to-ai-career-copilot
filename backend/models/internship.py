"""Pydantic schemas for internship search, scam check, and recommendations."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

SpamVerdict = Literal["legitimate", "suspicious", "scam"]


class InternshipPosting(BaseModel):
    title: str
    company_name: str
    description: str
    location: str = ""
    salary: str | None = None
    source_url: str = ""
    contact_email: str | None = None


class InternshipSearchRequest(BaseModel):
    query: str = Field(..., min_length=1)
    location: str | None = None
    skills: list[str] | None = None


class ScamCheckResult(BaseModel):
    is_safe: bool
    trust_score: int = Field(ge=0, le=100)
    flags: list[str] = Field(default_factory=list)
    red_flags: list[str] = Field(default_factory=list)
    verdict: SpamVerdict
    spam_risk_score: int = Field(ge=0, le=100)
    reasoning: str = ""


class InternshipSearchHit(BaseModel):
    posting: InternshipPosting
    is_safe: bool
    trust_score: int = Field(ge=0, le=100)
    flags: list[str] = Field(default_factory=list)
    verdict: SpamVerdict
    spam_risk_score: int = Field(ge=0, le=100)
    reasoning: str = ""


class InternshipSearchResponse(BaseModel):
    results: list[InternshipSearchHit]
    source: str | None = None
    message: str | None = None
    cached: bool = False


class VerifiedInternshipRecommendation(BaseModel):
    posting: InternshipPosting
    is_safe: bool = True
    trust_score: int = Field(ge=0, le=100)
    flags: list[str] = Field(default_factory=list)
    verdict: SpamVerdict = "legitimate"
    match_score: int = Field(ge=0, le=100)
    why_recommended: str
    missing_skills: list[str] = Field(default_factory=list)
    improvement_plan: list[str] = Field(default_factory=list)


class InternshipRecommendResponse(BaseModel):
    recommendations: list[VerifiedInternshipRecommendation]
    overall_advice: str = ""
    source: str | None = None
    cached: bool = False
    message: str | None = None
