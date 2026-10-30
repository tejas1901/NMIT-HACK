import React, { useState } from 'react';
import { 
  Navigation, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Wind, 
  CloudRain, 
  Sun, 
  Eye, 
  ShieldAlert, 
  Plus, 
  Sliders, 
  Activity, 
  Radio, 
  MapPin, 
  Layers, 
  Check, 
  ArrowRight,
  TrendingUp,
  X
} from 'lucide-react';
import { WaypointWeather, TelemetryUnit, BackhaulPairing, FreightException } from '../types';
import { TruckHeroCard } from '../components/TruckHeroCard';

interface CorridorSimulationProps {
  waypoints: WaypointWeather[];
  units: Record<string, TelemetryUnit>;
  backhauls: BackhaulPairing[];
  exceptions: FreightException[];
  onForceWeatherRefresh: () => void;
  isWeatherRefreshing: boolean;
  onPairBackhaul: (id: string) => void;
  onResolveException: (id: string) => void;
  onAddException: (exception: FreightException) => void;
  onOpenDriverChat: (unit: string) => void;
}

export const CorridorSimulationView: React.FC<CorridorSimulationProps> = ({
  waypoints,
  units,
  backhauls,
  exceptions,
  onForceWeatherRefresh,
  isWeatherRefreshing,
  onPairBackhaul,
  onResolveException,
  onAddException,
  onOpenDriverChat
}) => {
  // Selected Unit Telemetry Tab
  const [selectedUnitKey, setSelectedUnitKey] = useState<string>('Unit #4021');
  const activeUnit = units[selectedUnitKey] || units['Unit #4021'];

  // Simulator Sliders State
  const [severityIndex, setSeverityIndex] = useState<number>(3.5);
  const [crosswindVelocity, setCrosswindVelocity] = useState<number>(29);
  const [roadSlickness, setRoadSlickness] = useState<number>(15);

  // Live computed safe speed & platoon spacing formulas:
  // speed = round(max(30, 90 − 3·S − 0.3·W − 0.2·R)) => gives 68 at defaults
  const computedSafeSpeed = Math.round(
    Math.max(30, 90 - (3 * severityIndex) - (0.3 * crosswindVelocity) - (0.2 * roadSlickness))
  );
  // spacing = round(28 + 3·S + 0.35·W + 0.4·R) => gives 55 at defaults
  const computedPlatoonSpacing = Math.round(
    28 + (3 * severityIndex) + (0.35 * crosswindVelocity) + (0.4 * roadSlickness)
  );

  // Reroute dialog state
  const [rerouteConfirmOpen, setRerouteConfirmOpen] = useState(false);
  const [targetExceptionToReroute, setTargetExceptionToReroute] = useState<FreightException | null>(null);

  // Add Exception dialog state
  const [addExceptionOpen, setAddExceptionOpen] = useState(false);
  const [newExcUnit, setNewExcUnit] = useState('Unit #1052');
  const [newExcTitle, setNewExcTitle] = useState('NH-48 Pune Toll Congestion');
  const [newExcLocation, setNewExcLocation] = useState('KM 842 Toll Gate');
  const [newExcDelay, setNewExcDelay] = useState(1.5);
  const [newExcPenalty, setNewExcPenalty] = useState(5500);

  const getRiskEdgeClass = (risk: string) => {
    switch (risk) {
      case 'CRITICAL': return 'border-t-2 border-[#F26D6D]';
      case 'HIGH': return 'border-t-2 border-[#F59E5B]';
      case 'MODERATE': return 'border-t-2 border-[#F6C65B]';
      default: return 'border-t-2 border-[#34D399]';
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F26D6D]/15 text-[#F26D6D] border border-[#F26D6D]/30">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F59E5B]/15 text-[#F59E5B] border border-[#F59E5B]/30">HIGH</span>;
      case 'MODERATE':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F6C65B]/15 text-[#F6C65B] border border-[#F6C65B]/30">MODERATE</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/30">LOW</span>;
    }
  };

  const handleOpenReroute = (exc: FreightException) => {
    setTargetExceptionToReroute(exc);
    setRerouteConfirmOpen(true);
  };

  const handleConfirmReroute = () => {
    if (targetExceptionToReroute) {
      onResolveException(targetExceptionToReroute.id);
    }
    setRerouteConfirmOpen(false);
  };

  const handleCreateExceptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddException({
      id: `exc-${Date.now()}`,
      unit: newExcUnit,
      title: newExcTitle,
      location: newExcLocation,
      delayRiskHours: Number(newExcDelay),
      penaltyInr: Number(newExcPenalty),
      resolved: false
    });
    setAddExceptionOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#08193A] tracking-tight">
          Automated Route Weather Intelligence & Fleet Corridor Cockpit
        </h1>
        <p className="text-xs md:text-sm text-[#5B6B86] mt-1 max-w-4xl leading-relaxed">
          Live road waypoint weather forecasting via Open-Meteo API, autonomous risk mitigation across NH-44 & NH-48, empty trailer backhaul matching, and exception resolution.
        </p>
      </div>

      {/* Unit Selector Tabs for the Hero Cockpit */}
      <div className="flex items-center gap-2 p-1.5 rounded-full glass-panel w-fit shadow-xs border border-white">
        <span className="text-xs font-bold text-[#5B6B86] uppercase tracking-wider pl-3 pr-1">
          Active Fleet Unit:
        </span>
        {['Unit #4021', 'Unit #8809', 'Unit #1052'].map((key) => {
          const isActive = selectedUnitKey === key;
          return (
            <button
              key={key}
              onClick={() => setSelectedUnitKey(key)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all liquid-btn cursor-pointer ${
                isActive 
                  ? 'bg-[#08193A] text-white shadow-xs' 
                  : 'text-[#5B6B86] hover:text-[#08193A] hover:bg-white/60'
              }`}
            >
              {key}
            </button>
          );
        })}
      </div>

      {/* PART 1: REBUILT TRUCK HERO CARD (Unit #4021) */}
      <TruckHeroCard
        unit={activeUnit}
        onCallDriver={() => alert(`Dialing VoIP satellite bridge for ${activeUnit.unitNumber}...`)}
        onChatDriver={() => onOpenDriverChat(activeUnit.unitNumber)}
        liveCrosswindKmh={waypoints[2]?.windKmh || 26.6}
      />

      {/* B) AUTOMATED HIGHWAY ROUTE WEATHER FORECASTER & WAYPOINT RADAR */}
      <div className="p-5 md:p-6 rounded-[28px] glass-panel space-y-4 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-[#08193A]/10">
          <div>
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-[#1B3A7A]" />
              <h2 className="text-base md:text-lg font-bold text-[#08193A]">
                Automated Highway Route Weather Forecaster & Waypoint Radar
              </h2>
            </div>
            <p className="text-xs text-[#5B6B86] mt-0.5">
              Real-time road waypoint sampling along Indian Freight Corridors (NH-44 & NH-48) • Auto-refreshed every 30 mins
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/70 text-[#08193A] border border-white flex items-center gap-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#34D399] animate-mint-pulse" />
              Open-Meteo: LIVE/CONNECTED
            </span>
            <button
              onClick={onForceWeatherRefresh}
              disabled={isWeatherRefreshing}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#08193A] text-white hover:bg-[#1B3A7A] transition-all liquid-btn flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#34D399] ${isWeatherRefreshing ? 'animate-spin' : ''}`} />
              <span>{isWeatherRefreshing ? 'Querying API...' : 'Force Weather Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Horizontal Stepper of 5 Glass Cards with Moving Truck Marker & Pulsing Ring on MODERATE Waypoints */}
        <div className="relative pt-6 pb-2">
          {/* Connecting Line with Gradient */}
          <div className="absolute top-10 left-6 right-6 h-1 bg-gradient-to-r from-[#34D399] via-[#F6C65B] to-[#34D399] rounded-full z-0 opacity-40" />

          {/* Grid of 5 Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 relative z-10">
            {waypoints.map((wp, idx) => {
              const isMovingTruckHere = idx === 1; // Current moving truck position
              const isModerateHazard = wp.riskLevel === 'MODERATE';

              return (
                <div
                  key={wp.id}
                  className={`p-3.5 rounded-[22px] bg-white/75 border border-white/95 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-3 relative overflow-hidden group ${getRiskEdgeClass(wp.riskLevel)}`}
                >
                  {/* Pulsing ring on MODERATE waypoints */}
                  {isModerateHazard && (
                    <div className="absolute -top-6 -right-6 w-14 h-14 rounded-full bg-[#F6C65B]/20 animate-ping pointer-events-none" />
                  )}

                  <div>
                    {/* Header: Stage + Risk Badge (SEPARATED CAPSULES - fixes ORIGINLOW bug) */}
                    <div className="flex items-center justify-between pb-2 border-b border-black/5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5B6B86]">
                        {wp.stage}
                      </span>
                      {getRiskBadge(wp.riskLevel)}
                    </div>

                    {/* Location & Moving truck indicator */}
                    <div className="mt-2 flex items-start justify-between gap-1">
                      <h4 className="text-xs font-bold text-[#08193A] leading-snug">
                        {wp.locationName}
                      </h4>
                      {isMovingTruckHere && (
                        <span 
                          title="Current fleet convoy location"
                          className="px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#08193A] text-white flex items-center gap-1 shrink-0 animate-bounce"
                        >
                          Convoy #4021
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-medium text-[#1B3A7A] mt-1">
                      {wp.condition.includes('Drizzle') || wp.condition.includes('Rain') ? (
                        <CloudRain className="w-3.5 h-3.5 text-[#F59E5B]" />
                      ) : (
                        <Sun className="w-3.5 h-3.5 text-[#F6C65B]" />
                      )}
                      <span>{wp.condition}</span>
                    </div>
                  </div>

                  {/* Telemetry metrics strip */}
                  <div className="space-y-1 pt-2 border-t border-black/5 text-[11px] font-mono">
                    <div className="flex items-center justify-between text-[#5B6B86]">
                      <span>Temp / Precip:</span>
                      <span className="font-semibold text-[#08193A]">{wp.tempC}°C, {wp.precipMm} mm</span>
                    </div>
                    <div className="flex items-center justify-between text-[#5B6B86]">
                      <span>Wind / Vis:</span>
                      <span className="font-semibold text-[#08193A]">{wp.windKmh} km/h, {wp.visKm} km</span>
                    </div>
                    <div className="flex items-center justify-between text-[#5B6B86] pt-1 border-t border-black/5">
                      <span className="text-[10px] uppercase font-bold">Corridor Mark:</span>
                      <span className="font-bold text-[#1B3A7A]">{wp.distanceKm} km</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stylized Route Map Under Stepper (Reference A style) */}
        <div className="p-3.5 rounded-[22px] bg-white/55 border border-white/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#1B3A7A]/10 flex items-center justify-center text-[#1B3A7A] shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#08193A]">NH-48 Golden Quadrilateral Freight Line (980 KM)</p>
              <p className="text-[11px] text-[#5B6B86]">Bengaluru Logistics Park → Tumakuru → Hubballi → Belagavi → Pune → Khandala → Mumbai JNPT</p>
            </div>
          </div>

          {/* Stylized polyline route SVG */}
          <div className="flex items-center gap-2">
            <svg className="w-44 md:w-56 h-8 stroke-[#34D399] fill-none" viewBox="0 0 200 30">
              <path d="M 10 22 C 40 10, 80 26, 120 12 S 170 18, 190 8" strokeWidth="3" strokeLinecap="round" />
              {/* Waypoint markers */}
              <circle cx="10" cy="22" r="4" fill="#08193A" stroke="#34D399" strokeWidth="2" />
              <circle cx="85" cy="20" r="4" fill="#34D399" stroke="#08193A" strokeWidth="2" className="animate-ping" />
              <circle cx="85" cy="20" r="4" fill="#34D399" stroke="#08193A" strokeWidth="2" />
              <circle cx="130" cy="14" r="3.5" fill="#F6C65B" />
              <circle cx="150" cy="16" r="3.5" fill="#F6C65B" />
              <circle cx="190" cy="8" r="4" fill="#08193A" stroke="#34D399" strokeWidth="2" />
            </svg>
            <span className="text-[10px] font-mono font-bold text-[#34D399] whitespace-nowrap">
              Convoy at KM 410
            </span>
          </div>
        </div>
      </div>

      {/* C) RISK SUMMARY GLASS BANNER */}
      <div className="p-4 md:p-5 rounded-[26px] glass-panel border border-[#F6C65B]/40 space-y-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#F6C65B]/20 text-[#B45309] border border-[#F6C65B]/50 w-fit">
            MODERATE ROUTE RISK DETECTED
          </span>
          <span className="text-[11px] text-[#5B6B86] font-medium self-end md:self-auto">
            Attribution: Weather data by Open-Meteo.com
          </span>
        </div>
        <p className="text-xs md:text-sm text-[#08193A] font-semibold leading-relaxed">
          Triggering Hazard: Elevated crosswinds of 30.2 km/h and light moisture detected across Pune Chakan and Khandala Ghat. Recommended Governor Speed: 55 km/h. Platoon spacing maintained at 55 meters.
        </p>
        <p className="italic text-[11px] text-[#5B6B86]">
          Automated weather risk indicates potential environmental hazard exposure along road corridors, not a confirmed delivery delay.
        </p>
      </div>

      {/* D) TWO CARDS SIDE BY SIDE: Live Simulator & Fleet Cockpit Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Card 1: Live Weather Risk Simulator with glass-lens sliders */}
        <div className="p-5 md:p-6 rounded-[28px] glass-panel space-y-4 flex flex-col justify-between hover:shadow-lg transition-all min-w-0">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#08193A]">
                Live Weather Risk Simulator
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/70 text-[#08193A] border border-white">
                Autonomous Governor
              </span>
            </div>
            <p className="text-xs text-[#5B6B86] mt-0.5">
              Dynamically computes safe governor velocity & platoon spacing based on road conditions.
            </p>
          </div>

          {/* Sliders with glass-lens thumbs */}
          <div className="space-y-4 pt-1">
            {/* Slider 1: Severity Index */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#08193A]">
                  Severity Index: {severityIndex.toFixed(1)} / 10
                </span>
                <span className="text-[11px] font-mono text-[#5B6B86]">Impact Scale</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={severityIndex}
                onChange={(e) => setSeverityIndex(Number(e.target.value))}
                className="w-full glass-slider"
              />
            </div>

            {/* Slider 2: Crosswind Velocity */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#08193A]">
                  Crosswind Velocity: {crosswindVelocity} km/h
                </span>
                <span className="text-[11px] font-mono text-[#5B6B86]">0 - 80 km/h</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                step="1"
                value={crosswindVelocity}
                onChange={(e) => setCrosswindVelocity(Number(e.target.value))}
                className="w-full glass-slider"
              />
            </div>

            {/* Slider 3: Monsoon Rainfall / Road Slickness */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#08193A]">
                  Monsoon Rainfall / Road Slickness: {roadSlickness}%
                </span>
                <span className="text-[11px] font-mono text-[#5B6B86]">0 - 100%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={roadSlickness}
                onChange={(e) => setRoadSlickness(Number(e.target.value))}
                className="w-full glass-slider"
              />
            </div>
          </div>

          {/* Computed Live Output Panel with dynamic gauge */}
          <div className="p-4 rounded-[22px] bg-gradient-to-br from-white/80 to-white/50 border border-white/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5B6B86]">
                Computed Governor Constraints
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                computedSafeSpeed > 60 ? 'bg-[#34D399]/20 text-[#08193A]' : computedSafeSpeed > 45 ? 'bg-[#F6C65B]/25 text-[#B45309]' : 'bg-[#F26D6D]/20 text-[#F26D6D]'
              }`}>
                {computedSafeSpeed > 60 ? 'Optimal Trajectory' : computedSafeSpeed > 45 ? 'Capped Corridor' : 'Severe Weather Protocol'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-[16px] bg-[#08193A] text-white">
                <p className="text-[10px] uppercase font-bold text-white/60">Safe Governor Speed</p>
                <p className="text-2xl font-extrabold font-mono text-[#34D399] mt-0.5">
                  {computedSafeSpeed} km/h
                </p>
              </div>

              <div className="p-3 rounded-[16px] bg-white/80 border border-white">
                <p className="text-[10px] uppercase font-bold text-[#5B6B86]">Platoon Spacing</p>
                <p className="text-2xl font-extrabold font-mono text-[#08193A] mt-0.5">
                  {computedPlatoonSpacing} Meters
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Fleet Unit Cockpit Telemetry with segmented tabs */}
        <div className="p-5 md:p-6 rounded-[28px] glass-panel space-y-4 flex flex-col justify-between hover:shadow-lg transition-all min-w-0">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-base font-bold text-[#08193A] uppercase tracking-wide">
                {activeUnit.unitNumber} – TELEMETRY COCKPIT
              </h3>
              
              {/* Segmented Unit Tabs */}
              <div className="flex items-center gap-1 p-1 rounded-full bg-white/60 border border-white text-xs font-bold">
                {['Unit #4021', 'Unit #8809', 'Unit #1052'].map((key) => {
                  const isActive = selectedUnitKey === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedUnitKey(key)}
                      className={`px-3 py-1 rounded-full transition-all liquid-btn cursor-pointer ${
                        isActive ? 'bg-[#08193A] text-white shadow-xs' : 'text-[#5B6B86] hover:text-[#08193A]'
                      }`}
                    >
                      {key}
                    </button>
                  );
                })}
              </div>
            </div>
            <p className="text-xs text-[#5B6B86] mt-1 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-[#34D399] animate-pulse" />
              <span>Transmitting via QpiAI Satellite Link | {activeUnit.signalStrength}</span>
            </p>
          </div>

          {/* Three Telemetry Tiles */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3.5 rounded-[18px] bg-white/70 border border-white/90 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#5B6B86]">Speed</p>
              <p className="text-xl md:text-2xl font-extrabold font-mono text-[#08193A] mt-1">
                {activeUnit.speedKmh} <span className="text-xs font-normal">km/h</span>
              </p>
            </div>
            <div className="p-3.5 rounded-[18px] bg-white/70 border border-white/90 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#5B6B86]">Weight</p>
              <p className="text-xl md:text-2xl font-extrabold font-mono text-[#08193A] mt-1">
                {activeUnit.weightKg.toLocaleString()} <span className="text-xs font-normal">KG</span>
              </p>
            </div>
            <div className="p-3.5 rounded-[18px] bg-white/70 border border-white/90 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#5B6B86]">Efficiency</p>
              <p className="text-xl md:text-2xl font-extrabold font-mono text-[#08193A] mt-1">
                {activeUnit.efficiencyKmL} <span className="text-xs font-normal">KM/L</span>
              </p>
            </div>
          </div>

          {/* Route path */}
          <div className="p-3 rounded-2xl bg-white/60 border border-white/80 text-xs">
            <span className="font-bold text-[#5B6B86] uppercase text-[10px] tracking-wider block">Assigned Corridor:</span>
            <span className="font-semibold text-[#08193A] mt-0.5 block">{activeUnit.route}</span>
          </div>

          {/* Mint-tinted glass note */}
          <div className="p-3.5 rounded-[20px] bg-[#A7F3D0]/30 border border-[#34D399]/40 space-y-1">
            <p className="text-xs font-bold text-[#08193A] flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#08193A]" />
              <span>QpiAI Routing Note:</span>
            </p>
            <p className="text-xs text-[#08193A]/85 leading-relaxed font-medium">
              {activeUnit.routingNote}
            </p>
          </div>
        </div>
      </div>

      {/* E) TWO CARDS SIDE BY SIDE: Backhaul Engine & Freight Exception Resolution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Card 1: Empty Trailer Backhaul Matching Engine */}
        <div className="p-5 md:p-6 rounded-[28px] glass-panel space-y-4 flex flex-col justify-between hover:shadow-lg transition-all min-w-0">
          <div>
            <h3 className="text-base font-bold text-[#08193A]">
              Empty Trailer Backhaul Matching Engine
            </h3>
            <p className="text-xs text-[#5B6B86] mt-0.5">
              Pairs returning empty trailers with spot-freight cargo to eliminate deadhead kilometers.
            </p>
          </div>

          <div className="space-y-2.5">
            {backhauls.map((bh) => (
              <div
                key={bh.id}
                className="p-3.5 rounded-[20px] bg-white/70 border border-white/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/85 transition-all"
              >
                <div className="space-y-1 min-w-0">
                  <p className="text-xs font-bold text-[#08193A] truncate">{bh.route}</p>
                  <p className="text-[11px] text-[#5B6B86]">{bh.cargoType}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  <span className="font-mono font-bold text-xs text-[#34D399]">
                    +₹{bh.netInr.toLocaleString('en-IN')} Net
                  </span>

                  {bh.paired ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#34D399]/20 text-[#08193A] border border-[#34D399]/40 flex items-center gap-1 shadow-2xs">
                      <Check className="w-3.5 h-3.5 text-[#08193A]" />
                      <span>✓ Paired</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => onPairBackhaul(bh.id)}
                      className="px-3.5 py-1 rounded-full text-xs font-bold bg-[#08193A] text-white hover:bg-[#1B3A7A] transition-all liquid-btn shadow-xs cursor-pointer"
                    >
                      Pair Cargo
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-[#5B6B86] italic">
            Automated backhaul matches generate immediate deadhead elimination yields in INR.
          </p>
        </div>

        {/* Card 2: Active Freight Exception Resolution */}
        <div className="p-5 md:p-6 rounded-[28px] glass-panel space-y-4 flex flex-col justify-between hover:shadow-lg transition-all min-w-0">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#08193A]">
                Active Freight Exception Resolution
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F59E5B]/20 text-[#F59E5B] border border-[#F59E5B]/40">
                Live Dispatch
              </span>
            </div>
            <p className="text-xs text-[#5B6B86] mt-0.5">
              Algorithmic rerouting and automated dispatcher authorization.
            </p>
          </div>

          <div className="space-y-2.5">
            {exceptions.map((exc) => (
              <div
                key={exc.id}
                className="p-3.5 rounded-[20px] bg-white/70 border border-white/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/85 transition-all"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#08193A]">{exc.unit}:</span>
                    <span className="text-xs font-bold text-[#08193A] truncate">{exc.title}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[#5B6B86]">
                    <span>Location: {exc.location}</span>
                    <span>•</span>
                    <span className="text-[#F26D6D] font-medium font-mono">
                      +{exc.delayRiskHours} hr delay risk (₹{exc.penaltyInr.toLocaleString('en-IN')} penalty)
                    </span>
                  </div>
                </div>

                <div className="shrink-0 self-end sm:self-auto">
                  {exc.resolved ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-[#34D399] border border-[#34D399]/40 flex items-center gap-1 shadow-2xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>✓ Resolved</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleOpenReroute(exc)}
                      className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#F59E5B] text-white hover:bg-[#EA580C] transition-all liquid-btn shadow-xs cursor-pointer"
                    >
                      Authorize AI Reroute
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Dashed "+ Add exception" glass tile */}
            <button
              onClick={() => setAddExceptionOpen(true)}
              className="w-full py-3 rounded-[20px] border-2 border-dashed border-[#08193A]/20 hover:border-[#08193A]/50 bg-white/30 hover:bg-white/60 text-xs font-bold text-[#08193A] flex items-center justify-center gap-2 transition-all liquid-btn cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#1B3A7A]" />
              <span>+ Add Exception</span>
            </button>
          </div>

          <p className="text-[11px] text-[#5B6B86] italic">
            Automated dispatcher override recalculates quantum Hamiltonian SLA thresholds.
          </p>
        </div>
      </div>

      {/* Confirmation Dialog for AI Rerouting */}
      {rerouteConfirmOpen && targetExceptionToReroute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md glass-panel rounded-[26px] p-6 shadow-xl border border-white/90 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#08193A]/10">
              <h4 className="text-base font-bold text-[#08193A]">
                Authorize AI Reroute Protocol
              </h4>
              <button onClick={() => setRerouteConfirmOpen(false)} className="text-[#5B6B86] hover:text-[#08193A]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-[#08193A]/85">
              <p>
                <strong>Target Unit:</strong> {targetExceptionToReroute.unit} ({targetExceptionToReroute.title})
              </p>
              <div className="p-3 rounded-2xl bg-white/70 border border-white/90 space-y-1.5">
                <p className="font-bold text-[#1B3A7A]">Algorithmic Bypass Proposed:</p>
                <p className="text-[#5B6B86]">
                  {targetExceptionToReroute.reroutePlan?.bypassRoute || 'Automated express bypass corridor routing'}
                </p>
                <div className="pt-1 flex items-center justify-between font-mono text-xs">
                  <span className="text-[#34D399] font-bold">
                    Recovery: -{targetExceptionToReroute.reroutePlan?.timeRecoveryHours || 1.8} hrs
                  </span>
                  <span className="text-[#34D399] font-bold">
                    Penalty Saved: ₹{(targetExceptionToReroute.reroutePlan?.savingsInr || 6200).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#08193A]/10">
              <button
                onClick={() => setRerouteConfirmOpen(false)}
                className="px-4 py-1.5 rounded-full text-xs font-bold text-[#5B6B86] hover:bg-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReroute}
                className="px-5 py-2 rounded-full text-xs font-bold bg-[#08193A] text-white hover:bg-[#1B3A7A] transition-all shadow-xs"
              >
                Confirm & Dispatch Reroute
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Adding Custom Exception */}
      {addExceptionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md glass-panel rounded-[26px] p-6 shadow-xl border border-white/90 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#08193A]/10">
              <h4 className="text-base font-bold text-[#08193A]">
                Log New Freight Exception
              </h4>
              <button onClick={() => setAddExceptionOpen(false)} className="text-[#5B6B86] hover:text-[#08193A]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateExceptionSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase text-[#5B6B86] mb-1">Unit</label>
                <select
                  value={newExcUnit}
                  onChange={(e) => setNewExcUnit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-[#08193A] font-semibold"
                >
                  <option value="Unit #4021">Unit #4021</option>
                  <option value="Unit #8809">Unit #8809</option>
                  <option value="Unit #1052">Unit #1052</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#5B6B86] mb-1">Exception Title</label>
                <input
                  type="text"
                  value={newExcTitle}
                  onChange={(e) => setNewExcTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl glass-input text-[#08193A]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#5B6B86] mb-1">Corridor Location</label>
                <input
                  type="text"
                  value={newExcLocation}
                  onChange={(e) => setNewExcLocation(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl glass-input text-[#08193A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#5B6B86] mb-1">Delay (Hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newExcDelay}
                    onChange={(e) => setNewExcDelay(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl glass-input font-mono text-[#08193A]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#5B6B86] mb-1">Penalty (₹)</label>
                  <input
                    type="number"
                    value={newExcPenalty}
                    onChange={(e) => setNewExcPenalty(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl glass-input font-mono text-[#08193A]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#08193A]/10">
                <button
                  type="button"
                  onClick={() => setAddExceptionOpen(false)}
                  className="px-4 py-1.5 rounded-full text-xs font-bold text-[#5B6B86] hover:bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full text-xs font-bold bg-[#08193A] text-white hover:bg-[#1B3A7A] transition-all shadow-xs"
                >
                  Save Exception
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
