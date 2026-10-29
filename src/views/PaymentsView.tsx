import React, { useState } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ArrowUpRight, 
  DollarSign, 
  ShieldCheck, 
  FileText, 
  Send, 
  Zap, 
  X, 
  TrendingUp, 
  Building2, 
  Smartphone, 
  Lock, 
  Check,
  RefreshCw
} from 'lucide-react';
import { Consignment, UserRole } from '../types';

interface PaymentsViewProps {
  consignments: Consignment[];
  userRole?: UserRole | string;
  onUpdatePayment: (consignmentId: string, amountToAdd: number, method: string) => void;
  onShowToast: (message: string) => void;
  onSelectConsignment?: (item: Consignment) => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  consignments,
  userRole = 'customer',
  onUpdatePayment,
  onShowToast,
  onSelectConsignment
}) => {
  const [selectedForPayment, setSelectedForPayment] = useState<Consignment | null>(null);
  const [paymentAmountType, setPaymentAmountType] = useState<'advance70' | 'full' | 'custom'>('advance70');
  const [customAmount, setCustomAmount] = useState<number>(50000);
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'netbanking' | 'card' | 'wire'>('upi');
  const [upiId, setUpiId] = useState('rajathgowda@okaxis');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'HELD' | 'CLEARED' | 'PAID'>('ALL');
  const [receiptModal, setReceiptModal] = useState<Consignment | null>(null);

  // Financial KPIs
  const totalBilled = consignments.reduce((sum, c) => sum + (c.totalInvoiceInr || 150000), 0);
  const totalPaid = consignments.reduce((sum, c) => sum + (c.amountPaidInr || 0), 0);
  const totalOutstanding = totalBilled - totalPaid;
  const heldShipments = consignments.filter((c) => {
    const paidPct = ((c.amountPaidInr || 0) / (c.totalInvoiceInr || 150000)) * 100;
    return paidPct < 70;
  });

  const filteredConsignments = consignments.filter((c) => {
    const paidPct = ((c.amountPaidInr || 0) / (c.totalInvoiceInr || 150000)) * 100;
    if (paymentFilter === 'HELD') return paidPct < 70;
    if (paymentFilter === 'CLEARED') return paidPct >= 70 && paidPct < 100;
    if (paymentFilter === 'PAID') return paidPct >= 100;
    return true;
  });

  // Calculate required amount for a consignment to hit 70%
  const getAmountToReach70 = (c: Consignment) => {
    const target70 = Math.ceil((c.totalInvoiceInr || 150000) * 0.7);
    const needed = target70 - (c.amountPaidInr || 0);
    return Math.max(0, needed);
  };

  const handleOpenPaymentModal = (c: Consignment) => {
    setSelectedForPayment(c);
    const needed70 = getAmountToReach70(c);
    if (needed70 > 0) {
      setPaymentAmountType('advance70');
      setCustomAmount(needed70);
    } else {
      setPaymentAmountType('full');
      setCustomAmount((c.totalInvoiceInr || 150000) - (c.amountPaidInr || 0));
    }
  };

  const handleExecutePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForPayment) return;

    let amount = 0;
    const total = selectedForPayment.totalInvoiceInr || 150000;
    const paid = selectedForPayment.amountPaidInr || 0;
    const remaining = Math.max(0, total - paid);

    if (paymentAmountType === 'advance70') {
      amount = getAmountToReach70(selectedForPayment);
    } else if (paymentAmountType === 'full') {
      amount = remaining;
    } else {
      amount = Math.min(remaining, Math.max(1000, Number(customAmount)));
    }

    if (amount <= 0) {
      onShowToast('Invoice is already fully settled.');
      setSelectedForPayment(null);
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      onUpdatePayment(
        selectedForPayment.id,
        amount,
        selectedMethod.toUpperCase()
      );
      setIsProcessing(false);

      const newPaid = paid + amount;
      const newPct = (newPaid / total) * 100;
      if (newPct >= 70 && (paid / total) * 100 < 70) {
        onShowToast(`₹${amount.toLocaleString('en-IN')} Paid! 70% Threshold Cleared — Carrier Dispatch Delay Removed.`);
      } else {
        onShowToast(`₹${amount.toLocaleString('en-IN')} successfully credited via ${selectedMethod.toUpperCase()}.`);
      }
      setSelectedForPayment(null);
    }, 850);
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
      {/* 1. Header & Policy Notification Banner */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-1">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-black text-[#08193A] tracking-tight">
              Commercial Cargo Payments & Milestone Invoices
            </h2>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#08193A] text-white shrink-0">
              {userRole === 'admin' ? 'Admin Ledger Audit' : 'Customer Billing Portal'}
            </span>
          </div>
          <p className="text-xs text-[#5B6B86] mt-1 leading-relaxed">
            70% Advance Settlement Policy: Transport departs on schedule once ≥70% invoice is cleared.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl glass-panel self-start xl:self-auto shrink-0">
          {(['ALL', 'HELD', 'CLEARED', 'PAID'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setPaymentFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                paymentFilter === filter
                  ? 'bg-[#08193A] text-white shadow-xs'
                  : 'text-[#5B6B86] hover:text-[#08193A]'
              }`}
            >
              {filter === 'ALL' && `All (${consignments.length})`}
              {filter === 'HELD' && `Held <70% (${heldShipments.length})`}
              {filter === 'CLEARED' && 'Cleared (70%+)'}
              {filter === 'PAID' && 'Fully Paid'}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Critical Rule Callout Banner */}
      <div className="p-4 sm:p-5 rounded-[22px] glass-panel border border-[#F59E5B]/40 bg-gradient-to-r from-[#FFFBEB]/80 via-white/70 to-[#FFF7ED]/80 shadow-[0_8px_30px_rgba(245,158,11,0.08)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-[#F59E5B]/20 text-[#D97706] flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-[#92400E] uppercase tracking-wider flex flex-wrap items-center gap-2">
              Transport Dispatch Policy (70% Advance Rule)
              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-[#F59E5B]/30 text-[#92400E]">
                Enforced
              </span>
            </h4>
            <p className="text-xs text-[#78350F] mt-1 leading-relaxed">
              To prevent terminal congestion and secure driver allocation, <strong>carrier transit is delayed and held at terminal</strong> until at least <strong>70%</strong> of the cargo invoice is settled. Full remaining balance (30%) is due upon gate delivery.
            </p>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2 self-start md:self-auto bg-[#F59E5B]/10 md:bg-transparent px-3 py-1.5 md:p-0 rounded-xl">
          <div className="text-left md:text-right">
            <span className="text-[10px] font-bold text-[#92400E] block uppercase tracking-wider">Shipments Currently Held</span>
            <span className="text-sm font-extrabold text-[#B45309]">
              {heldShipments.length} Cargoes Incurring Delay
            </span>
          </div>
        </div>
      </div>

      {/* 3. Financial KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="p-4.5 rounded-[24px] glass-panel flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5B6B86]">
              Total Invoiced Cargo
            </span>
            <div className="w-8 h-8 rounded-full bg-[#08193A]/5 text-[#08193A] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-[#08193A] tracking-tight">
              ₹{totalBilled.toLocaleString('en-IN')}
            </span>
            <p className="text-[11px] text-[#5B6B86] mt-0.5">Across {consignments.length} commercial bookings</p>
          </div>
        </div>

        <div className="p-4.5 rounded-[24px] glass-panel border border-[#34D399]/40 bg-[#34D399]/5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#065F46]">
              Cleared Advances
            </span>
            <div className="w-8 h-8 rounded-full bg-[#34D399]/20 text-[#059669] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-[#065F46] tracking-tight">
              ₹{totalPaid.toLocaleString('en-IN')}
            </span>
            <p className="text-[11px] text-[#059669] mt-0.5 font-semibold">
              {((totalPaid / totalBilled) * 100).toFixed(1)}% of total portfolio cleared
            </p>
          </div>
        </div>

        <div className="p-4.5 rounded-[24px] glass-panel flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5B6B86]">
              Outstanding Balance
            </span>
            <div className="w-8 h-8 rounded-full bg-[#1B3A7A]/10 text-[#1B3A7A] flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-[#08193A] tracking-tight">
              ₹{totalOutstanding.toLocaleString('en-IN')}
            </span>
            <p className="text-[11px] text-[#5B6B86] mt-0.5">Terminal gate & post-delivery credit</p>
          </div>
        </div>

        <div className="p-4.5 rounded-[24px] glass-panel border border-[#F26D6D]/40 bg-[#F26D6D]/5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#991B1B]">
              Dispatch Delayed (Held)
            </span>
            <div className="w-8 h-8 rounded-full bg-[#F26D6D]/20 text-[#DC2626] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#991B1B] tracking-tight">
                {heldShipments.length}
              </span>
              <span className="text-xs font-bold text-[#DC2626]">
                Shipment{heldShipments.length === 1 ? '' : 's'}
              </span>
            </div>
            <p className="text-[11px] text-[#991B1B] mt-0.5 font-semibold">
              {heldShipments.length > 0 ? 'Departure held until 70% paid' : 'Zero held shipments! On schedule.'}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Invoices & Milestone Payment Ledger */}
      <div className="glass-panel rounded-[28px] p-5 md:p-6 shadow-[0_16px_50px_rgba(8,25,58,0.06)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#08193A]/10 gap-2">
          <div>
            <h3 className="text-base font-bold text-[#08193A]">Active Consignment Billing Ledger</h3>
            <p className="text-xs text-[#5B6B86] mt-0.5">Track 70% departure thresholds, milestone deposits, and transport hold status</p>
          </div>
          <span className="text-xs font-semibold text-[#5B6B86]">
            Showing {filteredConsignments.length} invoice{filteredConsignments.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="flex flex-col gap-3.5 mt-4">
          {filteredConsignments.map((c) => {
            const total = c.totalInvoiceInr || 150000;
            const paid = c.amountPaidInr || 0;
            const paidPct = Math.min(100, Math.round((paid / total) * 100));
            const isHeld = paidPct < 70;
            const neededToClear = getAmountToReach70(c);

            return (
              <div
                key={c.id}
                className="p-4 sm:p-5 rounded-2xl border border-white/60 bg-white/40 hover:bg-white/70 transition-all flex flex-col xl:flex-row xl:items-center justify-between gap-5 shadow-xs"
              >
                {/* Left: Consignment Metadata */}
                <div className="flex items-start gap-3.5 xl:w-[320px] shrink-0">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${
                      isHeld
                        ? 'bg-[#F26D6D]/15 text-[#DC2626] border border-[#F26D6D]/30'
                        : paidPct >= 100
                        ? 'bg-[#34D399]/20 text-[#059669] border border-[#34D399]/40'
                        : 'bg-[#34D399]/15 text-[#08193A] border border-[#34D399]/30'
                    }`}
                  >
                    {isHeld ? <Clock className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-black text-sm text-[#08193A] tracking-tight">{c.id}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#08193A]/5 text-[#5B6B86]">
                        {c.department}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-[#08193A] mt-1 flex items-center gap-1.5 truncate">
                      <span>{c.origin}</span>
                      <span className="text-[#34D399] font-black">→</span>
                      <span>{c.destination}</span>
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-[#5B6B86]">
                      <span>Carrier: <strong className="text-[#08193A] font-semibold">{c.carrierName}</strong></span>
                      <span>•</span>
                      <span>{c.weightLbs.toLocaleString()} lbs</span>
                    </div>
                  </div>
                </div>

                {/* Center: 70% Milestone Visual Progress Bar */}
                <div className="flex-1 min-w-[240px] max-w-xl w-full">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-[#08193A]">
                      ₹{paid.toLocaleString('en-IN')}{' '}
                      <span className="text-[11px] font-normal text-[#5B6B86]">
                        paid of ₹{total.toLocaleString('en-IN')}
                      </span>
                    </span>
                    <span className={`font-mono font-black text-xs ${isHeld ? 'text-[#DC2626]' : 'text-[#059669]'}`}>
                      {paidPct}%
                    </span>
                  </div>

                  {/* Progress bar with 70% threshold indicator */}
                  <div className="relative w-full h-3 bg-black/10 rounded-full overflow-hidden p-[1px]">
                    {/* 70% Target Marker */}
                    <div 
                      className="absolute top-0 bottom-0 w-[2px] bg-[#08193A] z-10 opacity-70"
                      style={{ left: '70%' }}
                      title="70% Dispatch Clearance Milestone"
                    />

                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isHeld
                          ? 'bg-gradient-to-r from-[#F26D6D] to-[#F59E5B]'
                          : paidPct >= 100
                          ? 'bg-gradient-to-r from-[#34D399] to-[#10B981]'
                          : 'bg-gradient-to-r from-[#6EE7B7] to-[#34D399]'
                      }`}
                      style={{ width: `${paidPct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between mt-1.5 text-[10px]">
                    <span className="text-[#5B6B86]">0% Deposit</span>
                    <span className="font-bold text-[#08193A] flex items-center gap-1 bg-[#08193A]/5 px-2 py-0.5 rounded-full">
                      ▲ 70% Clearance Marker
                    </span>
                    <span className="text-[#5B6B86]">100% Full</span>
                  </div>
                </div>

                {/* Right: Delay Status & Action Button */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0 justify-end">
                  {/* Status Pill */}
                  {isHeld ? (
                    <div className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#F26D6D]/15 text-[#DC2626] border border-[#F26D6D]/30 flex items-center gap-1.5 whitespace-nowrap shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-pulse" />
                      DELAYED (+{c.transportDelayHours || 18}h HOLD)
                    </div>
                  ) : (
                    <div className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#34D399]/20 text-[#065F46] border border-[#34D399]/40 flex items-center gap-1.5 whitespace-nowrap shadow-2xs">
                      <Check className="w-3.5 h-3.5" />
                      CLEARED (ON SCHEDULE)
                    </div>
                  )}

                  {/* Actions */}
                  {paidPct < 100 ? (
                    <button
                      onClick={() => handleOpenPaymentModal(c)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all liquid-btn flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs ${
                        isHeld
                          ? 'bg-[#08193A] text-white hover:bg-[#1B3A7A] hover:shadow-[0_4px_16px_rgba(8,25,58,0.25)]'
                          : 'bg-white text-[#08193A] hover:bg-white/90 border border-[#08193A]/15'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      {isHeld ? `Pay ₹${neededToClear.toLocaleString('en-IN')} (70% Advance)` : 'Pay Balance'}
                    </button>
                  ) : (
                    <button
                      onClick={() => setReceiptModal(c)}
                      className="px-4 py-2 rounded-xl text-xs font-bold glass-pill text-[#08193A] hover:bg-white flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-2xs"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Receipt
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Payment Modal (Gateway Simulation) */}
      {selectedForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg glass-panel rounded-[28px] p-6 shadow-[0_20px_60px_rgba(8,25,58,0.25)] border border-white/80 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#08193A]/10">
              <div>
                <h3 className="text-base font-bold text-[#08193A]">
                  Settle Cargo Invoice — {selectedForPayment.id}
                </h3>
                <p className="text-xs text-[#5B6B86]">
                  {selectedForPayment.origin} → {selectedForPayment.destination}
                </p>
              </div>
              <button
                onClick={() => setSelectedForPayment(null)}
                aria-label="Close payment modal"
                className="w-8 h-8 rounded-full glass-pill flex items-center justify-center text-[#5B6B86] hover:text-[#08193A] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Delay Warning Callout if sub-70% */}
            {((selectedForPayment.amountPaidInr || 0) / (selectedForPayment.totalInvoiceInr || 150000)) * 100 < 70 && (
              <div className="mt-4 p-3 rounded-xl bg-[#FFFBEB] border border-[#F59E5B]/40 text-xs text-[#92400E] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                <div>
                  <strong>Active Transport Delay:</strong> Carrier dispatch is on hold. Paying at least <strong>70% (₹{Math.ceil((selectedForPayment.totalInvoiceInr || 150000) * 0.7).toLocaleString('en-IN')})</strong> will immediately remove the terminal hold and release the carrier.
                </div>
              </div>
            )}

            <form onSubmit={handleExecutePayment} className="space-y-4 pt-4">
              {/* Payment Amount Selector */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5B6B86] mb-2">
                  Select Settlement Option
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Option 1: 70% Required Advance */}
                  {getAmountToReach70(selectedForPayment) > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentAmountType('advance70');
                        setCustomAmount(getAmountToReach70(selectedForPayment));
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        paymentAmountType === 'advance70'
                          ? 'border-[#08193A] bg-[#08193A]/5 shadow-xs'
                          : 'border-black/10 hover:border-black/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#08193A]">70% Advance Deposit</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-[#34D399]/30 text-[#065F46]">
                          CLEARS DELAY
                        </span>
                      </div>
                      <p className="text-base font-extrabold text-[#08193A] mt-1">
                        ₹{getAmountToReach70(selectedForPayment).toLocaleString('en-IN')}
                      </p>
                      <span className="text-[10px] text-[#5B6B86]">Releases transport from origin terminal</span>
                    </button>
                  )}

                  {/* Option 2: Full Balance */}
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentAmountType('full');
                      setCustomAmount((selectedForPayment.totalInvoiceInr || 150000) - (selectedForPayment.amountPaidInr || 0));
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      paymentAmountType === 'full'
                        ? 'border-[#08193A] bg-[#08193A]/5 shadow-xs'
                        : 'border-black/10 hover:border-black/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#08193A]">100% Full Balance</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-[#08193A] text-white">
                        FULL
                      </span>
                    </div>
                    <p className="text-base font-extrabold text-[#08193A] mt-1">
                      ₹{((selectedForPayment.totalInvoiceInr || 150000) - (selectedForPayment.amountPaidInr || 0)).toLocaleString('en-IN')}
                    </p>
                    <span className="text-[10px] text-[#5B6B86]">Settles invoice completely</span>
                  </button>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5B6B86] mb-1.5">
                  Payment Method
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'upi', label: 'UPI / QR', icon: Smartphone },
                    { id: 'netbanking', label: 'NetBanking', icon: Building2 },
                    { id: 'card', label: 'Corporate Card', icon: CreditCard },
                    { id: 'wire', label: 'Bank Wire / RTGS', icon: Send }
                  ].map((m) => {
                    const Icon = m.icon;
                    const isSelected = selectedMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedMethod(m.id as any)}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#08193A] bg-[#08193A] text-white'
                            : 'border-black/10 text-[#5B6B86] hover:bg-white'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[10px] font-bold">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedMethod === 'upi' && (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5B6B86] mb-1">
                    VPA / UPI ID
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl text-xs font-semibold glass-input text-[#08193A]"
                  />
                </div>
              )}

              {/* Submit Action */}
              <div className="pt-2 flex items-center justify-between border-t border-[#08193A]/10">
                <div className="text-left">
                  <span className="text-[10px] uppercase font-bold text-[#5B6B86] block">Amount to Authorize</span>
                  <span className="text-base font-black text-[#08193A]">
                    ₹{(paymentAmountType === 'advance70'
                      ? getAmountToReach70(selectedForPayment)
                      : (selectedForPayment.totalInvoiceInr || 150000) - (selectedForPayment.amountPaidInr || 0)
                    ).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedForPayment(null)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#5B6B86] hover:text-[#08193A] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-[#08193A] text-white hover:bg-[#1B3A7A] transition-all liquid-btn flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-60"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Authorizing...
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5 text-[#34D399]" />
                        Confirm & Authorize
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Receipt Modal */}
      {receiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md glass-panel rounded-[28px] p-6 shadow-[0_20px_60px_rgba(8,25,58,0.25)] border border-white/80">
            <div className="flex items-center justify-between pb-3 border-b border-[#08193A]/10">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#059669]" />
                <h3 className="text-sm font-bold text-[#08193A]">Official Logistics Tax Receipt</h3>
              </div>
              <button
                onClick={() => setReceiptModal(null)}
                className="w-7 h-7 rounded-full glass-pill flex items-center justify-center text-[#5B6B86] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="py-4 space-y-2.5 text-xs text-[#08193A]">
              <div className="flex justify-between py-1 border-b border-black/5">
                <span className="text-[#5B6B86]">Consignment ID:</span>
                <span className="font-mono font-bold">{receiptModal.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/5">
                <span className="text-[#5B6B86]">Carrier Dispatch:</span>
                <span className="font-bold">{receiptModal.carrierName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/5">
                <span className="text-[#5B6B86]">Total Invoice:</span>
                <span className="font-mono font-bold">₹{(receiptModal.totalInvoiceInr || 150000).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/5">
                <span className="text-[#5B6B86]">Amount Settled:</span>
                <span className="font-mono font-bold text-[#059669]">₹{(receiptModal.amountPaidInr || 0).toLocaleString('en-IN')} (100%)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#5B6B86]">Milestone Clearance:</span>
                <span className="font-bold text-[#059669]">✅ 70% Policy Cleared — In Transit</span>
              </div>
            </div>

            <button
              onClick={() => {
                onShowToast('Receipt downloaded.');
                setReceiptModal(null);
              }}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#08193A] text-white hover:bg-[#1B3A7A] transition-all cursor-pointer mt-2"
            >
              Download PDF Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
