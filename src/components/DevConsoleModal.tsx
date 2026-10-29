import React, { useState } from 'react';
import { Terminal, X, Trash2, ArrowUpRight } from 'lucide-react';
import { DevLogMessage } from '../types';

interface DevConsoleProps {
  logs: DevLogMessage[];
  onClearLogs: () => void;
  onSendMockPing: () => void;
}

export const DevConsole: React.FC<DevConsoleProps> = ({ logs, onClearLogs, onSendMockPing }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating circular glass dev-console button (">_" icon) pinned to the right edge of the viewport */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open Dev Console"
        title="Open Real-time Telemetry & Dev Logs"
        className="fixed right-4 top-1/2 -translate-y-1/2 z-40 w-11 h-11 rounded-full glass-panel flex items-center justify-center text-[#08193A] hover:text-[#1B3A7A] shadow-[0_8px_30px_rgba(8,25,58,0.14)] border border-white/80 hover:scale-105 active:scale-95 transition-all cursor-pointer font-mono font-bold text-sm"
      >
        <span className="text-[13px] tracking-tighter">&gt;_</span>
      </button>

      {/* Slide-out glass dev console panel */}
      {isOpen && (
        <div className="fixed inset-y-4 right-4 z-50 w-[380px] max-w-[calc(100vw-32px)] glass-panel-dark text-white rounded-[26px] p-4 flex flex-col shadow-[0_20px_60px_rgba(8,25,58,0.45)] border border-white/20 animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#34D399]" />
              <span className="font-mono text-xs font-bold tracking-wide uppercase">
                FREIGHTIQ Dev Console
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={onSendMockPing}
                title="Trigger WebSocket ping"
                className="p-1 rounded-full hover:bg-white/10 text-[#6EE7B7] text-[10px] font-mono flex items-center gap-1 px-2 border border-white/10"
              >
                <span>Ping</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
              <button
                onClick={onClearLogs}
                title="Clear Logs"
                className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close Console"
                className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Connection status bar */}
          <div className="py-2 flex items-center justify-between text-[11px] font-mono border-b border-white/5 text-white/70">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#34D399] animate-mint-pulse" />
              <span>WS: Connected (Port 8080)</span>
            </span>
            <span className="text-[#34D399]">3.2ms Latency</span>
          </div>

          {/* Log Stream */}
          <div className="flex-1 overflow-y-auto py-3 space-y-2 font-mono text-[11px] pr-1">
            {logs.length === 0 ? (
              <p className="text-white/40 italic text-center py-8">No events logged yet.</p>
            ) : (
              logs.map((log) => {
                const getLevelBadge = (level: string) => {
                  switch (level) {
                    case 'WS': return 'text-[#6EE7B7] bg-[#34D399]/20';
                    case 'QUANTUM': return 'text-[#A7F3D0] bg-[#1B3A7A]/60';
                    case 'WEATHER': return 'text-[#F6C65B] bg-[#F6C65B]/20';
                    case 'ML': return 'text-[#F59E5B] bg-[#F59E5B]/20';
                    default: return 'text-white/80 bg-white/10';
                  }
                };
                return (
                  <div key={log.id} className="p-2 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[9px] text-white/50">
                      <span className="px-1.5 py-0.5 rounded-md font-semibold tracking-wider uppercase border border-white/10" style={{ fontSize: '9px' }}>
                        <span className={getLevelBadge(log.level)}>{log.level}</span>
                      </span>
                      <span>{log.timestamp}</span>
                    </div>
                    <p className="text-white/90 leading-relaxed break-words">{log.message}</p>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom telemetry note */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-white/50 font-mono">
            <span>SQLite + Supabase Real-Time</span>
            <span>QCloud SDK: v2.4.1</span>
          </div>
        </div>
      )}
    </>
  );
};
