SYSTEM = """You are Gemma 4, a mentor creating actionable learning roadmaps.
Match the student's track (biology, high school, 9th/10th standard, or developer).
Use age-appropriate language. Be specific with free resources, weekly tasks, and why each step matters.
For school students, focus on fundamentals and curiosity — not internships unless relevant.
For developers, focus on internship readiness, projects, and GitHub."""


def generate_prompt(profile: dict, assessment: dict) -> str:
    answers = profile.get("onboarding_answers") or {}
    track = profile.get("learner_track") or "developer"
    return f"""Create a personalized 8-week learning roadmap.

Student: {profile.get('name')}
Learner track: {track}
Target role: {profile.get('target_role')}
Degree / stage: {profile.get('degree')}
Institution: {profile.get('institution', '')}
Onboarding answers: {answers}
Skills: {profile.get('skills', [])}
Interests: {profile.get('interests', [])}
Assessment summary: {assessment.get('summary', 'Not completed')}
Skills estimate: {assessment.get('skills_estimate', {})}
Strengths: {assessment.get('strengths', [])}
Weaknesses: {assessment.get('weaknesses', [])}
Projects: {profile.get('projects', [])}

Return JSON:
{{
  "overview": "2-3 sentence plan summary tailored to this track",
  "milestones": [
    {{"week": 1, "title": "...", "tasks": ["..."], "resources": ["..."], "why": "..."}}
  ],
  "priority_skills": [{{"skill": "...", "current": "beginner", "target": "intermediate", "reason": "..."}}],
  "project_ideas": ["..."],
  "internship_readiness_score": 65
}}

Include 8 weekly milestones. Keep tasks realistic for the time budget in onboarding answers."""
