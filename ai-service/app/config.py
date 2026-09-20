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
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")

    # LLM — Fallback 1: Groq
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "groq/compound-mini")

    # LLM — Fallback 2: OpenRouter
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
    OPENROUTER_MODEL: str = os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3.3-70b-instruct:free")

    # LLM behaviour
    LLM_MAX_RETRIES: int = int(os.getenv("LLM_MAX_RETRIES", "2"))
    LLM_TIMEOUT_SECONDS: int = int(os.getenv("LLM_TIMEOUT_SECONDS", "30"))
    LLM_TEMPERATURE: float = float(os.getenv("LLM_TEMPERATURE", "0.3"))

    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO").upper()
    LOG_FORMAT: str = os.getenv("LOG_FORMAT", "json")  # "json" or "console"

    # ML model artifacts (shared with the ML/ pipeline)
    REPO_ROOT: Path = Path(__file__).resolve().parents[2]
    ML_MODELS_DIR: Path = Path(
        os.getenv("ML_MODELS_DIR", str(REPO_ROOT / "ML" / "models"))
    )

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
    def has_openrouter(self) -> bool:
        key = self.OPENROUTER_API_KEY
        return bool(key) and not key.startswith("your_")

    @property
    def has_any_llm(self) -> bool:
        return self.has_gemini or self.has_groq or self.has_openrouter

    @property
    def has_ml_models(self) -> bool:
        """True when the ML models directory exists and is non-empty."""
        return bool(self.ML_MODELS_DIR.is_dir()) and any(self.ML_MODELS_DIR.rglob("*.joblib"))

    @property
    def has_ml_demand(self) -> bool:
        return (self.ML_MODELS_DIR / "demand" / "demand_model.joblib").exists()

    @property
    def ml_commodities(self) -> list[str]:
        """Commodity names with a trained model (from 'commodity/<name>.joblib')."""
        dir_path = self.ML_MODELS_DIR / "commodity"
        if not dir_path.is_dir():
            return []
        return sorted(p.name for p in dir_path.glob("*.joblib"))


settings = Settings()
