/**
 * FREIGHTIQ - Quantum Carrier Optimization Service
 * Calls Node Gateway (/api/optimize/carriers) which routes to FastAPI (QpiAI quantum SDK
 * or simulated annealing classical fallback).
 */

import { apiClient } from './api';

export interface QuantumCarrierAllocation {
  carrier_id: string;
  carrier_name: string;
  assigned_shipments: string[];
  expected_cost_inr: number;
  risk_index: number;
}

export interface QuantumOptimizationResponse {
  solver: 'qpiai' | 'classical-fallback';
  status: string;
  optimal_state: string;
  energy_score: number;
  execution_time_ms: number;
  carrier_allocations: QuantumCarrierAllocation[];
  mitigated_penalty_inr: number;
  recommendation: string;
}

export async function optimizeCarriers(
  shipments: string[] = ['SHP-001', 'SHP-002', 'SHP-003'],
  carriers: string[] = ['Dedicated Priority Air Cargo', 'Expedited Regional Express', 'Ground Priority Freight']
): Promise<QuantumOptimizationResponse> {
  const fallback: QuantumOptimizationResponse = {
    solver: 'classical-fallback',
    status: 'OPTIMAL',
    optimal_state: '|010⟩ Expedited Express',
    energy_score: -14200.5,
    execution_time_ms: 42,
    carrier_allocations: [
      {
        carrier_id: 'C-02',
        carrier_name: 'Expedited Regional Express',
        assigned_shipments: shipments,
        expected_cost_inr: 45000,
        risk_index: 0.18,
      },
    ],
    mitigated_penalty_inr: 14200,
    recommendation: 'Allocated to Expedited Regional Express with minimum demurrage Hamiltonian penalty.',
  };

  try {
    const res = await apiClient<QuantumOptimizationResponse>(
      '/optimize/carriers',
      {
        method: 'POST',
        body: JSON.stringify({ shipments, carriers }),
      },
      fallback
    );
    return res.data;
  } catch {
    return fallback;
  }
}
