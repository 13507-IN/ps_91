"""
UdyamSetu AI — Unified Assessment Route.

POST /ai/assessment — runs the complete business intelligence pipeline.
"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException
import structlog

from app.schemas.input import AssessmentInput
from app.schemas.output import AssessmentOutput
from app.orchestrator import Orchestrator
from app.llm.provider import LLMClient

logger = structlog.get_logger(__name__)
router = APIRouter(prefix="/ai", tags=["AI Assessment"])

# Singleton orchestrator (initialised on first request)
_orchestrator: Orchestrator | None = None


def _get_orchestrator() -> Orchestrator:
    global _orchestrator
    if _orchestrator is None:
        _orchestrator = Orchestrator(llm=LLMClient())
    return _orchestrator


@router.post(
    "/assessment",
    response_model=AssessmentOutput,
    summary="Full business intelligence assessment",
    description=(
        "Run the complete AI pipeline: market analysis, opportunity detection, "
        "competition analysis, risk assessment, SWOT, pricing, and business "
        "recommendation.  Returns structured JSON with deterministic scores "
        "and LLM-generated reasoning."
    ),
)
async def full_assessment(data: AssessmentInput) -> AssessmentOutput:
    """Execute the complete business assessment pipeline."""
    try:
        orchestrator = _get_orchestrator()
        return await orchestrator.generate_assessment(data)
    except Exception as exc:
        logger.error("assessment_error", error=str(exc), exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Assessment pipeline failed: {str(exc)}",
        )
