import React, { useState } from 'react';
import { 
  Atom, 
  Copy, 
  Download, 
  Check, 
  Sparkles, 
  Layers, 
  Play, 
  RefreshCw, 
  Cpu, 
  Terminal,
  Activity
} from 'lucide-react';
import { OPENQASM_CODE } from '../data/mockData';

interface QpiAIQuantumProps {
  onShowToast: (message: string) => void;
}

export const QpiAIQuantumView: React.FC<QpiAIQuantumProps> = ({ onShowToast }) => {
  const [copied, setCopied] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [shotsCount, setShotsCount] = useState(1000);

  // 1,000 shots distribution across 3 basis states
  const [shotData, setShotData] = useState([
    { state: '|001⟩ Status Quo', shots: 114, percentage: 11.4, color: '#5B6B86' },
    { state: '|010⟩ Expedited Express', shots: 812, percentage: 81.2, color: '#34D399', isGroundState: true },
    { state: '|100⟩ Priority Air', shots: 74, percentage: 7.4, color: '#1B3A7A' }
  ]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(OPENQASM_CODE);
    setCopied(true);
    onShowToast('OpenQASM 2.0 circuit copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportQasm = () => {
    const element = document.createElement('a');
    const file = new Blob([OPENQASM_CODE], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'qpiai_circuit_1793224539.qasm';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    onShowToast('Exported qpiai_circuit_1793224539.qasm');
  };

  const handleRecompile = () => {
    setIsCompiling(true);
    setTimeout(() => {
      // Re-sample slightly to simulate fresh quantum circuit measurement
      const exp = Math.floor(800 + Math.random() * 25);
      const prio = Math.floor(65 + Math.random() * 20);
      const sq = 1000 - exp - prio;
      setShotData([
        { state: '|001⟩ Status Quo', shots: sq, percentage: parseFloat((sq / 10).toFixed(1)), color: '#5B6B86' },
        { state: '|010⟩ Expedited Express', shots: exp, percentage: parseFloat((exp / 10).toFixed(1)), color: '#34D399', isGroundState: true },
        { state: '|100⟩ Priority Air', shots: prio, percentage: parseFloat((prio / 10).toFixed(1)), color: '#1B3A7A' }
      ]);
      setIsCompiling(false);
      onShowToast('Recompiled QpiAI-QSV Statevector on QCloud');
    }, 700);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#08193A] tracking-tight">
          QpiAI Quantum Carrier Allocation & Demurrage Mitigation Engine
        </h1>
        <p className="text-xs md:text-sm text-[#5B6B86] mt-1 max-w-4xl leading-relaxed">
          QpiAI Quantum SDK formulated carrier decision Hamiltonian, executing via QpiAI-QSV-Simulator and local statevector engine.
        </p>
      </div>

      {/* Two Glass Cards: Specs & QUBO Formulation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Glass Card: Quantum Hardware & Engine Specs */}
        <div className="p-5 md:p-6 rounded-[28px] glass-panel space-y-4 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#08193A]/10">
              <h3 className="text-base font-bold text-[#08193A] flex items-center gap-2">
                <Atom className="w-5 h-5 text-[#1B3A7A]" />
                <span>Quantum Hardware & Engine Specs</span>
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#A7F3D0]/70 text-[#08193A] border border-[#6EE7B7]/50">
                Connected
              </span>
            </div>

            {/* Key/Value Rows */}
            <div className="divide-y divide-[#08193A]/5 pt-2 text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-[#5B6B86] font-medium">Connected QCloud User</span>
                <span className="font-mono font-bold text-[#34D399] bg-[#08193A] px-2.5 py-0.5 rounded-full">
                  tejas19
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-[#5B6B86] font-medium">Default Target Device</span>
                <span className="font-mono font-bold text-[#08193A]">
                  QpiAI-QSV-Simulator
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-[#5B6B86] font-medium">Local High-Performance Engine</span>
                <span className="font-mono font-bold text-[#08193A]">
                  QpiAI-QSV-Local
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-[#5B6B86] font-medium">Register Architecture</span>
                <span className="font-mono font-bold text-[#08193A]">
                  3 Qubits • 3 Classical Bits
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-[#5B6B86] font-medium">Measurement Shots</span>
                <span className="font-mono font-bold text-[#08193A]">
                  1,000 Shots per Circuit
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-[#5B6B86] font-medium">Gate Set</span>
                <span className="font-mono font-bold text-[#1B3A7A]">
                  Ry(theta) parameterized, CNOT, Measure
                </span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-[20px] bg-white/70 border border-white/90 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#34D399] animate-mint-pulse" />
              <span className="text-xs text-[#08193A] font-semibold">QpiAI SDK v2.4.1 runtime synced</span>
            </div>
            <button
              onClick={handleRecompile}
              disabled={isCompiling}
              className="px-3 py-1 rounded-full text-xs font-bold text-[#08193A] border border-[#08193A]/30 hover:bg-white transition-all liquid-btn flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 text-[#34D399] ${isCompiling ? 'animate-spin' : ''}`} />
              <span>{isCompiling ? 'Sampling...' : 'Re-sample'}</span>
            </button>
          </div>
        </div>

        {/* Right Glass Card: QUBO Mathematical Formulation */}
        <div className="p-5 md:p-6 rounded-[28px] glass-panel space-y-4 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-base font-bold text-[#08193A]">
                QUBO Mathematical Formulation
              </h3>
              <span className="text-[10px] font-mono text-[#5B6B86]">Ising / QUBO</span>
            </div>
            <p className="text-xs text-[#5B6B86] leading-relaxed">
              Optimal carrier selection balances expedite surcharge against expected SLA delay penalties under mutual exclusivity:
            </p>

            {/* Dark Navy Glass Formula Box */}
            <div className="my-3 p-3.5 rounded-[20px] glass-panel-dark text-white border border-white/20 text-center">
              <span className="font-mono text-xs md:text-sm text-[#A7F3D0] tracking-wide font-bold">
                H = Σ (c_i • Z_i) + λ • (Σ Z_i - 1)²
              </span>
            </div>

            {/* Three State Rows */}
            <div className="space-y-2 pt-1 text-xs">
              <div className="p-2.5 rounded-[16px] bg-white/60 border border-white/80 flex items-center justify-between">
                <span className="font-mono text-[#5B6B86]">|001⟩ Status Quo Carrier</span>
                <span className="font-mono text-[#5B6B86]">₹0 Surcharge • 4-5d SLA</span>
              </div>

              {/* Selected: mint-highlighted */}
              <div className="p-2.5 rounded-[16px] bg-[#34D399]/20 border-2 border-[#34D399] shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#34D399]" />
                  <span className="font-mono font-bold text-[#08193A]">|010⟩ Expedited Regional Express</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#08193A]">₹4,200 Surcharge • 92% SLA</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#08193A] text-white">
                    OPTIMAL
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-[16px] bg-white/60 border border-white/80 flex items-center justify-between">
                <span className="font-mono text-[#5B6B86]">|100⟩ Priority Air Cargo</span>
                <span className="font-mono text-[#5B6B86]">₹9,500 Surcharge • 99% SLA</span>
              </div>
            </div>
          </div>

          {/* 3-Bit Shot-Result Histogram (1,000 Shots) Below */}
          <div className="p-4 rounded-[22px] bg-white/70 border border-white/90 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#08193A]">3-Bit Measurement Histogram (1,000 Shots)</span>
              <span className="font-mono text-[#34D399] font-bold">81.2% Ground Convergence</span>
            </div>

            <div className="space-y-1.5 pt-1">
              {shotData.map((shot, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="font-semibold text-[#08193A]">{shot.state}</span>
                    <span className="text-[#5B6B86]">{shot.shots} shots ({shot.percentage}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-black/5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        shot.isGroundState ? 'bg-[#34D399] shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-[#5B6B86]'
                      }`}
                      style={{ width: `${shot.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Full-Width Dark Glass Card: Exported QpiAI Quantum Circuit (OpenQASM 2.0) */}
      <div className="p-5 md:p-6 rounded-[28px] glass-panel-dark text-white space-y-4 shadow-lg border border-white/15">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
          <div>
            <h3 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#34D399]" />
              <span>Exported QpiAI Quantum Circuit (OpenQASM 2.0)</span>
            </h3>
          </div>
          <span className="text-xs font-mono text-[#A7F3D0]/80">
            Saved in qcloud_circuits/ for QpiAI QCloud synchronization
          </span>
        </div>

        {/* Mono Code with Syntax Highlighting & Line Numbers */}
        <div className="rounded-[20px] bg-black/40 border border-white/10 p-4 font-mono text-xs overflow-x-auto max-h-[340px] leading-relaxed">
          {OPENQASM_CODE.split('\n').map((line, idx) => {
            const isComment = line.trim().startsWith('//');
            const isKeyword = line.includes('OPENQASM') || line.includes('include') || line.includes('qreg') || line.includes('creg');
            const isGate = line.includes('ry') || line.includes('cx') || line.includes('rz') || line.includes('measure');
            return (
              <div key={idx} className="flex gap-4 hover:bg-white/5 px-1 rounded-sm">
                <span className="text-white/30 select-none text-right w-6 shrink-0">
                  {idx + 1}
                </span>
                <span className={
                  isComment ? 'text-white/40 italic' :
                  isKeyword ? 'text-[#6EE7B7] font-semibold' :
                  isGate ? 'text-[#A7F3D0]' : 'text-white/90'
                }>
                  {line}
                </span>
              </div>
            );
          })}
        </div>

        {/* Action Buttons: Copy and Export */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <span className="text-xs font-mono text-white/50">
            SHA256: 7f8a...92b4 • Simulator Seed: 0x4F92A
          </span>
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCopyCode}
              className="px-4 py-1.5 rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-all liquid-btn flex items-center gap-1.5 border border-white/15"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#34D399]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Circuit' : 'Copy'}</span>
            </button>
            <button
              onClick={handleExportQasm}
              className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#34D399] text-[#08193A] hover:bg-[#6EE7B7] transition-all liquid-btn flex items-center gap-1.5 font-semibold shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export .qasm</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
