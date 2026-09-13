from pathlib import Path
import sys
import pandas as pd
ROOT = Path(__file__).resolve().parents[1]; sys.path.insert(0, str(ROOT)); sys.path.insert(0, str(ROOT / "src"))
from config import OUTPUTS_DIR
from src.demand_prediction.data_loader import load_demand
from src.demand_prediction.preprocessing import validate_and_clean
from src.demand_prediction.feature_engineering import engineer_features
from src.demand_prediction.predict import predict_demand
if __name__ == "__main__":
    path = Path(sys.argv[sys.argv.index("--input") + 1]) if "--input" in sys.argv else ROOT / "data/sample/demand_sample.csv"
    result = predict_demand(engineer_features(validate_and_clean(load_demand(path))), ROOT); result.to_csv(OUTPUTS_DIR / "demand" / "demand_predictions.csv", index=False); print(result[["district", "business_category", "predicted_demand"]].to_string(index=False))
