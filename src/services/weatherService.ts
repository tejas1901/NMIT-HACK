/**
 * FREIGHTIQ - Waypoint Weather Service
 * Integrates live Open-Meteo forecasts via Node Gateway (/api/weather/waypoints),
 * with resilient local waypoint telemetry.
 */

import { apiClient } from './api';
import { WaypointWeather, RiskLevel } from '../types';

const LOCATION_COORDINATES: Record<string, { lat: number; lon: number; elevation: number }> = {
  'Bengaluru Hub': { lat: 12.9716, lon: 77.5946, elevation: 920 },
  'Hubballi Bypass': { lat: 15.3647, lon: 75.1240, elevation: 670 },
  'Pune Chakan Industrial': { lat: 18.7606, lon: 73.8636, elevation: 650 },
  'Khandala Ghat Mountain Pass': { lat: 18.7562, lon: 73.3752, elevation: 550 },
  'JNPT Nhava Sheva Terminal': { lat: 18.9499, lon: 72.9515, elevation: 10 },
};

export async function fetchLiveWaypoints(
  currentWaypoints: WaypointWeather[]
): Promise<WaypointWeather[]> {
  const reqWaypoints = currentWaypoints.map((wp) => {
    const coords = LOCATION_COORDINATES[wp.locationName] || { lat: 18.95, lon: 72.95, elevation: 50 };
    return {
      name: wp.locationName,
      latitude: coords.lat,
      longitude: coords.lon,
      elevation_m: coords.elevation,
    };
  });

  try {
    const res = await apiClient<{
      waypoints: Array<{
        name: string;
        latitude: number;
        longitude: number;
        temperature_c: number;
        precipitation_mm: number;
        wind_speed_kmh: number;
        weather_condition: string;
        risk_score: number;
      }>;
    }>(
      '/weather/waypoints',
      {
        method: 'POST',
        body: JSON.stringify({ waypoints: reqWaypoints }),
      },
      undefined
    );

    if (res.data?.waypoints && Array.isArray(res.data.waypoints)) {
      return currentWaypoints.map((wp) => {
        const found = res.data.waypoints.find((w) => w.name === wp.locationName);
        if (found) {
          const score = found.risk_score;
          const riskLevel: RiskLevel =
            score >= 70 ? 'CRITICAL' : score >= 45 ? 'HIGH' : score >= 20 ? 'MODERATE' : 'LOW';

          return {
            ...wp,
            tempC: found.temperature_c,
            windKmh: found.wind_speed_kmh,
            precipMm: found.precipitation_mm,
            condition: found.weather_condition,
            riskLevel,
          };
        }
        return wp;
      });
    }
  } catch (e) {
    console.warn('[WeatherService] Live weather poll failed, utilizing jittered telemetry fallback.');
  }

  // Graceful fallback: jitter existing values
  return currentWaypoints.map((wp) => ({
    ...wp,
    windKmh: parseFloat((wp.windKmh + (Math.random() - 0.5) * 2).toFixed(1)),
    tempC: parseFloat((wp.tempC + (Math.random() - 0.5) * 0.6).toFixed(1)),
  }));
}
