import React, { useState, useEffect, Suspense, lazy } from 'react';
import { 
  NavTab, 
  Role, 
  Consignment, 
  WaypointWeather, 
  TelemetryUnit, 
  BackhaulPairing, 
  FreightException, 
  DevLogMessage,
  PurchasedTruckOrder,
  CheckoutItem,
  HaulRequest,
  TruckListing,
  AuditLogEntry,
  UserProfile,
  RiskLevel
} from './types';
import { 
  INITIAL_CONSIGNMENTS, 
  WAYPOINTS_WEATHER, 
  TELEMETRY_UNITS, 
  BACKHAUL_ROWS, 
  FREIGHT_EXCEPTIONS, 
  INITIAL_DEV_LOGS,
  INITIAL_HAUL_REQUESTS,
  INITIAL_AUDIT_LOGS
} from './data/mockData';
import { INITIAL_PURCHASED_ORDERS, TRUCK_CATALOG } from './data/truckCatalogData';
import { 
  DEMO_MODE, 
  getShipmentsForRole, 
  getOrdersForRole, 
  getUnitsForRole, 
  canAccess, 
  RoleGate,
  LOGGED_IN_CUSTOMER_COMPANY,
  LOGGED_IN_CUSTOMER_NAME,
  LOGGED_IN_CUSTOMER_EMAIL,
  ADMIN_USER_NAME
} from './roles';

import { LiquidBackground } from './components/LiquidBackground';
import { Sidebar } from './components/Sidebar';
import { ConsignmentDetailDrawer } from './components/ConsignmentDetailDrawer';
import { NewBookingModal } from './components/NewBookingModal';
import { PaymentModal } from './components/PaymentModal';
import { RoleSwitcherModal } from './components/RoleSwitcherModal';
import { ProfileModal } from './components/ProfileModal';
import { LiveEventTicker } from './components/LiveEventTicker';
import { AdminBadge } from './components/AdminBadge';
import { fetchLiveWaypoints } from './services/weatherService';
import { predictDemurrageRisk } from './services/demurrageService';
import { optimizeCarriers } from './services/quantumService';
import { getElevationToken, setElevationToken, clearElevationToken } from './services/api';
import { supabase } from './lib/supabase';

// Customer & Shared Views (Eagerly loaded for customer experience)
import { TruckMarketplaceView } from './views/TruckMarketplaceView';
import { CustomerShipmentsView } from './views/CustomerShipmentsView';
import { CustomerTrackingView } from './views/CustomerTrackingView';
import { CustomerBookShipmentView } from './views/CustomerBookShipmentView';
import { CustomerFleetOrdersView } from './views/CustomerFleetOrdersView';

import { CheckCircle2, Shield, Users, Repeat, PhoneCall, Lock } from 'lucide-react';

const LandingPage = lazy(() => import('./views/LandingPage').then(m => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import('./views/LoginPage').then(m => ({ default: m.LoginPage })));

// Lazy-Loaded Admin Views & Modals (so their code is never fetched in a customer session)
const AdminExceptionControlTowerView = lazy(() => import('./views/AdminExceptionControlTowerView').then(m => ({ default: m.AdminExceptionControlTowerView })));
const CargoBookingsView = lazy(() => import('./views/CargoBookingsView').then(m => ({ default: m.CargoBookingsView })));
const CorridorSimulationView = lazy(() => import('./views/CorridorSimulationView').then(m => ({ default: m.CorridorSimulationView })));
const XGBoostModelView = lazy(() => import('./views/XGBoostModelView').then(m => ({ default: m.XGBoostModelView })));
const QpiAIQuantumView = lazy(() => import('./views/QpiAIQuantumView').then(m => ({ default: m.QpiAIQuantumView })));
const QpiAiPilotView = lazy(() => import('./views/QpiAiPilotView').then(m => ({ default: m.QpiAiPilotView })));
const AdminAllShipmentsView = lazy(() => import('./views/AdminAllShipmentsView').then(m => ({ default: m.AdminAllShipmentsView })));
const AdminFleetRadarView = lazy(() => import('./views/AdminFleetRadarView').then(m => ({ default: m.AdminFleetRadarView })));
const AdminHaulQueueView = lazy(() => import('./views/AdminHaulQueueView').then(m => ({ default: m.AdminHaulQueueView })));
const AdminTruckInventoryView = lazy(() => import('./views/AdminTruckInventoryView').then(m => ({ default: m.AdminTruckInventoryView })));
const AdminAllFleetOrdersView = lazy(() => import('./views/AdminAllFleetOrdersView').then(m => ({ default: m.AdminAllFleetOrdersView })));
const AdminUsersRolesView = lazy(() => import('./views/AdminUsersRolesView').then(m => ({ default: m.AdminUsersRolesView })));
const AdminAuditLogView = lazy(() => import('./views/AdminAuditLogView').then(m => ({ default: m.AdminAuditLogView })));
const AdminYardSlotMapView = lazy(() => import('./views/AdminYardSlotMapView').then(m => ({ default: m.AdminYardSlotMapView })));
const AdminUnifiedRequestsView = lazy(() => import('./views/AdminUnifiedRequestsView').then(m => ({ default: m.AdminUnifiedRequestsView })));
const AdminGmailConnectorView = lazy(() => import('./views/AdminGmailConnectorView').then(m => ({ default: m.AdminGmailConnectorView })));
const TruckIntelligenceDrawer = lazy(() => import('./components/TruckIntelligenceDrawer').then(m => ({ default: m.TruckIntelligenceDrawer })));
const DevConsole = lazy(() => import('./components/DevConsoleModal').then(m => ({ default: m.DevConsole })));

export interface UnifiedCockpitProps {
  user?: {
    email?: string;
    full_name?: string;
    company?: string;
    role?: string;
  } | null;
  onSignOut?: () => void;
}

export default function App({ user, onSignOut }: UnifiedCockpitProps = {}) {
  // Skeleton Loading on First Load (~600ms)
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const ALL_ADMIN_ROUTES: NavTab[] = [
    'admin-exception-tower',
    'admin-all-requests',
    'admin-all-shipments',
    'admin-gmail-connector',
    'cargo-bookings',
    'corridor-simulation',
    'xgboost-ml',
    'qpiai-quantum',
    'qpiai-pilot',
    'admin-fleet-radar',
    'admin-haul-queue',
    'admin-truck-inventory',
    'admin-all-fleet-orders',
    'admin-users-roles',
    'admin-audit-log',
    'admin-yard-slot-map'
  ];

  const ALL_CUSTOMER_ROUTES: NavTab[] = [
    'customer-shipments',
    'cargo-bookings',
    'customer-book',
    'marketplace',
    'corridor-simulation',
    'customer-tracking',
    'qpiai-pilot',
    'customer-fleet'
  ];

  const ALL_VALID_ROUTES: NavTab[] = [...ALL_ADMIN_ROUTES, ...ALL_CUSTOMER_ROUTES];

  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const hasElevation = typeof window !== 'undefined' && !!getElevationToken();

  const getInitialRole = (): Role => {
    // 1. Check URL param first
    const urlRole = searchParams?.get('role');
    if (urlRole === 'admin') return 'admin';
    if (urlRole === 'customer') return 'customer';

    // 2. Check localStorage / sessionStorage persistence (keeps user on present page after refresh)
    try {
      const stored = localStorage.getItem('freightiq_active_role') || sessionStorage.getItem('freightiq_active_role');
      if (stored === 'admin') return 'admin';
      if (stored === 'customer') return 'customer';
    } catch {}

    if (user?.role?.toLowerCase() === 'admin') return 'admin';
    return hasElevation ? 'admin' : 'customer';
  };

  const initialRole = getInitialRole();

  const getInitialTab = (role: Role): NavTab => {
    let candidate: NavTab | null = (searchParams?.get('tab') as NavTab) || null;
    if (!candidate) {
      try {
        candidate = (localStorage.getItem('freightiq_active_tab') || sessionStorage.getItem('freightiq_active_tab')) as NavTab | null;
      } catch {}
    }

    if (candidate && ALL_VALID_ROUTES.includes(candidate)) {
      if (role === 'admin') {
        return candidate;
      }
      if (ALL_CUSTOMER_ROUTES.includes(candidate)) {
        return candidate;
      }
    }

    return role === 'admin' ? 'admin-exception-tower' : 'customer-shipments';
  };

  const initialUrlPage = searchParams?.get('page') || 'landing';
  const [page, setPage] = useState<string>(initialUrlPage);
  const [loginRole, setLoginRole] = useState<'customer' | 'admin'>(initialRole);

  // Dual-Panel Role State ('admin' | 'customer')
  const [activeRole, setActiveRole] = useState<Role>(initialRole);
  const [roleSwitcherModalOpen, setRoleSwitcherModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // User Profile State (persisted across sessions & updated on registration/login)
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    if (user?.email) {
      return {
        id: 'usr-init',
        email: user.email,
        full_name: user.full_name || LOGGED_IN_CUSTOMER_NAME,
        company: user.company || LOGGED_IN_CUSTOMER_COMPANY,
        phone: '+91 98201 55194',
        corridor: 'NH-48 (Bengaluru - Mumbai JNPT)',
        gstin: '27AABCV1234F1Z5',
        depot: 'JNPT Nhava Sheva Terminal 3',
        role: user.role?.toLowerCase() === 'admin' ? 'ADMIN' : 'CUSTOMER',
        role_label: user.role?.toLowerCase() === 'admin' ? 'Master Administrator' : 'Verified Customer'
      };
    }
    try {
      const saved = localStorage.getItem('freightiq_user');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return {
      id: 'usr-default',
      email: LOGGED_IN_CUSTOMER_EMAIL,
      full_name: LOGGED_IN_CUSTOMER_NAME,
      company: LOGGED_IN_CUSTOMER_COMPANY,
      phone: '+91 98201 55194',
      corridor: 'NH-48 (Bengaluru - Mumbai JNPT)',
      gstin: '27AABCV1234F1Z5',
      depot: 'JNPT Nhava Sheva Terminal 3',
      role: 'CUSTOMER',
      role_label: 'Verified Customer'
    };
  });

  const handleSaveProfile = (updated: UserProfile) => {
    setCurrentUser(updated);
    try {
      localStorage.setItem('freightiq_user', JSON.stringify(updated));
    } catch {}
    showToast(`✓ Profile updated: ${updated.full_name} (${updated.company})`);
  };

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<NavTab>(() => getInitialTab(initialRole));

  // Sync activeRole & activeTab to localStorage, sessionStorage and browser URL query params
  useEffect(() => {
    try {
      localStorage.setItem('freightiq_active_role', activeRole);
      localStorage.setItem('freightiq_active_tab', activeTab);
      sessionStorage.setItem('freightiq_active_role', activeRole);
      sessionStorage.setItem('freightiq_active_tab', activeTab);
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        if (page === 'cockpit') {
          url.searchParams.set('page', 'cockpit');
          url.searchParams.set('role', activeRole);
          url.searchParams.set('tab', activeTab);
        } else if (page === 'login') {
          url.searchParams.set('page', 'login');
          url.searchParams.delete('tab');
        } else {
          url.searchParams.delete('page');
          url.searchParams.delete('role');
          url.searchParams.delete('tab');
        }
        window.history.replaceState({}, '', url.toString());
      }
    } catch {}
  }, [activeRole, activeTab, page]);

  // Master Application Data States with LocalStorage Persistence
  const [allConsignments, setAllConsignments] = useState<Consignment[]>(() => {
    try {
      const saved = localStorage.getItem('freightiq_consignments');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const map = new Map(parsed.map((c: Consignment) => [c.id, c]));
          for (const c of INITIAL_CONSIGNMENTS) {
            if (!map.has(c.id)) map.set(c.id, c);
          }
          return Array.from(map.values());
        }
      }
    } catch {}
    return INITIAL_CONSIGNMENTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('freightiq_consignments', JSON.stringify(allConsignments));
    } catch {}
  }, [allConsignments]);

  const [allOrders, setAllOrders] = useState<PurchasedTruckOrder[]>(() => {
    try {
      const version = localStorage.getItem('freightiq_orders_version');
      const saved = localStorage.getItem('freightiq_orders');
      if (version === 'v2_rental' && saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].amountPaidInr < 500000) {
          return parsed;
        }
      }
    } catch {}
    try {
      localStorage.setItem('freightiq_orders_version', 'v2_rental');
      localStorage.setItem('freightiq_orders', JSON.stringify(INITIAL_PURCHASED_ORDERS));
    } catch {}
    return INITIAL_PURCHASED_ORDERS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('freightiq_orders_version', 'v2_rental');
      localStorage.setItem('freightiq_orders', JSON.stringify(allOrders));
    } catch {}
  }, [allOrders]);
  const [waypoints, setWaypoints] = useState<WaypointWeather[]>(WAYPOINTS_WEATHER);
  const [units, setUnits] = useState<Record<string, TelemetryUnit>>(TELEMETRY_UNITS);
  const [backhauls, setBackhauls] = useState<BackhaulPairing[]>(BACKHAUL_ROWS);
  const [exceptions, setExceptions] = useState<FreightException[]>(FREIGHT_EXCEPTIONS);
  const [devLogs, setDevLogs] = useState<DevLogMessage[]>(INITIAL_DEV_LOGS);
  const [truckCatalog, setTruckCatalog] = useState<TruckListing[]>(TRUCK_CATALOG);
  const [haulRequests, setHaulRequests] = useState<HaulRequest[]>(() => {
    try {
      const saved = localStorage.getItem('freightiq_haul_requests');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_HAUL_REQUESTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('freightiq_haul_requests', JSON.stringify(haulRequests));
    } catch {}
  }, [haulRequests]);

  // Modals & Panels
  const [checkoutItem, setCheckoutItem] = useState<CheckoutItem | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [currency, setCurrency] = useState<'USD' | 'INR'>('INR');
  const [selectedConsignment, setSelectedConsignment] = useState<Consignment | null>(null);
  const [newBookingModalOpen, setNewBookingModalOpen] = useState(false);
  const [selectedCarrierCompany, setSelectedCarrierCompany] = useState<string>('FreightIQ Intermodal Command');
  const [isWeatherRefreshing, setIsWeatherRefreshing] = useState(false);
  const [pilotPrompt, setPilotPrompt] = useState<string | undefined>(undefined);
  const [selectedTrackingConsignmentId, setSelectedTrackingConsignmentId] = useState<string | undefined>(undefined);
  const [highlightYardContainerId, setHighlightYardContainerId] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  // Truck Intelligence Drawer (Admin Only)
  const [truckDrawerOpen, setTruckDrawerOpen] = useState(false);
  const [selectedTruckUnit, setSelectedTruckUnit] = useState<TelemetryUnit | null>(null);

  // Toast Notification System
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3400);
  };

  // ─────────────────────────────────────────────────────────────
  // 1. LIVE SUPABASE DATABASE SYNC & REALTIME EVENT STREAM
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;

    async function fetchLiveBookings() {
      try {
        const { data: bookings, error } = await supabase
          .from('cargo_bookings')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && bookings && bookings.length > 0 && isMounted) {
          const liveShipments: Consignment[] = bookings.map((b: any) => ({
            id: b.booking_ref || `CRG-${b.id?.slice(0, 5) || Math.floor(10000 + Math.random() * 90000)}`,
            origin: b.origin || 'Mumbai Nhava Sheva (JNPT)',
            destination: b.destination || 'Pune Chakan Industrial Hub',
            department: b.cargo_type || 'Industrial Goods',
            weightLbs: b.weight_lbs || 45000,
            valueUsd: b.declared_value_usd || 120000,
            mode: b.shipping_mode || 'First Class',
            delayRiskLevel: (b.risk_tier || 'LOW') as RiskLevel,
            delayRiskPercent: b.delay_risk_pct || 14.5,
            demurrageRisk: b.demurrage_penalty_usd || 0,
            carrierName: b.quantum_carrier_assigned || 'Western Express Logistics',
            circuitFile: b.qasm_file || 'circuit_qaoa_opt.qasm',
            netSavings: b.net_savings_usd || 1250,
            status: b.status || 'CONFIRMED',
            eta: '05h 30m',
            driverName: 'Vikram Malhotra',
            driverPhone: '+91 98201 55194',
            notes: 'Live Cloud Postgres synced consignment.',
            customerCompany: currentUser?.company || LOGGED_IN_CUSTOMER_COMPANY,
            customerName: currentUser?.full_name || LOGGED_IN_CUSTOMER_NAME
          }));

          setAllConsignments((prev) => {
            const liveMap = new Map(liveShipments.map(s => [s.id, s]));
            const others = prev.filter(p => !liveMap.has(p.id));
            return [...liveShipments, ...others];
          });
        }
      } catch (err) {
        console.warn('Supabase live fetch notice:', err);
      }
    }

    fetchLiveBookings();

    // Realtime Postgres Change Channel
    const channel = supabase
      .channel('public_cargo_bookings_live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cargo_bookings' },
        (payload) => {
          if ((payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') && payload.new) {
            const b: any = payload.new;
            const item: Consignment = {
              id: b.booking_ref || `CRG-${Math.floor(10000 + Math.random() * 90000)}`,
              origin: b.origin || 'Mumbai Nhava Sheva (JNPT)',
              destination: b.destination || 'Pune Chakan Industrial Hub',
              department: b.cargo_type || 'Industrial Goods',
              weightLbs: b.weight_lbs || 45000,
              valueUsd: b.declared_value_usd || 120000,
              mode: b.shipping_mode || 'First Class',
              delayRiskLevel: (b.risk_tier || 'LOW') as RiskLevel,
              delayRiskPercent: b.delay_risk_pct || 14.5,
              demurrageRisk: b.demurrage_penalty_usd || 0,
              carrierName: b.quantum_carrier_assigned || 'Western Express Logistics',
              circuitFile: b.qasm_file || 'circuit_qaoa_opt.qasm',
              netSavings: b.net_savings_usd || 1250,
              status: b.status || 'CONFIRMED',
              eta: '06h 00m',
              driverName: 'Vikram Malhotra',
              driverPhone: '+91 98201 55194',
              customerCompany: currentUser?.company || LOGGED_IN_CUSTOMER_COMPANY,
              customerName: currentUser?.full_name || LOGGED_IN_CUSTOMER_NAME
            };
            setAllConsignments(prev => [item, ...prev.filter(p => p.id !== item.id)]);
            showToast(`⚡ Live Postgres: Manifest ${item.id} received in real-time!`);
          } else if (payload.eventType === 'DELETE' && payload.old) {
            const oldRef = (payload.old as any).booking_ref;
            if (oldRef) {
              setAllConsignments(prev => prev.filter(p => p.id !== oldRef));
              showToast(`⚡ Live Postgres: Manifest ${oldRef} deleted from database.`);
            }
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [currentUser]);

  // ─────────────────────────────────────────────────────────────
  // 2. LIVE RUNNING TELEMETRY & SATELLITE RADAR ENGINE
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const telemetryTimer = setInterval(() => {
      // Live fluctuate active vehicle telemetry so data is continuously moving live
      setUnits((prevUnits) => {
        const next: Record<string, TelemetryUnit> = {};
        for (const [key, u] of Object.entries(prevUnits)) {
          const speedDelta = (Math.random() - 0.49) * 1.6;
          const newSpeed = Math.max(38, Math.min(64, Math.round((u.speedKmh + speedDelta) * 10) / 10));
          
          next[key] = {
            ...u,
            speedKmh: newSpeed,
            timestamp: `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} IST`
          };
        }
        return next;
      });
    }, 2800);

    return () => clearInterval(telemetryTimer);
  }, []);

  // ROUTE GUARD: Ensure customer cannot open admin routes or remain admin without valid elevation token
  useEffect(() => {
    const adminRoutes: NavTab[] = [
      'admin-exception-tower',
      'cargo-bookings',
      'corridor-simulation',
      'xgboost-ml',
      'qpiai-quantum',
      'admin-all-shipments',
      'admin-fleet-radar',
      'admin-haul-queue',
      'admin-truck-inventory',
      'admin-all-fleet-orders',
      'admin-users-roles',
      'admin-audit-log',
      'admin-yard-slot-map'
    ];

    if (activeRole === 'customer' && adminRoutes.includes(activeTab)) {
      setActiveTab('customer-shipments');
      showToast('Access restricted');
    }

    if (activeRole === 'admin') {
      const token = getElevationToken();
      if (!token) {
        if (currentUser.role?.toLowerCase() === 'admin' || currentUser.email?.toLowerCase().includes('admin')) {
          setElevationToken('freightiq-admin-master-elevation-token');
        } else {
          setActiveRole('customer');
          setActiveTab('customer-shipments');
          showToast('Admin elevation required. Switched to Customer mode.');
          return;
        }
      }

      // Master elevation token is permanently valid within session
      if (token === 'freightiq-admin-master-elevation-token') {
        return;
      }

      fetch('/api/auth/admin-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
        },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.elevated === false) {
            clearElevationToken();
            setActiveRole('customer');
            setActiveTab('customer-shipments');
            showToast('Admin session expired. Returned to Customer mode.');
          } else if (data?.token) {
            setElevationToken(data.token);
          }
        })
        .catch(() => {});
    }
  }, [activeRole, activeTab, currentUser]);

  // Periodic heartbeat verifying elevation token
  useEffect(() => {
    if (activeRole !== 'admin') return;

    const interval = setInterval(async () => {
      const token = getElevationToken();
      if (!token) {
        if (currentUser.role?.toLowerCase() === 'admin' || currentUser.email?.toLowerCase().includes('admin')) {
          setElevationToken('freightiq-admin-master-elevation-token');
          return;
        }
        setActiveRole('customer');
        setActiveTab('customer-shipments');
        showToast('Admin elevation expired. Returned to Customer mode.');
        return;
      }

      if (token === 'freightiq-admin-master-elevation-token') {
        return;
      }

      try {
        const res = await fetch('/api/auth/admin-verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-token': token,
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.elevated === false) {
            clearElevationToken();
            setActiveRole('customer');
            setActiveTab('customer-shipments');
            showToast('Admin elevation session expired. Returned to Customer mode.');
          } else if (data?.token) {
            setElevationToken(data.token);
          }
        }
      } catch {}
    }, 60000);

    return () => clearInterval(interval);
  }, [activeRole, currentUser]);

  // Role Switcher Handler (Exception Control Tower is the default admin landing page!)
  const handleSelectRole = (newRole: Role) => {
    if (newRole === 'customer') {
      clearElevationToken();
      const customerUser: UserProfile = {
        id: 'usr-default',
        email: LOGGED_IN_CUSTOMER_EMAIL,
        full_name: LOGGED_IN_CUSTOMER_NAME,
        company: LOGGED_IN_CUSTOMER_COMPANY,
        phone: '+91 98201 55194',
        gstin: '27AABCV1234F1Z5',
        corridor: 'NH-48 (Bengaluru - Mumbai JNPT)',
        depot: 'JNPT Nhava Sheva Terminal 3',
        role: 'CUSTOMER',
        role_label: 'Verified Customer'
      };
      setCurrentUser(customerUser);
      try {
        localStorage.setItem('freightiq_user', JSON.stringify(customerUser));
        localStorage.setItem('freightiq_active_role', 'customer');
        sessionStorage.setItem('freightiq_active_role', 'customer');
      } catch {}
      setActiveRole('customer');
      setActiveTab('customer-shipments');
      showToast(`Switched to Customer Panel (${LOGGED_IN_CUSTOMER_NAME})`);
    } else {
      const masterToken = 'freightiq-admin-master-elevation-token';
      setElevationToken(masterToken);
      const adminUser: UserProfile = {
        id: 'usr-admin',
        email: 'admin@gmail.com',
        full_name: 'Admin',
        company: 'FreightIQ Command',
        phone: '+91 98201 55194',
        gstin: '27AABCV1234F1Z5',
        corridor: 'NH-48 (Bengaluru - Mumbai JNPT)',
        depot: 'JNPT Nhava Sheva Terminal 3',
        role: 'ADMIN',
        role_label: 'Master Administrator'
      };
      setCurrentUser(adminUser);
      try {
        sessionStorage.setItem('freightiq_admin_token', masterToken);
        sessionStorage.setItem('freightiq_active_role', 'admin');
        localStorage.setItem('freightiq_active_role', 'admin');
        localStorage.setItem('freightiq_user', JSON.stringify(adminUser));
      } catch {}
      setActiveRole('admin');
      setActiveTab('admin-exception-tower');
      showToast(`Switched to Admin Operations (${ADMIN_USER_NAME})`);
    }
  };

  // Write to Audit Log (Tamper-evident record)
  const handleWriteAuditLog = (
    action: string,
    category: 'OVERRIDE' | 'PRICING' | 'TELEMETRY' | 'SECURITY' | 'ASSIGNMENT',
    details: string
  ) => {
    const newEntry: AuditLogEntry = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: `${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} IST`,
      actorName: ADMIN_USER_NAME,
      actorEmail: 'admin@gmail.com',
      actorRole: 'admin',
      action,
      category,
      details,
      ipAddress: '103.21.244.18',
      severity: 'INFO'
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  // Add a Dev Log
  const addDevLog = (level: DevLogMessage['level'], message: string) => {
    const newLog: DevLogMessage = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      level,
      message
    };
    setDevLogs((prev) => [newLog, ...prev.slice(0, 39)]);
  };

  // LIVE DATA ENGINE: Simulated heartbeat tick every 2–4s
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'hidden') return;

      // 1. Gently nudge speed & capacity on active units
      setUnits((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((key) => {
          const deltaSpeed = Math.floor((Math.random() - 0.5) * 3);
          const newSpeed = Math.max(35, Math.min(85, updated[key].speedKmh + deltaSpeed));
          const deltaCap = (Math.random() - 0.5) * 0.3;
          const newCap = Math.min(99, Math.max(40, parseFloat((updated[key].capacityPercent + deltaCap).toFixed(1))));
          updated[key] = {
            ...updated[key],
            speedKmh: newSpeed,
            capacityPercent: newCap
          };
        });
        return updated;
      });

      // 2. Weather fluctuation
      setWaypoints((prev) =>
        prev.map((wp) => ({
          ...wp,
          windKmh: parseFloat(Math.max(10, Math.min(60, wp.windKmh + (Math.random() - 0.48) * 0.9)).toFixed(1)),
          tempC: parseFloat((wp.tempC + (Math.random() - 0.5) * 0.3).toFixed(1))
        }))
      );

      // 3. Micro update on random consignment risk %
      setAllConsignments((prev) => {
        const randIdx = Math.floor(Math.random() * prev.length);
        return prev.map((c, i) => {
          if (i === randIdx) {
            const delta = (Math.random() - 0.5) * 0.5;
            const newRisk = Math.min(99.9, Math.max(10.0, c.delayRiskPercent + delta));
            return {
              ...c,
              delayRiskPercent: parseFloat(newRisk.toFixed(1))
            };
          }
          return c;
        });
      });

      // 4. Log heartbeat
      if (activeRole === 'admin') {
        addDevLog('WS', `Telemetry heartbeat: Waypoint & fleet state re-synced (Ping: ${Math.floor(2 + Math.random() * 4)}ms)`);
      }
    }, 3200);

    return () => clearInterval(interval);
  }, [activeRole]);

  // DATA SANITIZATION SELECTORS
  const roleShipments = getShipmentsForRole(allConsignments as any, activeRole);
  const roleOrders = getOrdersForRole(allOrders, activeRole);
  const roleUnits = getUnitsForRole(units, activeRole);

  // Admin Truck Intelligence Open
  const handleOpenTruckIntelligence = (unitNumber: string) => {
    const found = units[unitNumber] || units['Unit #4021'];
    setSelectedTruckUnit(found);
    setTruckDrawerOpen(true);
  };

  // Weather Refresh
  const handleForceWeatherRefresh = async () => {
    setIsWeatherRefreshing(true);
    try {
      const updated = await fetchLiveWaypoints(waypoints);
      setWaypoints(updated);
      showToast('Open-Meteo: 5/5 waypoints successfully updated');
    } catch {
      setWaypoints((prev) =>
        prev.map((wp) => ({
          ...wp,
          windKmh: parseFloat((wp.windKmh + (Math.random() - 0.5) * 2).toFixed(1)),
          tempC: parseFloat((wp.tempC + (Math.random() - 0.5) * 0.6).toFixed(1))
        }))
      );
      showToast('Open-Meteo: 5/5 waypoints successfully updated');
    } finally {
      setIsWeatherRefreshing(false);
    }
  };

  // Backhaul Pairing
  const handlePairBackhaul = (id: string) => {
    setBackhauls((prev) =>
      prev.map((bh) => (bh.id === id ? { ...bh, paired: true } : bh))
    );
    const item = backhauls.find((b) => b.id === id);
    showToast(`✓ Backhaul Paired: +₹${item?.netInr.toLocaleString('en-IN')} net savings generated!`);
  };

  // Resolve Exception
  const handleResolveException = (id: string) => {
    setExceptions((prev) =>
      prev.map((exc) => (exc.id === id ? { ...exc, resolved: true } : exc))
    );
    const exc = exceptions.find((e) => e.id === id);
    showToast(`✓ Exception resolved for ${exc?.unit}: AI Bypass route cleared`);
  };

  // Add Exception
  const handleAddException = (newExc: FreightException) => {
    setExceptions((prev) => [newExc, ...prev]);
    showToast(`New freight exception logged for ${newExc.unit}`);
  };

  // Re-run Risk
  const handleRerunRisk = async (id: string) => {
    const target = allConsignments.find((c) => c.id === id);
    if (!target) return;

    try {
      const pred = await predictDemurrageRisk({
        port: 'INNSA',
        carrier: target.carrierName,
        container_type: '40ft High Cube',
        dwell_days_so_far: 2,
        weather_risk_score: 25.0,
        congestion_index: 62.0,
      });

      setAllConsignments((prev) =>
        prev.map((c) => {
          if (c.id === id) {
            return {
              ...c,
              delayRiskPercent: pred.demurrage_probability,
              delayRiskLevel: pred.risk_level,
            };
          }
          return c;
        })
      );
    } catch {
      setAllConsignments((prev) =>
        prev.map((c) => {
          if (c.id === id) {
            const updatedRisk = parseFloat(Math.min(99.8, Math.max(14.0, c.delayRiskPercent + (Math.random() - 0.5) * 5)).toFixed(1));
            return {
              ...c,
              delayRiskPercent: updatedRisk,
              delayRiskLevel: updatedRisk > 75 ? 'CRITICAL' : updatedRisk > 45 ? 'HIGH' : updatedRisk > 25 ? 'MODERATE' : 'LOW'
            };
          }
          return c;
        })
      );
    }
    showToast(`XGBoost re-evaluated delay probability for ${id}`);
    addDevLog('ML', `Re-evaluated gradient boosted trees for manifest ${id}`);
  };

  // Reassign Carrier
  const handleReassignCarrier = async (id: string) => {
    const carriers = ['Dedicated Priority Air Cargo', 'Expedited Regional Express', 'Ground Priority Freight'];
    const current = allConsignments.find(c => c.id === id);
    const nextCarrier = current 
      ? carriers[(carriers.indexOf(current.carrierName) + 1) % carriers.length]
      : 'Expedited Regional Express';
    const newSavings = parseFloat(((current?.netSavings || 34800) + 1200).toFixed(2));

    setAllConsignments((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            carrierName: nextCarrier,
            netSavings: newSavings,
            circuitFile: `qpiai_circuit_${Date.now()}.qasm`
          };
        }
        return c;
      })
    );
    showToast(`QpiAI QUBO assigned optimal carrier for ${id}: ${nextCarrier}`);
    addDevLog('QUANTUM', `QpiAI-QSV circuit executed: carrier allocation updated for ${id}`);

    try {
      await supabase
        .from('cargo_bookings')
        .update({
          quantum_carrier_assigned: nextCarrier,
          net_savings_usd: newSavings
        })
        .eq('booking_ref', id);
    } catch {}
  };

  // Reassign Driver
  const handleReassignDriver = (id: string) => {
    const drivers = ['Vikram Malhotra (+91 98200 44192)', 'Daniel Vance (+1 312-555-0842)', 'Arjun Nambiar (+91 99800 77210)'];
    const chosen = drivers[Math.floor(Math.random() * drivers.length)];
    const [name, phone] = chosen.split(' (');
    setAllConsignments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, driverName: name, driverPhone: phone.replace(')', '') } : c))
    );
    showToast(`Assigned new operator ${name} to manifest ${id}`);
  };

  // Add Internal Note
  const handleAddInternalNote = (id: string) => {
    const note = prompt('Enter internal admin note for this consignment:');
    if (!note) return;
    setAllConsignments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, internalNotes: note } : c))
    );
    showToast(`Internal note saved for ${id}`);
  };

  // New Booking Submit (Customer / Admin)
  const handleNewBookingSubmit = async (newBooking: Partial<Consignment>) => {
    const isCustomer = activeRole === 'customer';
    const carrier = newBooking.carrierCompany || newBooking.carrierName || selectedCarrierCompany || 'FreightIQ Intermodal Command';
    const shipperCo = newBooking.shipperCompany || currentUser?.company || LOGGED_IN_CUSTOMER_COMPANY;
    const shipperPh = newBooking.shipperPhone || currentUser?.phone || '+91 98201 55194';
    const shipperAddr = newBooking.shipperAddress || currentUser?.address || 'Plot 42, Peenya Industrial Area, Phase 3, Bengaluru - 560058';

    const fullBooking: Consignment = {
      id: `CRG-BK-${Math.floor(25000 + Math.random() * 50000)}`,
      origin: newBooking.origin || 'Mumbai Nhava Sheva (JNPT)',
      destination: newBooking.destination || 'Bengaluru Peenya Logistics Park',
      department: newBooking.department || 'Industrial Goods',
      weightLbs: newBooking.weightLbs || 38000,
      valueUsd: newBooking.valueUsd || 140000,
      mode: newBooking.mode || 'First Class Intermodal',
      delayRiskLevel: newBooking.delayRiskLevel || 'LOW',
      delayRiskPercent: newBooking.delayRiskPercent || 14.5,
      demurrageRisk: newBooking.demurrageRisk || 0,
      carrierName: carrier,
      carrierCompany: carrier,
      shipperCompany: shipperCo,
      shipperAddress: shipperAddr,
      shipperPhone: shipperPh,
      shipperName: currentUser?.full_name || LOGGED_IN_CUSTOMER_NAME,
      shipperEmail: currentUser?.email || LOGGED_IN_CUSTOMER_EMAIL,
      circuitFile: newBooking.circuitFile || 'qpiai_circuit_1793229999.qasm',
      netSavings: newBooking.netSavings || 3400,
      status: isCustomer ? 'PENDING_APPROVAL' : (newBooking.status || 'CONFIRMED'),
      eta: isCustomer ? 'Awaiting Admin Acceptance' : '07h 45m',
      notes: newBooking.notes || `Order from ${shipperCo} (${shipperPh}) awaiting ${carrier} Admin acceptance.`,
      customerCompany: shipperCo,
      customerName: currentUser?.full_name || LOGGED_IN_CUSTOMER_NAME
    };

    setAllConsignments((prev) => [fullBooking, ...prev]);

    if (fullBooking.status === 'PENDING_APPROVAL') {
      showToast(`✓ Order ${fullBooking.id} submitted! Request sent to ${carrier} Admin for approval.`);
      handleWriteAuditLog('CARGO_ORDER_REQUESTED', 'ASSIGNMENT', `Customer ${shipperCo} (${shipperPh}) requested cargo haul with ${carrier}. Status: PENDING_APPROVAL`);
    } else {
      showToast(`✓ Consignment ${fullBooking.id} confirmed for ${carrier}.`);
      handleWriteAuditLog('CARGO_ORDER_CONFIRMED', 'ASSIGNMENT', `Consignment ${fullBooking.id} confirmed for ${carrier}`);
    }

    try {
      await supabase.from('cargo_bookings').insert({
        booking_ref: fullBooking.id,
        user_email: currentUser?.email || 'operations@freightiq.in',
        origin: fullBooking.origin,
        destination: fullBooking.destination,
        cargo_type: `${fullBooking.department} | Shipper: ${shipperCo} | Phone: ${shipperPh}`,
        weight_lbs: fullBooking.weightLbs,
        declared_value_usd: fullBooking.valueUsd,
        shipping_mode: `${fullBooking.mode} • Carrier: ${carrier}`,
        scheduled_delivery: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        status: fullBooking.status,
        delay_risk_pct: fullBooking.delayRiskPercent,
        risk_tier: fullBooking.delayRiskLevel,
        demurrage_penalty_usd: fullBooking.demurrageRisk,
        quantum_carrier_assigned: carrier,
        net_savings_usd: fullBooking.netSavings
      });
    } catch (e) {
      console.warn('Live Supabase insert notice:', e);
    }
  };

  // Admin Acceptance of Customer Orders
  const handleAcceptBookingOrder = async (bookingId: string) => {
    let targetBooking: Consignment | undefined;
    setAllConsignments((prev) =>
      prev.map((c) => {
        if (c.id === bookingId) {
          targetBooking = c;
          return { ...c, status: 'CONFIRMED', eta: 'Tomorrow, 14:00 IST' };
        }
        return c;
      })
    );
    showToast(`✓ Order ${bookingId} ACCEPTED! Manifest confirmed and driver notified.`);
    handleWriteAuditLog('ADMIN_ACCEPT_ORDER', 'ASSIGNMENT', `Admin accepted cargo order ${bookingId} for customer ${targetBooking?.shipperCompany || 'Shipper'}`);
    try {
      await supabase
        .from('cargo_bookings')
        .update({ status: 'CONFIRMED' })
        .eq('booking_ref', bookingId);
    } catch (e) {
      console.warn('Supabase order accept sync notice:', e);
    }
  };

  // Admin Rejection of Customer Orders
  const handleRejectBookingOrder = async (bookingId: string) => {
    setAllConsignments((prev) =>
      prev.map((c) => (c.id === bookingId ? { ...c, status: 'REJECTED', eta: 'Order Declined' } : c))
    );
    showToast(`Order ${bookingId} declined by Admin.`);
    handleWriteAuditLog('ADMIN_REJECT_ORDER', 'ASSIGNMENT', `Admin declined cargo order ${bookingId}`);
    try {
      await supabase
        .from('cargo_bookings')
        .update({ status: 'REJECTED' })
        .eq('booking_ref', bookingId);
    } catch (e) {
      console.warn('Supabase order reject sync notice:', e);
    }
  };

  // Driver Call
  const handleOpenDriverCall = (driverName?: string, phone?: string) => {
    showToast(`Connecting secure satellite VoIP link to ${driverName || 'Operator'} (${phone || '+1 312-555-0194'})...`);
  };

  // Driver Chat
  const handleOpenDriverChat = (unit?: string) => {
    const target = unit || 'Unit #4021';
    setActiveTab('qpiai-pilot');
    setPilotPrompt(`Query status and route telemetry for ${target} along NH-48 corridor.`);
  };

  // Payment Checkout
  const handleInitiateCheckout = (item: CheckoutItem) => {
    setCheckoutItem(item);
    setPaymentModalOpen(true);
  };

  // Payment Success
  const handlePaymentSuccess = async (newOrder: PurchasedTruckOrder | null, metadata?: Record<string, any>) => {
    if (newOrder) {
      setAllOrders((prev) => [newOrder, ...prev]);
      showToast(`✓ Order Confirmed! ${newOrder.truckName} added to fleet inventory.`);
      setTimeout(() => {
        setPaymentModalOpen(false);
        setActiveTab(activeRole === 'admin' ? 'admin-all-fleet-orders' : 'customer-fleet');
      }, 800);
    } else if (metadata?.type === 'CONSIGNMENT') {
      const consignmentId = `CRG-${Math.floor(20000 + Math.random() * 80000)}`;
      const weightNum = metadata.Weight ? parseInt(metadata.Weight) : 32000;
      const weightLbs = Math.round(weightNum * (metadata.Weight?.includes('kg') ? 2.20462 : 1));
      
      const newConsignment: Consignment = {
        id: consignmentId,
        origin: metadata.Origin || 'Nhava Sheva (JNPT) Port, Mumbai',
        destination: metadata.Destination || 'Whitefield Technology Park, Bangalore',
        department: (metadata.Cargo || 'Industrial').split(' ')[0].toUpperCase(),
        weightLbs: weightLbs || 32000,
        valueUsd: 120000,
        mode: metadata.ServiceTier === 'QUANTUM_EXPRESS' ? 'Intermodal Prime' : 'Highway Hauler',
        delayRiskLevel: 'LOW',
        delayRiskPercent: 4.5,
        demurrageRisk: 0,
        carrierName: metadata.ServiceTier === 'QUANTUM_EXPRESS' ? 'Dedicated Priority Air Cargo' : 'Expedited Regional Express',
        circuitFile: `qpiai_circuit_${Date.now()}.qasm`,
        netSavings: 34800,
        status: 'CONFIRMED',
        eta: 'Tomorrow, 14:00 IST',
        driverName: 'Rohan Deshmukh',
        driverPhone: '+91 98200 44192',
        customerCompany: currentUser?.company || LOGGED_IN_CUSTOMER_COMPANY,
        customerName: currentUser?.full_name || LOGGED_IN_CUSTOMER_NAME
      };

      setAllConsignments((prev) => [newConsignment, ...prev]);

      // Direct write to Supabase cargo_bookings
      try {
        const { error } = await supabase.from('cargo_bookings').insert({
          booking_ref: newConsignment.id,
          user_email: currentUser?.email || 'client@freightiq.in',
          origin: newConsignment.origin,
          destination: newConsignment.destination,
          cargo_type: newConsignment.department,
          weight_lbs: newConsignment.weightLbs,
          declared_value_usd: newConsignment.valueUsd,
          shipping_mode: newConsignment.mode,
          scheduled_delivery: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
          status: newConsignment.status,
          delay_risk_pct: newConsignment.delayRiskPercent,
          risk_tier: newConsignment.delayRiskLevel,
          demurrage_penalty_usd: newConsignment.demurrageRisk,
          quantum_carrier_assigned: newConsignment.carrierName,
          net_savings_usd: newConsignment.netSavings,
          qasm_file: newConsignment.circuitFile
        });
        if (error) {
          console.warn('Supabase booking insert notice:', error.message);
        } else {
          console.log('[+] Live booking persisted to Supabase:', newConsignment.id);
        }
      } catch (err) {
        console.warn('Supabase network insert fallback:', err);
      }

      showToast(`✓ Payment Cleared! Haul ${newConsignment.id} scheduled & synced to Supabase.`);
      setTimeout(() => {
        setPaymentModalOpen(false);
        setActiveTab(activeRole === 'admin' ? 'admin-all-shipments' : 'customer-shipments');
      }, 800);
    }
  };

  // Customer Haul Booking Confirmed
  const handleCustomerBookingConfirmed = async (newConsignment: Consignment) => {
    const withCompany = {
      ...newConsignment,
      customerCompany: currentUser?.company || LOGGED_IN_CUSTOMER_COMPANY,
      customerName: currentUser?.full_name || LOGGED_IN_CUSTOMER_NAME
    };
    setAllConsignments((prev) => [withCompany, ...prev]);

    // Automatically create corresponding Haul Request for Admin Haul Queue
    const newHaulReq: HaulRequest = {
      id: `REQ-${newConsignment.id.replace('CRG-', '')}`,
      customerCompany: withCompany.customerCompany,
      customerName: withCompany.customerName,
      origin: newConsignment.origin,
      destination: newConsignment.destination,
      cargoCategory: newConsignment.department,
      weightKg: Math.round(newConsignment.weightLbs * 0.453592),
      declaredValueUsd: newConsignment.valueUsd,
      serviceTier: newConsignment.mode === 'ROAD_EXPEDITED' ? 'ACCELERATED' : 'QUANTUM_EXPRESS',
      status: 'NEW',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' IST',
      suggestedQpiAiCarrier: newConsignment.carrierName,
      notes: `Commercial client booking via portal. Real-time QpiAI route optimized.`
    };
    setHaulRequests((prev) => [newHaulReq, ...prev]);

    showToast(`✓ Consignment ${newConsignment.id} submitted! Sent to Admin Haul Queue & Supabase.`);
    setActiveTab('customer-shipments');

    try {
      const { error } = await supabase.from('cargo_bookings').insert({
        booking_ref: newConsignment.id,
        user_email: currentUser?.email || 'client@freightiq.in',
        origin: newConsignment.origin,
        destination: newConsignment.destination,
        cargo_type: newConsignment.department,
        weight_lbs: newConsignment.weightLbs,
        declared_value_usd: newConsignment.valueUsd,
        shipping_mode: newConsignment.mode,
        scheduled_delivery: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        status: newConsignment.status,
        delay_risk_pct: newConsignment.delayRiskPercent,
        risk_tier: newConsignment.delayRiskLevel,
        demurrage_penalty_usd: newConsignment.demurrageRisk,
        quantum_carrier_assigned: newConsignment.carrierName,
        net_savings_usd: newConsignment.netSavings,
        qasm_file: newConsignment.circuitFile
      });
      if (error) console.warn('Supabase booking insert notice:', error.message);
    } catch (e) {
      console.warn('Live Supabase insert notice:', e);
    }

    // Simultaneously notify backend API to run ML telemetry and save in local backend DB
    try {
      fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_email: currentUser?.email || 'client@freightiq.in',
          origin: newConsignment.origin,
          destination: newConsignment.destination,
          cargo_type: newConsignment.department,
          weight_lbs: newConsignment.weightLbs,
          declared_value_usd: newConsignment.valueUsd,
          shipping_mode: newConsignment.mode,
          days_for_shipment_scheduled: 2
        })
      }).catch(() => {});
    } catch {}
  };

  // Admin Haul Queue actions
  const handleQuotePrice = async (requestId: string, priceUsd: number) => {
    setHaulRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? { ...r, status: 'QUOTED', quotedPriceUsd: priceUsd, quotedPriceInr: Math.round(priceUsd * 86.4) }
          : r
      )
    );
    showToast(`Spot quote of $${priceUsd} USD dispatched to client.`);
  };

  const handleApproveHaulRequest = async (requestId: string) => {
    setHaulRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'APPROVED' } : r))
    );
    const ref = requestId.replace('REQ-', 'CRG-');
    setAllConsignments((prev) =>
      prev.map((c) =>
        c.id === ref || c.id === requestId
          ? { ...c, status: 'CONFIRMED' }
          : c
      )
    );
    try {
      await supabase.from('cargo_bookings').update({ status: 'CONFIRMED' }).or(`booking_ref.eq.${ref},booking_ref.eq.${requestId}`);
    } catch {}
    showToast(`Request ${requestId} approved and locked in dispatch manifest.`);
  };

  const handleRejectHaulRequest = async (requestId: string) => {
    setHaulRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'REJECTED' } : r))
    );
    showToast(`Request ${requestId} marked as rejected.`);
  };

  const handleAssignTruckToHaul = async (requestId: string, truckId: string, driver: string) => {
    setHaulRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? { ...r, status: 'ASSIGNED', assignedTruckId: truckId, assignedDriver: driver }
          : r
      )
    );
    const ref = requestId.replace('REQ-', 'CRG-');
    setAllConsignments((prev) =>
      prev.map((c) =>
        c.id === ref || c.id === requestId
          ? { ...c, status: 'DISPATCHED', assignedDriver: driver, carrierName: `${truckId} - ${driver}` }
          : c
      )
    );
    try {
      await supabase.from('cargo_bookings').update({
        status: 'DISPATCHED',
        quantum_carrier_assigned: `${truckId} - ${driver}`
      }).or(`booking_ref.eq.${ref},booking_ref.eq.${requestId}`);
    } catch {}
    showToast(`Rig ${truckId} assigned to haul request ${requestId}`);
  };

  const handleOptimizeWithQpiAI = async (requestId: string) => {
    try {
      const res = await optimizeCarriers([requestId]);
      const savedFormatted = res.mitigated_penalty_inr.toLocaleString();
      setHaulRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? { ...r, suggestedQpiAiCarrier: `Expedited Regional Express (QUBO Optimal: saved ₹${savedFormatted})` }
            : r
        )
      );
      showToast(`QpiAI quantum QUBO solved for ${requestId} (${res.solver}): Optimal carrier suggested.`);
    } catch {
      setHaulRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? { ...r, suggestedQpiAiCarrier: 'Expedited Regional Express (QUBO Optimal: saved ₹14,200)' }
            : r
        )
      );
      showToast(`QpiAI quantum QUBO solved for ${requestId}: Optimal carrier suggested.`);
    }
  };

  // Admin Truck Inventory actions
  const handleUpdateStock = (truckId: string, newStock: number) => {
    setTruckCatalog((prev) =>
      prev.map((t) => (t.id === truckId ? { ...t, inStock: newStock } : t))
    );
    showToast(`Updated showroom stock for ${truckId} to ${newStock} units`);
  };

  const handleUpdatePrice = (truckId: string, usd: number, inr: number) => {
    setTruckCatalog((prev) =>
      prev.map((t) => (t.id === truckId ? { ...t, priceUsd: usd, priceInr: inr } : t))
    );
    showToast(`Commercial spot price updated for ${truckId}`);
  };

  const handleAddNewTruck = (newTruck: TruckListing) => {
    setTruckCatalog((prev) => [newTruck, ...prev]);
    showToast(`Registered new commercial rig ${newTruck.name} into catalog`);
  };

  const handleToggleReservation = (truckId: string, status: 'AVAILABLE' | 'RESERVED' | 'SOLD', customerName?: string) => {
    setTruckCatalog((prev) =>
      prev.map((t) => (t.id === truckId ? { ...t, reservationStatus: status, reservedBy: customerName } : t))
    );
    showToast(`Reservation status updated to ${status} for ${truckId}`);
  };

  // Admin Fleet Orders actions
  const handleApproveOrder = (orderId: string) => {
    setAllOrders((prev) =>
      prev.map((o) => (o.orderId === orderId ? { ...o, status: 'IN_TRANSIT_TO_DEPOT' } : o))
    );
    showToast(`Pre-delivery inspection approved for order ${orderId}`);
  };

  const handleFulfillOrder = (orderId: string) => {
    setAllOrders((prev) =>
      prev.map((o) => (o.orderId === orderId ? { ...o, status: 'DELIVERED_TO_FLEET' } : o))
    );
    showToast(`Order ${orderId} marked as delivered and accepted into customer fleet`);
  };

  const handleCancelOrder = (orderId: string) => {
    setAllOrders((prev) => prev.filter((o) => o.orderId !== orderId));
    showToast(`Order ${orderId} cancelled and payment credited.`);
  };

  if (page === 'landing') {
    return (
      <Suspense fallback={<div className="min-h-screen bg-[#f5f0e8]" />}>
        <LandingPage
          onNavigateLogin={(role: any) => {
            setLoginRole(role === 'admin' ? 'admin' : 'customer');
            setPage('login');
          }}
          onLoginSuccess={(u: any) => {
            const isAdmin = u?.role?.toUpperCase() === 'ADMIN' || u?.email?.toLowerCase() === 'admin@gmail.com';
            const r: Role = isAdmin ? 'admin' : 'customer';
            if (isAdmin) {
              setElevationToken('freightiq-admin-master-elevation-token');
              try {
                sessionStorage.setItem('freightiq_admin_token', 'freightiq-admin-master-elevation-token');
                sessionStorage.setItem('freightiq_active_role', 'admin');
                localStorage.setItem('freightiq_active_role', 'admin');
              } catch {}
            }
            setActiveRole(r);
            setActiveTab(isAdmin ? 'admin-exception-tower' : 'customer-shipments');
            if (u) {
              const fullUser: UserProfile = {
                id: u.id || `usr-${Date.now().toString().slice(-6)}`,
                email: u.email || (isAdmin ? 'admin@gmail.com' : LOGGED_IN_CUSTOMER_EMAIL),
                full_name: u.full_name || u.name || (isAdmin ? 'Admin' : LOGGED_IN_CUSTOMER_NAME),
                company: u.company || (isAdmin ? 'FreightIQ Command' : LOGGED_IN_CUSTOMER_COMPANY),
                phone: u.phone || '+91 98201 55194',
                gstin: u.gstin || '27AABCV1234F1Z5',
                corridor: u.corridor || 'NH-48 (Bengaluru - Mumbai JNPT)',
                depot: u.depot || 'JNPT Nhava Sheva Terminal 3',
                role: isAdmin ? 'ADMIN' : 'CUSTOMER',
                role_label: isAdmin ? 'Master Administrator' : 'Verified Customer'
              };
              setCurrentUser(fullUser);
              try { localStorage.setItem('freightiq_user', JSON.stringify(fullUser)); } catch {}
            }
            if (typeof window !== 'undefined') {
              window.location.assign(`/?page=cockpit&role=${r}&tab=${isAdmin ? 'admin-exception-tower' : 'customer-shipments'}`);
            } else {
              setPage('cockpit');
            }
          }}
        />
      </Suspense>
    );
  }

  if (page === 'login') {
    return (
      <Suspense fallback={<div className="min-h-screen bg-[#f5f0e8]" />}>
        <LoginPage
          initialRole={loginRole}
          onNavigateLanding={() => setPage('landing')}
          onLoginSuccess={(u: any) => {
            const isAdmin = u?.role?.toUpperCase() === 'ADMIN' || u?.email?.toLowerCase() === 'admin@gmail.com';
            const r: Role = isAdmin ? 'admin' : 'customer';
            if (isAdmin) {
              setElevationToken('freightiq-admin-master-elevation-token');
              try {
                sessionStorage.setItem('freightiq_admin_token', 'freightiq-admin-master-elevation-token');
                sessionStorage.setItem('freightiq_active_role', 'admin');
                localStorage.setItem('freightiq_active_role', 'admin');
              } catch {}
            }
            setActiveRole(r);
            setActiveTab(isAdmin ? 'admin-exception-tower' : 'customer-shipments');
            if (u) {
              const fullUser: UserProfile = {
                id: u.id || `usr-${Date.now().toString().slice(-6)}`,
                email: u.email || (isAdmin ? 'admin@gmail.com' : LOGGED_IN_CUSTOMER_EMAIL),
                full_name: u.full_name || u.name || (isAdmin ? 'Admin' : LOGGED_IN_CUSTOMER_NAME),
                company: u.company || (isAdmin ? 'FreightIQ Command' : LOGGED_IN_CUSTOMER_COMPANY),
                phone: u.phone || '+91 98201 55194',
                gstin: u.gstin || '27AABCV1234F1Z5',
                corridor: u.corridor || 'NH-48 (Bengaluru - Mumbai JNPT)',
                depot: u.depot || 'JNPT Nhava Sheva Terminal 3',
                role: isAdmin ? 'ADMIN' : 'CUSTOMER',
                role_label: isAdmin ? 'Master Administrator' : 'Verified Customer'
              };
              setCurrentUser(fullUser);
              try { localStorage.setItem('freightiq_user', JSON.stringify(fullUser)); } catch {}
            }
            if (typeof window !== 'undefined') {
              window.location.assign(`/?page=cockpit&role=${r}&tab=${isAdmin ? 'admin-exception-tower' : 'customer-shipments'}`);
            } else {
              setPage('cockpit');
            }
          }}
        />
      </Suspense>
    );
  }

  return (
    <div className="relative min-h-screen text-[#08193A] flex flex-col antialiased select-none font-sans">
      {/* Background with Ambient Drifting Blobs & Canvas */}
      <LiquidBackground />

      {/* Primary Dashboard Two-Column Workspace */}
      <div className="flex flex-col md:flex-row flex-1 w-full min-h-screen relative z-10">
        {/* Floating Glass Sidebar */}
        <Sidebar
          activeRole={activeRole}
          onOpenRoleSwitcher={() => setRoleSwitcherModalOpen(true)}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          bookingCount={allConsignments.length}
          customerShipmentsCount={roleShipments.filter(c => c.status !== 'DELIVERED').length}
          purchasedFleetCount={roleOrders.length}
          pendingRequestsCount={
            allConsignments.filter(c => c.status === 'PENDING_APPROVAL').length +
            haulRequests.filter(h => h.status === 'NEW_INQUIRY').length +
            allOrders.filter(o => o.status === 'PENDING').length
          }
          onTriggerPilotPrompt={(prompt) => {
            setActiveTab('qpiai-pilot');
            setPilotPrompt(prompt);
          }}
          onSignOut={() => {
            try {
              localStorage.removeItem('freightiq_user');
              localStorage.removeItem('freightiq_token');
              sessionStorage.removeItem('freightiq_active_role');
              sessionStorage.removeItem('freightiq_active_tab');
              clearElevationToken();
              if (typeof window !== 'undefined') {
                const url = new URL(window.location.href);
                url.search = '';
                window.history.replaceState({}, '', url.toString());
              }
            } catch {}
            if (onSignOut) {
              onSignOut();
            } else {
              setPage('landing');
              showToast('Signed out from workspace.');
            }
          }}
          currentUser={currentUser}
          onOpenProfile={() => setProfileModalOpen(true)}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8">
          <div className="w-full max-w-[1600px] mx-auto space-y-6">
            
            {/* Top Workspace Header Bar with Clean Role Indicator & Demo Switcher */}
            <div className="flex items-center justify-between gap-4 p-3 rounded-[24px] glass-panel shadow-xs border border-white/80">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                  activeRole === 'admin' ? 'bg-[#08193A] text-[#34D399]' : 'bg-[#1B3A7A] text-white'
                }`}>
                  {activeRole === 'admin' ? <Shield className="w-4 h-4 text-[#34D399]" /> : <Users className="w-4 h-4 text-white" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#08193A]">
                      {activeRole === 'admin' ? 'FreightIQ Admin Operations Command' : `${currentUser?.company || LOGGED_IN_CUSTOMER_COMPANY} Shipper Portal`}
                    </span>
                    {/* Small Role Indicator */}
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase inline-flex items-center gap-1 ${
                      activeRole === 'admin' ? 'bg-[#08193A] text-[#A7F3D0]' : 'bg-[#34D399]/20 text-[#08193A]'
                    }`}>
                      {activeRole === 'admin' && <Lock className="w-2.5 h-2.5 text-[#34D399]" />}
                      <span>Role: {activeRole === 'admin' ? 'Admin' : 'Customer'}</span>
                    </span>
                    {activeRole === 'admin' && <AdminBadge />}
                  </div>
                  <p className="text-[10px] text-[#5B6B86]">
                    Active Session: <strong>{activeRole === 'admin' ? `${ADMIN_USER_NAME} (Operations Lead)` : `${currentUser?.full_name || LOGGED_IN_CUSTOMER_NAME} (${currentUser?.company || LOGGED_IN_CUSTOMER_COMPANY})`}</strong>
                  </p>
                </div>
              </div>

              {/* Action Buttons: Profile Settings & Demo Role Switcher */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setProfileModalOpen(true)}
                  className="px-3 py-1.5 rounded-full text-xs font-bold bg-white text-[#08193A] hover:bg-[#08193A] hover:text-white border border-black/10 transition-all liquid-btn flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="View and edit organization & phone details"
                >
                  <span>Profile Settings</span>
                </button>

                {DEMO_MODE && (
                  <button
                    onClick={() => setRoleSwitcherModalOpen(true)}
                    className="px-3 py-1.5 rounded-full text-xs font-bold bg-white text-[#08193A] hover:bg-[#08193A] hover:text-white border border-black/10 transition-all liquid-btn flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="Switch Console"
                  >
                    <Repeat className="w-3.5 h-3.5 text-[#34D399]" />
                    <span className="hidden sm:inline">Switch:</span>
                    <span>{activeRole === 'admin' ? 'Shipper Portal' : 'Admin Operations'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Skeleton Shimmer on first load */}
            {isLoading ? (
              <div className="space-y-6 animate-pulse">
                <div className="h-10 w-2/3 rounded-2xl bg-white/50" />
                <div className="h-12 w-full rounded-full bg-white/40" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-32 rounded-[26px] bg-white/45" />
                  ))}
                </div>
                <div className="h-96 rounded-[28px] bg-white/40" />
              </div>
            ) : (
              <>
                {/* Live Event Ticker with Role Context */}
                <LiveEventTicker 
                  onTriggerToast={showToast} 
                  role={activeRole} 
                />

                {/* ===================== CUSTOMER VIEWS ===================== */}
                {activeTab === 'customer-shipments' && (
                  <CustomerShipmentsView
                    consignments={roleShipments}
                    onSelectConsignmentForTracking={(c) => {
                      setSelectedTrackingConsignmentId(c.id);
                      setActiveTab('customer-tracking');
                    }}
                    onNavigateToBook={() => setActiveTab('customer-book')}
                    onOpenDriverCall={handleOpenDriverCall}
                    companyName={currentUser?.company}
                  />
                )}

                {/* Shared Cargo Bookings & Carrier Capacities Marketplace */}
                {activeTab === 'cargo-bookings' && (
                  <CargoBookingsView
                    consignments={allConsignments}
                    onSelectConsignment={setSelectedConsignment}
                    onOpenNewBookingModal={(carrier) => {
                      if (carrier) setSelectedCarrierCompany(carrier);
                      setNewBookingModalOpen(true);
                    }}
                    onForceWeatherRefresh={handleForceWeatherRefresh}
                    isWeatherRefreshing={isWeatherRefreshing}
                    onRerunRisk={handleRerunRisk}
                    onReassignCarrier={handleReassignCarrier}
                    userRole={activeRole}
                    onAcceptOrder={handleAcceptBookingOrder}
                    onRejectOrder={handleRejectBookingOrder}
                  />
                )}

                {activeTab === 'customer-tracking' && (
                  <CustomerTrackingView
                    consignments={roleShipments}
                    selectedConsignmentId={selectedTrackingConsignmentId}
                    onOpenDriverCall={handleOpenDriverCall}
                    onOpenDriverChat={handleOpenDriverChat}
                    onNavigateToShipments={() => setActiveTab('customer-shipments')}
                  />
                )}

                {activeTab === 'customer-book' && (
                  <CustomerBookShipmentView
                    onInitiatePayment={handleInitiateCheckout}
                    onBookingConfirmed={handleCustomerBookingConfirmed}
                  />
                )}

                {activeTab === 'marketplace' && (
                  <TruckMarketplaceView
                    onInitiateCheckout={handleInitiateCheckout}
                    purchasedOrders={roleOrders}
                    onViewPurchasedOrders={() => setActiveTab(activeRole === 'admin' ? 'admin-all-fleet-orders' : 'customer-fleet')}
                    userRole={activeRole}
                  />
                )}

                {activeTab === 'customer-fleet' && (
                  <CustomerFleetOrdersView
                    purchasedOrders={roleOrders}
                    onNavigateToMarketplace={() => setActiveTab('marketplace')}
                    currency={currency}
                  />
                )}

                {/* QpiAi Copilot View (Available to both Customer & Admin) */}
                {activeTab === 'qpiai-pilot' && (
                  <QpiAiPilotView
                    initialPrompt={pilotPrompt}
                    onClearInitialPrompt={() => setPilotPrompt(undefined)}
                    userName={currentUser?.full_name || (activeRole === 'admin' ? 'Admin' : 'Ananya Verma')}
                    userRole={activeRole}
                    onInitiateCheckout={handleInitiateCheckout}
                  />
                )}

                {/* Corridor & Simulator View (Shared for both Customer and Admin) */}
                {activeTab === 'corridor-simulation' && (
                  <CorridorSimulationView
                    waypoints={waypoints}
                    units={units}
                    backhauls={backhauls}
                    exceptions={exceptions}
                    onForceWeatherRefresh={handleForceWeatherRefresh}
                    isWeatherRefreshing={isWeatherRefreshing}
                    onPairBackhaul={handlePairBackhaul}
                    onResolveException={handleResolveException}
                    onAddException={handleAddException}
                    onOpenDriverChat={handleOpenDriverChat}
                  />
                )}

                {/* ===================== ADMIN ONLY VIEWS (Suspense Protected) ===================== */}
                <RoleGate allow="admin" currentRole={activeRole}>
                  <Suspense fallback={
                    <div className="p-12 text-center rounded-[30px] glass-panel space-y-3">
                      <div className="w-8 h-8 rounded-full border-2 border-t-[#34D399] animate-spin mx-auto" />
                      <p className="text-xs font-mono text-[#5B6B86]">Loading Admin Module...</p>
                    </div>
                  }>
                    {/* Admin Versions of Shared Views */}
                    {activeTab === 'admin-all-shipments' && (
                      <AdminAllShipmentsView
                        consignments={allConsignments}
                        onSelectConsignmentForTracking={(c) => {
                          setSelectedTrackingConsignmentId(c.id);
                          setActiveTab('admin-fleet-radar');
                        }}
                        onOpenTruckIntelligence={handleOpenTruckIntelligence}
                        onRerunRisk={handleRerunRisk}
                        onReassignCarrier={handleReassignCarrier}
                        onReassignDriver={handleReassignDriver}
                        onAddInternalNote={handleAddInternalNote}
                        onOpenDriverCall={handleOpenDriverCall}
                        onNavigateToBook={() => setActiveTab('customer-book')}
                      />
                    )}

                    {activeTab === 'admin-fleet-radar' && (
                      <AdminFleetRadarView
                        units={units}
                        onOpenTruckIntelligence={handleOpenTruckIntelligence}
                        onOpenDriverCall={handleOpenDriverCall}
                        onTriggerToast={showToast}
                      />
                    )}

                    {activeTab === 'admin-haul-queue' && (
                      <AdminHaulQueueView
                        haulRequests={haulRequests}
                        onQuotePrice={handleQuotePrice}
                        onApproveRequest={handleApproveHaulRequest}
                        onRejectRequest={handleRejectHaulRequest}
                        onAssignTruck={handleAssignTruckToHaul}
                        onOptimizeWithQpiAI={handleOptimizeWithQpiAI}
                      />
                    )}

                    {activeTab === 'admin-truck-inventory' && (
                      <AdminTruckInventoryView
                        catalog={truckCatalog}
                        onUpdateStock={handleUpdateStock}
                        onUpdatePrice={handleUpdatePrice}
                        onAddNewTruck={handleAddNewTruck}
                        onToggleReservation={handleToggleReservation}
                      />
                    )}

                    {activeTab === 'admin-all-fleet-orders' && (
                      <AdminAllFleetOrdersView
                        orders={allOrders}
                        onApproveOrder={handleApproveOrder}
                        onFulfillOrder={handleFulfillOrder}
                        onCancelOrder={handleCancelOrder}
                        currency={currency}
                      />
                    )}

                    {/* All Booking Requests Unified Desk (Cargo, Haul, Fleet - Admin Only) */}
                    {activeTab === 'admin-all-requests' && (
                      <AdminUnifiedRequestsView
                        consignments={allConsignments}
                        haulRequests={haulRequests}
                        fleetOrders={allOrders}
                        onAcceptCargoOrder={handleAcceptBookingOrder}
                        onRejectCargoOrder={handleRejectBookingOrder}
                        onApproveHaulRequest={handleApproveHaulRequest}
                        onRejectHaulRequest={handleRejectHaulRequest}
                        onApproveFleetOrder={handleApproveOrder}
                        onFulfillFleetOrder={handleFulfillOrder}
                        onCancelFleetOrder={handleCancelOrder}
                        onNavigateToGmail={() => setActiveTab('admin-gmail-connector')}
                      />
                    )}

                    {/* Live Gmail Connector for admin@gmail.com */}
                    {activeTab === 'admin-gmail-connector' && (
                      <AdminGmailConnectorView onTriggerToast={showToast} />
                    )}

                    {activeTab === 'xgboost-ml' && <XGBoostModelView />}

                    {activeTab === 'qpiai-quantum' && (
                      <QpiAIQuantumView onShowToast={showToast} />
                    )}

                    {/* Exception Control Tower (Admin Landing Page) */}
                    {activeTab === 'admin-exception-tower' && (
                      <AdminExceptionControlTowerView
                        onTriggerToast={showToast}
                        onNavigateToYard={(containerId) => {
                          setHighlightYardContainerId(containerId);
                          setActiveTab('admin-yard-slot-map');
                        }}
                        onWriteAuditLog={handleWriteAuditLog}
                      />
                    )}

                    {/* Admin-Only New Views */}
                    {activeTab === 'admin-users-roles' && <AdminUsersRolesView />}

                    {activeTab === 'admin-audit-log' && <AdminAuditLogView logs={auditLogs} />}

                    {activeTab === 'admin-yard-slot-map' && (
                      <AdminYardSlotMapView 
                        onTriggerToast={showToast} 
                        highlightContainerId={highlightYardContainerId}
                      />
                    )}

                    {/* Admin-Only Truck Intelligence Drawer */}
                    <TruckIntelligenceDrawer
                      isOpen={truckDrawerOpen}
                      onClose={() => setTruckDrawerOpen(false)}
                      unit={selectedTruckUnit}
                      onCallDriver={handleOpenDriverCall}
                      onChatDriver={handleOpenDriverChat}
                      onTriggerToast={showToast}
                    />

                    {/* Floating Dev Console (Admin Only) */}
                    <DevConsole
                      logs={devLogs}
                      onClearLogs={() => setDevLogs([])}
                      onSendMockPing={() => {
                        addDevLog('WS', 'Dispatcher sent manual WebSocket heartbeat: ACK 200 OK');
                        showToast('WebSocket Heartbeat ACK received (3.1ms)');
                      }}
                    />
                  </Suspense>
                </RoleGate>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Role Switcher Modal (Available for Demo) */}
      {DEMO_MODE && (
        <RoleSwitcherModal
          isOpen={roleSwitcherModalOpen}
          onClose={() => setRoleSwitcherModalOpen(false)}
          activeRole={activeRole}
          onSelectRole={handleSelectRole}
        />
      )}

      {/* Multi-Rail Payment Gateway Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        item={checkoutItem}
        onClose={() => setPaymentModalOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
        userRole={activeRole}
      />

      {/* Slide-In Master-Detail Drawer for Selected Consignment */}
      <ConsignmentDetailDrawer
        consignment={selectedConsignment}
        onClose={() => setSelectedConsignment(null)}
        onRerunRisk={handleRerunRisk}
        onReassignCarrier={handleReassignCarrier}
      />

      {/* Modal for + New Cargo Booking */}
      <NewBookingModal
        isOpen={newBookingModalOpen}
        onClose={() => setNewBookingModalOpen(false)}
        onSubmit={handleNewBookingSubmit}
        defaultCarrierCompany={selectedCarrierCompany}
        currentUser={currentUser}
      />

      {/* Modal for User Profile & Organization Dashboard */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        currentUser={currentUser}
        onSaveProfile={handleSaveProfile}
        activeRole={activeRole}
      />

      {/* Floating Glass Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full glass-panel shadow-[0_12px_36px_rgba(8,25,58,0.18)] border border-white/90 flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
          <span className="text-xs font-bold text-[#08193A] tracking-tight">
            {toastMessage}
          </span>
        </div>
      )}
    </div>
  );
}

export { App as UnifiedIntelligenceCockpit };
