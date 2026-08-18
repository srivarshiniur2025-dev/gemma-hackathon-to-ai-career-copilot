MAX_QUESTIONS = 6

SYSTEM = """You are Gemma 4, an expert technical career assessor for students.
Ask ONE adaptive technical question at a time based on prior answers.
Estimate skill proficiency (beginner/intermediate/advanced) across domains like Python, DSA, Web Dev, AI/ML.
Be encouraging but honest. Keep questions practical and interview-like.
When scoring an answer, return structured JSON with numeric score 0-100, not vague praise."""


def start_prompt(profile: dict) -> str:
    return f"""Student profile:
Name: {profile.get('name')}
Degree: {profile.get('degree')}
Target role: {profile.get('target_role')}
Interests: {', '.join(profile.get('interests', []))}
Self-reported skills: {', '.join(profile.get('skills', []))}
Projects: {profile.get('projects')}
Certifications: {profile.get('certifications')}

Start the adaptive skill assessment. Return JSON:
{{
  "welcome": "short welcome message",
  "question": "first technical question",
  "domain": "e.g. Python",
  "question_number": 1
}}"""


def answer_prompt(profile: dict, history: list, questions_asked: int) -> str:
    return f"""Profile: {profile.get('name')} targeting {profile.get('target_role')}.
Conversation so far:
{history}

You must score the student's latest answer before asking the next question.
Ask the next adaptive question OR finalize if enough signal gathered (>= {MAX_QUESTIONS} questions).

Return JSON either:
{{
  "question": "...",
  "domain": "...",
  "question_number": N,
  "feedback": "2-3 sentences on what was strong or weak",
  "score": 0-100,
  "is_correct": true/false,
  "better_answer": "concise model intern answer",
  "industry_standard": "what interviewers expect at this level",
  "suggestions": ["actionable tip 1", "actionable tip 2"]
}}
OR if done:
{{
  "done": true,
  "summary": "...",
  "skills_estimate": {{"Python": 72, "DSA": 58}},
  "strengths": ["..."],
  "weaknesses": ["..."],
  "feedback": "...",
  "score": 0-100,
  "is_correct": true/false,
  "better_answer": "...",
  "industry_standard": "...",
  "suggestions": ["..."]
}}

skills_estimate values must be numbers 0-100, not beginner/intermediate strings."""


def finalize_prompt(history: list) -> str:
    return f"""Finalize skill assessment from this conversation:
{history}

Return JSON:
{{
  "done": true,
  "summary": "...",
  "skills_estimate": {{"Python": 72}},
  "strengths": [],
  "weaknesses": [],
  "feedback": "...",
  "score": 0-100,
  "is_correct": true/false,
  "better_answer": "...",
  "industry_standard": "...",
  "suggestions": ["..."]
}}

skills_estimate values must be numbers 0-100."""
