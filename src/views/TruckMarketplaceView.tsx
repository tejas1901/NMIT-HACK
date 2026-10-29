import React, { useState } from 'react';
import { 
  Truck, 
  Search, 
  ShieldCheck, 
  Zap, 
  Fuel, 
  Gauge, 
  Clock, 
  Check, 
  ShoppingBag, 
  Sparkles, 
  Star, 
  ArrowRight, 
  SlidersHorizontal,
  ChevronRight,
  Package,
  Layers,
  FileCheck
} from 'lucide-react';
import { TruckListing, PurchasedTruckOrder, CheckoutItem } from '../types';
import { TRUCK_CATALOG } from '../data/truckCatalogData';
import { formatInr } from '../lib/currency';

interface TruckMarketplaceViewProps {
  onInitiateCheckout: (item: CheckoutItem) => void;
  purchasedOrders: PurchasedTruckOrder[];
  onViewPurchasedOrders: () => void;
  userRole?: 'admin' | 'customer';
}

export const TruckMarketplaceView: React.FC<TruckMarketplaceViewProps> = ({
  onInitiateCheckout,
  purchasedOrders,
  onViewPurchasedOrders,
  userRole = 'customer'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [currency, setCurrency] = useState<'USD' | 'INR'>('INR');
  const [selectedTruckForDetails, setSelectedTruckForDetails] = useState<TruckListing | null>(null);

  const categories = ['All', 'Heavy Haul', 'Electric Semi', 'Cold-Chain Reefer', 'Urban Drayage', 'Intermodal Prime'];

  const filteredTrucks = TRUCK_CATALOG.filter((truck) => {
    const matchesCategory = selectedCategory === 'All' || truck.category === selectedCategory;
    const matchesSearch = 
      truck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      truck.powertrain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      truck.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      truck.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatPrice = (_usd: number, inr: number) => {
    return formatInr(inr);
  };

  const handleBuyTruck = (truck: TruckListing) => {
    onInitiateCheckout({
      type: 'TRUCK',
      title: `${truck.name} (${truck.rentalDuration || 'Commercial Rental'})`,
      subtitle: `${truck.category} • ₹${truck.dailyRateInr?.toLocaleString() || '5,500'}/day • ${truck.powertrain}`,
      referenceId: truck.id,
      priceUsd: truck.priceUsd,
      priceInr: truck.priceInr,
      metadata: {
        category: truck.category,
        rentalDuration: truck.rentalDuration || '7-Day Lease',
        dailyRateInr: truck.dailyRateInr || 5500,
        vinPrefix: truck.vinPrefix,
        payloadLbs: truck.payloadLbs,
        efficiency: truck.efficiency,
        deliveryTimeline: truck.deliveryTimeline
      }
    });
  };

  return (
    <div className="space-y-6 pb-16">
      {/* View Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#34D399]/20 text-[#08193A] border border-[#34D399]/40 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#34D399]" />
              <span>FREIGHTIQ FLEET RENTALS</span>
            </span>
            <span className="text-xs text-[#5B6B86] font-medium">• Commercial Class 8 Rigs</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#08193A] tracking-tight">
            Commercial Fleet Rental & Vehicle Leasing
          </h1>
          <p className="text-xs md:text-sm text-[#5B6B86] mt-1 max-w-3xl leading-relaxed">
            Rent factory-calibrated autonomous commercial trucks with pre-loaded QpiAI satellite telemetry, instant digital VIN allocation, and flexible commercial lease packages.
          </p>
        </div>

        {/* Currency Badge + View Orders Button */}
        <div className="flex items-center gap-3 shrink-0 self-start lg:self-auto flex-wrap">
          <div className="px-3 py-1.5 rounded-full bg-white/70 border border-white flex items-center gap-1.5 text-xs font-mono font-bold text-[#08193A] shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#34D399]" />
            <span>PRICING: INR (₹)</span>
          </div>

          <button
            onClick={onViewPurchasedOrders}
            className="px-4 py-2.5 rounded-full text-xs font-bold bg-white/80 hover:bg-white text-[#08193A] border border-white/90 shadow-xs liquid-btn flex items-center gap-2 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-[#34D399]" />
            <span>My Fleet Rentals</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#08193A] text-[#34D399] font-mono font-bold">
              {purchasedOrders.length}
            </span>
          </button>
        </div>
      </div>

      {/* Marketplace Bento Banner */}
      <div className="p-5 md:p-6 rounded-[28px] glass-panel-dark text-white relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[#34D399]/15 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-[#34D399]/20 text-[#6EE7B7] border border-[#34D399]/30">
                PROMOTION: COMMERCIAL CORRIDOR LEASE & RENTAL FLEET
              </span>
              <span className="text-xs text-white/60">Fully Serviced & Insured Rigs</span>
            </div>
            <h3 className="text-lg md:text-xl font-extrabold text-white tracking-tight">
              Direct-to-Corridor Rental Dispatch Within 24-48 Hours
            </h3>
            <p className="text-xs text-white/75 leading-relaxed">
              Every FreightIQ rental truck comes standard with certified Open-Meteo Highway Radar compatibility, QpiAI Autonomous Governor hardware, comprehensive insurance, and automatic Supabase cloud telemetry syncing.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 text-center">
              <p className="text-[10px] text-white/60 uppercase font-semibold">Available Rigs</p>
              <p className="text-xl font-mono font-extrabold text-[#34D399]">17 Units</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 text-center">
              <p className="text-[10px] text-white/60 uppercase font-semibold">Avg Dispatch</p>
              <p className="text-xl font-mono font-extrabold text-white">24 Hours</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Category Filter Chips */}
      <div className="p-4 rounded-[24px] glass-panel flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-[#5B6B86] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by truck model, horsepower, powertrain..."
            className="w-full pl-9 pr-4 py-2 rounded-full text-xs font-medium glass-input text-[#08193A] placeholder-[#5B6B86]/70"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full font-semibold transition-all shrink-0 liquid-btn cursor-pointer ${
                  isActive
                    ? 'bg-[#08193A] text-white shadow-xs'
                    : 'bg-white/60 text-[#5B6B86] hover:bg-white hover:text-[#08193A] border border-white/80'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTrucks.map((truck) => (
          <div
            key={truck.id}
            className="p-5 rounded-[30px] glass-panel hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4 border border-white/80 group"
          >
            {/* Top Bar: Badge & Stock */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#34D399]/20 text-[#08193A] border border-[#34D399]/40 shadow-2xs">
                  {truck.badge}
                </span>

                <span className="text-[11px] font-mono font-semibold text-[#5B6B86] flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${truck.inStock > 2 ? 'bg-[#34D399]' : 'bg-[#F59E5B]'}`} />
                  <span>{truck.inStock} in stock</span>
                </span>
              </div>

              {/* Truck Profile Image Stage */}
              <div 
                className="relative w-full rounded-2xl p-3 my-2 bg-gradient-to-b from-[#F4FAF8] to-white border border-white shadow-inner flex items-center justify-center overflow-hidden"
                style={{ aspectRatio: '16 / 9' }}
              >
                <img
                  src={truck.image}
                  alt={truck.name}
                  className="w-full h-full object-contain select-none group-hover:scale-105 transition-transform duration-500"
                  style={{ mixBlendMode: 'multiply' }}
                />
                <div className="absolute bottom-1 right-2 px-2 py-0.5 rounded-md bg-black/60 text-white font-mono text-[9px]">
                  {truck.deliveryTimeline}
                </div>
              </div>

              {/* Name & Tagline */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[#08193A] tracking-tight group-hover:text-[#1B3A7A] transition-colors">
                    {truck.name}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-amber-500 font-bold font-mono">
                    <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                    <span>{truck.rating}</span>
                  </div>
                </div>
                <p className="text-xs text-[#5B6B86] line-clamp-1">
                  {truck.tagline}
                </p>
              </div>

              {/* Specs Grid (4 Key Highlights) */}
              <div className="grid grid-cols-2 gap-2 my-3 text-xs">
                <div className="p-2.5 rounded-xl bg-white/70 border border-white/80">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[#5B6B86]">Payload Capacity</p>
                  <p className="font-mono font-bold text-[#08193A] mt-0.5">
                    {truck.payloadLbs.toLocaleString()} lbs
                  </p>
                  <p className="text-[9px] text-[#5B6B86] font-mono">({truck.payloadKg.toLocaleString()} kg)</p>
                </div>

                <div className="p-2.5 rounded-xl bg-white/70 border border-white/80">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[#5B6B86]">Powertrain & Power</p>
                  <p className="font-mono font-bold text-[#08193A] mt-0.5 truncate" title={truck.powertrain}>
                    {truck.horsepower} Horsepower
                  </p>
                  <p className="text-[9px] text-[#5B6B86] font-mono truncate">{truck.powertrain}</p>
                </div>

                <div className="p-2.5 rounded-xl bg-white/70 border border-white/80">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[#5B6B86]">Efficiency</p>
                  <p className="font-mono font-bold text-[#34D399] mt-0.5">
                    {truck.efficiency}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-white/70 border border-white/80">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[#5B6B86]">Max Range</p>
                  <p className="font-mono font-bold text-[#08193A] mt-0.5">
                    {truck.rangeKm.toLocaleString()} KM
                  </p>
                </div>
              </div>

              {/* Feature Highlights Pills */}
              <div className="space-y-1.5 pt-1">
                {truck.highlights.slice(0, 2).map((hl, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[11px] text-[#08193A]/85">
                    <Check className="w-3.5 h-3.5 text-[#34D399] shrink-0" />
                    <span className="truncate">{hl}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Bar: Price & Action */}
            <div className="pt-3 border-t border-black/5 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] text-[#5B6B86] uppercase font-semibold">Commercial Rental Rate</p>
                <div className="flex items-baseline gap-1.5">
                  <p className="text-xl font-extrabold font-mono text-[#08193A]">
                    {formatPrice(truck.priceUsd, truck.priceInr)}
                  </p>
                  <span className="text-[10px] font-mono text-[#5B6B86] font-medium">
                    / {truck.rentalDuration || 'period'}
                  </span>
                </div>
                {truck.dailyRateInr && (
                  <p className="text-[9px] font-mono text-[#059669] font-bold">
                    ≈ ₹{truck.dailyRateInr.toLocaleString('en-IN')}/day
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTruckForDetails(truck)}
                  className="p-2.5 rounded-full bg-white/80 hover:bg-white text-[#5B6B86] hover:text-[#08193A] border border-white shadow-xs liquid-btn cursor-pointer"
                  title="View Full Specifications"
                  aria-label="View Full Specifications"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleBuyTruck(truck)}
                  className="px-4 py-2.5 rounded-full text-xs font-bold bg-[#08193A] text-white hover:bg-[#1B3A7A] shadow-[0_4px_16px_rgba(8,25,58,0.22)] liquid-btn flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-[#34D399]" />
                  <span>Rent Rig</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Technical Datasheet Details Modal */}
      {selectedTruckForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg glass-panel-dark text-white rounded-[28px] p-6 shadow-2xl border border-white/20 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#34D399]/20 text-[#6EE7B7]">
                  {selectedTruckForDetails.category}
                </span>
                <h3 className="text-xl font-extrabold text-white mt-1">
                  {selectedTruckForDetails.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTruckForDetails(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-white/70">
              {selectedTruckForDetails.tagline}
            </p>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold uppercase tracking-wider text-[#A7F3D0] text-[11px]">Factory Specification Matrix:</h4>
              <div className="divide-y divide-white/10 text-[11px] font-mono">
                <div className="py-2 flex justify-between">
                  <span className="text-white/60">Powertrain:</span>
                  <span className="text-white text-right">{selectedTruckForDetails.powertrain}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-white/60">Rated Horsepower:</span>
                  <span className="text-[#34D399] font-bold">{selectedTruckForDetails.horsepower} HP</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-white/60">Maximum Gross Payload:</span>
                  <span className="text-white">{selectedTruckForDetails.payloadLbs.toLocaleString()} lbs ({selectedTruckForDetails.payloadKg.toLocaleString()} kg)</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-white/60">Fuel / Energy Efficiency:</span>
                  <span className="text-white">{selectedTruckForDetails.efficiency}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-white/60">Operational Range:</span>
                  <span className="text-white">{selectedTruckForDetails.rangeKm.toLocaleString()} KM</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-white/60">VIN Allocation Prefix:</span>
                  <span className="text-[#A7F3D0]">{selectedTruckForDetails.vinPrefix}••••••</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold uppercase tracking-wider text-[#A7F3D0] text-[11px]">Autonomous Equipment Included:</h4>
              <div className="space-y-1.5">
                {selectedTruckForDetails.highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-white/80">
                    <Check className="w-3.5 h-3.5 text-[#34D399] shrink-0" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] text-white/50 uppercase font-semibold">Total Cost</p>
                <p className="text-lg font-bold font-mono text-[#34D399]">
                  {formatPrice(selectedTruckForDetails.priceUsd, selectedTruckForDetails.priceInr)}
                </p>
              </div>

              <button
                onClick={() => {
                  const trk = selectedTruckForDetails;
                  setSelectedTruckForDetails(null);
                  handleBuyTruck(trk);
                }}
                className="px-6 py-2.5 rounded-full text-xs font-bold bg-[#34D399] text-[#08193A] hover:bg-[#6EE7B7] flex items-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Proceed to Checkout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
