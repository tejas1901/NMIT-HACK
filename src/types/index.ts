export type UserRole = 'admin' | 'customer';
export type Role = UserRole;

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  company: string;
  phone?: string;
  address?: string;
  corridor?: string;
  gstin?: string;
  depot?: string;
  role: 'CUSTOMER' | 'ADMIN' | 'customer' | 'admin';
  role_label?: string;
}

export type NavTab = 
  // Admin-Only Specialized Views
  | 'admin-exception-tower'
  | 'cargo-bookings'
  | 'corridor-simulation'
  | 'xgboost-ml'
  | 'qpiai-quantum'
  | 'qpiai-pilot'
  | 'admin-users-roles'
  | 'admin-audit-log'
  | 'admin-yard-slot-map'
  // Admin Versions of Shared Views
  | 'admin-all-shipments'
  | 'admin-fleet-radar'
  | 'admin-haul-queue'
  | 'admin-truck-inventory'
  | 'admin-all-fleet-orders'
  // Customer Views
  | 'customer-shipments'
  | 'customer-tracking'
  | 'customer-book'
  | 'marketplace'
  | 'customer-fleet';

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
  status: 'CONFIRMED' | 'DELIVERED' | 'DISPATCHED' | 'AT RISK' | 'PENDING_APPROVAL' | 'REJECTED';
  eta: string;
  driverName?: string;
  driverPhone?: string;
  notes?: string;
  customerCompany?: string;
  customerName?: string;
  shipperCompany?: string;
  shipperAddress?: string;
  shipperPhone?: string;
  shipperName?: string;
  shipperEmail?: string;
  carrierCompany?: string;
  marginPercent?: number;
  carrierCostUsd?: number;
  internalNotes?: string;
  truckUnitId?: string;
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
  plateNumber?: string;
  riskLevel?: RiskLevel;
  coords?: { lat: number; lng: number };
  breadcrumbs?: Array<{ lat: number; lng: number; time: string }>;
  timestamp?: string;
  lastPingTime?: string;
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
  level: 'INFO' | 'WS' | 'QUANTUM' | 'WEATHER' | 'ML' | 'AUDIT';
  message: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'pilot';
  text: string;
  timestamp: string;
  dataBadges?: string[];
  actionItem?: CheckoutItem;
  actionLabel?: string;
}

export interface TruckListing {
  id: string;
  name: string;
  tagline: string;
  category: 'Heavy Haul' | 'Electric Semi' | 'Cold-Chain Reefer' | 'Urban Drayage' | 'Intermodal Prime';
  priceUsd: number;
  priceInr: number;
  rentalDuration?: string;
  dailyRateInr?: number;
  payloadLbs: number;
  payloadKg: number;
  powertrain: string;
  horsepower: number;
  efficiency: string;
  rangeKm: number;
  deliveryTimeline: string;
  inStock: number;
  rating: number;
  reviewsCount: number;
  image: string;
  highlights: string[];
  badge: string;
  accentColor: string;
  vinPrefix: string;
  reservationStatus?: 'AVAILABLE' | 'RESERVED' | 'SOLD';
  reservedBy?: string;
}

export interface PurchasedTruckOrder {
  orderId: string;
  truckId: string;
  truckName: string;
  category: string;
  purchaseDate: string;
  amountPaidUsd: number;
  amountPaidInr: number;
  rentalDuration?: string;
  paymentMethod: 'CARD' | 'UPI' | 'CRYPTO_ESCROW';
  transactionId: string;
  status: 'PROCESSING' | 'PRE-DELIVERY_INSPECTION' | 'IN_TRANSIT_TO_DEPOT' | 'DELIVERED_TO_FLEET';
  vin: string;
  assignedDepot: string;
  buyerName: string;
  buyerCompany: string;
  invoiceNumber: string;
}

export interface CheckoutItem {
  type: 'TRUCK' | 'CONSIGNMENT';
  title: string;
  subtitle: string;
  referenceId: string;
  priceUsd: number;
  priceInr: number;
  metadata?: Record<string, string | number>;
}

export interface HaulRequest {
  id: string; // e.g. REQ-9014
  customerCompany: string;
  customerName: string;
  origin: string;
  destination: string;
  cargoCategory: string;
  weightKg: number;
  declaredValueUsd: number;
  serviceTier: 'INTERMODAL' | 'ACCELERATED' | 'QUANTUM_EXPRESS';
  status: 'NEW' | 'QUOTED' | 'APPROVED' | 'REJECTED' | 'ASSIGNED';
  quotedPriceUsd?: number;
  quotedPriceInr?: number;
  assignedTruckId?: string;
  assignedDriver?: string;
  suggestedQpiAiCarrier?: string;
  createdAt: string;
  notes?: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  company: string;
  role: 'admin' | 'customer';
  title: string;
  status: 'ACTIVE' | 'SUSPENDED';
  lastLogin: string;
  accessTier: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorEmail: string;
  actorRole: 'admin' | 'customer' | 'system';
  action: string;
  category: 'OVERRIDE' | 'PRICING' | 'TELEMETRY' | 'SECURITY' | 'ASSIGNMENT';
  details: string;
  ipAddress: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

export type SlotStatus = 'FREE' | 'READY' | 'IDLE' | 'COSTLY' | 'RESERVED';

export interface YardBlocker {
  type: 'CUSTOMS_HOLD' | 'MISSING_INVOICE' | 'TERMINAL_SLOT_WAIT' | 'REEFER_POWER_WAIT' | 'E_WAY_EXPIRED';
  plainReason: string;
  evidenceSource: string;
  evidenceQuote: string;
  ownerName: string;
  deadlineCountdown: string;
  fineRatePerHourInr: number;
}

export interface YardTruck {
  truckId: string;
  plateNumber: string;
  containerId: string;
  containerType: 'DRY' | 'REEFER' | 'HAZMAT';
  driverName: string;
  driverPhone: string;
  carrierName: string;
  parkedSince: string;
  idleDurationMinutes: number;
  status: SlotStatus;
  idleCostAccruedInr: number;
  blocker?: YardBlocker;
  recommendedAction?: string;
}

export interface YardSlot {
  slotId: string; // e.g. A1, B4, C2, D1
  zone: 'ZONE_A' | 'ZONE_B' | 'ZONE_C' | 'ZONE_D';
  zoneLabel: string;
  truck?: YardTruck;
  status: SlotStatus;
  isReeferPlugAvailable?: boolean;
  reservedEta?: string;
  reservationReason?: string;
}

export interface GateQueueTruck {
  id: string;
  plateNumber: string;
  containerId: string;
  containerType: 'DRY' | 'REEFER';
  driverName: string;
  driverPhone: string;
  carrierName: string;
  etaMinutes: number;
  recommendedSlotId: string;
  recommendationReason: string;
}

// ======================== EXCEPTION CONTROL TOWER TYPES ========================
export type ExceptionBlockerType = 
  | 'CUSTOMS_HOLD' 
  | 'MISSING_DOCUMENT' 
  | 'FREE_TIME_EXPIRING' 
  | 'NO_TRUCK_BOOKED' 
  | 'SLOT_UNAVAILABLE';

export type DocumentDisposition = 'ESCALATE' | 'REVIEW' | 'IGNORE';

export interface LabeledBlocker {
  containerId: string;
  type: ExceptionBlockerType;
  evidenceQuote: string;
  penaltyStart: string | null;
  actionDeadline: string;
  owner: string;
  confidence?: number;
}

export interface LabeledDoc {
  docId: string;
  sourceType: 'Email' | 'Internal note' | 'Terminal feed' | 'Customs notice' | 'Booking confirmation';
  receivedAt: string;
  subject: string;
  text: string;
  answerKey: {
    disposition: DocumentDisposition;
    blockers: LabeledBlocker[];
    note?: string;
  };
}

export type CardLane = 'ACT_NOW' | 'TODAY' | 'UPCOMING' | 'REVIEW' | 'RESOLVED';

export interface BlockerCardItem {
  id: string;
  docId: string;
  sourceType: string;
  sourceLabel: string;
  receivedAt: string;
  containerId: string;
  blockerType: ExceptionBlockerType;
  evidenceQuote: string;
  isVerified: boolean;
  confidence: number;
  penaltyStart: string | null;
  actionDeadline: string;
  deadlineTimestamp: number;
  ownerName: string;
  ownerRole: string;
  ownerAvatar: string;
  whyOwner: string;
  whyDeadline: string;
  avoidableCostInr: number;
  costFormula: string;
  lane: CardLane;
  disposition: DocumentDisposition;
  conflictingDates?: {
    source1: string;
    date1: string;
    source2: string;
    date2: string;
    chosenDate: string;
  };
  alsoSeenIn?: Array<{ docId: string; source: string; timestamp: string }>;
  rawDocumentText: string;
  maskedCount: number;
  isFallback?: boolean;
  activityLog: Array<{
    id: string;
    timestamp: string;
    actor: string;
    action: string;
    details: string;
  }>;
  resolvedAt?: string;
  resolveReason?: string;
}

export interface HistoricalIncident {
  incidentId: string;
  containerId: string;
  blockerType: ExceptionBlockerType;
  penaltyPaidINR: number;
  hoursDetectableBeforePenalty: number;
}

export interface EvaluationReport {
  timestamp: string;
  totalDocs: number;
  evidencePrecision: number;
  missedBlockersCount: number;
  totalLabeledBlockers: number;
  recallPercent: number;
  falseEscalationsCount: number;
  totalAlarms: number;
  deadlineComplianceRate: number;
  compliantDeadlinesCount: number;
  totalEvaluatedActions: number;
  results: Array<{
    docId: string;
    sourceType: string;
    subject: string;
    expectedDisposition: DocumentDisposition;
    actualDisposition: DocumentDisposition;
    expectedBlockers: Array<{ containerId: string; type: string }>;
    actualBlockers: Array<{ containerId: string; type: string; isVerified: boolean }>;
    passed: boolean;
    failureReason?: string;
  }>;
}

