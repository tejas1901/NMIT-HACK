/**
 * FREIGHTIQ - Fleet & Corridor Telematics Service
 * Fetches corridor status and telemetry from Node Gateway (/api/fleet/corridors).
 */

import { apiClient } from './api';

export interface CorridorKpi {
  corridor_id: string;
  name: string;
  distance_km: number;
  average_transit_hours: number;
  delay_rate_percent: number;
  fleet_utilization_percent: number;
  weather_risk_index: number;
  status: 'CLEAR' | 'MODERATE_DELAY' | 'SEVERE_CONGESTION';
}

export async function fetchCorridorKpis(): Promise<CorridorKpi[]> {
  const fallback: CorridorKpi[] = [
    {
      corridor_id: 'CORR-NH48',
      name: 'NH-48 (Bengaluru → JNPT Port)',
      distance_km: 980,
      average_transit_hours: 21.4,
      delay_rate_percent: 6.2,
      fleet_utilization_percent: 92.4,
      weather_risk_index: 24.5,
      status: 'CLEAR',
    },
    {
      corridor_id: 'CORR-NH44',
      name: 'NH-44 (Chennai → Bengaluru)',
      distance_km: 350,
      average_transit_hours: 7.2,
      delay_rate_percent: 4.1,
      fleet_utilization_percent: 88.0,
      weather_risk_index: 18.0,
      status: 'CLEAR',
    },
  ];

  try {
    const res = await apiClient<{ corridors: CorridorKpi[] }>(
      '/fleet/corridors',
      { method: 'GET' },
      { corridors: fallback }
    );
    return res.data.corridors;
  } catch {
    return fallback;
  }
}
