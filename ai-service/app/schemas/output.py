"""
ArthSetu — Output Schemas.

Pydantic models describing the structured JSON the AI service returns.
Every field is strictly typed so the Node.js backend can rely on the shape.
"""

from __future__ import annotations

from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


# ── Enums ──────────────────────────────────────────────────────────────

class ConfidenceLevel(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class DemandLevel(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class MarketCondition(str, Enum):
    PROMISING = "promising"
    MODERATE = "moderate"
    CHALLENGING = "challenging"
    SATURATED = "saturated"


class CompetitionLevel(str, Enum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    VERY_HIGH = "very_high"


class Probability(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class Impact(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class Severity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class OpportunityLevel(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class RiskCategory(str, Enum):
    MARKET = "market"
    FINANCIAL = "financial"
    SUPPLY_CHAIN = "supply_chain"
    OPERATIONAL = "operational"
    SEASONAL = "seasonal"
    COMPETITION = "competition"
    INFRASTRUCTURE = "infrastructure"
    CUSTOMER_CONCENTRATION = "customer_concentration"
    REGULATORY = "regulatory"


# ── Sub-models ─────────────────────────────────────────────────────────

class MarketAnalysisOutput(BaseModel):
    """LLM-interpreted market intelligence."""
    demand_level: DemandLevel
    market_condition: MarketCondition
    reasoning: list[str] = Field(..., min_length=1)
    confidence: ConfidenceLevel


class MarketGap(BaseModel):
    """A single identified market gap / opportunity."""
    name: str
    opportunity: OpportunityLevel
    reason: str


class CompetitionAnalysisOutput(BaseModel):
    """LLM-interpreted competition landscape."""
    competition_level: CompetitionLevel
    verified_businesses: int = Field(..., ge=0)
    reported_businesses: int = Field(..., ge=0)
    estimated_informal: dict = Field(
        ..., description='{"min": int, "max": int}'
    )
    informal_interpretation: str
    confidence: ConfidenceLevel


class BusinessModelRecommendation(BaseModel):
    """Recommended business model with reasoning."""
    name: str = Field(..., description="e.g. 'Dairy + Doorstep Delivery + Paneer'")
    reasoning: list[str] = Field(..., min_length=1)
    capital_fit: str = Field(..., description="How well the model fits available capital")


class SwotOutput(BaseModel):
    """Structured SWOT analysis."""
    strengths: list[str] = Field(..., min_length=1)
    weaknesses: list[str] = Field(..., min_length=1)
    opportunities: list[str] = Field(..., min_length=1)
    threats: list[str] = Field(..., min_length=1)


class RiskFactor(BaseModel):
    """A single identified risk with mitigation."""
    risk: str
    category: RiskCategory
    probability: Probability
    impact: Impact
    severity: Severity
    evidence: str
    mitigation: str


class PricingStrategyOutput(BaseModel):
    """Pricing intelligence output."""
    recommended_price_range: dict = Field(
        ..., description='{"min": float, "max": float}'
    )
    strategy: str = Field(..., description="e.g. 'competitive penetration'")
    reasoning: str
    confidence: ConfidenceLevel


class ReasoningItem(BaseModel):
    """An individual reasoning statement with evidence tagging."""
    claim: str
    evidence: list[str] = Field(default_factory=list)
    inference: bool = Field(False, description="True if this is inferred, not directly observed")
    confidence: Optional[float] = Field(None, ge=0.0, le=1.0)


# ── Main output model ─────────────────────────────────────────────────

class AssessmentOutput(BaseModel):
    """
    Complete structured output from POST /ai/assessment.

    Contains deterministic scores + LLM-generated analysis.
    """

    # Deterministic scores (0–100)
    market_score: int = Field(..., ge=0, le=100)
    opportunity_score: int = Field(..., ge=0, le=100)
    risk_score: int = Field(..., ge=0, le=100)
    viability_score: int = Field(..., ge=0, le=100)

    # LLM-generated analysis
    market_analysis: MarketAnalysisOutput
    market_gaps: list[MarketGap]
    competition_analysis: CompetitionAnalysisOutput
    recommended_business_model: BusinessModelRecommendation
    swot: SwotOutput
    risks: list[RiskFactor]
    pricing_strategy: PricingStrategyOutput

    # Explainability
    reasoning: list[ReasoningItem]
    confidence: ConfidenceLevel


# ── Granular endpoint outputs ──────────────────────────────────────────
# Match the existing Node.js AiClient output contracts.

class ClassifyBusinessOutput(BaseModel):
    category: str
    subcategory: str
    confidence: float = Field(..., ge=0, le=1)
    reasoning: str


class DemandEstimateOutput(BaseModel):
    estimatedAnnualDemandUnits: int
    estimatedDailyDemandUnits: int
    unit: str
    confidence: str
    keyDrivers: list[str]


class OpportunityDiscoveryOutput(BaseModel):
    marketGaps: list[str]
    potentialNiches: list[str]
    recommendedModel: str
    opportunityScore: int = Field(..., ge=0, le=100)


class RiskFactorGranular(BaseModel):
    name: str
    probability: str
    impact: str
    mitigation: str


class RiskAssessmentOutput(BaseModel):
    riskFactors: list[RiskFactorGranular]
    overallRiskScore: int = Field(..., ge=0, le=100)
    riskRating: str


class RecommendationOutput(BaseModel):
    decision: str
    viabilityScore: int = Field(..., ge=0, le=100)
    summary: str
    strengths: list[str]
    weaknesses: list[str]
    recommendedNextStep: str


class ActionMilestone(BaseModel):
    phase: str
    dayRange: str
    tasks: list[str]


class ActionPlanOutput(BaseModel):
    planDurationDays: int = 30
    milestones: list[ActionMilestone]
    fundingReadinessChecklist: list[str]
