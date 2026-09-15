# ArthSetu (UdyamSetu AI)

### Hyper-Local Enterprise Intelligence & Credit Readiness Platform for Rural & Semi-Urban Entrepreneurs

> **From a business idea to a data-backed, financially feasible, and bankable enterprise plan.**

[![Next.js](https://img.shields.io/badge/Frontend-Next.js_14_(App_Router)-000000?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![Fastify](https://img.shields.io/badge/Backend-Fastify_v5-000000?style=for-the-badge&logo=fastify)](https://fastify.dev/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript_5.8-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/AI_&_ML-Python_3.11+-3776AB?style=for-the-badge&logo=python)](https://python.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL_w/_PostGIS-4169E1?style=for-the-badge&logo=postgresql)](https://postgis.net/)
[![TailwindCSS](https://img.shields.io/badge/Styling-TailwindCSS_v3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

---

## 📌 Table of Contents

1. [Executive Overview & Problem Statement](#-executive-overview--problem-statement)
2. [Core Technologies & Tech Stack](#-core-technologies--tech-stack)
3. [Repository File & Directory Structure](#-repository-file--directory-structure)
4. [Architectural Modules & Subsystems](#-architectural-modules--subsystems)
   - [4.1 Backend Modules (`backend/src/modules`)](#41-backend-modules)
   - [4.2 Financial & Scheme Engines (`backend/src/engine`)](#42-financial--scheme-engines)
   - [4.3 Ingestion Pipelines (`backend/src/ingestion`)](#43-ingestion-pipelines)
   - [4.4 AI Service Multi-Agent System (`ai-service/app`)](#44-ai-service-multi-agent-system)
   - [4.5 Machine Learning Pipelines (`ML/src`)](#45-machine-learning-pipelines)
5. [Core Implementations & Mathematical Logic](#-core-implementations--mathematical-logic)
   - [5.1 Deterministic Feasibility Scoring Engine](#51-deterministic-feasibility-scoring-engine)
   - [5.2 Financial Modelling & EMI Calculator](#52-financial-modelling--emi-calculator)
   - [5.3 Scheme Rule Evaluation Engine](#53-scheme-rule-evaluation-engine)
   - [5.4 Stress Testing & Sensitivity Analysis](#54-stress-testing--sensitivity-analysis)
   - [5.5 PostGIS Hyperlocal Geospatial Catchment Engine](#55-postgis-hyperlocal-geospatial-catchment-engine)
   - [5.6 Confidence-Aware Telemetry (Observed / Reported / Inferred)](#56-confidence-aware-telemetry)
6. [Frontend Page Details & User Journeys](#-frontend-page-details--user-journeys)
7. [Database Schema & Entity Relationships](#-database-schema--entity-relationships)
8. [API Endpoints Reference](#-api-endpoints-reference)
9. [Local Development & Setup Guide](#-local-development--setup-guide)

---

## 📌 Executive Overview & Problem Statement

Government credit schemes (such as **PMEGP**, **PM Mudra Yojana**, **PM-SVANidhi**, **PMFME**, and **Stand-Up India**) disburse concessional loans to foster grassroots self-employment. However, capital injection alone does not guarantee enterprise survival. Rural and semi-urban first-time entrepreneurs encounter severe barriers:

1. **Lack of Localized Market Intelligence**: Business ideas are typically copied from anecdotal town successes without evaluating village demographic scale, existing competition (formal and informal), raw material availability, transport links, and local purchasing power.
2. **Lack of Financial Literacy**: Beneficiaries frequently struggle with project costing, promoter contribution (margin capital), debt service coverage ratios (DSCR), working capital cycles, and moratorium periods.
3. **The Invisible Informal Economy**: Up to 70–80% of rural micro-enterprises (home dairies, village tailoring units, weekly hat vendors) do not exist in formal MSME or GST registries.

### The ArthSetu Solution

**ArthSetu** is an AI-backed hyper-local decision-support and credit readiness platform that transforms:
$$\text{Location (Village / GPS)} + \text{Available Margin Capital} + \text{Business Category / Idea}$$
into:
* 🗺️ **Geospatial Catchment Analysis** (Demographics, connectivity, infrastructure, and amenities)
* 🏪 **Competitor & Supply Discovery** (Formal UDYAM data + informal community intelligence)
* 📈 **Local Demand & Market Gap Quantification** (Estimating unmet supply in litres, kg, or units)
* 💰 **Deterministic Financial Feasibility & Bankable DPR Plan** (Project cost, loan routing, EMI schedule, working capital)
* 🏦 **Automated Scheme Routing** (Rule-engine matching against central and state government credit schemes)
* ⚠️ **Scenario Stress-Testing** (Assessing resilience against $\pm 20\%$ shifts in raw material cost, demand, and selling price)
* 🤖 **Explainable Multi-Agent AI Recommendations** (SWOT analysis, opportunity discovery, and 30-day execution roadmap)

> **Key Design Philosophy**: **Strict Separation of Deterministic Math and Generative AI**.  
> The Large Language Model (LLM) **never** computes loans, interest rates, eligibility criteria, or cash flows. Deterministic logic is executed with `Decimal.js` and `json-rules-engine` in Node.js/PostgreSQL. The AI operates as a cognitive layer to synthesize unstructured data, uncover market niches, explain risks, and produce actionable recommendations.

---

## 🛠️ Core Technologies & Tech Stack

| Domain | Technology | Version | Purpose / Details |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | **Next.js** | `14.2.35` | App Router, Server & Client Components, Dynamic Route Segmenting |
| **UI Library** | **React** | `18.3.x` | Declarative UI rendering, Custom Hooks, Suspense transitions |
| **Language** | **TypeScript** | `5.8.x` | Strict typing across client components, schemas, and API handlers |
| **Styling & Design** | **Tailwind CSS** | `3.4.1` | Utility-first responsive design, custom tricolor Indian civic color palette |
| **Icons & Animation** | **Lucide React** & **Framer Motion** | `^1.41` / `^13.2` | SVG icons and micro-interactions, accordion animations |
| **Interactive Maps** | **Leaflet** & **React-Leaflet** | `1.9.4` / `4.2.1` | OpenStreetMap rendering, dynamic buffer catchments, custom competitor pins |
| **Data Visualization** | **Chart.js** & **React-Chartjs-2** | `4.5.1` / `5.3.1` | Break-even line charts, cash-flow projections, stress test bar charts |
| **Form Management** | **React Hook Form** + **Zod** | `^7.87` / `^4.5` | Multi-step form validation, state persistence, schema checking |
| **Client State Cache**| **TanStack React Query** & **Zustand** | `^5.102` / `^5.0`| Async server-state caching, offline client session persistence |
| **Backend Framework** | **Fastify** | `5.2.2` | High-throughput asynchronous HTTP microframework |
| **Runtime** | **Node.js** | `>=20.0.0` | Modern ESM modules, native fetch, high-performance runtime |
| **ORM & Database** | **Prisma ORM** + **PostgreSQL** | `6.6.0` | Type-safe queries, relational schema migrations, connection pooling |
| **Spatial Engine** | **PostGIS Extension** | `3.x` | Spatial indexes, `ST_DWithin`, `ST_Distance`, `ST_MakePoint` spherical queries |
| **Caching & Queues** | **Upstash Redis** & **BullMQ** | `1.34` / `5.40` | Job queue workers for background data ingestion and AI synthesis caching |
| **Rule Engine** | **json-rules-engine** | `6.5.0` | Deterministic, versioned JSON rules for government loan scheme evaluation |
| **Financial Math** | **Decimal.js** | `10.5.0` | Arbitrary-precision decimal arithmetic avoiding IEEE-754 floating-point errors |
| **Security & Auth** | **Fastify JWT**, **BcryptJS**, **Helmet** | `9.0` / `3.0` | Stateless JWT access/refresh tokens, password hashing, CSP security headers |
| **API Docs** | **Fastify Swagger** + **Swagger UI** | `9.4` / `5.2` | OpenAPI 3.0 interactive documentation at `/documentation` |
| **AI Microservice** | **FastAPI** + **Uvicorn** | `0.115` / `0.34` | Python asynchronous web service exposing cognitive intelligence APIs |
| **AI LLM Providers** | **Google GenAI (Gemini)** & **Groq** | `1.16` / `0.25` | Gemini 1.5 Flash / Pro and Groq Llama 3 70B for fast cognitive inference |
| **Prompt Engineering**| **Jinja2** | `3.1.6` | Structured prompt templating with schema-enforced JSON guardrails |
| **ML Frameworks** | **Prophet**, **XGBoost**, **Scikit-learn**| Latest | Time-series commodity price forecasting and rural demand regression |

---

## 📁 Repository File & Directory Structure

```text
ps_91/
├── Readme.md                          # Master project documentation
├── package.json                       # Root workspace configuration
│
├── frontend/                          # Next.js 14 Web Application
│   ├── public/                        # Static assets, icons, manifest.json, sw.js
│   ├── src/
│   │   ├── app/                       # Next.js App Router Pages
│   │   │   ├── layout.tsx             # Root layout with GovHeaderBar, Footer, & Providers
│   │   │   ├── page.tsx               # Landing page with hero, statistics, & CTA
│   │   │   ├── not-found.tsx          # 404 handler
│   │   │   ├── components/            # Landing page UI sections
│   │   │   │   ├── HeroSection.tsx
│   │   │   │   ├── TrustStatsStrip.tsx
│   │   │   │   ├── PhotoGallerySection.tsx
│   │   │   │   ├── HowitWorksSection.tsx
│   │   │   │   ├── CategoryGridSection.tsx
│   │   │   │   ├── TrustDataSourcesStrip.tsx
│   │   │   │   └── LandingCTA.tsx
│   │   │   ├── login/page.tsx         # User authentication login view
│   │   │   ├── register/page.tsx      # User registration view
│   │   │   ├── assessment-wizard/     # 5-step feasibility assessment
│   │   │   │   ├── page.tsx
│   │   │   │   └── components/
│   │   │   │       ├── AssesmentWizardClient.tsx
│   │   │   │       ├── WizardProgress.tsx
│   │   │   │       ├── StepLocation.tsx
│   │   │   │       ├── LocationPickerMap.tsx
│   │   │   │       ├── StepBusiness.tsx
│   │   │   │       ├── StepCapital.tsx
│   │   │   │       └── StepReview.tsx
│   │   │   ├── dashboard/             # Core entrepreneur analytics dashboard
│   │   │   │   ├── page.tsx
│   │   │   │   └── components/PastAssessments.tsx
│   │   │   ├── feasibility-report/    # Full viability report & DPR exporter
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── schemes/               # Government schemes explorer
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── villages/              # Village demographic explorer
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── settings/page.tsx      # Language, profile, & user settings
│   │   │   └── admin/page.tsx         # Ingestion monitor & admin controls
│   │   ├── components/                # Shared UI Components
│   │   │   ├── AuthGuard.tsx          # Client-side route protection
│   │   │   ├── GovHeaderBar.tsx       # Tricolor national header & emblem
│   │   │   ├── govFooter.tsx          # Government portal footer links
│   │   │   ├── ConfidenceBadge.tsx    # OBSERVED / REPORTED / INFERRED badge
│   │   │   ├── SourceTag.tsx          # Dataset source attribution tag
│   │   │   ├── LanguagePickerModal.tsx# Multilingual switcher modal
│   │   │   ├── ChatBot/               # AI voice & text conversational assistant
│   │   │   │   ├── ChatBubble.tsx
│   │   │   │   ├── ChatWidget.tsx
│   │   │   │   └── QuickActions.tsx
│   │   │   ├── HyperlocalBusinessExplorer/ # Leaflet spatial explorer
│   │   │   │   ├── HyperlocalBusinessExplorer.tsx
│   │   │   │   └── HyperlocalLeafletMap.tsx
│   │   │   └── pwa/install-prompt.tsx # PWA install banner
│   │   ├── lib/                       # API clients, axios/fetch wrappers, utils
│   │   ├── styles/globals.css         # Tailwind directives & theme variables
│   │   └── types/                     # Shared TypeScript interfaces
│   ├── tailwind.config.ts             # Tailwind layout & custom color tokens
│   ├── next.config.mjs                # Next.js configuration
│   └── package.json                   # Frontend dependencies
│
├── backend/                           # Fastify Node.js Enterprise API
│   ├── prisma/
│   │   ├── schema.prisma              # PostgreSQL + PostGIS schema definition
│   │   ├── migrations/                # SQL migration scripts
│   │   └── seed.ts                    # Database seeder (Nadia District, WB)
│   ├── src/
│   │   ├── index.ts                   # Process bootstrapper & listener
│   │   ├── app.ts                     # Fastify application builder & plugins
│   │   ├── config/
│   │   │   ├── env.ts                 # Zod validated environment variables
│   │   │   └── constants.ts           # Business categories & system constants
│   │   ├── lib/
│   │   │   ├── errors.ts              # Custom AppError classes
│   │   │   └── utils.ts               # Geographic distance math, formatting
│   │   ├── plugins/                   # Fastify lifecycle plugins
│   │   │   ├── prisma.ts              # Prisma client decorator
│   │   │   ├── redis.ts               # Redis client decorator
│   │   │   ├── auth.ts                # Fastify JWT & user decorators
│   │   │   ├── rateLimit.ts           # IP-based rate limiter
│   │   │   └── swagger.ts             # OpenAPI / Swagger specs
│   │   ├── engine/                    # Deterministic Calculation Engines
│   │   │   ├── financial/             # Financial Modeling Engines
│   │   │   │   ├── projectCost.ts     # Total project cost breakdown
│   │   │   │   ├── emi.ts             # Reducing-balance EMI & interest schedules
│   │   │   │   ├── cashflow.ts        # 3-year cash-flow forecasting
│   │   │   │   ├── workingCapital.ts  # Operating cycle & working capital math
│   │   │   │   ├── breakeven.ts       # Break-even point (units & revenue)
│   │   │   │   └── stressTest.ts      # Multi-scenario sensitivity simulator
│   │   │   └── scheme/                # Scheme Evaluation Rule Engine
│   │   │       ├── types.ts           # Scheme definition interfaces
│   │   │       ├── ruleEngine.ts      # json-rules-engine orchestrator
│   │   │       ├── schemeEvaluator.ts # Ranking & loan capping evaluator
│   │   │       └── configs/           # JSON rule configurations
│   │   │           ├── pmegp.json     # PMEGP scheme rules & subsidies
│   │   │           ├── mudra.json     # Mudra Tarun/Kishore rules
│   │   │           ├── mudra_shishu.json # Mudra Shishu (micro) rules
│   │   │           ├── pm_svanidhi.json  # PM-SVANidhi street vendor rules
│   │   │           ├── standup_india.json# Stand-Up India (SC/ST/Women)
│   │   │           ├── cgtmse.json    # Credit guarantee fund rules
│   │   │           ├── clcss.json     # Credit linked capital subsidy
│   │   │           └── wb_bswa.json   # WB Bangla Swanirbhar Karma Prakalpa
│   │   ├── ingestion/                 # Public Dataset Ingestion Subsystem
│   │   │   ├── runner.ts              # CLI & automated pipeline runner
│   │   │   ├── types.ts               # Ingestion source records
│   │   │   ├── utils.ts               # Batch inserts & normalization
│   │   │   └── pipelines/
│   │   │       ├── lgd.pipeline.ts    # Local Government Directory parser
│   │   │       ├── census.pipeline.ts # Census 2011 demographics parser
│   │   │       ├── amenities.pipeline.ts # Village amenities & infrastructure
│   │   │       ├── udyam.pipeline.ts  # Formal MSME registry parser
│   │   │       ├── livestock.pipeline.ts # Animal Husbandry census parser
│   │   │       ├── crop.pipeline.ts   # Agricultural crop production
│   │   │       ├── agmarknet.pipeline.ts # Mandi commodity spot prices
│   │   │       └── roads.pipeline.ts  # PMGSY rural road connectivity
│   │   └── modules/                   # Fastify Domain Modules
│   │       ├── auth/                  # Register, Login, Refresh, Me
│   │       ├── user/                  # User profile & preferences
│   │       ├── admin/                 # Ingestion runner triggers & stats
│   │       ├── location/              # State, District, Block, Village queries
│   │       ├── market/                # Catchment demographics & competitors
│   │       ├── business/              # Formal & informal business CRUD
│   │       ├── scheme/                # Scheme catalog & manual evaluation
│   │       ├── financial/             # Standalone EMI & Cashflow endpoints
│   │       ├── feasibility/           # Unified analysis & report generation
│   │       ├── chat/                  # Conversational intelligence gateway
│   │       └── ai/                    # HTTP client to Python AI microservice
│   └── package.json
│
├── ai-service/                        # Python Cognitive AI Microservice
│   ├── app/
│   │   ├── main.py                    # FastAPI application & lifespan
│   │   ├── config.py                  # Pydantic Settings & API keys
│   │   ├── orchestrator.py            # Multi-agent analysis pipeline coordinator
│   │   ├── llm/                       # LLM Providers
│   │   │   ├── provider.py            # Abstract Base Provider & Fallbacks
│   │   │   ├── gemini.py              # Google GenAI (Gemini) implementation
│   │   │   └── groq_provider.py       # Groq (Llama 3) implementation
│   │   ├── agents/                    # Specialized Cognitive Agents
│   │   │   ├── base.py                # Base agent with retry & validation
│   │   │   ├── market.py              # Demand & market gap inference
│   │   │   ├── competition.py         # Informal competitor density estimator
│   │   │   ├── opportunity.py         # Niche discovery & business modeler
│   │   │   ├── pricing.py             # Mandi pricing trend analyzer
│   │   │   ├── risk.py                # Operational & supply risk analyst
│   │   │   ├── swot.py                # SWOT matrix generator
│   │   │   └── recommendation.py      # Final explainable verdict synthesizer
│   │   ├── engines/                   # Analytical Heuristic Scorers
│   │   │   ├── informal_estimator.py  # Demographic-to-informal seller ratio
│   │   │   ├── market_scorer.py       # Market gap scoring algorithm
│   │   │   ├── risk_scorer.py         # Compound risk weighting
│   │   │   └── viability_scorer.py    # Multi-factor feasibility model
│   │   ├── guardrails/                # Output Validation & Hallucination Defense
│   │   │   └── validator.py           # Pydantic schema validation & bounds checking
│   │   ├── prompts/                   # Jinja2 Prompt Templates
│   │   ├── routes/                    # API Route Handlers
│   │   │   ├── assessment.py          # Unified full assessment endpoint
│   │   │   └── granular.py            # Granular classification & demand endpoints
│   │   └── schemas/                   # Pydantic Request & Response models
│   ├── requirements.txt               # Python package dependencies
│   └── README.md
│
├── ML/                                # Machine Learning Research & Pipelines
│   ├── data/                          # Raw & processed datasets
│   ├── models/                        # Serialized models (.pkl / .json)
│   ├── src/
│   │   ├── commodity_forecasting/     # Mandi price forecasting
│   │   │   ├── data_loader.py         # Agmarknet time-series ingestion
│   │   │   ├── preprocessing.py       # Outlier filtering & log transforms
│   │   │   ├── train.py               # Prophet / XGBoost time-series training
│   │   │   ├── forecast.py            # Multi-horizon spot price forecaster
│   │   │   └── signals.py             # Buy/Sell recommendation flags
│   │   └── demand_prediction/         # Micro-market demand estimation
│   │       ├── feature_engineering.py # Household, literacy, & crop feature maps
│   │       ├── train.py               # HistGradientBoostingRegressor training
│   │       └── predict.py             # Demand consumption inference
│   ├── scripts/                       # CLI execution scripts
│   └── requirements.txt
│
└── docs/                              # Architecture Documentation
    └── api/
        └── ai-service-contract.md     # Node.js ↔ Python AI service contract
```

---

## 🏛️ Architectural Modules & Subsystems

```text
                                 ┌─────────────────────────────────┐
                                 │       USER / ENTREPRENEUR       │
                                 └────────────────┬────────────────┘
                                                  │
                                                  ▼
                                 ┌─────────────────────────────────┐
                                 │    Next.js 14 Web Application   │
                                 │   (Tailwind, Leaflet, Chart.js) │
                                 └────────────────┬────────────────┘
                                                  │ HTTP / REST
                                                  ▼
                                 ┌─────────────────────────────────┐
                                 │    Fastify Node.js API Gateway  │
                                 │    (Auth, RateLimit, Swagger)   │
                                 └────────┬───────────────┬────────┘
                                          │               │
                  ┌───────────────────────┘               └───────────────────────┐
                  ▼                                                               ▼
  ┌───────────────────────────────┐                               ┌───────────────────────────────┐
  │  DETERMINISTIC BACKEND CORE   │                               │  PYTHON COGNITIVE AI SERVICE  │
  ├───────────────────────────────┤                               ├───────────────────────────────┤
  │ • PostGIS Spatial Engine      │                               │ • Multi-Agent Orchestrator    │
  │ • Financial Modeling (EMI)    │        Internal HTTP          │ • Informal Seller Estimator   │
  │ • json-rules-engine (Schemes) │ ◄───────────────────────────► │ • Opportunity & Niche Agent   │
  │ • Stress-Test Simulator       │       (Contract Spec)         │ • AI SWOT & Risk Reasoning    │
  │ • Batch Ingestion Runners     │                               │ • LLM Output Guardrails       │
  └───────────────┬───────────────┘                               └───────────────┬───────────────┘
                  │                                                               │
                  ▼                                                               ▼
  ┌───────────────────────────────┐                               ┌───────────────────────────────┐
  │   PostgreSQL + PostGIS DB     │                               │   LLM Inference Providers     │
  │ (Census, LGD, UDYAM, Mandi)   │                               │   (Gemini 1.5 Pro / Groq 70B) │
  └───────────────────────────────┘                               └───────────────────────────────┘
```

### 4.1 Backend Modules (`backend/src/modules`)

1. **`auth` Module**: Handles entrepreneur registration, phone-based login, password hashing via Bcrypt, and stateless JWT generation with refresh token rotation.
2. **`user` Module**: Manages user profiles, social demographics (SC/ST/OBC/General, Minority status, Gender), and enterprise preferences.
3. **`location` Module**: Navigates India's administrative hierarchy (State $\rightarrow$ District $\rightarrow$ Block $\rightarrow$ Village) backed by official Local Government Directory (LGD) codes.
4. **`market` Module**: Executes PostGIS spherical queries to compute catchment demographics, household counts, literacy rates, and nearby institutional amenities within configurable radii (default: 5–10 km).
5. **`business` Module**: Manages formal registered businesses and crowdsourced informal enterprise reports, capturing coordinates, scale, verification status, and confidence levels.
6. **`scheme` Module**: Serves the government scheme catalog and exposes the scheme matching engine.
7. **`financial` Module**: Standalone calculators for project cost, reducing-balance EMI, 3-year cash flow projections, and working capital limits.
8. **`feasibility` Module**: The primary orchestrator that accepts enterprise parameters, invokes the market, financial, and AI subsystems, and persists the composite `Analysis` record.
9. **`chat` Module**: Conversational interface translating natural language voice/text inquiries into structured feasibility inputs.
10. **`admin` Module**: System control panel triggering and monitoring dataset ingestion pipelines, Redis job queues, and API telemetry.

### 4.2 Financial & Scheme Engines (`backend/src/engine`)

* **`financial/projectCost.ts`**: Back-calculates maximum feasible capital expenditures from the entrepreneur's available margin contribution (e.g. 10% own equity $\rightarrow 10\times$ project scale) while respecting statutory scheme ceilings.
* **`financial/emi.ts`**: Computes reducing-balance monthly installments, interest vs. principal amortization, quarterly views, and moratorium repayment holidays using arbitrary-precision math.
* **`financial/workingCapital.ts`**: Calculates required operational liquidity based on raw material purchase cycles, inventory turnover, and accounts receivable lag.
* **`financial/breakeven.ts`**: Determines fixed vs. variable operational splits, calculating the exact sales volume and monthly revenue required to achieve net zero operating margin.
* **`financial/stressTest.ts`**: Runs multi-scenario sensitivity simulations under adverse conditions (Raw material costs $+15\%$, Demand $-20\%$, Selling price $-10\%$).
* **`scheme/ruleEngine.ts`**: Executes declarative JSON rule files via `json-rules-engine` evaluating project cost boundaries, applicant social category, gender, rural/urban geography, and credit guarantee eligibility.

### 4.3 Ingestion Pipelines (`backend/src/ingestion`)

Batch-processes official Indian open datasets (`data.gov.in`, Census, and Ministries):
* **`lgd.pipeline.ts`**: Populates States, Districts, Sub-districts/Blocks, and Village master records with standardized Census/LGD codes.
* **`census.pipeline.ts`**: Ingests primary Census 2011 demographic records: total population, gender ratios, households, SC/ST numbers, working vs. marginal population.
* **`amenities.pipeline.ts`**: Loads village-level infrastructure availability: primary/middle/high schools, primary healthcare centres (PHCs), post offices, bank branches, ATMs, electricity, and paved roads.
* **`udyam.pipeline.ts`**: Ingests formal MSME registrations, categorizing enterprises by NIC codes into uniform business classifications.
* **`livestock.pipeline.ts`**: Ingests animal husbandry census tables (indigenous cattle, exotic cattle, buffaloes, goats, poultry) to quantify local milk and meat supply potential.
* **`crop.pipeline.ts`**: Ingests district-level seasonal crop statistics (Kharif, Rabi, Zaid) across acreages, harvest yields, and production tonnages.
* **`agmarknet.pipeline.ts`**: Ingests daily Mandi spot arrivals, recording minimum, maximum, and modal wholesale prices for agricultural and dairy inputs.
* **`roads.pipeline.ts`**: Ingests PMGSY rural road connectivity, surfacing types (bituminous/gravel), and distances to nearest arterial commercial towns.

### 4.4 AI Service Multi-Agent System (`ai-service/app`)

Built with FastAPI and a multi-agent cognitive pattern:
* **`agents/market.py`**: Infers local consumer demand and unmet market gaps based on demographic consumption indices and distance to transit towns.
* **`agents/competition.py`**: Estimates unobservable informal competitors (e.g., household milk sellers or non-registered tailors) using demographic heuristic scaling.
* **`agents/opportunity.py`**: Discovers specific value-addition niches (e.g., packaged paneer delivery vs. raw milk vending).
* **`agents/pricing.py`**: Analyzes commodity price spreads and recommends competitive retail pricing bands.
* **`agents/risk.py`**: Detects qualitative operational risks (single-buyer dependencies, seasonality, input volatility).
* **`agents/swot.py`**: Synthesizes structured Strengths, Weaknesses, Opportunities, and Threats for the specific micro-location.
* **`agents/recommendation.py`**: Combines all heuristic and agent outputs into an explainable verdict (`PROCEED`, `MODIFY`, or `INSUFFICIENT_DATA`).
* **`guardrails/validator.py`**: Intercepts model responses, validating Pydantic schemas, stripping unwanted markdown formatting, and preventing hallucinations.

### 4.5 Machine Learning Pipelines (`ML/src`)

* **`commodity_forecasting`**:
  * Utilizes Meta's **Prophet** and **XGBoost** on historical Agmarknet daily price records.
  * Predicts 30-day and 90-day commodity price trajectories with confidence intervals.
  * Generates actionable procurement signals (e.g., buy windows before seasonal price spikes).
* **`demand_prediction`**:
  * Employs **HistGradientBoostingRegressor** on village-level consumption indicators.
  * Estimates baseline consumption demand for critical rural enterprise categories (dairy, flour milling, poultry, garment stitching).

---

## ⚙️ Core Implementations & Mathematical Logic

### 5.1 Deterministic Feasibility Scoring Engine

The feasibility score $S_{\text{total}} \in [0, 100]$ is computed using a weighted multi-factor model:

$$S_{\text{total}} = \sum_{i=1}^{n} w_i \cdot s_i$$

Where each sub-score $s_i \in [0, 100]$ is derived deterministically:
1. **Demand Score ($w = 0.25$)**: Ratio of unmet market gap to total estimated catchment consumption.
2. **Competition Score ($w = 0.20$)**: Evaluates competitor saturation using an inverse spatial density metric.
3. **Financial Viability Score ($w = 0.20$)**: Measures Debt Service Coverage Ratio ($\text{DSCR} = \frac{\text{Net Operating Income}}{\text{Total Debt Service}}$). A $\text{DSCR} \ge 1.5$ yields 100 points.
4. **Input & Raw Material Availability ($w = 0.15$)**: Assessed via local crop and livestock abundance.
5. **Infrastructure & Connectivity ($w = 0.10$)**: Evaluates 3-phase electricity, all-weather PMGSY roads, and bank proximity.
6. **Promoter Readiness ($w = 0.10$)**: Prior business experience and equity contribution margin.

### 5.2 Financial Modelling & EMI Calculator

Reducing-balance EMI is calculated using standard banking mathematics:

$$\text{EMI} = \frac{P \cdot r \cdot (1 + r)^n}{(1 + r)^n - 1}$$

Where:
* $P$ = Loan principal (Project Cost minus Own Margin Contribution and Government Capital Subsidy).
* $r$ = Monthly interest rate ($\frac{\text{Annual Interest Rate}}{12 \times 100}$).
* $n$ = Repayment tenure in months (excluding moratorium period).

```typescript
// backend/src/engine/financial/emi.ts
const monthlyRate = new Decimal(annualInterestRate).dividedBy(1200);
const factor = monthlyRate.plus(1).pow(tenureMonths);
const emi = loanAmount.times(monthlyRate).times(factor).dividedBy(factor.minus(1));
```

### 5.3 Scheme Rule Evaluation Engine

Scheme routing is completely isolated in declarative, versioned JSON configurations. The system evaluates:
1. **Category Eligibility**: Manufacturing, Service, Trading, or Agro-allied.
2. **Project Cost Ceilings**: e.g., PMEGP allows up to ₹50 Lakhs for Manufacturing and ₹20 Lakhs for Service; Mudra Shishu caps at ₹50,000.
3. **Subsidy Matrix**:
   * *General Category (Rural)*: 25% Government Subsidy (Margin: 10%).
   * *Special Category (SC/ST/OBC/Women/Minority - Rural)*: 35% Government Subsidy (Margin: 5%).

### 5.4 Stress Testing & Sensitivity Analysis

The system evaluates post-shock solvency across three simultaneous stress scenarios:
* **Scenario A**: Raw material cost increases by $+15\%$.
* **Scenario B**: Local market demand contracts by $-20\%$.
* **Scenario C**: Local retail selling price drops by $-10\%$.

Under each scenario, the engine calculates whether **Operating Cash Flow post-EMI** remains positive:

$$\text{Net Cash Margin} = (\text{Stressed Revenue} - \text{Stressed Operating Expenses}) - \text{Monthly EMI}$$

If Net Cash Margin drops below zero, the business is flagged with a **High Cash-Flow Insolvency Warning**.

### 5.5 PostGIS Hyperlocal Geospatial Catchment Engine

All geographic entities (Villages, Enterprises, Mandis) store native PostGIS `geometry(Point, 4326)` coordinates. Catchments are queried dynamically on a spherical WGS 84 ellipsoid using `ST_DWithin`:

```sql
SELECT v.id, v.name, v.latitude, v.longitude,
       ST_Distance(v.geom::geography, ST_MakePoint(:targetLng, :targetLat)::geography) AS distance_meters
FROM "Village" v
WHERE ST_DWithin(v.geom::geography, ST_MakePoint(:targetLng, :targetLat)::geography, :radiusMeters)
ORDER BY distance_meters ASC;
```

### 5.6 Confidence-Aware Telemetry

Every analytical output in ArthSetu carries confidence metadata:

| Telemetry Tier | Tag | Meaning & Source |
| :--- | :--- | :--- |
| **Observed** | `OBSERVED` | Directly extracted from verified public registers (Census 2011, LGD, UDYAM, Mandi daily records). |
| **Reported** | `REPORTED` | Contributed by local field workers, SHG members, or survey forms; verified or unverified. |
| **Inferred** | `INFERRED` | Statistically estimated by machine learning regressions or multi-agent LLM inference. |

---

## 🖥️ Frontend Page Details & User Journeys

The frontend is implemented as a modern, accessible civic portal using Next.js 14 App Router, dynamic charts, interactive maps, and responsive styling:

### 1. Landing / Home Page (`/`)
* **Route**: `frontend/src/app/page.tsx`
* **Components**: `GovHeaderBar`, `HeroSection`, `TrustStatsStrip`, `PhotoGallerySection`, `HowitWorksSection`, `CategoryGridSection`, `TrustDataSourcesStrip`, `LandingCTA`, `InstallPrompt`.
* **Features**:
  * **Civic Branding**: Official national emblem header, language switcher, and accessibility controls.
  * **Hero CTA**: Direct onboarding trigger into the feasibility assessment wizard.
  * **Trust Stats Strip**: Real-time counter showing villages indexed, MSME registrations analyzed, and government loan schemes supported.
  * **Interactive Category Showcase**: Quick-select tiles for Dairy, Food Processing, Poultry, Garments, and Retail with indicative margins and typical project scales.
  * **PWA Install Prompt**: Offline installation banner for rural mobile devices.

### 2. Feasibility Assessment Wizard (`/assessment-wizard`)
* **Route**: `frontend/src/app/assessment-wizard/page.tsx`
* **Components**: `AssesmentWizardClient.tsx`, `WizardProgress.tsx`, `StepLocation.tsx`, `LocationPickerMap.tsx`, `StepBusiness.tsx`, `StepCapital.tsx`, `StepReview.tsx`.
* **User Workflow**:
  * **Step 1 (Location Selection)**: Search by State $\rightarrow$ District $\rightarrow$ Block $\rightarrow$ Village, or drop a pin on the interactive Leaflet map to set GPS coordinates and catchment radius (5 km, 10 km, 15 km).
  * **Step 2 (Business Selection)**: Natural language prompt input (*"I want to buy 4 cows and sell milk and paneer to tea stalls"*) automatically classified into standard categories with confidence scores via the AI microservice.
  * **Step 3 (Capital & Financing)**: Input available own capital (margin money), available land, machinery, and daily working hours.
  * **Step 4 (Review & Validation)**: Pre-flight check summarizing demographic population, expected loan eligibility, and applicant social profile.
  * **Submission**: Dispatches composite payload to `POST /api/v1/feasibility`, triggers deterministic engines and AI agents, and redirects to the resulting report.

### 3. Unified Intelligence Dashboard (`/dashboard`)
* **Route**: `frontend/src/app/dashboard/page.tsx`
* **Components**: `PastAssessments.tsx`, `HyperlocalBusinessExplorer.tsx`, `HyperlocalLeafletMap.tsx`.
* **Features**:
  * **KPI Metric Cards**: High-level viability score, recommended monthly revenue, breakeven timeframe, and primary loan recommendation.
  * **Interactive Spatial Map**: Visualizes the selected catchment buffer, plotting known formal businesses, crowdsourced informal units, and nearby village clusters with interactive popups.
  * **Past Assessments History**: Card grid allowing entrepreneurs to review, compare, or re-run prior enterprise evaluations.

### 4. Comprehensive Feasibility Report (`/feasibility-report/[id]`)
* **Route**: `frontend/src/app/feasibility-report/[id]/page.tsx`
* **Features**:
  * **Overall Viability Card**: Large numeric gauge (0–100) with categorical verdict (`PROCEED`, `MODIFY`, or `HIGH RISK`).
  * **Financial DPR Overview**: Project cost breakdown (fixed equipment, electrification, preliminary expenses, working capital), promoter margin, subsidy grant, and bank loan amount.
  * **Repayment Schedule**: Reducing-balance monthly EMI, interest breakdown, and moratorium period duration.
  * **Market Gap & Opportunity Analysis**: Detailed unmet demand indicators, seasonal pricing bands, and target customer niches.
  * **AI SWOT Matrix**: Interactive 4-quadrant SWOT analysis specific to the selected village and business category.
  * **Stress Test Visualizer**: Chart.js bar graph comparing base-case net margin against stressed input-cost and demand-shock scenarios.
  * **30-Day Action Roadmap**: Checklist covering supplier sourcing, quotation collection, scheme documentation, and bank submission.
  * **DPR Export**: One-click printable view formatted for bank loan officers.

### 5. Government Schemes Explorer (`/schemes` & `/schemes/[id]`)
* **Route**: `frontend/src/app/schemes/page.tsx` and `frontend/src/app/schemes/[id]/page.tsx`
* **Features**:
  * **Scheme Catalog**: Searchable directory of central & state credit schemes (PMEGP, Mudra, PM-SVANidhi, Stand-Up India, PMFME, CGTMSE).
  * **Interactive Filters**: Filter by target community (SC/ST, Women, General), business type (Manufacturing, Service), and project cost limits.
  * **Detailed Scheme Breakdown**: Maximum loan limits, subsidy percentages, collateral requirements, nodal agencies, and application guidelines.

### 6. Village Demographic Explorer (`/villages/[id]`)
* **Route**: `frontend/src/app/villages/[id]/page.tsx`
* **Features**:
  * **Village Profile**: Census demographics (population, male/female ratio, literacy, total households).
  * **Economic Indicators**: Working vs. marginal population, agricultural labourers, and cultivator counts.
  * **Infrastructure Audit**: Availability of 3-phase electricity, banks, ATMs, post offices, schools, and all-weather PMGSY roads.
  * **Agricultural & Livestock Assets**: Crop production tonnages and livestock census breakdown.

### 7. User Settings & Multilingual Preferences (`/settings`)
* **Route**: `frontend/src/app/settings/page.tsx`
* **Features**:
  * **Language Switcher**: Multilingual selection (English, Hindi, Bengali, Tamil, Telugu, Marathi).
  * **Profile Configuration**: Update social category, gender, minority status, and default location.

### 8. Administration & Pipeline Monitor (`/admin`)
* **Route**: `frontend/src/app/admin/page.tsx`
* **Features**:
  * **Ingestion Triggers**: Manual and scheduled triggers for Census, LGD, UDYAM, Agmarknet, and Livestock pipelines.
  * **Job Queue Metrics**: Real-time worker status via BullMQ / Redis monitoring active, completed, and failed batch jobs.
  * **Data Integrity Telemetry**: Entity counts for States, Districts, Blocks, Villages, Businesses, and Commodity Prices.

### 9. AI Voice & Chat Assistant (`ChatWidget`)
* **Route**: Component mounted in `frontend/src/components/ChatBot/ChatWidget.tsx`
* **Features**:
  * Persistent conversational bubble on all screens.
  * Converts voice input and vernacular text queries into guided business inquiries.
  * Provides quick-action suggestion chips (*"Explain EMI"*, *"What schemes am I eligible for?"*, *"Is dairy good in my village?"*).

---

## 🗄️ Database Schema & Entity Relationships

```mermaid
erDiagram
    User ||--o{ Analysis : initiates
    User ||--o{ RefreshToken : owns
    State ||--o{ District : contains
    District ||--o{ Block : contains
    Block ||--o{ Village : contains
    Village ||--o| CensusData : has
    Village ||--o| VillageAmenity : has
    Village ||--o{ LivestockData : has
    Village ||--o{ CropData : has
    Village ||--o{ Business : locates
    Village ||--o{ RoadConnectivity : connects
    Village ||--o{ Analysis : targets

    Village {
        int id PK
        string name
        int blockId FK
        float latitude
        float longitude
    }
    CensusData {
        string id PK
        int villageId FK
        int totalPopulation
        int totalHouseholds
        float literacyRate
        int workingPopulation
    }
    Business {
        string id PK
        int villageId FK
        string name
        enum category
        enum source
        enum confidence
        enum verificationStatus
    }
    Analysis {
        string id PK
        string userId FK
        int villageId FK
        enum businessCategory
        float availableCapital
        json marketIntelligence
        json financialPlan
        json schemeMatch
        json riskAssessment
        json feasibilityScore
        json actionPlan
    }
```

---

## 🔌 API Endpoints Reference

All Fastify backend endpoints are prefixed with `/api/v1` and documented via OpenAPI at `/documentation`.

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Register new user with phone, password, and demographics | No |
| `POST` | `/api/v1/auth/login` | Authenticate with phone & password; returns JWT access/refresh tokens | No |
| `POST` | `/api/v1/auth/refresh` | Rotate and issue new access token | No |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user profile | Yes (Bearer) |
| `GET` | `/api/v1/locations/states` | Fetch list of Indian states | No |
| `GET` | `/api/v1/locations/districts` | Fetch districts within a state | No |
| `GET` | `/api/v1/locations/blocks` | Fetch blocks within a district | No |
| `GET` | `/api/v1/locations/villages` | Fetch villages within a block (with coordinates) | No |
| `GET` | `/api/v1/locations/villages/:id`| Fetch detailed demographic & amenities profile for a village | No |
| `GET` | `/api/v1/market/catchment` | Query demographics & competitors in a radius via PostGIS | No |
| `GET` | `/api/v1/businesses` | List formal & informal businesses in a locality | No |
| `POST` | `/api/v1/businesses/report` | Submit community report for informal business | Yes |
| `GET` | `/api/v1/schemes` | Get catalog of government loan schemes | No |
| `POST` | `/api/v1/schemes/evaluate` | Evaluate applicant eligibility against scheme rule engine | No |
| `POST` | `/api/v1/financial/project-cost` | Calculate project cost breakdown from available capital | No |
| `POST` | `/api/v1/financial/emi` | Calculate reducing-balance EMI, amortization, and moratorium | No |
| `POST` | `/api/v1/financial/cashflow` | Project 3-year monthly cash flow | No |
| `POST` | `/api/v1/financial/stress-test` | Execute sensitivity stress test simulation | No |
| `POST` | `/api/v1/feasibility` | Execute full feasibility assessment & generate report | Yes |
| `GET` | `/api/v1/feasibility/:id` | Fetch existing feasibility analysis report | Yes |
| `POST` | `/api/v1/ai/classify` | AI classification of unstructured business idea | No |
| `POST` | `/api/v1/ai/demand-estimate` | AI demand estimation for micro-market catchment | No |
| `POST` | `/api/v1/chat` | Conversational query assistant endpoint | No |
| `POST` | `/api/v1/admin/ingest/run` | Trigger dataset ingestion pipeline | Yes (Admin) |

---

## 🚀 Local Development & Setup Guide

### Prerequisites
* **Node.js** `>= 20.0.0`
* **Python** `>= 3.11`
* **PostgreSQL** `>= 15` with **PostGIS** extension enabled
* **Redis** (Local instance or Upstash Redis URL)

### 1. Backend Setup

```bash
cd backend
npm install

# Configure environment
cp .env.example .env
# Ensure DATABASE_URL includes postgis extension:
# DATABASE_URL="postgresql://user:password@localhost:5432/arthsetu?schema=public"

# Run database migrations and generate Prisma client
npm run db:push
npm run db:generate

# Seed initial geographic and scheme data
npm run db:seed

# Start backend development server (Port 5000)
npm run dev
```

### 2. Python AI Service Setup

```bash
cd ai-service
python3 -m venv venv
source venv/bin/activate   # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Set GEMINI_API_KEY or GROQ_API_KEY

# Start FastAPI AI microservice (Port 8000)
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup

```bash
cd frontend
npm install

# Configure environment
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL="http://localhost:5000/api/v1"

# Start Next.js development server (Port 3000)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to interact with the platform. Interactive Swagger API documentation will be available at [http://localhost:5000/documentation](http://localhost:5000/documentation).

---

## 📄 License & Attribution

ArthSetu is developed as part of public sector innovation initiatives to drive micro-enterprise growth, financial inclusion, and evidence-backed credit disbursement across rural India.

Public datasets ingested by ArthSetu are sourced from [Data.gov.in](https://data.gov.in) under the National Data Sharing and Accessibility Policy (NDSAP).
