"""
UdyamSetu AI — FastAPI Application Entry Point.

Starts the AI microservice on port 8000 with:
  - CORS enabled for the Node.js backend
  - Health check endpoint
  - Unified assessment route
  - Granular endpoint routes
  - Structured JSON logging
"""

from __future__ import annotations

import logging
import sys

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes.assessment import router as assessment_router
from app.routes.granular import router as granular_router


# ── Structured logging setup ──────────────────────────────────────────

def _setup_logging() -> None:
    """Configure structlog for JSON or console output."""
    shared_processors = [
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
    ]

    if settings.LOG_FORMAT == "json":
        renderer = structlog.processors.JSONRenderer()
    else:
        renderer = structlog.dev.ConsoleRenderer()

    structlog.configure(
        processors=[
            *shared_processors,
            structlog.processors.format_exc_info,
            renderer,
        ],
        wrapper_class=structlog.make_filtering_bound_logger(
            getattr(logging, settings.LOG_LEVEL, logging.INFO)
        ),
        context_class=dict,
        logger_factory=structlog.PrintLoggerFactory(),
        cache_logger_on_first_use=True,
    )


_setup_logging()
logger = structlog.get_logger(__name__)


# ── FastAPI app ───────────────────────────────────────────────────────

app = FastAPI(
    title="UdyamSetu AI Service",
    description=(
        "Business intelligence engine for rural entrepreneurs. "
        "Transforms structured market data into explainable, "
        "confidence-aware recommendations."
    ),
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow the Node.js backend and frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",   # Next.js frontend
        "http://localhost:4000",   # Node.js backend
        "http://127.0.0.1:3000",
        "http://127.0.0.1:4000",
        "*",                       # Dev convenience — lock down in production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(assessment_router)
app.include_router(granular_router)


# ── Health check ──────────────────────────────────────────────────────

@app.get("/health", tags=["System"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "udyamsetu-ai",
        "version": "0.1.0",
        "llm": {
            "gemini": settings.has_gemini,
            "groq": settings.has_groq,
            "any_available": settings.has_any_llm,
        },
        "config": {
            "gemini_model": settings.GEMINI_MODEL if settings.has_gemini else None,
            "groq_model": settings.GROQ_MODEL if settings.has_groq else None,
            "temperature": settings.LLM_TEMPERATURE,
            "max_retries": settings.LLM_MAX_RETRIES,
        },
    }


@app.on_event("startup")
async def startup_event():
    logger.info(
        "service_started",
        host=settings.HOST,
        port=settings.PORT,
        debug=settings.DEBUG,
        gemini=settings.has_gemini,
        groq=settings.has_groq,
    )
    if not settings.has_any_llm:
        logger.warning(
            "no_llm_configured",
            message=(
                "No LLM API keys found. The service will run with "
                "deterministic fallback responses only. "
                "Set GEMINI_API_KEY or GROQ_API_KEY in .env to enable AI."
            ),
        )
