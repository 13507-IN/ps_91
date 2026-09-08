"""
UdyamSetu AI — LLM Client.

Manages primary (Gemini) and fallback (Groq) providers with:
  • Automatic failover
  • Retry logic
  • Structured logging per call
"""

from __future__ import annotations

import structlog

from app.config import settings

logger = structlog.get_logger(__name__)


class LLMClient:
    """
    Unified LLM client with primary/fallback provider support.

    Usage:
        client = LLMClient()
        text = await client.generate(prompt, system="You are...")
    """

    def __init__(self) -> None:
        self._primary = None
        self._fallback = None

        if settings.has_gemini:
            from app.llm.gemini import GeminiProvider
            self._primary = GeminiProvider()
            logger.info("llm_init", primary="gemini", model=settings.GEMINI_MODEL)

        if settings.has_groq:
            from app.llm.groq_provider import GroqProvider
            self._fallback = GroqProvider()
            logger.info("llm_init", fallback="groq", model=settings.GROQ_MODEL)

        if not self._primary and self._fallback:
            # If only Groq is configured, promote it to primary
            self._primary = self._fallback
            self._fallback = None
            logger.info("llm_init", note="Groq promoted to primary (no Gemini key)")

        if not self._primary:
            logger.warning(
                "llm_init",
                note="No LLM API keys configured. All calls will use deterministic fallbacks.",
            )

    @property
    def is_available(self) -> bool:
        """True if at least one LLM provider is configured."""
        return self._primary is not None

    async def generate(
        self,
        prompt: str,
        system: str | None = None,
        temperature: float | None = None,
        max_retries: int | None = None,
    ) -> str:
        """
        Generate text using primary provider, falling back to secondary.

        Raises RuntimeError if no provider is available.
        Raises the last exception if all retries/fallbacks fail.
        """
        if not self._primary:
            raise RuntimeError("No LLM provider configured. Set GEMINI_API_KEY or GROQ_API_KEY.")

        retries = max_retries if max_retries is not None else settings.LLM_MAX_RETRIES
        last_error: Exception | None = None

        # Try primary provider with retries
        for attempt in range(retries + 1):
            try:
                return await self._primary.generate(prompt, system=system, temperature=temperature)
            except Exception as exc:
                last_error = exc
                logger.warning(
                    "llm_primary_retry",
                    attempt=attempt + 1,
                    max_retries=retries,
                    error=str(exc),
                )

        # Try fallback provider
        if self._fallback:
            logger.info("llm_fallback_attempt", provider="groq")
            try:
                return await self._fallback.generate(prompt, system=system, temperature=temperature)
            except Exception as exc:
                last_error = exc
                logger.error("llm_fallback_failed", error=str(exc))

        # All attempts exhausted
        raise last_error or RuntimeError("LLM generation failed with no error details.")
