/**
 * FREIGHTIQ - Demurrage Risk Service
 * Calls the Node Gateway (/api/demurrage/predict) which proxies to FastAPI XGBoost model,
 * with fallback to local estimation if the service is unreachable.
 */

import { apiClient } from './api';
import { RiskLevel } from '../types';

export interface DemurragePredictionRequest {
  port: string;
  carrier: string;
  container_type: string;
  dwell_days_so_far: number;
  weather_risk_score?: number;
  congestion_index?: number;
  customs_hold_flag?: number;
  inspection_required_flag?: number;
  hazardous_cargo_flag?: number;
}

export interface DemurragePredictionResponse {
  demurrage_probability: number;
  risk_level: RiskLevel;
  expected_excess_days: number;
  estimated_cost_inr: number;
  top_contributions: Array<{ feature: string; shap_value: number }>;
  recommendation: string;
}

export async function predictDemurrageRisk(
  params: DemurragePredictionRequest,
  cargoUnitValue: number = 28000
): Promise<DemurragePredictionResponse> {
  // Deterministic local fallback
  let fallbackProb = 40;
  if (params.carrier.toLowerCase().includes('priority') || params.carrier.toLowerCase().includes('air')) {
    fallbackProb += 25;
  }
  fallbackProb += (params.dwell_days_so_far || 2) * 6;
  const clampedProb = Math.min(99.2, Math.max(8.4, fallbackProb));
  const fallbackRisk: RiskLevel =
    clampedProb >= 80 ? 'CRITICAL' : clampedProb >= 55 ? 'HIGH' : clampedProb >= 30 ? 'MODERATE' : 'LOW';
  const fallbackCost = Math.round((clampedProb / 100) * (cargoUnitValue * 0.42));

  const fallback: DemurragePredictionResponse = {
    demurrage_probability: parseFloat(clampedProb.toFixed(1)),
    risk_level: fallbackRisk,
    expected_excess_days: parseFloat((clampedProb / 25).toFixed(1)),
    estimated_cost_inr: fallbackCost,
    top_contributions: [
      { feature: 'dwell_days_so_far', shap_value: 0.35 },
      { feature: 'congestion_index', shap_value: 0.28 },
      { feature: 'weather_risk_score', shap_value: 0.18 },
    ],
    recommendation:
      fallbackRisk === 'CRITICAL'
        ? 'Extreme risk of SLA violation. Mandatory reroute to dedicated express corridor.'
        : fallbackRisk === 'HIGH'
        ? 'High demurrage exposure detected. QpiAI Quantum QUBO expedited slot recommended.'
        : fallbackRisk === 'MODERATE'
        ? 'Normal risk envelope. Continuous Open-Meteo corridor radar surveillance active.'
        : 'Nominal shipment trajectory with high on-time confidence.',
  };

  try {
    const res = await apiClient<DemurragePredictionResponse>(
      '/demurrage/predict',
      {
        method: 'POST',
        body: JSON.stringify(params),
      },
      fallback
    );
    return res.data;
  } catch {
    return fallback;
  }
}
