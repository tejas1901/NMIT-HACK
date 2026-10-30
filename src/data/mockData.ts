import {
  Consignment,
  WaypointWeather,
  TelemetryUnit,
  BackhaulPairing,
  FreightException,
  FeatureImportance,
  DevLogMessage,
  HaulRequest,
  UserAccount,
  AuditLogEntry
} from '../types';

export const INITIAL_CONSIGNMENTS: Consignment[] = [
  // Pending Customer Order (Awaiting Carrier Company Admin Acceptance)
  {
    id: 'CRG-BK-49210',
    origin: 'Peenya Industrial Logistics Hub, Bengaluru',
    destination: 'JNPT Nhava Sheva Terminal 3, Mumbai',
    department: 'Pharmaceuticals (Cold-Chain)',
    weightLbs: 34500,
    valueUsd: 14500000,
    mode: 'First Class Intermodal',
    delayRiskLevel: 'LOW',
    delayRiskPercent: 12.4,
    demurrageRisk: 0,
    carrierName: 'FreightIQ Intermodal Command',
    carrierCompany: 'FreightIQ Intermodal Command',
    shipperCompany: 'Biocon Pharma Intermodal',
    shipperAddress: 'Plot 20, Phase 2, Electronics City, Bengaluru - 560100',
    shipperPhone: '+91 98450 88219',
    shipperName: 'Dr. Suresh Rao',
    shipperEmail: 'suresh.rao@biocon.in',
    circuitFile: 'qpiai_circuit_1793229811.qasm',
    netSavings: 5400,
    status: 'PENDING_APPROVAL',
    eta: 'Awaiting Admin Acceptance',
    notes: 'Urgent cold-chain vaccines. Requires Carrier Admin acceptance and refrigerated tractor.',
    customerCompany: 'Biocon Pharma Intermodal',
    customerName: 'Dr. Suresh Rao'
  },
  // Customer 1: Vikas Intermodal Corp (Ananya Verma) - 6 Shipments
  {
    id: 'CRG-24551',
    origin: 'JNPT Port Terminal Hub',
    destination: 'Chakan Industrial Yard',
    department: 'Industrial Goods',
    weightLbs: 42000,
    valueUsd: 10800000,
    mode: 'First Class',
    delayRiskLevel: 'CRITICAL',
    delayRiskPercent: 99.8,
    demurrageRisk: 8054.21,
    carrierName: 'Expedited Regional Express',
    circuitFile: 'qpiai_circuit_1793224539.qasm',
    netSavings: 3217.54,
    status: 'CONFIRMED',
    eta: '06h 45m',
    driverName: 'Vikram Malhotra',
    driverPhone: '+91 98201 55194',
    notes: 'High-density precision components requiring humidity-controlled chassis lock.',
    customerCompany: 'Vikas Intermodal Corp',
    customerName: 'Ananya Verma',
    marginPercent: 28.5,
    carrierCostUsd: 122688,
    internalNotes: 'VIP account tier A. Demurrage credit auto-authorized if delay exceeds 45 mins.',
    truckUnitId: 'Unit #4021'
  },
  {
    id: 'CRG-21818',
    origin: 'JNPT Port Terminal Hub',
    destination: 'Chakan Industrial Yard',
    department: 'Perishable Foodstuff',
    weightLbs: 42000,
    valueUsd: 10799741,
    mode: 'Second Class',
    delayRiskLevel: 'CRITICAL',
    delayRiskPercent: 75.5,
    demurrageRisk: 7872.77,
    carrierName: 'Expedited Regional Express',
    circuitFile: 'qpiai_circuit_1793221812.qasm',
    netSavings: 3062.88,
    status: 'CONFIRMED',
    eta: '09h 12m',
    driverName: 'Deepak Verma',
    driverPhone: '+91 98201 55842',
    notes: 'Refrigerated container (Reefer unit -4°C setpoint). Scheduled for bypass corridor.',
    customerCompany: 'Vikas Intermodal Corp',
    customerName: 'Ananya Verma',
    marginPercent: 24.2,
    carrierCostUsd: 119232,
    internalNotes: 'Temp alerts forwarded to IoT gateway every 60s.',
    truckUnitId: 'Unit #4021'
  },
  {
    id: 'CRG-20835',
    origin: 'Chennai Sea Port Dock',
    destination: 'Bengaluru Tech Logistics Hub',
    department: 'Pharmaceuticals (Cold-Chain)',
    weightLbs: 32000,
    valueUsd: 20736000,
    mode: 'First Class',
    delayRiskLevel: 'CRITICAL',
    delayRiskPercent: 99.8,
    demurrageRisk: 9206.78,
    carrierName: 'Expedited Regional Express',
    circuitFile: 'qpiai_circuit_1793220832.qasm',
    netSavings: 4197.31,
    status: 'CONFIRMED',
    eta: '04h 30m',
    driverName: 'Harish Rawat',
    driverPhone: '+91 94481 22835',
    notes: 'Active temperature log transmission via QpiAI telemetry link.',
    customerCompany: 'Vikas Intermodal Corp',
    customerName: 'Ananya Verma',
    marginPercent: 31.0,
    carrierCostUsd: 185760,
    internalNotes: 'Cold-chain seal validated at customs checkpoint.',
    truckUnitId: 'Unit #1052'
  },
  {
    id: 'CRG-8910',
    origin: 'Mundra Port Container Dock',
    destination: 'Ahmedabad Sanand Rail Yard',
    department: 'Industrial Machinery',
    weightLbs: 44000,
    valueUsd: 15984000,
    mode: 'First Class',
    delayRiskLevel: 'HIGH',
    delayRiskPercent: 78.4,
    demurrageRisk: 10800.00,
    carrierName: 'Dedicated Priority Air Cargo',
    circuitFile: 'qpiai_circuit_1793220505.qasm',
    netSavings: 7992.00,
    status: 'DELIVERED',
    eta: 'Delivered',
    driverName: 'Manoj Bajpayee',
    driverPhone: '+91 98192 44921',
    notes: 'Proof of delivery signed by Chakan Intermodal Yard Super Intendant.',
    customerCompany: 'Vikas Intermodal Corp',
    customerName: 'Ananya Verma',
    marginPercent: 26.4,
    carrierCostUsd: 142560,
    internalNotes: 'Completed with zero demurrage penalty. POD archived.',
    truckUnitId: 'Unit #8809'
  },
  {
    id: 'CRG-8911',
    origin: 'JNPT Pier G Container Dock',
    destination: 'Delhi NCR Freight Corridor',
    department: 'Pharmaceuticals (Cold-Chain)',
    weightLbs: 28500,
    valueUsd: 29376000,
    mode: 'Same Day Priority',
    delayRiskLevel: 'CRITICAL',
    delayRiskPercent: 88.2,
    demurrageRisk: 18144.00,
    carrierName: 'Dedicated Priority Air Cargo',
    circuitFile: 'qpiai_circuit_1793220505.qasm',
    netSavings: 9936.00,
    status: 'DISPATCHED',
    eta: '11h 20m',
    driverName: 'Priya Narayanan',
    driverPhone: '+91 98205 64811',
    notes: 'Priority airfreight ground transit link initiated at JNPT Pier G.',
    customerCompany: 'Vikas Intermodal Corp',
    customerName: 'Ananya Verma',
    marginPercent: 33.8,
    carrierCostUsd: 249696,
    internalNotes: 'Monitored via satellite L-band link. Governor active.',
    truckUnitId: 'Unit #4021'
  },
  {
    id: 'CRG-18304',
    origin: 'Visakhapatnam Port Terminal',
    destination: 'Hyderabad Intermodal Depot',
    department: 'Medical Equipment',
    weightLbs: 18200,
    valueUsd: 26784000,
    mode: 'Standard Class',
    delayRiskLevel: 'LOW',
    delayRiskPercent: 18.5,
    demurrageRisk: 3888.00,
    carrierName: 'Ground Priority Freight',
    circuitFile: 'qpiai_circuit_1793218304.qasm',
    netSavings: 1969.92,
    status: 'DISPATCHED',
    eta: '14h 40m',
    driverName: 'Rajesh Kulkarni',
    driverPhone: '+91 94220 52384',
    notes: 'Clear atmospheric path across NH-65 highway corridor.',
    customerCompany: 'Vikas Intermodal Corp',
    customerName: 'Ananya Verma',
    marginPercent: 22.1,
    carrierCostUsd: 101952,
    internalNotes: 'Routine dry freight. Fuel consumption optimal.',
    truckUnitId: 'Unit #1052'
  },

  // Customer 2: Apex Intermodal Logistics (Manish Bhatt) - 3 Shipments
  {
    id: 'CRG-30114',
    origin: 'Mundra Port Terminal, Gujarat',
    destination: 'Sanand Automotive Hub, Ahmedabad',
    department: 'Automotive Precision Parts',
    weightLbs: 38200,
    valueUsd: 16848000,
    mode: 'Express Freight',
    delayRiskLevel: 'LOW',
    delayRiskPercent: 12.4,
    demurrageRisk: 0.0,
    carrierName: 'Expedited Regional Express',
    circuitFile: 'qpiai_circuit_1793230114.qasm',
    netSavings: 3637.44,
    status: 'DISPATCHED',
    eta: '03h 15m',
    driverName: 'Rajesh Gurjar',
    driverPhone: '+91 98290 88123',
    notes: 'Chassis secured for Tier-1 automotive assembly plant.',
    customerCompany: 'Apex Intermodal Logistics',
    customerName: 'Manish Bhatt',
    marginPercent: 29.0,
    carrierCostUsd: 133056,
    internalNotes: 'Just-in-Time delivery protocol in place.',
    truckUnitId: 'Unit #5088'
  },
  {
    id: 'CRG-30115',
    origin: 'Nhava Sheva JNPT Gate 2',
    destination: 'Chakan Auto Hub, Pune',
    department: 'Heavy Machinery & Dies',
    weightLbs: 46000,
    valueUsd: 24192000,
    mode: 'Heavy Haul Escort',
    delayRiskLevel: 'MODERATE',
    delayRiskPercent: 36.8,
    demurrageRisk: 5356.80,
    carrierName: 'Ground Priority Freight',
    circuitFile: 'qpiai_circuit_1793230115.qasm',
    netSavings: 5045.76,
    status: 'CONFIRMED',
    eta: '07h 40m',
    driverName: 'Kailash Patil',
    driverPhone: '+91 97660 33941',
    notes: 'Wide load permit cleared for Expressway transit.',
    customerCompany: 'Apex Intermodal Logistics',
    customerName: 'Manish Bhatt',
    marginPercent: 27.5,
    carrierCostUsd: 163296,
    internalNotes: 'Escort vehicle assigned from Khopoli toll plaza.',
    truckUnitId: 'Unit #5088'
  },
  {
    id: 'CRG-30116',
    origin: 'Chennai Port Container Dock',
    destination: 'Sri City SEZ, AP',
    department: 'Consumer Electronics & Solar',
    weightLbs: 21500,
    valueUsd: 26784000,
    mode: 'First Class',
    delayRiskLevel: 'LOW',
    delayRiskPercent: 14.1,
    demurrageRisk: 0.0,
    carrierName: 'Dedicated Priority Air Cargo',
    circuitFile: 'qpiai_circuit_1793230116.qasm',
    netSavings: 6393.60,
    status: 'DELIVERED',
    eta: 'Delivered',
    driverName: 'Suresh Menon',
    driverPhone: '+91 94440 21908',
    notes: 'Delivered directly to cleanroom dock A4.',
    customerCompany: 'Apex Intermodal Logistics',
    customerName: 'Manish Bhatt',
    marginPercent: 32.2,
    carrierCostUsd: 125280,
    internalNotes: 'Zero damage report signed by facility lead.',
    truckUnitId: 'Unit #8809'
  },

  // Customer 3: Summit Cold-Chain Express (Priya Sharma) - 3 Shipments
  {
    id: 'CRG-44021',
    origin: 'Hyderabad Genome Valley',
    destination: 'Bangalore Whitefield BioPark',
    department: 'Pharmaceutical Vaccines (-20°C)',
    weightLbs: 16500,
    valueUsd: 41472000,
    mode: 'Ultra-Cold Chain',
    delayRiskLevel: 'LOW',
    delayRiskPercent: 8.5,
    demurrageRisk: 0.0,
    carrierName: 'Dedicated Priority Air Cargo',
    circuitFile: 'qpiai_circuit_1793244021.qasm',
    netSavings: 9504.00,
    status: 'DISPATCHED',
    eta: '05h 10m',
    driverName: 'Arjun Nambiar',
    driverPhone: '+91 99800 77210',
    notes: 'Dual cryogenic compressors active. Nitrogen backup primed.',
    customerCompany: 'Summit Cold-Chain Express',
    customerName: 'Priya Sharma',
    marginPercent: 38.5,
    carrierCostUsd: 267840,
    internalNotes: 'Emergency reroute triggered if cabin temp exceeds -18°C.',
    truckUnitId: 'Unit #6120'
  },
  {
    id: 'CRG-44022',
    origin: 'Kochi Marine Export Hub',
    destination: 'Coimbatore Inland Depot',
    department: 'Perishable Seafood (0-2°C)',
    weightLbs: 29000,
    valueUsd: 9936000,
    mode: 'Reefer Express',
    delayRiskLevel: 'HIGH',
    delayRiskPercent: 68.2,
    demurrageRisk: 7603.20,
    carrierName: 'Expedited Regional Express',
    circuitFile: 'qpiai_circuit_1793244022.qasm',
    netSavings: 2721.60,
    status: 'AT RISK',
    eta: '04h 25m',
    driverName: 'Pradeep Nair',
    driverPhone: '+91 98470 55192',
    notes: 'Heavy monsoon runoff advisory on Palakkad Gap pass.',
    customerCompany: 'Summit Cold-Chain Express',
    customerName: 'Priya Sharma',
    marginPercent: 21.0,
    carrierCostUsd: 105408,
    internalNotes: 'Governor limited to 50 km/h due to slippery conditions.',
    truckUnitId: 'Unit #6120'
  },
  {
    id: 'CRG-44023',
    origin: 'Nashik Agro Terminal',
    destination: 'Mumbai Vashi Wholesale Market',
    department: 'Organic Table Fruits & Grapes',
    weightLbs: 34000,
    valueUsd: 5616000,
    mode: 'Direct Farm Haul',
    delayRiskLevel: 'MODERATE',
    delayRiskPercent: 44.0,
    demurrageRisk: 3024.00,
    carrierName: 'Ground Priority Freight',
    circuitFile: 'qpiai_circuit_1793244023.qasm',
    netSavings: 1572.48,
    status: 'CONFIRMED',
    eta: '02h 55m',
    driverName: 'Ganesh Jadhav',
    driverPhone: '+91 98220 11492',
    notes: 'Pre-cooled harvest loaded in modified atmosphere container.',
    customerCompany: 'Summit Cold-Chain Express',
    customerName: 'Priya Sharma',
    marginPercent: 23.5,
    carrierCostUsd: 81216,
    internalNotes: 'Early morning dock clearance pre-booked.',
    truckUnitId: 'Unit #6120'
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
    plateNumber: 'MH-12-FK-9901',
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
    riskLevel: 'LOW',
    coords: { lat: 18.5204, lng: 73.8567 },
    routingNote: 'Maintain speed at 68 km/h along NH-48 to utilize low-density wind corridor ahead. Estimated arrival time reduced by 22 minutes with zero additional fuel burn.',
    breadcrumbs: [
      { lat: 13.0827, lng: 77.5877, time: '06:00' },
      { lat: 15.3647, lng: 75.1240, time: '09:30' },
      { lat: 18.5204, lng: 73.8567, time: '11:15' }
    ]
  },
  'Unit #8809': {
    id: 'unit-8809',
    unitNumber: 'Unit #8809',
    plateNumber: 'TN-09-CB-4412',
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
    riskLevel: 'HIGH',
    coords: { lat: 17.3850, lng: 78.4867 },
    routingNote: 'Rerouting proposed via Outer Ring Expressway to bypass Khandala bottleneck. Saves ₹18,000 in late delivery penalty.',
    breadcrumbs: [
      { lat: 13.0827, lng: 80.2707, time: '04:00' },
      { lat: 15.8281, lng: 78.0373, time: '08:00' },
      { lat: 17.3850, lng: 78.4867, time: '11:00' }
    ]
  },
  'Unit #1052': {
    id: 'unit-1052',
    unitNumber: 'Unit #1052',
    plateNumber: 'DL-01-AX-7019',
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
    riskLevel: 'LOW',
    coords: { lat: 23.0225, lng: 72.5714 },
    routingNote: 'Optimal wind corridor confirmed along Vadodara expressway section. Aerodynamic drag minimized by 11%.',
    breadcrumbs: [
      { lat: 18.5204, lng: 73.8567, time: '05:00' },
      { lat: 21.1702, lng: 72.8311, time: '09:00' },
      { lat: 23.0225, lng: 72.5714, time: '11:15' }
    ]
  },
  'Unit #6120': {
    id: 'unit-6120',
    unitNumber: 'Unit #6120',
    plateNumber: 'KL-07-EK-8104',
    status: 'On Route',
    speedKmh: 55,
    weightKg: 29000,
    efficiencyKmL: 4.0,
    route: 'Kochi Marine Hub → Coimbatore Inland Depot',
    signalStrength: '96% Signal Strength',
    eta: '04:25:00',
    capacityPercent: 74,
    activeShipments: ['#CRG-44022'],
    activeWeatherSegment: 'Monsoon Runoff 32 km/h',
    riskLevel: 'HIGH',
    coords: { lat: 10.8505, lng: 76.2711 },
    routingNote: 'Palakkad mountain pass speed limit enforced by governor at 50 km/h.',
    breadcrumbs: [
      { lat: 9.9312, lng: 76.2673, time: '06:00' },
      { lat: 10.5276, lng: 76.2144, time: '08:45' }
    ]
  },
  'Unit #5088': {
    id: 'unit-5088',
    unitNumber: 'Unit #5088',
    plateNumber: 'GJ-01-ZZ-5502',
    status: 'On Route',
    speedKmh: 64,
    weightKg: 38200,
    efficiencyKmL: 4.4,
    route: 'Mundra Port → Sanand Auto Hub',
    signalStrength: '99% Signal Strength',
    eta: '03:15:00',
    capacityPercent: 82,
    activeShipments: ['#CRG-30114'],
    activeWeatherSegment: 'Clear 22 km/h',
    riskLevel: 'LOW',
    coords: { lat: 22.8425, lng: 69.7180 },
    routingNote: 'Direct green corridor clearance confirmed through Gandhidham toll.',
    breadcrumbs: [
      { lat: 22.8425, lng: 69.7180, time: '07:30' },
      { lat: 23.2156, lng: 71.1899, time: '09:45' }
    ]
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
  { id: '2', timestamp: '22:20:14', level: 'INFO', message: 'Supabase cloud state rehydrated (12 active manifests, 5 units online)' },
  { id: '3', timestamp: '22:20:25', level: 'WEATHER', message: 'Open-Meteo API polled: 5/5 waypoints refreshed across NH-48 corridor' },
  { id: '4', timestamp: '22:20:38', level: 'QUANTUM', message: 'QpiAI-QSV-Simulator circuit compiled: Hamiltonian ground state |010⟩ converged' },
  { id: '5', timestamp: '22:20:50', level: 'ML', message: 'XGBoost 3.2.0 inference engine warm: latency 8.4ms per batch' },
  { id: '6', timestamp: '22:21:05', level: 'AUDIT', message: 'Admin authenticated: Rajathgowda issued session token with role ENTERPRISE_OPS' }
];

export const INITIAL_HAUL_REQUESTS: HaulRequest[] = [
  {
    id: 'REQ-9014',
    customerCompany: 'Vikas Intermodal Corp',
    customerName: 'Ananya Verma',
    origin: 'Nhava Sheva (JNPT) Port, Mumbai',
    destination: 'Whitefield Technology Park, Bangalore',
    cargoCategory: 'Precision Automotive Components',
    weightKg: 14500,
    declaredValueUsd: 7344000,
    serviceTier: 'QUANTUM_EXPRESS',
    status: 'NEW',
    quotedPriceUsd: 171072,
    quotedPriceInr: 171072,
    suggestedQpiAiCarrier: 'Expedited Regional Express (QUBO Optimal)',
    createdAt: '2026-10-29 08:30 IST',
    notes: 'Fragile electronics. Need guaranteed sub-24h delivery with zero demurrage.'
  },
  {
    id: 'REQ-9015',
    customerCompany: 'Apex Intermodal Logistics',
    customerName: 'Manish Bhatt',
    origin: 'Chennai Port Container Terminal, TN',
    destination: 'Chakan Auto Industrial Hub, Pune',
    cargoCategory: 'Heavy Industrial Machinery',
    weightKg: 32000,
    declaredValueUsd: 19008000,
    serviceTier: 'ACCELERATED',
    status: 'QUOTED',
    quotedPriceUsd: 228960,
    quotedPriceInr: 228960,
    suggestedQpiAiCarrier: 'Dedicated Priority Air Cargo',
    createdAt: '2026-10-29 07:15 IST',
    notes: 'Requires dual driver relay and crane offload coordination.'
  },
  {
    id: 'REQ-9016',
    customerCompany: 'Summit Cold-Chain Express',
    customerName: 'Priya Sharma',
    origin: 'Delhi NCR Inland Logistics Hub, Gurgaon',
    destination: 'Hyderabad HITEC Cargo Depot, Telangana',
    cargoCategory: 'Cold-Chain Pharmaceuticals (2-8°C)',
    weightKg: 12000,
    declaredValueUsd: 29376000,
    serviceTier: 'QUANTUM_EXPRESS',
    status: 'ASSIGNED',
    quotedPriceUsd: 267840,
    quotedPriceInr: 267840,
    assignedTruckId: 'Unit #6120',
    assignedDriver: 'Arjun Nambiar',
    suggestedQpiAiCarrier: 'Expedited Regional Express',
    createdAt: '2026-10-28 19:40 IST',
    notes: 'Continuous data logger connection required.'
  },
  {
    id: 'REQ-9017',
    customerCompany: 'Vikas Intermodal Corp',
    customerName: 'Ananya Verma',
    origin: 'Mundra Port Logistics Terminal, Gujarat',
    destination: 'Sanand Industrial Cluster, Ahmedabad',
    cargoCategory: 'Consumer Electronics & Semiconductors',
    weightKg: 9500,
    declaredValueUsd: 35424000,
    serviceTier: 'QUANTUM_EXPRESS',
    status: 'APPROVED',
    quotedPriceUsd: 125280,
    quotedPriceInr: 125280,
    suggestedQpiAiCarrier: 'Ground Priority Freight',
    createdAt: '2026-10-29 06:10 IST',
    notes: 'High security convoy requested.'
  },
  {
    id: 'REQ-9018',
    customerCompany: 'Apex Intermodal Logistics',
    customerName: 'Manish Bhatt',
    origin: 'Kolkata Haldia Dock Complex, WB',
    destination: 'Sri City Special Economic Zone, AP',
    cargoCategory: 'Green Tech & Lithium Batteries',
    weightKg: 28000,
    declaredValueUsd: 15552000,
    serviceTier: 'INTERMODAL',
    status: 'REJECTED',
    quotedPriceUsd: 181440,
    quotedPriceInr: 181440,
    createdAt: '2026-10-27 14:20 IST',
    notes: 'Rejected due to hazardous materials route embargo during rainstorm.'
  }
];

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'usr-1',
    name: 'Rajathgowda',
    email: 'rajathgowda@gmail.com',
    company: 'FreightIQ Logistics Core',
    role: 'admin',
    title: 'Operations Lead & Chief Dispatcher',
    status: 'ACTIVE',
    lastLogin: 'Just now (Active)',
    accessTier: 'Enterprise Admin (Root)'
  },
  {
    id: 'usr-2',
    name: 'Ananya Verma',
    email: 'ananya.verma@vikasintermodal.in',
    company: 'Vikas Intermodal Corp',
    role: 'customer',
    title: 'VP of Commercial Supply Chain',
    status: 'ACTIVE',
    lastLogin: '12 mins ago',
    accessTier: 'Commercial Shipper (Tier A)'
  },
  {
    id: 'usr-3',
    name: 'Manish Bhatt',
    email: 'manish@apexlogistics.in',
    company: 'Apex Intermodal Logistics',
    role: 'customer',
    title: 'Fleet Operations Director',
    status: 'ACTIVE',
    lastLogin: '1 hour ago',
    accessTier: 'Commercial Shipper (Tier B)'
  },
  {
    id: 'usr-4',
    name: 'Priya Sharma',
    email: 'priya.s@summitcold.in',
    company: 'Summit Cold-Chain Express',
    role: 'customer',
    title: 'Head of Cold-Chain Operations',
    status: 'ACTIVE',
    lastLogin: '3 hours ago',
    accessTier: 'Commercial Shipper (Tier A)'
  },
  {
    id: 'usr-5',
    name: 'Dispatcher Sub-Agent AI',
    email: 'system.qpiai@freightiq.ai',
    company: 'FreightIQ Autonomous Systems',
    role: 'admin',
    title: 'QpiAI Autonomous Governor Engine',
    status: 'ACTIVE',
    lastLogin: 'Continuous WebSocket',
    accessTier: 'System Process'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'AUD-8801',
    timestamp: '2026-10-29 09:12:44 IST',
    actorName: 'Rajathgowda',
    actorEmail: 'rajathgowda@gmail.com',
    actorRole: 'admin',
    action: 'GOVERNOR_SPEED_OVERRIDE',
    category: 'OVERRIDE',
    details: 'Overrode speed governor for Unit #4021: temporary allowance 68 km/h on NH-48 dry section',
    ipAddress: '103.21.244.18',
    severity: 'WARNING'
  },
  {
    id: 'AUD-8802',
    timestamp: '2026-10-29 09:05:12 IST',
    actorName: 'Ananya Verma',
    actorEmail: 'ananya.verma@vikasintermodal.in',
    actorRole: 'customer',
    action: 'HAUL_DISPATCH_REQUESTED',
    category: 'ASSIGNMENT',
    details: 'Submitted haul request REQ-9014 (Precision Automotive Components, 14,500 kg)',
    ipAddress: '14.139.122.9',
    severity: 'INFO'
  },
  {
    id: 'AUD-8803',
    timestamp: '2026-10-29 08:50:33 IST',
    actorName: 'Rajathgowda',
    actorEmail: 'rajathgowda@gmail.com',
    actorRole: 'admin',
    action: 'COMMERCIAL_QUOTE_ISSUED',
    category: 'PRICING',
    details: 'Issued quote for REQ-9015 to Apex Intermodal: ₹2,28,960 INR',
    ipAddress: '103.21.244.18',
    severity: 'INFO'
  },
  {
    id: 'AUD-8804',
    timestamp: '2026-10-29 08:34:19 IST',
    actorName: 'System Governor',
    actorEmail: 'system.qpiai@freightiq.ai',
    actorRole: 'system',
    action: 'CAN_BUS_ALERT_LOGGED',
    category: 'TELEMETRY',
    details: 'Unit #8809 DTC P0299 Turbo Underboost alert logged. Severity: MODERATE',
    ipAddress: '127.0.0.1 (Loopback)',
    severity: 'WARNING'
  },
  {
    id: 'AUD-8805',
    timestamp: '2026-10-29 08:15:02 IST',
    actorName: 'Rajathgowda',
    actorEmail: 'rajathgowda@gmail.com',
    actorRole: 'admin',
    action: 'QUBO_CARRIER_REASSIGN',
    category: 'ASSIGNMENT',
    details: 'Re-solved carrier allocation for CRG-24551 via QpiAI-QSV simulator (Saves ₹37,240)',
    ipAddress: '103.21.244.18',
    severity: 'INFO'
  },
  {
    id: 'AUD-8806',
    timestamp: '2026-10-29 07:55:40 IST',
    actorName: 'Rajathgowda',
    actorEmail: 'rajathgowda@gmail.com',
    actorRole: 'admin',
    action: 'INVENTORY_STOCK_EDIT',
    category: 'OVERRIDE',
    details: 'Adjusted in-stock count for FreightIQ Heavy Hauler 5000 to 5 units',
    ipAddress: '103.21.244.18',
    severity: 'INFO'
  },
  {
    id: 'AUD-8807',
    timestamp: '2026-10-29 07:22:15 IST',
    actorName: 'Priya Sharma',
    actorEmail: 'priya.s@summitcold.in',
    actorRole: 'customer',
    action: 'ORDER_INVOICE_DOWNLOADED',
    category: 'SECURITY',
    details: 'Downloaded official tax invoice for purchased Reefer Unit #CR-03 (INV-FREIGHTIQ-2026-7819)',
    ipAddress: '49.207.198.54',
    severity: 'INFO'
  },
  {
    id: 'AUD-8808',
    timestamp: '2026-10-29 06:40:09 IST',
    actorName: 'System Security',
    actorEmail: 'security@freightiq.ai',
    actorRole: 'system',
    action: 'ACCESS_RESTRICTED_ATTEMPT',
    category: 'SECURITY',
    details: 'Customer session attempted access to admin endpoint /api/v1/xgboost/weights. Blocked by RoleGate.',
    ipAddress: '182.73.190.22',
    severity: 'CRITICAL'
  }
];
