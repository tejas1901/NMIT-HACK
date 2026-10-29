import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  Navigation, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  ShieldCheck, 
  TrendingUp, 
  ChevronRight, 
  Sparkles, 
  SlidersHorizontal,
  Building2,
  Cpu,
  Atom,
  Eye,
  RefreshCw,
  UserCheck,
  FileEdit,
  DollarSign,
  PhoneCall
} from 'lucide-react';
import { Consignment, RiskLevel } from '../types';
import { AdminBadge } from '../components/AdminBadge';
import { CustomerShipmentsView } from './CustomerShipmentsView';
import { formatInr, formatInrCompact } from '../lib/currency';

interface AdminAllShipmentsViewProps {
  consignments: Consignment[];
  onSelectConsignmentForTracking: (item: Consignment) => void;
  onOpenTruckIntelligence: (unitNumber: string) => void;
  onRerunRisk: (id: string) => void;
  onReassignCarrier: (id: string) => void;
  onReassignDriver: (id: string) => void;
  onAddInternalNote: (id: string) => void;
  onOpenDriverCall: (driverName?: string, phone?: string) => void;
  onNavigateToBook: () => void;
}

export const AdminAllShipmentsView: React.FC<AdminAllShipmentsViewProps> = ({
  consignments,
  onSelectConsignmentForTracking,
  onOpenTruckIntelligence,
  onRerunRisk,
  onReassignCarrier,
  onReassignDriver,
  onAddInternalNote,
  onOpenDriverCall,
  onNavigateToBook
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [customerFilter, setCustomerFilter] = useState<string>('All');
  const [riskFilter, setRiskFilter] = useState<string>('All');
  const [customerPreviewMode, setCustomerPreviewMode] = useState<string | null>(null);

  const customerOptions = [
    'All',
    'Vikas Intermodal Corp',
    'Apex Intermodal Logistics',
    'Summit Cold-Chain Express'
  ];

  // If in "View as Customer" mode, render the read-only CustomerShipmentsView preview
  if (customerPreviewMode) {
    const customerShipments = consignments.filter(c => c.customerCompany === customerPreviewMode);
    return (
      <div className="space-y-4 animate-in fade-in">
        {/* Customer Impersonation Banner */}
        <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-[#08193A] flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-2.5">
            <Eye className="w-5 h-5 text-amber-700 shrink-0" />
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wide">
                Previewing as {customerPreviewMode === 'Vikas Intermodal Corp' ? 'Ananya Verma' : customerPreviewMode} ({customerPreviewMode})
              </p>
              <p className="text-[11px] text-[#08193A]/80">
                Live Client Perspective. Active customer view without internal administrative margins.
              </p>
            </div>
          </div>

          <button
            onClick={() => setCustomerPreviewMode(null)}
            className="px-4 py-2 rounded-full text-xs font-bold bg-[#08193A] text-white hover:bg-[#1B3A7A] transition-all cursor-pointer shadow-xs shrink-0"
          >
            Exit Preview
          </button>
        </div>

        <CustomerShipmentsView
          consignments={customerShipments}
          onSelectConsignmentForTracking={onSelectConsignmentForTracking}
          onNavigateToBook={onNavigateToBook}
          onOpenDriverCall={onOpenDriverCall}
        />
      </div>
    );
  }

  // Filtered shipments
  const filtered = consignments.filter((c) => {
    const matchesSearch = 
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.customerCompany && c.customerCompany.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchesSearch) return false;

    if (customerFilter !== 'All' && c.customerCompany !== customerFilter) return false;
    if (riskFilter !== 'All' && c.delayRiskLevel !== riskFilter) return false;

    if (statusFilter === 'In Transit') return c.status === 'DISPATCHED' || c.status === 'AT RISK';
    if (statusFilter === 'Confirmed') return c.status === 'CONFIRMED';
    if (statusFilter === 'Delivered') return c.status === 'DELIVERED';
    return true;
  });

  const getProgressPercent = (status: string) => {
    switch (status) {
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

  const totalDemurrageAvoided = consignments
    .reduce((acc, c) => acc + (c.netSavings || 34800), 0);

  const corporationCount = new Set(consignments.map(c => c.customerCompany || 'Vikas Intermodal Logistics Corp')).size;
  const totalConsignmentsCount = Math.max(1, consignments.length);
  const onTimeCount = consignments.filter(c => c.delayRiskLevel === 'LOW' || c.status === 'DELIVERED').length;
  const onTimeSla = ((onTimeCount / totalConsignmentsCount) * 100).toFixed(1);

  return (
    <div className="space-y-6 pb-16">
      {/* View Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#08193A] text-[#A7F3D0] border border-[#34D399]/40 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#34D399]" />
              <span>ADMIN OPERATIONS • ALL SHIPMENTS</span>
            </span>
            <AdminBadge label="ENTERPRISE SCOPE" />
            <span className="text-xs text-[#5B6B86] font-medium">• Multi-Tenant Cross-Corridor Fleet</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#08193A] tracking-tight">
            All Commercial Consignments
          </h1>
          <p className="text-xs md:text-sm text-[#5B6B86] mt-1 max-w-3xl leading-relaxed">
            Enterprise oversight across all corporate accounts. Real-time XGBoost ML telemetry, QUBO quantum carrier circuit mappings, and deep truck intelligence.
          </p>
        </div>

        {/* View As Customer Dropdown & Button */}
        <div className="flex items-center gap-2 self-start lg:self-auto flex-wrap">
          <button
            onClick={() => setCustomerPreviewMode('Vikas Intermodal Corp')}
            className="px-4 py-2 rounded-full text-xs font-bold bg-white/80 hover:bg-white text-[#08193A] border border-white shadow-xs liquid-btn flex items-center gap-1.5 cursor-pointer"
            title="Preview exactly as customer Ananya Verma sees it"
          >
            <Eye className="w-4 h-4 text-[#1B3A7A]" />
            <span>View as Customer (Vikas)</span>
          </button>
        </div>
      </div>

      {/* KPI Bento Row (Enterprise Wide) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-[26px] glass-panel-dark text-white flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider uppercase text-white/60">
              Total Active Shipments
            </span>
            <AdminBadge />
          </div>
          <div className="my-2">
            <span className="text-3xl font-extrabold font-mono text-white tabular-nums">
              {consignments.filter(c => c.status !== 'DELIVERED').length}
            </span>
            <span className="text-xs text-white/50 ml-2">across {corporationCount} corporations</span>
          </div>
          <p className="text-[11px] text-[#A7F3D0] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#34D399] animate-mint-pulse" />
            <span>All Units Connected to Radar</span>
          </p>
        </div>

        <div className="p-4 rounded-[26px] glass-panel flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider uppercase text-[#5B6B86]">
              Total Value in Transit
            </span>
            <AdminBadge />
          </div>
          <div className="my-2">
            <span className="text-2xl font-extrabold font-mono text-[#08193A]" title={formatInr(totalValueInTransit)}>
              {formatInrCompact(totalValueInTransit)}
            </span>
          </div>
          <p className="text-[11px] text-[#5B6B86] font-medium">
            100% Insured via CargoGuard Enterprise
          </p>
        </div>

        <div className="p-4 rounded-[26px] glass-panel flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider uppercase text-[#5B6B86]">
              On-Time Arrival SLA
            </span>
            <AdminBadge />
          </div>
          <div className="my-2 flex items-center justify-between">
            <span className="text-2xl font-extrabold font-mono text-[#08193A]">
              {onTimeSla}%
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-[#34D399]/20 text-[#08193A]">
              OPTIMIZED
            </span>
          </div>
          <p className="text-[11px] text-[#5B6B86] font-medium">
            Managed by QpiAI Governor
          </p>
        </div>

        <div className="p-4 rounded-[26px] glass-panel flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider uppercase text-[#5B6B86]">
              Total Demurrage Avoided
            </span>
            <AdminBadge />
          </div>
          <div className="my-2">
            <span className="text-2xl font-extrabold font-mono text-[#34D399]" title={formatInr(totalDemurrageAvoided)}>
              {formatInrCompact(totalDemurrageAvoided)}
            </span>
          </div>
          <p className="text-[11px] text-[#5B6B86] font-medium">
            Calculated across NH-48 & NH-44 routes
          </p>
        </div>
      </div>

      {/* Added Admin Controls: Customer Filter, Risk Filter, Search, Status */}
      <div className="p-4 rounded-[24px] glass-panel flex flex-col gap-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-[#5B6B86] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, client, origin, cargo..."
              className="w-full pl-9 pr-4 py-2 rounded-full text-xs font-medium glass-input text-[#08193A] placeholder-[#5B6B86]/70"
            />
          </div>

          {/* Customer Filter Dropdown (Admin Only) */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#08193A]">
              <Building2 className="w-3.5 h-3.5 text-[#1B3A7A]" />
              <span>Customer:</span>
            </div>
            <select
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold glass-input text-[#08193A] cursor-pointer"
            >
              {customerOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <AdminBadge />
          </div>

          {/* Risk Level Filter (Admin Only) */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#08193A]">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Risk:</span>
            </div>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold glass-input text-[#08193A] cursor-pointer"
            >
              <option value="All">All Risks</option>
              <option value="LOW">LOW</option>
              <option value="MODERATE">MODERATE</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 text-xs border-t border-black/5 pt-2 overflow-x-auto">
          {['All', 'In Transit', 'Confirmed', 'Delivered'].map((status) => {
            const isActive = statusFilter === status;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3.5 py-1 rounded-full font-semibold transition-all shrink-0 liquid-btn cursor-pointer ${
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

      {/* Shipment Cards List with Deeper Admin Intelligence */}
      <div className="space-y-4">
        {filtered.map((shipment) => {
          const progress = getProgressPercent(shipment.status);
          const isCritical = shipment.delayRiskLevel === 'CRITICAL';
          const isHigh = shipment.delayRiskLevel === 'HIGH';

          return (
            <div
              key={shipment.id}
              className="p-5 md:p-6 rounded-[28px] glass-panel hover:shadow-lg transition-all space-y-4 border border-white/80"
            >
              {/* Row 1: ID, Department, Customer Name, Mode, ETA, Actions */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-black/5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono font-extrabold text-base md:text-lg text-[#08193A]">
                    {shipment.id}
                  </span>
                  
                  {/* Customer Owner Tag (Admin Only) */}
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#08193A] text-white flex items-center gap-1">
                    <Building2 className="w-2.5 h-2.5 text-[#34D399]" />
                    <span>{shipment.customerCompany || 'Vikas Intermodal Corp'}</span>
                  </span>

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#1B3A7A]/15 text-[#1B3A7A]">
                    {shipment.department}
                  </span>

                  <span className="text-xs text-[#5B6B86] font-medium">
                    • {shipment.mode}
                  </span>

                  <AdminBadge />
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-xs font-mono font-bold text-[#08193A] flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 border border-white">
                    <Clock className="w-3.5 h-3.5 text-[#1B3A7A]" />
                    <span>ETA: {shipment.eta}</span>
                  </span>

                  <button
                    onClick={() => onSelectConsignmentForTracking(shipment)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#08193A] text-white hover:bg-[#1B3A7A] transition-all liquid-btn flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Navigation className="w-3.5 h-3.5 text-[#34D399]" />
                    <span>Track GPS</span>
                  </button>

                  {/* Truck Intelligence Button (Admin Only) */}
                  <button
                    onClick={() => onOpenTruckIntelligence(shipment.truckUnitId || 'Unit #4021')}
                    className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#34D399] text-[#08193A] hover:bg-[#6EE7B7] transition-all liquid-btn flex items-center gap-1.5 cursor-pointer shadow-xs font-mono"
                  >
                    <Cpu className="w-3.5 h-3.5 text-[#08193A]" />
                    <span>Truck Intelligence</span>
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

                {/* Progress Bar */}
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
                          : isCritical || isHigh 
                          ? 'bg-gradient-to-r from-[#F6C65B] to-[#F59E5B]' 
                          : 'bg-gradient-to-r from-[#6EE7B7] to-[#34D399]'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-[#5B6B86] font-mono">
                    <span>Origin Terminal</span>
                    <span>Corridor Transit</span>
                    <span>Final Depot</span>
                  </div>
                </div>

                {/* Driver Info */}
                <div className="p-3 rounded-2xl bg-white/60 border border-white/80 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <p className="text-[10px] text-[#5B6B86] uppercase font-semibold">Assigned Driver</p>
                    <p className="font-bold text-[#08193A]">{shipment.driverName || 'Vikram Malhotra'}</p>
                    <p className="text-[10px] font-mono text-[#5B6B86]">{shipment.driverPhone || '+1 (312) 555-0194'}</p>
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

              {/* Row 3: Admin Deeper Intelligence Banner (Admin Only) */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#08193A]/5 to-[#1B3A7A]/10 border border-[#1B3A7A]/15 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 flex-wrap">
                  {/* XGBoost Delay Risk % */}
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 ${
                    isCritical 
                      ? 'bg-coral-500/20 text-coral-900 border border-coral-500/30' 
                      : isHigh 
                      ? 'bg-amber-500/20 text-amber-900 border border-amber-500/30' 
                      : 'bg-[#34D399]/20 text-[#08193A] border border-[#34D399]/30'
                  }`}>
                    <Cpu className="w-3 h-3 text-[#1B3A7A]" />
                    <span>XGBoost Delay Risk: {shipment.delayRiskPercent}%</span>
                  </span>

                  {/* Demurrage Risk */}
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-white/80 text-[#08193A] border border-black/10">
                    Demurrage Risk: {formatInr(shipment.demurrageRisk)}
                  </span>

                  {/* QpiAI Assigned Carrier */}
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#1B3A7A]/15 text-[#1B3A7A] flex items-center gap-1">
                    <Atom className="w-3 h-3 text-[#1B3A7A]" />
                    <span>QUBO Carrier: {shipment.carrierName}</span>
                  </span>

                  {/* Internal Margin % & Cost */}
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#34D399]/20 text-[#08193A]">
                    Margin: {shipment.marginPercent || 28.5}% (Cost: {formatInr(shipment.carrierCostUsd || 122688)})
                  </span>
                </div>

                {/* Admin Quick Action Buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onRerunRisk(shipment.id)}
                    className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white hover:bg-white/90 text-[#08193A] border border-black/10 transition-all liquid-btn flex items-center gap-1 cursor-pointer"
                    title="Re-run XGBoost ML Inference"
                  >
                    <RefreshCw className="w-2.5 h-2.5 text-[#1B3A7A]" />
                    <span>Re-run Risk</span>
                  </button>

                  <button
                    onClick={() => onReassignCarrier(shipment.id)}
                    className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white hover:bg-white/90 text-[#08193A] border border-black/10 transition-all liquid-btn flex items-center gap-1 cursor-pointer"
                    title="Reassign Carrier with QpiAI QUBO"
                  >
                    <Atom className="w-2.5 h-2.5 text-[#1B3A7A]" />
                    <span>Reassign Carrier</span>
                  </button>

                  <button
                    onClick={() => onReassignDriver(shipment.id)}
                    className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white hover:bg-white/90 text-[#08193A] border border-black/10 transition-all liquid-btn flex items-center gap-1 cursor-pointer"
                    title="Reassign Driver"
                  >
                    <UserCheck className="w-2.5 h-2.5 text-[#1B3A7A]" />
                    <span>Driver</span>
                  </button>

                  <button
                    onClick={() => onAddInternalNote(shipment.id)}
                    className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white hover:bg-white/90 text-[#08193A] border border-black/10 transition-all liquid-btn flex items-center gap-1 cursor-pointer"
                    title="Add Internal Admin Note"
                  >
                    <FileEdit className="w-2.5 h-2.5 text-[#1B3A7A]" />
                    <span>Note</span>
                  </button>
                </div>
              </div>

              {/* Internal Admin Notes */}
              {shipment.internalNotes && (
                <div className="text-[11px] font-mono text-[#5B6B86] bg-black/5 p-2 rounded-xl flex items-center gap-2">
                  <span className="font-bold text-[#08193A] uppercase text-[10px]">INTERNAL NOTE:</span>
                  <span>{shipment.internalNotes}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
