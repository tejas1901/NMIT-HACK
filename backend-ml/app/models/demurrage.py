from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field

class DemurragePredictRequest(BaseModel):
    port: str = Field(default="IN-BOM", description="Port code e.g. IN-BOM, IN-MAA, US-SAV")
    carrier: str = Field(default="Ground Priority Freight", description="Assigned carrier name")
    container_type: str = Field(default="40ft High Cube Dry", description="Container specification")
    eta: str = Field(default="2026-10-31T18:00:00", description="Estimated time of arrival ISO string")
    dwell_days_so_far: float = Field(default=2.0, ge=0.0, description="Elapsed dwell days at port or terminal")
    weather_risk: float = Field(default=35.0, ge=0.0, le=100.0, description="Computed weather risk score 0-100")
    congestion_index: float = Field(default=1.35, ge=0.5, le=5.0, description="Port or corridor congestion multiplier")
    customs_flags: bool = Field(default=False, description="Whether customs inspection or hold flag is active")
    day_of_week: int = Field(default=3, ge=0, le=6, description="0=Monday, 6=Sunday")
    season: str = Field(default="AUTUMN", description="WINTER, SPRING, SUMMER, AUTUMN, MONSOON")
    cargo_value: float = Field(default=150000.0, ge=0.0, description="Cargo value in local currency / USD")

class ShapContribution(BaseModel):
    feature: str
    impact: float
    description: str

class DemurragePredictResponse(BaseModel):
    demurrage_probability: float
    risk_level: str
    expected_dwell_days: float
    free_days_allowed: int
    chargeable_days: float
    estimated_cost: float
    currency: str = "INR"
    top_shap_contributions: List[ShapContribution]
    recommendation: str

class DemurrageTrainRequest(BaseModel):
    data_path: Optional[str] = None
    test_size: float = 0.2
    n_estimators: int = 150
    max_depth: int = 5
    learning_rate: float = 0.08

class ModelMetrics(BaseModel):
    model_version: str
    trained_at: str
    dataset_rows: int
    train_rows: int
    test_rows: int
    roc_auc: float
    rmse_days: float
    mae_days: float
    accuracy: float
    top_features: List[Dict[str, Any]]
