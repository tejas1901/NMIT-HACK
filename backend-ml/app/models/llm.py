from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class LLMInsightRequest(BaseModel):
    shipment_id: Optional[str] = "CRG-19402"
    cargo: Optional[str] = "High-Precision Aerospace Avionics"
    cargo_value: Optional[float] = 250000.0
    corridor: Optional[str] = "NH-48 Bengaluru - Mumbai JNPT"
    shipping_mode: Optional[str] = "First Class Expedited"
    demurrage_probability: float = Field(default=82.4, ge=0.0, le=100.0)
    demurrage_risk_tier: str = Field(default="CRITICAL")
    demurrage_cost_estimated: float = Field(default=12500.0, ge=0.0)
    top_contributing_factors: List[str] = Field(default_factory=lambda: [
        "Monsoon crosswind gusts > 35 km/h along Khandala Ghat",
        "JNPT Port yard crane dwell time exceeded 48 hours",
        "High-density weekend freight congestion on NH-48"
    ])
    quantum_carrier_selected: Optional[str] = "Expedited Regional Express"
    quantum_net_savings: Optional[float] = 7800.0
    quantum_solver: Optional[str] = "QpiAI-QSV-Local"
    user_query: Optional[str] = None

class LLMInsightResponse(BaseModel):
    status: str
    engine_used: str  # "ollama", "gemini", or "deterministic-template"
    model_name: str
    incident_assessment: str
    quantum_strategy_rationale: str
    dispatch_rerouting_notice: str
    full_markdown: str
    badges: List[str]
