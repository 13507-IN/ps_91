# UdyamSetu AI

**Hyper-local enterprise intelligence and credit-readiness support for rural entrepreneurs.**

UdyamSetu helps a first-time entrepreneur figure out one simple thing: *is this business going to work where I live, can I actually afford it, and what do I do next?*

It takes three inputs — a location, how much capital the person can put in, and a business idea (or just a broad category) — and turns that into a local market assessment, a financial plan, a risk check, and a step-by-step path toward getting a loan.

One thing worth saying up front: **this is not a chatbot.** It's a dashboard. Users answer structured questions and the AI does its work in the background — analyzing data, estimating markets, and writing up recommendations. The interface stays predictable.

---

## Why this exists

Government schemes offer cheap credit so that people from marginalized and rural communities can start income-generating businesses. That part works. But having access to a loan and running a successful business are two very different things, and most first-time entrepreneurs don't have good information to fall back on.

Two problems dominate:

**1. No real local business intelligence.** People usually pick a business because a relative did it, a friend suggested it, or it works in the nearest town. None of that tells you whether it will work in *your* village. Population, purchasing power, competition, supply chains, roads, raw material availability, seasonality — all of this changes the answer. A dairy that thrives in one village can flop 20 km away.

**2. Low financial literacy.** Most beneficiaries struggle with basic concepts like project cost, margin contribution, interest, EMI, moratorium, working capital, and operating expenses. When you don't understand the money side, it's easy to pick a business model that was never financially viable to begin with.

That's the gap UdyamSetu is trying to fill.

---

## What it does

Inputs:

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

The platform analyzes the market around the entrepreneur's location using a configurable catchment area — 5 km, 10 km, or travel-time-based zones. It looks at population, households, demographics, nearby villages, roads, markets, institutions, existing businesses, agriculture, livestock, and infrastructure.

### 2. Formal + informal business mapping

Formal sources (UDYAM/MSME registrations, cooperatives, government institutions, public datasets) are combined with informal data — local milk sellers, home-based businesses, small vendors, mechanics, seasonal food processors. These rarely appear in any database, but they're the real competition in a rural market.

A core assumption here: **absence from a database does not mean the business doesn't exist.**

### 3. Opportunity discovery

Beyond counting competitors, the platform asks *what's missing from this market?* If the dairy market is well served on plain milk but nothing does doorstep delivery or paneer, the recommendation becomes **"dairy + paneer + doorstep delivery"** instead of just "start a dairy."

### 4. Market gap analysis

Demand is estimated and compared against existing supply (formal + informal + community-reported):

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

A business shouldn't be judged only on ideal assumptions. Users can simulate scenarios like raw material +15%, demand −20%, selling price −10%, transport +25%, or seasonal slumps, and see whether the business still survives the EMI.

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

### 12. Confidence-aware output

Every important figure is tagged with source and confidence, and labeled as one of:

- **Observed** — from a reliable source
- **Reported** — submitted by a local contributor
- **Inferred** — estimated from multiple signals

So an estimate might look like: `7 verified businesses + 3 community reports + 8–17 AI estimate = 18–27 competitors, confidence: MEDIUM`.

### 13. Action plan

The output ends with concrete next steps, not just a score — e.g., a 30-day plan: validate local demand, identify suppliers, collect equipment quotes, estimate working capital, reserve margin capital, prepare documents.

---

## Data

**Official datasets** — Census, LGD, UDYAM/MSME, Livestock Census, crop production, AGMARKNET prices, HCES, PLFS, PMGSY roads, food processing stats, cold storage, UDISE+, rural health, NDDB.

**Local data** — gathered via community reporting, household surveys, field workers, SHGs, NGOs, and CSC operators.

**Derived data** — demand estimation, supply estimation, market gap, informal business estimation, competition density, opportunity score, viability score, and risk score.

Over time we want to build our own proprietary datasets: a local enterprise dataset (with verification status and confidence per record), a household demand dataset, a retail price dataset, and input-cost datasets. Eventually, a business-outcome dataset — what businesses actually made, who survived, why they closed — so the feasibility model can be measured against reality and improved.

This last one is the whole long-term edge: nobody else is tracking actual outcomes at this level.

---

## Architecture

```
User → Frontend/PWA → API Gateway
                         ├── Market Engine ── PostGIS
                         ├── Financial Engine ── Rule Engine
                         └── AI Engine ── RAG / LLM
                                     ↓
                              Data layer (Census, LGD, UDYAM,
                              livestock, crops, roads, community
                              data, surveys…)
```

On the AI side, there's a deliberate split:

- **AI handles:** natural language, multilingual processing, business classification, opportunity discovery, SWOT, risk and recommendation explanations, report generation, data interpretation.
- **Deterministic code handles:** loan math, EMI, eligibility, scheme routing, limits, interest, tenure, moratorium, cash flow, break-even, and financial ratios.

---

## Tech stack

- **Frontend:** React / Next.js, TypeScript, Tailwind, charting + maps, PWA
- **Backend:** Python + FastAPI, PostgreSQL + PostGIS, Redis, background workers
- **AI:** LLM, RAG, embeddings, vector DB, speech-to-text/text-to-speech, classification and demand-estimation models
- **Geospatial:** PostGIS + OpenStreetMap + government GIS, eventually travel-time catchments

Repository is split into `frontend/`, `backend/`, `ai-service/`, `data/`, `geospatial/`, `financial/`, and `docs/`.

---

## MVP scope

Start with a handful of business categories: **dairy, food processing, retail, textiles/tailoring, poultry.**

Minimum inputs: location, available capital, business category. Optional: experience, available land, equipment, expected working hours.

Outputs across market (population, households, catchment, accessibility), competition (known businesses, density, reports), opportunity (gap, niches, recommended model), financial (project cost, contribution, loan, scheme, interest, tenure, EMI), risk (major risks, stress test, score), decision (proceed / modify / insufficient data), and action (next steps, funding readiness).

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

## Status

**Under development.** Current focus is data architecture, the geography/location engine, the market intelligence engine, the informal business data model, the financial and scheme rule engines, the AI recommendation engine, confidence scoring, dashboard UI, and MVP validation.

---

*The one-sentence version: UdyamSetu turns a rural entrepreneur's location, capital, and business idea into a market assessment, financial plan, risk analysis, and funding-readiness roadmap — and never confuses what it knows with what it estimates.*