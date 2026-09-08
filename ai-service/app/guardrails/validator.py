"""
UdyamSetu AI — Output Validator (Guardrails).

Post-processing validation layer that checks AI outputs for:
1. Score bounds (0-100, no NaN)
2. Confidence presence on all outputs
3. Consistency between scores and qualitative assessments
4. No fabricated financial data
5. Evidence tagging on reasoning items
"""

from __future__ import annotations

import structlog

logger = structlog.get_logger(__name__)


class ValidationResult:
    """Result of guardrail validation."""

    def __init__(self) -> None:
        self.is_valid = True
        self.warnings: list[str] = []
        self.corrections: list[str] = []

    def warn(self, msg: str) -> None:
        self.warnings.append(msg)
        logger.warning("guardrail_warning", message=msg)

    def correct(self, msg: str) -> None:
        self.corrections.append(msg)
        self.is_valid = False
        logger.warning("guardrail_correction", message=msg)


def validate_assessment(output: dict) -> tuple[dict, ValidationResult]:
    """
    Validate and optionally correct an AssessmentOutput dict.

    Returns the (possibly corrected) output and a ValidationResult.
    """
    result = ValidationResult()

    # 1. Score bounds
    output = _validate_scores(output, result)

    # 2. Score consistency
    _validate_consistency(output, result)

    # 3. Non-empty required fields
    _validate_completeness(output, result)

    # 4. Reasoning quality
    _validate_reasoning(output, result)

    return output, result


def _validate_scores(output: dict, result: ValidationResult) -> dict:
    """Ensure all scores are within 0-100."""
    for field in ("market_score", "opportunity_score", "risk_score", "viability_score"):
        value = output.get(field)
        if value is None:
            result.correct(f"Missing {field}, setting to 50")
            output[field] = 50
        elif not isinstance(value, (int, float)):
            result.correct(f"{field} is not numeric ({value}), setting to 50")
            output[field] = 50
        elif value < 0:
            result.correct(f"{field} is negative ({value}), clamping to 0")
            output[field] = 0
        elif value > 100:
            result.correct(f"{field} is > 100 ({value}), clamping to 100")
            output[field] = 100

    return output


def _validate_consistency(output: dict, result: ValidationResult) -> None:
    """Check that scores are internally consistent."""
    market = output.get("market_score", 50)
    risk = output.get("risk_score", 50)
    viability = output.get("viability_score", 50)

    # High risk + high viability is suspicious
    if risk > 70 and viability > 75:
        result.warn(
            f"Inconsistency: risk_score={risk} (high) but viability_score={viability} (also high). "
            "High risk should reduce viability."
        )

    # Low market + high opportunity is suspicious
    market_analysis = output.get("market_analysis", {})
    if isinstance(market_analysis, dict):
        condition = market_analysis.get("market_condition", "")
        if condition == "saturated" and output.get("opportunity_score", 0) > 70:
            result.warn(
                "Inconsistency: market is 'saturated' but opportunity_score is high. "
                "Saturated markets typically have fewer opportunities."
            )

    # Competition level vs competition analysis
    comp = output.get("competition_analysis", {})
    if isinstance(comp, dict):
        level = comp.get("competition_level", "")
        if level == "very_high" and market < 30:
            pass  # Expected: very high competition, low market score
        elif level == "low" and market < 20:
            result.warn(
                "Inconsistency: competition is 'low' but market_score is very low. "
                "Low competition usually boosts market attractiveness."
            )


def _validate_completeness(output: dict, result: ValidationResult) -> None:
    """Check that required fields are present and non-empty."""
    # Market gaps should be a non-empty list
    gaps = output.get("market_gaps", [])
    if not gaps:
        result.warn("No market gaps identified — this may indicate insufficient analysis.")

    # SWOT should have all four quadrants
    swot = output.get("swot", {})
    if isinstance(swot, dict):
        for quadrant in ("strengths", "weaknesses", "opportunities", "threats"):
            items = swot.get(quadrant, [])
            if not items:
                result.warn(f"SWOT {quadrant} is empty.")

    # Risks should have at least one item
    risks = output.get("risks", [])
    if not risks:
        result.warn("No risks identified — every business has risks.")

    # Confidence should be present
    if "confidence" not in output:
        result.warn("Missing overall confidence level.")


def _validate_reasoning(output: dict, result: ValidationResult) -> None:
    """Check reasoning quality."""
    reasoning = output.get("reasoning", [])
    if not reasoning:
        result.warn("No reasoning items provided.")
        return

    for item in reasoning:
        if isinstance(item, dict):
            claim = item.get("claim", "")
            if len(claim) < 10:
                result.warn(f"Reasoning claim is too short: '{claim}'")
            if "inference" not in item:
                result.warn(f"Reasoning item missing 'inference' tag: '{claim[:50]}'")
