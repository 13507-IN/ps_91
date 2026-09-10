"""
UdyamSetu AI — Groq LLM Provider.

Wraps the Groq SDK for Llama 3.3 70B Versatile (fallback provider).
"""

from __future__ import annotations

import time
import structlog
from groq import Groq

from app.config import settings

logger = structlog.get_logger(__name__)


class GroqProvider:
    """Groq LLM provider (fallback)."""

    def __init__(self) -> None:
        self.client = Groq(api_key=settings.GROQ_API_KEY)
        self.model = settings.GROQ_MODEL

    async def generate(
        self,
        prompt: str,
        system: str | None = None,
        temperature: float | None = None,
    ) -> str:
        """
        Generate text from Groq.

        Note: Groq SDK is synchronous. We wrap it here for interface
        consistency with the async pattern. In production you'd use
        an async-compatible client or run in a thread pool.
        """
        temp = temperature if temperature is not None else settings.LLM_TEMPERATURE
        start = time.perf_counter()

        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temp,
                max_tokens=4096,
                response_format={"type": "json_object"},
            )
            elapsed_ms = round((time.perf_counter() - start) * 1000)
            text = response.choices[0].message.content or ""

            logger.info(
                "groq_call",
                model=self.model,
                latency_ms=elapsed_ms,
                response_len=len(text),
                usage={
                    "prompt_tokens": getattr(response.usage, "prompt_tokens", None),
                    "completion_tokens": getattr(response.usage, "completion_tokens", None),
                    "total_tokens": getattr(response.usage, "total_tokens", None),
                },
            )
            return text

        except Exception as exc:
            elapsed_ms = round((time.perf_counter() - start) * 1000)
            logger.error(
                "groq_error",
                model=self.model,
                latency_ms=elapsed_ms,
                error=str(exc),
            )
            raise
