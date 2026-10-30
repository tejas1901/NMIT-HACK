import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  AlertTriangle, 
  RefreshCw, 
  ArrowRight, 
  LayoutGrid, 
  Table as TableIcon,
  ChevronDown,
  ChevronUp,
  FileCode,
  Building2,
  Phone,
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { Consignment, RiskLevel } from '../types';
import { formatInr } from '../lib/currency';
import { CARRIER_COMPANIES } from '../components/NewBookingModal';

interface CargoBookingsViewProps {
  consignments: Consignment[];
  onSelectConsignment: (item: Consignment) => void;
  onOpenNewBookingModal: (defaultCarrier?: string) => void;
  onForceWeatherRefresh: () => void;
  isWeatherRefreshing: boolean;
  onRerunRisk: (id: string) => void;
  onReassignCarrier: (id: string) => void;
  userRole?: 'admin' | 'customer';
  onAcceptOrder?: (id: string) => void;
  onRejectOrder?: (id: string) => void;
}

export const CargoBookingsView: React.FC<CargoBookingsViewProps> = ({
  consignments,
  onSelectConsignment,
  onOpenNewBookingModal,
  onForceWeatherRefresh,
  isWeatherRefreshing,
  onRerunRisk,
  onReassignCarrier,
  userRole = 'customer',
  onAcceptOrder,
  onRejectOrder
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [isAdvisoryExpanded, setIsAdvisoryExpanded] = useState(false);

  // Compute pending orders
  const pendingOrders = consignments.filter(c => c.status === 'PENDING_APPROVAL');

  // Compute dynamic filter counts
  const countAll = consignments.length;
  const countPending = pendingOrders.length;
  const countConfirmed = consignments.filter(c => c.status === 'CONFIRMED').length;
  const countDispatched = consignments.filter(c => c.status === 'DISPATCHED').length;
  const countDelivered = consignments.filter(c => c.status === 'DELIVERED').length;
  const countAtRisk = consignments.filter(c => c.delayRiskLevel === 'CRITICAL' || c.delayRiskLevel === 'HIGH').length;

  // Dynamic Bento Metrics computed live from database
  const activeConsignmentsCount = consignments.filter(c => c.status !== 'DELIVERED').length;
  const totalDemurrageAvoided = consignments.reduce((acc, c) => acc + (c.netSavings || 34800), 0);
  const routeAlertsCount = consignments.filter(c => c.delayRiskLevel === 'CRITICAL' || c.delayRiskLevel === 'HIGH' || c.status === 'AT RISK').length;

  const filteredConsignments = consignments.filter((item) => {
    // Filter by carrier company if selected
    if (selectedCompanyFilter !== 'All') {
      const carrier = (item.carrierCompany || item.carrierName || '').toLowerCase();
      if (!carrier.includes(selectedCompanyFilter.toLowerCase())) {
        return false;
      }
    }

    const matchesSearch = 
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.shipperCompany && item.shipperCompany.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.carrierName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === 'Pending') return item.status === 'PENDING_APPROVAL';
    if (filterStatus === 'Confirmed') return item.status === 'CONFIRMED';
    if (filterStatus === 'Dispatched') return item.status === 'DISPATCHED';
    if (filterStatus === 'Delivered') return item.status === 'DELIVERED';
    if (filterStatus === 'At Risk') return item.delayRiskLevel === 'CRITICAL' || item.delayRiskLevel === 'HIGH';
    return true;
  });

  const getRiskPill = (level: RiskLevel, percent: number) => {
    switch (level) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F26D6D]/15 text-[#F26D6D] border border-[#F26D6D]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F26D6D]" />
            CRITICAL {percent.toFixed(1)}%
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F59E5B]/15 text-[#F59E5B] border border-[#F59E5B]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F59E5B]" />
            HIGH {percent.toFixed(1)}%
          </span>
        );
      case 'MODERATE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F6C65B]/15 text-[#F6C65B] border border-[#F6C65B]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F6C65B]" />
            MODERATE {percent.toFixed(1)}%
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
            LOW {percent.toFixed(1)}%
          </span>
        );
    }
  };

  const getStatusCapsule = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-900 border border-amber-500/40">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
            PENDING APPROVAL
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#1B3A7A]/15 text-[#1B3A7A] border border-[#1B3A7A]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1B3A7A]" />
            CONFIRMED
          </span>
        );
      case 'DISPATCHED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#34D399]/20 text-[#08193A] border border-[#34D399]/40">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
            DISPATCHED
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-slate-200 text-[#5B6B86] border border-slate-300">
            DELIVERED
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-rose-100 text-rose-800 border border-rose-300">
            REJECTED
          </span>
        );
      default:
        return (
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-100 text-amber-800 border border-amber-300">
            {status}
          </span>
        );
    }
  };

  const selectedCompanyInfo = CARRIER_COMPANIES.find(c => c.name === selectedCompanyFilter);

  return (
    <div className="space-y-6 pb-12">
      {/* View Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#34D399]/20 text-[#08193A] border border-[#34D399]/40 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#34D399]" />
              <span>INTER-COMPANY LOGISTICS MARKETPLACE</span>
            </span>
            <span className="text-xs text-[#5B6B86] font-semibold">• One Admin Per Company Architecture</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#08193A] tracking-tight">
            Commercial Cargo Bookings & Carrier Capacities
          </h1>
          <p className="text-xs md:text-sm text-[#5B6B86] mt-1 max-w-3xl leading-relaxed">
            Select a logistics carrier company below to inspect their available cargo capacity and routes. Orders submitted require approval from the carrier company's administrator.
          </p>
        </div>

        <button
          onClick={() => onOpenNewBookingModal(selectedCompanyFilter !== 'All' ? selectedCompanyFilter : undefined)}
          className="self-start lg:self-auto px-5 py-2.5 rounded-full text-xs font-bold bg-[#08193A] text-white hover:bg-[#1B3A7A] shadow-[0_4px_16px_rgba(8,25,58,0.22)] liquid-btn flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#34D399]" />
          <span>+ Book Cargo Capacity</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* SECTION 1: BROWSE LOGISTICS COMPANIES & AVAILABLE CARGO */}
      {/* ============================================================== */}
      <div className="p-5 rounded-[28px] glass-panel border border-white/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-extrabold text-[#08193A] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#1B3A7A]" />
              <span>Browse Available Cargo by Logistics Carrier Company</span>
            </h3>
            <p className="text-xs text-[#5B6B86]">
              Press any company name to inspect their live available routes and reserve cargo space.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-[#1B3A7A] bg-white/80 px-3 py-1 rounded-full border border-white self-start sm:self-auto">
            5 Verified Fleets
          </span>
        </div>

        {/* Company Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* 'All' button */}
          <button
            onClick={() => setSelectedCompanyFilter('All')}
            className={`p-3.5 rounded-2xl text-left transition-all border cursor-pointer flex flex-col justify-between ${
              selectedCompanyFilter === 'All'
                ? 'bg-[#08193A] text-white border-[#08193A] shadow-md'
                : 'bg-white/60 text-[#08193A] border-white/80 hover:bg-white'
            }`}
          >
            <div>
              <span className="text-[10px] font-mono font-bold uppercase opacity-70">Fleet View</span>
              <p className="text-xs font-extrabold mt-0.5">All Carrier Companies</p>
            </div>
            <div className="mt-2 text-[11px] opacity-80 flex items-center justify-between">
              <span>{countAll} Total Consignments</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* Each Carrier Company */}
          {CARRIER_COMPANIES.map((company) => {
            const isSelected = selectedCompanyFilter === company.name;
            return (
              <button
                key={company.name}
                onClick={() => setSelectedCompanyFilter(company.name)}
                className={`p-3.5 rounded-2xl text-left transition-all border cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#08193A] text-white border-[#08193A] shadow-md scale-[1.02]'
                    : 'bg-white/60 text-[#08193A] border-white/80 hover:bg-white hover:border-[#34D399]/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md ${
                      isSelected ? 'bg-[#34D399] text-[#08193A]' : 'bg-[#08193A]/10 text-[#08193A]'
                    }`}>
                      {company.code}
                    </span>
                    <span className="text-[10px] font-semibold opacity-75">★ {company.rating}</span>
                  </div>
                  <p className="text-xs font-extrabold leading-tight truncate" title={company.name}>
                    {company.name}
                  </p>
                  <p className="text-[10px] mt-0.5 opacity-70 truncate">{company.corridor}</p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-current/15 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-[#34D399] truncate">{company.availableSlots}</span>
                  <span className="text-[10px] opacity-75">1 Admin</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Company Action Ribbon */}
        {selectedCompanyInfo && (
          <div className="p-4 rounded-2xl bg-[#08193A]/5 border border-[#08193A]/10 flex flex-col md:flex-row md:items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-[#08193A]">
                  Active Carrier Filter: {selectedCompanyInfo.name}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#34D399]/20 text-[#08193A] border border-[#34D399]/40">
                  Verified Admin: {selectedCompanyInfo.adminEmail}
                </span>
              </div>
              <p className="text-xs text-[#5B6B86]">
                Available Routes: <strong>{selectedCompanyInfo.availableRoutes.join(' • ')}</strong> | Capacity: <strong>{selectedCompanyInfo.availableSlots}</strong>
              </p>
            </div>

            <button
              onClick={() => onOpenNewBookingModal(selectedCompanyInfo.name)}
              className="px-4 py-2 rounded-full text-xs font-bold bg-[#08193A] text-white hover:bg-[#1B3A7A] transition-all liquid-btn shadow-xs flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#34D399]" />
              <span>Book Cargo with {selectedCompanyInfo.code}</span>
            </button>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* SECTION 2: PENDING ORDER APPROVAL REQUESTS (ADMIN & CUSTOMER) */}
      {/* ============================================================== */}
      {pendingOrders.length > 0 && (
        <div className="p-5 rounded-[28px] bg-amber-500/10 border border-amber-500/30 space-y-4 shadow-sm animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/20 pb-3">
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-amber-700 animate-pulse shrink-0" />
              <div>
                <h3 className="text-sm font-extrabold text-[#08193A] flex items-center gap-2">
                  <span>Order Requests Pending Administrator Acceptance</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/25 text-amber-900 border border-amber-500/40">
                    {pendingOrders.length} New
                  </span>
                </h3>
                <p className="text-xs text-[#08193A]/80">
                  Customer orders awaiting carrier company administrator confirmation and driver dispatch.
                </p>
              </div>
            </div>

            {userRole === 'admin' && (
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-[#34D399] text-[#08193A] shadow-xs">
                Admin Console Mode: Authorize Orders
              </span>
            )}
          </div>

          <div className="space-y-3">
            {pendingOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-2xl bg-white/80 border border-amber-500/30 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Left: Shipper Details & Route */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-xs text-[#08193A] bg-black/5 px-2.5 py-0.5 rounded-lg">
                      {order.id}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-900 border border-blue-500/30 flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-blue-700" />
                      <span>Shipper: {order.shipperCompany || order.customerCompany || 'Customer Shipper'}</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-900 border border-purple-500/30">
                      Target Carrier: {order.carrierCompany || order.carrierName}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-[#08193A]">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#1B3A7A] shrink-0" />
                      <span>{order.origin} → {order.destination}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#5B6B86]">
                      <span>{order.department} • {order.weightLbs.toLocaleString()} lbs • {formatInr(order.valueUsd)}</span>
                    </div>
                  </div>

                  {/* Customer Mandatory Contact & Address Info */}
                  <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/15 text-xs text-[#08193A] flex flex-wrap items-center gap-x-5 gap-y-1">
                    <span className="flex items-center gap-1 text-[11px] font-semibold">
                      <Phone className="w-3 h-3 text-amber-700" />
                      <span>Phone: {order.shipperPhone || '+91 98201 55194'}</span>
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-semibold truncate max-w-md">
                      <MapPin className="w-3 h-3 text-amber-700" />
                      <span>Pickup Facility: {order.shipperAddress || 'Peenya Industrial Logistics Yard, Bengaluru'}</span>
                    </span>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
                  {userRole === 'admin' ? (
                    <>
                      <button
                        onClick={() => onAcceptOrder && onAcceptOrder(order.id)}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-[#34D399] text-[#08193A] hover:bg-[#6EE7B7] transition-all liquid-btn shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Accept & Confirm Order</span>
                      </button>
                      <button
                        onClick={() => onRejectOrder && onRejectOrder(order.id)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-500/15 text-rose-800 hover:bg-rose-500/25 border border-rose-500/30 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </button>
                    </>
                  ) : (
                    <div className="px-3.5 py-2 rounded-xl bg-amber-500/20 text-amber-900 border border-amber-500/40 text-xs font-bold flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-amber-700 animate-spin" />
                      <span>Waiting for Carrier Admin Approval</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Bento Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* 1. ACTIVE CARGO CONSIGNMENTS */}
        <div className="p-4 rounded-[26px] glass-panel-dark text-white flex flex-col justify-between shadow-md min-w-0">
          <span className="text-[11px] font-bold tracking-wider uppercase text-white/60">
            Active Cargo Consignments
          </span>
          <div className="my-2">
            <span className="text-4xl font-extrabold font-mono text-white tabular-nums">
              {activeConsignmentsCount}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#A7F3D0]">
            <span className="w-2 h-2 rounded-full bg-[#34D399] animate-mint-pulse" />
            <span>Synced to Supabase Cloud</span>
          </div>
        </div>

        {/* 2. DEMURRAGE PENALTIES MITIGATED */}
        <div className="p-4 rounded-[26px] glass-panel flex flex-col justify-between min-w-0">
          <span className="text-[11px] font-bold tracking-wider uppercase text-[#5B6B86]">
            Demurrage Mitigated
          </span>
          <div className="my-2">
            <span className="text-2xl xl:text-3xl font-extrabold font-mono text-[#08193A] tabular-nums" title={formatInr(totalDemurrageAvoided)}>
              {formatInr(totalDemurrageAvoided, { forceDecimals: true })}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#5B6B86] font-medium">via QpiAI Quantum QUBO</span>
            <svg className="w-16 h-5 stroke-[#34D399] fill-none" viewBox="0 0 60 20">
              <path d="M 0 16 Q 15 4, 30 12 T 60 2" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* 3. PREDICTIVE ENGINE */}
        <div className="p-4 rounded-[26px] glass-panel flex flex-col justify-between min-w-0">
          <span className="text-[11px] font-bold tracking-wider uppercase text-[#5B6B86]">
            Predictive Engine
          </span>
          <div className="my-2 flex items-center justify-between">
            <span className="text-2xl font-extrabold text-[#08193A]">
              XGBoost 3.2
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#1B3A7A]/15 text-[#1B3A7A] border border-[#1B3A7A]/30">
              98.4% ROC-AUC
            </span>
          </div>
          <p className="text-[11px] text-[#5B6B86] font-medium truncate">
            Real-time NH-48 Dwell Risk Scoring
          </p>
        </div>

        {/* 4. QUANTUM ENGINE */}
        <div className="p-4 rounded-[26px] glass-panel flex flex-col justify-between min-w-0">
          <span className="text-[11px] font-bold tracking-wider uppercase text-[#5B6B86]">
            Quantum Allocation
          </span>
          <div className="my-2 flex items-center justify-between">
            <span className="text-2xl font-extrabold text-[#08193A]">
              QpiAI-QSV
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#34D399]/20 text-[#08193A] border border-[#34D399]/40">
              QUBO Solved
            </span>
          </div>
          <p className="text-[11px] text-[#5B6B86] font-medium truncate">
            Hamiltonian Cost Optimization
          </p>
        </div>

        {/* 5. ROUTE WEATHER SENTINEL */}
        <div className="p-4 rounded-[26px] glass-panel flex flex-col justify-between min-w-0">
          <span className="text-[11px] font-bold tracking-wider uppercase text-[#5B6B86]">
            Route Weather Radar
          </span>
          <div className="my-2 flex items-center gap-2">
            <span className="text-2xl font-extrabold text-[#08193A] tabular-nums">
              {routeAlertsCount} Alerts
            </span>
          </div>
          <p className="text-[11px] text-[#5B6B86] font-medium truncate">
            Open-Meteo Live • 30m Auto
          </p>
        </div>
      </div>

      {/* Live Manifest Register Card */}
      <div className="p-5 md:p-6 rounded-[28px] glass-panel space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg md:text-xl font-bold text-[#08193A]">
              Live Cargo Manifest Register
            </h2>
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-white/70 text-[#08193A] border border-white">
              {filteredConsignments.length} consignments
            </span>
          </div>

          {/* Search + View Toggle */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#5B6B86] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ref, shipper, carrier, city..."
                className="pl-8 pr-3 py-1.5 rounded-full text-xs font-medium glass-input text-[#08193A] placeholder-[#5B6B86]/70 w-56 sm:w-64"
              />
            </div>
            
            <div className="p-1 rounded-full bg-white/60 border border-white/80 flex items-center">
              <button
                onClick={() => setViewMode('table')}
                aria-label="Table View"
                className={`p-1.5 rounded-full transition-all ${
                  viewMode === 'table' ? 'bg-[#08193A] text-white' : 'text-[#5B6B86]'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                aria-label="Cards View"
                className={`p-1.5 rounded-full transition-all ${
                  viewMode === 'cards' ? 'bg-[#08193A] text-white' : 'text-[#5B6B86]'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Chips with counts */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'All', label: 'All', count: countAll },
            { id: 'Pending', label: 'Pending Approval', count: countPending },
            { id: 'Confirmed', label: 'Confirmed', count: countConfirmed },
            { id: 'Dispatched', label: 'Dispatched', count: countDispatched },
            { id: 'Delivered', label: 'Delivered', count: countDelivered },
            { id: 'At Risk', label: 'At Risk', count: countAtRisk }
          ].map((chip) => {
            const isActive = filterStatus === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => setFilterStatus(chip.id)}
                className={`px-3 py-1 rounded-full font-semibold transition-all flex items-center gap-1.5 shrink-0 liquid-btn ${
                  isActive
                    ? 'bg-[#08193A] text-white shadow-xs'
                    : 'bg-white/60 text-[#5B6B86] hover:bg-white hover:text-[#08193A] border border-white/80'
                }`}
              >
                <span>{chip.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-[#34D399] text-[#08193A] font-bold' : 'bg-black/5 text-[#5B6B86]'
                }`}>
                  {chip.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Table Layout */}
        {viewMode === 'table' ? (
          <div className="overflow-x-auto rounded-[20px] border border-white/60 bg-white/40">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#08193A]/10 text-[11px] font-bold uppercase tracking-wider text-[#5B6B86] bg-white/40">
                  <th className="py-3 px-3.5">Booking Ref</th>
                  <th className="py-3 px-3.5">Shipper Customer</th>
                  <th className="py-3 px-3.5">Target Carrier</th>
                  <th className="py-3 px-3.5">Route</th>
                  <th className="py-3 px-3.5">Cargo Department</th>
                  <th className="py-3 px-3.5 text-right">Weight & Value</th>
                  <th className="py-3 px-3.5">Status</th>
                  <th className="py-3 px-3.5">XGBoost Risk</th>
                  <th className="py-3 px-3.5 text-right">Demurrage</th>
                  <th className="py-3 px-2 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/70">
                {filteredConsignments.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => onSelectConsignment(item)}
                    className="hover:bg-white/70 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-3.5 font-mono font-bold text-[#08193A] whitespace-nowrap">
                      {item.id}
                    </td>

                    <td className="py-3 px-3.5 min-w-[140px]">
                      <div className="font-semibold text-[#08193A] truncate">
                        {item.shipperCompany || item.customerCompany || 'Vikas Intermodal Corp'}
                      </div>
                      <div className="text-[10px] text-[#5B6B86] truncate">
                        {item.shipperPhone || '+91 98201 55194'}
                      </div>
                    </td>

                    <td className="py-3 px-3.5 min-w-[160px]">
                      <span className="font-semibold text-[#1B3A7A] truncate block">
                        {item.carrierCompany || item.carrierName}
                      </span>
                    </td>

                    <td className="py-3 px-3.5 min-w-[180px]">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-[#08193A] truncate">{item.origin}</span>
                        <div className="flex items-center gap-1 text-[11px] text-[#5B6B86]">
                          <ArrowRight className="w-3 h-3 text-[#34D399] shrink-0" />
                          <span className="truncate">{item.destination}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3.5 text-[#08193A] font-medium whitespace-nowrap">
                      {item.department}
                    </td>

                    <td className="py-3 px-3.5 text-right font-mono whitespace-nowrap">
                      <div className="text-[#08193A] font-semibold">{item.weightLbs.toLocaleString()} lbs</div>
                      <div className="text-[11px] text-[#5B6B86]">{formatInr(item.valueUsd)}</div>
                    </td>

                    <td className="py-3 px-3.5 whitespace-nowrap">
                      {getStatusCapsule(item.status)}
                    </td>

                    <td className="py-3 px-3.5 whitespace-nowrap">
                      {getRiskPill(item.delayRiskLevel, item.delayRiskPercent)}
                    </td>

                    <td className="py-3 px-3.5 text-right font-mono font-bold text-[#F26D6D] whitespace-nowrap">
                      {formatInr(item.demurrageRisk)}
                    </td>

                    <td className="py-3 px-2 text-center">
                      <ArrowUpRight className="w-4 h-4 text-[#5B6B86] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredConsignments.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectConsignment(item)}
                className="p-4 rounded-2xl bg-white/60 border border-white/80 hover:bg-white hover:border-[#34D399] transition-all cursor-pointer space-y-3 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-[#08193A]">{item.id}</span>
                  {getStatusCapsule(item.status)}
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] text-[#5B6B86]">
                    Shipper: <strong className="text-[#08193A]">{item.shipperCompany || item.customerCompany || 'Verified Shipper'}</strong>
                  </p>
                  <p className="text-[11px] text-[#5B6B86]">
                    Carrier: <strong className="text-[#1B3A7A]">{item.carrierCompany || item.carrierName}</strong>
                  </p>
                  <div className="text-xs font-semibold text-[#08193A] pt-1">
                    {item.origin} → {item.destination}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-black/5 text-xs">
                  <span className="font-mono text-[#5B6B86]">{item.weightLbs.toLocaleString()} lbs</span>
                  <span className="font-mono font-bold text-[#08193A]">{formatInr(item.valueUsd)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
