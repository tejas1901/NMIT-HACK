import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  MapPin, 
  Layers, 
  Navigation, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  Flame, 
  Search, 
  ArrowRight, 
  Snowflake, 
  Zap, 
  CheckCircle2, 
  Calendar, 
  Sliders, 
  Truck, 
  X, 
  Check, 
  HelpCircle, 
  PhoneCall, 
  ShieldAlert, 
  MoveRight, 
  FileText,
  CornerDownRight,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { YardSlot, YardTruck, GateQueueTruck, SlotStatus } from '../types';
import { AdminBadge } from '../components/AdminBadge';
import { 
  INITIAL_YARD_SLOTS, 
  OPTIMIZED_YARD_SLOTS, 
  INITIAL_GATE_QUEUE, 
  IDLE_COST_PER_HR_INR, 
  COSTLY_COST_PER_HR_INR,
  YARD_EVENT_TICKER 
} from '../data/yardData';

interface AdminYardSlotMapViewProps {
  onTriggerToast?: (msg: string) => void;
  highlightContainerId?: string | null;
}

export const AdminYardSlotMapView: React.FC<AdminYardSlotMapViewProps> = ({ 
  onTriggerToast,
  highlightContainerId
}) => {
  // Skeleton loading on first mount (600ms)
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // View state: 'current' vs 'optimized'
  const [yardMode, setYardMode] = useState<'current' | 'optimized'>('current');
  const [slots, setSlots] = useState<YardSlot[]>(INITIAL_YARD_SLOTS);
  const [gateQueue, setGateQueue] = useState<GateQueueTruck[]>(INITIAL_GATE_QUEUE);

  // Selected Truck Slide-over
  const [selectedSlot, setSelectedSlot] = useState<YardSlot | null>(null);

  // Filter chips state
  const [filterType, setFilterType] = useState<'ALL' | 'READY' | 'IDLE' | 'COSTLY' | 'FREE' | 'REEFER'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Highlighted slot from attention queue, gate recommendation, or Exception Tower
  const [highlightedSlotId, setHighlightedSlotId] = useState<string | null>(null);

  useEffect(() => {
    if (highlightContainerId) {
      const matchInSlot = slots.find((s) => s.truck?.containerId === highlightContainerId);
      if (matchInSlot) {
        setHighlightedSlotId(matchInSlot.slotId);
        setSelectedSlot(matchInSlot);
        if (onTriggerToast) {
          onTriggerToast(`Focused Slot ${matchInSlot.slotId} for container ${highlightContainerId}`);
        }
      } else {
        const inQueue = gateQueue.find((g) => g.containerId === highlightContainerId);
        if (inQueue) {
          setHighlightedSlotId(inQueue.recommendedSlotId);
          if (onTriggerToast) {
            onTriggerToast(`Container ${highlightContainerId} is queued at Gate 1 (Allocating ${inQueue.recommendedSlotId})`);
          }
        } else {
          if (onTriggerToast) {
            onTriggerToast('No truck in yard for this container');
          }
        }
      }
    }
  }, [highlightContainerId, slots, gateQueue]);

  // QpiAI Quantum Optimization Loading & Modal
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationSummaryOpen, setOptimizationSummaryOpen] = useState(false);
  const [showQuboMath, setShowQuboMath] = useState(false);

  // Live ticking wasted rupees counter
  const [liveWastedRupees, setLiveWastedRupees] = useState(1240);
  const [secondsCounter, setSecondsCounter] = useState(0);

  // Synchronize slot layout when mode changes
  useEffect(() => {
    if (yardMode === 'current') {
      setSlots(INITIAL_YARD_SLOTS);
    } else {
      setSlots(OPTIMIZED_YARD_SLOTS);
    }
  }, [yardMode]);

  // Live seconds and money wasted increment
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsCounter(s => s + 1);
      // Increment based on current active idle and costly trucks
      const idleCount = slots.filter(s => s.status === 'IDLE').length;
      const costlyCount = slots.filter(s => s.status === 'COSTLY').length;
      const hourlyRate = (idleCount * IDLE_COST_PER_HR_INR) + (costlyCount * COSTLY_COST_PER_HR_INR);
      const perSecondIncrement = hourlyRate / 3600;
      setLiveWastedRupees(prev => Math.round((prev + perSecondIncrement) * 10) / 10);
    }, 1000);
    return () => clearInterval(interval);
  }, [slots]);

  // Calculations
  const totalSlots = slots.length; // 24
  const freeSlotsCount = slots.filter(s => s.status === 'FREE').length;
  const readySlotsCount = slots.filter(s => s.status === 'READY').length;
  const idleSlotsCount = slots.filter(s => s.status === 'IDLE').length;
  const costlySlotsCount = slots.filter(s => s.status === 'COSTLY').length;
  const currentHourlyBurn = (idleSlotsCount * IDLE_COST_PER_HR_INR) + (costlySlotsCount * COSTLY_COST_PER_HR_INR);

  // Run QpiAI QUBO Optimization
  const handleOptimizeWithQpiAI = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      setIsOptimizing(false);
      setYardMode('optimized');
      setOptimizationSummaryOpen(true);
      if (onTriggerToast) {
        onTriggerToast('QpiAI QSV solved 3-qubit QUBO: 6 trucks relocated, 6 slots freed, ₹7,800 saved');
      }
    }, 1100);
  };

  // Helper for slot status styling
  const isSlotFiltered = (slot: YardSlot) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSlot = slot.slotId.toLowerCase().includes(q);
      const matchPlate = slot.truck?.plateNumber.toLowerCase().includes(q);
      const matchContainer = slot.truck?.containerId.toLowerCase().includes(q);
      const matchDriver = slot.truck?.driverName.toLowerCase().includes(q);
      return matchSlot || matchPlate || matchContainer || matchDriver;
    }

    if (filterType === 'ALL') return true;
    if (filterType === 'READY') return slot.status === 'READY';
    if (filterType === 'IDLE') return slot.status === 'IDLE';
    if (filterType === 'COSTLY') return slot.status === 'COSTLY';
    if (filterType === 'FREE') return slot.status === 'FREE' || slot.status === 'RESERVED';
    if (filterType === 'REEFER') return slot.zone === 'ZONE_D' || slot.truck?.containerType === 'REEFER';
    return true;
  };

  // Attention queue items (Problem trucks sorted by cost priority: COSTLY first, then IDLE)
  const problemTrucks = slots
    .filter(s => s.status === 'COSTLY' || s.status === 'IDLE')
    .sort((a, b) => (b.status === 'COSTLY' ? 1 : 0) - (a.status === 'COSTLY' ? 1 : 0));

  // Ticker message
  const [tickerIndex, setTickerIndex] = useState(0);
  useEffect(() => {
    const t = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % YARD_EVENT_TICKER.length);
    }, 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-5 pb-16 antialiased select-none">
      {/* 1. Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#08193A] text-[#A7F3D0] border border-[#34D399]/40 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#34D399] animate-mint-pulse" />
              <span>TERMINAL GATE & YARD OPTIMIZER</span>
            </span>
            <AdminBadge label="ADMIN YARD DISPATCH" />
            <span className="text-xs text-[#5B6B86] font-medium">• Nhava Sheva (JNPT) Terminal 4</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#08193A] tracking-tight">
            Yard & Gate Slot Map
          </h1>
          <p className="text-xs md:text-sm text-[#5B6B86] mt-1 max-w-3xl leading-relaxed">
            See every truck, every slot, and every wasted rupee, live. Spot blockers in under 3 seconds and trigger QpiAI slot rebalancing.
          </p>
        </div>

        {/* Right side controls: Current vs Optimized toggle + Optimize button */}
        <div className="flex items-center gap-2.5 self-start lg:self-auto flex-wrap">
          <div className="p-1 rounded-full bg-white/70 border border-white flex items-center text-xs font-mono font-bold shadow-2xs">
            <button
              onClick={() => setYardMode('current')}
              className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                yardMode === 'current' ? 'bg-[#08193A] text-white shadow-xs' : 'text-[#5B6B86] hover:text-[#08193A]'
              }`}
            >
              Current Yard
            </button>
            <button
              onClick={() => setYardMode('optimized')}
              className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                yardMode === 'optimized' ? 'bg-[#08193A] text-[#34D399] shadow-xs' : 'text-[#5B6B86] hover:text-[#08193A]'
              }`}
            >
              Optimized Yard
            </button>
          </div>

          <button
            onClick={handleOptimizeWithQpiAI}
            disabled={isOptimizing}
            className="px-5 py-2.5 rounded-full text-xs font-bold bg-[#34D399] text-[#08193A] hover:bg-[#6EE7B7] shadow-[0_4px_16px_rgba(52,211,153,0.3)] liquid-btn flex items-center gap-2 cursor-pointer shrink-0 disabled:opacity-60"
          >
            {isOptimizing ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-t-[#08193A] rounded-full animate-spin" />
                <span>QpiAI QSV Solving...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-[#08193A]" />
                <span>Optimize with QpiAI</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Top Summary Strip (4 Big Glass Tiles with Huge Numbers) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tile 1: SLOTS FREE with SVG Ring */}
        <div className="p-4 rounded-[26px] glass-panel flex items-center justify-between shadow-xs border border-white/80">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-[#5B6B86] block">
              Slots Free
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl font-extrabold font-mono text-[#08193A]">
                {freeSlotsCount}
              </span>
              <span className="text-sm font-mono text-[#5B6B86]">/ {totalSlots}</span>
            </div>
            <p className="text-[11px] text-[#34D399] font-semibold mt-1">
              {yardMode === 'optimized' ? '✓ 6 Slots Reclaimed by QpiAI' : '8 Slots Available'}
            </p>
          </div>

          {/* SVG Progress Ring */}
          <div className="relative w-16 h-16 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-[#08193A]/15"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#34D399]"
                strokeDasharray={`${(freeSlotsCount / totalSlots) * 100}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-mono text-[11px] font-bold text-[#08193A]">
              {Math.round((freeSlotsCount / totalSlots) * 100)}%
            </div>
          </div>
        </div>

        {/* Tile 2: IDLE TRUCKS */}
        <div className="p-4 rounded-[26px] glass-panel flex flex-col justify-between shadow-xs border border-white/80">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider uppercase text-[#5B6B86]">
              Idle Trucks
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#F6C65B] animate-pulse" />
          </div>
          <div className="my-1">
            <span className="text-3xl font-extrabold font-mono text-amber-600">
              {idleSlotsCount}
            </span>
            <span className="text-xs text-[#5B6B86] ml-2 font-medium">trucks stalled</span>
          </div>
          <p className="text-[11px] text-[#5B6B86]">
            holding slots they don't need
          </p>
        </div>

        {/* Tile 3: MONEY BEING WASTED */}
        <div className="p-4 rounded-[26px] glass-panel-dark text-white flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider uppercase text-white/60">
              Money Being Wasted
            </span>
            <Flame className="w-4 h-4 text-[#F26D6D] animate-bounce" />
          </div>
          <div className="my-1">
            <span className="text-2xl md:text-3xl font-extrabold font-mono text-[#F26D6D]">
              ₹{currentHourlyBurn.toLocaleString()} / hr
            </span>
          </div>
          <p className="text-[11px] text-[#A7F3D0] font-mono">
            Ticking live: ₹{Math.round(liveWastedRupees).toLocaleString()} accrued today
          </p>
        </div>

        {/* Tile 4: TRUCKS ARRIVING AT GATE */}
        <div className="p-4 rounded-[26px] glass-panel flex flex-col justify-between shadow-xs border border-white/80">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider uppercase text-[#5B6B86]">
              Trucks Arriving
            </span>
            <Truck className="w-4 h-4 text-[#1B3A7A]" />
          </div>
          <div className="my-1 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-[#08193A]">
              {gateQueue.length}
            </span>
            <span className="text-xs font-mono text-[#1B3A7A] font-bold">
              Nearest ETA: {gateQueue[0]?.etaMinutes}m
            </span>
          </div>
          <p className="text-[11px] text-[#5B6B86]">
            queued at Gate 1 Inbound
          </p>
        </div>
      </div>

      {/* 3. Constant 1-Row Legend Bar */}
      <div className="p-3 rounded-2xl glass-panel flex items-center justify-between gap-4 text-xs shadow-2xs border border-white/80 overflow-x-auto">
        <span className="text-[10px] font-mono font-bold uppercase text-[#5B6B86] shrink-0">
          STATUS LEGEND:
        </span>

        <div className="flex items-center gap-4 text-xs font-semibold shrink-0">
          <span className="flex items-center gap-1.5 text-[#08193A]">
            <span className="w-4 h-4 rounded-md border-2 border-dashed border-[#34D399] flex items-center justify-center text-[9px] font-mono text-[#34D399] font-bold">P</span>
            <span>FREE (Dashed outline)</span>
          </span>

          <span className="flex items-center gap-1.5 text-[#08193A]">
            <span className="w-3.5 h-3.5 rounded-sm bg-[#08193A] border border-[#34D399] inline-block" />
            <span>READY (Cleared container)</span>
          </span>

          <span className="flex items-center gap-1.5 text-amber-800">
            <span className="w-3.5 h-3.5 rounded-sm bg-[#F6C65B] border border-amber-600 inline-block" />
            <span>IDLE (Container blocked)</span>
          </span>

          <span className="flex items-center gap-1.5 text-red-700">
            <span className="w-3.5 h-3.5 rounded-sm bg-[#F26D6D] border border-red-700 ring-2 ring-[#F26D6D]/40 inline-block animate-pulse" />
            <span>COSTLY (Demurrage fine active)</span>
          </span>

          <span className="flex items-center gap-1.5 text-[#1B3A7A]">
            <span className="w-3.5 h-3.5 rounded-sm border-2 border-[#34D399] bg-[#34D399]/20 inline-block" />
            <span>RESERVED (Incoming truck)</span>
          </span>
        </div>
      </div>

      {/* 4. Filters & Search Bar */}
      <div className="p-3.5 rounded-2xl glass-panel flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs border border-white/80">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-[#5B6B86] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search slot (e.g. A2), container, plate..."
            className="w-full pl-9 pr-4 py-1.5 rounded-full text-xs font-medium glass-input text-[#08193A] placeholder-[#5B6B86]/70"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs">
          {[
            { id: 'ALL', label: 'All Slots' },
            { id: 'READY', label: 'Ready' },
            { id: 'IDLE', label: 'Idle' },
            { id: 'COSTLY', label: 'Costly' },
            { id: 'FREE', label: 'Free Slots' },
            { id: 'REEFER', label: 'Reefer Only' }
          ].map(f => {
            const isActive = filterType === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id as any)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all liquid-btn cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#08193A] text-white shadow-xs'
                    : 'bg-white/60 text-[#5B6B86] hover:bg-white hover:text-[#08193A] border border-white'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Main Area (Two Columns: Left Yard Map 70% | Right Attention Queue 30%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* LEFT COLUMN: THE YARD MAP (8 cols / ~68%) */}
        <div className="lg:col-span-8 p-5 md:p-6 rounded-[30px] glass-panel border border-white/90 shadow-md relative overflow-hidden space-y-5">
          {/* Subtle Asphalt texture and road lane strip */}
          <div className="absolute inset-0 bg-[#08193A]/[0.02] pointer-events-none" />

          {/* Gate Lane and Gates Banner */}
          <div className="flex items-center justify-between pb-3 border-b border-black/5 text-xs">
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 rounded-full font-mono font-bold bg-[#1B3A7A] text-white flex items-center gap-1.5">
                <span>GATE 1 (INBOUND)</span>
              </span>
              <span className="text-[#5B6B86] font-mono text-[11px]">
                Active Flow: 3 Inbound Queued
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full font-mono font-bold bg-[#34D399] text-[#08193A] flex items-center gap-1.5">
                <span>GATE 2 (OUTBOUND DISPATCH)</span>
              </span>
            </div>
          </div>

          {/* INBOUND GATE QUEUE STRIP */}
          <div className="p-3 rounded-2xl bg-white/70 border border-white/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[10px] font-mono font-bold uppercase text-[#5B6B86] flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#1B3A7A]" />
                <span>INCOMING GATE QUEUE (3 TRUCKS)</span>
              </span>
              <span className="text-[10px] font-mono text-[#34D399] font-bold">
                QpiAI Recommended Target Slots Assigned
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {gateQueue.map((gq) => (
                <div
                  key={gq.id}
                  onMouseEnter={() => setHighlightedSlotId(gq.recommendedSlotId)}
                  onMouseLeave={() => setHighlightedSlotId(null)}
                  className="p-2.5 rounded-xl bg-white border border-black/5 hover:border-[#34D399] transition-all cursor-pointer shadow-2xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-[#08193A]">{gq.plateNumber}</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-blue-500/15 text-blue-900">
                      ETA {gq.etaMinutes}m
                    </span>
                  </div>
                  <p className="font-mono text-[10px] text-[#5B6B86] truncate">Cont: {gq.containerId}</p>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-[#34D399]">
                    <CornerDownRight className="w-3 h-3 text-[#34D399]" />
                    <span>Target: Slot {gq.recommendedSlotId}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4 ZONES GRID */}
          <div className="space-y-4">
            
            {/* ZONE A: READY TO LOAD BAYS (6 slots, A1-A6) */}
            <div className="p-4 rounded-2xl bg-white/40 border border-[#34D399]/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#34D399]" />
                  <h3 className="font-extrabold text-sm text-[#08193A] tracking-tight">
                    ZONE A: READY TO LOAD BAYS
                  </h3>
                  <span className="text-xs text-[#5B6B86]">(Nearest to Gate 2 Outbound)</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#34D399]/20 text-[#08193A]">
                  {slots.filter(s => s.zone === 'ZONE_A' && s.status === 'FREE').length} FREE
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                {slots.filter(s => s.zone === 'ZONE_A').map(renderSlotTile)}
              </div>
            </div>

            {/* ZONE B: WAITING AREA (10 slots, B1-B10) */}
            <div className="p-4 rounded-2xl bg-white/40 border border-white/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#1B3A7A]" />
                  <h3 className="font-extrabold text-sm text-[#08193A] tracking-tight">
                    ZONE B: WAITING AREA (GENERAL STAGING)
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white text-[#08193A] border border-black/10">
                  {slots.filter(s => s.zone === 'ZONE_B' && (s.status === 'FREE' || s.status === 'RESERVED')).length} FREE / RESERVED
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {slots.filter(s => s.zone === 'ZONE_B').map(renderSlotTile)}
              </div>
            </div>

            {/* BOTTOM 2 ZONES: ZONE C & ZONE D */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* ZONE C: CUSTOMS HOLD (4 slots, C1-C4) */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-700" />
                    <h3 className="font-extrabold text-xs text-[#08193A]">
                      ZONE C: CUSTOMS HOLD AREA
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-900">
                    {slots.filter(s => s.zone === 'ZONE_C' && s.status === 'FREE').length} FREE
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {slots.filter(s => s.zone === 'ZONE_C').map(renderSlotTile)}
                </div>
              </div>

              {/* ZONE D: REEFER / COLD-CHAIN (4 slots, D1-D4) */}
              <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Snowflake className="w-4 h-4 text-cyan-700" />
                    <h3 className="font-extrabold text-xs text-[#08193A]">
                      ZONE D: REEFER & COLD-CHAIN
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-900">
                    {slots.filter(s => s.zone === 'ZONE_D' && s.status === 'FREE').length} FREE
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {slots.filter(s => s.zone === 'ZONE_D').map(renderSlotTile)}
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: ATTENTION QUEUE (4 cols / ~32%) */}
        <div className="lg:col-span-4 p-5 rounded-[30px] glass-panel border border-white/90 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-black/5">
            <div>
              <h3 className="text-sm font-extrabold text-[#08193A] flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-[#F26D6D]" />
                <span>ATTENTION QUEUE</span>
              </h3>
              <p className="text-[11px] text-[#5B6B86]">Worst blockers ranked by financial burn</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500/20 text-red-900">
              {problemTrucks.length} Critical
            </span>
          </div>

          <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
            {problemTrucks.map((slot) => {
              const truck = slot.truck!;
              const isCostly = slot.status === 'COSTLY';

              return (
                <div
                  key={slot.slotId}
                  onClick={() => {
                    setHighlightedSlotId(slot.slotId);
                    setSelectedSlot(slot);
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 relative ${
                    isCostly 
                      ? 'bg-red-500/10 border-red-500/30 hover:border-red-500 shadow-xs' 
                      : 'bg-amber-500/10 border-amber-500/25 hover:border-amber-500'
                  }`}
                >
                  {/* Card Header: Slot, Status, Container */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-md bg-[#08193A] text-white">
                        {slot.slotId}
                      </span>
                      <span className="font-mono text-xs font-bold text-[#08193A]">
                        {truck.containerId}
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                      isCostly ? 'bg-[#F26D6D] text-white animate-pulse' : 'bg-amber-500 text-white'
                    }`}>
                      {isCostly ? 'COSTLY FINE' : 'IDLE'}
                    </span>
                  </div>

                  {/* Blocker Plain-English Reason */}
                  <p className="text-xs font-bold text-[#08193A] line-clamp-2 leading-snug">
                    {truck.blocker?.plainReason || 'Waiting on staging bay clearance'}
                  </p>

                  {/* Idle Time & Rate */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#5B6B86] pt-1 border-t border-black/5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#1B3A7A]" />
                      <span>Idle {Math.floor(truck.idleDurationMinutes / 60)}h {truck.idleDurationMinutes % 60}m</span>
                    </span>

                    <span className={`font-bold ${isCostly ? 'text-red-700' : 'text-amber-800'}`}>
                      ₹{truck.blocker?.fineRatePerHourInr || 600} / hr
                    </span>
                  </div>

                  {/* Quick Action Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSlot(slot);
                    }}
                    className="w-full py-1.5 rounded-full text-xs font-bold bg-[#08193A] text-white hover:bg-[#1B3A7A] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs mt-1"
                  >
                    <span>Inspect & Resolve</span>
                    <ArrowRight className="w-3 h-3 text-[#34D399]" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 6. Bottom Thin Live Ticker */}
      <div className="p-2.5 px-4 rounded-full glass-panel flex items-center justify-between gap-3 text-xs shadow-xs border border-white/80">
        <div className="flex items-center gap-2 truncate">
          <span className="w-2 h-2 rounded-full bg-[#34D399] animate-ping shrink-0" />
          <span className="font-mono text-[10px] text-[#5B6B86] uppercase font-bold shrink-0">YARD TELEMETRY:</span>
          <span className="font-semibold text-[#08193A] truncate">{YARD_EVENT_TICKER[tickerIndex]}</span>
        </div>

        <span className="text-[10px] font-mono text-[#34D399] font-bold shrink-0">
          GATE 1 & 2 CLEAR
        </span>
      </div>

      {/* 7. SLIDE-OVER: TRUCK & CONTAINER DETAIL */}
      {selectedSlot && selectedSlot.truck && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg h-full glass-panel-dark text-white p-6 shadow-2xl border-l border-white/20 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300 space-y-5">
            
            {/* Header */}
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-extrabold text-2xl text-white">
                    SLOT {selectedSlot.slotId}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 text-[#A7F3D0]">
                    {selectedSlot.zoneLabel}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                    selectedSlot.status === 'COSTLY' 
                      ? 'bg-[#F26D6D] text-white animate-pulse' 
                      : selectedSlot.status === 'IDLE' 
                      ? 'bg-amber-500 text-white' 
                      : 'bg-[#34D399] text-[#08193A]'
                  }`}>
                    {selectedSlot.status}
                  </span>
                </div>

                <button
                  onClick={() => setSelectedSlot(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Truck Profile Stage */}
              <div className="my-4 p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                {renderTopDownTruck(selectedSlot.status, selectedSlot.truck.containerType, 'large')}
              </div>

              {/* Identification Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-white/50 block">Container ID</span>
                  <p className="font-bold text-white text-sm mt-0.5">{selectedSlot.truck.containerId}</p>
                  <span className="text-[10px] text-[#A7F3D0]">{selectedSlot.truck.containerType} Chassis</span>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-white/50 block">Truck Plate Number</span>
                  <p className="font-bold text-white text-sm mt-0.5">{selectedSlot.truck.plateNumber}</p>
                  <span className="text-[10px] text-white/50">{selectedSlot.truck.carrierName}</span>
                </div>
              </div>

              {/* Driver & Parked Since */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 my-3 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-white/50 block">Assigned Driver</span>
                  <p className="font-bold text-white">{selectedSlot.truck.driverName}</p>
                  <p className="text-[10px] font-mono text-[#A7F3D0]">{selectedSlot.truck.driverPhone}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-white/50 block">Parked Since</span>
                  <p className="font-mono font-bold text-white">{selectedSlot.truck.parkedSince}</p>
                  <p className="text-[10px] font-mono text-amber-300">
                    Idle {selectedSlot.truck.idleDurationMinutes} mins
                  </p>
                </div>
              </div>

              {/* BLOCKER SECTION */}
              {selectedSlot.truck.blocker && (
                <div className="space-y-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/25">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-red-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span>ACTIVE BLOCKER</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-[#F26D6D]">
                      Burn: ₹{selectedSlot.truck.blocker.fineRatePerHourInr}/hr
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-white leading-relaxed">
                    {selectedSlot.truck.blocker.plainReason}
                  </p>

                  {/* VERIFIED EVIDENCE BLOCK */}
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                    <span className="text-[10px] uppercase font-mono font-bold text-[#A7F3D0] block">
                      VERIFIED EVIDENCE SOURCE: {selectedSlot.truck.blocker.evidenceSource}
                    </span>
                    <p className="text-xs italic text-white/80">
                      "{selectedSlot.truck.blocker.evidenceQuote}"
                    </p>
                  </div>

                  {/* Responsible Person & Live Deadline */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-white/10">
                    <div>
                      <span className="text-[10px] text-white/50 block">Assigned Owner</span>
                      <span className="font-bold text-white">{selectedSlot.truck.blocker.ownerName}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-white/50 block">Resolution Deadline</span>
                      <span className="font-mono font-bold text-[#34D399]">
                        {selectedSlot.truck.blocker.deadlineCountdown}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-white/10 space-y-2">
              <button
                onClick={() => {
                  if (onTriggerToast) {
                    onTriggerToast(`Action dispatched for slot ${selectedSlot.slotId}: ${selectedSlot.truck?.recommendedAction}`);
                  }
                  setSelectedSlot(null);
                }}
                className="w-full py-3 rounded-full text-xs font-bold bg-[#34D399] text-[#08193A] hover:bg-[#6EE7B7] transition-all liquid-btn flex items-center justify-center gap-2 cursor-pointer shadow-md font-mono"
              >
                <Check className="w-4 h-4" />
                <span>{selectedSlot.truck.recommendedAction || 'Execute Recommended Action'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 8. QpiAI Quantum Optimization Results Dialog */}
      {optimizationSummaryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg glass-panel-dark text-white rounded-[30px] p-6 shadow-2xl border border-[#34D399]/40 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#34D399]" />
                <h3 className="font-extrabold text-base text-white">QpiAI Slot Rebalancing Converged</h3>
              </div>
              <button
                onClick={() => setOptimizationSummaryOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-white/80 leading-relaxed">
              QpiAI-QSV Hamiltonian circuit solved the 3-qubit spatial assignment QUBO, clearing Zone A ready bays and re-allocating idle containers to general waiting pads.
            </p>

            {/* Before / After Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-white/50 block">Yard Moves Executed</span>
                <p className="text-xl font-bold text-[#34D399]">6 Moves</p>
                <span className="text-[10px] text-white/60">Zone A bays unblocked</span>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-white/50 block">Detention Avoided</span>
                <p className="text-xl font-bold text-[#34D399]">₹7,800 INR</p>
                <span className="text-[10px] text-white/60">Demurrage timer stopped</span>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-white/50 block">Free Slots Available</span>
                <p className="text-xl font-bold text-white">8 → 14 Free</p>
                <span className="text-[10px] text-[#A7F3D0]">+75% Yard Capacity</span>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-white/50 block">Idle Trucks Cleared</span>
                <p className="text-xl font-bold text-white">4 Trucks Dispatched</p>
                <span className="text-[10px] text-[#34D399]">Zero Gate Congestion</span>
              </div>
            </div>

            {/* Collapsible "How QpiAI Decided" QUBO Math */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
              <button
                onClick={() => setShowQuboMath(!showQuboMath)}
                className="w-full flex items-center justify-between text-xs font-bold text-[#A7F3D0] cursor-pointer"
              >
                <span>How QpiAI Decided (QUBO Objective)</span>
                {showQuboMath ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showQuboMath && (
                <div className="pt-2 border-t border-white/10 font-mono text-[11px] text-white/80 space-y-2">
                  <div className="p-2 rounded-lg bg-black/50 text-[#34D399] overflow-x-auto">
                    min Σ(idle_cost_i · x_i) + λ · (slot_conflict_penalty)
                  </div>
                  <p className="text-[10px] text-white/60">
                    Converged onto Hamiltonian eigenstate <strong>|0110⟩</strong> (1000 QSV shots, fidelity 99.4%).
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setOptimizationSummaryOpen(false)}
                className="px-5 py-2.5 rounded-full text-xs font-bold bg-[#34D399] text-[#08193A] hover:bg-[#6EE7B7] cursor-pointer shadow-md"
              >
                Keep Optimized Yard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Helper function to render a single slot tile on the map
  function renderSlotTile(slot: YardSlot) {
    const isFiltered = isSlotFiltered(slot);
    const isHighlighted = highlightedSlotId === slot.slotId;
    const isFree = slot.status === 'FREE';
    const isReserved = slot.status === 'RESERVED';
    const isCostly = slot.status === 'COSTLY';
    const isIdle = slot.status === 'IDLE';
    const isReady = slot.status === 'READY';

    return (
      <div
        key={slot.slotId}
        id={`slot-${slot.slotId}`}
        tabIndex={0}
        aria-label={`Slot ${slot.slotId}, ${slot.status}, container ${slot.truck?.containerId || 'none'}`}
        onClick={() => {
          if (slot.truck) setSelectedSlot(slot);
        }}
        className={`group relative p-2 rounded-2xl flex flex-col justify-between items-center transition-all duration-300 min-h-[105px] focus:outline-none focus:ring-2 focus:ring-[#34D399] ${
          isFiltered ? 'opacity-100' : 'opacity-25'
        } ${
          isHighlighted 
            ? 'ring-4 ring-[#34D399] scale-105 z-20 shadow-lg' 
            : 'hover:-translate-y-1 hover:shadow-md'
        } ${
          isFree 
            ? 'border-2 border-dashed border-[#34D399]/60 bg-white/40 cursor-default' 
            : isReserved 
            ? 'border-2 border-[#34D399] bg-[#34D399]/10 cursor-pointer' 
            : isCostly 
            ? 'border-2 border-[#F26D6D] bg-red-500/10 cursor-pointer ring-2 ring-[#F26D6D]/30' 
            : isIdle 
            ? 'border border-amber-500/60 bg-amber-500/10 cursor-pointer' 
            : 'border border-[#08193A]/20 bg-white/80 cursor-pointer'
        }`}
      >
        {/* Top Header: Slot ID & Status / Timer */}
        <div className="w-full flex items-center justify-between text-[10px] font-mono leading-none">
          <span className="font-extrabold text-[#08193A]">{slot.slotId}</span>

          {isFree && (
            <span className="text-[#34D399] font-bold">FREE</span>
          )}

          {isReserved && (
            <span className="text-[#1B3A7A] font-bold flex items-center gap-0.5">
              <Calendar className="w-2.5 h-2.5 text-[#34D399]" />
              <span>RES</span>
            </span>
          )}

          {isReady && (
            <span className="text-[#34D399] font-bold flex items-center gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
              <span>READY</span>
            </span>
          )}

          {isIdle && slot.truck && (
            <span className="px-1 py-0.2 rounded bg-amber-500 text-white font-bold text-[8px] flex items-center gap-0.5">
              <Clock className="w-2 h-2" />
              <span>{Math.floor(slot.truck.idleDurationMinutes / 60)}h</span>
            </span>
          )}

          {isCostly && (
            <span className="px-1 py-0.2 rounded bg-[#F26D6D] text-white font-bold text-[8px] animate-pulse">
              COSTLY
            </span>
          )}
        </div>

        {/* Center: Top-down Truck SVG or Free "P" Symbol */}
        <div className="my-auto py-1 flex items-center justify-center">
          {isFree ? (
            <div className="w-8 h-12 flex flex-col items-center justify-center text-[#34D399]/50 font-mono font-bold text-lg select-none">
              P
            </div>
          ) : isReserved ? (
            <div className="text-center font-mono">
              <span className="text-[9px] text-[#1B3A7A] font-bold block">{slot.reservedEta}</span>
              <div className="opacity-40">{renderTopDownTruck('RESERVED', 'DRY', 'small')}</div>
            </div>
          ) : slot.truck ? (
            renderTopDownTruck(slot.status, slot.truck.containerType, 'small')
          ) : null}
        </div>

        {/* Bottom Label: Container ID or Plug */}
        <div className="w-full text-center">
          {slot.truck ? (
            <span className="font-mono text-[9px] font-bold text-[#08193A] truncate block max-w-full">
              {slot.truck.containerId}
            </span>
          ) : isFree && slot.isReeferPlugAvailable ? (
            <span className="text-[9px] text-cyan-700 font-mono flex items-center justify-center gap-0.5">
              <Zap className="w-2.5 h-2.5" /> 32A Plug
            </span>
          ) : isFree ? (
            <span className="text-[9px] text-[#5B6B86] font-mono">Available</span>
          ) : (
            <span className="text-[9px] text-[#5B6B86] font-mono">Incoming</span>
          )}
        </div>

        {/* Floating Hover Tooltip */}
        {slot.truck && (
          <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2.5 rounded-xl glass-panel-dark text-white text-[10px] shadow-xl z-30 pointer-events-none space-y-1 animate-in fade-in">
            <div className="flex justify-between font-mono font-bold">
              <span>{slot.truck.plateNumber}</span>
              <span className="text-[#34D399]">{slot.truck.status}</span>
            </div>
            <p className="font-mono text-white/70">Cont: {slot.truck.containerId}</p>
            <p className="text-white/80 line-clamp-1">{slot.truck.blocker?.plainReason || 'Cleared for loading'}</p>
            <p className="text-[9px] text-[#A7F3D0]">Parked: {slot.truck.parkedSince} ({slot.truck.idleDurationMinutes}m)</p>
          </div>
        )}
      </div>
    );
  }

  // INLINE SVG TOP-DOWN TRUCK (2-tone: white cab, tinted trailer body)
  function renderTopDownTruck(status: SlotStatus, containerType: 'DRY' | 'REEFER' | 'HAZMAT', size: 'small' | 'large') {
    const isLarge = size === 'large';
    const width = isLarge ? 80 : 36;
    const height = isLarge ? 130 : 60;

    let trailerFill = '#08193A'; // Ready: solid navy
    let trailerBorder = '#34D399';
    if (status === 'IDLE') {
      trailerFill = '#F6C65B'; // Amber
      trailerBorder = '#D97706';
    } else if (status === 'COSTLY') {
      trailerFill = '#F26D6D'; // Coral
      trailerBorder = '#DC2626';
    } else if (status === 'RESERVED') {
      trailerFill = 'rgba(52,211,153,0.3)';
      trailerBorder = '#34D399';
    }

    return (
      <svg width={width} height={height} viewBox="0 0 40 70" fill="none" className="shrink-0 select-none">
        {/* Shadow */}
        <ellipse cx="20" cy="38" rx="16" ry="28" fill="rgba(8,25,58,0.15)" />

        {/* Wheels (4 sets of duals / singles) */}
        <rect x="2" y="10" width="3" height="7" rx="1.5" fill="#08193A" />
        <rect x="35" y="10" width="3" height="7" rx="1.5" fill="#08193A" />
        <rect x="2" y="46" width="3" height="8" rx="1.5" fill="#08193A" />
        <rect x="35" y="46" width="3" height="8" rx="1.5" fill="#08193A" />
        <rect x="2" y="56" width="3" height="8" rx="1.5" fill="#08193A" />
        <rect x="35" y="56" width="3" height="8" rx="1.5" fill="#08193A" />

        {/* Trailer (Long rectangular container) */}
        <rect 
          x="6" 
          y="18" 
          width="28" 
          height="48" 
          rx="4" 
          fill={trailerFill} 
          stroke={trailerBorder} 
          strokeWidth="1.5" 
        />

        {/* Container ridges / roof markings */}
        <line x1="10" y1="26" x2="30" y2="26" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        <line x1="10" y1="36" x2="30" y2="36" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        <line x1="10" y1="46" x2="30" y2="46" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        <line x1="10" y1="56" x2="30" y2="56" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />

        {/* Tiny Container Icon (Snowflake for reefer, Box for dry) */}
        {containerType === 'REEFER' ? (
          <circle cx="20" cy="41" r="4" fill="rgba(255,255,255,0.4)" />
        ) : (
          <rect x="17" y="38" width="6" height="6" rx="1" fill="rgba(255,255,255,0.35)" />
        )}

        {/* Fifth Wheel Hitch Coupling */}
        <rect x="18" y="16" width="4" height="4" fill="#08193A" />

        {/* Cab (White Body with Navy Outline and Windshield) */}
        <path
          d="M 9 16 L 9 8 C 9 4, 13 2, 20 2 C 27 2, 31 4, 31 8 L 31 16 Z"
          fill="#FFFFFF"
          stroke="#08193A"
          strokeWidth="1.5"
        />
        {/* Windshield */}
        <path
          d="M 12 7 C 14 5, 26 5, 28 7 L 29 11 L 11 11 Z"
          fill="#08193A"
          opacity="0.85"
        />
        {/* Side mirrors */}
        <rect x="6" y="8" width="2" height="4" rx="1" fill="#08193A" />
        <rect x="32" y="8" width="2" height="4" rx="1" fill="#08193A" />
      </svg>
    );
  }
};
