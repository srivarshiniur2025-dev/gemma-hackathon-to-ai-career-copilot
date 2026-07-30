from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

_ROOT = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(_ROOT / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    google_api_key: str = ""
    gemini_api_key: str = ""  # backward compat — prefer GOOGLE_API_KEY
    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_db: str = "career_copilot"
    firebase_project_id: str = ""
    firebase_credentials_path: str = ""
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    gemma_model: str = "gemma-4-27b-it"
    gemma_fallback_models: str = "gemma-4-26b-a4b-it,gemma-4-4b-it"

    # Job search — multiple sources aggregated in job_fetcher.py (parallel, deduped).
    # SerpAPI Google Jobs = widest web coverage (LinkedIn, Indeed, Glassdoor, etc.)
    serpapi_key: str = ""

    # Adzuna (free tier at https://developer.adzuna.com)
    adzuna_app_id: str = ""
    adzuna_app_key: str = ""
    adzuna_country: str = "us"

    @property
    def resolved_google_api_key(self) -> str:
        """GOOGLE_API_KEY preferred; GEMINI_API_KEY kept for backward compatibility."""
        return self.google_api_key or self.gemini_api_key

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def gemma_model_chain(self) -> list[str]:
        chain: list[str] = []
        for model in [self.gemma_model, *self.gemma_fallback_models.split(",")]:
            model = model.strip()
            if model and model not in chain:
                chain.append(model)
        return chain


settings = Settings()
