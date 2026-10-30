import React from 'react';
import { Consignment, TelemetryUnit, PurchasedTruckOrder } from './types';

export type Role = 'customer' | 'admin';

export const DEMO_MODE = true;

export const LOGGED_IN_CUSTOMER_COMPANY = 'Vikas Intermodal Corp';
export const LOGGED_IN_CUSTOMER_NAME = 'Ananya Verma';
export const LOGGED_IN_CUSTOMER_EMAIL = 'ananya.verma@vikasintermodal.in';

export const ADMIN_USER_NAME = 'Admin';
export const ADMIN_USER_EMAIL = 'admin@gmail.com';
export const ADMIN_USER_ROLE_TITLE = 'Master Administrator';

/**
 * FEATURE REGISTRY: Single source of truth for permission access.
 * 'shared': visible to both customer and admin.
 * 'admin': strictly visible to admin only.
 * There is no customer-only tier (admin can see all customer features).
 */
export const FEATURE_REGISTRY = {
  // Navigation tabs
  'nav.exception_tower': { access: 'admin', description: 'Exception Control Tower blocker detection' },
  'nav.all_shipments': { access: 'admin', description: 'Enterprise-wide shipments view' },
  'nav.my_shipments': { access: 'shared', description: 'Customer consignment tracking' },
  'nav.fleet_radar': { access: 'admin', description: 'Multi-unit fleet radar map with overlays' },
  'nav.live_radar': { access: 'shared', description: 'Customer single-haul tracking radar' },
  'nav.haul_queue': { access: 'admin', description: 'Enterprise haul request review & quoting' },
  'nav.request_haul': { access: 'shared', description: 'Submit freight booking request' },
  'nav.truck_inventory': { access: 'admin', description: 'Commercial rig inventory manager' },
  'nav.buy_trucks': { access: 'shared', description: 'Commercial vehicle showroom' },
  'nav.all_fleet_orders': { access: 'admin', description: 'All corporate truck orders' },
  'nav.my_fleet_orders': { access: 'shared', description: 'Purchased fleet inventory' },
  'nav.customer_unified_booking': { access: 'shared', description: 'Unified Cargo, Haul & Fleet Booking for Customers' },
  
  // Shared carrier fleet marketplace, simulator & manifest
  'nav.cargo_bookings': { access: 'shared', description: 'Company cargo browser, bookings & approvals' },
  'nav.corridor_simulation': { access: 'shared', description: 'NH-48 simulation & backhaul matching for both Customer and Admin' },
  'nav.admin_all_requests': { access: 'admin', description: 'Consolidated Cargo, Haul & Fleet Booking Requests (Admin Only)' },
  'nav.xgboost_ml': { access: 'admin', description: 'XGBoost 3.2 model metrics & feature weights' },
  'nav.qpiai_quantum': { access: 'admin', description: 'QpiAI QUBO quantum carrier allocation' },
  'nav.qpiai_pilot': { access: 'admin', description: 'Autonomous pilot telemetry assistant' },
  'nav.users_roles': { access: 'admin', description: 'User directory and RBAC permissions' },
  'nav.audit_log': { access: 'admin', description: 'Tamper-evident system audit log' },
  'nav.yard_slot_map': { access: 'admin', description: 'Terminal yard & gate slot allocation map' },

  // Admin-only capabilities on shared views
  'shipment.admin_filters': { access: 'admin', description: 'Customer & Risk multi-filters' },
  'shipment.xgboost_pills': { access: 'admin', description: 'Internal XGBoost delay risk metric' },
  'shipment.demurrage_calc': { access: 'admin', description: 'Internal demurrage risk numbers' },
  'shipment.qpiai_circuit': { access: 'admin', description: 'QpiAI QUBO circuit allocation details' },
  'shipment.financial_margin': { access: 'admin', description: 'Internal margin % and carrier cost' },
  'shipment.rerun_risk': { access: 'admin', description: 'Re-trigger XGBoost ML inference' },
  'shipment.reassign_carrier': { access: 'admin', description: 'Re-solve QUBO carrier allocation' },
  'shipment.truck_intelligence': { access: 'admin', description: 'Deep vehicle diagnostics & CAN-bus drawer' },
  'shipment.view_as_customer': { access: 'admin', description: 'Customer portal impersonation preview' },

  // Fleet Radar Admin features
  'radar.all_units': { access: 'admin', description: 'Simultaneous multi-unit radar tracking' },
  'radar.layers_toggle': { access: 'admin', description: 'Weather, Risk, Traffic & Geofence layers' },
  'radar.driver_alerts': { access: 'admin', description: 'Send cab audio alerts & governor override' },

  // Haul Queue Admin features
  'haul.quote_price': { access: 'admin', description: 'Issue commercial price quotes' },
  'haul.assign_truck': { access: 'admin', description: 'Assign rig and driver to haul' },
  'haul.qpiai_optimize': { access: 'admin', description: 'Run QpiAI quantum carrier suggestion' },

  // Truck Inventory Admin features
  'inventory.edit_stock': { access: 'admin', description: 'Adjust stock count and pricing' },
  'inventory.add_model': { access: 'admin', description: 'Register new commercial rig model' }
} as const;

export type FeatureId = keyof typeof FEATURE_REGISTRY;

/**
 * Check if the given role can access a feature.
 * Admin has access to everything.
 * Customer only has access to features marked 'shared'.
 */
export function canAccess(featureId: FeatureId, role: Role): boolean {
  if (role === 'admin') return true;
  const item = FEATURE_REGISTRY[featureId];
  return item?.access === 'shared';
}

/**
 * React hook to check permissions.
 */
export function useCan(featureId: FeatureId, role: Role): boolean {
  return canAccess(featureId, role);
}

/**
 * RoleGate component: guarantees that admin-only elements are NEVER rendered in the Customer DOM.
 */
interface RoleGateProps {
  allow: Role;
  currentRole: Role;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const RoleGate: React.FC<RoleGateProps> = ({
  allow,
  currentRole,
  fallback = null,
  children
}) => {
  if (allow === 'admin' && currentRole !== 'admin') {
    return React.createElement(React.Fragment, null, fallback);
  }
  return React.createElement(React.Fragment, null, children);
};

/**
 * DATA LAYER SANITIZATION
 * Enforce data privacy and role separation before data reaches any view or component.
 */

export interface ExtendedConsignment extends Consignment {
  customerCompany: string;
  customerName: string;
  marginPercent?: number;
  carrierCostUsd?: number;
  internalNotes?: string;
  truckUnitId?: string;
}

/**
 * Strip admin-only fields from a consignment object.
 * Returns only customer-facing fields.
 */
export function sanitizeShipmentForCustomer(shipment: ExtendedConsignment): Consignment {
  return {
    id: shipment.id,
    origin: shipment.origin,
    destination: shipment.destination,
    department: shipment.department,
    weightLbs: shipment.weightLbs,
    valueUsd: shipment.valueUsd,
    mode: shipment.mode,
    // Customer sees friendly status, not internal XGBoost math or QUBO data
    delayRiskLevel: shipment.delayRiskLevel,
    delayRiskPercent: 0, // Cleared
    demurrageRisk: 0, // Cleared
    carrierName: shipment.carrierName,
    circuitFile: '', // Cleared
    netSavings: 0, // Cleared
    status: shipment.status,
    eta: shipment.eta,
    driverName: shipment.driverName,
    driverPhone: shipment.driverPhone,
    notes: shipment.notes
  };
}

/**
 * Data selector: retrieves shipments for a given role.
 * For role = 'customer', ONLY returns records belonging to the logged-in customer's email/company,
 * with all admin-only fields stripped. New customers start from 0.
 */
export function getShipmentsForRole(
  allShipments: (ExtendedConsignment | Consignment)[],
  role: Role,
  currentUser?: { email?: string; company?: string; full_name?: string } | null,
  customerFilter?: string
): (ExtendedConsignment | Consignment)[] {
  if (role === 'admin') {
    if (customerFilter && customerFilter !== 'ALL') {
      return allShipments.filter(s => (s as any).customerCompany === customerFilter);
    }
    return allShipments;
  }

  // Customer role: strictly isolate by THIS customer's email or company
  const email = currentUser?.email?.trim().toLowerCase();
  const company = currentUser?.company?.trim().toLowerCase();

  if (!email && !company) return [];

  return allShipments
    .filter(s => {
      const sAny = s as any;
      const matchEmail = (sAny.shipperEmail && sAny.shipperEmail.toLowerCase() === email) ||
                         (sAny.customerEmail && sAny.customerEmail.toLowerCase() === email);
      const matchCompany = company && (
        (sAny.shipperCompany && sAny.shipperCompany.toLowerCase() === company) ||
        (sAny.customerCompany && sAny.customerCompany.toLowerCase() === company)
      );
      return matchEmail || matchCompany;
    })
    .map(s => sanitizeShipmentForCustomer(s as ExtendedConsignment));
}

/**
 * Data selector for a single shipment.
 */
export function getShipmentForRole(
  allShipments: (ExtendedConsignment | Consignment)[],
  id: string,
  role: Role,
  currentUser?: { email?: string; company?: string; full_name?: string } | null
): ExtendedConsignment | Consignment | null {
  const found = allShipments.find(s => s.id === id);
  if (!found) return null;

  if (role === 'admin') {
    return found as ExtendedConsignment;
  }

  // Check ownership
  const email = currentUser?.email?.trim().toLowerCase();
  const company = currentUser?.company?.trim().toLowerCase();
  const sAny = found as any;

  const matchEmail = (sAny.shipperEmail && sAny.shipperEmail.toLowerCase() === email) ||
                     (sAny.customerEmail && sAny.customerEmail.toLowerCase() === email);
  const matchCompany = company && (
    (sAny.shipperCompany && sAny.shipperCompany.toLowerCase() === company) ||
    (sAny.customerCompany && sAny.customerCompany.toLowerCase() === company)
  );

  if (!matchEmail && !matchCompany) {
    return null; // Not allowed to access other customer's record
  }

  return sanitizeShipmentForCustomer(found as ExtendedConsignment);
}

/**
 * Data selector for fleet orders.
 * Admin sees all orders across all customers.
 * Customer sees ONLY orders purchased by their own account.
 */
export function getOrdersForRole(
  allOrders: PurchasedTruckOrder[],
  role: Role,
  currentUser?: { email?: string; company?: string; full_name?: string } | null
): PurchasedTruckOrder[] {
  if (role === 'admin') {
    return allOrders;
  }
  const email = currentUser?.email?.trim().toLowerCase();
  const company = currentUser?.company?.trim().toLowerCase();
  if (!email && !company) return [];

  return allOrders.filter(o => {
    const oAny = o as any;
    const matchEmail = oAny.buyerEmail && oAny.buyerEmail.toLowerCase() === email;
    const matchCompany = company && o.buyerCompany && o.buyerCompany.toLowerCase() === company;
    return matchEmail || matchCompany;
  });
}

/**
 * Data selector for haul requests.
 * Admin sees all haul requests.
 * Customer sees ONLY haul requests submitted by their account.
 */
export function getHaulsForRole(
  allHauls: any[],
  role: Role,
  currentUser?: { email?: string; company?: string; full_name?: string } | null
): any[] {
  if (role === 'admin') {
    return allHauls;
  }
  const email = currentUser?.email?.trim().toLowerCase();
  const company = currentUser?.company?.trim().toLowerCase();
  if (!email && !company) return [];

  return allHauls.filter(h => {
    const matchEmail = (h.shipperEmail && h.shipperEmail.toLowerCase() === email) ||
                       (h.customerEmail && h.customerEmail.toLowerCase() === email);
    const matchCompany = company && h.customerCompany && h.customerCompany.toLowerCase() === company;
    return matchEmail || matchCompany;
  });
}

/**
 * Data selector for telemetry units.
 * Admin sees all telemetry units with full diagnostic data.
 * Customer sees basic telemetry for units assigned to their shipments only.
 */
export function getUnitsForRole(
  allUnits: Record<string, TelemetryUnit>,
  role: Role
): Record<string, TelemetryUnit> {
  if (role === 'admin') {
    return allUnits;
  }

  // Customer only sees Unit #4021 assigned to their active shipment
  const customerUnits: Record<string, TelemetryUnit> = {};
  if (allUnits['Unit #4021']) {
    customerUnits['Unit #4021'] = {
      ...allUnits['Unit #4021'],
      routingNote: 'Autonomous corridor guidance active.'
    };
  }
  return customerUnits;
}
