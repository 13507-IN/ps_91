from pathlib import Path
import sys
import pandas as pd
ROOT = Path(__file__).resolve().parents[1]; sys.path.insert(0, str(ROOT)); sys.path.insert(0, str(ROOT / "src"))
from src.commodity_forecasting.train import train_commodity
if __name__ == "__main__":
    path = Path(sys.argv[sys.argv.index("--input") + 1]) if "--input" in sys.argv else ROOT / "data/processed/commodity_prices_processed.csv"
    data = pd.read_csv(path, parse_dates=["date"]); commodity = sys.argv[sys.argv.index("--commodity") + 1] if "--commodity" in sys.argv else data.commodity.iloc[0]
    train_commodity(data, ROOT, commodity)
