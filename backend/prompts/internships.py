SYSTEM = """You are Gemma 4, an internship matching advisor for students.
Recommend realistic internship opportunities and explain fit clearly.
Include missing skills and how to become eligible."""

MATCH_SYSTEM = """You are Gemma 4, an internship matching advisor for students.
You receive a list of REAL, verified internship postings that were fetched from the web.
You MUST ONLY reference jobs from the provided list — never invent companies, roles, or URLs.
Explain why each posting fits the student, skill gaps, and how to become eligible."""

SAMPLE_INTERNSHIPS = [
    {"company": "TechNova Labs", "role": "Junior Python Developer Intern", "location": "Remote"},
    {"company": "DataBridge Analytics", "role": "ML Engineering Intern", "location": "Hybrid"},
    {"company": "WebCraft Studio", "role": "Frontend Developer Intern", "location": "On-site"},
    {"company": "CloudScale Systems", "role": "Backend Engineering Intern", "location": "Remote"},
    {"company": "AI Forge", "role": "AI Research Intern", "location": "Hybrid"},
]


def recommend_prompt(profile: dict, assessment: dict) -> str:
    roadmap = profile.get("roadmap") or {}
    return f"""Match student to internships.

Student: {profile.get('name')}
Target role: {profile.get('target_role')}
Skills estimate: {assessment.get('skills_estimate', {})}
Strengths: {assessment.get('strengths', [])}
Weaknesses: {assessment.get('weaknesses', [])}
Roadmap priorities: {roadmap.get('priority_skills', [])}

Sample pool (you may adapt): {SAMPLE_INTERNSHIPS}

Return JSON:
{{
  "recommendations": [
    {{
      "company": "...",
      "role": "...",
      "location": "...",
      "match_score": 85,
      "why_recommended": "...",
      "missing_skills": ["..."],
      "improvement_plan": ["..."]
    }}
  ],
  "overall_advice": "..."
}}"""


def match_verified_prompt(profile: dict, assessment: dict, postings: list[dict]) -> str:
    roadmap = profile.get("roadmap") or {}
    jobs_block = []
    for i, p in enumerate(postings):
        jobs_block.append(
            f"""[{i}] title={p.get('title')}
company={p.get('company_name')}
location={p.get('location')}
salary={p.get('salary') or 'Not listed'}
source_url={p.get('source_url')}
description={str(p.get('description', ''))[:1200]}"""
        )

    return f"""Match this student to ONLY the verified internships below.

Student: {profile.get('name')}
Target role: {profile.get('target_role')}
Skills: {profile.get('skills', [])}
Skills estimate: {assessment.get('skills_estimate', {})}
Strengths: {assessment.get('strengths', [])}
Weaknesses: {assessment.get('weaknesses', [])}
Roadmap priorities: {roadmap.get('priority_skills', [])}

Verified postings (use index to reference — do NOT add new jobs):
{chr(10).join(jobs_block)}

Return JSON:
{{
  "matches": [
    {{
      "index": 0,
      "match_score": 85,
      "why_recommended": "...",
      "missing_skills": ["..."],
      "improvement_plan": ["..."]
    }}
  ],
  "overall_advice": "..."
}}

Rules:
- Include ONLY indices from the list above
- match_score: 0-100
- Skip jobs with very poor fit (omit from matches rather than inventing)"""
