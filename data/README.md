# FREIGHTIQ - Data Assets & Machine Learning Pipeline

This directory contains the data ingestion pipelines, synthetic dataset generators, and processed training artifacts for the FREIGHTIQ demurrage risk and port congestion models.

---

## 1. Provenance & Dataset Labeling

| Dataset | Type | Provenance / Source | License | Records |
| :--- | :--- | :--- | :--- | :--- |
| `port_weather_historical_openmeteo.csv` | **Real Open Data** | [Open-Meteo Historical Weather Archive API](https://open-meteo.com/en/docs/historical-weather-api) (INNSA, INMAA, INMUN, NLRTM, SGSIN, USSAV) | CC-BY 4.0 | 4,464 hourly records |
| `demurrage_synthetic_100k.csv` / `.parquet` | **Synthetic Benchmark** | Generated via `data/scripts/generate_synthetic.py` with seeded RNG (seed=42) | MIT | 105,000 container rows |

> [!IMPORTANT]
> **SYNTHETIC DATASET DECLARATION**: `data/processed/demurrage_synthetic_100k.csv` is a **high-fidelity synthetic dataset** generated for container dwell time, demurrage occurrence, and port congestion modeling. All rows contain `"data_provenance": "synthetic-freightiq-v1.0"`. Real-world historical distributions, non-linear monsoon queuing, customs inspection hold rates, and carrier reliability metrics were calibrated against maritime benchmarks (UNCTAD Port Performance Indicators and Indian Major Ports Association metrics).

---

## 2. Data Schema & Dictionary

### Container Demurrage Dataset (`demurrage_synthetic_100k.csv`)

| Field | Type | Description | Example / Range |
| :--- | :--- | :--- | :--- |
| `container_id` | String | Unique standard container identification code | `CONT-INNSA-100001` |
| `shipment_id` | String | Consignment tracking identifier | `SHP-MSK-200001` |
| `port_id` | String | UN/LOCODE port code | `INNSA`, `INMAA`, `INMUN`, `NLRTM`, `SGSIN`, `USSAV` |
| `port_name` | String | Port terminal name | `JNPT Nhava Sheva` |
| `carrier_id` | String | Ocean carrier code | `MSK`, `MSC`, `CMA`, `HAP`, `ONE`, `COS` |
| `carrier_name` | String | Ocean carrier commercial name | `Maersk Line` |
| `container_type` | String | ISO standard container equipment type | `20ft Standard`, `40ft High Cube`, `40ft Reefer` |
| `eta_timestamp` | ISO8601 | Estimated Time of Arrival | `2025-06-14T08:30:00` |
| `month` | Integer | Month of arrival (1-12) | `6` |
| `day_of_week` | Integer | Day of week (0=Monday, 6=Sunday) | `5` |
| `is_weekend` | Integer | Binary flag for Saturday/Sunday gate arrival | `0` or `1` |
| `free_days_allowed` | Integer | Carrier contracted demurrage free days | `5` or `7` |
| `dwell_days_actual` | Integer | Total days container spent in port terminal | `1` to `28` days |
| `dwell_days_so_far` | Integer | Days dwell accumulated at time of prediction query | `1` to `12` days |
| `congestion_index` | Float | Port berth and yard congestion index | `10.0` to `100.0` (baseline 40-70) |
| `weather_risk_score` | Float | Waypoint/port severe weather risk factor | `0.0` to `100.0` (higher during monsoon) |
| `customs_hold_flag` | Integer | Binary flag: shipment held for customs document review | `0` or `1` |
| `inspection_required_flag` | Integer | Binary flag: shipment flagged for physical scanning/inspection | `0` or `1` |
| `hazardous_cargo_flag` | Integer | Binary flag: dangerous goods / IMDG class container | `0` or `1` |
| `excess_dwell_days` | Integer | Target: `max(0, dwell_days_actual - free_days_allowed)` | `0` to `22` days |
| `demurrage_incurred` | Integer | Binary Target: `1` if excess_dwell_days > 0, else `0` | `0` or `1` |
| `demurrage_cost_inr` | Float | Total demurrage fee incurred in INR | Calculated with terminal tariff & container multipliers |
| `data_provenance` | String | Data origin label | `synthetic-freightiq-v1.0` |

---

## 3. Training & Evaluation Pipeline

The model training script (`data/scripts/train.py`):
1. Applies `StandardScaler` to numerical features (dwell days, congestion, weather risk, date indicators).
2. Applies `OneHotEncoder` to categorical features (`port_id`, `carrier_id`, `container_type`).
3. Trains an `XGBClassifier` (probability of demurrage) and `XGBRegressor` (predicted excess dwell days).
4. Persists the serialised pipeline models to `backend-ml/models/demurrage_xgb_clf.joblib` and `backend-ml/models/demurrage_xgb_reg.joblib`.
5. Extracts feature importances and writes `backend-ml/models/model_metadata.json`.

To reproduce:
```bash
# 1. Download open data / weather
python data/scripts/download_data.py

# 2. Generate 105k synthetic dataset
python data/scripts/generate_synthetic.py

# 3. Train models and generate metrics
python data/scripts/train.py
```
