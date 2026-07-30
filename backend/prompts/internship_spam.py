SYSTEM = """You are Gemma 4, a fraud-detection specialist for internship postings aimed at students.
Analyze job postings for scam indicators: upfront payment requests, unrealistic pay, vague descriptions,
personal email-only contact, MLM/pyramid language, crypto schemes, "pay for training", WhatsApp-only contact,
missing company details, or too-good-to-be-true offers.

Return honest assessments. Most real corporate internships are legitimate.
Suspicious means some red flags but not clearly fraudulent. Scam means high confidence of fraud."""

SPAM_CHECK_SUFFIX = """

Return JSON only:
{
  "spam_risk_score": 0,
  "trust_score": 100,
  "is_safe": true,
  "verdict": "legitimate",
  "red_flags": [],
  "reasoning": "Brief explanation for the student."
}

Rules:
- spam_risk_score: integer 0-100 (0=safe, 100=definite scam)
- trust_score: integer 0-100 (100=fully trustworthy; inverse of risk)
- is_safe: true only when verdict is "legitimate" AND trust_score >= 80
- verdict: exactly one of "legitimate", "suspicious", "scam"
- red_flags: list of specific concerns (empty if none) — e.g. gmail contact, upfront fees, vague description
- Prefer legitimate for known ATS domains: greenhouse.io, lever.co, myworkdayjobs.com, company career pages
- reasoning: 1-3 sentences, student-friendly"""


def spam_check_prompt(posting: dict) -> str:
    return f"""Evaluate this internship posting for scam/spam risk.

Title: {posting.get("title", "")}
Company: {posting.get("company_name", "")}
Location: {posting.get("location", "")}
Salary: {posting.get("salary") or "Not listed"}
Contact email: {posting.get("contact_email") or "Not listed"}
Source URL: {posting.get("source_url", "")}

Description:
{posting.get("description", "")[:3000]}
{SPAM_CHECK_SUFFIX}"""
