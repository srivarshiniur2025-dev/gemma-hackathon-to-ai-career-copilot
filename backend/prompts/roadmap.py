SYSTEM = """You are Gemma 4, a career mentor creating actionable learning roadmaps for students seeking internships.
Be specific with resources (free courses, project ideas, timelines). Explain WHY each skill matters."""


def generate_prompt(profile: dict, assessment: dict) -> str:
    return f"""Create a personalized internship-readiness roadmap.

Student: {profile.get('name')}
Target role: {profile.get('target_role')}
Degree: {profile.get('degree')}
Assessment summary: {assessment.get('summary', 'Not completed')}
Skills estimate: {assessment.get('skills_estimate', {})}
Strengths: {assessment.get('strengths', [])}
Weaknesses: {assessment.get('weaknesses', [])}
Projects: {profile.get('projects', [])}

Return JSON:
{{
  "overview": "2-3 sentence plan summary",
  "milestones": [
    {{"week": 1, "title": "...", "tasks": ["..."], "resources": ["..."], "why": "..."}}
  ],
  "priority_skills": [{{"skill": "...", "current": "beginner", "target": "intermediate", "reason": "..."}}],
  "project_ideas": ["..."],
  "internship_readiness_score": 65
}}"""
