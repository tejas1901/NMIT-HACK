import os
import json
import numpy as np
import pandas as pd
from datetime import datetime
from dotenv import load_dotenv

load_dotenv(".env")
load_dotenv("qcloud.env")

# Supabase Client
try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False

# QpiAI Quantum SDK
try:
    from qpiai_quantum import QpiAIQuantumAuth, Circuit
    QPIAI_AVAILABLE = True
except ImportError:
    QPIAI_AVAILABLE = False


class UnifiedDataService:
    """
    Unified Data & Quantum Metadata Service.
    Integrates Supabase (Relational & Real-time Telemetry DB)
    with QpiAI API (Quantum Compute, Experiments & Circuit Database).
    """

    def __init__(self):
        # 1. Initialize Supabase
        self.supabase_url = os.getenv("SUPABASE_URL", "https://iwcqkrzefoawlpugergc.supabase.co")
        self.supabase_key = os.getenv("SUPABASE_SECRET_KEY") or os.getenv("SUPABASE_PUBLISHABLE_KEY")
        self.sb: Client = None

        if SUPABASE_AVAILABLE and self.supabase_url and self.supabase_key:
            try:
                self.sb = create_client(self.supabase_url, self.supabase_key)
                print("[+] Supabase Client initialized successfully.")
            except Exception as e:
                print(f"[!] Warning: Failed to initialize Supabase client: {e}")
        else:
            print("[!] Supabase credentials or package missing.")

        # 2. Initialize QpiAI API
        self.qpiai_key = os.getenv("API_KEY") or os.getenv("QPIAI_API_KEY")
        self.qpiai_user = os.getenv("QPIAI_USERNAME", "tejas19")
        self.qpiai_default_device = os.getenv("QPIAI_DEFAULT_DEVICE", "QpiAI-QSV-Simulator")
        self.qpiai_experiment = os.getenv("QPIAI_EXPERIMENT_NAME", "Default Experiment")
        self.qpiai_authenticated = False
        self.qpiai_resources = []

        if QPIAI_AVAILABLE and self.qpiai_key:
            try:
                QpiAIQuantumAuth.login(api_key=self.qpiai_key)
                self.qpiai_authenticated = True
                print(f"[+] QpiAI API connected: User '{self.qpiai_user}', Target device: {self.qpiai_default_device}")
            except Exception as e:
                print(f"[!] QpiAI login notice: {e}")

    # ====================================================================
    # QpiAI Quantum Metadata Operations
    # ====================================================================
    def get_qpiai_compute_catalog(self) -> list:
        """Fetch available QpiAI quantum backends from QpiAI QCloud API."""
        if not self.qpiai_authenticated:
            return []
        try:
            res = QpiAIQuantumAuth.list_compute_resources()
            return res or []
        except Exception as e:
            print(f"[!] Could not list QpiAI compute resources: {e}")
            return []

    def log_quantum_optimization(self, shipment_id: str, quantum_opt: dict, qasm_code: str = "") -> dict:
        """
        Record a QpiAI quantum circuit run both in QpiAI metadata tracking
        and in the Supabase 'qpiai_quantum_jobs' table.
        """
        record = {
            "shipment_id": shipment_id,
            "experiment_name": quantum_opt.get("target_experiment", self.qpiai_experiment),
            "device_name": quantum_opt.get("target_device", self.qpiai_default_device),
            "quantum_backend": quantum_opt.get("quantum_backend", "QpiAI-QSV-Local"),
            "is_cloud_executed": quantum_opt.get("is_cloud_executed", False),
            "shots": 1000,
            "thetas": quantum_opt.get("thetas", []),
            "qasm_code": qasm_code or quantum_opt.get("qasm_representation", ""),
            "selected_carrier": quantum_opt.get("selected_carrier", {}).get("name", "Unknown"),
            "expedite_cost_usd": float(quantum_opt.get("selected_carrier", {}).get("expedite_cost", 0.0)),
            "net_savings_usd": float(quantum_opt.get("net_financial_savings_usd", 0.0)),
            "status": "SUCCESS" if quantum_opt.get("status") == "OPTIMIZATION_SUCCESS" else "COMPLETED"
        }

        # Insert to Supabase if connected
        if self.sb:
            try:
                res = self.sb.table("qpiai_quantum_jobs").insert(record).execute()
                print(f"[+] QpiAI Quantum Job logged to Supabase: {shipment_id}")
                return res.data
            except Exception as e:
                print(f"[i] Note: Could not insert into Supabase 'qpiai_quantum_jobs' ({e}). Ensure SQL schema is executed.")
        return record

    # ====================================================================
    # Supabase Dataset Ingestion
    # ====================================================================
    def sync_dataset_to_supabase(self, csv_path: str = "data/processed_shipments.csv", limit: int = 50) -> int:
        """
        Uploads processed supply chain shipments into the Supabase 'shipment_datasets' table.
        """
        if not self.sb:
            print("[!] Supabase client not active. Skipping dataset sync.")
            return 0

        if not os.path.exists(csv_path):
            print(f"[!] CSV not found at {csv_path}")
            return 0

        print(f"[*] Ingesting top {limit} shipments from {csv_path} to Supabase 'shipment_datasets'...")
        df = pd.read_csv(csv_path).head(limit)

        records = []
        for _, row in df.iterrows():
            records.append({
                "order_id": str(row.get("order_id", f"ORD-{_}")),
                "shipping_mode": str(row.get("shipping_mode", "Standard Class")),
                "order_region": str(row.get("order_region", "Western Europe")),
                "market": str(row.get("market", "Europe")),
                "customer_segment": str(row.get("customer_segment", "Consumer")),
                "department_name": str(row.get("department_name", "Apparel")),
                "days_for_shipment_scheduled": int(row.get("days_for_shipment_scheduled", 2)),
                "order_item_total": float(row.get("order_item_total", 150.0)),
                "order_item_quantity": int(row.get("order_item_quantity", 1)),
                "order_item_discount_rate": float(row.get("order_item_discount_rate", 0.0)),
                "late_delivery_risk": int(row.get("late_delivery_risk", 0)),
                "penalty_usd": float(row.get("penalty_usd", 0.0)),
                "risk_tier": str(row.get("risk_tier", "LOW"))
            })

        try:
            res = self.sb.table("shipment_datasets").insert(records).execute()
            count = len(res.data) if res.data else len(records)
            print(f"[+] Successfully synced {count} dataset records to Supabase 'shipment_datasets'!")
            return count
        except Exception as e:
            print(f"[i] Supabase dataset sync notice: {e}")
            print("    Please run 'supabase_schema.sql' in your Supabase SQL Editor to initialize tables.")
            return 0

    # ====================================================================
    # Supabase Model Training Runs Logging
    # ====================================================================
    def log_training_run(self, metadata: dict) -> dict:
        """
        Record LightGBM model training evaluation metrics, hyperparameters,
        and top feature importances in Supabase 'model_training_runs'.
        """
        clf_metrics = metadata.get("classification_metrics", {})
        reg_metrics = metadata.get("regression_metrics", {})

        record = {
            "model_name": "FreightGuard Dual-Engine LightGBM",
            "framework": "LightGBM + Scikit-Learn",
            "train_rows": int(metadata.get("train_rows", 0)),
            "test_rows": int(metadata.get("test_rows", 0)),
            "accuracy": float(clf_metrics.get("accuracy", 0.0)),
            "precision_score": float(clf_metrics.get("precision", 0.0)),
            "recall_score": float(clf_metrics.get("recall", 0.0)),
            "f1_score": float(clf_metrics.get("f1_score", 0.0)),
            "roc_auc": float(clf_metrics.get("roc_auc", 0.0)),
            "mae_usd": float(reg_metrics.get("mae_usd", 0.0)),
            "rmse_usd": float(reg_metrics.get("rmse_usd", 0.0)),
            "r2_score": float(reg_metrics.get("r2_score", 0.0)),
            "top_features": metadata.get("top_predictive_features", []),
            "hyperparameters": {
                "n_estimators": 150,
                "learning_rate": 0.08,
                "num_leaves": 31,
                "class_weight": "balanced"
            }
        }

        if self.sb:
            try:
                res = self.sb.table("model_training_runs").insert(record).execute()
                print("[+] Model training run logged to Supabase 'model_training_runs'!")
                return res.data
            except Exception as e:
                print(f"[i] Could not insert to Supabase 'model_training_runs': {e}")
        return record

    # ====================================================================
    # Supabase Real-Time Pipeline Incident Logging
    # ====================================================================
    def log_incident(self, shipment: dict, ml_risk: dict, quantum_opt: dict, genai_report: dict) -> dict:
        """
        Log complete end-to-end incident triage to Supabase 'shipment_incidents'.
        """
        record = {
            "shipment_id": shipment.get("order_id", "ORD-UNKNOWN"),
            "order_region": shipment.get("order_region", "Western Europe"),
            "cargo_department": shipment.get("department_name", "Industrial Technology"),
            "order_value_usd": float(shipment.get("order_item_total", 0.0)),
            "delay_probability_pct": float(ml_risk.get("delay_probability", 0.0)),
            "risk_tier": ml_risk.get("risk_tier", "UNKNOWN"),
            "predicted_penalty_usd": float(ml_risk.get("predicted_penalty_usd", 0.0)),
            "selected_carrier": quantum_opt.get("selected_carrier", {}).get("name", "Unknown"),
            "expedite_cost_usd": float(quantum_opt.get("selected_carrier", {}).get("expedite_cost", 0.0)),
            "net_financial_savings_usd": float(quantum_opt.get("net_financial_savings_usd", 0.0)),
            "quantum_backend": quantum_opt.get("quantum_backend", "QpiAI-QSV-Local"),
            "genai_briefing": genai_report.get("generated_briefing", ""),
            "dispatch_status": "DISPATCHED"
        }

        if self.sb:
            try:
                res = self.sb.table("shipment_incidents").insert(record).execute()
                print(f"[+] Incident #{record['shipment_id']} logged to Supabase 'shipment_incidents'!")
                return res.data
            except Exception as e:
                print(f"[i] Could not insert to Supabase 'shipment_incidents': {e}")
        return record


# Quick self-test when run directly
if __name__ == "__main__":
    service = UnifiedDataService()
    print("[*] UnifiedDataService ready.")
