"""Centralized Gemma 4 service using the Google GenAI SDK."""

from __future__ import annotations

import json
import re
from collections.abc import AsyncIterator, Iterator
from typing import Any, Literal

import httpx
from google import genai
from google.genai import errors as genai_errors
from google.genai import types

from backend.config import settings
from backend.prompts import assessment as assessment_prompts
from backend.prompts import chat as chat_prompts
from backend.prompts import internships as internships_prompts
from backend.prompts import interview as interview_prompts
from backend.prompts import resume as resume_prompts
from backend.prompts import roadmap as roadmap_prompts

JSON_SUFFIX = "\n\nRespond with valid JSON only. No markdown fences, no commentary."


class GemmaError(Exception):
    """Base error for Gemma API failures."""


class GemmaRateLimitError(GemmaError):
    """Raised when the API returns HTTP 429."""


class GemmaAuthError(GemmaError):
    """Raised when the API key is invalid or unauthorized."""


class GemmaNetworkError(GemmaError):
    """Raised on network or connectivity failures."""


class GemmaModelUnavailableError(GemmaError):
    """Raised when no configured Gemma model is available."""


def parse_json(raw: str) -> dict:
    cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw.strip(), flags=re.IGNORECASE)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if match:
            return json.loads(match.group())
        raise


def _is_model_unavailable(exc: Exception) -> bool:
    if isinstance(exc, genai_errors.ClientError) and exc.code in (404, 400):
        message = str(exc).lower()
        return any(token in message for token in ("model", "not found", "invalid", "unsupported"))
    message = str(exc).lower()
    return "model" in message and any(token in message for token in ("not found", "invalid", "unsupported"))


def _map_exception(exc: Exception) -> Exception:
    if isinstance(exc, (GemmaRateLimitError, GemmaAuthError, GemmaNetworkError, GemmaModelUnavailableError)):
        return exc
    if isinstance(exc, genai_errors.ClientError):
        if exc.code == 429:
            return GemmaRateLimitError(str(exc))
        if exc.code in (401, 403):
            return GemmaAuthError(str(exc))
    if isinstance(exc, (genai_errors.ServerError, httpx.HTTPError, ConnectionError, TimeoutError, OSError)):
        return GemmaNetworkError(str(exc))
    return exc


class GemmaService:
    """Lazy-initialized client wrapper with model fallback and streaming helpers."""

    def __init__(self) -> None:
        self._client: genai.Client | None = None
        self._active_model: str | None = None

    @property
    def active_model(self) -> str:
        return self._active_model or settings.gemma_model_chain[0]

    @property
    def model_chain(self) -> list[str]:
        return settings.gemma_model_chain

    def _get_api_key(self) -> str:
        api_key = settings.resolved_google_api_key
        if not api_key:
            raise GemmaAuthError(
                "Missing GOOGLE_API_KEY in environment or .env file. "
                "(GEMINI_API_KEY is also accepted for backward compatibility.)"
            )
        return api_key

    @property
    def client(self) -> genai.Client:
        if self._client is None:
            self._client = genai.Client(api_key=self._get_api_key())
        return self._client

    def _build_config(self, system: str, temperature: float = 0.7) -> types.GenerateContentConfig:
        return types.GenerateContentConfig(
            temperature=temperature,
            system_instruction=system,
        )

    def _with_model_fallback(self, operation: str, runner):
        last_error: Exception | None = None
        for model in settings.gemma_model_chain:
            try:
                result = runner(model)
                self._active_model = model
                return result
            except Exception as exc:
                mapped = _map_exception(exc)
                if _is_model_unavailable(mapped) or _is_model_unavailable(exc):
                    last_error = mapped
                    continue
                raise mapped from exc
        raise GemmaModelUnavailableError(
            f"All Gemma models unavailable for {operation}: {settings.gemma_model_chain}. "
            f"Last error: {last_error}"
        ) from last_error

    def generate_json(
        self,
        system: str,
        user: str,
        *,
        temperature: float = 0.7,
        use_google_search: bool = False,
    ) -> dict:
        raw = self.generate_text(
            system + JSON_SUFFIX,
            user,
            temperature=temperature,
            use_google_search=use_google_search,
        )
        return parse_json(raw)

    def generate_text(
        self,
        system: str,
        user: str,
        *,
        temperature: float = 0.7,
        use_google_search: bool = False,
    ) -> str:
        def _run(model: str) -> str:
            config_kwargs: dict[str, Any] = {
                "temperature": temperature,
                "system_instruction": system,
            }
            if use_google_search:
                config_kwargs["tools"] = [types.Tool(google_search=types.GoogleSearch())]

            response = self.client.models.generate_content(
                model=model,
                contents=user,
                config=types.GenerateContentConfig(**config_kwargs),
            )
            return (response.text or "").strip()

        return self._with_model_fallback("generate_text", _run)

    def stream_text(
        self,
        system: str,
        user: str,
        *,
        temperature: float = 0.7,
    ) -> Iterator[str]:
        model = self._resolve_stream_model()
        try:
            stream = self.client.models.generate_content_stream(
                model=model,
                contents=user,
                config=self._build_config(system, temperature),
            )
            for chunk in stream:
                text = chunk.text
                if text:
                    yield text
        except Exception as exc:
            raise _map_exception(exc) from exc

    async def stream_text_async(
        self,
        system: str,
        user: str,
        *,
        temperature: float = 0.7,
    ) -> AsyncIterator[str]:
        model = self._resolve_stream_model()

        async def _stream(model_name: str) -> AsyncIterator[str]:
            stream = await self.client.aio.models.generate_content_stream(
                model=model_name,
                contents=user,
                config=self._build_config(system, temperature),
            )
            async for chunk in stream:
                text = chunk.text
                if text:
                    yield text

        try:
            async for piece in _stream(model):
                yield piece
            self._active_model = model
        except Exception as exc:
            mapped = _map_exception(exc)
            if not _is_model_unavailable(mapped):
                raise mapped from exc

            for fallback in settings.gemma_model_chain:
                if fallback == model:
                    continue
                try:
                    async for piece in _stream(fallback):
                        yield piece
                    self._active_model = fallback
                    return
                except Exception as fallback_exc:
                    mapped = _map_exception(fallback_exc)
                    if _is_model_unavailable(mapped):
                        continue
                    raise mapped from fallback_exc
            raise GemmaModelUnavailableError(
                f"No Gemma model available for streaming: {settings.gemma_model_chain}"
            ) from exc

    def _resolve_stream_model(self) -> str:
        if self._active_model:
            return self._active_model
        return settings.gemma_model_chain[0]


# Singleton used across the app
gemma_service = GemmaService()


def assess_skills(
    *,
    profile: dict,
    mode: Literal["start", "answer", "finalize"] = "start",
    history: list | None = None,
    questions_asked: int = 0,
) -> dict:
    if mode == "start":
        user = assessment_prompts.start_prompt(profile)
    elif mode == "answer":
        user = assessment_prompts.answer_prompt(profile, history or [], questions_asked)
    else:
        user = assessment_prompts.finalize_prompt(history or [])
    return gemma_service.generate_json(assessment_prompts.SYSTEM, user)


def generate_roadmap(profile: dict, assessment: dict) -> dict:
    user = roadmap_prompts.generate_prompt(profile, assessment)
    return gemma_service.generate_json(roadmap_prompts.SYSTEM, user)


def generate_resume(profile: dict, focus: str, assessment: dict) -> dict:
    user = resume_prompts.generate_prompt(profile, focus, assessment)
    return gemma_service.generate_json(resume_prompts.SYSTEM, user)


def optimize_resume(resume: dict, job_description: str) -> dict:
    user = resume_prompts.optimize_prompt(resume, job_description)
    return gemma_service.generate_json(resume_prompts.SYSTEM, user)


def recommend_internships(profile: dict, assessment: dict) -> dict:
    user = internships_prompts.recommend_prompt(profile, assessment)
    return gemma_service.generate_json(internships_prompts.SYSTEM, user)


def explain_verified_internship_matches(
    profile: dict,
    assessment: dict,
    postings: list[dict],
) -> dict:
    user = internships_prompts.match_verified_prompt(profile, assessment, postings)
    return gemma_service.generate_json(internships_prompts.MATCH_SYSTEM, user, temperature=0.4)


def search_internships_on_web(
    query: str,
    location: str | None = None,
    skills: list[str] | None = None,
) -> list[dict]:
    """Use Gemma 4 + Google Search grounding to find real internships on the internet."""
    from backend.services.internship_spam_check import extract_contact_email

    user = internships_prompts.gemma_web_search_prompt(query, location, skills)
    try:
        raw = gemma_service.generate_json(
            internships_prompts.GEMMA_WEB_SEARCH_SYSTEM,
            user,
            temperature=0.3,
            use_google_search=True,
        )
    except GemmaError:
        return []

    postings: list[dict] = []
    for item in raw.get("postings") or []:
        if not isinstance(item, dict):
            continue
        posting = {
            "title": str(item.get("title") or "Internship").strip(),
            "company_name": str(item.get("company_name") or "Unknown company").strip(),
            "description": str(item.get("description") or "").strip()[:4000],
            "location": str(item.get("location") or "Unspecified").strip(),
            "salary": item.get("salary"),
            "source_url": str(item.get("source_url") or "").strip(),
            "contact_email": extract_contact_email(str(item.get("description") or "")),
        }
        if posting["source_url"].startswith("http"):
            postings.append(posting)
    return postings


def interview_assistant(
    *,
    profile: dict,
    mode: Literal["start", "answer", "finalize"] = "start",
    history: list | None = None,
    question_count: int = 0,
) -> dict:
    if mode == "start":
        user = interview_prompts.start_prompt(profile)
    elif mode == "answer":
        user = interview_prompts.answer_prompt(profile, history or [], question_count)
    else:
        user = interview_prompts.finalize_prompt(history or [])
    return gemma_service.generate_json(interview_prompts.SYSTEM, user)


def generate_interview_question(session: dict, question_number: int, stage: str) -> dict:
    total_questions = session.get("total_questions") or 4
    transcript = session.get("transcript") or []
    conversation_history = _format_conversation_history(transcript)
    user = interview_prompts.simulation_question_prompt(
        role_title=session.get("target_role", "Software Developer"),
        company_context=session.get("company_context") or "a fast-growing technology company",
        conversation_history=conversation_history,
        resume_summary=session.get("resume_summary") or "No resume summary provided.",
        job_description=session.get("job_description") or "",
        target_skills=", ".join(session.get("target_skills") or []),
        question_number=question_number,
        total_questions=total_questions,
        stage=stage.replace("_", " "),
    )
    return gemma_service.generate_json(interview_prompts.QUESTION_GENERATION_SYSTEM, user)


async def stream_interview_question(session: dict, question_number: int, stage: str) -> AsyncIterator[str]:
    total_questions = session.get("total_questions") or 4
    transcript = session.get("transcript") or []
    conversation_history = _format_conversation_history(transcript)
    user = interview_prompts.simulation_question_prompt(
        role_title=session.get("target_role", "Software Developer"),
        company_context=session.get("company_context") or "a fast-growing technology company",
        conversation_history=conversation_history,
        resume_summary=session.get("resume_summary") or "No resume summary provided.",
        job_description=session.get("job_description") or "",
        target_skills=", ".join(session.get("target_skills") or []),
        question_number=question_number,
        total_questions=total_questions,
        stage=stage.replace("_", " "),
    )
    async for chunk in gemma_service.stream_text_async(
        interview_prompts.QUESTION_GENERATION_SYSTEM + JSON_SUFFIX,
        user,
        temperature=0.7,
    ):
        yield chunk


def evaluate_interview_session(session: dict, transcript_text: str) -> dict:
    user = interview_prompts.simulation_eval_prompt(
        target_role=session.get("target_role", ""),
        focus=session.get("focus", ""),
        company_context=session.get("company_context", ""),
        transcript_text=transcript_text,
    )
    return gemma_service.generate_json(interview_prompts.EVALUATION_PROMPT, user)


def chat_with_career_copilot(
    *,
    message: str,
    profile: dict | None = None,
    history: list[dict[str, str]] | None = None,
) -> str:
    context = ""
    if profile:
        context = f"""Student context:
Name: {profile.get('name')}
Track: {profile.get('learner_track')}
Target role: {profile.get('target_role')}
Onboarding answers: {profile.get('onboarding_answers', {})}
Skills: {profile.get('skills', [])}
Assessment: {profile.get('assessment', {}).get('summary', 'Not completed')}

If they mention free time or study difficulties, help them think in weekly blocks and suggest opening Planner to confirm a Gemma plan.
"""
    transcript = ""
    if history:
        lines = [f"{m.get('role', 'user').title()}: {m.get('content', '')}" for m in history]
        transcript = "Conversation so far:\n" + "\n".join(lines) + "\n\n"

    user = f"{context}{transcript}User: {message}\n\nRespond helpfully as the career copilot."
    return gemma_service.generate_text(chat_prompts.SYSTEM, user)


async def stream_chat_with_career_copilot(
    *,
    message: str,
    profile: dict | None = None,
    history: list[dict[str, str]] | None = None,
) -> AsyncIterator[str]:
    context = ""
    if profile:
        context = f"""Student context:
Name: {profile.get('name')}
Track: {profile.get('learner_track')}
Target role: {profile.get('target_role')}
Onboarding answers: {profile.get('onboarding_answers', {})}
Skills: {profile.get('skills', [])}
Assessment: {profile.get('assessment', {}).get('summary', 'Not completed')}

If they mention free time or study difficulties, help them think in weekly blocks and suggest opening Planner to confirm a Gemma plan.
"""
    transcript = ""
    if history:
        lines = [f"{m.get('role', 'user').title()}: {m.get('content', '')}" for m in history]
        transcript = "Conversation so far:\n" + "\n".join(lines) + "\n\n"

    user = f"{context}{transcript}User: {message}\n\nRespond helpfully as the career copilot."
    async for chunk in gemma_service.stream_text_async(chat_prompts.SYSTEM, user):
        yield chunk


def _format_conversation_history(transcript: list[dict]) -> str:
    if not transcript:
        return "No prior conversation."
    lines: list[str] = []
    for msg in transcript:
        speaker = "Interviewer" if msg.get("role") == "assistant" else "Candidate"
        lines.append(f"{speaker}: {msg.get('content', '')}")
    return "\n".join(lines)
