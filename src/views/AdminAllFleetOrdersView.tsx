import React, { useState } from 'react';
import { 
  Truck, 
  Download, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Building2, 
  ShoppingBag, 
  Filter, 
  Check, 
  X,
  CreditCard,
  UserCheck
} from 'lucide-react';
import { PurchasedTruckOrder } from '../types';
import { formatInr, formatInrCompact } from '../lib/currency';
import { AdminBadge } from '../components/AdminBadge';

interface AdminAllFleetOrdersViewProps {
  orders: PurchasedTruckOrder[];
  onApproveOrder: (orderId: string) => void;
  onFulfillOrder: (orderId: string) => void;
  onCancelOrder: (orderId: string) => void;
  currency: 'USD' | 'INR';
}

export const AdminAllFleetOrdersView: React.FC<AdminAllFleetOrdersViewProps> = ({
  orders,
  onApproveOrder,
  onFulfillOrder,
  onCancelOrder,
  currency
}) => {
  const [filterMode, setFilterMode] = useState<'ALL' | 'ACTIVE' | 'FULFILLED'>('ALL');
  const [customerFilter, setCustomerFilter] = useState<string>('All');

  const customerOptions = [
    'All',
    'Vikas Intermodal Corp',
    'Apex Intermodal Logistics',
    'Summit Cold-Chain Express'
  ];

  const filtered = orders.filter((order) => {
    if (customerFilter !== 'All' && !order.buyerCompany.includes(customerFilter.replace('Corp', '').trim())) {
      return false;
    }
    if (filterMode === 'ACTIVE') return order.status !== 'DELIVERED_TO_FLEET';
    if (filterMode === 'FULFILLED') return order.status === 'DELIVERED_TO_FLEET';
    return true;
  });

  const totalUsd = orders.reduce((acc, o) => acc + o.amountPaidUsd, 0);
  const totalInr = orders.reduce((acc, o) => acc + o.amountPaidInr, 0);

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
LESSEE / CORPORATE CLIENT:
------------------------------------------------------------------------
PRIMARY LESSEE:   ${order.buyerName}
CORPORATION:      ${order.buyerCompany}

------------------------------------------------------------------------
ALLOCATED COMMERCIAL RIG:
------------------------------------------------------------------------
MODEL:            ${order.truckName}
CATEGORY:         ${order.category}
VEHICLE ID VIN:   ${order.vin}
DISPATCH DEPOT:   ${order.assignedDepot}
OPERATION STATUS: ${order.status}

------------------------------------------------------------------------
COMMERCIAL LEASE CHARGES:
------------------------------------------------------------------------
BASE OPERATING LEASE:  ₹${(order.amountPaidInr * 0.82).toFixed(2)} INR
COMMERCIAL LEASE GST:  ₹${(order.amountPaidInr * 0.14).toFixed(2)} INR (GST 18%)
SATELLITE TELEMETRY:   ₹${(order.amountPaidInr * 0.04).toFixed(2)} INR
------------------------------------------------------------------------
TOTAL CLEARED AMOUNT:  ₹${order.amountPaidInr.toLocaleString('en-IN')} INR
NATIVE CURRENCY:       INR (₹)

TERMS & CONDITIONS:
- 24/7 Breakdown & Recovery Hotline Included.
- Pre-calibrated QpiAI Highway Governor & Realtime GPS Sync Active.
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
            <span>DELIVERED & FULFILLED</span>
          </span>
        );
      case 'IN_TRANSIT_TO_DEPOT':
        return (
          <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-[#1B3A7A]/20 text-[#1B3A7A] border border-[#1B3A7A]/30 flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-[#1B3A7A] animate-pulse" />
            <span>IN TRANSIT TO DEPOT</span>
          </span>
        );
      case 'PRE-DELIVERY_INSPECTION':
        return (
          <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-900 border border-amber-500/30 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>PRE-DELIVERY INSPECTION</span>
          </span>
        );
      case 'PROCESSING':
      default:
        return (
          <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-900 border border-blue-500/30 flex items-center gap-1.5">
            <span>PROCESSING</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#08193A] text-[#A7F3D0] border border-[#34D399]/40 flex items-center gap-1.5">
              <ShoppingBag className="w-3 h-3 text-[#34D399]" />
              <span>ALL COMMERCIAL FLEET RENTALS</span>
            </span>
            <AdminBadge label="RENTAL FULFILLMENT" />
            <span className="text-xs text-[#5B6B86] font-medium">• Cross-Enterprise Rental Register</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#08193A] tracking-tight">
            Commercial Fleet Rentals & Leases
          </h1>
          <p className="text-xs md:text-sm text-[#5B6B86] mt-1 max-w-3xl">
            Complete transaction ledger across all client corporations. Track pre-dispatch yard inspection checkpoints, approve VIN allocation, and manage active commercial leases.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-4 py-2 rounded-2xl bg-[#08193A] text-white font-mono text-xs">
            <span className="text-white/60">Total Rental Revenue: </span>
            <span className="text-[#34D399] font-bold" title={formatInr(totalInr)}>
              {formatInrCompact(totalInr)}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Row: Customer Dropdown and Status Pills */}
      <div className="p-4 rounded-[24px] glass-panel flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        {/* Customer Filter */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#08193A]">
            <Building2 className="w-3.5 h-3.5 text-[#1B3A7A]" />
            <span>Filter Corporate Client:</span>
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
        </div>

        {/* Status Mode */}
        <div className="flex items-center gap-1.5 text-xs">
          {(['ALL', 'ACTIVE', 'FULFILLED'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-4 py-1.5 rounded-full font-bold transition-all liquid-btn cursor-pointer ${
                filterMode === mode
                  ? 'bg-[#08193A] text-white shadow-xs'
                  : 'bg-white/60 text-[#5B6B86] hover:bg-white border border-white'
              }`}
            >
              {mode === 'ALL' ? 'All Orders' : mode === 'ACTIVE' ? 'Active Transit & PDI' : 'Fulfilled in Fleet'}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filtered.map((order) => {
          const isFulfilled = order.status === 'DELIVERED_TO_FLEET';

          return (
            <div
              key={order.orderId}
              className="p-6 rounded-[28px] glass-panel hover:shadow-lg transition-all space-y-4 border border-white/80"
            >
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono font-extrabold text-base md:text-lg text-[#08193A]">
                    {order.truckName}
                  </span>

                  {/* Corporate Owner Tag (Admin Only) */}
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#08193A] text-white flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-[#34D399]" />
                    <span>Owner: {order.buyerCompany}</span>
                  </span>

                  <span className="text-xs text-[#5B6B86]">
                    Buyer: <strong>{order.buyerName}</strong>
                  </span>

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#1B3A7A]/15 text-[#1B3A7A]">
                    {order.category}
                  </span>

                  {getStatusBadge(order.status)}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadInvoice(order)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white text-[#08193A] hover:bg-[#08193A] hover:text-white border border-black/10 transition-all liquid-btn flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="Download Official Tax Invoice"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Invoice</span>
                  </button>
                </div>
              </div>

              {/* Grid details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-3 rounded-2xl bg-white/60 border border-white/80">
                  <span className="text-[10px] text-[#5B6B86] uppercase font-mono block">Vehicle Identification (VIN)</span>
                  <span className="font-mono font-bold text-[#08193A] text-sm">{order.vin}</span>
                </div>

                <div className="p-3 rounded-2xl bg-white/60 border border-white/80">
                  <span className="text-[10px] text-[#5B6B86] uppercase font-mono block">Designated Receiving Depot</span>
                  <span className="font-bold text-[#08193A] flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#1B3A7A]" />
                    <span>{order.assignedDepot}</span>
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-white/60 border border-white/80">
                  <span className="text-[10px] text-[#5B6B86] uppercase font-mono block">Total Paid & Rail</span>
                  <span className="font-mono font-bold text-[#34D399] text-sm block mt-0.5">
                    {formatInr(order.amountPaidInr)}
                  </span>
                  <span className="text-[10px] text-[#5B6B86] font-mono">
                    Via {order.paymentMethod} • Tx: {order.transactionId.slice(0, 12)}...
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-white/60 border border-white/80 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-[#5B6B86] uppercase font-mono block">Order Reference</span>
                    <span className="font-mono font-bold text-[#08193A]">{order.orderId}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#5B6B86]">
                    Purchased: {order.purchaseDate}
                  </span>
                </div>
              </div>

              {/* Admin Action Bar */}
              <div className="pt-2 flex items-center justify-between gap-3 border-t border-black/5 text-xs">
                <div className="flex items-center gap-2">
                  {!isFulfilled ? (
                    <>
                      <button
                        onClick={() => onApproveOrder(order.orderId)}
                        className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#08193A] text-white hover:bg-[#1B3A7A] transition-all liquid-btn flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5 text-[#34D399]" />
                        <span>Approve Factory PDI</span>
                      </button>

                      <button
                        onClick={() => onFulfillOrder(order.orderId)}
                        className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#34D399] text-[#08193A] hover:bg-[#6EE7B7] transition-all liquid-btn flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#08193A]" />
                        <span>Mark Fulfilled & Deliver</span>
                      </button>

                      <button
                        onClick={() => onCancelOrder(order.orderId)}
                        className="px-3 py-1.5 rounded-full text-xs font-bold bg-red-500/10 text-red-700 hover:bg-red-500/20 border border-red-500/20 transition-all liquid-btn cursor-pointer"
                      >
                        Cancel Order
                      </button>
                    </>
                  ) : (
                    <span className="text-xs font-bold text-[#34D399] flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
                      <span>Unit physically delivered and accepted into customer active fleet.</span>
                    </span>
                  )}
                </div>

                <span className="text-[11px] font-mono text-[#5B6B86]">
                  Inv: #{order.invoiceNumber}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
