from typing import List
from ..models.corridors import CorridorKPI, CorridorMetricsResponse

class CorridorService:
    def get_corridor_metrics(self) -> CorridorMetricsResponse:
        corridors = [
            CorridorKPI(
                corridor_id="COR-001",
                corridor_name="NH-48 Golden Quadrilateral",
                code="NH-48",
                origin="Bengaluru Logistics Park",
                destination="Mumbai JNPT Intermodal",
                distance_km=980.0,
                avg_transit_hours=18.5,
                current_avg_speed_kmh=64.2,
                active_vehicles_count=4,
                delay_rate_pct=14.2,
                capacity_utilization_pct=88.5,
                weather_risk_index=32.4,
                risk_level="MODERATE",
                primary_bottleneck="Khandala Ghat Mountain Pass (Ghat gradient + moisture)",
                toll_efficiency_pct=96.8
            ),
            CorridorKPI(
                corridor_id="COR-002",
                corridor_name="NH-44 North-South Highway",
                code="NH-44",
                origin="Bengaluru Logistics Park",
                destination="Hyderabad Bulk ICD",
                distance_km=570.0,
                avg_transit_hours=10.5,
                current_avg_speed_kmh=72.0,
                active_vehicles_count=2,
                delay_rate_pct=8.1,
                capacity_utilization_pct=76.0,
                weather_risk_index=14.0,
                risk_level="LOW",
                primary_bottleneck="Anantapur Bypass toll waypoint",
                toll_efficiency_pct=99.1
            ),
            CorridorKPI(
                corridor_id="COR-003",
                corridor_name="Chennai Sea Port Intermodal Corridor",
                code="CH-01",
                origin="Bengaluru Logistics Park",
                destination="Chennai Sea Port Terminal",
                distance_km=345.0,
                avg_transit_hours=7.0,
                current_avg_speed_kmh=58.5,
                active_vehicles_count=1,
                delay_rate_pct=19.5,
                capacity_utilization_pct=92.0,
                weather_risk_index=26.5,
                risk_level="MODERATE",
                primary_bottleneck="Sriperumbudur industrial belt congestion",
                toll_efficiency_pct=94.5
            )
        ]

        active_fleet = sum(c.active_vehicles_count for c in corridors)
        avg_delay = round(sum(c.delay_rate_pct for c in corridors) / len(corridors), 1)
        avg_util = round(sum(c.capacity_utilization_pct for c in corridors) / len(corridors), 1)

        return CorridorMetricsResponse(
            total_corridors=len(corridors),
            active_fleet_count=active_fleet,
            system_wide_delay_rate_pct=avg_delay,
            average_utilization_pct=avg_util,
            corridors=corridors
        )

corridor_service = CorridorService()
