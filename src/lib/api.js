// Frontend API client for FREIGHTIQ backend
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

/**
 * Predict shipment delay risk via ML model.
 * @param {Object} shipmentData - Shipment fields matching ShipmentInput schema
 */
export async function predictShipment(shipmentData) {
  const res = await fetch(`${API_BASE}/api/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(shipmentData),
  })
  return res.json()
}

/**
 * Run the full triage pipeline: ML → Quantum → GenAI → n8n → Supabase.
 * @param {Object} shipmentData - Shipment fields matching ShipmentInput schema
 */
export async function triageShipment(shipmentData) {
  const res = await fetch(`${API_BASE}/api/triage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(shipmentData),
  })
  return res.json()
}

/**
 * Run QpiAI quantum carrier optimization for a shipment.
 * @param {Object} shipmentData - Shipment fields matching ShipmentInput schema
 */
export async function optimizeCarrier(shipmentData) {
  const res = await fetch(`${API_BASE}/api/optimize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(shipmentData),
  })
  return res.json()
}

/**
 * Fetch recent shipment incidents stored in Supabase.
 * @param {number} limit - Max number of records to return
 */
export async function getIncidents(limit = 20) {
  const res = await fetch(`${API_BASE}/api/incidents?limit=${limit}`)
  return res.json()
}

/**
 * Fetch dashboard aggregate statistics.
 */
export async function getStats() {
  const res = await fetch(`${API_BASE}/api/stats`)
  return res.json()
}

/**
 * Fetch shipment dataset samples from Supabase.
 * @param {number} limit - Max number of records to return
 */
export async function getShipments(limit = 50) {
  const res = await fetch(`${API_BASE}/api/shipments?limit=${limit}`)
  return res.json()
}

/**
 * Fetch QpiAI quantum job history from Supabase.
 * @param {number} limit - Max number of records to return
 */
export async function getQuantumJobs(limit = 20) {
  const res = await fetch(`${API_BASE}/api/quantum-jobs?limit=${limit}`)
  return res.json()
}
