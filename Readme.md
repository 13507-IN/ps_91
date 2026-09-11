# ArthSetu

### Hyper-Local Enterprise Intelligence & Credit Readiness Platform for Rural Entrepreneurs

> **From a business idea to a data-backed, financially feasible enterprise plan.**

---

## 📌 Overview

**UdyamSetu AI** is an AI-powered decision-support platform designed to help rural and semi-urban entrepreneurs evaluate business opportunities, understand their local market, calculate financing requirements, assess risks, and prepare for institutional funding.

The platform combines:

* 🗺️ Hyper-local geospatial intelligence
* 📊 Market and demographic data
* 🏪 Formal and informal business discovery
* 📈 Demand and supply estimation
* 💰 Financial modelling
* 🏦 Government scheme routing
* 🤖 AI-powered recommendations
* ⚠️ Risk and stress analysis
* 🌐 Multilingual and voice-enabled interaction

UdyamSetu is **not designed as a chatbot**.

Instead, users interact with a structured **Business Intelligence & Decision-Support Dashboard**, while AI operates behind the scenes to analyze data and generate recommendations.

---

# 🎯 Problem

Government schemes provide concessional credit to help marginalized communities establish income-generating enterprises.

However, access to capital does not guarantee business success.

Many first-time rural entrepreneurs face two fundamental problems:

### 1. Lack of localized business intelligence

Entrepreneurs often select businesses based on:

* Anecdotal success
* Advice from relatives/friends
* Businesses that work in nearby towns
* Personal assumptions
* Limited understanding of local demand

A business that succeeds in one village may fail in another because of differences in:

* Population
* Purchasing power
* Competition
* Supply chain
* Infrastructure
* Raw-material availability
* Transportation
* Seasonality

### 2. Lack of financial literacy

Many beneficiaries struggle to understand:

* Margin contribution
* Project cost
* Loan amount
* Interest
* EMI
* Moratorium
* Repayment period
* Working capital
* Operating expenses

This can result in entrepreneurs choosing financially unsuitable business models.

---

# 💡 Our Solution

UdyamSetu AI converts three basic inputs:

```
Location
  + Available capital
  + Business category / idea
```

Outputs, roughly in order:

```
Local market picture
  → Opportunity analysis
  → Business model suggestion
  → Financial feasibility
  → Risk assessment
  → Stress-test / simulation
  → Viability score
  → Action plan
  → Funding readiness
```

The end goal is to answer: **"Is this business viable in this locality, can I financially support it, what risks will I face, and what should I do next?"**

---

## Core features

### 1. Hyper-local market intelligence

The platform analyzes the entrepreneur's geographical market using a configurable catchment area such as:

* 5 km
* 10 km
* Travel-time based zones

It analyzes:

* Population
* Households
* Demographics
* Nearby villages
* Roads
* Markets
* Institutions
* Existing businesses
* Agricultural activity
* Livestock
* Infrastructure

---

## 2. Local Business & Competitor Mapping

UdyamSetu combines formal business data with community intelligence.

### Formal sources

Examples:

* UDYAM/MSME registrations
* Cooperatives
* Government institutions
* Public business datasets

### Informal sources

Examples:

* Local milk sellers
* Home-based businesses
* Small vendors
* Local mechanics
* Informal food processors
* Seasonal businesses

The system does **not** assume that the absence of a business from a database means that the business does not exist.

---

# 🏘️ The Invisible Rural Economy

One of the biggest challenges in rural market analysis is that many businesses are not formally registered.

For example:

> A farmer owns six cows and sells milk to twenty nearby households.

That business may not appear in:

* Google Maps
* UDYAM
* MSME databases
* Business directories

Therefore, UdyamSetu uses a multi-source approach:

```text
Government Data
      +
Geospatial Data
      +
Community Reports
      +
Household Surveys
      +
Demand Signals
      +
AI Inference
      ↓
Local Market Model
```

This allows the system to estimate the structure of the local informal economy without pretending that every business is directly observable.

---

# 🔍 3. Opportunity Discovery

UdyamSetu does more than count competitors.

It attempts to identify:

> **What is missing from this market?**

Example:

```text
Existing Dairy Market

Milk Retail                 ✓
Basic Dairy Products        ✓

Potential Market Gaps

Doorstep Delivery           HIGH
Paneer Production           HIGH
Institutional Supply        MEDIUM
Packaged Curd               MEDIUM
Premium Products            LOW
```

The platform could therefore recommend:

> **Dairy + Paneer + Doorstep Delivery**

instead of simply saying:

> "Start a dairy business."

---

# 📊 4. Market Gap Analysis

The platform estimates the difference between local demand and existing supply.

```text
Market Gap =
Estimated Demand - Estimated Existing Supply
```

Example:

```
Estimated demand            1,800 L/day
Known supply                  950 L/day
Estimated informal supply     650 L/day
Potential unaccounted gap     200 L/day
```

Since rural data is incomplete, results always come with a confidence level.

### 5. Feasibility scoring

Each business idea is scored across demand, competition, supply, pricing, raw material availability, infrastructure, labour, capital requirement, profit potential, and risk — then a total out of 100. Thresholds are configurable.

### 6. Financial calculator

Working backwards from the entrepreneur's margin capital:

```
Project cost = Available margin / 10%
Loan = Project cost × 90%
```

So ₹1,00,000 in margin capital implies roughly a ₹10,00,000 project with a ₹9,00,000 loan — *before* scheme limits kick in. The theoretical number is never treated as the final eligible project cost; scheme ceilings and eligibility rules are applied afterward.

### 7. Scheme auto-selection

A deterministic rule engine routes the project to the right scheme based on project cost (micro vs. term loan), then determines maximum loan, interest, tenure, moratorium, and repayment structure.

**Important rule: the LLM never decides financial eligibility.** Scheme rules live as versioned structured configuration and are processed by code — the AI only explains the result.

### 8. EMI & repayment engine

Standard EMI math, plus total interest, principal repayment, quarterly views, moratorium handling, cash-flow projections, working capital, and break-even analysis. The official scheme rules always take precedence.

### 9. Stress testing

A business should not be evaluated only under ideal assumptions.

UdyamSetu allows users to simulate scenarios such as:

```text
Raw Material Cost +15%
Demand -20%
Selling Price -10%
Transport Cost +25%
Seasonal Demand Decline
```

Example:

```text
                     BASE CASE

Revenue              ₹1,20,000
Operating Cost          ₹83,000
Operating Surplus       ₹37,000
EMI                     ₹14,000
Post-EMI Cash           ₹23,000
```

The system evaluates whether the business remains financially sustainable under different scenarios.

### 10. Risk analysis

Identifies things like seasonal demand, raw-material price volatility, supply-chain disruption, transport problems, single-buyer dependency, working-capital shortages, and raw-material scarcity — with probability/impact ratings.

### 11. AI recommendations with reasoning

The AI pulls together demographics, business data, agriculture, livestock, pricing, infrastructure, demand estimates, competition, and the financial + risk models, and produces a recommendation that explains *why* it was made:

```
✓ High estimated local demand
✓ Moderate competitor density
✓ Suitable capital requirement
⚠ Seasonal supply risk
⚠ Local price data has medium confidence
```

---

# 🎯 13. Confidence-Aware Intelligence

Because rural data is incomplete, UdyamSetu explicitly distinguishes:

### Observed

Directly obtained from a reliable source.

```text
7 registered MSMEs
```

### Reported

Submitted by a local/community contributor.

```text
3 local milk sellers reported
```

### Inferred

Estimated from multiple signals.

```text
Estimated additional sellers:
8–17
```

Every important output should contain:

```text
Value
Source
Timestamp
Confidence
```

Example:

```text
Estimated Dairy Competitors

Verified Businesses        7
Community Reports          3
AI Estimate                8–17

Overall Estimate           18–27

Confidence                 MEDIUM
```

---

# 🗺️ 14. Market Digital Twin

The long-term core of UdyamSetu is a **Local Market Digital Twin**.

It combines:

```text
Demographics
      +
Supply
      +
Demand
      +
Competition
      +
Prices
      +
Infrastructure
      +
Seasonality
      +
Financial Data
      ↓
LOCAL MARKET DIGITAL TWIN
```

This represents the best available approximation of the local economic environment.

---

# 🧾 15. Action Plan

The system should not stop at a feasibility score.

It should provide concrete next steps.

Example:

```text
30-DAY ACTION PLAN

[ ] Validate local demand
[ ] Identify suppliers
[ ] Collect equipment quotations
[ ] Validate selling price
[ ] Estimate working capital
[ ] Reserve margin capital
[ ] Prepare documents
[ ] Prepare financing application
```

This creates a transition from:

**Business Idea → Business Validation → Funding Readiness**

---

# 📚 Data Strategy

UdyamSetu uses three major data categories.

## 1. Official Data

Examples:

* Census
* LGD
* UDYAM
* Livestock Census
* Crop Production
* AGMARKNET
* HCES
* PLFS
* PMGSY/Rural Roads
* Food Processing data

---

## 2. Local Data

Collected through:

* Community reporting
* Household surveys
* Local entrepreneurs
* Field workers
* SHGs
* NGOs
* CSC operators
* Other authorized contributors

---

## 3. Derived Data

Generated through analytical models:

* Demand estimation
* Supply estimation
* Market gap
* Informal business estimation
* Competition density
* Opportunity score
* Viability score
* Risk score

---

# 🗃️ Primary Public Data Sources

| Dataset                                                                                                            | Purpose                              |
| ------------------------------------------------------------------------------------------------------------------ | ------------------------------------ |
| [Local Government Directory](https://www.data.gov.in/catalog/local-government-directory-lgd)                       | Administrative geography             |
| [Census Population Finder](https://censusindia.gov.in/census.website/data/population-finder)                       | Population and households            |
| [Census Village Amenities](https://www.data.gov.in/catalog/village-amenities-census-2011)                          | Village infrastructure               |
| [UDYAM / MSME](https://www.data.gov.in/catalog/udyam-registration-msme-registration)                               | Formal businesses                    |
| [Livestock Census](https://www.dahd.gov.in/schemes/programmes/animal-husbandry-statistics)                         | Livestock and dairy potential        |
| [Crop Production](https://www.data.gov.in/catalog/district-wise-season-wise-crop-production-statistics-0)          | Agricultural supply                  |
| [AGMARKNET](https://www.data.gov.in/catalog/current-daily-price-various-commodities-various-markets-mandi)         | Commodity prices                     |
| [PLFS](https://microdata.gov.in/nada/index.php/catalog/PLFS)                                                       | Employment and occupations           |
| [HCES](https://microdata.gov.in/nada/index.php/catalog/CEXP)                                                       | Household consumption                |
| [PMGSY / Rural Roads](https://pmgsy.nic.in/database-and-masterplan-rural-roads)                                    | Rural connectivity                   |
| [MoFPI Statistics](https://www.mofpi.gov.in/documents/statistics)                                                  | Food processing                      |
| [Cold Storage Data](https://www.data.gov.in/resource/stateut-wise-distribution-cold-storages-country-31-03-2024-1) | Storage infrastructure               |
| [UDISE+](https://udiseplus.gov.in/)                                                                                | Schools and education infrastructure |
| [Rural Health Statistics](https://www.data.gov.in/catalog/rural-health-statistics-india)                           | Health infrastructure                |
| [NDDB National Database](https://www.nddb.coop/services/sectoral/national-database)                                | Dairy-sector intelligence            |

---

# 🏗️ Proprietary Data We Need to Build

The biggest long-term advantage of UdyamSetu will be its own hyper-local data layer.

## Local Enterprise Dataset

```text
Enterprise ID
Location
Village
Gram Panchayat
Block
District
Category
Subcategory
Products
Operating Status
Approximate Scale
Price Range
Seasonality
Source
Verification Status
Last Verified
Confidence
```

---

## Household Demand Dataset

```text
Location
Household Segment
Product
Quantity
Purchase Frequency
Preferred Supplier
Price Paid
Self Produced?
Seasonality
```

---

## Local Retail Price Dataset

```text
Product
Location
Seller
Price
Unit
Date
Source
Confidence
```

---

## Business Input Cost Dataset

```text
Location
Business Category
Equipment
Raw Material
Packaging
Rent
Electricity
Labour
Transport
Storage
Maintenance
Date
Typical Cost
Source
```

---

## Business Outcome Dataset

Eventually:

```text
Business Type
Location
Initial Investment
Loan
Revenue
Operating Cost
Profit
Employees
Months Active
Business Status
Closure Reason
Repayment Status
```

This dataset can eventually be used to evaluate and improve the feasibility model.

---

## Architecture

```text
                         USER
                           |
                           v
                ┌───────────────────┐
                │ Frontend / PWA     │
                └─────────┬─────────┘
                          |
                          v
                ┌───────────────────┐
                │    API Gateway    │
                └─────────┬─────────┘
                          |
          ┌───────────────┼────────────────┐
          |               |                |
          v               v                v
   ┌────────────┐  ┌────────────┐  ┌────────────┐
   │   Market   │  │ Financial  │  │     AI     │
   │   Engine   │  │   Engine   │  │   Engine   │
   └─────┬──────┘  └─────┬──────┘  └─────┬──────┘
         |               |                |
         v               v                v
   ┌────────────┐  ┌────────────┐  ┌────────────┐
   │  PostGIS   │  │ Rule Engine│  │ RAG / LLM  │
   └─────┬──────┘  └────────────┘  └─────┬──────┘
         |                               |
         └──────────────┬────────────────┘
                        |
                        v
              ┌─────────────────────┐
              │     DATA LAYER      │
              │                     │
              │ Census              │
              │ LGD                 │
              │ UDYAM               │
              │ Livestock           │
              │ Crops               │
              │ AGMARKNET            │
              │ HCES                │
              │ PLFS                │
              │ Roads               │
              │ Community Data      │
              │ Surveys             │
              └─────────────────────┘
```

---

# 🤖 AI Architecture

UdyamSetu uses a hybrid AI architecture.

```text
                       USER INPUT
                           |
                           v
                    NLP / Extraction
                           |
                ┌──────────┴──────────┐
                |                     |
                v                     v
         Structured Data           RAG
                |                     |
                └──────────┬──────────┘
                           v
                    Decision Engine
                     /           \
                    /             \
                   v               v
             Market Engine    Financial Engine
                    \             /
                     \           /
                      v         v
                  Feasibility Model
                           |
                           v
                   LLM Report Layer
```

### AI is responsible for:

* Natural-language understanding
* Multilingual processing
* Business classification
* Opportunity discovery
* SWOT generation
* Risk explanation
* Recommendation explanation
* Report generation
* Data interpretation

### Deterministic systems are responsible for:

* Loan calculation
* EMI
* Eligibility
* Scheme routing
* Scheme limits
* Interest
* Tenure
* Moratorium
* Cash flow
* Break-even
* Financial ratios

---

# 🛠️ Technology Stack

## Frontend

Recommended:

* React
* Next.js
* TypeScript
* Tailwind CSS
* Charting library
* Map visualization
* PWA support

---

## Backend

Recommended:

* Python
* FastAPI
* PostgreSQL
* PostGIS
* Redis
* Background workers

---

## AI

Potential components:

* LLM
* RAG
* Embedding model
* Vector database
* Multilingual NLP
* Speech-to-text
* Text-to-speech
* Classification models
* Recommendation models
* Demand estimation models

---

## Geospatial

Recommended:

```text
PostGIS
+
OpenStreetMap / permitted sources
+
Government GIS data
```

The platform should eventually support:

```text
Radius-based analysis
+
Road-network analysis
+
Travel-time catchments
```

---

# 📁 Suggested Repository Structure

```text
udyamsetu/
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── features/
│   ├── maps/
│   ├── financial/
│   └── dashboard/
│
├── backend/
│   ├── api/
│   ├── models/
│   ├── schemas/
│   ├── services/
│   ├── repositories/
│   └── workers/
│
├── ai/
│   ├── prompts/
│   ├── rag/
│   ├── inference/
│   ├── classification/
│   ├── recommendations/
│   └── multilingual/
│
├── financial/
│   ├── emi/
│   ├── schemes/
│   ├── eligibility/
│   ├── cashflow/
│   └── simulation/
│
├── data/
│   ├── ingestion/
│   ├── cleaning/
│   ├── pipelines/
│   ├── validation/
│   └── schemas/
│
├── geospatial/
│   ├── boundaries/
│   ├── roads/
│   ├── catchments/
│   └── competitor_mapping/
│
├── docs/
│   ├── architecture/
│   ├── datasets/
│   ├── api/
│   └── decisions/
│
└── README.md
```

---

# 👥 Team Responsibilities

## Frontend Engineer

Responsible for:

* User onboarding
* Location selection
* Business selection
* Dashboard
* Market visualization
* Maps
* Opportunity analysis
* Financial simulator
* Risk dashboard
* Action plan
* Responsive/mobile UI

---

## Backend Engineer

Responsible for:

* API architecture
* Database
* PostGIS
* Authentication
* Data ingestion
* Data pipelines
* Market APIs
* Financial APIs
* Scheme engine
* Business storage
* Competitor storage
* Report generation
* Caching

---

## AI Engineer

Responsible for:

* NLP
* Multilingual processing
* Business classification
* RAG
* Opportunity detection
* Demand estimation
* Supply estimation
* Competitor inference
* SWOT
* Risk reasoning
* Recommendation engine
* Confidence scoring

---

# 🧪 MVP Scope

The first version should focus on a limited number of business categories.

Recommended:

```text
Dairy
Food Processing
Retail
Textiles / Tailoring
Poultry
```

---

## MVP Inputs

```text
Location
Available Capital
Business Category
```

Optional:

```text
Business Experience
Available Land
Available Equipment
Expected Working Hours
```

---

## MVP Outputs

### Market

```text
Population
Households
Catchment
Accessibility
```

### Competition

```text
Known Businesses
Business Density
Community Reports
```

### Opportunity

```text
Market Gap
Potential Niches
Recommended Model
```

### Financial

```text
Project Cost
Own Contribution
Loan
Scheme
Interest
Tenure
EMI
```

### Risk

```text
Major Risks
Stress Test
Risk Score
```

### Decision

```text
PROCEED
MODIFY
INSUFFICIENT DATA
```

### Action

```text
Next Steps
Funding Readiness
```

---

## Principles we stick to

1. Never present inference as fact — always label observed / reported / inferred.
2. The LLM never decides financial eligibility. Rules and math stay deterministic.
3. Always show confidence, source, and timestamps on dynamic data.
4. Keep business risk separate from data uncertainty — a business can look promising while the underlying data is shaky.
5. Explain every major recommendation, not just hand out a score.
6. Never pretend to have complete rural market coverage. The honest goal is the best evidence-backed estimate available.

---

## What's next

- **Business discovery** — flip the flow: instead of "what do you want to start?", ask "which businesses are most suitable for you?" and rank them.
- **Community economic mapping** — let authorized local contributors map dairies, groceries, tailors, mechanics, vendors, etc., building a self-improving local map.
- **Outcome learning** — track predictions → started businesses → actual revenue/costs → survival, then feed that back into the model.
- **Institutional dashboard** — for government and channelizing agencies: funding demand, high-opportunity regions, market saturation, risk distribution, enterprise survival.

---

# 🎯 Impact Goals

UdyamSetu aims to:

### Reduce enterprise failure

Help beneficiaries choose businesses based on local evidence instead of assumptions.

### Improve financial understanding

Clearly explain:

```text
Own Contribution
+
Project Cost
+
Loan
+
Interest
+
Repayment
+
Working Capital
```

### Improve funding readiness

Help entrepreneurs understand what they need before applying for financing.

### Empower rural youth

Give first-time entrepreneurs access to structured business intelligence that would otherwise require professional consulting.

### Build grassroots economic intelligence

Gradually create a better representation of informal and hyper-local economic activity.

---

# 💡 Core Innovation

The central technical challenge is:

> **How can we build useful business intelligence when the rural economy is only partially observable?**

UdyamSetu addresses this by combining:

```text
Official Data
      +
Geospatial Data
      +
Community Intelligence
      +
Demand Signals
      +
AI Inference
      +
Financial Modelling
```

The result is a:

> **Probabilistic digital representation of a rural micro-market.**

The system knows the difference between:

**what it knows, what people report, and what it estimates.**

---

# 🏁 Final Product Definition

> **UdyamSetu AI is an AI-powered hyper-local enterprise decision-support platform that converts a rural entrepreneur's location, available capital, and business idea into a market feasibility assessment, financial plan, risk analysis, and funding-readiness roadmap.**

---

# 📌 Project Status

🚧 **Under Development**

Current priorities:

* [ ] Data architecture
* [ ] Geography and location engine
* [ ] Market intelligence engine
* [ ] Informal business data model
* [ ] Financial engine
* [ ] Scheme rule engine
* [ ] AI recommendation engine
* [ ] Confidence scoring
* [ ] Dashboard UI
* [ ] MVP validation

---

# 🧭 Development Philosophy

> **Don't tell an entrepreneur what business is popular.**
>
> **Show them what opportunity exists in their market, whether their capital is sufficient, what risks they face, and what they need to do next.**

---

## UdyamSetu AI

**From local opportunity → to validated enterprise → to funding readiness.**
