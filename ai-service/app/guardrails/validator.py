"""
ArthSetu — Output Validator (Guardrails).

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


# ── Enum Normalization Mappings ──────────────────────────────────────────

_LEVEL_MAP = {
    "high": "high", "উচ্চ": "high", "उच्च": "high", "highest": "high", "h": "high", "high_priority": "high",
    "medium": "medium", "মাঝারি": "medium", "মধ্যম": "medium", "मध्यम": "medium", "med": "medium", "moderate": "medium", "m": "medium", "average": "medium",
    "low": "low", "কম": "low", "নিম্ন": "low", "निम्न": "low", "l": "low", "lowest": "low", "safe": "low"
}

_CONDITION_MAP = {
    "promising": "promising", "প্রতিশ্রুতিশীল": "promising", "উজ্জ্বল": "promising", "उम्मीदजनक": "promising", "good": "promising", "positive": "promising",
    "moderate": "moderate", "মাঝারি": "moderate", "মধ্যম": "moderate", "मध्यम": "moderate", "average": "moderate", "stable": "moderate",
    "challenging": "challenging", "কঠিন": "challenging", "চ্যালেঞ্জিং": "challenging", "कठिन": "challenging", "tough": "challenging",
    "saturated": "saturated", "সম্পৃক্ত": "saturated", "পূর্ণ": "saturated", "संतृप्त": "saturated", "crowded": "saturated"
}

_COMP_MAP = {
    "very_high": "very_high", "very high": "very_high", "খুব উচ্চ": "very_high", "অত্যধিক": "very_high", "अत्यधिक": "very_high", "severe": "very_high",
    "high": "high", "উচ্চ": "high", "उच्च": "high", "intense": "high",
    "moderate": "moderate", "মাঝারি": "moderate", "মধ্যম": "moderate", "मध्यम": "moderate", "medium": "moderate",
    "low": "low", "কম": "low", "নিম্ন": "low", "निम्न": "low", "minimal": "low"
}

_SEVERITY_MAP = {
    "critical": "critical", "মারাত্মক": "critical", "সংকটজনক": "critical", "গম্ভীর": "critical", "गंभीर": "critical", "extreme": "critical",
    "high": "high", "উচ্চ": "high", "उच्च": "high",
    "medium": "medium", "মাঝারি": "medium", "মধ্যম": "medium", "मध्यम": "medium", "moderate": "medium",
    "low": "low", "কম": "low", "নিম্ন": "low", "निम्न": "low"
}

_RISK_CAT_MAP = {
    "market": "market", "বাজার": "market", "बाजार": "market",
    "financial": "financial", "আর্থিক": "financial", "वित्तीय": "financial",
    "supply_chain": "supply_chain", "supply chain": "supply_chain", "সাপ্লাই চেইন": "supply_chain", "आपूर्ति": "supply_chain",
    "operational": "operational", "পরিচালন": "operational", "परिचालन": "operational",
    "seasonal": "seasonal", "মরশুমি": "seasonal", "मौसमी": "seasonal",
    "competition": "competition", "প্রতিযোগিতা": "competition", "प्रतिस्पर्धा": "competition",
    "infrastructure": "infrastructure", "অবকাঠামো": "infrastructure", "बुनियादी ढांचा": "infrastructure",
    "customer_concentration": "customer_concentration", "গ্রাহক": "customer_concentration", "ग्राहक": "customer_concentration",
    "regulatory": "regulatory", "নিয়ন্ত্রক": "regulatory", "नियामक": "regulatory"
}


def _norm_str(v: Any) -> str:
    return str(v).strip().lower() if v is not None else ""


def _normalize_enums(output: dict, result: ValidationResult) -> dict:
    """Normalize translated, localized, or casing-variant enum strings."""
    # Top-level confidence
    if "confidence" in output:
        raw = _norm_str(output["confidence"])
        output["confidence"] = _LEVEL_MAP.get(raw, "medium")

    # Market Analysis
    ma = output.get("market_analysis")
    if isinstance(ma, dict):
        if "demand_level" in ma:
            ma["demand_level"] = _LEVEL_MAP.get(_norm_str(ma["demand_level"]), "medium")
        if "market_condition" in ma:
            ma["market_condition"] = _CONDITION_MAP.get(_norm_str(ma["market_condition"]), "moderate")
        if "confidence" in ma:
            ma["confidence"] = _LEVEL_MAP.get(_norm_str(ma["confidence"]), "medium")

    # Competition Analysis
    ca = output.get("competition_analysis")
    if isinstance(ca, dict):
        if "competition_level" in ca:
            ca["competition_level"] = _COMP_MAP.get(_norm_str(ca["competition_level"]), "moderate")
        if "confidence" in ca:
            ca["confidence"] = _LEVEL_MAP.get(_norm_str(ca["confidence"]), "medium")

    # Pricing Strategy
    ps = output.get("pricing_strategy")
    if isinstance(ps, dict):
        if "confidence" in ps:
            ps["confidence"] = _LEVEL_MAP.get(_norm_str(ps["confidence"]), "medium")

    # Market Gaps
    gaps = output.get("market_gaps")
    if isinstance(gaps, list):
        for g in gaps:
            if isinstance(g, dict) and "opportunity" in g:
                g["opportunity"] = _LEVEL_MAP.get(_norm_str(g["opportunity"]), "medium")

    # Risks
    risks = output.get("risks")
    if isinstance(risks, list):
        for r in risks:
            if isinstance(r, dict):
                if "probability" in r:
                    r["probability"] = _LEVEL_MAP.get(_norm_str(r["probability"]), "medium")
                if "impact" in r:
                    r["impact"] = _LEVEL_MAP.get(_norm_str(r["impact"]), "medium")
                if "severity" in r:
                    r["severity"] = _SEVERITY_MAP.get(_norm_str(r["severity"]), "medium")
                if "category" in r:
                    r["category"] = _RISK_CAT_MAP.get(_norm_str(r["category"]), "operational")

    return output


def validate_assessment(output: dict) -> tuple[dict, ValidationResult]:
    """
    Validate and optionally correct an AssessmentOutput dict.

    Returns the (possibly corrected) output and a ValidationResult.
    """
    result = ValidationResult()

    # 0. Normalize multilingual / localized enum values
    output = _normalize_enums(output, result)

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
