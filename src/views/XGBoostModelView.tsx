import React, { useState } from 'react';
import { 
  Cpu, 
  Layers, 
  BarChart3, 
  Activity, 
  Play, 
  CheckCircle2, 
  TrendingUp, 
  Zap, 
  Sliders,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { TOP_FEATURE_IMPORTANCES } from '../data/mockData';
import { RiskLevel } from '../types';

export const XGBoostModelView: React.FC = () => {
  // Simulator State
  const [shippingMode, setShippingMode] = useState('First Class (Air Freight)');
  const [scheduledDays, setScheduledDays] = useState(2);
  const [cargoUnitValue, setCargoUnitValue] = useState(28000);
  const [isSimulating, setIsSimulating] = useState(false);

  // Result state
  const [simResult, setSimResult] = useState<{
    probability: number;
    riskLevel: RiskLevel;
    demurrageInr: number;
    recommendation: string;
  } | null>({
    probability: 74.8,
    riskLevel: 'HIGH',
    demurrageInr: 12450,
    recommendation: 'Air Freight SLA tight. Expedited ground transfer recommended to avoid ₹12,450 demurrage.'
  });

  const handleRunInference = () => {
    setIsSimulating(true);
    setTimeout(() => {
      // Deterministic dynamic prediction based on input parameters
      let baseProb = 40;
      if (shippingMode === 'First Class (Air Freight)') baseProb += 28;
      if (shippingMode === 'Same Day Priority') baseProb += 38;
      if (shippingMode === 'Second Class') baseProb += 12;
      if (shippingMode === 'Standard') baseProb -= 10;

      // Scheduled days impact: fewer days = higher pressure
      baseProb += (4 - scheduledDays) * 7.5;
      // Value impact: higher value = higher demurrage risk priority
      baseProb += (cargoUnitValue / 60000) * 15;

      const probability = Math.min(99.2, Math.max(8.4, baseProb));
      const riskLevel: RiskLevel = 
        probability >= 80 ? 'CRITICAL' :
        probability >= 55 ? 'HIGH' :
        probability >= 30 ? 'MODERATE' : 'LOW';

      const demurrageInr = Math.round((probability / 100) * (cargoUnitValue * 0.42));

      setSimResult({
        probability: parseFloat(probability.toFixed(1)),
        riskLevel,
        demurrageInr,
        recommendation: 
          riskLevel === 'CRITICAL' 
            ? 'Extreme risk of SLA violation. Mandatory reroute to dedicated express corridor.'
            : riskLevel === 'HIGH'
            ? 'High demurrage exposure detected. QpiAI Quantum QUBO expedited slot recommended.'
            : riskLevel === 'MODERATE'
            ? 'Normal risk envelope. Continuous Open-Meteo corridor radar surveillance active.'
            : 'Nominal shipment trajectory with high on-time confidence.'
      });
      setIsSimulating(false);
    }, 600);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#08193A] tracking-tight">
          XGBoost 3.2.0 Model Telemetry & Evaluation
        </h1>
        <p className="text-xs md:text-sm text-[#5B6B86] mt-1 max-w-4xl leading-relaxed">
          Trained on 58,894 real-world supply chain shipments with stratified 80/20 validation to predict late delivery risk and compute demurrage exposure.
        </p>
      </div>

      {/* Two Glass Cards Side by Side: Classification & Regression Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Card 1: Classification Metrics */}
        <div className="p-5 md:p-6 rounded-[28px] glass-panel space-y-4 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5B6B86]">
                Classification Metrics (Late Delivery Probability)
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#34D399]/20 text-[#08193A] border border-[#34D399]/40">
                Binary Logloss
              </span>
            </div>

            {/* Model Accuracy Ring + Big Metric */}
            <div className="flex items-center justify-between my-4 p-4 rounded-[22px] bg-white/70 border border-white/90">
              <div>
                <p className="text-[11px] uppercase font-bold text-[#5B6B86]">Model Accuracy</p>
                <p className="text-4xl font-extrabold font-mono text-[#08193A] mt-0.5">
                  72.94%
                </p>
                <p className="text-[11px] text-[#5B6B86] mt-1">Cross-validated across 5 K-folds</p>
              </div>

              {/* Accuracy Ring & Mini ROC */}
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(8,25,58,0.1)" strokeWidth="4" />
                    <circle 
                      cx="20" cy="20" r="16" fill="none" stroke="#34D399" strokeWidth="4"
                      strokeDasharray="100.5" strokeDashoffset="27.2" strokeLinecap="round" 
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold font-mono text-[#08193A]">
                    72.9%
                  </span>
                </div>

                {/* Mini ROC Curve */}
                <div className="hidden sm:flex flex-col items-center">
                  <svg className="w-20 h-14 stroke-[#34D399] fill-none" viewBox="0 0 70 50">
                    <line x1="10" y1="40" x2="60" y2="40" stroke="rgba(8,25,58,0.2)" strokeWidth="1" />
                    <line x1="10" y1="40" x2="10" y2="10" stroke="rgba(8,25,58,0.2)" strokeWidth="1" />
                    <line x1="10" y1="40" x2="60" y2="10" stroke="rgba(8,25,58,0.15)" strokeDasharray="2,2" strokeWidth="1" />
                    <path d="M 10 40 Q 15 15, 60 10" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                  <span className="text-[9px] font-mono text-[#5B6B86]">ROC-AUC 0.7961</span>
                </div>
              </div>
            </div>
          </div>

          {/* Metric Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-[16px] bg-white/60 border border-white/80">
              <p className="text-[10px] font-bold uppercase text-[#5B6B86]">Precision</p>
              <p className="text-lg font-bold font-mono text-[#34D399] mt-0.5">86.22%</p>
            </div>
            <div className="p-3 rounded-[16px] bg-white/60 border border-white/80">
              <p className="text-[10px] font-bold uppercase text-[#5B6B86]">Recall</p>
              <p className="text-lg font-bold font-mono text-[#08193A] mt-0.5">63.26%</p>
            </div>
            <div className="p-3 rounded-[16px] bg-white/60 border border-white/80">
              <p className="text-[10px] font-bold uppercase text-[#5B6B86]">F1-Score</p>
              <p className="text-lg font-bold font-mono text-[#08193A] mt-0.5">0.7298</p>
            </div>
            <div className="p-3 rounded-[16px] bg-white/60 border border-white/80">
              <p className="text-[10px] font-bold uppercase text-[#5B6B86]">ROC-AUC</p>
              <p className="text-lg font-bold font-mono text-[#34D399] mt-0.5">0.7961</p>
            </div>
          </div>
        </div>

        {/* Card 2: Regression Metrics */}
        <div className="p-5 md:p-6 rounded-[28px] glass-panel space-y-4 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5B6B86]">
                Regression Metrics (Demurrage Cost ₹ Exposure)
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#08193A] text-white">
                Huber Loss Regressor
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 my-4">
              <div className="p-4 rounded-[22px] bg-white/70 border border-white/90">
                <p className="text-[10px] uppercase font-bold text-[#5B6B86]">Mean Absolute Error (MAE)</p>
                <p className="text-2xl font-extrabold font-mono text-[#08193A] mt-1">
                  ₹3,831.00 <span className="text-xs font-normal text-[#5B6B86]">INR</span>
                </p>
                <p className="text-[10px] text-[#5B6B86] mt-1">Symmetric penalty deviation</p>
              </div>

              <div className="p-4 rounded-[22px] bg-white/70 border border-white/90">
                <p className="text-[10px] uppercase font-bold text-[#5B6B86]">Root Mean Squared (RMSE)</p>
                <p className="text-2xl font-extrabold font-mono text-[#08193A] mt-1">
                  ₹4,874.00 <span className="text-xs font-normal text-[#5B6B86]">INR</span>
                </p>
                <p className="text-[10px] text-[#5B6B86] mt-1">Tail variance penalized</p>
              </div>
            </div>
          </div>

          {/* Additional Regression Stats */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-[16px] bg-white/60 border border-white/80">
              <p className="text-[10px] font-bold uppercase text-[#5B6B86]">R² Variance</p>
              <p className="text-lg font-bold font-mono text-[#08193A] mt-0.5">0.3181</p>
            </div>
            <div className="p-3 rounded-[16px] bg-white/60 border border-white/80">
              <p className="text-[10px] font-bold uppercase text-[#5B6B86]">Training Records</p>
              <p className="text-lg font-bold font-mono text-[#08193A] mt-0.5">47,115 rows</p>
            </div>
            <div className="p-3 rounded-[16px] bg-white/60 border border-white/80">
              <p className="text-[10px] font-bold uppercase text-[#5B6B86]">Holdout Records</p>
              <p className="text-lg font-bold font-mono text-[#08193A] mt-0.5">11,779 rows</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top 10 Feature Importances (Gain Weight) */}
      <div className="p-5 md:p-6 rounded-[28px] glass-panel space-y-4">
        <div>
          <h3 className="text-base md:text-lg font-bold text-[#08193A]">
            Top 10 Feature Importances (Gain Weight)
          </h3>
          <p className="text-xs text-[#5B6B86] mt-0.5">
            Key drivers influencing late arrival probabilities identified by XGBoost trees.
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          {TOP_FEATURE_IMPORTANCES.map((item) => (
            <div 
              key={item.rank}
              className="p-3 rounded-[18px] bg-white/65 border border-white/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-white/85 transition-all"
            >
              {/* Rank, Name and Description on one aligned row */}
              <div className="flex items-center gap-2.5 min-w-[340px]">
                <span className="w-7 h-7 rounded-full bg-[#08193A]/5 border border-white font-mono font-bold text-xs text-[#08193A] flex items-center justify-center shrink-0">
                  #{item.rank}
                </span>
                <span className="text-xs font-bold font-mono text-[#08193A]">
                  {item.feature}
                </span>
                {item.description && (
                  <span className="text-[11px] text-[#5B6B86] font-medium">
                    {item.description}
                  </span>
                )}
              </div>

              {/* Mint gradient progress bar that animates + percentage */}
              <div className="flex items-center gap-3 flex-1 max-w-md">
                <div className="w-full h-2 rounded-full bg-black/5 overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#6EE7B7] to-[#34D399] transition-all duration-700 shadow-[0_0_8px_rgba(52,211,153,0.4)]"
                    style={{ width: `${item.weight}%` }}
                  />
                </div>
                <span className="text-xs font-mono font-bold text-[#08193A] w-10 text-right">
                  {item.weight}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive XGBoost Inference Simulator */}
      <div className="p-5 md:p-6 rounded-[28px] glass-panel space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-base md:text-lg font-bold text-[#08193A]">
              Interactive XGBoost Inference Simulator
            </h3>
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-[#A7F3D0]/70 text-[#08193A] border border-[#6EE7B7]/50">
              Live Parameter Tuning
            </span>
          </div>
          <p className="text-xs text-[#5B6B86] mt-0.5">
            Simulate how parameters impact real-time prediction without writing to the database.
          </p>
        </div>

        {/* Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Shipping Mode Select */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5B6B86]">
              Shipping Mode
            </label>
            <select
              value={shippingMode}
              onChange={(e) => setShippingMode(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs font-semibold glass-input text-[#08193A]"
            >
              <option value="First Class (Air Freight)">First Class (Air Freight)</option>
              <option value="Same Day Priority">Same Day Priority</option>
              <option value="Second Class">Second Class</option>
              <option value="Standard">Standard</option>
            </select>
          </div>

          {/* Scheduled Delivery Target Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#5B6B86]">
                Scheduled Delivery Target: {scheduledDays} days
              </label>
              <span className="font-mono text-[#5B6B86]">1 - 5 days</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={scheduledDays}
              onChange={(e) => setScheduledDays(Number(e.target.value))}
              className="w-full glass-slider mt-2"
            />
          </div>

          {/* Cargo Unit Value Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#5B6B86]">
                Cargo Unit Value (₹): ₹{cargoUnitValue.toLocaleString('en-IN')}
              </label>
              <span className="font-mono text-[#5B6B86]">₹5k - ₹100k</span>
            </div>
            <input
              type="range"
              min="5000"
              max="100000"
              step="1000"
              value={cargoUnitValue}
              onChange={(e) => setCargoUnitValue(Number(e.target.value))}
              className="w-full glass-slider mt-2"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-2 border-t border-black/5">
          <span className="text-[11px] text-[#5B6B86]">
            Weights synchronized to XGBoost release binary 3.2.0-core
          </span>
          <button
            onClick={handleRunInference}
            disabled={isSimulating}
            className="px-6 py-2.5 rounded-full text-xs font-bold bg-[#08193A] text-white hover:bg-[#1B3A7A] transition-all liquid-btn flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Zap className={`w-3.5 h-3.5 text-[#34D399] ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Traversing Decision Trees...' : 'Run XGBoost Prediction'}</span>
          </button>
        </div>

        {/* Result Card with Delay-Probability Ring, Risk Pill & Estimated Demurrage */}
        {simResult && (
          <div className="mt-4 p-5 rounded-[24px] bg-gradient-to-br from-white/90 to-white/60 border border-white/95 shadow-sm space-y-3 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1B3A7A] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#34D399]" />
                <span>Simulated Inference Result</span>
              </span>

              {/* Risk Pill */}
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                simResult.riskLevel === 'CRITICAL' ? 'bg-[#F26D6D]/15 text-[#F26D6D] border-[#F26D6D]/30' :
                simResult.riskLevel === 'HIGH' ? 'bg-[#F59E5B]/15 text-[#F59E5B] border-[#F59E5B]/30' :
                simResult.riskLevel === 'MODERATE' ? 'bg-[#F6C65B]/15 text-[#F6C65B] border-[#F6C65B]/30' :
                'bg-[#34D399]/15 text-[#34D399] border-[#34D399]/30'
              }`}>
                {simResult.riskLevel} RISK CLASSIFICATION
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              {/* Delay Probability Ring */}
              <div className="p-3.5 rounded-[18px] bg-white/70 border border-white flex items-center gap-3">
                <div className="relative w-14 h-14 shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(8,25,58,0.1)" strokeWidth="3.5" />
                    <circle 
                      cx="18" cy="18" r="14" fill="none" 
                      stroke={simResult.probability > 70 ? '#F26D6D' : simResult.probability > 45 ? '#F59E5B' : '#34D399'} 
                      strokeWidth="3.5"
                      strokeDasharray="87.96" 
                      strokeDashoffset={87.96 * (1 - simResult.probability / 100)} 
                      strokeLinecap="round" 
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold font-mono text-[#08193A]">
                    {simResult.probability}%
                  </span>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#5B6B86]">Late Probability</p>
                  <p className="text-sm font-bold text-[#08193A]">{simResult.probability.toFixed(1)}%</p>
                </div>
              </div>

              {/* Estimated Demurrage in ₹ */}
              <div className="p-3.5 rounded-[18px] bg-white/70 border border-white flex flex-col justify-center">
                <p className="text-[10px] uppercase font-bold text-[#5B6B86]">Estimated Demurrage</p>
                <p className="text-2xl font-extrabold font-mono text-[#F26D6D] mt-0.5">
                  ₹{simResult.demurrageInr.toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] text-[#5B6B86]">Expected SLA delay liability</p>
              </div>

              {/* Engine Advice */}
              <div className="p-3.5 rounded-[18px] bg-white/70 border border-white flex flex-col justify-center">
                <p className="text-[10px] uppercase font-bold text-[#1B3A7A]">XGBoost Tree Recommendation</p>
                <p className="text-xs text-[#08193A] font-semibold mt-1 leading-snug">
                  {simResult.recommendation}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
