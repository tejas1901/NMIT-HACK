import React, { useState } from 'react';
import { 
  Truck, 
  FileText, 
  Download, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Plus, 
  ShoppingBag, 
  Sparkles,
  ArrowRight,
  CreditCard,
  Building2,
  QrCode
} from 'lucide-react';
import { PurchasedTruckOrder } from '../types';
import { formatInr, formatInrCompact } from '../lib/currency';

interface CustomerFleetOrdersViewProps {
  purchasedOrders: PurchasedTruckOrder[];
  onNavigateToMarketplace: () => void;
  currency: 'USD' | 'INR';
}

export const CustomerFleetOrdersView: React.FC<CustomerFleetOrdersViewProps> = ({
  purchasedOrders = [],
  onNavigateToMarketplace,
  currency
}) => {
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'DELIVERED'>('ALL');

  const filteredOrders = purchasedOrders.filter((order) => {
    if (filter === 'ACTIVE') return order.status !== 'DELIVERED_TO_FLEET';
    if (filter === 'DELIVERED') return order.status === 'DELIVERED_TO_FLEET';
    return true;
  });

  const totalUsdValue = purchasedOrders.reduce((sum, o) => sum + o.amountPaidUsd, 0);
  const totalInrValue = purchasedOrders.reduce((sum, o) => sum + o.amountPaidInr, 0);

  const handleDownloadInvoice = (order: PurchasedTruckOrder) => {
    const invoiceContent = `
========================================================================
             FREIGHTIQ LOGISTICS INTELLIGENCE INC.
        OFFICIAL COMMERCIAL FLEET LEASE & RENTAL AGREEMENT
========================================================================

RENTAL AGREEMENT: ${order.invoiceNumber}
TRANSACTION ID:   ${order.transactionId}
EFFECTIVE DATE:   ${order.purchaseDate}
LEASE TERM:       ${order.rentalDuration || '7-Day Dedicated Lease Package'}
PAYMENT METHOD:   ${order.paymentMethod}
PAYMENT STATUS:   PAID IN FULL (CLEARED ESCROW)

------------------------------------------------------------------------
LESSEE / CLIENT DETAILS:
------------------------------------------------------------------------
PRIMARY LESSEE:   ${order.buyerName}
CORPORATION:      ${order.buyerCompany}
ACCOUNT ID:       GSTIN-27AABCV8841F1Z8

------------------------------------------------------------------------
ALLOCATED COMMERCIAL RIG:
------------------------------------------------------------------------
MODEL:            ${order.truckName}
CATEGORY:         ${order.category}
VEHICLE ID VIN:   ${order.vin}
DISPATCH DEPOT:   ${order.assignedDepot}
OPERATION STATUS: ${order.status}

------------------------------------------------------------------------
COMMERCIAL RENTAL BREAKDOWN:
------------------------------------------------------------------------
BASE OPERATING LEASE:  ₹${(order.amountPaidInr * 0.82).toFixed(2)} INR
COMMERCIAL LEASE GST:  ₹${(order.amountPaidInr * 0.14).toFixed(2)} INR (GST 18%)
SATELLITE & TELEMETRY: ₹${(order.amountPaidInr * 0.04).toFixed(2)} INR
------------------------------------------------------------------------
TOTAL CLEARED AMOUNT:  ₹${order.amountPaidInr.toLocaleString('en-IN')} INR
NATIVE CURRENCY:       INR (₹)

TERMS & CONDITIONS:
- 24/7 Breakdown & Recovery Hotline Included.
- Pre-calibrated QpiAI Highway Governor & Realtime GPS Sync Active.
- Fuel / Charging billed at commercial corridor standard rate.
DIGITAL SIGNATURE HASH: SHA256-${order.transactionId.toUpperCase()}-LEASE
========================================================================
`.trim();

    const blob = new Blob([invoiceContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Rental_Agreement_${order.invoiceNumber}_${order.vin}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: PurchasedTruckOrder['status']) => {
    switch (status) {
      case 'DELIVERED_TO_FLEET':
        return (
          <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-[#34D399]/20 text-[#08193A] border border-[#34D399]/40 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
            <span>ACTIVE IN FLEET</span>
          </span>
        );
      case 'IN_TRANSIT_TO_DEPOT':
        return (
          <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-[#1B3A7A]/20 text-[#1B3A7A] border border-[#1B3A7A]/30 flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-[#1B3A7A] animate-pulse" />
            <span>TRANSIT TO DEPOT</span>
          </span>
        );
      case 'PRE-DELIVERY_INSPECTION':
        return (
          <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-900 border border-amber-500/30 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>FACTORY PDI INSPECTION</span>
          </span>
        );
      case 'PROCESSING':
      default:
        return (
          <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-900 border border-blue-500/30 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin" />
            <span>ORDER PROCESSING</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#34D399]/20 text-[#08193A] border border-[#34D399]/40 flex items-center gap-1.5">
              <ShoppingBag className="w-3 h-3 text-[#34D399]" />
              <span>COMMERCIAL FLEET LEASES</span>
            </span>
            <span className="text-xs text-[#5B6B86] font-medium">• Vikas Intermodal Logistics Rental Register</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#08193A] tracking-tight">
            My Fleet Rentals & Active Leases
          </h1>
          <p className="text-xs md:text-sm text-[#5B6B86] mt-1 max-w-2xl">
            Live delivery tracking, verified VIN registration, digital rental agreements, and yard dispatch inspection statuses.
          </p>
        </div>

        <button
          onClick={onNavigateToMarketplace}
          className="self-start lg:self-auto px-5 py-2.5 rounded-full text-xs font-bold bg-[#08193A] text-white hover:bg-[#1B3A7A] shadow-[0_4px_16px_rgba(8,25,58,0.22)] liquid-btn flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#34D399]" />
          <span>Rent More Rigs</span>
        </button>
      </div>

      {/* Bento Asset KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-[26px] glass-panel-dark text-white flex flex-col justify-between shadow-md">
          <span className="text-[11px] font-bold tracking-wider uppercase text-white/60">
            Total Fleet Rental Commitment
          </span>
          <div className="my-2">
            <span className="text-2xl font-extrabold font-mono text-[#34D399]" title={formatInr(totalInrValue)}>
              {formatInrCompact(totalInrValue)}
            </span>
          </div>
          <p className="text-[11px] text-white/70">
            Operating lease commitments
          </p>
        </div>

        <div className="p-4 rounded-[26px] glass-panel flex flex-col justify-between shadow-xs">
          <span className="text-[11px] font-bold tracking-wider uppercase text-[#5B6B86]">
            Active Rented Units
          </span>
          <div className="my-2">
            <span className="text-3xl font-extrabold font-mono text-[#08193A]">
              {purchasedOrders.length}
            </span>
          </div>
          <p className="text-[11px] text-[#5B6B86] font-medium">
            Heavy Hauler & Electric Semis
          </p>
        </div>

        <div className="p-4 rounded-[26px] glass-panel flex flex-col justify-between shadow-xs">
          <span className="text-[11px] font-bold tracking-wider uppercase text-[#5B6B86]">
            In Yard Dispatch Queue
          </span>
          <div className="my-2">
            <span className="text-3xl font-extrabold font-mono text-[#1B3A7A]">
              {purchasedOrders.filter(o => o.status !== 'DELIVERED_TO_FLEET').length}
            </span>
          </div>
          <p className="text-[11px] text-[#5B6B86] font-medium">
            Pre-delivery inspections underway
          </p>
        </div>

        <div className="p-4 rounded-[26px] glass-panel flex flex-col justify-between shadow-xs">
          <span className="text-[11px] font-bold tracking-wider uppercase text-[#5B6B86]">
            Telemetry Gateways
          </span>
          <div className="my-2 flex items-center justify-between">
            <span className="text-3xl font-extrabold font-mono text-[#34D399]">
              100%
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-[#34D399]/20 text-[#08193A]">
              ONLINE
            </span>
          </div>
          <p className="text-[11px] text-[#5B6B86] font-medium">
            QpiAI Cloud Connected
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {(['ALL', 'ACTIVE', 'DELIVERED'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setFilter(mode)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all liquid-btn cursor-pointer ${
              filter === mode
                ? 'bg-[#08193A] text-white shadow-xs'
                : 'bg-white/60 text-[#5B6B86] hover:bg-white border border-white'
            }`}
          >
            {mode === 'ALL' ? 'All Purchases' : mode === 'ACTIVE' ? 'Active Transit & PDI' : 'Active In Fleet'}
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center rounded-[30px] glass-panel space-y-4 border border-white/80">
            <Truck className="w-12 h-12 text-[#5B6B86]/50 mx-auto" />
            <h3 className="text-lg font-bold text-[#08193A]">No Vehicle Orders Found</h3>
            <p className="text-xs text-[#5B6B86] max-w-sm mx-auto">
              Explore the FreightIQ Marketplace to purchase high-performance commercial haulers and refrigerated reefers.
            </p>
            <button
              onClick={onNavigateToMarketplace}
              className="px-5 py-2.5 rounded-full text-xs font-bold bg-[#08193A] text-white hover:bg-[#1B3A7A] liquid-btn inline-flex items-center gap-2"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const formattedPrice = formatInr(order.amountPaidInr);

            return (
              <div
                key={order.orderId}
                className="p-6 rounded-[28px] glass-panel hover:shadow-lg transition-all space-y-4 border border-white/80"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/5">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono font-extrabold text-base md:text-lg text-[#08193A]">
                      {order.truckName}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#1B3A7A]/15 text-[#1B3A7A]">
                      {order.category}
                    </span>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-[#5B6B86]">
                      Leased: {order.purchaseDate}
                    </span>
                    <button
                      onClick={() => handleDownloadInvoice(order)}
                      className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white text-[#08193A] hover:bg-[#08193A] hover:text-white border border-black/10 transition-all liquid-btn flex items-center gap-1.5 cursor-pointer shadow-xs"
                      title="Download Official Rental Agreement"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Rental Agreement</span>
                    </button>
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 rounded-2xl bg-white/60 border border-white/80">
                    <span className="text-[10px] text-[#5B6B86] uppercase font-mono block">Vehicle Identification No (VIN)</span>
                    <span className="font-mono font-bold text-[#08193A] text-sm">{order.vin}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/60 border border-white/80">
                    <span className="text-[10px] text-[#5B6B86] uppercase font-mono block">Designated Hub / Depot</span>
                    <span className="font-bold text-[#08193A] flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-[#1B3A7A]" />
                      <span>{order.assignedDepot}</span>
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/60 border border-white/80">
                    <span className="text-[10px] text-[#5B6B86] uppercase font-mono block">Total Rental Charge</span>
                    <span className="font-mono font-bold text-[#34D399] text-sm block mt-0.5">
                      {formattedPrice}
                    </span>
                    <span className="text-[10px] text-[#5B6B86] font-mono">
                      {order.rentalDuration || '7-Day Dedicated Lease'} • Via {order.paymentMethod}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/60 border border-white/80 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-[#5B6B86] uppercase font-mono block">Lessee Operator</span>
                      <span className="font-bold text-[#08193A]">{order.buyerCompany}</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#5B6B86]">
                      Agr #{order.invoiceNumber}
                    </span>
                  </div>
                </div>

                {/* QpiAI Opt Autonomous Backhaul Pairing */}
                <div className="pt-2.5 pb-1 border-t border-black/5 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#1B3A7A]/15 text-[#1B3A7A] border border-[#1B3A7A]/25 flex items-center gap-1.5 shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1B3A7A] animate-pulse" />
                      QpiAI Opt Backhaul Pairing
                    </span>
                    <span className="text-[11px] text-[#08193A]">
                      Corridor: <strong>Bengaluru ↔ Pune (NH-48)</strong> • Deadhead reduced 82%
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-[#34D399] bg-[#34D399]/10 px-2 py-0.5 rounded-full border border-[#34D399]/25">
                    +₹42,500/mo fuel optimization
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
