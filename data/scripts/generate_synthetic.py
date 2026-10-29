"""
FREIGHTIQ - High-Fidelity Synthetic Demurrage & Port Dwell Dataset Generator
Produces >= 100,000 realistic container shipment records with documented statistical
correlations:
- Monsoon / seasonal weather risk factors
- Port congestion vs. dwell time non-linear queuing
- Customs holds and hazardous cargo inspection delays
- Weekend arrival penalties
- Clear labels: synthetic, fully reproducible via seeded RNG.
"""

import os
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

PROCESSED_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "processed")
os.makedirs(PROCESSED_DIR, exist_ok=True)

SEED = 42
NUM_SAMPLES = 105000

PORTS = [
    {"id": "INNSA", "name": "JNPT Nhava Sheva", "base_congestion": 62, "daily_demurrage_inr": 8500},
    {"id": "INMAA", "name": "Chennai Port", "base_congestion": 55, "daily_demurrage_inr": 7200},
    {"id": "INMUN", "name": "Mundra Port", "base_congestion": 48, "daily_demurrage_inr": 9000},
    {"id": "NLRTM", "name": "Port of Rotterdam", "base_congestion": 50, "daily_demurrage_inr": 11500},
    {"id": "SGSIN", "name": "Singapore PSA", "base_congestion": 42, "daily_demurrage_inr": 10500},
    {"id": "USSAV", "name": "Savannah Ocean Terminal", "base_congestion": 68, "daily_demurrage_inr": 12000},
]

CARRIERS = [
    {"id": "MSK", "name": "Maersk Line", "reliability": 0.88, "free_days": 5},
    {"id": "MSC", "name": "Mediterranean Shipping Co", "reliability": 0.84, "free_days": 5},
    {"id": "CMA", "name": "CMA CGM", "reliability": 0.82, "free_days": 5},
    {"id": "HAP", "name": "Hapag-Lloyd", "reliability": 0.86, "free_days": 7},
    {"id": "ONE", "name": "Ocean Network Express", "reliability": 0.85, "free_days": 5},
    {"id": "COS", "name": "COSCO Shipping", "reliability": 0.80, "free_days": 7},
]

CONTAINER_TYPES = ["20ft Standard", "40ft High Cube", "40ft Reefer", "45ft High Cube", "20ft Tank"]


def generate_dataset(n: int = NUM_SAMPLES, seed: int = SEED) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    print(f"Generating {n} synthetic container logistics records with RNG seed {seed}...")

    # Timestamps spanning past 18 months
    base_date = datetime(2025, 1, 1)
    day_offsets = rng.integers(0, 540, size=n)
    dates = [base_date + timedelta(days=int(d), hours=int(rng.integers(0, 24))) for d in day_offsets]

    port_choices = rng.choice(len(PORTS), size=n, p=[0.25, 0.20, 0.20, 0.15, 0.10, 0.10])
    carrier_choices = rng.choice(len(CARRIERS), size=n, p=[0.25, 0.22, 0.18, 0.15, 0.10, 0.10])
    container_type_choices = rng.choice(CONTAINER_TYPES, size=n, p=[0.45, 0.35, 0.10, 0.05, 0.05])

    data = []
    for i in range(n):
        dt = dates[i]
        port = PORTS[port_choices[i]]
        carrier = CARRIERS[carrier_choices[i]]
        c_type = container_type_choices[i]

        month = dt.month
        day_of_week = dt.weekday()
        is_weekend = int(day_of_week >= 5)

        # Monsoon effect on Indian ports (June to September)
        is_indian_port = port["id"] in ["INNSA", "INMAA", "INMUN"]
        monsoon_boost = 25.0 if (is_indian_port and 6 <= month <= 9) else 0.0

        # Congestion Index: base + random variation + seasonal boost
        congestion = np.clip(
            rng.normal(port["base_congestion"] + monsoon_boost * 0.4, 12.0),
            10.0,
            100.0
        )

        # Weather Risk: correlated with month/monsoon and port location
        base_weather_risk = 20.0 + (monsoon_boost * 1.5)
        weather_risk = np.clip(rng.normal(base_weather_risk, 15.0), 0.0, 100.0)

        # Customs and cargo properties
        customs_flag = int(rng.random() < (0.14 + (0.05 if c_type == "20ft Tank" else 0.0)))
        inspection_flag = int(rng.random() < 0.08 or (customs_flag and rng.random() < 0.6))
        hazmat_flag = int(c_type == "20ft Tank" or rng.random() < 0.04)

        free_days = carrier["free_days"]

        # Dwell time generation (gamma distribution driven by congestion, customs, and weather)
        mean_dwell = (
            2.5
            + (congestion / 100.0) * 3.8
            + (weather_risk / 100.0) * 1.8
            + (customs_flag * 3.5)
            + (inspection_flag * 2.2)
            + (hazmat_flag * 1.5)
            + (is_weekend * 0.8)
            + (1.0 - carrier["reliability"]) * 3.0
        )
        # Reefer cold-chain expedite effect: typically cleared faster
        if "Reefer" in c_type:
            mean_dwell *= 0.85

        dwell_days = max(1, int(np.round(rng.gamma(shape=mean_dwell * 1.5, scale=1.0 / 1.5))))

        # Demurrage calculation
        excess_dwell = max(0, dwell_days - free_days)
        demurrage_incurred = int(excess_dwell > 0)
        daily_fee = port["daily_demurrage_inr"] * (1.5 if "Reefer" in c_type else (1.2 if hazmat_flag else 1.0))
        demurrage_cost = excess_dwell * daily_fee

        # Current dwell so far (simulation point for inference)
        dwell_so_far = min(dwell_days, rng.integers(1, max(3, dwell_days + 1)))

        data.append({
            "container_id": f"CONT-{port['id']}-{100000 + i}",
            "shipment_id": f"SHP-{carrier['id']}-{200000 + (i % 25000)}",
            "port_id": port["id"],
            "port_name": port["name"],
            "carrier_id": carrier["id"],
            "carrier_name": carrier["name"],
            "container_type": c_type,
            "eta_timestamp": dt.isoformat(),
            "month": month,
            "day_of_week": day_of_week,
            "is_weekend": is_weekend,
            "free_days_allowed": free_days,
            "dwell_days_actual": dwell_days,
            "dwell_days_so_far": dwell_so_far,
            "congestion_index": round(float(congestion), 2),
            "weather_risk_score": round(float(weather_risk), 2),
            "customs_hold_flag": customs_flag,
            "inspection_required_flag": inspection_flag,
            "hazardous_cargo_flag": hazmat_flag,
            "excess_dwell_days": excess_dwell,
            "demurrage_incurred": demurrage_incurred,
            "demurrage_cost_inr": round(float(demurrage_cost), 2),
            "data_provenance": "synthetic-freightiq-v1.0"
        })

    df = pd.DataFrame(data)
    print(f"Dataset generated. Shape: {df.shape}")
    print(f"Demurrage incurred rate: {df['demurrage_incurred'].mean():.2%}")
    print(f"Average dwell days: {df['dwell_days_actual'].mean():.2f}")
    return df


if __name__ == "__main__":
    df = generate_dataset()
    csv_path = os.path.join(PROCESSED_DIR, "demurrage_synthetic_100k.csv")
    parquet_path = os.path.join(PROCESSED_DIR, "demurrage_synthetic_100k.parquet")

    df.to_csv(csv_path, index=False)
    try:
        df.to_parquet(parquet_path, index=False)
        print(f"Saved Parquet to {parquet_path}")
    except Exception as e:
        print(f"Parquet export skipped ({e}); CSV available at {csv_path}")

    print(f"Successfully exported {len(df)} rows to {csv_path}")
