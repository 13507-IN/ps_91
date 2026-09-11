"""
ArthSetu — Opportunity Detection Agent.
"""

from __future__ import annotations
from typing import Any
from pydantic import BaseModel, Field

from app.agents.base import BaseAgent
from app.schemas.input import AssessmentInput, BusinessCategory


class MarketGapItem(BaseModel):
    name: str
    opportunity: str
    reason: str


class OpportunityResult(BaseModel):
    market_gaps: list[MarketGapItem]


# Category-specific default market gaps for fallback
_DEFAULT_GAPS: dict[str, list[dict]] = {
    "DAIRY": [
        {"name": "Doorstep milk delivery", "opportunity": "high", "reason": "Most rural sellers operate from fixed points; home delivery fills a convenience gap."},
        {"name": "Paneer and chhana production", "opportunity": "high", "reason": "Value-added dairy products are typically sourced from towns; local production reduces cost and improves freshness."},
        {"name": "Institutional milk supply", "opportunity": "medium", "reason": "Schools, hostels, and tea stalls represent underserved institutional demand."},
    ],
    "FOOD_PROCESSING": [
        {"name": "Custom flour and spice milling", "opportunity": "high", "reason": "Households prefer freshly ground produce but may lack local access."},
        {"name": "Cold-pressed mustard oil production", "opportunity": "high", "reason": "Premium local oil has strong demand where mustard is cultivated."},
        {"name": "Packaged snack production", "opportunity": "medium", "reason": "Puffed rice, namkeen, and local snacks have steady demand."},
    ],
    "RETAIL": [
        {"name": "Home delivery service", "opportunity": "high", "reason": "Elderly and busy households benefit from phone/WhatsApp ordering."},
        {"name": "Agricultural input supply", "opportunity": "high", "reason": "Seeds, fertilizers, and pest control products are essential for farming communities."},
        {"name": "Monthly grocery kit bundling", "opportunity": "medium", "reason": "Bulk kits at wholesale parity reduce household shopping trips."},
    ],
    "TEXTILES_TAILORING": [
        {"name": "School uniform stitching contracts", "opportunity": "high", "reason": "Schools in the catchment create recurring bulk uniform demand."},
        {"name": "Boutique blouse and festival wear", "opportunity": "medium", "reason": "Wedding and festival seasons create seasonal premium demand."},
        {"name": "Readymade local nightwear", "opportunity": "medium", "reason": "Low-cost readymade clothing fills a daily-wear convenience gap."},
    ],
    "POULTRY": [
        {"name": "Fresh farm-gate broiler at weekly haat", "opportunity": "high", "reason": "Direct farm-to-market supply at haats eliminates middleman costs."},
        {"name": "Free-range desi egg production", "opportunity": "high", "reason": "Premium desi eggs command 50-80% higher prices than farm eggs."},
        {"name": "Poultry litter for organic farming", "opportunity": "medium", "reason": "By-product monetization supplements core poultry income."},
    ],
    "AGRICULTURE": [
        {"name": "Quality seed and nursery supply", "opportunity": "high", "reason": "Local availability of certified seeds reduces farmer travel."},
        {"name": "Farm mechanization rental", "opportunity": "medium", "reason": "Small farmers benefit from shared tractor/harvester access."},
        {"name": "Organic input supply hub", "opportunity": "medium", "reason": "Growing demand for bio-fertilizers and organic pest control."},
    ],
    "LIVESTOCK": [
        {"name": "Improved breed supply", "opportunity": "high", "reason": "Access to better breeds improves farmer productivity and income."},
        {"name": "Animal feed and supplement supply", "opportunity": "high", "reason": "Quality feed availability is a common bottleneck in rural livestock."},
        {"name": "Veterinary first-aid services", "opportunity": "medium", "reason": "Basic veterinary care reduces livestock mortality."},
    ],
    "TRANSPORT": [
        {"name": "E-rickshaw passenger service", "opportunity": "high", "reason": "Low operating cost and growing rural mobility demand."},
        {"name": "Agricultural produce transport to mandi", "opportunity": "high", "reason": "Farmers need reliable transport for perishable produce."},
        {"name": "School transport service", "opportunity": "medium", "reason": "Growing school enrollment creates commute demand."},
    ],
    "HANDICRAFT": [
        {"name": "Online marketplace presence", "opportunity": "high", "reason": "Digital channels expand market beyond local geography."},
        {"name": "Modern design workshops", "opportunity": "medium", "reason": "Contemporary designs attract urban and export buyers."},
        {"name": "Raw material supply hub", "opportunity": "medium", "reason": "Reliable raw material access improves production consistency."},
    ],
    "SERVICES": [
        {"name": "Mobile and smartphone repair", "opportunity": "high", "reason": "Growing smartphone penetration creates steady repair demand."},
        {"name": "Digital services hub", "opportunity": "high", "reason": "Printing, online applications, and digital payments serve multiple needs."},
        {"name": "Solar installation and maintenance", "opportunity": "medium", "reason": "Government solar push creates installation and service demand."},
    ],
}


class OpportunityAgent(BaseAgent):
    prompt_file = "opportunity_detection.txt"
    output_model = OpportunityResult
    system_prompt = (
        "You are a rural market opportunity analyst for India. "
        "Identify specific market gaps and niches. "
        "Return ONLY valid JSON. Never invent market conditions."
    )

    def fallback(self, **kwargs: Any) -> dict:
        data: AssessmentInput = kwargs.get("data")
        cat = data.business_category.value

        gaps = _DEFAULT_GAPS.get(cat, [
            {"name": "Quality and reliability differentiation", "opportunity": "medium", "reason": "Informal competitors often lack consistency."},
            {"name": "Doorstep customer service", "opportunity": "medium", "reason": "Convenience-based differentiation in rural markets."},
            {"name": "Bundled complementary services", "opportunity": "low", "reason": "Adding value beyond core product attracts diverse customers."},
        ])

        return {"market_gaps": gaps}
