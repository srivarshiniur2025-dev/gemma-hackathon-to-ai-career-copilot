"""Quick test to verify Gemma 4 connection via the Google GenAI SDK."""

import os
import sys
from pathlib import Path

from backend.config import settings
from backend.services.gemma import GemmaAuthError, gemma_service


def load_env() -> None:
    env_path = Path(__file__).resolve().parent / ".env"
    if not env_path.exists():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip())


def main() -> None:
    load_env()
    api_key = settings.resolved_google_api_key
    if not api_key:
        print("Missing API key. Set GOOGLE_API_KEY in .env (GEMINI_API_KEY also accepted).")
        print("Get one free at: https://aistudio.google.com/apikey")
        sys.exit(1)

    print(f"Model chain: {' -> '.join(settings.gemma_model_chain)}")
    print(f"Connecting via google-genai SDK...")

    try:
        response_text = gemma_service.generate_text(
            "You are Gemma 4.",
            "Say hello in one short sentence. You are Gemma.",
        )
    except GemmaAuthError as exc:
        print(f"Auth error: {exc}")
        sys.exit(1)
    except Exception as exc:
        print(f"Connection failed: {exc}")
        sys.exit(1)

    print(f"\nActive model: {gemma_service.active_model}")
    print("\nGemma says:")
    print(response_text)
    print("\nConnection successful!")


if __name__ == "__main__":
    main()
