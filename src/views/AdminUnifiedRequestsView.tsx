import React, { useState } from 'react';
import { 
  Inbox, 
  Building2, 
  Phone, 
  MapPin, 
  Truck, 
  Package, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  DollarSign, 
  Search, 
  Filter, 
  ShieldCheck, 
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Consignment, HaulRequest, PurchasedTruckOrder } from '../types';
import { formatInr } from '../lib/currency';

interface AdminUnifiedRequestsViewProps {
  consignments: Consignment[];
  haulRequests: HaulRequest[];
  fleetOrders: PurchasedTruckOrder[];
  onAcceptCargoOrder: (id: string) => void;
  onRejectCargoOrder: (id: string) => void;
  onApproveHaulRequest: (id: string) => void;
  onRejectHaulRequest: (id: string) => void;
  onApproveFleetOrder: (id: string) => void;
  onFulfillFleetOrder: (id: string) => void;
  onCancelFleetOrder: (id: string) => void;
  onNavigateToGmail: () => void;
}

export const AdminUnifiedRequestsView: React.FC<AdminUnifiedRequestsViewProps> = ({
  consignments,
  haulRequests,
  fleetOrders,
  onAcceptCargoOrder,
  onRejectCargoOrder,
  onApproveHaulRequest,
  onRejectHaulRequest,
  onApproveFleetOrder,
  onFulfillFleetOrder,
  onCancelFleetOrder,
  onNavigateToGmail
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'CARGO' | 'HAUL' | 'FLEET'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract pending requests
  const pendingCargo = consignments.filter(c => c.status === 'PENDING_APPROVAL');
  const pendingHauls = haulRequests.filter(h => h.status === 'NEW' || h.status === 'QUOTED' || (h.status as any) === 'NEW_INQUIRY' || (h.status as any) === 'QUOTED_PENDING_CUSTOMER');
  const pendingFleet = fleetOrders.filter(o => o.status === 'PROCESSING' || o.status === 'PRE-DELIVERY_INSPECTION' || (o.status as any) === 'PENDING');

  const totalPendingCount = pendingCargo.length + pendingHauls.length + pendingFleet.length;

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#34D399]/20 text-[#08193A] border border-[#34D399]/40 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#34D399]" />
              <span>UNIFIED OPERATIONS REQUEST DESK</span>
            </span>
            <span className="text-xs text-[#5B6B86] font-semibold">• Master Admin Exclusivity</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#08193A] tracking-tight">
            All Inbound Booking Requests
          </h1>
          <p className="text-xs md:text-sm text-[#5B6B86] mt-1 max-w-3xl leading-relaxed">
            Consolidated command desk uniting <strong>Cargo Capacity Bookings</strong>, <strong>Freight Haul Quotations</strong>, and <strong>Commercial Fleet Rentals</strong> awaiting administrator authorization.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToGmail}
            className="px-4 py-2 rounded-full text-xs font-bold bg-white/80 hover:bg-white text-[#08193A] border border-white/80 shadow-xs flex items-center gap-2 cursor-pointer transition-all"
          >
            <Inbox className="w-3.5 h-3.5 text-[#1B3A7A]" />
            <span>Open Gmail Dispatch</span>
          </button>
        </div>
      </div>

      {/* KPI Bento Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-[26px] glass-panel-dark text-white flex flex-col justify-between shadow-md">
          <span className="text-[11px] font-bold tracking-wider uppercase text-white/60">
            Total Requests Awaiting Admin
          </span>
          <div className="my-2">
            <span className="text-4xl font-extrabold font-mono text-white tabular-nums">
              {totalPendingCount}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#A7F3D0]">
            <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" />
            <span>Action Required Immediately</span>
          </div>
        </div>

        <div className="p-4 rounded-[26px] glass-panel flex flex-col justify-between">
          <span className="text-[11px] font-bold tracking-wider uppercase text-[#5B6B86]">
            Cargo Bookings
          </span>
          <div className="my-2">
            <span className="text-3xl font-extrabold font-mono text-[#08193A] tabular-nums">
              {pendingCargo.length}
            </span>
          </div>
          <span className="text-[11px] text-[#5B6B86] font-medium">Shipper intermodal orders</span>
        </div>

        <div className="p-4 rounded-[26px] glass-panel flex flex-col justify-between">
          <span className="text-[11px] font-bold tracking-wider uppercase text-[#5B6B86]">
            Haul Inquiries
          </span>
          <div className="my-2">
            <span className="text-3xl font-extrabold font-mono text-[#08193A] tabular-nums">
              {pendingHauls.length}
            </span>
          </div>
          <span className="text-[11px] text-[#5B6B86] font-medium">Corridor quoting requests</span>
        </div>

        <div className="p-4 rounded-[26px] glass-panel flex flex-col justify-between">
          <span className="text-[11px] font-bold tracking-wider uppercase text-[#5B6B86]">
            Fleet Rentals
          </span>
          <div className="my-2">
            <span className="text-3xl font-extrabold font-mono text-[#08193A] tabular-nums">
              {pendingFleet.length}
            </span>
          </div>
          <span className="text-[11px] text-[#5B6B86] font-medium">Commercial vehicle leases</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-[26px] glass-panel flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/80 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'ALL', label: 'All Booking Requests', count: totalPendingCount },
            { id: 'CARGO', label: 'Cargo Bookings', count: pendingCargo.length },
            { id: 'HAUL', label: 'Haul Inquiries', count: pendingHauls.length },
            { id: 'FLEET', label: 'Fleet Truck Rentals', count: pendingFleet.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-full font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                filterType === tab.id
                  ? 'bg-[#08193A] text-white shadow-xs'
                  : 'bg-white/60 text-[#5B6B86] hover:bg-white hover:text-[#08193A]'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                filterType === tab.id ? 'bg-[#34D399] text-[#08193A]' : 'bg-black/5 text-[#5B6B86]'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#5B6B86] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ref, shipper, phone..."
            className="w-full pl-8 pr-3 py-1.5 rounded-full text-xs font-medium glass-input text-[#08193A] placeholder-[#5B6B86]/60"
          />
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. CARGO BOOKING REQUESTS SECTION */}
      {/* ========================================================= */}
      {(filterType === 'ALL' || filterType === 'CARGO') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#08193A] flex items-center gap-2">
              <Package className="w-4 h-4 text-[#1B3A7A]" />
              <span>Cargo Capacity Bookings ({pendingCargo.length})</span>
            </h3>
            <span className="text-[11px] text-[#5B6B86]">Customer carrier reservations requiring admin dispatch</span>
          </div>

          {pendingCargo.length === 0 ? (
            <div className="p-6 rounded-2xl bg-white/40 border border-white text-center text-xs text-[#5B6B86]">
              ✓ No pending cargo capacity requests. All customer bookings processed.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingCargo.map((order) => (
                <div
                  key={order.id}
                  className="p-5 rounded-[24px] bg-white/90 border border-amber-500/40 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-[#08193A] text-white px-2.5 py-0.5 rounded-lg">
                        {order.id}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-900 border border-amber-500/40">
                        PENDING CARRIER APPROVAL
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-900 border border-blue-500/30 flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-blue-700" />
                        <span>Shipper: {order.shipperCompany || order.customerCompany}</span>
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-900 border border-purple-500/30">
                        Target Fleet: {order.carrierCompany || order.carrierName}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-[#08193A]">
                      <div className="flex items-center gap-1.5 font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-[#1B3A7A] shrink-0" />
                        <span>{order.origin} → {order.destination}</span>
                      </div>
                      <span className="text-[#5B6B86]">
                        {order.department} • {order.weightLbs.toLocaleString()} lbs • <strong>{formatInr(order.valueUsd)}</strong>
                      </span>
                    </div>

                    {/* Customer Mandatory Details */}
                    <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-[#08193A] flex flex-wrap items-center gap-x-5 gap-y-1">
                      <span className="flex items-center gap-1 font-semibold text-[11px]">
                        <Phone className="w-3 h-3 text-amber-700" />
                        <span>Phone: {order.shipperPhone || '+91 98201 55194'}</span>
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-[11px]">
                        <MapPin className="w-3 h-3 text-amber-700" />
                        <span>Pickup: {order.shipperAddress || 'Peenya Industrial Logistics Hub, Bengaluru'}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start lg:self-center">
                    <button
                      onClick={() => onAcceptCargoOrder(order.id)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-[#34D399] text-[#08193A] hover:bg-[#6EE7B7] transition-all liquid-btn shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Accept Cargo Order</span>
                    </button>
                    <button
                      onClick={() => onRejectCargoOrder(order.id)}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-500/15 text-rose-800 hover:bg-rose-500/25 border border-rose-500/30 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Decline</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. FREIGHT HAUL REQUESTS SECTION */}
      {/* ========================================================= */}
      {(filterType === 'ALL' || filterType === 'HAUL') && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#08193A] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#1B3A7A]" />
              <span>Freight Haul Inquiries ({pendingHauls.length})</span>
            </h3>
            <span className="text-[11px] text-[#5B6B86]">Custom freight quotation and routing requests</span>
          </div>

          {pendingHauls.length === 0 ? (
            <div className="p-6 rounded-2xl bg-white/40 border border-white text-center text-xs text-[#5B6B86]">
              ✓ No pending haul inquiries.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingHauls.map((haul) => (
                <div
                  key={haul.id}
                  className="p-5 rounded-[24px] bg-white/90 border border-blue-500/30 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-[#08193A] text-white px-2.5 py-0.5 rounded-lg">
                        {haul.id}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-900 border border-blue-500/40">
                        STATUS: {haul.status.replace('_', ' ')}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#34D399]/20 text-[#08193A]">
                        {haul.customerCompany || (haul as any).companyName || 'Corporate Client'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-[#08193A]">
                      <div className="flex items-center gap-1.5 font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-[#1B3A7A] shrink-0" />
                        <span>{haul.origin} → {haul.destination}</span>
                      </div>
                      <span className="text-[#5B6B86]">
                        {haul.cargoCategory || (haul as any).cargoDescription || 'Cargo'} • {(haul.weightKg || 32000).toLocaleString()} kg • Quoted: <strong>{formatInr(haul.quotedPriceInr || (haul.quotedPriceUsd ? haul.quotedPriceUsd * 86.4 : 140000))}</strong>
                      </span>
                    </div>

                    <p className="text-[11px] text-[#5B6B86]">
                      Special Handling: {haul.notes || (haul as any).specialRequirements || 'Standard intermodal container transit.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start lg:self-center">
                    <button
                      onClick={() => onApproveHaulRequest(haul.id)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-[#34D399] text-[#08193A] hover:bg-[#6EE7B7] transition-all liquid-btn shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve Haul Quote</span>
                    </button>
                    <button
                      onClick={() => onRejectHaulRequest(haul.id)}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-500/15 text-rose-800 hover:bg-rose-500/25 border border-rose-500/30 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Decline</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. COMMERCIAL FLEET / TRUCK RENTAL REQUESTS SECTION */}
      {/* ========================================================= */}
      {(filterType === 'ALL' || filterType === 'FLEET') && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#08193A] flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#1B3A7A]" />
              <span>Commercial Fleet / Truck Rental Requests ({pendingFleet.length})</span>
            </h3>
            <span className="text-[11px] text-[#5B6B86]">Vehicle showroom lease orders awaiting dispatch</span>
          </div>

          {pendingFleet.length === 0 ? (
            <div className="p-6 rounded-2xl bg-white/40 border border-white text-center text-xs text-[#5B6B86]">
              ✓ No pending fleet rental orders.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingFleet.map((fleet) => (
                <div
                  key={fleet.orderId}
                  className="p-5 rounded-[24px] bg-white/90 border border-purple-500/30 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-[#08193A] text-white px-2.5 py-0.5 rounded-lg">
                        {fleet.orderId}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-900 border border-purple-500/40">
                        STATUS: {fleet.status}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-900">
                        Customer: {fleet.buyerCompany || 'Commercial Shipper'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-[#08193A]">
                      <span className="font-extrabold text-sm text-[#08193A]">{fleet.truckName}</span>
                      <span className="text-[#5B6B86]">
                        Deployment Depot: <strong>{fleet.assignedDepot || 'Nhava Sheva Terminal 3'}</strong>
                      </span>
                      <span className="font-bold text-[#1B3A7A]">
                        Lease Value: {formatInr(fleet.amountPaidInr || (fleet.amountPaidUsd ? fleet.amountPaidUsd * 86.4 : 185000))}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start lg:self-center">
                    <button
                      onClick={() => onApproveFleetOrder(fleet.orderId)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-[#34D399] text-[#08193A] hover:bg-[#6EE7B7] transition-all liquid-btn shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve & Dispatch Rig</span>
                    </button>
                    <button
                      onClick={() => onCancelFleetOrder(fleet.orderId)}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-500/15 text-rose-800 hover:bg-rose-500/25 border border-rose-500/30 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
