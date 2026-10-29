import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Download, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Clock, 
  Sparkles,
  Filter
} from 'lucide-react';
import { AuditLogEntry } from '../types';
import { AdminBadge } from '../components/AdminBadge';
import { INITIAL_AUDIT_LOGS } from '../data/mockData';

interface AdminAuditLogViewProps {
  logs?: AuditLogEntry[];
}

export const AdminAuditLogView: React.FC<AdminAuditLogViewProps> = ({ logs: propLogs }) => {
  const [logs, setLogs] = useState<AuditLogEntry[]>(propLogs || INITIAL_AUDIT_LOGS);

  useEffect(() => {
    if (propLogs) {
      setLogs(propLogs);
    }
  }, [propLogs]);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [severityFilter, setSeverityFilter] = useState<string>('All');

  const filtered = logs.filter((l) => {
    const matchesSearch = 
      l.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.ipAddress.includes(searchQuery);
    if (!matchesSearch) return false;

    if (categoryFilter !== 'All' && l.category !== categoryFilter) return false;
    if (severityFilter !== 'All' && l.severity !== severityFilter) return false;
    return true;
  });

  const handleExportAudit = () => {
    const text = `
========================================================================
            FREIGHTIQ TAMPER-EVIDENT SYSTEM AUDIT LOG
========================================================================
EXPORT TIMESTAMP:    ${new Date().toISOString()}
ACTOR:               Rajathgowda (Enterprise Admin)
TOTAL RECORDS:       ${filtered.length}
CRYPTOGRAPHIC HASH:  SHA256-880194A2B99C71D04812EF
------------------------------------------------------------------------
${filtered.map(l => `[${l.timestamp}] [${l.severity}] [${l.category}] ${l.id}
Actor:    ${l.actorName} (${l.actorEmail}) [${l.actorRole.toUpperCase()}]
Action:   ${l.action}
IP:       ${l.ipAddress}
Details:  ${l.details}
------------------------------------------------------------------------`).join('\n')}
========================================================================
`.trim();

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Audit_Log_Export_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getSeverityPill = (sev: AuditLogEntry['severity']) => {
    switch (sev) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-red-500/20 text-red-700 border border-red-500/30">CRITICAL</span>;
      case 'WARNING':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500/20 text-amber-800 border border-amber-500/30">WARNING</span>;
      case 'INFO':
      default:
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#34D399]/20 text-[#08193A] border border-[#34D399]/40">INFO</span>;
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#08193A] text-[#A7F3D0] border border-[#34D399]/40 flex items-center gap-1.5">
              <FileText className="w-3 h-3 text-[#34D399]" />
              <span>COMPLIANCE & SYSTEM AUDIT LOG</span>
            </span>
            <AdminBadge label="IMMUTABLE RECORD" />
            <span className="text-xs text-[#5B6B86] font-medium">• SHA-256 Ledger</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#08193A] tracking-tight">
            Security & Operational Audit Log
          </h1>
          <p className="text-xs md:text-sm text-[#5B6B86] mt-1 max-w-3xl">
            Append-only audit trail logging governor overrides, spot quote pricing, carrier reassignments, CAN-bus alerts, and security blockades.
          </p>
        </div>

        <button
          onClick={handleExportAudit}
          className="px-5 py-2.5 rounded-full text-xs font-bold bg-[#08193A] text-white hover:bg-[#1B3A7A] shadow-[0_4px_16px_rgba(8,25,58,0.22)] liquid-btn flex items-center gap-2 shrink-0 cursor-pointer self-start lg:self-auto"
        >
          <Download className="w-4 h-4 text-[#34D399]" />
          <span>Export Audit Log</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-[24px] glass-panel flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-[#5B6B86] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by action, actor, IP address, detail..."
            className="w-full pl-9 pr-4 py-2 rounded-full text-xs font-medium glass-input text-[#08193A] placeholder-[#5B6B86]/70"
          />
        </div>

        <div className="flex items-center gap-3 text-xs flex-wrap">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase text-[#5B6B86]">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold glass-input text-[#08193A] cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="OVERRIDE">OVERRIDE</option>
              <option value="PRICING">PRICING</option>
              <option value="TELEMETRY">TELEMETRY</option>
              <option value="SECURITY">SECURITY</option>
              <option value="ASSIGNMENT">ASSIGNMENT</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase text-[#5B6B86]">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold glass-input text-[#08193A] cursor-pointer"
            >
              <option value="All">All Severity</option>
              <option value="INFO">INFO</option>
              <option value="WARNING">WARNING</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Entries List */}
      <div className="p-5 md:p-6 rounded-[28px] glass-panel shadow-sm border border-white/80 space-y-3">
        <div className="divide-y divide-black/5">
          {filtered.map((entry) => (
            <div key={entry.id} className="py-3.5 space-y-1.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-xs text-[#08193A]">
                    {entry.id}
                  </span>
                  {getSeverityPill(entry.severity)}
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase bg-[#1B3A7A]/15 text-[#1B3A7A]">
                    {entry.category}
                  </span>
                  <span className="font-mono text-xs font-extrabold text-[#08193A]">
                    {entry.action}
                  </span>
                </div>

                <div className="flex items-center gap-2 font-mono text-[10px] text-[#5B6B86]">
                  <Clock className="w-3 h-3 text-[#1B3A7A]" />
                  <span>{entry.timestamp}</span>
                </div>
              </div>

              <p className="text-xs text-[#08193A] font-medium leading-relaxed pl-1">
                {entry.details}
              </p>

              <div className="flex items-center justify-between text-[10px] font-mono text-[#5B6B86] pt-0.5 pl-1">
                <span>
                  Actor: <strong>{entry.actorName}</strong> ({entry.actorEmail}) • Role: {entry.actorRole.toUpperCase()}
                </span>
                <span>IP: {entry.ipAddress}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
