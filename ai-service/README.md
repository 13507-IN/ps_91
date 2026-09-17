# ArthSetu Service

> Python/FastAPI microservice that transforms structured rural market data into explainable, confidence-aware business intelligence.

## Quick Start

```bash
# 1. Create virtual environment
cd ai-service
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/macOS

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure API keys
# Edit .env and add your GEMINI_API_KEY and/or GROQ_API_KEY

# 4. Run the service
uvicorn app.main:app --reload --port 8000
```

## Architecture

```
Structured Data → Deterministic Engines → LLM Reasoning → Structured JSON
```

- **Deterministic engines** compute numeric scores (market, risk, viability)
- **LLM agents** interpret scores and generate reasoning, SWOT, market gaps, recommendations
- **Guardrails** ensure the AI never invents data or overrides backend calculations

## API Endpoints

### Unified Assessment
```
POST /ai/assessment    → Full business intelligence pipeline
```

### Granular Endpoints (used by Node.js backend)
```
POST /ai/classify-business     → Classify free-text business idea
POST /ai/demand-estimate       → Estimate local demand (ML model, benchmark fallback)
POST /ai/opportunity-discover  → Detect market gaps
POST /ai/risk-assess           → Risk analysis
POST /ai/recommend             → Business recommendation
POST /ai/action-plan           → 30-day action plan
POST /ai/forecast-commodity    → Commodity price forecast (ML model)
```

### Health
```
GET /health
```

## LLM Providers

| Provider | Model | Role |
|----------|-------|------|
| Google Gemini | gemini-3.6-flash | Primary |
| Groq | llama-3.3-70b-versatile | Fallback |
| Deterministic | Rule-based | Final fallback |

If no API keys are configured, the service runs entirely on deterministic fallbacks.

## Environment Variables

See `.env.example` for all configurable options.

## ML Model Integration

The service loads the trained model artifacts produced by the [`ML/`](../ML/README.md)
pipeline and exposes them over the existing granular endpoints:

- `/ai/demand-estimate` uses `ML/models/demand/demand_model.joblib` (XGBoost/
  LightGBM/HistGradientBoosting regressor) and falls back to the benchmark
  heuristic if the model or its dependencies are missing.
- `/ai/forecast-commodity` uses `ML/models/commodity/<commodity>.joblib`
  (Prophet/ARIMA/seasonal-naive bundle) and reports `available=false` when no
  trained model exists for the requested commodity.

Both are loaded lazily at first call via `app/ml/predictor.py`. Point
`ML_MODELS_DIR` at a different location to override the default
(`<repo>/ML/models`). Retraining stays in the ML pipeline — the service only
consumes the artifacts.

The unified `POST /ai/assessment` pipeline also consumes these ML signals as
evidence:

- The market agent receives the ML demand estimate (`market_analysis`).
- The pricing agent receives the next-month commodity forecast (set
  `pricing.commodity`, e.g. `"potato"`) and anchors its recommended price
  range to the forecast, including buy/sell windows and spike alerts.
- Matching reasoning items are added to the output's `reasoning` block.

Forcing the deterministic fallbacks is supported: agents gracefully skip ML
signals that are unavailable.

## Deploying the service

The ML models run **inside** this service — no separate model deployment is
needed — but the trained artifacts must be reachable at startup/at first call:

- Ship the `ML/models/` directory alongside the service, **or**
- Set `ML_MODELS_DIR` to wherever the artifacts live
  (e.g. `ML_MODELS_DIR=/opt/models/arthsetu`).

Verify the wiring after deploy with `GET /health`, which now reports:

```json
"ml": {
  "models_dir": "/path/to/ML/models",
  "demand_model": true,
  "commodities": ["potato.joblib"]
}
```

`demand_model: false` or an empty `commodities` list means the artifacts are
missing — endpoints degrade to benchmark heuristics (`/ai/demand-estimate`) or
return `available:false` (`/ai/forecast-commodity`).

## Evaluation

```bash
python -m app.evaluation.evaluator
```

Runs 5-10 test scenarios and validates JSON schema compliance, score ranges, and reasoning quality.
