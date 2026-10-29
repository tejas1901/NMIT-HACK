import os
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, roc_auc_score,
    mean_absolute_error, mean_squared_error, r2_score
)
import xgboost as xgb

def train_xgboost():
    os.makedirs("models", exist_ok=True)
    data_path = os.path.join("data", "processed_shipments.csv")
    print(f"[*] Loading supply chain data from {data_path}...")
    df = pd.read_csv(data_path)
    print(f"[+] Loaded {len(df):,} shipment records.")

    # 1. Feature Definitions
    categorical_features = [
        'shipping_mode', 'order_region', 'market', 'customer_segment', 'department_name'
    ]
    numerical_features = [
        'days_for_shipment_scheduled', 'order_item_total', 'order_item_quantity',
        'order_item_discount_rate', 'order_month', 'order_day_of_week', 'order_hour'
    ]
    
    target_class = 'late_delivery_risk'
    target_reg = 'penalty_usd'

    X = df[categorical_features + numerical_features]
    y_class = df[target_class]
    y_reg = df[target_reg]

    # 2. Stratified 80/20 Train-Test Split
    print("[*] Splitting dataset into 80% Train / 20% Test...")
    X_train, X_test, y_class_train, y_class_test, y_reg_train, y_reg_test = train_test_split(
        X, y_class, y_reg, test_size=0.20, random_state=42, stratify=y_class
    )
    print(f"    Train set: {len(X_train):,} rows | Test set: {len(X_test):,} rows")

    # 3. Preprocessing Pipeline
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numerical_features),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_features)
        ]
    )

    print("[*] Fitting feature preprocessor...")
    X_train_trans = preprocessor.fit_transform(X_train)
    X_test_trans = preprocessor.transform(X_test)

    cat_encoder = preprocessor.named_transformers_['cat']
    encoded_cat_names = cat_encoder.get_feature_names_out(categorical_features).tolist()
    feature_names = numerical_features + encoded_cat_names

    # 4. Train XGBoost Classifier (Late Delivery Risk)
    print("\n[*] Training XGBoost Classifier for Delay Risk...")
    clf = xgb.XGBClassifier(
        n_estimators=180,
        max_depth=6,
        learning_rate=0.08,
        subsample=0.85,
        colsample_bytree=0.85,
        scale_pos_weight=1.0,
        random_state=42,
        eval_metric="logloss",
        tree_method="hist"
    )
    clf.fit(X_train_trans, y_class_train)

    # Evaluate Classifier
    y_class_pred = clf.predict(X_test_trans)
    y_class_prob = clf.predict_proba(X_test_trans)[:, 1]

    clf_acc = float(accuracy_score(y_class_test, y_class_pred))
    clf_prec = float(precision_score(y_class_test, y_class_pred, zero_division=0))
    clf_rec = float(recall_score(y_class_test, y_class_pred, zero_division=0))
    clf_f1 = float(f1_score(y_class_test, y_class_pred, zero_division=0))
    clf_auc = float(roc_auc_score(y_class_test, y_class_prob))

    print(f"    [XGBoost Classifier] Accuracy:  {clf_acc*100:.2f}%")
    print(f"    [XGBoost Classifier] Precision: {clf_prec*100:.2f}%")
    print(f"    [XGBoost Classifier] Recall:    {clf_rec*100:.2f}%")
    print(f"    [XGBoost Classifier] F1-Score:  {clf_f1:.4f}")
    print(f"    [XGBoost Classifier] ROC-AUC:   {clf_auc:.4f}")

    # 5. Train XGBoost Regressor (Demurrage & Financial Penalty)
    print("\n[*] Training XGBoost Regressor for Demurrage Penalty ($)...")
    reg = xgb.XGBRegressor(
        n_estimators=160,
        max_depth=5,
        learning_rate=0.07,
        subsample=0.85,
        colsample_bytree=0.85,
        random_state=42,
        eval_metric="rmse",
        tree_method="hist"
    )
    reg.fit(X_train_trans, y_reg_train)

    # Evaluate Regressor
    y_reg_pred = reg.predict(X_test_trans)
    reg_mae = float(mean_absolute_error(y_reg_test, y_reg_pred))
    reg_rmse = float(np.sqrt(mean_squared_error(y_reg_test, y_reg_pred)))
    reg_r2 = float(r2_score(y_reg_test, y_reg_pred))

    print(f"    [XGBoost Regressor] MAE:  ${reg_mae:.2f} USD")
    print(f"    [XGBoost Regressor] RMSE: ${reg_rmse:.2f} USD")
    print(f"    [XGBoost Regressor] R2:   {reg_r2:.4f}")

    # 6. Extract Feature Importances
    importances = clf.feature_importances_
    sorted_idx = np.argsort(importances)[::-1]
    top_features = [
        {"feature": feature_names[i], "importance": round(float(importances[i]) * 100, 2)}
        for i in sorted_idx[:10]
    ]

    # 7. Persist Models and Artifacts
    print("\n[*] Saving XGBoost models and preprocessors to models/...")
    joblib.dump(clf, "models/xgboost_classifier.joblib")
    joblib.dump(reg, "models/xgboost_regressor.joblib")
    joblib.dump(preprocessor, "models/xgboost_preprocessor.joblib")

    metadata = {
        "model_engine": "XGBoost 3.2.0 (Extreme Gradient Boosting)",
        "dataset_rows": len(df),
        "train_rows": len(X_train),
        "test_rows": len(X_test),
        "classification_metrics": {
            "accuracy": round(clf_acc, 4),
            "precision": round(clf_prec, 4),
            "recall": round(clf_rec, 4),
            "f1_score": round(clf_f1, 4),
            "roc_auc": round(clf_auc, 4)
        },
        "regression_metrics": {
            "mae_usd": round(reg_mae, 2),
            "rmse_usd": round(reg_rmse, 2),
            "r2_score": round(reg_r2, 4)
        },
        "top_predictive_features": top_features,
        "features": {
            "categorical": categorical_features,
            "numerical": numerical_features,
            "all_features": feature_names
        }
    }

    with open("models/xgboost_metadata.json", "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print("[+] XGBoost training complete! Artifacts saved to models/xgboost_*.joblib and xgboost_metadata.json")
    return metadata

if __name__ == "__main__":
    train_xgboost()
