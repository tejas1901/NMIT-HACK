import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Truck, 
  Package, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  CalendarCheck
} from 'lucide-react';
import { Consignment, CheckoutItem, PurchasedTruckOrder } from '../types';
import { CargoBookingsView } from './CargoBookingsView';
import { CustomerBookShipmentView } from './CustomerBookShipmentView';
import { TruckMarketplaceView } from './TruckMarketplaceView';

export type BookingSubTab = 'CARGO' | 'HAUL' | 'FLEET';

interface CustomerUnifiedBookingViewProps {
  initialSubTab?: BookingSubTab;
  // Cargo Bookings Props
  consignments: Consignment[];
  onSelectConsignment: (c: Consignment) => void;
  onOpenNewBookingModal: (carrier?: string) => void;
  onForceWeatherRefresh: () => void;
  isWeatherRefreshing: boolean;
  onRerunRisk: (id: string) => void;
  onReassignCarrier: (id: string) => void;
  userRole?: 'admin' | 'customer';
  onAcceptOrder?: (id: string) => void;
  onRejectOrder?: (id: string) => void;

  // Haul Booking Props
  onInitiatePayment: (checkoutItem: CheckoutItem) => void;
  onBookingConfirmed: (newConsignment: Consignment) => void;

  // Fleet Booking Props
  onInitiateCheckout: (item: CheckoutItem) => void;
  purchasedOrders: PurchasedTruckOrder[];
  onViewPurchasedOrders: () => void;
}

export const CustomerUnifiedBookingView: React.FC<CustomerUnifiedBookingViewProps> = ({
  initialSubTab = 'CARGO',
  consignments = [],
  onSelectConsignment,
  onOpenNewBookingModal,
  onForceWeatherRefresh,
  isWeatherRefreshing,
  onRerunRisk,
  onReassignCarrier,
  userRole = 'customer',
  onAcceptOrder,
  onRejectOrder,
  onInitiatePayment,
  onBookingConfirmed,
  onInitiateCheckout,
  purchasedOrders = [],
  onViewPurchasedOrders
}) => {
  const [subTab, setSubTab] = useState<BookingSubTab>(initialSubTab);

  // Compute live booking statistics
  const pendingCargoCount = consignments.filter(c => c.status === 'PENDING_APPROVAL').length;
  const activeFleetOrdersCount = purchasedOrders.length;

  return (
    <div className="space-y-6 pb-16">
      {/* Unified Master Header & Navigation Switcher */}
      <div className="glass-panel p-5 sm:p-6 rounded-[30px] border border-white/80 shadow-[0_12px_40px_rgba(8,25,58,0.06)] space-y-5 bg-gradient-to-br from-white/90 via-white/80 to-emerald-50/30">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#1B3A7A]/15 text-[#1B3A7A] border border-[#1B3A7A]/30 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#1B3A7A]" />
                <span>UNIFIED LOGISTICS BOOKING HUB</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#34D399]/20 text-[#08193A] border border-[#34D399]/40 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#34D399]" />
                <span>One Tab · Cargo, Haul & Fleet</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[#08193A] tracking-tight">
              Logistics & Fleet Reservations
            </h1>

            <p className="text-xs sm:text-sm text-[#5B6B86] max-w-2xl leading-relaxed">
              Book carrier cargo capacities, request direct point-to-point freight hauls, or lease commercial multi-axle trucks — all organized in a single unified booking center.
            </p>
          </div>

          {/* Quick Info Capsule */}
          <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
            <div className="px-3.5 py-2 rounded-2xl bg-white/70 border border-white/90 shadow-2xs text-right">
              <span className="text-[10px] font-mono font-bold text-[#5B6B86] uppercase block">
                Pending Requests
              </span>
              <span className="text-sm font-extrabold text-[#08193A] font-mono">
                {pendingCargoCount} Awaiting Admin
              </span>
            </div>
          </div>
        </div>

        {/* 3 Unified Segmented Pill Buttons */}
        <div className="p-1.5 rounded-2xl bg-[#08193A]/5 border border-black/5 flex flex-wrap gap-1.5">
          {/* Sub-tab 1: Cargo Booking */}
          <button
            onClick={() => setSubTab('CARGO')}
            className={`flex-1 min-w-[200px] px-4 py-3 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer ${
              subTab === 'CARGO'
                ? 'bg-[#08193A] text-white shadow-md ring-1 ring-white/20'
                : 'text-[#08193A]/80 hover:bg-white/60 hover:text-[#08193A]'
            }`}
          >
            <Building2 className={`w-4 h-4 ${subTab === 'CARGO' ? 'text-[#34D399]' : 'text-[#1B3A7A]'}`} />
            <div className="text-left">
              <span className="block leading-none">1. Cargo Capacity Booking</span>
              <span className={`text-[10px] font-medium leading-tight ${subTab === 'CARGO' ? 'text-[#A7F3D0]' : 'text-[#5B6B86]'}`}>
                Carrier Routes & Capacities
              </span>
            </div>
            {pendingCargoCount > 0 && (
              <span className="ml-auto px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500/25 text-amber-200 border border-amber-500/40">
                {pendingCargoCount}
              </span>
            )}
          </button>

          {/* Sub-tab 2: Haul Booking */}
          <button
            onClick={() => setSubTab('HAUL')}
            className={`flex-1 min-w-[200px] px-4 py-3 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer ${
              subTab === 'HAUL'
                ? 'bg-[#08193A] text-white shadow-md ring-1 ring-white/20'
                : 'text-[#08193A]/80 hover:bg-white/60 hover:text-[#08193A]'
            }`}
          >
            <MapPin className={`w-4 h-4 ${subTab === 'HAUL' ? 'text-[#34D399]' : 'text-[#1B3A7A]'}`} />
            <div className="text-left">
              <span className="block leading-none">2. Freight Haul Booking</span>
              <span className={`text-[10px] font-medium leading-tight ${subTab === 'HAUL' ? 'text-[#A7F3D0]' : 'text-[#5B6B86]'}`}>
                Instant Point-to-Point Haul
              </span>
            </div>
            <span className="ml-auto px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/40">
              FAST
            </span>
          </button>

          {/* Sub-tab 3: Fleet Booking */}
          <button
            onClick={() => setSubTab('FLEET')}
            className={`flex-1 min-w-[200px] px-4 py-3 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer ${
              subTab === 'FLEET'
                ? 'bg-[#08193A] text-white shadow-md ring-1 ring-white/20'
                : 'text-[#08193A]/80 hover:bg-white/60 hover:text-[#08193A]'
            }`}
          >
            <Truck className={`w-4 h-4 ${subTab === 'FLEET' ? 'text-[#34D399]' : 'text-[#1B3A7A]'}`} />
            <div className="text-left">
              <span className="block leading-none">3. Fleet / Truck Rental</span>
              <span className={`text-[10px] font-medium leading-tight ${subTab === 'FLEET' ? 'text-[#A7F3D0]' : 'text-[#5B6B86]'}`}>
                Commercial Rig Leases
              </span>
            </div>
            <span className="ml-auto px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {activeFleetOrdersCount} Leased
            </span>
          </button>
        </div>
      </div>

      {/* Dynamic View Display inside the Single Unified Tab */}
      <div className="transition-all duration-300">
        {subTab === 'CARGO' && (
          <CargoBookingsView
            consignments={consignments}
            onSelectConsignment={onSelectConsignment}
            onOpenNewBookingModal={onOpenNewBookingModal}
            onForceWeatherRefresh={onForceWeatherRefresh}
            isWeatherRefreshing={isWeatherRefreshing}
            onRerunRisk={onRerunRisk}
            onReassignCarrier={onReassignCarrier}
            userRole={userRole}
            onAcceptOrder={onAcceptOrder}
            onRejectOrder={onRejectOrder}
          />
        )}

        {subTab === 'HAUL' && (
          <CustomerBookShipmentView
            onInitiatePayment={onInitiatePayment}
            onBookingConfirmed={onBookingConfirmed}
          />
        )}

        {subTab === 'FLEET' && (
          <TruckMarketplaceView
            onInitiateCheckout={onInitiateCheckout}
            purchasedOrders={purchasedOrders}
            onViewPurchasedOrders={onViewPurchasedOrders}
            userRole={userRole}
          />
        )}
      </div>
    </div>
  );
};
