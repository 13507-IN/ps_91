from __future__ import annotations
from pathlib import Path
import joblib
import pandas as pd

def predict_demand(data: pd.DataFrame, root: Path) -> pd.DataFrame:
    bundle = joblib.load(root / "models" / "demand" / "demand_model.joblib")
    output = data.copy()
    output["predicted_demand"] = bundle["pipeline"].predict(output[bundle["features"]])
    return output
