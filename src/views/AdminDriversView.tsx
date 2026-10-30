import React, { useState } from 'react';
import { 
  UserCheck, 
  Truck, 
  PhoneCall, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Fuel, 
  ShieldCheck, 
  Search, 
  Filter, 
  Radio, 
  Award, 
  ArrowRight,
  Gauge,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { FleetDriver } from '../types';

interface AdminDriversViewProps {
  drivers: FleetDriver[];
  onCallDriver: (driver: FleetDriver) => void;
  onChatDriver: (driver: FleetDriver) => void;
  onAssignDriver?: (driver: FleetDriver) => void;
}

export const AdminDriversView: React.FC<AdminDriversViewProps> = ({
  drivers = [],
  onCallDriver,
  onChatDriver,
  onAssignDriver
}) => {
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'EMPTY' | 'OUT_FOR_DELIVERY'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtering
  const filteredDrivers = drivers.filter(d => {
    if (filterStatus === 'EMPTY' && d.status !== 'EMPTY') return false;
    if (filterStatus === 'OUT_FOR_DELIVERY' && d.status !== 'OUT_FOR_DELIVERY') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = d.name.toLowerCase().includes(q);
      const matchPhone = d.phone.toLowerCase().includes(q);
      const matchLic = d.licenseNumber.toLowerCase().includes(q);
      const matchUnit = d.vehicle.unitNumber.toLowerCase().includes(q);
      const matchModel = d.vehicle.model.toLowerCase().includes(q);
      const matchPlate = d.vehicle.plateNumber.toLowerCase().includes(q);
      const matchLocation = d.currentLocation.toLowerCase().includes(q);
      const matchOrder = d.activeAssignment?.orderId.toLowerCase().includes(q);
      return matchName || matchPhone || matchLic || matchUnit || matchModel || matchPlate || matchLocation || matchOrder;
    }
    return true;
  });

  const totalCount = drivers.length;
  const emptyCount = drivers.filter(d => d.status === 'EMPTY').length;
  const deliveryCount = drivers.filter(d => d.status === 'OUT_FOR_DELIVERY').length;

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-[#08193A] text-[#34D399] shadow-sm">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#08193A] tracking-tight">
                Driver Fleet & Availability Roster
              </h1>
              <p className="text-xs md:text-sm text-[#5B6B86] mt-0.5">
                Real-time commercial driver registry: track idle drivers at depot vs. units out for active delivery with vehicle telemetry.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#34D399]/15 text-[#065F46] border border-[#34D399]/40 flex items-center gap-2 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#34D399] animate-mint-pulse" />
            <span>Telematics & CAN-Bus Synced</span>
          </span>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl glass-panel shadow-xs border border-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5B6B86] uppercase tracking-wider">Total Commercial Drivers</span>
            <span className="p-2 rounded-xl bg-[#08193A]/5 text-[#08193A]">
              <UserCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-mono font-extrabold text-[#08193A]">{totalCount}</span>
            <span className="text-xs font-semibold text-[#5B6B86]">Verified Roster</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel shadow-xs border border-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#065F46] uppercase tracking-wider">Empty / Available</span>
            <span className="p-2 rounded-xl bg-[#34D399]/20 text-[#065F46]">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-mono font-extrabold text-[#065F46]">{emptyCount}</span>
            <span className="text-xs font-semibold text-[#065F46]">Idle at Depots • Ready to Dispatch</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel shadow-xs border border-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1B3A7A] uppercase tracking-wider">Out for Delivery</span>
            <span className="p-2 rounded-xl bg-[#1B3A7A]/10 text-[#1B3A7A]">
              <Truck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-mono font-extrabold text-[#1B3A7A]">{deliveryCount}</span>
            <span className="text-xs font-semibold text-[#1B3A7A]">Active on Corridor</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel shadow-xs border border-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5B6B86] uppercase tracking-wider">Fleet Driver SLA</span>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-mono font-extrabold text-[#08193A]">4.87 ★</span>
            <span className="text-xs font-semibold text-emerald-600">99.4% On-Time Deliveries</span>
          </div>
        </div>
      </div>

      {/* 3. Search and Filter Bar */}
      <div className="p-4 rounded-2xl glass-panel shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border border-white">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all liquid-btn cursor-pointer shrink-0 ${
              filterStatus === 'ALL'
                ? 'bg-[#08193A] text-white shadow-xs'
                : 'bg-white/70 text-[#5B6B86] hover:bg-white border border-black/5'
            }`}
          >
            All Drivers ({totalCount})
          </button>
          <button
            onClick={() => setFilterStatus('EMPTY')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all liquid-btn cursor-pointer shrink-0 flex items-center gap-1.5 ${
              filterStatus === 'EMPTY'
                ? 'bg-[#065F46] text-white shadow-xs'
                : 'bg-emerald-50 text-[#065F46] hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#34D399]" />
            Empty / Available ({emptyCount})
          </button>
          <button
            onClick={() => setFilterStatus('OUT_FOR_DELIVERY')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all liquid-btn cursor-pointer shrink-0 flex items-center gap-1.5 ${
              filterStatus === 'OUT_FOR_DELIVERY'
                ? 'bg-[#1B3A7A] text-white shadow-xs'
                : 'bg-blue-50 text-[#1B3A7A] hover:bg-blue-100 border border-blue-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
            Out for Delivery ({deliveryCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px] md:min-w-[320px]">
          <Search className="w-4 h-4 text-[#5B6B86] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by driver, unit #, plate, model..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs font-medium bg-white/80 border border-[#08193A]/10 text-[#08193A] placeholder-[#5B6B86] focus:outline-none focus:border-[#34D399] transition-all"
          />
        </div>
      </div>

      {/* 4. Drivers Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredDrivers.map((driver) => {
          const isEmpty = driver.status === 'EMPTY';
          return (
            <div
              key={driver.id}
              className={`rounded-2xl p-5 md:p-6 glass-panel transition-all duration-200 border ${
                isEmpty
                  ? 'border-emerald-300/60 bg-emerald-500/[0.02] hover:border-emerald-500/70'
                  : 'border-blue-300/60 bg-blue-500/[0.02] hover:border-blue-500/70'
              } shadow-sm space-y-4`}
            >
              {/* Header: Driver Name, Rating, Status */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-black/5">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-extrabold text-[#08193A] tracking-tight">
                      {driver.name}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-[#08193A]/5 text-[#08193A] border border-black/5">
                      {driver.id}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/15 text-amber-700 border border-amber-500/30">
                      ★ {driver.rating.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#5B6B86] mt-1 flex-wrap">
                    <span className="font-mono">Lic: {driver.licenseNumber}</span>
                    <span>•</span>
                    <span className="font-mono font-medium text-[#08193A]">{driver.phone}</span>
                    <span>•</span>
                    <span>{driver.tripsCompleted} Completed Trips</span>
                  </div>
                </div>

                {/* Status Badge */}
                <div>
                  {isEmpty ? (
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#34D399]/20 text-[#065F46] border border-[#34D399]/50 flex items-center gap-1.5 shadow-2xs whitespace-nowrap">
                      <span className="w-2 h-2 rounded-full bg-[#34D399] animate-mint-pulse" />
                      EMPTY / READY
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#1B3A7A]/15 text-[#1B3A7A] border border-[#1B3A7A]/30 flex items-center gap-1.5 shadow-2xs whitespace-nowrap">
                      <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-pulse" />
                      OUT FOR DELIVERY
                    </span>
                  )}
                </div>
              </div>

              {/* Vehicle Specifications Box */}
              <div className="rounded-xl p-3.5 bg-white/70 border border-[#08193A]/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#1B3A7A]" />
                    <span className="font-mono font-extrabold text-sm text-[#08193A]">
                      {driver.vehicle.unitNumber}
                    </span>
                    <span className="text-xs font-medium text-[#5B6B86]">
                      ({driver.vehicle.model})
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-[#08193A] border border-slate-300">
                    {driver.vehicle.plateNumber}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
                  <div>
                    <span className="text-[10px] text-[#5B6B86] uppercase font-bold block">Capacity</span>
                    <span className="font-mono font-semibold text-[#08193A]">{driver.vehicle.capacityTons} MT</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#5B6B86] uppercase font-bold block">VIN / Chassis</span>
                    <span className="font-mono text-[11px] text-[#08193A] truncate block" title={driver.vehicle.vin}>
                      {driver.vehicle.vin.slice(0, 10)}...
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#5B6B86] uppercase font-bold block">Fuel / Energy</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-16 h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-emerald-500" 
                          style={{ width: `${driver.vehicle.fuelLevelPercent}%` }} 
                        />
                      </div>
                      <span className="font-mono text-[11px] font-bold text-[#08193A]">{driver.vehicle.fuelLevelPercent}%</span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-[#5B6B86] bg-slate-50 p-2 rounded-lg border border-slate-200/60 leading-tight">
                  <span className="font-semibold text-[#08193A]">Specs:</span> {driver.vehicle.specs}
                </p>
              </div>

              {/* Current Assignment / Location Box */}
              <div className="rounded-xl p-3.5 bg-slate-50/80 border border-slate-200 text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#08193A] block">
                      {isEmpty ? 'Depot Staging Location:' : 'Live Highway Position:'}
                    </span>
                    <span className="text-[#5B6B86]">{driver.currentLocation}</span>
                  </div>
                </div>

                {/* If Out for Delivery: Show Active Order, Route & ETA */}
                {!isEmpty && driver.activeAssignment && (
                  <div className="pt-2 border-t border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#1B3A7A]">
                        Order #{driver.activeAssignment.orderId}
                      </span>
                      <span className="font-mono font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#1B3A7A] flex items-center gap-1 text-[11px]">
                        <Clock className="w-3 h-3" />
                        ETA: {driver.activeAssignment.eta}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium text-[#08193A]">
                      <span>{driver.activeAssignment.origin}</span>
                      <ArrowRight className="w-3 h-3 text-[#5B6B86]" />
                      <span>{driver.activeAssignment.destination}</span>
                    </div>
                    <p className="text-[11px] text-[#5B6B86] italic">
                      Payload: {driver.activeAssignment.cargoDesc}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons: VoIP Satellite Call & Encrypted Cab Chat */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onCallDriver(driver)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#08193A] bg-white border border-[#08193A]/20 hover:bg-slate-50 transition-all liquid-btn flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-[#1B3A7A]" />
                    <span>Call Driver</span>
                  </button>
                  <button
                    onClick={() => onChatDriver(driver)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#08193A] text-white hover:bg-[#1B3A7A] transition-all liquid-btn flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#34D399]" />
                    <span>Cab Chat</span>
                  </button>
                </div>

                {isEmpty && onAssignDriver && (
                  <button
                    onClick={() => onAssignDriver(driver)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all liquid-btn flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                    <span>Dispatch Rig</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredDrivers.length === 0 && (
        <div className="p-12 text-center rounded-2xl glass-panel border border-white">
          <Truck className="w-10 h-10 text-[#5B6B86] mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-bold text-[#08193A]">No drivers matched your filter</h3>
          <p className="text-xs text-[#5B6B86] mt-1">Try resetting the status filter or search query.</p>
        </div>
      )}
    </div>
  );
};
