"""
ArthSetu — Pipeline Evaluator.

Runs the AI pipeline against scenarios defined in dataset.json.
Validates schema compliance, score ranges, and overall quality.

Usage:
    python -m app.evaluation.evaluator
"""

import asyncio
import json
import os
import sys
from pathlib import Path
from pprint import pprint

import structlog

# Ensure app is in path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from app.schemas.input import AssessmentInput
from app.orchestrator import Orchestrator

logger = structlog.get_logger(__name__)


async def run_evaluator() -> None:
    dataset_path = Path(__file__).parent / "dataset.json"
    
    if not dataset_path.exists():
        logger.error("Dataset not found", path=str(dataset_path))
        return

    with open(dataset_path, "r") as f:
        scenarios = json.load(f)

    logger.info("evaluator_start", scenarios_count=len(scenarios))
    
    orchestrator = Orchestrator()
    results = []
    successes = 0

    for i, scenario in enumerate(scenarios, 1):
        sid = scenario["id"]
        logger.info(f"--- Running scenario {i}/{len(scenarios)}: {sid} ---")
        
        try:
            # Parse input
            input_data = AssessmentInput.model_validate(scenario["input"])
            
            # Run pipeline
            output = await orchestrator.generate_assessment(input_data)
            
            # Simple validation checks
            assert 0 <= output.market_score <= 100
            assert 0 <= output.risk_score <= 100
            assert 0 <= output.viability_score <= 100
            assert len(output.risks) > 0
            assert len(output.swot.strengths) > 0
            assert output.recommended_business_model.name != ""
            
            logger.info(
                "scenario_success", 
                id=sid,
                viability_score=output.viability_score,
                confidence=output.confidence
            )
            
            results.append({
                "id": sid,
                "status": "success",
                "scores": {
                    "market": output.market_score,
                    "risk": output.risk_score,
                    "viability": output.viability_score
                },
                "recommendation": output.recommended_business_model.name
            })
            successes += 1
            
        except Exception as exc:
            logger.error("scenario_failed", id=sid, error=str(exc))
            results.append({
                "id": sid,
                "status": "failed",
                "error": str(exc)
            })
            
    print("\n" + "="*50)
    print(f"EVALUATION COMPLETE: {successes}/{len(scenarios)} passed")
    print("="*50)
    
    for r in results:
        status = "PASS" if r["status"] == "success" else "FAIL"
        if r["status"] == "success":
            print(f"{status} {r['id']} -> Viability: {r['scores']['viability']}, Rec: {r['recommendation']}")
        else:
            print(f"{status} {r['id']} -> ERROR: {r['error']}")


if __name__ == "__main__":
    asyncio.run(run_evaluator())
