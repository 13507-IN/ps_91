"""Filter the all-India IDP AGMARKNET snapshot to West Bengal and save as data/raw/wb_commodity_prices_full.csv (pipeline schema)."""
from __future__ import annotations

import pandas as pd
from pathlib import Path

SOURCE = Path(r"D:\My Code\ps_91\ML\data\raw\commodity_prices.csv")
TARGET = Path(r"D:\My Code\ps_91\ML\data\raw\west_bengal_commodity_prices_full.csv")

COLUMNS = ["commodity", "date", "market", "district", "state", "min_price", "max_price", "modal_price"]

first = True
row_count = 0
with TARGET.open("w", encoding="utf-8", newline="") as out:
    for chunk in pd.read_csv(SOURCE, usecols=COLUMNS, chunksize=250_000, low_memory=False):
        chunk["state"] = chunk["state"].astype(str).str.strip()
        chunk = chunk[chunk["state"].str.upper().str.contains("WEST BENGAL")]
        chunk["date"] = pd.to_datetime(chunk["date"], errors="coerce")
        chunk = chunk.dropna(subset=["date", "commodity", "modal_price"])
        chunk.to_csv(out, index=False, header=first)
        first = False
        row_count += len(chunk)
        print(f"WB rows this chunk: {len(chunk)} (cumulative {row_count})", flush=True)

print(f"DONE: {row_count} West Bengal rows -> {TARGET}")