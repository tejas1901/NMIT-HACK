import os
import json
import pandas as pd
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv(".env")

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://iwcqkrzefoawlpugergc.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_SECRET_KEY")

if not SUPABASE_KEY:
    print("[-] Supabase service key not found in .env")
    exit(1)

sb: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def sync():
    csv_path = os.path.join("data", "processed_shipments.csv")
    if not os.path.exists(csv_path):
        print(f"[-] {csv_path} not found.")
        return

    print(f"[*] Ingesting datasets to Supabase at {SUPABASE_URL}...")
    df = pd.read_csv(csv_path).head(100) # Sync top 100 integrated records
    
    # 1. Sync Shipment Datasets
    records = []
    for _, row in df.iterrows():
        records.append({
            "order_id": str(row.get("order_id", "")),
            "shipping_mode": str(row.get("shipping_mode", "Standard Class")),
            "order_region": str(row.get("order_region", "North America")),
            "market": str(row.get("market", "USCA")),
            "customer_segment": str(row.get("customer_segment", "Corporate")),
            "department_name": str(row.get("department_name", "General")),
            "days_for_shipment_scheduled": int(row.get("days_for_shipment_scheduled", 3)),
            "order_item_total": float(row.get("order_item_total", 150.0)),
            "order_item_quantity": int(row.get("order_item_quantity", 1)),
            "order_item_discount_rate": float(row.get("order_item_discount_rate", 0.0)),
            "late_delivery_risk": int(row.get("late_delivery_risk", 0)),
            "penalty_usd": float(row.get("penalty_usd", 0.0)),
            "risk_tier": str(row.get("risk_tier", "LOW"))
        })

    try:
        res = sb.table("shipment_datasets").upsert(records).execute()
        print(f"[+] Successfully synced {len(records)} integrated shipment records to Supabase 'shipment_datasets'!")
    except Exception as e:
        print(f"[-] Failed to sync to 'shipment_datasets': {e}")
        print("    --> Please create the tables by running 'supabase_schema.sql' in the Supabase SQL Editor!")
        return

    # 2. Sync Model Training Metrics
    xgb_meta_path = os.path.join("models", "xgboost_metadata.json")
    if os.path.exists(xgb_meta_path):
        with open(xgb_meta_path, "r", encoding="utf-8") as f:
            meta = json.load(f)
        try:
            m_res = sb.table("model_training_runs").insert({
                "model_name": "XGBoost 3.2.0 (Integrated 5 Datasets)",
                "framework": "XGBoost",
                "train_rows": meta.get("train_rows", 47124),
                "test_rows": meta.get("test_rows", 11781),
                "accuracy": meta.get("classification_metrics", {}).get("accuracy"),
                "precision_score": meta.get("classification_metrics", {}).get("precision"),
                "recall_score": meta.get("classification_metrics", {}).get("recall"),
                "f1_score": meta.get("classification_metrics", {}).get("f1_score"),
                "roc_auc": meta.get("classification_metrics", {}).get("roc_auc"),
                "mae_usd": meta.get("regression_metrics", {}).get("mae_usd"),
                "rmse_usd": meta.get("regression_metrics", {}).get("rmse_usd"),
                "r2_score": meta.get("regression_metrics", {}).get("r2_score"),
                "top_features": meta.get("top_predictive_features", [])
            }).execute()
            print("[+] Successfully synced ML training metrics to Supabase 'model_training_runs'!")
        except Exception as e:
            print(f"[-] Failed to sync to 'model_training_runs': {e}")

if __name__ == "__main__":
    sync()
