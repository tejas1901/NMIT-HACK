from typing import List, Dict, Optional
from pydantic import BaseModel

class CorridorKPI(BaseModel):
    corridor_id: str
    corridor_name: str
    code: str
    origin: str
    destination: str
    distance_km: float
    avg_transit_hours: float
    current_avg_speed_kmh: float
    active_vehicles_count: int
    delay_rate_pct: float
    capacity_utilization_pct: float
    weather_risk_index: float
    risk_level: str
    primary_bottleneck: str
    toll_efficiency_pct: float

class CorridorMetricsResponse(BaseModel):
    total_corridors: int
    active_fleet_count: int
    system_wide_delay_rate_pct: float
    average_utilization_pct: float
    corridors: List[CorridorKPI]
