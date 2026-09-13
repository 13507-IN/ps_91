from pathlib import Path
import sys
import pandas as pd
ROOT = Path(__file__).resolve().parents[1]; sys.path.insert(0, str(ROOT)); sys.path.insert(0, str(ROOT / "src"))
from src.demand_prediction.train import train_demand
if __name__ == "__main__": train_demand(pd.read_csv(ROOT / "data/sample/demand_sample.csv"), ROOT); print("Demand smoke test passed")
