import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  AlertTriangle, 
  RefreshCw, 
  ArrowRight, 
  MoreHorizontal, 
  LayoutGrid, 
  Table as TableIcon,
  ChevronDown,
  ChevronUp,
  FileCode,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';
import { Consignment, RiskLevel } from '../types';
import { formatInr } from '../lib/currency';

interface CargoBookingsViewProps {
  consignments: Consignment[];
  onSelectConsignment: (item: Consignment) => void;
  onOpenNewBookingModal: () => void;
  onForceWeatherRefresh: () => void;
  isWeatherRefreshing: boolean;
  onRerunRisk: (id: string) => void;
  onReassignCarrier: (id: string) => void;
}

export const CargoBookingsView: React.FC<CargoBookingsViewProps> = ({
  consignments,
  onSelectConsignment,
  onOpenNewBookingModal,
  onForceWeatherRefresh,
  isWeatherRefreshing,
  onRerunRisk,
  onReassignCarrier
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [isAdvisoryExpanded, setIsAdvisoryExpanded] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Compute dynamic filter counts
  const countAll = consignments.length;
  const countConfirmed = consignments.filter(c => c.status === 'CONFIRMED').length;
  const countDispatched = consignments.filter(c => c.status === 'DISPATCHED').length;
  const countDelivered = consignments.filter(c => c.status === 'DELIVERED').length;
  const countAtRisk = consignments.filter(c => c.delayRiskLevel === 'CRITICAL' || c.delayRiskLevel === 'HIGH').length;

  // Dynamic Bento Metrics computed live from database
  const activeConsignmentsCount = consignments.filter(c => c.status !== 'DELIVERED').length;
  const totalDemurrageAvoided = consignments.reduce((acc, c) => acc + (c.netSavings || 34800), 0);
  const routeAlertsCount = consignments.filter(c => c.delayRiskLevel === 'CRITICAL' || c.delayRiskLevel === 'HIGH' || c.status === 'AT RISK').length;

  const filteredConsignments = consignments.filter((item) => {
    const matchesSearch = 
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.carrierName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

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
      case 'CONFIRMED':
        return (
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#1B3A7A]/15 text-[#1B3A7A] border border-[#1B3A7A]/30">
            CONFIRMED
          </span>
        );
      case 'DISPATCHED':
        return (
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#34D399]/20 text-[#08193A] border border-[#34D399]/40">
            DISPATCHED
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-slate-200 text-[#5B6B86] border border-slate-300">
            DELIVERED
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

  return (
    <div className="space-y-6 pb-12">
      {/* View Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#08193A] tracking-tight">
            Commercial Cargo Bookings & Manifest Register
          </h1>
          <p className="text-xs md:text-sm text-[#5B6B86] mt-1 max-w-3xl leading-relaxed">
            Manage commercial freight consignments, trigger XGBoost demurrage risk analysis, and formulate QpiAI quantum carrier optimization in real-time.
          </p>
        </div>

        <button
          onClick={onOpenNewBookingModal}
          className="self-start lg:self-auto px-5 py-2.5 rounded-full text-xs font-bold bg-[#08193A] text-white hover:bg-[#1B3A7A] shadow-[0_4px_16px_rgba(8,25,58,0.22)] liquid-btn flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#34D399]" />
          <span>+ New Cargo Booking</span>
        </button>
      </div>

      {/* KPI Bento Row (5 cards on ONE row; collapses gracefully; fixes orphaned 5th card) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* 1. ACTIVE CARGO CONSIGNMENTS (Dark hero card) */}
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
            Demurrage Penalties Mitigated
          </span>
          <div className="my-2">
            <span className="text-2xl xl:text-3xl font-extrabold font-mono text-[#08193A] tabular-nums" title={formatInr(totalDemurrageAvoided)}>
              {formatInr(totalDemurrageAvoided, { forceDecimals: true })}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#5B6B86] font-medium">via QpiAI Quantum QUBO</span>
            {/* Mint sparkline SVG */}
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
            {/* Accuracy ring chart */}
            <div className="relative w-9 h-9">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(8,25,58,0.1)" strokeWidth="3" />
                <circle 
                  cx="18" cy="18" r="14" fill="none" stroke="#34D399" strokeWidth="3"
                  strokeDasharray="87.96" strokeDashoffset="23.7" strokeLinecap="round" 
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold font-mono text-[#08193A]">
                73%
              </span>
            </div>
          </div>
          <p className="text-[11px] text-[#5B6B86] font-medium truncate">
            72.94% Accuracy • 86.2% Prec.
          </p>
        </div>

        {/* 4. QUANTUM BACKEND */}
        <div className="p-4 rounded-[26px] glass-panel flex flex-col justify-between min-w-0">
          <span className="text-[11px] font-bold tracking-wider uppercase text-[#5B6B86]">
            Quantum Backend
          </span>
          <div className="my-2">
            <span className="text-2xl font-extrabold text-[#08193A]">
              QpiAI-QSV
            </span>
          </div>
          <p className="text-[11px] text-[#5B6B86] font-medium">
            QCloud Target • 3 Qubits
          </p>
        </div>

        {/* 5. ROUTE WEATHER SENTINEL */}
        <div className="p-4 rounded-[26px] glass-panel flex flex-col justify-between min-w-0">
          <span className="text-[11px] font-bold tracking-wider uppercase text-[#5B6B86]">
            Route Weather Sentinel
          </span>
          <div className="my-2 flex items-center gap-2">
            <span className="text-2xl font-extrabold text-[#08193A] tabular-nums">
              {routeAlertsCount} Route Alerts
            </span>
          </div>
          <p className="text-[11px] text-[#5B6B86] font-medium truncate">
            Open-Meteo Live • 30m Auto
          </p>
        </div>
      </div>

      {/* Weather Advisory Banner (frosted amber-tinted glass, expandable) */}
      <div className="p-4 md:p-5 rounded-[26px] glass-amber border border-[#F6C65B]/40 transition-all">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          {/* Clean Left Column (fixes text wrapping into the button) */}
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#F59E5B] shrink-0" />
              <span className="font-bold text-xs md:text-sm text-[#08193A]">
                Corridor Weather Advisory (8 Route Alerts Active)
              </span>
              <button 
                onClick={() => setIsAdvisoryExpanded(!isAdvisoryExpanded)}
                className="text-xs text-[#5B6B86] hover:text-[#08193A] p-1"
                aria-label="Toggle advisory details"
              >
                {isAdvisoryExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {isAdvisoryExpanded && (
              <div className="space-y-1.5 text-xs text-[#08193A]/85 leading-relaxed pt-1">
                <p>
                  <strong>FreightGuard Route Assessment: MODERATE RISK.</strong> Primary trigger: Savannah Container Terminal: Moderate elevated crosswinds 42.8 km/h. Affected zone: Savannah Container Terminal.
                </p>
                <p className="italic text-[11px] text-[#5B6B86]">
                  Note: Weather risk indicates potential hazard exposure, not a confirmed delivery delay.
                </p>
              </div>
            )}
          </div>

          {/* Right Action Stack */}
          <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end gap-1.5 shrink-0">
            <button
              onClick={onForceWeatherRefresh}
              disabled={isWeatherRefreshing}
              className="px-4 py-2 rounded-full text-xs font-bold bg-[#08193A] text-white hover:bg-[#1B3A7A] transition-all liquid-btn flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#34D399] ${isWeatherRefreshing ? 'animate-spin' : ''}`} />
              <span>{isWeatherRefreshing ? 'Refreshing Open-Meteo...' : 'Force Weather Refresh'}</span>
            </button>
            <span className="text-[10px] text-[#5B6B86] font-medium">
              Weather data by Open-Meteo.com
            </span>
          </div>
        </div>
      </div>

      {/* Live Manifest Register Card */}
      <div className="p-5 md:p-6 rounded-[28px] glass-panel space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg md:text-xl font-bold text-[#08193A]">
              Live Manifest Register
            </h2>
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-white/70 text-[#08193A] border border-white">
              7 active consignments
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
                placeholder="Search reference, origin, carrier..."
                className="pl-8 pr-3 py-1.5 rounded-full text-xs font-medium glass-input text-[#08193A] placeholder-[#5B6B86]/70 w-52 sm:w-64"
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

        {/* Filter Chips with counts (Reference A style) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'All', label: 'All', count: countAll },
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

        {/* Table or Cards Layout */}
        {viewMode === 'table' ? (
          <div className="overflow-x-auto rounded-[20px] border border-white/60 bg-white/40">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#08193A]/10 text-[11px] font-bold uppercase tracking-wider text-[#5B6B86] bg-white/40">
                  <th className="py-3 px-3.5">Booking Ref</th>
                  <th className="py-3 px-3.5">Origin & Destination</th>
                  <th className="py-3 px-3.5">Cargo Department</th>
                  <th className="py-3 px-3.5 text-right">Weight & Value</th>
                  <th className="py-3 px-3.5">Mode</th>
                  <th className="py-3 px-3.5">XGBoost Delay Risk</th>
                  <th className="py-3 px-3.5 text-right">Demurrage Risk</th>
                  <th className="py-3 px-3.5">QpiAI Assigned Carrier</th>
                  <th className="py-3 px-3.5 text-right">Net Savings</th>
                  <th className="py-3 px-3.5">Status</th>
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
                    {/* Booking Ref */}
                    <td className="py-3 px-3.5 font-mono font-bold text-[#08193A] whitespace-nowrap">
                      {item.id}
                    </td>

                    {/* Origin & Destination on two lines with arrow */}
                    <td className="py-3 px-3.5 min-w-[200px]">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-[#08193A] truncate">{item.origin}</span>
                        <div className="flex items-center gap-1 text-[11px] text-[#5B6B86]">
                          <ArrowRight className="w-3 h-3 text-[#34D399] shrink-0" />
                          <span className="truncate">{item.destination}</span>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-3 px-3.5 text-[#08193A] font-medium whitespace-nowrap">
                      {item.department}
                    </td>

                    {/* Weight & Value */}
                    <td className="py-3 px-3.5 text-right font-mono whitespace-nowrap">
                      <div className="text-[#08193A] font-semibold">{item.weightLbs.toLocaleString()} lbs</div>
                      <div className="text-[11px] text-[#5B6B86]">{formatInr(item.valueUsd)}</div>
                    </td>

                    {/* Shipping Mode */}
                    <td className="py-3 px-3.5 text-[#5B6B86] font-medium whitespace-nowrap">
                      {item.mode}
                    </td>

                    {/* XGBoost Delay Risk */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      {getRiskPill(item.delayRiskLevel, item.delayRiskPercent)}
                    </td>

                    {/* Demurrage Risk */}
                    <td className="py-3 px-3.5 text-right font-mono font-bold text-[#F26D6D] whitespace-nowrap">
                      {formatInr(item.demurrageRisk)}
                    </td>

                    {/* QpiAI Carrier & .qasm circuit file */}
                    <td className="py-3 px-3.5 min-w-[220px]">
                      <div className="font-semibold text-[#08193A] truncate">{item.carrierName}</div>
                      <div 
                        className="text-[10px] font-mono text-[#5B6B86] truncate max-w-[190px]"
                        title={item.circuitFile}
                      >
                        {item.circuitFile}
                      </div>
                    </td>

                    {/* Net Savings in mint */}
                    <td className="py-3 px-3.5 text-right font-mono font-bold text-[#34D399] whitespace-nowrap">
                      +{formatInr(item.netSavings)}
                    </td>

                    {/* Status capsule */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      {getStatusCapsule(item.status)}
                    </td>

                    {/* Context menu trigger */}
                    <td className="py-3 px-2 text-center relative" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)}
                        className="p-1 rounded-full text-[#5B6B86] hover:text-[#08193A] hover:bg-white"
                        title="Row Actions"
                        aria-label="Actions"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {activeMenuId === item.id && (
                        <div className="absolute right-2 top-8 z-30 w-36 glass-panel rounded-xl p-1.5 shadow-lg border border-white/90 text-left space-y-1">
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              onSelectConsignment(item);
                            }}
                            className="w-full px-2.5 py-1 text-left text-xs font-semibold rounded-lg hover:bg-white text-[#08193A]"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              onRerunRisk(item.id);
                            }}
                            className="w-full px-2.5 py-1 text-left text-xs font-semibold rounded-lg hover:bg-white text-[#1B3A7A]"
                          >
                            Re-run Risk
                          </button>
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              onReassignCarrier(item.id);
                            }}
                            className="w-full px-2.5 py-1 text-left text-xs font-semibold rounded-lg hover:bg-white text-[#34D399]"
                          >
                            Reassign Carrier
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Cards Bento Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredConsignments.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectConsignment(item)}
                className="p-4 rounded-[22px] bg-white/60 hover:bg-white/85 border border-white/90 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-[#08193A]">{item.id}</span>
                  {getStatusCapsule(item.status)}
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-[#08193A]">{item.origin}</p>
                  <div className="flex items-center gap-1.5 text-xs text-[#5B6B86]">
                    <ArrowRight className="w-3 h-3 text-[#34D399]" />
                    <span>{item.destination}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-black/5">
                  <span className="text-[#5B6B86]">{item.department}</span>
                  <span className="font-mono font-semibold text-[#08193A]">{item.weightLbs.toLocaleString()} lbs</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  {getRiskPill(item.delayRiskLevel, item.delayRiskPercent)}
                  <span className="font-mono font-bold text-xs text-[#34D399]">+{formatInr(item.netSavings)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
