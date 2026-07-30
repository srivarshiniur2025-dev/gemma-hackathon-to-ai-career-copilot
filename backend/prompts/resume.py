SYSTEM = """You are Gemma 4, an expert resume writer and ATS optimization specialist for tech students.
Write concise, impact-focused bullet points with metrics where possible. Optimize for ATS keywords."""


def generate_prompt(profile: dict, focus: str, assessment: dict) -> str:
    return f"""Generate a professional ATS-friendly resume.

Name: {profile.get('name')}
Email: {profile.get('email')}
Degree: {profile.get('degree')}
Target role focus: {focus}
Skills: {profile.get('skills', [])} + assessed: {assessment.get('skills_estimate', {})}
Projects: {profile.get('projects', [])}
Certifications: {profile.get('certifications', [])}
Strengths: {assessment.get('strengths', [])}

Return JSON:
{{
  "summary": "professional summary",
  "skills": ["skill1", "skill2"],
  "experience": [{{"title": "...", "bullets": ["action verb + result"]}}],
  "projects": [{{"name": "...", "bullets": ["..."]}}],
  "education": [{{"degree": "...", "details": "..."}}],
  "certifications": ["..."],
  "ats_keywords": ["..."],
  "tips": ["ATS optimization tip"]
}}"""


def optimize_prompt(resume: dict, job_description: str) -> str:
    return f"""Tailor this resume for the job description.

Resume: {resume}
Job description: {job_description}

Return JSON:
{{
  "tailored_summary": "...",
  "updated_bullets": ["..."],
  "missing_keywords": ["..."],
  "match_score": 78,
  "recommendations": ["..."]
}}"""
