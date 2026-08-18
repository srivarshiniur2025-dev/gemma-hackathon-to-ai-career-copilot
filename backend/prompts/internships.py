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
    scored = assessment.get("skills_estimate") or {}
    score_lines = []
    for key, value in sorted(scored.items(), key=lambda x: int(x[1]) if str(x[1]).isdigit() else 0, reverse=True):
        try:
            pct = int(value)
        except (TypeError, ValueError):
            continue
        score_lines.append(f"- {key}: {pct}% (from timed skill builder tests)")

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

    return f"""Match this developer student to ONLY the verified internships below.
Use their PROVEN skill builder test scores as the primary signal — not self-reported skills alone.

Student: {profile.get('name')}
Target role: {profile.get('target_role')}
Profile skills (self-reported): {profile.get('skills', [])}

Skill builder test scores (timed MCQ assessments — treat as ground truth):
{chr(10).join(score_lines) if score_lines else "- No skill tests completed yet — weight target role and roadmap instead."}
Strengths from tests: {assessment.get('strengths', [])}
Weaknesses from tests: {assessment.get('weaknesses', [])}
Latest assessment summary: {assessment.get('summary', '')}
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
- match_score: 0-100 — boost roles aligned with top test scores; penalize roles needing skills below 50%
- Reference specific skill test domains in why_recommended (e.g. Python 78%, DSA 62%)
- Skip jobs with very poor fit (omit from matches rather than inventing)"""


GEMMA_WEB_SEARCH_SYSTEM = """You are Gemma 4, an AI Career Copilot internship scout for students.
Use Google Search to find REAL, currently listed internship opportunities on the internet.
Only include postings you can verify from search results — company career pages, LinkedIn, Indeed, Glassdoor, Wellfound, intern boards, etc.
Never invent companies or URLs. Prefer legitimate paid internships over suspicious listings."""


def gemma_web_search_prompt(query: str, location: str | None, skills: list[str] | None) -> str:
    skill_line = ", ".join(skills) if skills else "not specified"
    loc_line = location.strip() if location else "any location (include remote)"
    return f"""Search the internet for internship opportunities.

Search query: {query}
Location preference: {loc_line}
Relevant skills: {skill_line}

Find up to 12 real internship postings. For each, extract title, company, location, brief description, salary if visible, and the direct application or job listing URL.

Return JSON:
{{
  "postings": [
    {{
      "title": "Software Engineering Intern",
      "company_name": "Example Corp",
      "description": "2-3 sentence summary from the listing",
      "location": "Remote / City",
      "salary": null,
      "source_url": "https://..."
    }}
  ]
}}

Rules:
- source_url must be a real URL from your search results (apply link or job page)
- Internships and new-grad / junior roles only — no senior full-time jobs
- Skip listings that ask for upfront payment or seem like scams
- If fewer than 12 exist, return what you find"""
