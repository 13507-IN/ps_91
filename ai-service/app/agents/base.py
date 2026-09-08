"""
UdyamSetu AI — Base Agent.

Provides the common pattern for all LLM-powered agents:
  1. Load Jinja2 prompt template
  2. Render with structured data
  3. Call LLM
  4. Parse JSON response
  5. Validate with Pydantic
  6. Fall back to deterministic response on failure
"""

from __future__ import annotations

import json
import time
from pathlib import Path
from typing import Any, Type

import structlog
from jinja2 import Environment, FileSystemLoader, Template
from pydantic import BaseModel, ValidationError

from app.config import settings
from app.llm.provider import LLMClient

logger = structlog.get_logger(__name__)

# Shared Jinja2 environment
_jinja_env = Environment(
    loader=FileSystemLoader(str(settings.PROMPTS_DIR)),
    trim_blocks=True,
    lstrip_blocks=True,
    keep_trailing_newline=False,
)


class BaseAgent:
    """
    Base class for all LLM-powered analysis agents.

    Subclasses must implement:
        - prompt_file: str — name of the Jinja2 template file
        - output_model: Type[BaseModel] — Pydantic model for validation
        - fallback(**kwargs) -> dict — deterministic fallback
        - system_prompt: str — system instruction for the LLM
    """

    prompt_file: str = ""
    output_model: Type[BaseModel] = BaseModel
    system_prompt: str = (
        "You are a rural business intelligence analyst for India. "
        "Return ONLY valid JSON matching the requested format. "
        "Do not include any text outside the JSON object."
    )

    def __init__(self, llm: LLMClient) -> None:
        self.llm = llm
        self._template: Template | None = None

    @property
    def template(self) -> Template:
        if self._template is None:
            self._template = _jinja_env.get_template(self.prompt_file)
        return self._template

    @property
    def agent_name(self) -> str:
        return self.__class__.__name__

    async def run(self, **kwargs: Any) -> dict:
        """
        Execute the agent:
        1. Render prompt from template
        2. Call LLM
        3. Parse and validate JSON
        4. Return validated dict

        Falls back to deterministic response on any failure.
        """
        start = time.perf_counter()

        try:
            # Render prompt
            prompt = self._render_prompt(**kwargs)

            # Call LLM
            if not self.llm.is_available:
                logger.info("agent_no_llm", agent=self.agent_name, note="Using fallback")
                return self.fallback(**kwargs)

            raw_response = await self.llm.generate(
                prompt=prompt,
                system=self.system_prompt,
            )

            # Parse JSON
            parsed = self._parse_json(raw_response)

            # Validate with Pydantic
            validated = self.output_model.model_validate(parsed)
            result = validated.model_dump()

            elapsed_ms = round((time.perf_counter() - start) * 1000)
            logger.info(
                "agent_success",
                agent=self.agent_name,
                elapsed_ms=elapsed_ms,
                source="llm",
            )
            return result

        except Exception as exc:
            elapsed_ms = round((time.perf_counter() - start) * 1000)
            logger.warning(
                "agent_fallback",
                agent=self.agent_name,
                elapsed_ms=elapsed_ms,
                error=str(exc),
                note="Using deterministic fallback",
            )
            return self.fallback(**kwargs)

    def fallback(self, **kwargs: Any) -> dict:
        """
        Deterministic fallback when LLM is unavailable or fails.
        Must be overridden by subclasses.
        """
        raise NotImplementedError(f"{self.agent_name} must implement fallback()")

    def _render_prompt(self, **kwargs: Any) -> str:
        """Render the Jinja2 template with provided data."""
        # Convert Pydantic models to dicts for template rendering
        render_kwargs = {}
        for key, value in kwargs.items():
            if isinstance(value, BaseModel):
                render_kwargs[key] = value.model_dump()
            elif isinstance(value, list) and value and isinstance(value[0], BaseModel):
                render_kwargs[key] = [v.model_dump() for v in value]
            else:
                render_kwargs[key] = value

        return self.template.render(**render_kwargs)

    def _parse_json(self, text: str) -> dict:
        """
        Extract and parse JSON from the LLM response.
        Handles common issues like markdown code blocks.
        """
        cleaned = text.strip()

        # Remove markdown code blocks if present
        if cleaned.startswith("```"):
            # Remove opening ``` with optional language tag
            first_newline = cleaned.index("\n")
            cleaned = cleaned[first_newline + 1:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()

        # Try direct parse
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            pass

        # Try to find JSON object in the text
        start_idx = cleaned.find("{")
        end_idx = cleaned.rfind("}")
        if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
            try:
                return json.loads(cleaned[start_idx : end_idx + 1])
            except json.JSONDecodeError:
                pass

        raise ValueError(f"Could not parse JSON from LLM response: {cleaned[:200]}...")
