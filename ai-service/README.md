# UdyamSetu AI Service

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
POST /ai/demand-estimate       → Estimate local demand
POST /ai/opportunity-discover  → Detect market gaps
POST /ai/risk-assess           → Risk analysis
POST /ai/recommend             → Business recommendation
POST /ai/action-plan           → 30-day action plan
```

### Health
```
GET /health
```

## LLM Providers

| Provider | Model | Role |
|----------|-------|------|
| Google Gemini | gemini-2.5-flash | Primary |
| Groq | llama-3.3-70b-versatile | Fallback |
| Deterministic | Rule-based | Final fallback |

If no API keys are configured, the service runs entirely on deterministic fallbacks.

## Environment Variables

See `.env.example` for all configurable options.

## Evaluation

```bash
python -m app.evaluation.evaluator
```

Runs 5-10 test scenarios and validates JSON schema compliance, score ranges, and reasoning quality.
