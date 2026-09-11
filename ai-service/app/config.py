"""
ArthSetu Service — Configuration.

Loads environment variables with sensible defaults.
"""

from __future__ import annotations

import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from the ai-service root
_env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(_env_path)


class Settings:
    """Application settings loaded from environment variables."""

    # Server
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "false").lower() in ("true", "1", "yes")

    # LLM — Primary: Gemini
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.5-flash")

    # LLM — Fallback: Groq
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

    # LLM behaviour
    LLM_MAX_RETRIES: int = int(os.getenv("LLM_MAX_RETRIES", "2"))
    LLM_TIMEOUT_SECONDS: int = int(os.getenv("LLM_TIMEOUT_SECONDS", "30"))
    LLM_TEMPERATURE: float = float(os.getenv("LLM_TEMPERATURE", "0.3"))

    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO").upper()
    LOG_FORMAT: str = os.getenv("LOG_FORMAT", "json")  # "json" or "console"

    # Paths
    BASE_DIR: Path = Path(__file__).resolve().parent
    PROMPTS_DIR: Path = BASE_DIR / "prompts"

    @property
    def has_gemini(self) -> bool:
        key = self.GEMINI_API_KEY
        return bool(key) and not key.startswith("your_")

    @property
    def has_groq(self) -> bool:
        key = self.GROQ_API_KEY
        return bool(key) and not key.startswith("your_")

    @property
    def has_any_llm(self) -> bool:
        return self.has_gemini or self.has_groq


settings = Settings()
