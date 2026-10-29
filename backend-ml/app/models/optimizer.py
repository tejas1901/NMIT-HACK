from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field

class CarrierCandidate(BaseModel):
    id: int
    name: str
    expedite_cost: float
    mitigation_rate: float
    residual_penalty: float
    speed_days: str
    reliability_score: str
    total_expected_cost: float
    net_savings_vs_status_quo: float

class CarrierOptimizeRequest(BaseModel):
    shipment_id: Optional[str] = "CRG-19402"
    predicted_penalty: float = Field(default=8500.0, ge=0.0)
    delay_prob: float = Field(default=78.5, ge=0.0, le=100.0)
    base_order_value: float = Field(default=250000.0, ge=0.0)
    shots: int = Field(default=1000, ge=100, le=10000)

class BasisStateShot(BaseModel):
    state: str
    shots: int
    percentage: float
    color: str
    is_ground_state: bool = False

class CarrierOptimizeResponse(BaseModel):
    status: str
    solver: Literal["qpiai", "classical-fallback"]
    execution_backend: str
    is_cloud_executed: bool
    cloud_error_reason: Optional[str] = None
    shots: int
    candidates: List[CarrierCandidate]
    selected_carrier: CarrierCandidate
    net_financial_savings: float
    energy_levels: Dict[str, float]
    basis_states: List[BasisStateShot]
    qasm_circuit: str
    formula_latex: str = r"H = \sum_{i} C_i x_i + \lambda (\sum_i x_i - 1)^2"
