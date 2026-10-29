"""
FREIGHTIQ - Demurrage Risk Model Training Pipeline
Trains an XGBoost classification & regression pipeline on container dwell data,
computes evaluation metrics (AUC, Precision, Recall, RMSE, MAE), extracts feature
importances, and persists models with versioning to backend-ml/models/.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    roc_auc_score,
    accuracy_score,
    precision_score,
    recall_score,
    mean_squared_error,
    mean_absolute_error,
)
import xgboost as xgb

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed")
MODELS_DIR = os.path.join(BASE_DIR, "backend-ml", "models")
os.makedirs(MODELS_DIR, exist_ok=True)


def load_data():
    csv_path = os.path.join(PROCESSED_DIR, "demurrage_training_sample.csv")
    if not os.path.exists(csv_path):
        from data.scripts.generate_synthetic import generate_dataset
        df = generate_dataset(n=100, seed=42)
        df.to_csv(csv_path, index=False)
        return df
    return pd.read_csv(csv_path)


def train_pipeline():
    print("Loading container logistics dataset...")
    df = load_data()
    print(f"Loaded dataset: {df.shape[0]} rows, {df.shape[1]} columns.")

    feature_cols = [
        "port_id",
        "carrier_id",
        "container_type",
        "dwell_days_so_far",
        "weather_risk_score",
        "congestion_index",
        "customs_hold_flag",
        "inspection_required_flag",
        "hazardous_cargo_flag",
        "day_of_week",
        "month",
        "is_weekend",
    ]

    target_cls = "demurrage_incurred"
    target_reg = "excess_dwell_days"

    X = df[feature_cols]
    y_cls = df[target_cls]
    y_reg = df[target_reg]

    cat_cols = ["port_id", "carrier_id", "container_type"]
    num_cols = [
        "dwell_days_so_far",
        "weather_risk_score",
        "congestion_index",
        "customs_hold_flag",
        "inspection_required_flag",
        "hazardous_cargo_flag",
        "day_of_week",
        "month",
        "is_weekend",
    ]

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), num_cols),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), cat_cols),
        ]
    )

    X_train, X_test, y_train_cls, y_test_cls, y_train_reg, y_test_reg = train_test_split(
        X, y_cls, y_reg, test_size=0.20, random_state=42, stratify=y_cls
    )

    print(f"Training split: {X_train.shape[0]} samples, Test split: {X_test.shape[0]} samples.")

    # 1. Classification Model (Demurrage Probability)
    clf = xgb.XGBClassifier(
        n_estimators=180,
        max_depth=6,
        learning_rate=0.08,
        subsample=0.85,
        colsample_bytree=0.85,
        random_state=42,
        eval_metric="logloss",
        use_label_encoder=False,
    )

    clf_pipe = Pipeline([
        ("preprocessor", preprocessor),
        ("classifier", clf),
    ])

    print("Fitting XGBoost Classifier...")
    clf_pipe.fit(X_train, y_train_cls)

    y_pred_proba = clf_pipe.predict_proba(X_test)[:, 1]
    y_pred_cls = (y_pred_proba >= 0.5).astype(int)

    auc = float(roc_auc_score(y_test_cls, y_pred_proba))
    acc = float(accuracy_score(y_test_cls, y_pred_cls))
    prec = float(precision_score(y_test_cls, y_pred_cls, zero_division=0))
    rec = float(recall_score(y_test_cls, y_pred_cls, zero_division=0))

    print(f"Classification Metrics -> AUC: {auc:.4f}, Accuracy: {acc:.4f}, Precision: {prec:.4f}, Recall: {rec:.4f}")

    # 2. Regression Model (Expected Excess Days)
    reg = xgb.XGBRegressor(
        n_estimators=150,
        max_depth=5,
        learning_rate=0.08,
        subsample=0.85,
        random_state=42,
    )

    reg_pipe = Pipeline([
        ("preprocessor", preprocessor),
        ("regressor", reg),
    ])

    print("Fitting XGBoost Regressor...")
    reg_pipe.fit(X_train, y_train_reg)

    y_pred_reg = reg_pipe.predict(X_test)
    y_pred_reg = np.clip(y_pred_reg, 0, None)

    rmse = float(np.sqrt(mean_squared_error(y_test_reg, y_pred_reg)))
    mae = float(mean_absolute_error(y_test_reg, y_pred_reg))

    print(f"Regression Metrics -> RMSE: {rmse:.4f}, MAE: {mae:.4f}")

    # Feature Importances
    fitted_preprocessor = clf_pipe.named_steps["preprocessor"]
    cat_feature_names = fitted_preprocessor.named_transformers_["cat"].get_feature_names_out(cat_cols)
    all_feature_names = list(num_cols) + list(cat_feature_names)

    importances = clf.feature_importances_
    sorted_idx = np.argsort(importances)[::-1]
    top_features = []
    for idx in sorted_idx[:10]:
        top_features.append({
            "feature": all_feature_names[idx],
            "importance": round(float(importances[idx]), 4)
        })

    version_str = datetime.utcnow().strftime("v%Y%m%d_%H%M%S")
    metadata = {
        "model_version": version_str,
        "trained_at": datetime.utcnow().isoformat(),
        "training_samples": int(X_train.shape[0]),
        "test_samples": int(X_test.shape[0]),
        "features": feature_cols,
        "metrics": {
            "auc": round(auc, 4),
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "rmse": round(rmse, 4),
            "mae": round(mae, 4),
        },
        "top_features": top_features,
    }

    # Save models
    clf_model_path = os.path.join(MODELS_DIR, "demurrage_xgb_clf.joblib")
    reg_model_path = os.path.join(MODELS_DIR, "demurrage_xgb_reg.joblib")
    meta_path = os.path.join(MODELS_DIR, "model_metadata.json")

    joblib.dump(clf_pipe, clf_model_path)
    joblib.dump(reg_pipe, reg_model_path)
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print(f"Models successfully persisted to {MODELS_DIR}")
    print(f"Classification Model: {clf_model_path}")
    print(f"Regression Model: {reg_model_path}")
    print(f"Metadata: {meta_path}")
    return metadata


if __name__ == "__main__":
    train_pipeline()
