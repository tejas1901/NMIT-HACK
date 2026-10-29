import {
  Consignment,
  WaypointWeather,
  TelemetryUnit,
  BackhaulPairing,
  FreightException,
  FeatureImportance,
  DevLogMessage
} from '../types';

export const INITIAL_CONSIGNMENTS: Consignment[] = [
  {
    id: 'CRG-24551',
    origin: 'Chicago Terminal Hub',
    destination: 'Dallas Intermodal Yard',
    department: 'Industrial Goods',
    weightLbs: 42000,
    valueUsd: 125000,
    mode: 'First Class',
    delayRiskLevel: 'CRITICAL',
    delayRiskPercent: 99.8,
    demurrageRisk: 93.22,
    carrierName: 'Expedited Regional Express',
    circuitFile: 'qpiai_circuit_1793224539.qasm',
    netSavings: 37.24,
    status: 'HOLD_PAYMENT',
    eta: '06h 45m (+18h Delay)',
    driverName: 'Vikram Malhotra',
    driverPhone: '+1 (312) 555-0194',
    notes: 'Departure held at terminal. Advance payment 27% (<70% requirement). Transport delayed until cleared.',
    totalInvoiceInr: 185000,
    amountPaidInr: 50000,
    paymentStatus: 'PARTIAL_HELD',
    isDispatchHeldForPayment: true,
    transportDelayHours: 18,
    paymentDueDate: '2026-11-02',
    paymentMethod: 'Bank Transfer (Pending Clearance)'
  },
  {
    id: 'CRG-21818',
    origin: 'Chicago Terminal Hub',
    destination: 'Dallas Intermodal Yard',
    department: 'Perishable Foodstuff',
    weightLbs: 42000,
    valueUsd: 124997,
    mode: 'Second Class',
    delayRiskLevel: 'CRITICAL',
    delayRiskPercent: 75.5,
    demurrageRisk: 91.12,
    carrierName: 'Expedited Regional Express',
    circuitFile: 'qpiai_circuit_1793221812.qasm',
    netSavings: 35.45,
    status: 'CONFIRMED',
    eta: '09h 12m',
    driverName: 'Daniel Vance',
    driverPhone: '+1 (312) 555-0842',
    notes: 'Advance cleared at 75% (>=70% requirement). Carrier cleared for corridor dispatch on schedule.',
    totalInvoiceInr: 140000,
    amountPaidInr: 105000,
    paymentStatus: 'DISPATCH_CLEARED',
    isDispatchHeldForPayment: false,
    transportDelayHours: 0,
    paymentDueDate: '2026-11-04',
    paymentMethod: 'UPI Autopay'
  },
  {
    id: 'CRG-20835',
    origin: 'Port of Rotterdam',
    destination: 'Frankfurt Logistics Center',
    department: 'Pharmaceuticals (Cold-Chain)',
    weightLbs: 32000,
    valueUsd: 240000,
    mode: 'First Class',
    delayRiskLevel: 'CRITICAL',
    delayRiskPercent: 99.8,
    demurrageRisk: 106.56,
    carrierName: 'Expedited Regional Express',
    circuitFile: 'qpiai_circuit_1793220832.qasm',
    netSavings: 48.58,
    status: 'DISPATCHED',
    eta: '04h 30m',
    driverName: 'Hans Becker',
    driverPhone: '+49 69 9002 441',
    notes: 'Fully settled (100%). Priority express green corridor clearance with zero terminal dwell delay.',
    totalInvoiceInr: 290000,
    amountPaidInr: 290000,
    paymentStatus: 'FULLY_PAID',
    isDispatchHeldForPayment: false,
    transportDelayHours: 0,
    paymentDueDate: '2026-10-28',
    paymentMethod: 'Corporate Wire'
  },
  {
    id: 'CRG-8910',
    origin: 'Chicago Hub 04 (Clear)',
    destination: 'Dallas Intermodal Rail (Arrived)',
    department: 'Industrial Machinery',
    weightLbs: 44000,
    valueUsd: 185000,
    mode: 'First Class',
    delayRiskLevel: 'HIGH',
    delayRiskPercent: 78.4,
    demurrageRisk: 125.00,
    carrierName: 'Dedicated Priority Air Cargo',
    circuitFile: 'qpiai_circuit_1793220505.qasm',
    netSavings: 92.50,
    status: 'DELIVERED',
    eta: 'Delivered',
    driverName: 'Marcus Bennett',
    driverPhone: '+1 (773) 555-0921',
    notes: 'Proof of delivery signed by Dallas Intermodal Yard Super Intendant. Account fully balanced.',
    totalInvoiceInr: 210000,
    amountPaidInr: 210000,
    paymentStatus: 'FULLY_PAID',
    isDispatchHeldForPayment: false,
    transportDelayHours: 0,
    paymentDueDate: '2026-10-25',
    paymentMethod: 'Letter of Credit'
  },
  {
    id: 'CRG-8911',
    origin: 'Long Beach Port Dock 7',
    destination: 'Denver Distribution Center',
    department: 'Pharmaceuticals (Cold-Chain)',
    weightLbs: 28500,
    valueUsd: 340000,
    mode: 'Same Day Priority',
    delayRiskLevel: 'CRITICAL',
    delayRiskPercent: 88.2,
    demurrageRisk: 210.00,
    carrierName: 'Dedicated Priority Air Cargo',
    circuitFile: 'qpiai_circuit_1793220505.qasm',
    netSavings: 115.00,
    status: 'HOLD_PAYMENT',
    eta: '11h 20m (+24h Delay)',
    driverName: 'Elena Rostova',
    driverPhone: '+1 (562) 555-4811',
    notes: 'Carrier dispatch stopped at port gate. Zero payment received (0%). 70% advance required.',
    totalInvoiceInr: 320000,
    amountPaidInr: 0,
    paymentStatus: 'UNPAID',
    isDispatchHeldForPayment: true,
    transportDelayHours: 24,
    paymentDueDate: '2026-10-30',
    paymentMethod: 'Pending Invoice'
  },
  {
    id: 'CRG-19402',
    origin: 'Savannah Container Port',
    destination: 'Atlanta Freight Hub',
    department: 'Consumer Electronics',
    weightLbs: 24000,
    valueUsd: 210000,
    mode: 'First Class',
    delayRiskLevel: 'MODERATE',
    delayRiskPercent: 42.1,
    demurrageRisk: 74.50,
    carrierName: 'Expedited Regional Express',
    circuitFile: 'qpiai_circuit_1793219402.qasm',
    netSavings: 41.20,
    status: 'CONFIRMED',
    eta: '03h 50m',
    driverName: 'Jerome Washington',
    driverPhone: '+1 (912) 555-8392',
    notes: 'Advance cleared at 70%. Standard dispatch authorized with remaining balance due upon delivery.',
    totalInvoiceInr: 165000,
    amountPaidInr: 115500,
    paymentStatus: 'DISPATCH_CLEARED',
    isDispatchHeldForPayment: false,
    transportDelayHours: 0,
    paymentDueDate: '2026-11-05',
    paymentMethod: 'Online NetBanking'
  },
  {
    id: 'CRG-18304',
    origin: 'Seattle Intermodal Yard',
    destination: 'Salt Lake City Depot',
    department: 'Medical Equipment',
    weightLbs: 18200,
    valueUsd: 310000,
    mode: 'Standard Class',
    delayRiskLevel: 'LOW',
    delayRiskPercent: 18.5,
    demurrageRisk: 45.00,
    carrierName: 'Ground Priority Freight',
    circuitFile: 'qpiai_circuit_1793218304.qasm',
    netSavings: 22.80,
    status: 'DISPATCHED',
    eta: '14h 40m',
    driverName: 'Robert Vance',
    driverPhone: '+1 (206) 555-2384',
    notes: 'Cleared atmospheric path across I-84 mountain pass. 100% prepaid corporate consignment.',
    totalInvoiceInr: 175000,
    amountPaidInr: 175000,
    paymentStatus: 'FULLY_PAID',
    isDispatchHeldForPayment: false,
    transportDelayHours: 0,
    paymentDueDate: '2026-10-27',
    paymentMethod: 'Corporate Card'
  }
];

export const WAYPOINTS_WEATHER: WaypointWeather[] = [
  {
    id: 'wp-1',
    stage: 'ORIGIN',
    riskLevel: 'LOW',
    locationName: 'Bengaluru Logistics Park',
    condition: 'Clear Sky',
    tempC: 19.3,
    precipMm: 0.0,
    windKmh: 23.0,
    visKm: 9.9,
    distanceKm: 0
  },
  {
    id: 'wp-2',
    stage: 'WAYPOINT',
    riskLevel: 'LOW',
    locationName: 'Hubballi NH-48 Checkpoint',
    condition: 'Clear Sky',
    tempC: 22.2,
    precipMm: 0.0,
    windKmh: 18.4,
    visKm: 10.9,
    distanceKm: 410
  },
  {
    id: 'wp-3',
    stage: 'WAYPOINT',
    riskLevel: 'MODERATE',
    locationName: 'Pune Chakan Industrial Hub',
    condition: 'Light Drizzle',
    tempC: 30.8,
    precipMm: 0.4,
    windKmh: 30.2,
    visKm: 4.8,
    distanceKm: 840
  },
  {
    id: 'wp-4',
    stage: 'GHAT PASS',
    riskLevel: 'MODERATE',
    locationName: 'Khandala Ghat Mountain Pass',
    condition: 'Light Drizzle',
    tempC: 27.0,
    precipMm: 0.1,
    windKmh: 26.3,
    visKm: 7.7,
    distanceKm: 910
  },
  {
    id: 'wp-5',
    stage: 'DESTINATION',
    riskLevel: 'LOW',
    locationName: 'Mumbai JNPT Port Terminal',
    condition: 'Clear Sky',
    tempC: 30.7,
    precipMm: 0.0,
    windKmh: 26.6,
    visKm: 12.8,
    distanceKm: 980
  }
];

export const TELEMETRY_UNITS: Record<string, TelemetryUnit> = {
  'Unit #4021': {
    id: 'unit-4021',
    unitNumber: 'Unit #4021',
    status: 'On Route',
    speedKmh: 68,
    weightKg: 38500,
    efficiencyKmL: 4.2,
    route: 'Bengaluru Logistics Park → Mumbai JNPT Intermodal',
    signalStrength: '100% Signal Strength',
    eta: '04:18:22',
    capacityPercent: 78,
    activeShipments: ['#8824021', '#8859055', '#8828037'],
    activeWeatherSegment: 'Crosswind 26.6 km/h',
    routingNote: 'Maintain speed at 68 km/h along NH-48 to utilize low-density wind corridor ahead. Estimated arrival time reduced by 22 minutes with zero additional fuel burn.'
  },
  'Unit #8809': {
    id: 'unit-8809',
    unitNumber: 'Unit #8809',
    status: 'Dwell',
    speedKmh: 42,
    weightKg: 41200,
    efficiencyKmL: 3.8,
    route: 'Chennai Sea Port → Hyderabad ICD Yard',
    signalStrength: '94% Signal Strength',
    eta: '08:35:10',
    capacityPercent: 92,
    activeShipments: ['#7719204', '#7718992'],
    activeWeatherSegment: 'Crosswind 31.4 km/h',
    routingNote: 'Rerouting proposed via Outer Ring Expressway to bypass Khandala bottleneck. Saves ₹18,000 in late delivery penalty.'
  },
  'Unit #1052': {
    id: 'unit-1052',
    unitNumber: 'Unit #1052',
    status: 'On Route',
    speedKmh: 72,
    weightKg: 34000,
    efficiencyKmL: 4.6,
    route: 'Pune Chakan Hub → Delhi Dadri Multimodal',
    signalStrength: '98% Signal Strength',
    eta: '16:42:00',
    capacityPercent: 65,
    activeShipments: ['#9901421'],
    activeWeatherSegment: 'Crosswind 19.8 km/h',
    routingNote: 'Optimal wind corridor confirmed along Vadodara expressway section. Aerodynamic drag minimized by 11%.'
  }
};

export const BACKHAUL_ROWS: BackhaulPairing[] = [
  {
    id: 'bh-1',
    route: 'Mumbai JNPT Terminal → Bengaluru Logistics Park',
    cargoType: 'General Industrial (38,000 kg)',
    weightKg: 38000,
    netInr: 128000,
    paired: true
  },
  {
    id: 'bh-2',
    route: 'Chennai Sea Port → Hyderabad ICD Yard',
    cargoType: 'Refrigerated Cold-Chain (32,000 kg)',
    weightKg: 32000,
    netInr: 215000,
    paired: false
  },
  {
    id: 'bh-3',
    route: 'Pune Chakan Hub → Delhi Dadri Multimodal',
    cargoType: 'Automotive Precision Parts (34,000 kg)',
    weightKg: 34000,
    netInr: 198000,
    paired: false
  }
];

export const FREIGHT_EXCEPTIONS: FreightException[] = [
  {
    id: 'exc-1',
    unit: 'Unit #8809',
    title: 'NH-44 Khandala Ghat Standstill',
    location: 'KM 128, Western Ghats',
    delayRiskHours: 4.5,
    penaltyInr: 18000,
    resolved: true
  },
  {
    id: 'exc-2',
    unit: 'Unit #4021',
    title: 'JNPT Port ICEGATE Customs Hold',
    location: 'JNPT CFS Gate 3',
    delayRiskHours: 2.0,
    penaltyInr: 7500,
    resolved: false,
    reroutePlan: {
      bypassRoute: 'JNPT Bypass Corridor B through Dedicated Green Clearance Lane',
      timeRecoveryHours: 1.8,
      savingsInr: 6200
    }
  }
];

export const TOP_FEATURE_IMPORTANCES: FeatureImportance[] = [
  { rank: 1, feature: 'shipping_mode_First Class', description: '(Strict SLA)', weight: 88 },
  { rank: 2, feature: 'order_item_total', description: '(Cargo Value ₹)', weight: 72 },
  { rank: 3, feature: 'days_for_shipment_scheduled', description: '(Target Window)', weight: 64 },
  { rank: 4, feature: 'order_hour', description: '(Departure Time)', weight: 45 },
  { rank: 5, feature: 'order_item_discount_rate', description: '', weight: 36 },
  { rank: 6, feature: 'order_region_Western Corridor', description: '(JNPT Dwell)', weight: 32 },
  { rank: 7, feature: 'department_name_Apparel & Textiles', description: '', weight: 28 },
  { rank: 8, feature: 'order_day_of_week', description: '(Weekend Bottlenecks)', weight: 24 },
  { rank: 9, feature: 'customer_segment_Corporate', description: '', weight: 19 },
  { rank: 10, feature: 'order_month', description: '(Peak Logistics Q4)', weight: 15 }
];

export const OPENQASM_CODE = `OPENQASM 2.0;
include "qelib1.inc";

// QpiAI Quantum Carrier Optimization Circuit
// QCloud Target: QpiAI-QSV-Simulator (3 Qubits, 1000 Shots)
qreg q[3];
creg c[3];

// Initial superposition & parameter rotation
ry(0.785398) q[0];
ry(1.230959) q[1];
ry(0.463647) q[2];

// QUBO Penalty Coupling Hamiltonian (Cross-Carrier Mutual Exclusivity)
cx q[0], q[1];
rz(1.570796) q[1];
cx q[0], q[1];

cx q[1], q[2];
rz(2.356194) q[2];
cx q[1], q[2];

// Expedited SLA bias rotation
ry(1.982313) q[1];

// Measurement onto 3 classical bits
measure q[0] -> c[0];
measure q[1] -> c[1];
measure q[2] -> c[2];`;

export const INITIAL_DEV_LOGS: DevLogMessage[] = [
  { id: '1', timestamp: '22:20:12', level: 'WS', message: 'WebSocket tunnel established: wss://edge.freightiq.internal:8080/sync' },
  { id: '2', timestamp: '22:20:14', level: 'INFO', message: 'Supabase cloud state rehydrated (7 active manifests, 3 units online)' },
  { id: '3', timestamp: '22:20:25', level: 'WEATHER', message: 'Open-Meteo API polled: 5/5 waypoints refreshed across NH-48 corridor' },
  { id: '4', timestamp: '22:20:38', level: 'QUANTUM', message: 'QpiAI-QSV-Simulator circuit compiled: Hamiltonian ground state |010⟩ converged' },
  { id: '5', timestamp: '22:20:50', level: 'ML', message: 'XGBoost 3.2.0 inference engine warm: latency 8.4ms per batch' }
];
