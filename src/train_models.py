import os
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, roc_auc_score,
    mean_absolute_error, mean_squared_error, r2_score
)
import lightgbm as lgb

def train():
    os.makedirs("models", exist_ok=True)
    data_path = os.path.join("data", "processed_shipments.csv")
    print(f"[*] Loading processed data from {data_path}...")
    df = pd.read_csv(data_path)
    print(f"[+] Loaded {len(df):,} records.")

    # 1. Define Features & Targets (Guaranteed zero data leakage)
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

    # 2. Train-Test Split (80/20 stratified split)
    print("[*] Splitting dataset into 80% Train / 20% Test...")
    X_train, X_test, y_class_train, y_class_test, y_reg_train, y_reg_test = train_test_split(
        X, y_class, y_reg, test_size=0.20, random_state=42, stratify=y_class
    )
    print(f"    Train set: {len(X_train):,} samples | Test set: {len(X_test):,} samples")

    # 3. Create Preprocessor Pipeline
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numerical_features),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_features)
        ]
    )

    print("[*] Fitting feature preprocessor...")
    X_train_transformed = preprocessor.fit_transform(X_train)
    X_test_transformed = preprocessor.transform(X_test)

    # Extract feature names after encoding
    cat_encoder = preprocessor.named_transformers_['cat']
    encoded_cat_names = cat_encoder.get_feature_names_out(categorical_features).tolist()
    all_feature_names = numerical_features + encoded_cat_names

    # 4. Train Model 1: Delay Risk Classifier (LightGBM)
    print("\n[*] Training Model 1: Delay Risk Classifier (LightGBM)...")
    clf = lgb.LGBMClassifier(
        n_estimators=150,
        learning_rate=0.08,
        num_leaves=31,
        random_state=42,
        class_weight='balanced',
        verbose=-1
    )
    clf.fit(X_train_transformed, y_class_train)

    # Evaluate Classifier
    y_class_pred = clf.predict(X_test_transformed)
    y_class_proba = clf.predict_proba(X_test_transformed)[:, 1]

    acc = accuracy_score(y_class_test, y_class_pred)
    prec = precision_score(y_class_test, y_class_pred)
    rec = recall_score(y_class_test, y_class_pred)
    f1 = f1_score(y_class_test, y_class_pred)
    roc_auc = roc_auc_score(y_class_test, y_class_proba)

    # 5. Train Model 2: Demurrage & Penalty Regressor (LightGBM)
    print("[*] Training Model 2: Financial Penalty Regressor (LightGBM)...")
    reg = lgb.LGBMRegressor(
        n_estimators=150,
        learning_rate=0.08,
        num_leaves=31,
        random_state=42,
        verbose=-1
    )
    reg.fit(X_train_transformed, y_reg_train)

    # Evaluate Regressor
    y_reg_pred = reg.predict(X_test_transformed)
    mae = mean_absolute_error(y_reg_test, y_reg_pred)
    rmse = np.sqrt(mean_squared_error(y_reg_test, y_reg_pred))
    r2 = r2_score(y_reg_test, y_reg_pred)

    # 6. Extract Top Feature Importances for GenAI Explainability
    clf_importances = clf.feature_importances_
    sorted_idx = np.argsort(clf_importances)[::-1]
    top_features = [
        {"feature": all_feature_names[i], "importance": float(clf_importances[i])}
        for i in sorted_idx[:10]
    ]

    # 7. Persist Models & Pipelines
    print("\n[*] Saving trained models and preprocessor...")
    joblib.dump(preprocessor, os.path.join("models", "preprocessor.joblib"))
    joblib.dump(clf, os.path.join("models", "delay_classifier.joblib"))
    joblib.dump(reg, os.path.join("models", "penalty_regressor.joblib"))

    # Save Model Metadata & Evaluation Metrics
    metadata = {
        "dataset_rows": len(df),
        "train_rows": len(X_train),
        "test_rows": len(X_test),
        "classification_metrics": {
            "accuracy": round(float(acc), 4),
            "precision": round(float(prec), 4),
            "recall": round(float(rec), 4),
            "f1_score": round(float(f1), 4),
            "roc_auc": round(float(roc_auc), 4)
        },
        "regression_metrics": {
            "mae_usd": round(float(mae), 2),
            "rmse_usd": round(float(rmse), 2),
            "r2_score": round(float(r2), 4)
        },
        "top_predictive_features": top_features,
        "features": {
            "categorical": categorical_features,
            "numerical": numerical_features
        }
    }
    with open(os.path.join("models", "model_metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2)

    # 8. Display Results Summary for Judges
    print("\n" + "="*55)
    print("      STEP 2: PREDICTIVE ML MODEL EVALUATION RESULTS")
    print("="*55)
    print(" MODEL 1: DELAY RISK CLASSIFICATION (LightGBM)")
    print(f"  * Accuracy:   {acc*100:.2f}%")
    print(f"  * Precision:  {prec*100:.2f}%")
    print(f"  * Recall:     {rec*100:.2f}%")
    print(f"  * F1 Score:   {f1*100:.2f}%")
    print(f"  * ROC-AUC:    {roc_auc:.4f}")
    print("-"*55)
    print(" MODEL 2: DEMURRAGE / PENALTY REGRESSION (LightGBM)")
    print(f"  * Mean Absolute Error (MAE): ${mae:.2f} USD")
    print(f"  * Root Mean Sq Error (RMSE): ${rmse:.2f} USD")
    print(f"  * R-squared (R²):            {r2:.4f}")
    print("-"*55)
    print(" TOP 5 MOST PREDICTIVE FEATURES (FOR GENAI EXPLANATIONS):")
    for rank, item in enumerate(top_features[:5], 1):
        print(f"  {rank}. {item['feature']:<35} (Score: {item['importance']:.0f})")
    print("="*55 + "\n")
    print("[+] All models saved successfully in models/")

    # 9. Sync Dataset & Log Training Metrics to Supabase + QpiAI API
    print("\n[*] Syncing Telemetry & Model Metrics with Supabase & QpiAI API...")
    try:
        try:
            from src.unified_data_service import UnifiedDataService
        except ImportError:
            import sys
            sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            from src.unified_data_service import UnifiedDataService

        db_service = UnifiedDataService()
        # Ingest representative dataset into Supabase
        db_service.sync_dataset_to_supabase(data_path, limit=50)
        # Log model training run into Supabase
        db_service.log_training_run(metadata)
        print("[+] Unified Supabase & QpiAI tracking completed!")
    except Exception as sync_err:
        print(f"[!] Notice during cloud DB sync: {sync_err}")

if __name__ == "__main__":
    train()
