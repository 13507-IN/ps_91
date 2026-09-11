"""
ArthSetu — Input Schemas.

Pydantic models describing the data the AI service receives from the
Node.js backend.  Designed to accept the output of MarketService,
FinancialEngine, and SchemeEngine without transformation.
"""

from __future__ import annotations

from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


# ── Enums ──────────────────────────────────────────────────────────────

class BusinessCategory(str, Enum):
    DAIRY = "DAIRY"
    FOOD_PROCESSING = "FOOD_PROCESSING"
    RETAIL = "RETAIL"
    TEXTILES_TAILORING = "TEXTILES_TAILORING"
    POULTRY = "POULTRY"
    AGRICULTURE = "AGRICULTURE"
    LIVESTOCK = "LIVESTOCK"
    TRANSPORT = "TRANSPORT"
    HANDICRAFT = "HANDICRAFT"
    SERVICES = "SERVICES"
    OTHER = "OTHER"


# ── Sub-models ─────────────────────────────────────────────────────────

class LocationInput(BaseModel):
    """Administrative location of the entrepreneur."""
    village: str = Field(..., description="Village name")
    block: str = Field(..., description="Block / Mandal name")
    district: str = Field(..., description="District name")
    state: str = Field(..., description="State name")
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class MarketInput(BaseModel):
    """Catchment-area demographic and demand/supply summary."""
    population: int = Field(..., ge=0, description="Total catchment population")
    households: int = Field(..., ge=0, description="Total households in catchment")
    estimated_demand: Optional[float] = Field(None, ge=0, description="Estimated daily demand units")
    estimated_supply: Optional[float] = Field(None, ge=0, description="Estimated daily supply units")
    avg_literacy_rate: Optional[float] = Field(None, ge=0, le=100)
    total_workers: Optional[int] = Field(None, ge=0)
    agricultural_labourers: Optional[int] = Field(None, ge=0)
    cultivators: Optional[int] = Field(None, ge=0)
    household_industry_workers: Optional[int] = Field(None, ge=0)
    nearest_town_km: Optional[float] = Field(None, ge=0)


class InformalEstimate(BaseModel):
    """Estimated range of informal competitors."""
    min: int = Field(..., ge=0)
    max: int = Field(..., ge=0)


class CompetitionInput(BaseModel):
    """Competition analysis from MarketService.getCompetitorAnalysis."""
    verified: int = Field(..., ge=0, description="Formally verified businesses")
    reported: int = Field(..., ge=0, description="Community-reported businesses")
    estimated_informal: Optional[InformalEstimate] = None
    density_per_sq_km: Optional[float] = Field(None, ge=0)


class PricingInput(BaseModel):
    """Commodity pricing data (e.g. from AGMARKNET)."""
    min: Optional[float] = Field(None, description="Minimum observed price")
    max: Optional[float] = Field(None, description="Maximum observed price")
    modal: Optional[float] = Field(None, description="Modal / most frequent price")
    unit: str = Field("per unit", description="Unit of measurement")


class CropInfo(BaseModel):
    """Agricultural crop in the catchment area."""
    crop_name: str
    total_area_hectares: Optional[float] = None
    total_production_tonnes: Optional[float] = None


class LivestockInfo(BaseModel):
    """Livestock data in the catchment area."""
    animal_type: str
    total_count: int = Field(..., ge=0)
    milk_producing_count: Optional[int] = Field(None, ge=0)


class InfrastructureInput(BaseModel):
    """Village amenities and connectivity."""
    has_electricity: Optional[bool] = None
    has_bank_branch: Optional[bool] = None
    has_atm: Optional[bool] = None
    has_bus_service: Optional[bool] = None
    has_mobile_network: Optional[bool] = None
    has_internet: Optional[bool] = None
    has_post_office: Optional[bool] = None
    has_phc: Optional[bool] = None
    has_cold_storage: Optional[bool] = None
    nearest_town_km: Optional[float] = None
    road_type: Optional[str] = None


class FinancialInput(BaseModel):
    """Financial summary from the backend's FinancialEngine."""
    margin: float = Field(..., description="Entrepreneur's own capital contribution")
    project_cost: float = Field(..., description="Total project cost")
    loan: float = Field(..., description="Loan amount required")
    interest_rate: Optional[float] = Field(None, description="Annual interest rate %")
    tenure_months: Optional[int] = Field(None, description="Loan tenure in months")
    monthly_emi: Optional[float] = Field(None, description="Monthly EMI amount")
    monthly_revenue_estimate: Optional[float] = None
    monthly_operating_cost: Optional[float] = None
    subsidy_amount: Optional[float] = Field(None, ge=0)
    scheme_name: Optional[str] = None


# ── Main input model ───────────────────────────────────────────────────

class AssessmentInput(BaseModel):
    """
    Unified input for POST /ai/assessment.

    Contains all data the Node.js backend aggregates from MarketService,
    FinancialEngine, SchemeEngine, and user inputs.
    """
    location: LocationInput
    business_category: BusinessCategory
    business_idea: Optional[str] = None

    market: MarketInput
    competition: CompetitionInput
    pricing: Optional[PricingInput] = None

    top_crops: Optional[list[CropInfo]] = None
    livestock: Optional[list[LivestockInfo]] = None
    infrastructure: Optional[InfrastructureInput] = None

    financial: FinancialInput


# ── Granular endpoint inputs ───────────────────────────────────────────
# These match the existing Node.js AiClient endpoint contracts.

class ClassifyBusinessInput(BaseModel):
    idea: str = Field(..., min_length=2, description="Free-text business description")


class DemandEstimateInput(BaseModel):
    businessCategory: BusinessCategory
    totalPopulation: int = Field(..., ge=0)
    totalHouseholds: int = Field(..., ge=0)
    avgLiteracyRate: Optional[float] = None
    nearbyTownDistanceKm: Optional[float] = None


class OpportunityDiscoveryInput(BaseModel):
    businessCategory: BusinessCategory
    existingCompetitors: int = Field(..., ge=0)
    estimatedDemandUnits: float = Field(..., ge=0)
    topCrops: Optional[list[str]] = None
    livestockCount: Optional[int] = None


class RiskAssessmentInput(BaseModel):
    businessCategory: BusinessCategory
    projectCost: float
    loanAmount: float
    monthlyEmi: float
    postEmiCashflow: Optional[float] = None


class RecommendationInput(BaseModel):
    businessCategory: BusinessCategory
    businessIdea: Optional[str] = None
    opportunityScore: float
    financialViabilityScore: float
    riskScore: float
    matchedScheme: Optional[str] = None


class ActionPlanInput(BaseModel):
    businessCategory: BusinessCategory
    loanAmount: float
    schemeName: Optional[str] = None
