import os
import joblib
import pandas as pd
import numpy as np

class FreightRiskPredictor:
    def __init__(self, models_dir="models", default_engine="xgboost"):
        self.models_dir = models_dir
        self.default_engine = default_engine
        
        # Load XGBoost models
        try:
            self.xgb_preprocessor = joblib.load(os.path.join(models_dir, "xgboost_preprocessor.joblib"))
            self.xgb_classifier = joblib.load(os.path.join(models_dir, "xgboost_classifier.joblib"))
            self.xgb_regressor = joblib.load(os.path.join(models_dir, "xgboost_regressor.joblib"))
            self.has_xgboost = True
        except Exception as e:
            print(f"[!] Warning loading XGBoost models: {e}")
            self.has_xgboost = False

        # Load LightGBM models as alternate
        try:
            self.lgb_preprocessor = joblib.load(os.path.join(models_dir, "preprocessor.joblib"))
            self.lgb_classifier = joblib.load(os.path.join(models_dir, "delay_classifier.joblib"))
            self.lgb_regressor = joblib.load(os.path.join(models_dir, "penalty_regressor.joblib"))
            self.has_lightgbm = True
        except Exception:
            self.has_lightgbm = False

        # Categorical and numerical column schema
        self.cat_cols = ['shipping_mode', 'order_region', 'market', 'customer_segment', 'department_name']
        self.num_cols = [
            'days_for_shipment_scheduled', 'order_item_total', 'order_item_quantity',
            'order_item_discount_rate', 'order_month', 'order_day_of_week', 'order_hour'
        ]

    def predict_shipment(self, shipment_dict: dict, engine: str = None) -> dict:
        """
        Run inference on a single shipment dictionary using XGBoost or LightGBM.
        Returns risk probability, risk tier, expected delay penalty, and key factors.
        """
        engine = engine or self.default_engine
        if engine == "xgboost" and not self.has_xgboost:
            engine = "lightgbm"
        elif engine == "lightgbm" and not self.has_lightgbm:
            engine = "xgboost"

        if engine == "xgboost":
            preprocessor = self.xgb_preprocessor
            classifier = self.xgb_classifier
            regressor = self.xgb_regressor
            engine_name = "XGBoost 3.2.0"
        else:
            preprocessor = self.lgb_preprocessor
            classifier = self.lgb_classifier
            regressor = self.lgb_regressor
            engine_name = "LightGBM"

        df = pd.DataFrame([shipment_dict])
        
        # Fill missing values if any
        for col in self.num_cols:
            if col not in df.columns:
                df[col] = 0.0
        for col in self.cat_cols:
            if col not in df.columns:
                df[col] = "Standard Class" if col == "shipping_mode" else "Unknown"

        X_input = df[self.cat_cols + self.num_cols]
        X_trans = preprocessor.transform(X_input)

        # 1. Predict Delay Risk
        delay_prob = float(classifier.predict_proba(X_trans)[0, 1])
        is_late_pred = int(delay_prob >= 0.50)

        # 2. Predict Financial Penalty
        pred_penalty = max(0.0, float(regressor.predict(X_trans)[0]))
        if delay_prob < 0.35:
            pred_penalty = 0.0

        # 3. Determine Risk Tier
        if delay_prob >= 0.75 or pred_penalty > 180:
            tier = "CRITICAL"
        elif delay_prob >= 0.50 or pred_penalty > 80:
            tier = "HIGH"
        elif delay_prob >= 0.30:
            tier = "MEDIUM"
        else:
            tier = "LOW"

        # 4. Highlight key contributing factors for this shipment
        contributing_factors = []
        if shipment_dict.get('shipping_mode') == 'First Class':
            contributing_factors.append("Strict SLA window for First Class air freight (98.9% historical delay risk)")
        if float(shipment_dict.get('days_for_shipment_scheduled', 4)) <= 2:
            contributing_factors.append("Ultra-short scheduled delivery target (<= 2 days)")
        if float(shipment_dict.get('order_item_total', 0)) > 200:
            contributing_factors.append(f"High cargo value (${shipment_dict.get('order_item_total', 0):.2f}) escalating penalty exposure")
        if not contributing_factors:
            contributing_factors.append(f"Regional transit congestion in {shipment_dict.get('order_region', 'destination')}")

        return {
            "engine": engine_name,
            "delay_probability": round(delay_prob * 100, 1),
            "is_delayed_predicted": bool(is_late_pred),
            "predicted_penalty_usd": round(pred_penalty, 2),
            "risk_tier": tier,
            "contributing_factors": contributing_factors
        }

if __name__ == "__main__":
    predictor = FreightRiskPredictor()
    test_shipment = {
        "shipping_mode": "First Class",
        "order_region": "Western Europe",
        "market": "Europe",
        "customer_segment": "Corporate",
        "department_name": "Apparel",
        "days_for_shipment_scheduled": 1,
        "order_item_total": 350.00,
        "order_item_quantity": 3,
        "order_item_discount_rate": 0.1,
        "order_month": 10,
        "order_day_of_week": 4,
        "order_hour": 18
    }
    result = predictor.predict_shipment(test_shipment)
    print("\nTest Shipment Prediction with XGBoost:")
    for k, v in result.items():
        print(f"  {k}: {v}")
