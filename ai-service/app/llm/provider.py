"""
ArthSetu — LLM Client.

Manages primary (Gemini) and fallback (Groq) providers with:
  • In-memory TTL Caching to avoid duplicate LLM calls
  • Automatic instant failover on 503/429/quota errors
  • Retry logic & structured logging
"""

from __future__ import annotations

import time
import hashlib
import structlog

from app.config import settings

logger = structlog.get_logger(__name__)

# Global in-memory cache: cache_key -> (expiration_timestamp, text_response)
_LLM_CACHE: dict[str, tuple[float, str]] = {}
CACHE_TTL_SECONDS = 3600  # 1 hour TTL for identical prompts


class LLMClient:
    """
    Unified LLM client with primary/fallback provider support and TTL caching.
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
        return self._primary is not None

    async def generate(
        self,
        prompt: str,
        system: str | None = None,
        temperature: float | None = None,
        max_retries: int | None = None,
    ) -> str:
        """
        Generate text using cached results if available, else call primary provider with Groq fallback.
        """
        if not self._primary:
            raise RuntimeError("No LLM provider configured. Set GEMINI_API_KEY or GROQ_API_KEY.")

        # Compute cache key from prompt signature
        raw_key = f"{system or ''}::{prompt}::{temperature or 0.3}"
        cache_key = hashlib.sha256(raw_key.encode('utf-8')).hexdigest()

        now = time.time()
        if cache_key in _LLM_CACHE:
            expire_at, cached_text = _LLM_CACHE[cache_key]
            if now < expire_at:
                logger.info("llm_cache_hit", key_hash=cache_key[:10], len=len(cached_text))
                return cached_text

        retries = max_retries if max_retries is not None else settings.LLM_MAX_RETRIES
        last_error: Exception | None = None

        # Try primary provider with retries & instant quota failover
        for attempt in range(retries + 1):
            try:
                result = await self._primary.generate(prompt, system=system, temperature=temperature)
                # Store in cache
                _LLM_CACHE[cache_key] = (now + CACHE_TTL_SECONDS, result)
                return result
            except Exception as exc:
                last_error = exc
                err_str = str(exc).lower()
                logger.warning(
                    "llm_primary_retry",
                    attempt=attempt + 1,
                    max_retries=retries,
                    error=str(exc),
                )
                if any(err_term in err_str for err_term in [
                    "429", "503", "504", "resource_exhausted", "quota",
                    "unavailable", "high demand", "overloaded", "not_found"
                ]):
                    logger.info("llm_primary_quota_exceeded", note="Bypassing retries and switching to fallback provider instantly")
                    break

        # Try fallback provider
        if self._fallback:
            logger.info("llm_fallback_attempt", provider="groq")
            try:
                result = await self._fallback.generate(prompt, system=system, temperature=temperature)
                _LLM_CACHE[cache_key] = (now + CACHE_TTL_SECONDS, result)
                return result
            except Exception as exc:
                last_error = exc
                logger.error("llm_fallback_failed", error=str(exc))

        # All attempts exhausted
        raise last_error or RuntimeError("LLM generation failed with no error details.")
