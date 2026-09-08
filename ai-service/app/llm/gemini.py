"""
UdyamSetu AI — Gemini LLM Provider.

Wraps the Google GenAI SDK for Gemini 2.5 Flash.
"""

from __future__ import annotations

import time
import structlog
from google import genai
from google.genai import types

from app.config import settings

logger = structlog.get_logger(__name__)


class GeminiProvider:
    """Google Gemini LLM provider."""

    def __init__(self) -> None:
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.model = settings.GEMINI_MODEL

    async def generate(
        self,
        prompt: str,
        system: str | None = None,
        temperature: float | None = None,
    ) -> str:
        """
        Generate text from Gemini.

        Returns the raw text response.
        Raises on API / network errors so the caller can fall back.
        """
        temp = temperature if temperature is not None else settings.LLM_TEMPERATURE
        start = time.perf_counter()

        config = types.GenerateContentConfig(
            temperature=temp,
            response_mime_type="application/json",
        )
        if system:
            config.system_instruction = system

        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=config,
            )
            elapsed_ms = round((time.perf_counter() - start) * 1000)
            text = response.text or ""

            logger.info(
                "gemini_call",
                model=self.model,
                latency_ms=elapsed_ms,
                response_len=len(text),
                usage=_extract_usage(response),
            )
            return text

        except Exception as exc:
            elapsed_ms = round((time.perf_counter() - start) * 1000)
            logger.error(
                "gemini_error",
                model=self.model,
                latency_ms=elapsed_ms,
                error=str(exc),
            )
            raise


def _extract_usage(response) -> dict:
    """Safely extract token usage from the Gemini response."""
    try:
        usage = response.usage_metadata
        return {
            "prompt_tokens": getattr(usage, "prompt_token_count", None),
            "candidates_tokens": getattr(usage, "candidates_token_count", None),
            "total_tokens": getattr(usage, "total_token_count", None),
        }
    except Exception:
        return {}
