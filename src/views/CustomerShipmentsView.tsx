import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  Navigation, 
  Clock, 
  MapPin, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Plus, 
  PhoneCall, 
  TrendingUp,
  SlidersHorizontal,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Consignment, RiskLevel } from '../types';
import { formatInr, formatInrCompact } from '../lib/currency';

interface CustomerShipmentsViewProps {
  consignments: Consignment[];
  onSelectConsignmentForTracking: (item: Consignment) => void;
  onNavigateToBook: () => void;
  onOpenDriverCall: (driverName?: string, phone?: string) => void;
  companyName?: string;
}

export const CustomerShipmentsView: React.FC<CustomerShipmentsViewProps> = ({
  consignments = [],
  onSelectConsignmentForTracking,
  onNavigateToBook,
  onOpenDriverCall,
  companyName
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Customer account displays consignments for Elena Vance / Vance Intermodal
  const filtered = consignments.filter((c) => {
    const matchesSearch = 
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.department.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (statusFilter === 'In Transit') return c.status === 'DISPATCHED' || c.status === 'AT RISK';
    if (statusFilter === 'Confirmed') return c.status === 'CONFIRMED';
    if (statusFilter === 'Pending') return c.status === 'PENDING_APPROVAL';
    if (statusFilter === 'Delivered') return c.status === 'DELIVERED';
    return true;
  });

  const getProgressPercent = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL': return 10;
      case 'CONFIRMED': return 25;
      case 'DISPATCHED': return 65;
      case 'AT RISK': return 60;
      case 'DELIVERED': return 100;
      default: return 40;
    }
  };

  const totalValueInTransit = consignments
    .filter(c => c.status !== 'DELIVERED')
    .reduce((acc, c) => acc + c.valueUsd, 0);

  const customerDemurrageAvoided = consignments
    .reduce((acc, c) => acc + (c.netSavings || 34800), 0);

  const totalConsignmentsCount = Math.max(1, consignments.length);
  const onTimeCount = consignments.filter(c => c.delayRiskLevel === 'LOW' || c.status === 'DELIVERED').length;
  const onTimeSla = consignments.length > 0 ? ((onTimeCount / totalConsignmentsCount) * 100).toFixed(1) : '100.0';

  return (
    <div className="space-y-6 pb-16">
      {/* View Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#34D399]/20 text-[#08193A] border border-[#34D399]/40 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#34D399]" />
              <span>CUSTOMER SHIPMENT PORTAL</span>
            </span>
            <span className="text-xs text-[#5B6B86] font-medium">• {companyName || 'Vikas Intermodal Logistics Corp'}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#08193A] tracking-tight">
            My Active Commercial Consignments
          </h1>
          <p className="text-xs md:text-sm text-[#5B6B86] mt-1 max-w-3xl leading-relaxed">
            Real-time GPS telemetry tracking, automated demurrage alerts, driver VoIP satellite bridge, and autonomous corridor progress.
          </p>
        </div>

        <button
          onClick={onNavigateToBook}
          className="self-start lg:self-auto px-5 py-2.5 rounded-full text-xs font-bold bg-[#08193A] text-white hover:bg-[#1B3A7A] shadow-[0_4px_16px_rgba(8,25,58,0.22)] liquid-btn flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#34D399]" />
          <span>Request New Shipment</span>
        </button>
      </div>

      {/* Customer KPI Bento Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-[26px] glass-panel-dark text-white flex flex-col justify-between shadow-md">
          <span className="text-[11px] font-bold tracking-wider uppercase text-white/60">
            Active Shipments
          </span>
          <div className="my-2">
            <span className="text-3xl font-extrabold font-mono text-white tabular-nums">
              {consignments.filter(c => c.status !== 'DELIVERED').length}
            </span>
          </div>
          <p className="text-[11px] text-[#A7F3D0] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#34D399] animate-mint-pulse" />
            <span>All Units GPS Connected</span>
          </p>
        </div>

        <div className="p-4 rounded-[26px] glass-panel flex flex-col justify-between shadow-xs">
          <span className="text-[11px] font-bold tracking-wider uppercase text-[#5B6B86]">
            Total Value in Transit
          </span>
          <div className="my-2">
            <span className="text-2xl font-extrabold font-mono text-[#08193A]" title={formatInr(totalValueInTransit)}>
              {formatInrCompact(totalValueInTransit)}
            </span>
          </div>
          <p className="text-[11px] text-[#5B6B86] font-medium">
            100% Insured via CargoGuard
          </p>
        </div>

        <div className="p-4 rounded-[26px] glass-panel flex flex-col justify-between shadow-xs">
          <span className="text-[11px] font-bold tracking-wider uppercase text-[#5B6B86]">
            On-Time Arrival SLA
          </span>
          <div className="my-2 flex items-center justify-between">
            <span className="text-2xl font-extrabold font-mono text-[#08193A]">
              {onTimeSla}%
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-[#34D399]/20 text-[#08193A]">
              HIGH CONFIDENCE
            </span>
          </div>
          <p className="text-[11px] text-[#5B6B86] font-medium">
            Protected by QpiAI Governor
          </p>
        </div>

        <div className="p-4 rounded-[26px] glass-panel flex flex-col justify-between shadow-xs">
          <span className="text-[11px] font-bold tracking-wider uppercase text-[#5B6B86]">
            Demurrage Avoided
          </span>
          <div className="my-2">
            <span className="text-2xl font-extrabold font-mono text-[#34D399]" title={formatInr(customerDemurrageAvoided)}>
              {formatInr(customerDemurrageAvoided, { forceDecimals: true })}
            </span>
          </div>
          <p className="text-[11px] text-[#5B6B86] font-medium">
            Zero SLA Breach Penalties
          </p>
        </div>
      </div>

      {/* Search and Status Filters */}
      <div className="p-4 rounded-[24px] glass-panel flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-[#5B6B86] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by shipment ref, terminal, cargo type..."
            className="w-full pl-9 pr-4 py-2 rounded-full text-xs font-medium glass-input text-[#08193A] placeholder-[#5B6B86]/70"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          {['All', 'Pending', 'In Transit', 'Confirmed', 'Delivered'].map((status) => {
            const isActive = statusFilter === status;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3.5 py-1.5 rounded-full font-semibold transition-all shrink-0 liquid-btn cursor-pointer ${
                  isActive
                    ? 'bg-[#08193A] text-white shadow-xs'
                    : 'bg-white/60 text-[#5B6B86] hover:bg-white hover:text-[#08193A] border border-white/80'
                }`}
              >
                {status}
              </button>
            );
          })}
        </div>
      </div>

      {/* Customer Shipments List */}
      <div className="space-y-4">
        {filtered.map((shipment) => {
          const progress = getProgressPercent(shipment.status);
          const isAtRisk = shipment.delayRiskLevel === 'CRITICAL' || shipment.delayRiskLevel === 'HIGH';

          return (
            <div
              key={shipment.id}
              className="p-5 md:p-6 rounded-[28px] glass-panel hover:shadow-lg transition-all space-y-4 border border-white/80"
            >
              {/* Row 1: ID, Department, Mode, ETA, Actions */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-black/5">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono font-extrabold text-base md:text-lg text-[#08193A]">
                    {shipment.id}
                  </span>
                  {shipment.status === 'PENDING_APPROVAL' ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-amber-500/20 text-amber-900 border border-amber-500/40 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                      <span>Awaiting {shipment.carrierCompany || 'Carrier'} Admin Approval</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#1B3A7A]/15 text-[#1B3A7A] border border-[#1B3A7A]/25">
                      {shipment.department}
                    </span>
                  )}
                  <span className="text-xs font-medium text-[#5B6B86]">
                    • Carrier: {shipment.carrierCompany || shipment.carrierName}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-[#08193A] flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 border border-white">
                    <Clock className="w-3.5 h-3.5 text-[#1B3A7A]" />
                    <span>ETA: {shipment.eta}</span>
                  </span>

                  <button
                    onClick={() => onSelectConsignmentForTracking(shipment)}
                    className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#08193A] text-white hover:bg-[#1B3A7A] transition-all liquid-btn flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Navigation className="w-3.5 h-3.5 text-[#34D399]" />
                    <span>Track Live GPS</span>
                  </button>
                </div>
              </div>

              {/* Row 2: Route Origin & Destination + Status Progress Bar */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-center">
                {/* Route */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#08193A]">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#1B3A7A]" />
                    <span className="truncate">{shipment.origin}</span>
                  </div>
                  <div className="pl-1 border-l-2 border-dashed border-[#5B6B86]/40 ml-1 py-0.5" />
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#08193A]">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#34D399]" />
                    <span className="truncate">{shipment.destination}</span>
                  </div>
                </div>

                {/* Progress Bar with Milestones */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-semibold text-[#5B6B86]">
                    <span>Dispatch Progress</span>
                    <span className="font-mono text-[#08193A] font-bold">{progress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-black/5 overflow-hidden p-0.5">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ${
                        shipment.status === 'DELIVERED' 
                          ? 'bg-[#34D399]' 
                          : isAtRisk 
                          ? 'bg-gradient-to-r from-[#F6C65B] to-[#F59E5B]' 
                          : 'bg-gradient-to-r from-[#6EE7B7] to-[#34D399]'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-[#5B6B86] font-mono">
                    <span>Terminal Origin</span>
                    <span>Corridor Transit</span>
                    <span>Final Depot</span>
                  </div>
                </div>

                {/* Driver & Telemetry Contact */}
                <div className="p-3 rounded-2xl bg-white/60 border border-white/80 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <p className="text-[10px] text-[#5B6B86] uppercase font-semibold">Assigned Driver</p>
                    <p className="font-bold text-[#08193A]">{shipment.driverName || 'Vikram Malhotra'}</p>
                    <p className="text-[10px] font-mono text-[#5B6B86]">{shipment.driverPhone || '+91 98201 55194'}</p>
                  </div>

                  <button
                    onClick={() => onOpenDriverCall(shipment.driverName, shipment.driverPhone)}
                    className="p-2 rounded-full bg-[#08193A] text-white hover:bg-[#1B3A7A] transition-all liquid-btn cursor-pointer shadow-xs"
                    title="Call Driver via VoIP Bridge"
                  >
                    <PhoneCall className="w-4 h-4 text-[#34D399]" />
                  </button>
                </div>
              </div>

              {/* QpiAI Opt Allocation & QUBO State */}
              <div className="pt-2.5 pb-1 border-t border-black/5 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#34D399]/15 text-[#08193A] border border-[#34D399]/30 flex items-center gap-1.5 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
                    QpiAI Opt QUBO Ground State
                  </span>
                  <span className="text-[11px] font-medium text-[#08193A]">
                    Carrier: <strong className="font-bold text-[#1B3A7A]">{shipment.carrierName || 'Expedited Regional Express'}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-mono">
                  <span className="text-[#5B6B86] hidden sm:inline">Circuit: <span className="text-[#1B3A7A] font-semibold">{shipment.circuitFile || 'qpiai_circuit_1793224539.qasm'}</span></span>
                  <span className="text-[#34D399] font-bold bg-[#34D399]/10 px-2 py-0.5 rounded-full border border-[#34D399]/25">
                    +{formatInr(shipment.netSavings || 34800)} Saved
                  </span>
                </div>
              </div>

              {/* Weather Alert if At Risk */}
              {isAtRisk && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between text-xs text-[#08193A]">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      <strong>Corridor Notice:</strong> Elevated crosswinds along mountain ghat pass. Autonomous governor engaged (55 km/h limit).
                    </span>
                  </div>
                  <span className="font-mono text-[10px] font-bold text-amber-800 shrink-0">
                    SLA Protected
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
