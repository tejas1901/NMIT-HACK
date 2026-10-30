import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  QrCode, 
  Coins, 
  ShieldCheck, 
  CheckCircle2, 
  Download, 
  Lock, 
  ArrowRight, 
  Copy, 
  Check, 
  AlertCircle,
  Truck,
  FileText,
  Building2,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { CheckoutItem, PurchasedTruckOrder, UserProfile } from '../types';
import { formatInr } from '../lib/currency';

interface PaymentModalProps {
  isOpen: boolean;
  item: CheckoutItem | null;
  onClose: () => void;
  onPaymentSuccess: (order: PurchasedTruckOrder | null, metadata?: Record<string, any>) => void;
  userRole?: 'admin' | 'customer';
  currentUser?: UserProfile;
}

type PaymentMethod = 'CARD' | 'UPI' | 'CRYPTO_ESCROW';
type PaymentStep = 'FORM' | 'PROCESSING' | 'SUCCESS';

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  item,
  onClose,
  onPaymentSuccess,
  userRole = 'customer',
  currentUser
}) => {
  if (!isOpen || !item) return null;

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CARD');
  const [currency, setCurrency] = useState<'USD' | 'INR'>('INR');
  const [step, setStep] = useState<PaymentStep>('FORM');
  const [processingMessage, setProcessingMessage] = useState('Securing Quantum Interchange Gateway...');
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Form states - strictly blank for manual customer entry
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [escrowTerm, setEscrowTerm] = useState<'ESCROW_SMART_CONTRACT' | 'ENTERPRISE_NET30'>('ESCROW_SMART_CONTRACT');
  const [completedOrder, setCompletedOrder] = useState<PurchasedTruckOrder | null>(null);

  const formatPrice = (_usd: number, inr: number) => {
    return formatInr(inr);
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText('freightiq.pay@icici');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2200);
  };

  const handleProcessPayment = () => {
    setFormError(null);
    if (paymentMethod === 'CARD') {
      if (!cardName.trim()) {
        setFormError('Please enter the Cardholder Name manually.');
        return;
      }
      if (!cardNumber.trim() || cardNumber.replace(/\s+/g, '').length < 12) {
        setFormError('Please enter a valid 16-digit Card Number manually.');
        return;
      }
      if (!cardExpiry.trim()) {
        setFormError('Please enter the Card Expiry date (MM/YY).');
        return;
      }
      if (!cardCvc.trim()) {
        setFormError('Please enter the 3-digit CVV / CVC code.');
        return;
      }
    } else if (paymentMethod === 'UPI') {
      if (!upiId.trim()) {
        setFormError('Please enter your VPA / UPI ID (e.g., yourname@okhdfcbank) to authorize payment.');
        return;
      }
    }

    setStep('PROCESSING');
    
    // Simulate multi-stage quantum payment verification
    setTimeout(() => {
      setProcessingMessage('Authorizing banking route through ICEGATE interchange...');
    }, 900);

    setTimeout(() => {
      setProcessingMessage('Minting cryptographic VIN & recording ledger in Supabase...');
    }, 1800);

    setTimeout(() => {
      const generatedOrderId = `RNT-TRK-${Math.floor(70000 + Math.random() * 29000)}`;
      const generatedVin = `${item.metadata?.vinPrefix || '1FUJBBCK4RP'}-${Math.floor(100000 + Math.random() * 899999)}`;
      const generatedInvoice = `RNT-FREIGHTIQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const generatedTx = paymentMethod === 'CRYPTO_ESCROW' 
        ? `0x${Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('')}`
        : paymentMethod === 'CARD'
        ? `ch_${Math.random().toString(36).substring(2, 14)}`
        : `UPI-RR-${Math.floor(1000000000 + Math.random() * 9000000000)}`;

      const newOrder: PurchasedTruckOrder | null = item.type === 'TRUCK' ? {
        orderId: generatedOrderId,
        truckId: item.referenceId,
        truckName: item.title,
        category: (item.metadata?.category as string) || 'Commercial Haul',
        purchaseDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
        rentalDuration: (item.metadata?.rentalDuration as string) || '7-Day Dedicated Lease',
        amountPaidUsd: item.priceUsd,
        amountPaidInr: item.priceInr,
        paymentMethod: paymentMethod,
        transactionId: generatedTx,
        status: 'PRE-DELIVERY_INSPECTION',
        vin: generatedVin,
        assignedDepot: 'JNPT Intermodal Port Hub #4',
        buyerName: cardName || currentUser?.full_name || (userRole === 'admin' ? 'Operations Admin' : 'Customer'),
        buyerCompany: currentUser?.company || (userRole === 'admin' ? 'FreightIQ Enterprise Fleet Operations' : 'Commercial Shipper'),
        buyerEmail: currentUser?.email,
        invoiceNumber: generatedInvoice
      } : null;

      setCompletedOrder(newOrder);
      setStep('SUCCESS');
      onPaymentSuccess(newOrder, {
        transactionId: generatedTx,
        invoiceNumber: generatedInvoice,
        referenceId: item.referenceId,
        type: item.type,
        ...(item.metadata || {})
      });
    }, 2800);
  };

  // Automated Corporate Invoice Download simulation
  const handleDownloadInvoice = () => {
    if (!item) return;
    const invNumber = completedOrder?.invoiceNumber || `RNT-FREIGHTIQ-${Date.now()}`;
    const invoiceText = `
================================================================================
                    FREIGHTIQ UNIFIED INTELLIGENCE
        Official Commercial Fleet Rental Agreement & Tax Receipt
================================================================================
Agreement Number:  ${invNumber}
Date of Issue:     ${new Date().toUTCString()}
Payment Gateway:   Stripe / Razorpay Quantum Multi-Rail
Status:            PAID IN FULL (200 OK)
Transaction Ref:   ${completedOrder?.transactionId || 'TXN-99812-OK'}
Payment Rail:      ${paymentMethod}
Currency:          ${currency}

LESSEE / CLIENT DETAILS:
Name / Principal:  ${cardName || 'Ananya Verma'}
Organization:      ${userRole === 'admin' ? 'FreightIQ Fleet Operations' : 'Vikas Intermodal Logistics Corp'}
Account Class:     ${userRole === 'admin' ? 'Operations Lead' : 'Verified Commercial Lessee'}
Depot / Delivery:  JNPT Port Intermodal Hub / Gate 12

ITEMIZED CHARGES:
--------------------------------------------------------------------------------
Item Description                                                Total Amount
--------------------------------------------------------------------------------
${item.title.padEnd(54)} ${formatPrice(item.priceUsd, item.priceInr)}
  - Reference ID: ${item.referenceId}
  - Scope: ${item.subtitle}
${completedOrder?.vin ? `  - Cryptographic VIN: ${completedOrder.vin}\n` : ''}
Corridor Satellite Telemetry Protocol (QpiAI) Included          ₹0.00
Road Infrastructure & Terminal Documentation Included           ₹0.00
Applicable Regional Tax / GST / VAT (Included)                   ₹0.00
--------------------------------------------------------------------------------
TOTAL PAID:                                                     ${formatPrice(item.priceUsd, item.priceInr)}
================================================================================
Cryptographic Proof Hash:
SHA-256: 7f8a91b2c3d4e5f60718293a4b5c6d7e8f901a2b3c4d5e6f7a8b9c0d1e2f3a4b

Thank you for choosing FREIGHTIQ Autonomous Fleet & Freight Intelligence.
Support: support@freightiq.ai | Sat-Uplink: 1-800-FREIGHTIQ
================================================================================
    `.trim();

    const blob = new Blob([invoiceText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${invNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl glass-panel-dark text-white rounded-[32px] p-6 md:p-8 shadow-[0_24px_80px_rgba(8,25,58,0.5)] border border-white/20 max-h-[92vh] overflow-y-auto relative animate-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        {step !== 'PROCESSING' && (
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer"
            aria-label="Close checkout"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* STEP 1: FORM SELECTION */}
        {step === 'FORM' && (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between pr-8">
                <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#34D399]/20 text-[#6EE7B7] border border-[#34D399]/40 flex items-center gap-1.5 w-fit">
                  <Lock className="w-3 h-3 text-[#34D399]" />
                  <span>256-Bit Quantum Secure Gateway</span>
                </span>

                {/* Currency badge */}
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] font-mono text-[#A7F3D0]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
                  <span>INR (₹)</span>
                </div>
              </div>

              <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight mt-2.5">
                {item.type === 'TRUCK' ? 'Complete Commercial Truck Purchase' : 'Instant Cargo Booking Payment'}
              </h2>
              <p className="text-xs text-white/60 mt-1">
                Authorized dispatch payment processing under FreightIQ enterprise SLA guarantee.
              </p>
            </div>

            {/* Order Summary Item Banner */}
            <div className="p-4 rounded-[22px] bg-white/5 border border-white/10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1B3A7A] to-[#08193A] border border-white/15 flex items-center justify-center shrink-0">
                  {item.type === 'TRUCK' ? <Truck className="w-6 h-6 text-[#34D399]" /> : <FileText className="w-6 h-6 text-[#6EE7B7]" />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">{item.title}</p>
                  <p className="text-[11px] text-white/60 truncate">{item.subtitle}</p>
                  <p className="text-[10px] font-mono text-[#A7F3D0] mt-0.5">Ref: {item.referenceId}</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className="text-xs text-white/50 uppercase font-semibold">Total Due</p>
                <p className="text-xl font-extrabold font-mono text-[#34D399]">
                  {formatPrice(item.priceUsd, item.priceInr)}
                </p>
              </div>
            </div>

            {/* Payment Rail Selector Tabs */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">
                Select Payment Rail:
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'CARD', label: 'Credit Card', sub: 'Visa / MC / Amex', icon: CreditCard },
                  { id: 'UPI', label: 'UPI / QR', sub: 'Instant Net Banking', icon: QrCode },
                  { id: 'CRYPTO_ESCROW', label: 'Escrow / Terms', sub: 'Web3 & Net-30', icon: Coins }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isSelected = paymentMethod === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setPaymentMethod(tab.id as PaymentMethod)}
                      className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-1 cursor-pointer ${
                        isSelected 
                          ? 'bg-[#34D399]/20 border-[#34D399] shadow-[0_0_20px_rgba(52,211,153,0.25)]' 
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-[#34D399]' : 'text-white/60'}`} />
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />}
                      </div>
                      <div>
                        <p className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-white/80'}`}>{tab.label}</p>
                        <p className="text-[10px] text-white/50">{tab.sub}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TAB 1: CARD PAYMENT FORM */}
            {paymentMethod === 'CARD' && (
              <div className="space-y-3.5 p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-white/70">Cardholder Name</label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="Full Name as on Card"
                    className="w-full px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-xs font-medium text-white placeholder-white/40 focus:outline-none focus:border-[#34D399]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-white/70">Card Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4000 1234 5678 9010"
                      className="w-full pl-3.5 pr-10 py-2 rounded-xl bg-white/10 border border-white/20 text-xs font-mono font-medium text-white placeholder-white/40 focus:outline-none focus:border-[#34D399]"
                    />
                    <CreditCard className="w-4 h-4 text-[#34D399] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-white/70">Expires (MM/YY)</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="12/28"
                      className="w-full px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-xs font-mono text-white placeholder-white/40 focus:outline-none focus:border-[#34D399]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-white/70">CVC / CVV</label>
                    <input
                      type="password"
                      value={cardCvc}
                      maxLength={4}
                      onChange={(e) => setCardCvc(e.target.value)}
                      placeholder="•••"
                      className="w-full px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-xs font-mono text-white placeholder-white/40 focus:outline-none focus:border-[#34D399]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: UPI / QR PAYMENT */}
            {paymentMethod === 'UPI' && (
              <div className="space-y-4 p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-white text-[#08193A] w-fit mx-auto shadow-md">
                  {/* Dynamic simulated high-res SVG QR Code */}
                  <svg className="w-36 h-36" viewBox="0 0 100 100">
                    <rect width="100" height="100" fill="#ffffff" />
                    {/* Top Left Marker */}
                    <rect x="10" y="10" width="22" height="22" fill="#08193A" />
                    <rect x="14" y="14" width="14" height="14" fill="#ffffff" />
                    <rect x="17" y="17" width="8" height="8" fill="#34D399" />
                    {/* Top Right Marker */}
                    <rect x="68" y="10" width="22" height="22" fill="#08193A" />
                    <rect x="72" y="14" width="14" height="14" fill="#ffffff" />
                    <rect x="75" y="17" width="8" height="8" fill="#34D399" />
                    {/* Bottom Left Marker */}
                    <rect x="10" y="68" width="22" height="22" fill="#08193A" />
                    <rect x="14" y="72" width="14" height="14" fill="#ffffff" />
                    <rect x="17" y="75" width="8" height="8" fill="#34D399" />
                    {/* Grid dots simulating payload */}
                    <rect x="40" y="12" width="6" height="6" fill="#08193A" />
                    <rect x="52" y="12" width="6" height="6" fill="#08193A" />
                    <rect x="42" y="24" width="6" height="6" fill="#08193A" />
                    <rect x="36" y="36" width="28" height="28" fill="#08193A" rx="4" />
                    <circle cx="50" cy="50" r="8" fill="#34D399" />
                    <rect x="12" y="44" width="6" height="6" fill="#08193A" />
                    <rect x="72" y="44" width="6" height="6" fill="#08193A" />
                    <rect x="80" y="60" width="6" height="6" fill="#08193A" />
                    <rect x="44" y="72" width="6" height="6" fill="#08193A" />
                    <rect x="56" y="80" width="6" height="6" fill="#08193A" />
                    <rect x="72" y="76" width="14" height="6" fill="#08193A" />
                  </svg>
                  <span className="text-[10px] font-mono font-bold mt-2 text-[#08193A] tracking-wider">
                    SCAN VIA ANY UPI APP (GPAY, PHONEPE, PAYTM)
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/10 border border-white/15 text-xs">
                  <div className="text-left">
                    <p className="text-[10px] text-white/50 uppercase font-semibold">Official Merchant UPI ID:</p>
                    <p className="font-mono font-bold text-[#A7F3D0]">freightiq.pay@icici</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {copiedUpi ? <Check className="w-3.5 h-3.5 text-[#34D399]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[11px] font-semibold text-white/70">Or enter your VPA / UPI ID</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="name@okhdfcbank"
                    className="w-full px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-xs font-mono text-white placeholder-white/40 focus:outline-none focus:border-[#34D399]"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: CRYPTO & NET-30 ESCROW */}
            {paymentMethod === 'CRYPTO_ESCROW' && (
              <div className="space-y-3.5 p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 p-1 rounded-xl bg-white/10 border border-white/15 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setEscrowTerm('ESCROW_SMART_CONTRACT')}
                    className={`flex-1 py-1.5 rounded-lg transition-all text-center ${escrowTerm === 'ESCROW_SMART_CONTRACT' ? 'bg-[#08193A] text-[#34D399] font-bold shadow-xs' : 'text-white/60'}`}
                  >
                    Web3 USDC Escrow
                  </button>
                  <button
                    type="button"
                    onClick={() => setEscrowTerm('ENTERPRISE_NET30')}
                    className={`flex-1 py-1.5 rounded-lg transition-all text-center ${escrowTerm === 'ENTERPRISE_NET30' ? 'bg-[#08193A] text-[#34D399] font-bold shadow-xs' : 'text-white/60'}`}
                  >
                    Enterprise Net-30 Credit
                  </button>
                </div>

                {escrowTerm === 'ESCROW_SMART_CONTRACT' ? (
                  <div className="space-y-2 text-xs leading-relaxed text-white/80">
                    <p>
                      Funds are held in a decentralized multi-signature escrow smart contract. Released automatically to FreightIQ upon physical delivery verification at the intermodal terminal depot.
                    </p>
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 font-mono text-[11px] text-[#A7F3D0] break-all">
                      Contract: 0x71a2B89e984Fe931D84200008819A2938B9844C1
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-xs leading-relaxed text-white/80">
                    <div className="flex items-center gap-2 text-[#34D399] font-bold">
                      <Building2 className="w-4 h-4" />
                      <span>Corporate Credit Line Approved: ₹2,16,00,000</span>
                    </div>
                    <p className="text-[11px] text-white/70">
                      Payment is deferred for 30 calendar days. Invoice is generated instantly and dispatched to your corporate finance department.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Manual Entry Form Validation Alert */}
            {formError && (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-3 rounded-full text-xs font-bold text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProcessPayment}
                className="w-full flex-1 px-6 py-3 rounded-full text-xs font-bold bg-gradient-to-r from-[#34D399] to-[#6EE7B7] text-[#08193A] hover:opacity-95 shadow-[0_8px_24px_rgba(52,211,153,0.35)] liquid-btn flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-[#08193A]" />
                <span>Authorize & Pay {formatPrice(item.priceUsd, item.priceInr)}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PROCESSING ANIMATION */}
        {step === 'PROCESSING' && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-5 animate-in fade-in">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-white/10" />
              <div className="absolute inset-0 rounded-full border-4 border-t-[#34D399] animate-spin" />
              <div className="absolute inset-2 rounded-full border-2 border-b-[#6EE7B7] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.2s' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <Lock className="w-6 h-6 text-[#34D399] animate-pulse" />
              </div>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white tracking-tight">
                Processing Secure Transaction
              </h3>
              <p className="text-xs text-[#A7F3D0] font-mono animate-pulse max-w-sm">
                {processingMessage}
              </p>
            </div>

            <p className="text-[11px] text-white/40">
              Do not refresh or close the browser window.
            </p>
          </div>
        )}

        {/* STEP 3: SUCCESS CONFIRMATION */}
        {step === 'SUCCESS' && (
          <div className="space-y-6 py-2 animate-in zoom-in-95 text-center">
            {/* Animated Checkmark */}
            <div className="w-16 h-16 rounded-full bg-[#34D399]/20 border border-[#34D399] text-[#34D399] flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(52,211,153,0.4)]">
              <CheckCircle2 className="w-9 h-9 text-[#34D399]" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#34D399]/20 text-[#A7F3D0] border border-[#34D399]/40">
                Payment Authorized & Verified
              </span>
              <h3 className="text-2xl font-extrabold text-white tracking-tight mt-2">
                {item.type === 'TRUCK' ? 'Commercial Truck Ownership Confirmed!' : 'Cargo Dispatch Verified!'}
              </h3>
              <p className="text-xs text-white/70 mt-1 max-w-md mx-auto leading-relaxed">
                {item.type === 'TRUCK'
                  ? `Your unit ${item.title} has been assigned and registered in the FreightIQ Intermodal Network.`
                  : `Your commercial freight booking ${item.referenceId} has been confirmed and routed.`}
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left space-y-2 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-white/60">Amount Paid:</span>
                <span className="font-mono font-bold text-[#34D399] text-sm">
                  {formatPrice(item.priceUsd, item.priceInr)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">Invoice Number:</span>
                <span className="font-mono font-semibold text-white">
                  {completedOrder?.invoiceNumber || 'INV-FREIGHTIQ-2026-9901'}
                </span>
              </div>
              {completedOrder?.vin && (
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Vehicle Identification (VIN):</span>
                  <span className="font-mono font-bold text-[#A7F3D0]">
                    {completedOrder.vin}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-white/60">Payment Method:</span>
                <span className="font-mono text-white/80">{paymentMethod}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">Transaction Reference:</span>
                <span className="font-mono text-[11px] text-white/70 truncate max-w-[200px]">
                  {completedOrder?.transactionId || 'TXN-ONLINE-9901'}
                </span>
              </div>
            </div>

            {/* Download & Dismiss Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleDownloadInvoice}
                className="w-full sm:flex-1 px-5 py-3 rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#34D399]" />
                <span>Download Official Invoice (.txt / PDF)</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full sm:flex-1 px-5 py-3 rounded-full text-xs font-bold bg-[#34D399] text-[#08193A] hover:bg-[#6EE7B7] flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <span>Done & View Inventory</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
