"""
ArthSetu — LLM Client.

Manages 3-tier provider chain (Gemini -> Groq -> OpenRouter) with:
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
    Unified LLM client supporting 3-tier failover (Gemini -> Groq -> OpenRouter).
    """

    def __init__(self) -> None:
        self._primary = None
        self._fallback_groq = None
        self._fallback_openrouter = None

        if settings.has_gemini:
            from app.llm.gemini import GeminiProvider
            self._primary = GeminiProvider()
            logger.info("llm_init", primary="gemini", model=settings.GEMINI_MODEL)

        if settings.has_groq:
            from app.llm.groq_provider import GroqProvider
            self._fallback_groq = GroqProvider()
            logger.info("llm_init", fallback_groq="groq", model=settings.GROQ_MODEL)

        if settings.has_openrouter:
            from app.llm.openrouter_provider import OpenRouterProvider
            self._fallback_openrouter = OpenRouterProvider()
            logger.info("llm_init", fallback_openrouter="openrouter", model=settings.OPENROUTER_MODEL)

        if not self._primary and self._fallback_groq:
            self._primary = self._fallback_groq
            self._fallback_groq = None
            logger.info("llm_init", note="Groq promoted to primary (no Gemini key)")

        if not self._primary and self._fallback_openrouter:
            self._primary = self._fallback_openrouter
            self._fallback_openrouter = None
            logger.info("llm_init", note="OpenRouter promoted to primary (no Gemini or Groq key)")

        if not self._primary:
            logger.warning(
                "llm_init",
                note="No LLM API keys configured. All calls will use deterministic fallbacks.",
            )

    @property
    def is_available(self) -> bool:
        return (
            self._primary is not None
            or self._fallback_groq is not None
            or self._fallback_openrouter is not None
        )

    async def generate(
        self,
        prompt: str,
        system: str | None = None,
        temperature: float | None = None,
        max_retries: int | None = None,
    ) -> str:
        """
        Generate text using primary provider (Gemini) with failover to Groq then OpenRouter.
        Used for HIGH-IMPORTANCE agents (Market, Opportunity, Risk, Recommendation).
        """
        if not self.is_available:
            raise RuntimeError("No LLM provider configured. Set GEMINI_API_KEY, GROQ_API_KEY, or OPENROUTER_API_KEY.")

        raw_key = f"primary::{system or ''}::{prompt}::{temperature or 0.3}"
        cache_key = hashlib.sha256(raw_key.encode('utf-8')).hexdigest()

        now = time.time()
        if cache_key in _LLM_CACHE:
            expire_at, cached_text = _LLM_CACHE[cache_key]
            if now < expire_at:
                logger.info("llm_cache_hit", key_hash=cache_key[:10], len=len(cached_text))
                return cached_text

        retries = max_retries if max_retries is not None else settings.LLM_MAX_RETRIES
        last_error: Exception | None = None

        # Tier 1: Primary provider (Gemini)
        if self._primary:
            for attempt in range(retries + 1):
                try:
                    result = await self._primary.generate(prompt, system=system, temperature=temperature)
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
                        "unavailable", "high demand", "overloaded", "not_found",
                        "timeout", "timed out"
                    ]):
                        logger.info("llm_primary_quota_exceeded", note="Bypassing retries and switching to Groq fallback")
                        break

        # Tier 2: Groq Fallback
        if self._fallback_groq:
            logger.info("llm_fallback_attempt", provider="groq")
            try:
                result = await self._fallback_groq.generate(prompt, system=system, temperature=temperature)
                _LLM_CACHE[cache_key] = (now + CACHE_TTL_SECONDS, result)
                return result
            except Exception as exc:
                last_error = exc
                logger.warning("llm_groq_fallback_failed", error=str(exc))

        # Tier 3: OpenRouter Fallback
        if self._fallback_openrouter:
            logger.info("llm_fallback_attempt", provider="openrouter")
            try:
                result = await self._fallback_openrouter.generate(prompt, system=system, temperature=temperature)
                _LLM_CACHE[cache_key] = (now + CACHE_TTL_SECONDS, result)
                return result
            except Exception as exc:
                last_error = exc
                logger.error("llm_openrouter_fallback_failed", error=str(exc))

        raise last_error or RuntimeError("LLM generation failed with no error details.")

    async def generate_secondary(
        self,
        prompt: str,
        system: str | None = None,
        temperature: float | None = None,
    ) -> str:
        """
        Generate text using Groq first, with failover to Gemini, then OpenRouter.
        Used for LOW-IMPORTANCE agents (Competition, Pricing, SWOT).
        """
        if not self.is_available:
            raise RuntimeError("No LLM provider configured. Set GEMINI_API_KEY, GROQ_API_KEY, or OPENROUTER_API_KEY.")

        raw_key = f"secondary::{system or ''}::{prompt}::{temperature or 0.3}"
        cache_key = hashlib.sha256(raw_key.encode('utf-8')).hexdigest()

        now = time.time()
        if cache_key in _LLM_CACHE:
            expire_at, cached_text = _LLM_CACHE[cache_key]
            if now < expire_at:
                logger.info("llm_cache_hit", key_hash=cache_key[:10], len=len(cached_text), provider="secondary")
                return cached_text

        last_error: Exception | None = None

        # Step 1: Groq (if available)
        if self._fallback_groq:
            try:
                logger.info("llm_secondary_call", provider="groq")
                result = await self._fallback_groq.generate(prompt, system=system, temperature=temperature)
                _LLM_CACHE[cache_key] = (now + CACHE_TTL_SECONDS, result)
                return result
            except Exception as exc:
                last_error = exc
                logger.warning("llm_secondary_groq_failed", error=str(exc))

        # Step 2: Gemini (Primary)
        if self._primary:
            try:
                logger.info("llm_secondary_escalate", provider="gemini")
                result = await self._primary.generate(prompt, system=system, temperature=temperature)
                _LLM_CACHE[cache_key] = (now + CACHE_TTL_SECONDS, result)
                return result
            except Exception as exc:
                last_error = exc
                logger.warning("llm_secondary_gemini_failed", error=str(exc))

        # Step 3: OpenRouter (Final Fallback)
        if self._fallback_openrouter:
            try:
                logger.info("llm_secondary_escalate", provider="openrouter")
                result = await self._fallback_openrouter.generate(prompt, system=system, temperature=temperature)
                _LLM_CACHE[cache_key] = (now + CACHE_TTL_SECONDS, result)
                return result
            except Exception as exc:
                last_error = exc
                logger.error("llm_secondary_openrouter_failed", error=str(exc))

        raise last_error or RuntimeError("Secondary LLM generation failed with no error details.")
