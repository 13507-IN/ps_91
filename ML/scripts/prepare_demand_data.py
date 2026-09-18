from pathlib import Path
import sys
ROOT = Path(__file__).resolve().parents[1]; sys.path.insert(0, str(ROOT)); sys.path.insert(0, str(ROOT / "src"))
from config import PROCESSED_DIR
from src.demand_prediction.data_loader import load_demand
from src.demand_prediction.preprocessing import validate_and_clean
from src.demand_prediction.feature_engineering import engineer_features
if __name__ == "__main__":
    source = Path(sys.argv[sys.argv.index("--input") + 1]) if "--input" in sys.argv else ROOT / "data/raw/west_demand_training_data.csv"
    engineer_features(validate_and_clean(load_demand(source))).to_csv(PROCESSED_DIR / "demand_features_processed.csv", index=False); print("Demand data prepared")
