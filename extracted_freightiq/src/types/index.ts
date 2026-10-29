export type NavTab = 
  | 'cargo-bookings'
  | 'corridor-simulation'
  | 'xgboost-ml'
  | 'qpiai-quantum'
  | 'qpiai-pilot';

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface Consignment {
  id: string; // e.g. CRG-24551
  origin: string;
  destination: string;
  department: string;
  weightLbs: number;
  valueUsd: number;
  mode: string;
  delayRiskLevel: RiskLevel;
  delayRiskPercent: number;
  demurrageRisk: number; // in USD for manifest
  carrierName: string;
  circuitFile: string;
  netSavings: number;
  status: 'CONFIRMED' | 'DELIVERED' | 'DISPATCHED' | 'AT RISK';
  eta: string;
  driverName?: string;
  driverPhone?: string;
  notes?: string;
}

export interface WaypointWeather {
  id: string;
  stage: 'ORIGIN' | 'WAYPOINT' | 'GHAT PASS' | 'DESTINATION';
  riskLevel: RiskLevel;
  locationName: string;
  condition: string;
  tempC: number;
  precipMm: number;
  windKmh: number;
  visKm: number;
  distanceKm: number;
}

export interface TelemetryUnit {
  id: string;
  unitNumber: string; // e.g. "Unit #4021"
  status: 'On Route' | 'Standby' | 'Dwell';
  speedKmh: number;
  weightKg: number;
  efficiencyKmL: number;
  route: string;
  signalStrength: string;
  eta: string;
  capacityPercent: number;
  activeShipments: string[];
  activeWeatherSegment: string;
  routingNote: string;
}

export interface BackhaulPairing {
  id: string;
  route: string;
  cargoType: string;
  weightKg: number;
  netInr: number;
  paired: boolean;
}

export interface FreightException {
  id: string;
  unit: string;
  title: string;
  location: string;
  delayRiskHours: number;
  penaltyInr: number;
  resolved: boolean;
  reroutePlan?: {
    bypassRoute: string;
    timeRecoveryHours: number;
    savingsInr: number;
  };
}

export interface FeatureImportance {
  rank: number;
  feature: string;
  description: string;
  weight: number;
}

export interface DevLogMessage {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WS' | 'QUANTUM' | 'WEATHER' | 'ML';
  message: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'pilot';
  text: string;
  timestamp: string;
  dataBadges?: string[];
}
