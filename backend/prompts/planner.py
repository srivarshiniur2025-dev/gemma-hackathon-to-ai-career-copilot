SYSTEM = """You are Gemma 4, a study-planner coach.
The student will describe free time and difficulties. Ask one short follow-up if you still cannot schedule.
When you have enough detail, propose a realistic weekly plan that fits their hours and track.
Never overload a school-age student. Prefer 45–90 minute blocks.
Respond with valid JSON only."""


def recommend_prompt(profile: dict, message: str, history: list[dict[str, str]]) -> str:
    transcript = "\n".join(f"{m.get('role', 'user')}: {m.get('content', '')}" for m in history)
    return f"""Student profile:
Name: {profile.get('name')}
Track: {profile.get('learner_track')}
Target: {profile.get('target_role')}
Onboarding answers: {profile.get('onboarding_answers', {})}
Roadmap overview: {(profile.get('roadmap') or {}).get('overview', '')}
Weak topics: {profile.get('assessment', {}).get('weaknesses', [])}

Conversation so far:
{transcript}

Latest message: {message}

If you still need a critical detail (when they are free, how many hours, or the main difficulty), set needs_more true and ask ONE question.

Otherwise set needs_more false and fill 3 to 6 weekly study blocks.
startHour is 24h integer (8–21). startTime/endTime are human labels like "6:00 PM".

Return JSON:
{{
  "needs_more": false,
  "question": "",
  "summary": "2 sentences explaining why this plan fits their free time and difficulties",
  "events": [
    {{
      "title": "short block title",
      "startTime": "6:00 PM",
      "endTime": "7:00 PM",
      "startHour": 18,
      "durationHours": 1,
      "why": "one line"
    }}
  ]
}}"""
