# AI Microservice Interface Contract

> **Target Audience**: Python AI Engineering Team  
> **Backend Consumer**: Fastify Node.js Backend (`backend/src/modules/ai/ai.client.ts`)  
> **Default Service URL**: `http://localhost:8000`  
> **Protocol**: HTTP / JSON  
> **Timeout**: 30,000 ms  

---

## 1. Overview

The UdyamSetu backend uses a **hybrid architecture**:
- **Deterministic calculations** (loan amounts, EMI, scheme rules, PostGIS geospatial queries) are executed natively by the Node.js backend.
- **Cognitive & analytical tasks** (unstructured text classification, local informal demand/supply estimation, opportunity niche discovery, SWOT & explainable recommendations) are delegated to the Python AI service.
- If the Python microservice is offline or times out, the backend falls back gracefully to built-in rule-based heuristics.

---

## 2. Endpoints & Schemas

### 2.1 `POST /ai/classify-business`
Classifies unstructured user input into a standardized business category.

**Request:**
```json
{
  "idea": "I want to set up 4 cows and sell milk and homemade paneer to nearby tea stalls"
}
```

**Response (200 OK):**
```json
{
  "category": "DAIRY",
  "subcategory": "Dairy & Milk Products",
  "confidence": 0.94,
  "reasoning": "Detected livestock ownership and dairy value-addition (milk and paneer production)."
}
```

---

### 2.2 `POST /ai/demand-estimate`
Estimates local consumer demand given catchment demographics.

**Request:**
```json
{
  "businessCategory": "DAIRY",
  "totalPopulation": 4500,
  "totalHouseholds": 950,
  "avgLiteracyRate": 74.2,
  "nearbyTownDistanceKm": 8.5
}
```

**Response (200 OK):**
```json
{
  "estimatedAnnualDemandUnits": 518300,
  "estimatedDailyDemandUnits": 1420,
  "unit": "Litres of Milk",
  "confidence": "HIGH",
  "keyDrivers": [
    "950 households with typical consumption of 1.5L/day",
    "Moderate proximity to Krishnanagar town creating transit demand",
    "High tea-stall density in nearby Gram Panchayat hat"
  ]
}
```

---

### 2.3 `POST /ai/opportunity-discover`
Identifies unserved market gaps, local niches, and recommended business models.

**Request:**
```json
{
  "businessCategory": "DAIRY",
  "existingCompetitors": 4,
  "estimatedDemandUnits": 1420,
  "topCrops": ["Paddy", "Jute", "Mustard"],
  "livestockCount": 620
}
```

**Response (200 OK):**
```json
{
  "marketGaps": [
    "Morning doorstep delivery in residential areas",
    "Hygienic fresh paneer packaging for sweet shops",
    "Cattle feed and mineral mixture distribution"
  ],
  "potentialNiches": [
    "Morning doorstep delivery",
    "Fresh paneer packaging"
  ],
  "recommendedModel": "Hybrid Dairy + Doorstep Milk Delivery + Sweet-shop Wholesale",
  "opportunityScore": 84
}
```

---

### 2.4 `POST /ai/risk-assess`
Evaluates enterprise, operational, and credit risks.

**Request:**
```json
{
  "businessCategory": "DAIRY",
  "projectCost": 400000,
  "loanAmount": 360000,
  "monthlyEmi": 7560,
  "postEmiCashflow": 18440
}
```

**Response (200 OK):**
```json
{
  "riskFactors": [
    {
      "name": "Summer Milk Yield Decline",
      "probability": "HIGH",
      "impact": "MEDIUM",
      "mitigation": "Supplement green fodder with silage and provide adequate heat shelter for cattle."
    },
    {
      "name": "Feed Price Volatility",
      "probability": "MEDIUM",
      "impact": "HIGH",
      "mitigation": "Form bulk procurement pacts with local oil expeller mills for mustard cake."
    }
  ],
  "overallRiskScore": 28,
  "riskRating": "LOW"
}
```

---

### 2.5 `POST /ai/recommend`
Generates comprehensive synthesis and explainable viability recommendations.

**Request:**
```json
{
  "businessCategory": "DAIRY",
  "businessIdea": "Dairy unit with 4 cows and delivery",
  "opportunityScore": 84,
  "financialViabilityScore": 82,
  "riskScore": 28,
  "matchedScheme": "PMMY MUDRA Kishore"
}
```

**Response (200 OK):**
```json
{
  "decision": "PROCEED",
  "viabilityScore": 81,
  "summary": "Highly promising enterprise in this Nadia catchment area. Low competition saturation and stable baseline consumer demand support a sustainable operating margin.",
  "strengths": [
    "Catchment population of 4,500 generates sufficient daily milk deficit",
    "PMMY MUDRA Kishore offers collateral-free term credit at viable 9.5% interest",
    "Entrepreneur possesses 10% required margin money"
  ],
  "weaknesses": [
    "Summer yield seasonality requires 30-day working capital cushion"
  ],
  "recommendedNextStep": "Obtain two written quotations for milch cows and submit PMMY dossier at local bank."
}
```

---

### 2.6 `POST /ai/action-plan`
Generates 30-day funding readiness and execution roadmap.

**Request:**
```json
{
  "businessCategory": "DAIRY",
  "loanAmount": 360000,
  "schemeName": "Pradhan Mantri MUDRA Yojana (Kishore)"
}
```

**Response (200 OK):**
```json
{
  "planDurationDays": 30,
  "milestones": [
    {
      "phase": "Phase 1: Demand & Supplier Validation",
      "dayRange": "Days 1–7",
      "tasks": [
        "Survey 20 neighbouring households for morning milk subscription commitments",
        "Inspect local cattle hats and contact reliable livestock breeders"
      ]
    },
    {
      "phase": "Phase 2: Equipment & Animal Quotations",
      "dayRange": "Days 8–15",
      "tasks": [
        "Obtain formal veterinary health certificates and price quotation for 4 milch cows",
        "Complete online Udyam registration certificate"
      ]
    },
    {
      "phase": "Phase 3: Scheme Application",
      "dayRange": "Days 16–23",
      "tasks": [
        "Submit MUDRA Kishore application to nearest Gramin Bank branch",
        "Attach Udyam certificate, DPR, and quotation documents"
      ]
    },
    {
      "phase": "Phase 4: Setup & Launch",
      "dayRange": "Days 24–30",
      "tasks": [
        "Prepare cattle shed and secure fodder supply",
        "Begin distribution to first 15 confirmed subscribers"
      ]
    }
  ],
  "fundingReadinessChecklist": [
    "Aadhaar Card",
    "PAN Card",
    "Bank Account 6-month statement",
    "Panchayat Trade NOC",
    "Machinery / Cattle Quotation",
    "Udyam Registration Certificate"
  ]
}
```
