from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class WaypointInput(BaseModel):
    id: str
    location_name: str
    lat: float
    lng: float
    stage: str = Field(default="WAYPOINT", description="ORIGIN, WAYPOINT, GHAT PASS, DESTINATION")
    distance_km: float = 0.0

class RouteWaypointsRequest(BaseModel):
    corridor_name: Optional[str] = "NH-48 Golden Quadrilateral"
    waypoints: List[WaypointInput]

class WaypointForecast(BaseModel):
    id: str
    location_name: str
    stage: str
    lat: float
    lng: float
    condition: str
    icon: str
    temperature_c: float
    apparent_temp_c: float
    precipitation_mm: float
    precipitation_prob_pct: int
    wind_kmh: float
    wind_gusts_kmh: float
    visibility_km: float
    weather_risk_score: float
    risk_tier: str
    is_severe: bool
    is_rain: bool
    distance_km: float

class RouteWeatherResponse(BaseModel):
    corridor_name: str
    polled_at: str
    attribution: str = "Weather data by Open-Meteo.com"
    overall_corridor_risk_score: float
    corridor_risk_tier: str
    waypoints_count: int
    waypoints: List[WaypointForecast]
    alerts_triggered: List[str]
