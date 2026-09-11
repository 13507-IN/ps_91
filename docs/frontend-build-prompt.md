# ArthSetu — Next.js Frontend Build Prompt

> Paste the entire contents of this file into your AI coding agent as the build specification.
> It is a self-contained contract between the frontend and the existing Node.js/Fastify backend.

---

## 0. Your Role

You are a senior frontend engineer building the complete web frontend for **ArthSetu** — an AI-powered hyper-local enterprise decision-support platform for rural entrepreneurs in India. The backend already exists (Node.js + Fastify + Prisma/Postgres). **Do not touch or modify the backend.** Build only the frontend.

Work through the sections below in order. Deliver a runnable Next.js app that talks to the backend endpoints described in **Section 3**.

---

## 1. The Problem We Are Solving

Rural and semi-urban entrepreneurs get cheap government credit, but most still fail. Two root causes:

1. **No localized business intelligence.** They pick businesses based on anecdotes and assumptions, not on their actual local market (population, purchasing power, competitors, supply, infrastructure).
2. **No financial literacy.** They don't understand margin, project cost, loan, interest, EMI, working capital, or repayment — so they pick financially unsuitable models.

ArthSetu converts **three inputs** — `Location + Available Capital + Business Category/Idea` — into a full decision report:

```
Market Intelligence → Opportunity Analysis → Business Model → Financial Feasibility
→ Risk Assessment → Stress Test → Viability Score → Action Plan → Funding Readiness
```

**CRITICAL PRODUCT PRINCIPLE:** This is **NOT a chatbot**. It is a structured, dashboard-style **Business Intelligence & Decision-Support** experience. AI works behind the scenes; the UI presents structured intelligence, scores, charts, maps, and action checklists.

---

## 2. Tech Stack (FIXED — do not change)

| Concern | Choice |
|---|---|
| Framework | **Next.js 14+ (App Router), Server Components by default** |
| Language | **TypeScript** (strict mode) |
| Styling | **Tailwind CSS** |
| Data fetching / caching | **TanStack Query** (`@tanstack/react-query`) + fetch wrappers |
| Client state | **Zustand** (only for auth session + form wizard draft state) |
| Charts | **Recharts** |
| Maps | **Leaflet + react-leaflet** with OpenStreetMap tiles (dev); support an abstraction so MapLibre/Mapbox can replace it later |
| Forms | **React Hook Form + Zod** |
| i18n | **next-intl** — English + Hindi at minimum; structure must be scalable to Bengali, Tamil, Telugu, Odia |
| PWA | `next-pwa` (installable, offline shell, cached report for re-reading) |
| Icons | `lucide-react` |
| Fonts | next/font — Hinglish-friendly, high legibility (e.g. Noto Sans + Noto Sans Devanagari) |

**Environment variable (frontend)**
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```
All API calls go to `${NEXT_PUBLIC_API_BASE_URL}/api/...`.

---

## 3. Backend API Contract (Complete)

Base URL: `http://localhost:3000` · All routes prefixed `/api` · Swagger docs auto-served at `http://localhost:3000/docs`.

### 3.1 Health
- `GET /health` → `{ status, timestamp, uptime, version }`

### 3.2 Auth — `/api/auth`
- `POST /auth/register` — body `{ phone, password, name? }` → `{ user: { id, phone, name }, tokens: { accessToken, refreshToken } }` (201)
- `POST /auth/login` — body `{ phone, password }` → same shape (200)
- `POST /auth/refresh` — body `{ refreshToken }` → `{ accessToken, refreshToken }`
- `POST /auth/logout` — **Bearer required** — body `{ refreshToken }` → `{ message }`

Auth header: `Authorization: Bearer <accessToken>`. Access token expiry ~15m, refresh ~7d. Frontend must silently refresh on 401 using the refresh endpoint and retry the failed request.

### 3.3 User — `/api/users` (all **Bearer required**)
- `GET /users/me` → profile incl. demographics: `{ id, phone, name, email, gender, dateOfBirth, category, isMinority, location: { latitude, longitude, village, block, district, state }, createdAt }`
- `PATCH /users/me` — body (all optional): `{ name, email, gender: MALE|FEMALE|OTHER, dateOfBirth, category: GENERAL|SC|ST|OBC|MINORITY, isMinority, location: { latitude, longitude, village, block, district, state } }`

### 3.4 Admin — `/api/admin` (Bearer required; NOT part of end-user UX)
- `GET /admin/ingest/pipelines`
- `POST /admin/ingest/:source` — `{ filePath, dryRun?, batchSize? }`
- `POST /admin/ingest/all` — `{ fileMap, dryRun?, batchSize? }`
- `GET /admin/ingest/status?jobId=`
*(Frontend: do not build UI for this. Only a route guard that blocks it.)*

### 3.5 Financial calculators — `/api/financial` (public, deterministic)
- `POST /financial/emi` — `{ principal, annualRate, tenureMonths, moratoriumMonths?, moratoriumType?: INTEREST_ONLY|NO_PAYMENT }` → EMI + full amortization schedule
- `POST /financial/project-cost` — `{ availableMargin, marginPercentage?=10, maxProjectCostCap? }` → `{ projectCost, loanAmount, marginPercentage }`
- `POST /financial/cashflow` — `{ monthlyRevenue, monthlyOperatingCosts, monthlyEmi, seasonalityMultipliers?, annualGrowthRate?=5, projectionMonths?=12 }`
- `POST /financial/breakeven` — `{ monthlyFixedCosts, variableCostPerUnit, sellingPricePerUnit, initialProjectCost?, expectedMonthlyUnits? }`
- `POST /financial/stress-test` — `{ monthlyRevenue, monthlyOperatingCosts, monthlyEmi }` → scenarios (base + adverse)
- `POST /financial/calculate` — full plan combining the above

### 3.6 Schemes — `/api/schemes` (public)
- `POST /schemes/match` — `{ age, gender?, category?, isMinority?, businessCategory?, projectCost, availableMargin?, state?="West Bengal", district? }` → `{ totalMatched, schemes: MatchedSchemeResult[] }`
- `GET /schemes` → all schemes
- `GET /schemes/:id` → scheme detail

Each `MatchedSchemeResult` includes: scheme id, name, description, maxLoan, interestRate, tenureMonths, moratoriumMonths, subsidyAmount, netLoanAmount, eligibility matches, reason.

### 3.7 Locations — `/api/locations` (public)
- `GET /locations/search?q=<string>&limit=20` → `{ total, villages: [{ id, name, block?, district?, state?, latitude?, longitude? }] }`
- `GET /locations/nearby?lat=&lng=&radiusKm=10&limit=50` → `{ center, radiusKm, total, villages[] }`
- `GET /locations/villages/:id` → full profile: census, amenities, crops, livestock, roads, connectivity

### 3.8 Market — `/api/market` (public)
- `POST /market/intelligence` — `{ lat, lng, radiusKm?=10, businessCategory? }` → demographics (population, households, literacy), amenities counts, top crops, livestock, infrastructure, `confidence`
- `GET /market/competitors?lat=&lng=&radiusKm=10&category=` → confidence-aware breakdown: `{ totalObserved, totalReported, totalEstimatedMin, totalEstimatedMax, overallEstimate, densityPerSqKm, confidence, competitors[] }`
- `GET /market/prices?commodity=&district=` → AGMARKNET mandi prices `{ commodity, district, prices[], lastUpdated }`
- `GET /market/infrastructure?villageId=` → amenities + road connectivity

### 3.9 Businesses — `/api/businesses` (public)
- `GET /businesses/categories` → categories with `{ code, name, description, typicalInvestmentRange: {min,max}, defaultMarginPct, subcategories[] }` (use this to populate the business-category picker)
- `GET /businesses?villageId=&category=&page=1&limit=20` → paginated list
- `POST /businesses` — community reporting: `{ name, category, subcategory?, products[], villageId?, latitude?, longitude?, scale?: MICRO|SMALL|MEDIUM, priceRange?: LOW|MEDIUM|HIGH, seasonality? }`
- `GET /businesses/density?lat=&lng=&radiusKm=10&category=` → per-km² density

### 3.10 AI — `/api/ai` (public; backend falls back to heuristics if AI service is offline)
- `POST /ai/classify` — `{ idea }` → `{ category, subcategory, confidence, reasoning }`
- `POST /ai/demand-estimate` — `{ businessCategory, totalPopulation, totalHouseholds }` → `{ estimatedAnnualDemandUnits, estimatedDailyDemandUnits, unit, confidence, keyDrivers[] }`
- `POST /ai/opportunity-discover` — `{ businessCategory, existingCompetitors, estimatedDemandUnits }` → `{ marketGaps[], potentialNiches[], recommendedModel, opportunityScore }`
- `POST /ai/risk-assess` — `{ businessCategory, projectCost, loanAmount, monthlyEmi }` → `{ riskFactors[], overallRiskScore, riskRating: LOW|MEDIUM|HIGH }`
- `POST /ai/recommend` — `{ businessCategory, opportunityScore, financialViabilityScore, riskScore, matchedScheme? }` → `{ decision: PROCEED|MODIFY|INSUFFICIENT_DATA, viabilityScore, summary, strengths[], weaknesses[], recommendedNextStep }`
- `POST /ai/action-plan` — `{ businessCategory, loanAmount, schemeName? }` → `{ planDurationDays, milestones: [{ phase, dayRange, tasks[] }], fundingReadinessChecklist[] }`

### 3.11 Feasibility — `/api/feasibility` (THE core endpoint)
- `POST /feasibility/analyze` — body:
  ```ts
  {
    latitude: number,            // required
    longitude: number,           // required
    villageId?: number,
    catchmentRadiusKm?: number,  // default 10
    businessCategory?: string,   // if omitted, AI classifies from businessIdea
    businessIdea: string,        // required
    availableCapital: number,    // required (₹)
    age?: number,
    gender?: 'MALE'|'FEMALE'|'OTHER',
    category?: 'GENERAL'|'SC'|'ST'|'OBC'|'MINORITY',
    isMinority?: boolean,
    businessExperience?: string,
    availableLand?: string,
    availableEquipment?: string,
    expectedWorkingHours?: number,
  }
  ```
  **Optional auth:** sends `{ user }` and persists the analysis for later retrieval. Guests can evaluate without login.

  Response (single unified report):
  ```ts
  {
    id?: string,                 // present if authenticated
    businessCategory: BusinessCategory,
    businessIdea: string,
    catchment: { latitude, longitude, radiusKm },
    marketIntelligence: MarketIntelligence,
    competitorAnalysis: CompetitorAnalysis,
    opportunityAnalysis: OpportunityAnalysis,
    financialPlan: {
      projectCost, availableCapital, loanRequired, marginPercentage,
      matchedSchemeName, interestRate, tenureMonths, subsidyAmount, netLoanAmount,
      emi: EmiOutput,            // incl. amortization schedule
      workingCapital: WorkingCapitalOutput,
      cashflow: CashflowOutput,  // 12-month projection
      breakEven: BreakEvenOutput,
      stressTest: StressTestOutput,
    },
    schemeMatches: MatchedSchemeResult[],
    riskAssessment: RiskAssessment,
    feasibilityScore: {
      marketDemandScore: 0-20, competitionScore: 0-20, financialViabilityScore: 0-20,
      capitalAdequacyScore: 0-20, riskResilienceScore: 0-20,
      totalScore: 0-100,
      grade: 'EXCELLENT'|'GOOD'|'MODERATE'|'POOR',
    },
    actionPlan: ActionPlan,
    aiRecommendation: { decision, viabilityScore, summary, strengths[], weaknesses[], recommendedNextStep },
    status: 'COMPLETED',
    confidence: 'HIGH'|'MEDIUM'|'LOW',
    createdAt: string,
  }
  ```
- `GET /feasibility/analyses` — **Bearer required** → `{ total, analyses: [{ id, businessCategory, businessIdea, availableCapital, catchmentRadiusKm, latitude, longitude, status, confidence, feasibilityScore, createdAt }] }`
- `GET /feasibility/analyses/:id` — optional auth → full saved report

### 3.12 Enums used across the API
```
BusinessCategory: DAIRY | FOOD_PROCESSING | RETAIL | TEXTILES_TAILORING | POULTRY |
                  AGRICULTURE | LIVESTOCK | TRANSPORT | HANDICRAFT | SERVICES | OTHER
Gender:           MALE | FEMALE | OTHER
SocialCategory:   GENERAL | SC | ST | OBC | MINORITY
Confidence:       HIGH | MEDIUM | LOW
Decision:         PROCEED | MODIFY | INSUFFICIENT_DATA
Grade:            EXCELLENT | GOOD | MODERATE | POOR
```

---

## 4. Product Principles (design rules — must be baked into every screen)

1. **Confidence-aware.** Never present estimates as facts. Every derived number shows a `Confidence` badge (HIGH/MEDIUM/LOW) and a source tag: `Observed`, `Reported`, or `Inferred`.
2. **Explainable.** Every recommendation section answers "Why?" — show the scored dimensions with the evidence behind each.
3. **Deterministic finance.** Financial figures come only from the backend engines; never compute EMI/eligibility client-side for final decisions.
4. **Progressive disclosure.** Show headline verdict first, then expandable drill-downs. A villager with a ₹20K phone must get value on first screen without scrolling a wall of text.
5. **Never overpromise.** When confidence is LOW or decision is `INSUFFICIENT_DATA`, show a clear "needs local validation" state — not an optimistic number.
6. **Cultural fit.** INR `₹` formatting (`en-IN` locale), Hinglish-friendly copy, tappable large targets (min 48px), works offline via PWA shell, low-bandwidth friendly.
7. **Not a chatbot.** No conversational interface. Structured wizard → dashboard report.

---

## 5. Page / Route Inventory

### 5.1 Public pages
| Route | Purpose |
|---|---|
| `/` | Landing page: value prop, how-it-works (3 steps), category cards, CTA, "already have a report? enter ID" |
| `/login` | Phone + password login |
| `/register` | Phone, password, name → auto-login |
| `/about` | Platform, data sources, reliability principles, FAQ |

### 5.2 The Assessment Wizard (the golden path) — `/assess`
A responsive step-based wizard (progress indicator, back/forward, draft autosaved in Zustand + localStorage):

1. **Step 1 — Location:** search village (`/locations/search`) as the primary path; **or** pin on interactive map (Leaflet) → reverse use lat/lng with `/locations/nearby` for context. Show selected village card (block/district/state).
2. **Step 2 — Business:** category cards from `/businesses/categories` (show typical investment range + subcategories). Optional free-text idea (`/ai/classify` live on blur for category suggestion).
3. **Step 3 — Capital & profile:** `availableCapital` input with formatted `₹`, quick-select chips (`₹25K / ₹50K / ₹1L / ₹2L / ₹5L`), optional demographic fields (age, gender, category, isMinority, experience, land, equipment, hours).
4. **Step 4 — Review & Run:** summary card of all inputs → submit `POST /feasibility/analyze`.

State in URL for shareability/back-button: query params `?village=123&lat=..&lng=..&idea=..`.

### 5.3 The Feasibility Report — `/report/[id]`
The report is a **tabbed/sectioned dashboard** (`/report/[id]?s=market|opportunity|financial|risk|decision|action`). If guest (no id), keep in-memory with a "Login to save this report" prompt.

**Report sections (in order):**
1. **Verdict Hero** — overall `Grad`e ring / radial gauge (Recharts), `decision` banner (PROCEED / MODIFY / INSUFFICIENT_DATA), `viabilityScore` (0-100), confidence badge, catchment summary (lat/lng/radius), generated timestamp.
2. **Market Intelligence** — KPI stat cards: population, households, literacy, catchment radius, amenities, top crops, livestock, infrastructure; map with catchment circle + nearby villages; all values tagged Observed/Reported/Inferred + Confidence.
3. **Competition & Opportunity** — competitor breakdown panel (observed vs reported vs inferred range), density per km², **market gaps / niches** (from `opportunityAnalysis`), recommended business model card w/ opportunity score gauge, `keyDrivers`.
4. **Financial Plan** — interactive financial dashboard:
   - Project cost → own contribution → loan bridge diagram
   - Matched scheme card (name, interest, tenure, subsidy, netLoan)
   - **EMI + amortization** table and chart (Recharts area/line) with a **simulator**: tenure / rate sliders call `/financial/emi` live
   - Monthly cash-flow bar chart (12 months, from `cashflow`), working capital card, break-even line chart with `isViable` badge
   - **Stress-test section:** toggle chips that re-run `/financial/stress-test` with adjusted inputs (`+15% raw material`, `-20% demand`, etc.); show base vs adverse comparison bars
5. **Risk Assessment** — risk matrix (probability vs impact scatter/heat-map), per-risk mitigation text, overall risk rating badge.
6. **AI Recommendation** — the "why": strengths/weaknesses lists, summary, `recommendedNextStep` call-to-action card. Every item is explainable — no mystery black-box.
7. **30-Day Action Plan** — timeline/stepper of milestones (phase, day range, tasks w/ checkboxes persisted locally), funding-readiness checklist with progress counter, "Download as PDF" (client-side print/export).

**Download:** `POST /report/[id]/print` → window.print() with print CSS (no server needed).

### 5.4 Dashboard (authenticated) — `/dashboard`
- Saved analyses grid from `GET /feasibility/analyses` (category, grade badge, confidence, capital, date) → click through to `/report/[id]`
- "New assessment" prominent CTA
- Profile summary card (from `/users/me`)

### 5.5 Profile — `/settings`
- Edit profile via `PATCH /users/me` (name, email, gender, category, isMinority, location)
- Change nothing about passwords to the backend yet (no endpoint exists)

### 5.6 Auth flows
- Register → auto-login → redirect to `/assess` or `/dashboard`
- Login → refresh both tokens → redirect
- Silent refresh on 401 in the fetch layer; force logout redirect to `/login` on refresh failure
- Store tokens ONLY in memory/sessionStorage (XSS-safe); use a short-lived access token + refresh

### 5.7 404 / Offline
- Custom `not-found.tsx` and `global-error.tsx`
- PWA `offline.tsx` fallback page ("You are offline. Re-read your last report.")

---

## 6. App Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # root layout, fonts, providers, PWA meta
│   ├── page.tsx            # landing
│   ├── login/ register/
│   ├── assess/
│   ├── report/[id]/
│   ├── dashboard/
│   ├── settings/
│   └── about/
├── components/
│   ├── ui/                 # Button, Card, Badge, Skeleton, Gauge, Stat, ...
│   ├── assess/             # wizard steps
│   ├── report/             # verdict hero, market, financial, risk, plan sections
│   ├── maps/               # LocationPickerMap, CatchmentMap
│   └── charts/             # Gauges, Bar, Line, Area, Matrix
├── features/
│   ├── auth/               # store + api
│   ├── assess/             # wizard state + api
│   └── report/             # api + queries
├── lib/
│   ├── api/                # fetch client, baseURL, auth header, silent refresh
│   ├── format/             # inr(), compact(), percentage(), confidenceToColor()
│   └── constants.ts        # enums, category meta, colors per grade/confidence
├── types/                  # mirrors backend DTOs (Section 3) — 1:1 types
├── messages/               # next-intl en.json, hi.json
├── i18n.ts / middleware.ts
├── public/sw.js            # next-pwa
└── next.config.mjs
```

**Key architectural decisions**
- **`lib/api/client.ts`** — single fetch wrapper: base URL from `NEXT_PUBLIC_API_BASE_URL`, JSON headers, attach Bearer token, on `401` attempt one silent refresh+retry, else emit `auth:expired` event.
- **Server Components** for all static/landing content; **Client Components** only where interactivity requires them (charts, maps, forms, wizard).
- **React Query** keys: `['me']`, `['categories']`, `['schemes']`, `['villages', query]`, `['market', lat,lng,cat]`, `['feasibility', id]` etc. Invalidate `['me']` after profile PATCH, `['feasibility']` after analyze.
- **i18n:** all user-facing strings through `useTranslations()`; numbers via `Intl.NumberFormat('en-IN')` + `Intl.NumberFormat('hi-IN')`.

---

## 7. Component Inventory (must-haves)

| Component | Notes |
|---|---|
| `VerdictHero` | Radial gauge (Recharts Pie/Gauge) for score + decision banner + confidence badge |
| `ConfidenceBadge` | color map: HIGH=green, MEDIUM=amber, LOW=red — used EVERYWHERE a derived value appears |
| `SourceTag` | `Observed` / `Reported` / `Inferred` chip |
| `StatCard` | label, big value, source/confidence underneath, optional up/down delta |
| `ScoreBreakdown` | 5-dimension horizontal stacked bar (market/competition/finance/capital/risk — each /20) |
| `SchemeCard` | matched scheme: interest, tenure, subsidy, netLoan, eligibility reason; expandable |
| `EmiSimulator` | sliders (principal, rate, tenure, moratorium) → live `/financial/emi` table + chart |
| `CashflowChart` | 12-month grouped/area chart with `isCashflowPositive` legend |
| `BreakEvenChart` | revenue vs total cost crossing point marker |
| `StressTestToggle` | scenario chips → `/financial/stress-test`, base-vs-adverse bars |
| `RiskMatrix` | probability × impact scatter; per-risk mitigation card |
| `ActionTimeline` | milestone stepper with checkable tasks (localStorage persistence) |
| `ChecklistProgress` | funding-readiness checklist + % complete ring |
| `LocationPicker` | search + map pin (Leaflet), returns `{lat,lng,villageId,...}` |
| `CategoryPicker` | cards from `/businesses/categories` with investment range + subcategories |
| `CapitalInput` | `₹` formatted input + quick chips |
| `AuthGuard` / `GuestGuard` | route guards using session store |
| `Skeletons` | every async section = `<Skeleton>` variant |

---

## 8. Data Types (write these in `src/types/*.ts`, 1:1 with Section 3)

Mirror every DTO in Section 3 verbatim. Enums as TypeScript `const` unions (do NOT use `enum` unless needed). Example starters:

```ts
export type BusinessCategory =
  | 'DAIRY' | 'FOOD_PROCESSING' | 'RETAIL' | 'TEXTILES_TAILORING' | 'POULTRY'
  | 'AGRICULTURE' | 'LIVESTOCK' | 'TRANSPORT' | 'HANDICRAFT' | 'SERVICES' | 'OTHER';

export type Confidence = 'HIGH' | 'MEDIUM' | 'LOW';
export type Decision = 'PROCEED' | 'MODIFY' | 'INSUFFICIENT_DATA';
export type Grade = 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'POOR';
export type SocialCategory = 'GENERAL' | 'SC' | 'ST' | 'OBC' | 'MINORITY';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type BusinessScale = 'MICRO' | 'SMALL' | 'MEDIUM';
export type PriceRange = 'LOW' | 'MEDIUM' | 'HIGH';

export interface CategoryInfo {
  code: BusinessCategory;
  name: string;
  description: string;
  typicalInvestmentRange: { min: number; max: number };
  defaultMarginPct: number;
  subcategories: string[];
}

export interface EmiOutput {
  emi: number;
  totalInterest: number;
  totalPayment: number;
  schedule: { month: number; principal: number; interest: number; balance: number }[];
}

export interface MatchedSchemeResult {
  id: string;
  name: string;
  description: string;
  maxLoan: number;
  interestRate: number;
  tenureMonths: number;
  moratoriumMonths: number;
  subsidyAmount: number;
  netLoanAmount: number;
  eligible: boolean;
  reason: string;
}

export interface FeasibilityReport { /* mirror 3.11 response exactly */ }
```

---

## 9. Visual Design Language

- **Motto:** *Local evidence, clearly explained.*
- **Mobile-first, rural-hardware friendly:** max width 480px content column, ≥48px touch targets, body ≥16px, high contrast (WCAG AA), no hover-dependent UI.
- **Palette:** trust + high-contrast. Deep teal/green primary, warm amber accents, semantic score colors (EXCELLENT=emerald, GOOD=green, MODERATE=amber, POOR=rose). Confidence/grade colors consistent app-wide via a single `constants.ts` map.
- **Typography:** Noto Sans + Noto Sans Devanagari/Odia/Bengali via next/font, `₹` and `en-IN` grouping everywhere.
- **Language toggle** (EN / HI) always visible in header; persists via cookie via next-intl middleware.

---

## 10. Testing & Quality Bar

- **Type safety:** `tsc --noEmit` must pass; no `any` in API layer.
- **Lint/format:** eslint + prettier config matching the repo style.
- **Unit tests (Vitest):** (a) `lib/api/client.ts` silent-refresh retry logic (mock fetch), (b) INR/locale formatters, (c) wizard draft persistence reducer.
- **Component tests:** report section components render with mocked TanStack Query + mocked DTO fixtures (`src/types/__fixtures__/report.ts`).
- **Manual golden-path checklist (must all pass):**
  1. Land → start assessment → pick village via search → pick category → enter capital → analyze → full report renders section-by-section without layout shift.
  2. Report loads after page refresh (deep link `/report/[id]`).
  3. Login → analysis auto-saved → visible in Dashboard → opens from history.
  4. Locale switch EN↔HI keeps every section translated, `₹` formatted.
  5. Offline (devtools) → PWA shell + cached last report still readable.
  6. 401 → silent refresh → request retried; refresh failure → redirected to `/login`.

---

## 11. Delivery Checklist (Definition of Done)

- [ ] Next.js 14+ App Router app boots with `pnpm dev` / `npm run dev`, env `NEXT_PUBLIC_API_BASE_URL` wired
- [ ] All 26 endpoints callable through typed API client
- [ ] Golden path wizard → report end-to-end works against the live backend
- [ ] Report render covers all 7 sections with confidence/source tagging
- [ ] EMI simulator, stress-test toggles, break-even chart interactive
- [ ] Auth (register/login/logout/refresh) + guest mode both work
- [ ] EN + HI i18n, INR formatting, mobile-first layout
- [ ] PWA installable + offline fallback
- [ ] Vitest suite green; `tsc --noEmit` clean; eslint clean
- [ ] Zero backend modifications