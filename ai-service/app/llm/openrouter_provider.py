"""
ArthSetu — OpenRouter LLM Provider.

Provides universal 3rd-tier fallback for Gemini & Groq via OpenRouter API.
"""

from __future__ import annotations

import time
import httpx
import structlog

from app.config import settings

logger = structlog.get_logger(__name__)


class OpenRouterProvider:
    """OpenRouter LLM provider (3rd-tier fallback)."""

    def __init__(self) -> None:
        self.api_key = settings.OPENROUTER_API_KEY
        self.model = settings.OPENROUTER_MODEL
        self.base_url = "https://openrouter.ai/api/v1/chat/completions"

    async def generate(
        self,
        prompt: str,
        system: str | None = None,
        temperature: float | None = None,
    ) -> str:
        """
        Generate text via OpenRouter REST API.
        """
        temp = temperature if temperature is not None else settings.LLM_TEMPERATURE
        start = time.perf_counter()

        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "HTTP-Referer": "https://arthsetu.gov.in",
            "X-Title": "ArthSetu Business Intelligence",
            "Content-Type": "application/json",
        }

        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temp,
            "response_format": {"type": "json_object"},
        }

        try:
            async with httpx.AsyncClient(timeout=float(settings.LLM_TIMEOUT_SECONDS)) as client:
                response = await client.post(self.base_url, headers=headers, json=payload)
                response.raise_for_status()
                data = response.json()

            elapsed_ms = round((time.perf_counter() - start) * 1000)
            text = data["choices"][0]["message"]["content"] or ""

            usage = data.get("usage", {})
            logger.info(
                "openrouter_call",
                model=self.model,
                latency_ms=elapsed_ms,
                response_len=len(text),
                usage={
                    "prompt_tokens": usage.get("prompt_tokens"),
                    "completion_tokens": usage.get("completion_tokens"),
                    "total_tokens": usage.get("total_tokens"),
                },
            )
            return text

        except Exception as exc:
            elapsed_ms = round((time.perf_counter() - start) * 1000)
            logger.error(
                "openrouter_error",
                model=self.model,
                latency_ms=elapsed_ms,
                error=str(exc),
            )
            raise
