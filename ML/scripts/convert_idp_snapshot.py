"""Convert the IDP AGMARKNET snapshot into the raw commodity schema and save to data/raw/commodity_prices.csv."""
from __future__ import annotations

import pandas as pd
from pathlib import Path

SOURCE = Path(r"C:\Users\User\AppData\Local\Temp\opencode\apmc-arrivals-and-prices.csv")
TARGET = Path(r"D:\My Code\ps_91\ML\data\raw\commodity_prices.csv")

COLUMNS = ["commodity", "date", "market", "district", "state", "min_price", "max_price", "modal_price"]

rename = {
    "commodity_name": "commodity",
    "market_center_name": "market",
    "district_name": "district",
    "state_name": "state",
}

first = True
row_count = 0
with TARGET.open("w", encoding="utf-8", newline="") as out:
    for chunk in pd.read_csv(SOURCE, usecols=list(rename) + ["date", "min_price", "max_price", "modal_price"], chunksize=250_000, low_memory=False):
        chunk = chunk.rename(columns=rename)
        chunk["commodity"] = chunk["commodity"].astype(str).str.strip().str.title()
        chunk["date"] = pd.to_datetime(chunk["date"], errors="coerce")
        chunk = chunk.dropna(subset=["date", "commodity", "modal_price"])
        chunk["min_price"] = pd.to_numeric(chunk["min_price"], errors="coerce")
        chunk["max_price"] = pd.to_numeric(chunk["max_price"], errors="coerce")
        chunk["modal_price"] = pd.to_numeric(chunk["modal_price"], errors="coerce")
        chunk = chunk[COLUMNS]
        chunk.to_csv(out, index=False, header=first)
        first = False
        row_count += len(chunk)
        print(f"wrote {len(chunk)} rows (cumulative {row_count})", flush=True)

print(f"DONE: {row_count} total rows -> {TARGET}")