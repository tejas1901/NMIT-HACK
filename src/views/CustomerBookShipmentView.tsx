import React, { useState } from 'react';
import { 
  Package, 
  MapPin, 
  Truck, 
  ShieldCheck, 
  Sparkles, 
  CreditCard, 
  ArrowRight, 
  Calendar, 
  Scale, 
  Sliders, 
  CheckCircle2, 
  DollarSign, 
  Leaf, 
  Zap,
  Info,
  AlertTriangle
} from 'lucide-react';
import { CheckoutItem, Consignment } from '../types';
import { formatInr } from '../lib/currency';

interface CustomerBookShipmentViewProps {
  onInitiatePayment: (checkoutItem: CheckoutItem) => void;
  onBookingConfirmed: (newConsignment: Consignment) => void;
}

export const CustomerBookShipmentView: React.FC<CustomerBookShipmentViewProps> = ({
  onInitiatePayment,
  onBookingConfirmed
}) => {
  // Wizard state
  const [carrierCompany, setCarrierCompany] = useState('FreightIQ Intermodal Command');
  const [shipperCompany, setShipperCompany] = useState('Vikas Intermodal Corp');
  const [shipperAddress, setShipperAddress] = useState('Plot 42, Peenya Industrial Area, Phase 3, Bengaluru - 560058');
  const [shipperPhone, setShipperPhone] = useState('+91 98201 55194');
  const [validationError, setValidationError] = useState<string | null>(null);

  const [origin, setOrigin] = useState('Nhava Sheva (JNPT) Port, Mumbai');
  const [destination, setDestination] = useState('Whitefield Technology Park, Bangalore');
  const [cargoType, setCargoType] = useState('Precision Automotive Components');
  const [weightKg, setWeightKg] = useState<number>(14500);
  const [declaredValueUsd, setDeclaredValueUsd] = useState<number>(7344000);
  const [serviceTier, setServiceTier] = useState<'INTERMODAL' | 'ACCELERATED' | 'QUANTUM_EXPRESS'>('QUANTUM_EXPRESS');
  const [includeCarbonOffset, setIncludeCarbonOffset] = useState(true);
  const [notes, setNotes] = useState('Fragile electronic assemblies. Maintain steady temperature between 18°C and 24°C.');

  // Rate calculations natively in INR
  const baseRateInr = 122688;
  const weightSurchargeInr = Math.round((weightKg / 1000) * 3888);
  const tierMultiplier = serviceTier === 'QUANTUM_EXPRESS' ? 1.4 : serviceTier === 'ACCELERATED' ? 1.2 : 1.0;
  const carbonOffsetInr = includeCarbonOffset ? 3024 : 0;
  const insuranceFeeInr = Math.round(declaredValueUsd * 0.0035);

  const totalInr = Math.round((baseRateInr + weightSurchargeInr) * tierMultiplier + insuranceFeeInr + carbonOffsetInr);
  const totalUsd = Math.round(totalInr / 86.4);

  const validateCustomerInputs = () => {
    if (!shipperCompany.trim()) {
      setValidationError('Customer Company Name is strictly required before booking.');
      return false;
    }
    if (!shipperAddress.trim() || shipperAddress.trim().length < 5) {
      setValidationError('Customer Physical Address is strictly required before booking.');
      return false;
    }
    if (!shipperPhone.trim() || shipperPhone.trim().length < 8) {
      setValidationError('Customer Contact Phone Number is strictly required before booking.');
      return false;
    }
    setValidationError(null);
    return true;
  };

  const handleInstantCheckout = () => {
    if (!validateCustomerInputs()) return;

    const checkoutItem: CheckoutItem = {
      type: 'CONSIGNMENT',
      title: `Freight Haul: ${origin.split(',')[0]} → ${destination.split(',')[0]}`,
      subtitle: `${cargoType} • ${weightKg.toLocaleString()} kg (${carrierCompany})`,
      referenceId: `CRG-BK-${Math.floor(10000 + Math.random() * 90000)}`,
      priceUsd: totalInr,
      priceInr: totalInr,
      metadata: {
        Origin: origin,
        Destination: destination,
        Cargo: cargoType,
        Weight: `${weightKg} kg`,
        ServiceTier: serviceTier,
        CarrierCompany: carrierCompany,
        ShipperCompany: shipperCompany,
        ShipperAddress: shipperAddress,
        ShipperPhone: shipperPhone,
        Insurance: '100% Guaranteed SLA'
      }
    };
    onInitiatePayment(checkoutItem);
  };

  const handleCreateConsignment = () => {
    if (!validateCustomerInputs()) return;

    const newConsignment: Consignment = {
      id: `CRG-BK-${Math.floor(20000 + Math.random() * 80000)}`,
      origin: origin,
      destination: destination,
      department: cargoType.split(' ')[0].toUpperCase(),
      weightLbs: Math.round(weightKg * 2.20462),
      valueUsd: declaredValueUsd,
      mode: serviceTier === 'QUANTUM_EXPRESS' ? 'Intermodal Prime' : 'Highway Hauler',
      delayRiskLevel: 'LOW',
      delayRiskPercent: 4.8,
      demurrageRisk: 0,
      carrierName: carrierCompany,
      carrierCompany: carrierCompany,
      shipperCompany: shipperCompany.trim(),
      shipperAddress: shipperAddress.trim(),
      shipperPhone: shipperPhone.trim(),
      circuitFile: 'qpi_intermodal_corridor_v4.qasm',
      netSavings: Math.round(totalInr * 0.18),
      status: 'PENDING_APPROVAL',
      eta: 'Awaiting Admin Approval',
      driverName: 'Carrier Assigned Upon Acceptance',
      driverPhone: shipperPhone.trim(),
      notes: `Order submitted by ${shipperCompany} (${shipperPhone}). Awaiting approval from ${carrierCompany} Admin.`
    };
    onBookingConfirmed(newConsignment);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#34D399]/20 text-[#08193A] border border-[#34D399]/40 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#34D399]" />
            <span>INSTANT FREIGHT DISPATCH WIZARD</span>
          </span>
          <span className="text-xs text-[#5B6B86] font-medium">• Dynamic Algorithm Rate Calculator</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#08193A] tracking-tight">
          Request Commercial Freight Haul
        </h1>
        <p className="text-xs md:text-sm text-[#5B6B86] mt-1 max-w-2xl">
          Book dedicated commercial capacity with quantum route optimization, guaranteed zero demurrage, and instant digital checkout.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Booking Parameters */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 0: Mandatory Shipper Identification & Target Carrier */}
          <div className="p-6 rounded-[30px] glass-panel space-y-4 shadow-sm border border-white/80 bg-amber-500/5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-[#08193A] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>Customer Verification & Target Carrier (Mandatory)</span>
              </h3>
              <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                Admin Approval Flow
              </span>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#5B6B86]">
                Target Carrier Company (Order Recipient)
              </label>
              <select
                value={carrierCompany}
                onChange={(e) => setCarrierCompany(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-xs font-bold text-[#08193A]"
              >
                <option value="FreightIQ Intermodal Command">FreightIQ Intermodal Command (NH-48 Mumbai - Bengaluru)</option>
                <option value="Vikas Intermodal Logistics">Vikas Intermodal Logistics (Western Freight Corridor)</option>
                <option value="Blue Dart Express Freight">Blue Dart Express Freight (Southern Trunk Corridor)</option>
                <option value="Container Corp of India (CONCOR)">Container Corp of India (CONCOR Rail Quad)</option>
                <option value="Navata Road Transport">Navata Road Transport (Deccan Highway Fleet)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#5B6B86] mb-1.5">
                  Your Company Name *
                </label>
                <input
                  type="text"
                  value={shipperCompany}
                  onChange={(e) => setShipperCompany(e.target.value)}
                  placeholder="e.g. Apex Industrial Corp"
                  required
                  className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-xs font-semibold text-[#08193A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5B6B86] mb-1.5">
                  Contact Phone Number *
                </label>
                <input
                  type="tel"
                  value={shipperPhone}
                  onChange={(e) => setShipperPhone(e.target.value)}
                  placeholder="+91 98201 55194"
                  required
                  className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-xs font-semibold text-[#08193A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5B6B86] mb-1.5">
                Pickup / Facility Physical Address *
              </label>
              <textarea
                rows={2}
                value={shipperAddress}
                onChange={(e) => setShipperAddress(e.target.value)}
                placeholder="Complete industrial address, gate number, and pincode..."
                required
                className="w-full px-3.5 py-2 rounded-2xl glass-input text-xs font-medium text-[#08193A]"
              />
            </div>

            {validationError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}
          </div>

          {/* Card 1: Route & Origin/Destination */}
          <div className="p-6 rounded-[30px] glass-panel space-y-5 shadow-sm border border-white/80">
            <h3 className="text-sm font-extrabold text-[#08193A] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#1B3A7A]" />
              <span>Corridor Terminals & Routing</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#5B6B86] mb-1.5">
                  Origin Freight Terminal
                </label>
                <select
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-xs font-semibold text-[#08193A]"
                >
                  <option value="Nhava Sheva (JNPT) Port, Mumbai">Nhava Sheva (JNPT) Port, Mumbai</option>
                  <option value="Chennai Port Container Terminal, TN">Chennai Port Container Terminal, TN</option>
                  <option value="Delhi NCR Inland Logistics Hub, Gurgaon">Delhi NCR Inland Logistics Hub, Gurgaon</option>
                  <option value="Mundra Port Logistics Terminal, Gujarat">Mundra Port Logistics Terminal, Gujarat</option>
                  <option value="Kolkata Haldia Dock Complex, WB">Kolkata Haldia Dock Complex, WB</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5B6B86] mb-1.5">
                  Destination Receiving Terminal
                </label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-xs font-semibold text-[#08193A]"
                >
                  <option value="Whitefield Technology Park, Bangalore">Whitefield Technology Park, Bangalore</option>
                  <option value="Chakan Auto Industrial Hub, Pune">Chakan Auto Industrial Hub, Pune</option>
                  <option value="Hyderabad HITEC Cargo Depot, Telangana">Hyderabad HITEC Cargo Depot, Telangana</option>
                  <option value="Sanand Industrial Cluster, Ahmedabad">Sanand Industrial Cluster, Ahmedabad</option>
                  <option value="Sri City Special Economic Zone, AP">Sri City Special Economic Zone, AP</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card 2: Cargo Specifications */}
          <div className="p-6 rounded-[30px] glass-panel space-y-5 shadow-sm border border-white/80">
            <h3 className="text-sm font-extrabold text-[#08193A] flex items-center gap-2">
              <Package className="w-4 h-4 text-[#1B3A7A]" />
              <span>Cargo Specifications & Weight</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#5B6B86] mb-1.5">
                  Cargo Category
                </label>
                <select
                  value={cargoType}
                  onChange={(e) => setCargoType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-xs font-semibold text-[#08193A]"
                >
                  <option value="Precision Automotive Components">Precision Automotive Components</option>
                  <option value="Consumer Electronics & Semiconductors">Consumer Electronics & Semiconductors</option>
                  <option value="Cold-Chain Pharmaceuticals (2-8°C)">Cold-Chain Pharmaceuticals (2-8°C)</option>
                  <option value="Heavy Industrial Machinery">Heavy Industrial Machinery</option>
                  <option value="Green Tech & Lithium Batteries">Green Tech & Lithium Batteries</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5B6B86] mb-1.5">
                  Net Weight (kg)
                </label>
                <input
                  type="number"
                  min="500"
                  max="45000"
                  step="500"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-xs font-mono font-bold text-[#08193A]"
                />
                <span className="text-[10px] text-[#5B6B86] mt-1 block">
                  ≈ {Math.round(weightKg * 2.20462).toLocaleString()} lbs
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5B6B86] mb-1.5">
                  Declared Value (₹ INR)
                </label>
                <input
                  type="number"
                  min="1000"
                  step="5000"
                  value={declaredValueUsd}
                  onChange={(e) => setDeclaredValueUsd(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-xs font-mono font-bold text-[#08193A]"
                />
                <span className="text-[10px] text-[#5B6B86] mt-1 block">
                  Includes full CargoGuard
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5B6B86] mb-1.5">
                Special Handling & Temperature Directives
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-2xl glass-input text-xs font-medium text-[#08193A]"
                placeholder="Driver notes, dock hours, temperature setpoints..."
              />
            </div>
          </div>

          {/* Card 3: Service SLA Selection */}
          <div className="p-6 rounded-[30px] glass-panel space-y-4 shadow-sm border border-white/80">
            <h3 className="text-sm font-extrabold text-[#08193A] flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#34D399]" />
              <span>Select Service SLA Level</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option 1 */}
              <div
                onClick={() => setServiceTier('INTERMODAL')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  serviceTier === 'INTERMODAL'
                    ? 'border-[#08193A] bg-white shadow-md ring-2 ring-[#08193A]/10'
                    : 'border-white/80 bg-white/40 hover:bg-white/70'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold text-[#08193A]">Intermodal Economy</span>
                  {serviceTier === 'INTERMODAL' && <CheckCircle2 className="w-4 h-4 text-[#34D399]" />}
                </div>
                <p className="text-[11px] text-[#5B6B86] mb-3">
                  Rail + Highway paired. Standard 48-72h transit. Lowest carbon footprint.
                </p>
                <span className="font-mono text-xs font-bold text-[#08193A]">Base Cost</span>
              </div>

              {/* Option 2 */}
              <div
                onClick={() => setServiceTier('ACCELERATED')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  serviceTier === 'ACCELERATED'
                    ? 'border-[#08193A] bg-white shadow-md ring-2 ring-[#08193A]/10'
                    : 'border-white/80 bg-white/40 hover:bg-white/70'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold text-[#08193A]">Corridor Priority</span>
                  {serviceTier === 'ACCELERATED' && <CheckCircle2 className="w-4 h-4 text-[#34D399]" />}
                </div>
                <p className="text-[11px] text-[#5B6B86] mb-3">
                  Dedicated dual-driver relay. 24-36h transit. Live GPS streaming.
                </p>
                <span className="font-mono text-xs font-bold text-[#08193A]">+20% Speed Premium</span>
              </div>

              {/* Option 3 */}
              <div
                onClick={() => setServiceTier('QUANTUM_EXPRESS')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all relative overflow-hidden ${
                  serviceTier === 'QUANTUM_EXPRESS'
                    ? 'border-[#34D399] bg-[#08193A] text-white shadow-lg ring-2 ring-[#34D399]'
                    : 'border-white/80 bg-white/40 hover:bg-white/70'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-extrabold ${serviceTier === 'QUANTUM_EXPRESS' ? 'text-white' : 'text-[#08193A]'}`}>
                    Quantum Zero-Demurrage
                  </span>
                  {serviceTier === 'QUANTUM_EXPRESS' && <CheckCircle2 className="w-4 h-4 text-[#34D399]" />}
                </div>
                <p className={`text-[11px] mb-3 ${serviceTier === 'QUANTUM_EXPRESS' ? 'text-white/80' : 'text-[#5B6B86]'}`}>
                  QpiAI dynamic bypass, autonomous governor, sub-24h delivery, 100% SLA guarantee.
                </p>
                <span className={`font-mono text-xs font-bold ${serviceTier === 'QUANTUM_EXPRESS' ? 'text-[#34D399]' : 'text-[#08193A]'}`}>
                  Guaranteed Arrival SLA
                </span>
              </div>
            </div>

            {/* Carbon Offset Checkbox */}
            <div className="pt-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="carbonOffset"
                checked={includeCarbonOffset}
                onChange={(e) => setIncludeCarbonOffset(e.target.checked)}
                className="w-4 h-4 rounded text-[#34D399] focus:ring-[#34D399] cursor-pointer"
              />
              <label htmlFor="carbonOffset" className="text-xs font-semibold text-[#08193A] cursor-pointer flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                <span>Certified Net-Zero Carbon Offset (+ ₹3,024.00 INR for reforestation credits)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Col: Instant Cost Estimate & Checkout Trigger */}
        <div className="space-y-6">
          <div className="p-6 rounded-[30px] glass-panel-dark text-white space-y-5 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-white/60">
                Instant Rate Quote
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#34D399]/20 text-[#A7F3D0]">
                REAL-TIME LOCK
              </span>
            </div>

            {/* Total Pricing Display */}
            <div>
              <div className="text-3xl font-extrabold font-mono text-[#34D399]">
                {formatInr(totalInr)}
              </div>
              <div className="text-sm font-mono text-white/70 mt-0.5">
                All-inclusive commercial haul fee (inclusive of 18% GST)
              </div>
            </div>

            {/* Breakdown */}
            <div className="space-y-2.5 pt-2 text-xs border-t border-white/10">
              <div className="flex justify-between text-white/70">
                <span>Base Linehaul (820 km)</span>
                <span className="font-mono font-semibold text-white">{formatInr(baseRateInr)}</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Weight Surcharge ({weightKg} kg)</span>
                <span className="font-mono font-semibold text-white">+{formatInr(weightSurchargeInr)}</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>SLA Speed Multiplier</span>
                <span className="font-mono font-semibold text-white">x{tierMultiplier}</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>CargoGuard Complete Insurance</span>
                <span className="font-mono font-semibold text-[#34D399]">+{formatInr(insuranceFeeInr)}</span>
              </div>
              {includeCarbonOffset && (
                <div className="flex justify-between text-white/70">
                  <span>Carbon Offset Certificate</span>
                  <span className="font-mono font-semibold text-white">+{formatInr(carbonOffsetInr)}</span>
                </div>
              )}
            </div>

            {/* Guaranteed Demurrage Box */}
            <div className="p-3.5 rounded-2xl bg-[#34D399]/10 border border-[#34D399]/25 text-xs text-[#A7F3D0] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <ShieldCheck className="w-4 h-4 text-[#34D399]" />
                <span>Zero-Demurrage Guarantee</span>
              </div>
              <p className="text-[11px] text-white/80 leading-relaxed">
                If delayed past the guaranteed window due to corridor congestion, FreightIQ automatically credits 100% of the SLA premium.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={handleInstantCheckout}
                className="w-full py-3.5 px-4 rounded-full text-xs font-extrabold bg-[#34D399] text-[#08193A] hover:bg-[#6EE7B7] transition-all shadow-[0_4px_20px_rgba(52,211,153,0.35)] liquid-btn flex items-center justify-center gap-2 cursor-pointer"
              >
                <CreditCard className="w-4 h-4 text-[#08193A]" />
                <span>Pay & Dispatch Immediately</span>
              </button>

              <button
                onClick={handleCreateConsignment}
                className="w-full py-3 px-4 rounded-full text-xs font-bold bg-white/10 text-white hover:bg-white/20 border border-white/20 transition-all liquid-btn flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Save Haul to Manifest</span>
              </button>
            </div>
          </div>

          {/* SLA Security Note */}
          <div className="p-4 rounded-[24px] glass-panel text-xs text-[#5B6B86] space-y-1.5 border border-white/80">
            <div className="flex items-center gap-1.5 font-bold text-[#08193A]">
              <Info className="w-3.5 h-3.5 text-[#1B3A7A]" />
              <span>Multi-Rail Payment Security</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              We support Instant Corporate Cards (Stripe), Real-Time UPI with instant QR payment (Razorpay), and Quantum Escrow Smart Contracts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
