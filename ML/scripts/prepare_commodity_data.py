from pathlib import Path
import sys
import pandas as pd
ROOT = Path(__file__).resolve().parents[1]; sys.path.insert(0, str(ROOT)); sys.path.insert(0, str(ROOT / "src"))
from config import PROCESSED_DIR
from src.commodity_forecasting.data_loader import load_prices
from src.commodity_forecasting.preprocessing import clean_prices

if __name__ == "__main__":
    if "--input" in sys.argv:
        source = Path(sys.argv[sys.argv.index("--input") + 1])
    else:
        source = ROOT / "data/raw/commodity_price.csv"
        if not source.exists():
            source = ROOT / "data/raw/commodity_prices.csv"
    clean_prices(load_prices(source)).to_csv(PROCESSED_DIR / "commodity_prices_processed.csv", index=False)
    print(f"Saved {PROCESSED_DIR / 'commodity_prices_processed.csv'}")
