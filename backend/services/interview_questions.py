"""Generate tailored interview questions for a specific role or job posting."""

from backend.services.gemma import gemma_service

GENERATE_QUESTIONS_SYSTEM = """You are Gemma 4, an expert technical interviewer.
Generate realistic mock interview questions tailored to the candidate's target role and job description.
Questions should sound natural, like a real interviewer — not textbook phrasing.
Return valid JSON only."""


def generate_questions_for_job(
    *,
    target_role: str,
    focus: str,
    company_context: str,
    job_description: str,
    resume_summary: str = "",
    count: int = 5,
) -> list[str]:
    job_block = job_description.strip() or "General internship — adapt to role."
    user = f"""Create {count} mock interview questions for this scenario.

Target role: {target_role}
Company context: {company_context or "technology company"}
Interview focus: {focus}
Job description:
{job_block[:3000]}

Candidate resume summary:
{resume_summary[:1500] or "Computer science student"}

Return JSON:
{{
  "questions": [
    "question 1 — conversational tone",
    "question 2",
    ...
  ]
}}

Rules:
- Mix introductory, technical, and behavioral based on focus
- If job description mentions specific tech, ask about those skills
- Do NOT repeat the same topic twice
- Questions must be specific to this role and job, not generic"""
    raw = gemma_service.generate_json(GENERATE_QUESTIONS_SYSTEM, user, temperature=0.5)
    questions = raw.get("questions") or []
    return [str(q).strip() for q in questions if str(q).strip()][:count]
