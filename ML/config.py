"""Configuration for the isolated ML pipelines."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"
RAW_DIR = DATA_DIR / "raw"
PROCESSED_DIR = DATA_DIR / "processed"
SAMPLE_DIR = DATA_DIR / "sample"
MODELS_DIR = ROOT / "models"
OUTPUTS_DIR = ROOT / "outputs"

COMMODITY_TARGET = "modal_price"
COMMODITY_COLUMNS = {
    "commodity": "commodity", "date": "date", "market": "market",
    "district": "district", "state": "state", "min_price": "min_price",
    "max_price": "max_price", "modal_price": "modal_price",
}
COMMODITY_FREQUENCY = "D"
FORECAST_HORIZON_DAYS = 30
SPIKE_THRESHOLDS = {"watch": 0.08, "spike": 0.15}
OUTLIER_ZSCORE = 4.0

DEMAND_TARGET = "demand"
DEMAND_CATEGORY_COLUMN = "business_category"
DEMAND_DISTRICT_COLUMN = "district"
DEMAND_CATEGORIES = []  # Empty means discover categories from the data.
DEMAND_SPLIT_SEED = 42


def ensure_directories() -> None:
    for path in (RAW_DIR, PROCESSED_DIR, SAMPLE_DIR, MODELS_DIR, OUTPUTS_DIR,
                 MODELS_DIR / "commodity", MODELS_DIR / "demand",
                 OUTPUTS_DIR / "commodity", OUTPUTS_DIR / "demand"):
        path.mkdir(parents=True, exist_ok=True)
