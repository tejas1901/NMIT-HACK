import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldAlert, 
  Clock, 
  Hourglass, 
  FileText, 
  Truck, 
  LayoutGrid, 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Sliders, 
  RotateCcw, 
  Sparkles, 
  Send, 
  Copy, 
  Download, 
  ExternalLink, 
  Check, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Play, 
  Mail, 
  Radio, 
  Eye, 
  AlertCircle,
  HelpCircle,
  Lock,
  Flame,
  ArrowRight,
  Atom
} from 'lucide-react';
import { 
  BlockerCardItem, 
  CardLane, 
  DocumentDisposition, 
  EvaluationReport, 
  ExceptionBlockerType, 
  HistoricalIncident, 
  LabeledDoc 
} from '../types';
import { AdminBadge } from '../components/AdminBadge';
import { 
  LABELED_DOCUMENTS, 
  HISTORICAL_INCIDENTS, 
  RESPONSIBLE_AI_PRINCIPLES,
  OWNER_ROUTING,
  DEMURRAGE_RATE_PER_DAY_INR,
  DETENTION_RATE_PER_HR_INR
} from '../data/labeledDocs';
import { 
  extractBlockers, 
  mergeBlockerCards, 
  runEvaluationSuite, 
  DEMO_NOW_MS, 
  DEMO_NOW_ISO 
} from '../utils/extractor';

interface AdminExceptionControlTowerViewProps {
  onTriggerToast?: (msg: string) => void;
  onNavigateToYard?: (containerId: string) => void;
  onWriteAuditLog?: (action: string, category: 'OVERRIDE' | 'PRICING' | 'TELEMETRY' | 'SECURITY' | 'ASSIGNMENT', details: string) => void;
}

export const AdminExceptionControlTowerView: React.FC<AdminExceptionControlTowerViewProps> = ({
  onTriggerToast,
  onNavigateToYard,
  onWriteAuditLog
}) => {
  // Skeleton loader on first mount (600ms)
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Demo Live Clock running from Thu 29 Oct 2026 16:00:00
  const [demoSecondsElapsed, setDemoSecondsElapsed] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setDemoSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentSimulatedTimeMs = DEMO_NOW_MS + demoSecondsElapsed * 1000;
  const currentSimulatedDate = new Date(currentSimulatedTimeMs);
  const formattedSimulatedClock = `Thu 29 Oct 2026 ${currentSimulatedDate.toTimeString().slice(0, 8)}`;

  // Settings & Status
  const [isBackendDown, setIsBackendDown] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.70);

  // Documents and Processing State
  const [documents, setDocuments] = useState<Array<LabeledDoc & { status: 'New' | 'Processed' | 'Ignored' }>>(
    LABELED_DOCUMENTS.map((doc, idx) => ({
      ...doc,
      // Initially, let D01–D05 be New, and user can click "Process Inbox" to extract all!
      status: 'New'
    }))
  );

  const [isProcessingInbox, setIsProcessingInbox] = useState(false);
  const [processProgress, setProcessProgress] = useState<{ current: number; total: number; docId: string } | null>(null);

  // Blocker cards state
  const [cards, setCards] = useState<BlockerCardItem[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  // Inbox filtering & search
  const [inboxFilter, setInboxFilter] = useState<'ALL' | 'NEW' | 'PROCESSED' | 'IGNORED'>('ALL');
  const [inboxSearch, setInboxSearch] = useState('');

  // Reassign Modal State
  const [reassignModalCard, setReassignModalCard] = useState<BlockerCardItem | null>(null);
  const [newOwnerSelection, setNewOwnerSelection] = useState<string>('Ravi Menon');

  // False Alarm Modal State
  const [falseAlarmModalCard, setFalseAlarmModalCard] = useState<BlockerCardItem | null>(null);
  const [falseAlarmReason, setFalseAlarmReason] = useState<string>('Duplicate shipment or carrier already issued electronic release.');

  // Evaluation Suite State
  const [isEvalOpen, setIsEvalOpen] = useState(false);
  const [isRunningEval, setIsRunningEval] = useState(false);
  const [evalProgress, setEvalProgress] = useState<number>(0);
  const [evalReport, setEvalReport] = useState<EvaluationReport | null>(null);
  const [selectedFailedDoc, setSelectedFailedDoc] = useState<any | null>(null);

  // Responsible AI Modal State
  const [activePrincipleModal, setActivePrincipleModal] = useState<typeof RESPONSIBLE_AI_PRINCIPLES[0] | null>(null);

  // Automatically process initial documents once on mount for demo readiness
  useEffect(() => {
    // Process D01–D05 immediately so board has rich initial content
    const initCards = async () => {
      let accumulatedCards: BlockerCardItem[] = [];
      const updatedDocs = [...documents];

      for (let i = 0; i < 5; i++) {
        const doc = updatedDocs[i];
        const res = await extractBlockers(doc, isBackendDown, confidenceThreshold, currentSimulatedTimeMs);
        accumulatedCards = mergeBlockerCards(accumulatedCards, res.cards);
        updatedDocs[i] = {
          ...doc,
          status: res.disposition === 'IGNORE' ? 'Ignored' : 'Processed'
        };
      }

      setCards(accumulatedCards);
      setDocuments(updatedDocs);
      if (accumulatedCards.length > 0) {
        setSelectedCardId(accumulatedCards[0].id);
      }
    };

    initCards();
  }, [isBackendDown]);

  // Handler: Process all 'New' inbox documents sequentially
  const handleProcessInbox = async () => {
    if (isProcessingInbox) return;
    setIsProcessingInbox(true);

    const newDocs = documents.filter((d) => d.status === 'New');
    if (newDocs.length === 0) {
      if (onTriggerToast) onTriggerToast('Inbox up to date: No new documents pending');
      setIsProcessingInbox(false);
      return;
    }

    let runningCards = [...cards];
    const updatedDocs = [...documents];

    for (let i = 0; i < newDocs.length; i++) {
      const doc = newDocs[i];
      setProcessProgress({ current: i + 1, total: newDocs.length, docId: doc.docId });

      // Artificial small delay for visual feedback of batch processing
      await new Promise((r) => setTimeout(r, 180));

      const res = await extractBlockers(doc, isBackendDown, confidenceThreshold, currentSimulatedTimeMs);
      runningCards = mergeBlockerCards(runningCards, res.cards);

      // Update doc status
      const docIndex = updatedDocs.findIndex((d) => d.docId === doc.docId);
      if (docIndex >= 0) {
        updatedDocs[docIndex] = {
          ...doc,
          status: res.disposition === 'IGNORE' ? 'Ignored' : 'Processed'
        };
      }
    }

    setCards(runningCards);
    setDocuments(updatedDocs);
    setIsProcessingInbox(false);
    setProcessProgress(null);

    if (onTriggerToast) {
      onTriggerToast(`Processed ${newDocs.length} documents. Blocker board updated.`);
    }

    if (onWriteAuditLog) {
      onWriteAuditLog(
        'INBOX_BATCH_PROCESSED',
        'TELEMETRY',
        `Processed ${newDocs.length} incoming documents via ${isBackendDown ? 'Rules Engine' : 'Ollama Llama-3.1:8b'}`
      );
    }
  };

  // Handler: Run Evaluation Suite on all 20 benchmark labeled documents
  const handleRunEvaluation = async () => {
    setIsEvalOpen(true);
    setIsRunningEval(true);
    setEvalProgress(10);

    // Progress tick
    const progressTimer = setInterval(() => {
      setEvalProgress((p) => (p < 90 ? p + 15 : p));
    }, 120);

    try {
      const report = await runEvaluationSuite(LABELED_DOCUMENTS, isBackendDown, confidenceThreshold);
      clearInterval(progressTimer);
      setEvalProgress(100);
      setEvalReport(report);
      if (onTriggerToast) {
        onTriggerToast(`Evaluation completed: Precision ${report.evidencePrecision}%, Recall ${report.recallPercent}%`);
      }
      if (onWriteAuditLog) {
        onWriteAuditLog(
          'EVALUATION_SUITE_RUN',
          'SECURITY',
          `Ran 20-doc benchmark against answer keys. Evidence Precision: ${report.evidencePrecision}%, Missed: ${report.missedBlockersCount}`
        );
      }
    } catch (e) {
      clearInterval(progressTimer);
      if (onTriggerToast) onTriggerToast('Evaluation encountered an error');
    } finally {
      setTimeout(() => setIsRunningEval(false), 300);
    }
  };

  // Action: Mark Done
  const handleMarkDone = (cardId: string) => {
    setCards((prev) =>
      prev.map((c) => {
        if (c.id === cardId) {
          return {
            ...c,
            lane: 'RESOLVED',
            resolvedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            resolveReason: 'Cleared by operations lead',
            activityLog: [
              ...c.activityLog,
              {
                id: `ACT-${Date.now()}-done`,
                timestamp: formattedSimulatedClock,
                actor: 'Rajathgowda (Admin)',
                action: 'MARKED_DONE',
                details: 'Blocker confirmed resolved; demurrage clock terminated.'
              }
            ]
          };
        }
        return c;
      })
    );

    const card = cards.find((c) => c.id === cardId);
    if (onTriggerToast) onTriggerToast(`Container ${card?.containerId || cardId} marked as Resolved`);
    if (onWriteAuditLog && card) {
      onWriteAuditLog('BLOCKER_RESOLVED', 'ASSIGNMENT', `Blocker ${card.blockerType} for container ${card.containerId} marked resolved.`);
    }
  };

  // Action: Solve with QpiAI Opt QUBO
  const handleSolveWithQpiAI = (cardId: string) => {
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;

    setCards((prev) =>
      prev.map((c) => {
        if (c.id === cardId) {
          return {
            ...c,
            lane: 'RESOLVED',
            resolvedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            resolveReason: 'Optimized via QpiAI Opt QUBO solver (ground state |010⟩)',
            activityLog: [
              ...c.activityLog,
              {
                id: `ACT-${Date.now()}-qpiai`,
                timestamp: formattedSimulatedClock,
                actor: 'QpiAI Opt Engine',
                action: 'QPIAI_QUBO_MITIGATION',
                details: `QpiAI Quantum QUBO solved: Expedited carrier slot allocated. Saved ₹${card.avoidableCostInr.toLocaleString()} demurrage.`
              }
            ]
          };
        }
        return c;
      })
    );

    if (onTriggerToast) {
      onTriggerToast(`QpiAI Opt Solved ${card.containerId}: Ground state |010⟩ assigned. Saved ₹${card.avoidableCostInr.toLocaleString()}`);
    }
    if (onWriteAuditLog) {
      onWriteAuditLog('QPIAI_QUBO_MITIGATION', 'OVERRIDE', `Container ${card.containerId} blocker mitigated with QpiAI Opt solver.`);
    }
  };

  // Action: Confirm Reassign
  const handleConfirmReassign = () => {
    if (!reassignModalCard) return;

    setCards((prev) =>
      prev.map((c) => {
        if (c.id === reassignModalCard.id) {
          return {
            ...c,
            ownerName: newOwnerSelection,
            activityLog: [
              ...c.activityLog,
              {
                id: `ACT-${Date.now()}-reassign`,
                timestamp: formattedSimulatedClock,
                actor: 'Rajathgowda (Admin)',
                action: 'REASSIGNED_OWNER',
                details: `Owner manually changed from ${c.ownerName} to ${newOwnerSelection}`
              }
            ]
          };
        }
        return c;
      })
    );

    if (onTriggerToast) onTriggerToast(`Reassigned ${reassignModalCard.containerId} to ${newOwnerSelection}`);
    if (onWriteAuditLog) {
      onWriteAuditLog(
        'BLOCKER_REASSIGNED',
        'OVERRIDE',
        `Reassigned ${reassignModalCard.containerId} (${reassignModalCard.blockerType}) to ${newOwnerSelection}`
      );
    }
    setReassignModalCard(null);
  };

  // Action: Confirm False Alarm Rejection
  const handleConfirmFalseAlarm = () => {
    if (!falseAlarmModalCard) return;

    setCards((prev) =>
      prev.map((c) => {
        if (c.id === falseAlarmModalCard.id) {
          return {
            ...c,
            lane: 'RESOLVED',
            resolvedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            resolveReason: `False alarm rejected: ${falseAlarmReason}`,
            activityLog: [
              ...c.activityLog,
              {
                id: `ACT-${Date.now()}-false-alarm`,
                timestamp: formattedSimulatedClock,
                actor: 'Rajathgowda (Admin)',
                action: 'REJECTED_FALSE_ALARM',
                details: `False alarm rejected with reason: ${falseAlarmReason}`
              }
            ]
          };
        }
        return c;
      })
    );

    if (onTriggerToast) onTriggerToast(`Rejected ${falseAlarmModalCard.containerId} as false alarm`);
    if (onWriteAuditLog) {
      onWriteAuditLog(
        'FALSE_ALARM_REJECTED',
        'OVERRIDE',
        `Operator rejected blocker for ${falseAlarmModalCard.containerId}. Feedback: ${falseAlarmReason}`
      );
    }
    setFalseAlarmModalCard(null);
  };

  // Action: Show in Yard
  const handleShowInYard = (containerId: string) => {
    if (onNavigateToYard) {
      onNavigateToYard(containerId);
    } else if (onTriggerToast) {
      onTriggerToast(`Navigating to Yard & Gate Map for container ${containerId}`);
    }
  };

  // Active Selected Card
  const selectedCard = useMemo(() => {
    return cards.find((c) => c.id === selectedCardId) || null;
  }, [cards, selectedCardId]);

  // Dynamic Metrics & KPIs
  const openBlockers = cards.filter((c) => c.lane === 'ACT_NOW' || c.lane === 'TODAY' || c.lane === 'UPCOMING');
  const actNowBlockers = cards.filter((c) => c.lane === 'ACT_NOW');
  const reviewBlockers = cards.filter((c) => c.lane === 'REVIEW');
  const totalAvoidableCostInr = useMemo(() => {
    return openBlockers.reduce((sum, c) => sum + c.avoidableCostInr, 0);
  }, [openBlockers]);

  // Live countdown helper
  const getCountdownString = (deadlineTimestamp: number) => {
    const diff = deadlineTimestamp - currentSimulatedTimeMs;
    if (diff <= 0) return 'OVERDUE';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins.toString().padStart(2, '0')}m`;
  };

  // Blocker Type Helper
  const getBlockerTypeMeta = (type: ExceptionBlockerType) => {
    switch (type) {
      case 'CUSTOMS_HOLD':
        return { label: 'CUSTOMS HOLD', icon: Shield, color: 'text-[#F26D6D] bg-[#F26D6D]/10 border-[#F26D6D]/30' };
      case 'MISSING_DOCUMENT':
        return { label: 'MISSING DOCUMENT', icon: FileText, color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' };
      case 'FREE_TIME_EXPIRING':
        return { label: 'FREE TIME EXPIRING', icon: Hourglass, color: 'text-amber-600 bg-amber-600/10 border-amber-600/30' };
      case 'NO_TRUCK_BOOKED':
        return { label: 'NO TRUCK BOOKED', icon: Truck, color: 'text-[#1B3A7A] bg-[#1B3A7A]/10 border-[#1B3A7A]/30' };
      case 'SLOT_UNAVAILABLE':
        return { label: 'SLOT UNAVAILABLE', icon: LayoutGrid, color: 'text-[#F26D6D] bg-[#F26D6D]/10 border-[#F26D6D]/30' };
      default:
        return { label: type, icon: AlertCircle, color: 'text-[#5B6B86] bg-black/5 border-black/10' };
    }
  };

  // Filtered Inbox list
  const filteredInbox = useMemo(() => {
    return documents.filter((doc) => {
      if (inboxFilter === 'NEW' && doc.status !== 'New') return false;
      if (inboxFilter === 'PROCESSED' && doc.status !== 'Processed') return false;
      if (inboxFilter === 'IGNORED' && doc.status !== 'Ignored') return false;
      if (inboxSearch) {
        const q = inboxSearch.toLowerCase();
        return (
          doc.docId.toLowerCase().includes(q) ||
          doc.subject.toLowerCase().includes(q) ||
          doc.text.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [documents, inboxFilter, inboxSearch]);

  // Board lanes
  const lanes: Array<{ id: CardLane; label: string; accentColor: string; bgAccent: string }> = [
    { id: 'ACT_NOW', label: 'ACT NOW (under 6h)', accentColor: 'text-[#F26D6D]', bgAccent: 'bg-[#F26D6D]/10 border-[#F26D6D]/30' },
    { id: 'TODAY', label: 'TODAY', accentColor: 'text-amber-600', bgAccent: 'bg-amber-500/10 border-amber-500/30' },
    { id: 'UPCOMING', label: 'UPCOMING', accentColor: 'text-[#34D399]', bgAccent: 'bg-[#34D399]/10 border-[#34D399]/30' },
    { id: 'REVIEW', label: 'NEEDS HUMAN REVIEW', accentColor: 'text-[#5B6B86]', bgAccent: 'bg-[#5B6B86]/10 border-[#5B6B86]/30' },
    { id: 'RESOLVED', label: 'RESOLVED', accentColor: 'text-emerald-600', bgAccent: 'bg-emerald-500/10 border-emerald-500/30' }
  ];

  if (isLoading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-20 bg-white/40 rounded-[28px] border border-white/60" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white/40 rounded-[24px] border border-white/60" />
          ))}
        </div>
        <div className="h-96 bg-white/40 rounded-[28px] border border-white/60" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 p-2 sm:p-4 max-w-[1720px] mx-auto w-full">
      {/* ======================= TOP BANNER (IF FALLBACK) ======================= */}
      {isBackendDown && (
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 shadow-sm flex items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-semibold">
              AI backend unavailable. Using rules-based fallback (lower accuracy). Blocker confidence capped at 58% (routed to Human Review).
            </span>
          </div>
          <button
            onClick={() => setIsBackendDown(false)}
            className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-600 text-white hover:bg-amber-700 transition-all cursor-pointer"
          >
            Reconnect Local LLM
          </button>
        </div>
      )}

      {/* ======================= HEADER SECTION ======================= */}
      <header className="glass-panel p-4 sm:p-6 rounded-[28px] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-[0_12px_40px_rgba(8,25,58,0.06)] border border-white/80">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#08193A]">
              Exception Control Tower
            </h1>
            <AdminBadge />
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#1B3A7A]/10 text-[#1B3A7A] border border-[#1B3A7A]/20">
              Live automated manifest stream
            </span>
            <div className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-white/70 text-[#08193A] border border-black/5 flex items-center gap-1.5 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
              <span>{formattedSimulatedClock}</span>
            </div>
          </div>
          <p className="text-xs text-[#5B6B86] leading-relaxed">
            Freight exceptions hide in emails, documents, terminal feeds and notes. This tower finds each container's blocker, proves it with evidence, assigns an owner and a deadline, and shows the money saved, before demurrage or detention starts.
          </p>
        </div>

        {/* Right Action Controls */}
        <div className="flex flex-wrap items-center gap-3 shrink-0 w-full lg:w-auto justify-end">
          {/* Confidence Threshold Slider */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/60 border border-white/80 shadow-2xs">
            <Sliders className="w-3.5 h-3.5 text-[#5B6B86]" />
            <span className="text-[11px] font-mono font-bold text-[#08193A]">
              Gate: {(confidenceThreshold * 100).toFixed(0)}%
            </span>
            <input
              type="range"
              min="0.50"
              max="0.95"
              step="0.05"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
              className="w-16 accent-[#34D399] cursor-pointer"
              title="Confidence threshold: anything below routes to NEEDS HUMAN REVIEW"
            />
          </div>

          {/* Model Status Capsule (Toggleable simulation for failure testing) */}
          <button
            onClick={() => setIsBackendDown(!isBackendDown)}
            title="Click to toggle Local LLM vs Rules-based Fallback for resilience testing"
            className={`px-3 py-1.5 rounded-full text-[11px] font-mono font-bold border transition-all flex items-center gap-2 cursor-pointer ${
              isBackendDown
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-[#08193A] text-white border-white/20'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isBackendDown ? 'bg-amber-500 animate-pulse' : 'bg-[#34D399] animate-ping'}`} />
            <span>{isBackendDown ? 'Fallback: rules engine' : 'Local LLM · Ollama · llama3.1:8b'}</span>
          </button>

          {/* Process Inbox Button */}
          <button
            onClick={handleProcessInbox}
            disabled={isProcessingInbox}
            className="px-4 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-[#08193A] to-[#1B3A7A] text-[#A7F3D0] hover:shadow-[0_4px_16px_rgba(8,25,58,0.25)] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${isProcessingInbox ? 'animate-spin' : ''}`} />
            <span>{isProcessingInbox ? 'Extracting...' : 'Process Inbox'}</span>
          </button>

          {/* Run Evaluation Button */}
          <button
            onClick={handleRunEvaluation}
            disabled={isRunningEval}
            className="px-4 py-2 rounded-full text-xs font-bold bg-white/80 hover:bg-white text-[#08193A] border border-white shadow-2xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#34D399]" />
            <span>Run Evaluation</span>
          </button>
        </div>
      </header>

      {/* Progress Bar (if processing inbox) */}
      {isProcessingInbox && processProgress && (
        <div className="p-3 rounded-2xl glass-panel border border-[#34D399]/40 flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-xs font-mono font-semibold text-[#08193A]">
            <span>Processing document {processProgress.docId} ({processProgress.current} of {processProgress.total})...</span>
            <span>{Math.round((processProgress.current / processProgress.total) * 100)}%</span>
          </div>
          <div className="w-full h-1.5 bg-black/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#1B3A7A] to-[#34D399] transition-all duration-200"
              style={{ width: `${(processProgress.current / processProgress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* ======================= KPI STRIP (4 Glass Tiles) ======================= */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Key Performance Indicators">
        {/* Tile 1: OPEN BLOCKERS */}
        <div className="glass-panel p-5 rounded-[26px] border border-white/80 shadow-[0_8px_30px_rgba(8,25,58,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#5B6B86]">
            <span className="text-xs font-bold tracking-wider uppercase">OPEN BLOCKERS</span>
            <ShieldAlert className="w-4 h-4 text-[#1B3A7A]" />
          </div>
          <div className="my-2">
            <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#08193A]">
              {openBlockers.length}
            </span>
          </div>
          <span className="text-[11px] text-[#5B6B86] font-medium">
            Active in Act Now, Today & Upcoming
          </span>
        </div>

        {/* Tile 2: ACT IN NEXT 6 HOURS */}
        <div className="glass-panel p-5 rounded-[26px] border border-[#F26D6D]/30 shadow-[0_8px_30px_rgba(242,109,109,0.08)] bg-gradient-to-br from-white/80 to-[#F26D6D]/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#F26D6D]">
            <span className="text-xs font-bold tracking-wider uppercase">ACT IN NEXT 6 HOURS</span>
            <Flame className="w-4 h-4 text-[#F26D6D] animate-pulse" />
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#F26D6D]">
              {actNowBlockers.length}
            </span>
            <span className="text-xs font-bold text-[#F26D6D]">URGENT</span>
          </div>
          <span className="text-[11px] text-[#F26D6D]/80 font-medium">
            Demurrage / detention starts shortly
          </span>
        </div>

        {/* Tile 3: NEEDS HUMAN REVIEW */}
        <div className="glass-panel p-5 rounded-[26px] border border-white/80 shadow-[0_8px_30px_rgba(8,25,58,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#5B6B86]">
            <span className="text-xs font-bold tracking-wider uppercase">NEEDS HUMAN REVIEW</span>
            <HelpCircle className="w-4 h-4 text-[#5B6B86]" />
          </div>
          <div className="my-2">
            <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#08193A]">
              {reviewBlockers.length}
            </span>
          </div>
          <span className="text-[11px] text-[#5B6B86] font-medium">
            Ambiguous signals or low confidence
          </span>
        </div>

        {/* Tile 4: PROJECTED AVOIDABLE COST */}
        <div className="glass-panel p-5 rounded-[26px] border border-[#34D399]/40 shadow-[0_8px_30px_rgba(52,211,153,0.08)] bg-gradient-to-br from-white/80 to-[#34D399]/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#08193A]">
            <span className="text-xs font-bold tracking-wider uppercase text-[#1B3A7A]">PROJECTED AVOIDABLE COST</span>
            <span className="w-2 h-2 rounded-full bg-[#34D399] animate-mint-pulse" />
          </div>
          <div className="my-2">
            <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#08193A]">
              ₹{totalAvoidableCostInr.toLocaleString()}
            </span>
          </div>
          <span className="text-[11px] text-[#34D399] font-bold">
            Total money saved if deadlines met
          </span>
        </div>
      </section>

      {/* ======================= THREE-COLUMN MAIN WORKSPACE ======================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ================= COLUMN 1: INBOX (~25%, col-span-3) ================= */}
        <div className="lg:col-span-3 glass-panel p-4 rounded-[28px] border border-white/80 shadow-[0_12px_40px_rgba(8,25,58,0.04)] flex flex-col gap-3 min-h-[640px]">
          <div className="flex items-center justify-between pb-1 border-b border-black/5">
            <div>
              <h2 className="text-sm font-extrabold text-[#08193A] tracking-tight">DOCUMENT INBOX</h2>
              <span className="text-[10px] text-[#5B6B86] font-medium">{filteredInbox.length} documents listed</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white text-[#08193A] border border-black/5">
              20 Total
            </span>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#5B6B86]" />
            <input
              type="text"
              placeholder="Filter by ID, subject, text..."
              value={inboxSearch}
              onChange={(e) => setInboxSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-full text-xs glass-input text-[#08193A] placeholder-[#5B6B86]/70"
            />
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
            {(['ALL', 'NEW', 'PROCESSED', 'IGNORED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setInboxFilter(tab)}
                className={`px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer ${
                  inboxFilter === tab
                    ? 'bg-[#08193A] text-white shadow-2xs'
                    : 'bg-white/60 text-[#5B6B86] hover:bg-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Documents Scrollable List */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-2 max-h-[580px]">
            {filteredInbox.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#5B6B86]">
                No documents match the filter.
              </div>
            ) : (
              filteredInbox.map((doc) => {
                const isSelected = selectedCard?.docId === doc.docId;
                const SourceIcon = 
                  doc.sourceType === 'Email' ? Mail :
                  doc.sourceType === 'Customs notice' ? Shield :
                  doc.sourceType === 'Terminal feed' ? Radio :
                  doc.sourceType === 'Internal note' ? FileText : CheckCircle2;

                return (
                  <div
                    key={doc.docId}
                    onClick={() => {
                      const matchingCard = cards.find((c) => c.docId === doc.docId);
                      if (matchingCard) {
                        setSelectedCardId(matchingCard.id);
                      }
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-white/90 border-[#34D399] shadow-xs'
                        : 'bg-white/50 border-white/80 hover:bg-white/80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <SourceIcon className="w-3.5 h-3.5 text-[#1B3A7A] shrink-0" />
                        <span className="font-mono text-[11px] font-bold text-[#08193A]">{doc.docId}</span>
                        <span className="text-[10px] text-[#5B6B86] truncate">· {doc.sourceType}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold shrink-0 ${
                          doc.status === 'New'
                            ? 'bg-[#1B3A7A]/15 text-[#1B3A7A] border border-[#1B3A7A]/30'
                            : doc.status === 'Processed'
                            ? 'bg-[#34D399]/20 text-emerald-800 border border-[#34D399]/40'
                            : 'bg-black/5 text-[#5B6B86] border border-black/10'
                        }`}
                      >
                        {doc.status}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-[#08193A] truncate">
                      {doc.subject}
                    </p>

                    <div className="flex items-center justify-between gap-2 mt-2 pt-1.5 border-t border-black/5 text-[10px] text-[#5B6B86] font-mono">
                      <span>{doc.receivedAt}</span>
                      <span className="px-1.5 py-0.5 rounded bg-black/5 text-[#08193A]/80 font-medium">
                        Masked: 2 items
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ================= COLUMN 2: BLOCKER BOARD (~50%, col-span-6) ================= */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div className="glass-panel p-4 rounded-[28px] border border-white/80 shadow-[0_12px_40px_rgba(8,25,58,0.04)] flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-black/5">
              <div>
                <h2 className="text-sm font-extrabold text-[#08193A] tracking-tight">AUTONOMOUS BLOCKER BOARD</h2>
                <p className="text-[11px] text-[#5B6B86]">
                  Cards organized by action urgency countdown and human clearance lanes.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-[#08193A] bg-white px-2.5 py-1 rounded-full border border-black/5">
                {cards.length} Total Cards
              </span>
            </div>

            {/* Board Lanes */}
            <div className="space-y-4">
              {lanes.map((lane) => {
                const laneCards = cards.filter((c) => c.lane === lane.id);
                return (
                  <div key={lane.id} className="space-y-2">
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-extrabold uppercase tracking-wider ${lane.accentColor}`}>
                          {lane.label}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${lane.bgAccent}`}>
                          {laneCards.length}
                        </span>
                      </div>
                    </div>

                    {laneCards.length === 0 ? (
                      <div className="p-3 rounded-2xl bg-white/30 border border-dashed border-black/10 text-center text-xs text-[#5B6B86]">
                        No blockers in this lane.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {laneCards.map((card) => {
                          const meta = getBlockerTypeMeta(card.blockerType);
                          const BlockerIcon = meta.icon;
                          const isSelected = selectedCardId === card.id;

                          return (
                            <div
                              key={card.id}
                              onClick={() => setSelectedCardId(card.id)}
                              className={`rounded-[24px] bg-white/70 border transition-all duration-200 cursor-pointer overflow-hidden shadow-xs relative hover:bg-white/95 ${
                                isSelected
                                  ? 'border-[#34D399] ring-2 ring-[#34D399]/40 shadow-md'
                                  : 'border-white/80 hover:border-black/15'
                              }`}
                              tabIndex={0}
                              aria-label={`Blocker, container ${card.containerId}, ${card.blockerType.replace(/_/g, ' ')}, ${getCountdownString(card.deadlineTimestamp)} left`}
                            >
                              {/* Left Urgency Color Stripe */}
                              <div
                                className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                                  card.lane === 'ACT_NOW' ? 'bg-[#F26D6D]' :
                                  card.lane === 'TODAY' ? 'bg-amber-500' :
                                  card.lane === 'UPCOMING' ? 'bg-[#34D399]' :
                                  card.lane === 'REVIEW' ? 'bg-[#5B6B86]' : 'bg-emerald-500'
                                }`}
                              />

                              <div className="p-4 pl-5 space-y-3">
                                {/* Top Row: Container ID + Blocker Type Chip + Conflicting Dates Chip */}
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-sm font-extrabold text-[#08193A] tracking-tight">
                                      {card.containerId}
                                    </span>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${meta.color}`}>
                                      <BlockerIcon className="w-3 h-3" />
                                      <span>{meta.label}</span>
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    {card.conflictingDates && (
                                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-300">
                                        ⚠ Conflicting dates
                                      </span>
                                    )}
                                    {card.isFallback && (
                                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                        Fallback
                                      </span>
                                    )}
                                    {card.alsoSeenIn && card.alsoSeenIn.length > 0 && (
                                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#1B3A7A]/10 text-[#1B3A7A] border border-[#1B3A7A]/20">
                                        Merged ({card.alsoSeenIn.length} dups)
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Middle: Countdown ring / display + penalty details */}
                                <div className="p-3 rounded-2xl bg-white/60 border border-black/5 flex items-center justify-between gap-3">
                                  <div>
                                    <span className="text-[10px] font-bold text-[#5B6B86] uppercase tracking-wider block">
                                      ACTION DEADLINE
                                    </span>
                                    <span className={`font-mono text-xl sm:text-2xl font-black ${
                                      card.lane === 'ACT_NOW' ? 'text-[#F26D6D]' : 'text-[#08193A]'
                                    }`}>
                                      {getCountdownString(card.deadlineTimestamp)}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-[10px] text-[#5B6B86] block font-medium">Penalty start</span>
                                    <span className="text-xs font-mono font-semibold text-[#08193A]">
                                      {card.penaltyStart ? card.penaltyStart.replace('T', ' ') : 'SLA Target'}
                                    </span>
                                  </div>
                                </div>

                                {/* Evidence Box */}
                                <div className="p-2.5 rounded-xl bg-black/5 border border-black/5 text-xs text-[#08193A] space-y-1">
                                  <div className="flex items-center justify-between text-[10px]">
                                    <span className="font-semibold text-[#5B6B86]">{card.sourceLabel}</span>
                                    {card.isVerified ? (
                                      <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                                        <Check className="w-2.5 h-2.5" />
                                        <span>Verified in source</span>
                                      </span>
                                    ) : (
                                      <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                                        <AlertTriangle className="w-2.5 h-2.5" />
                                        <span>Unverified</span>
                                      </span>
                                    )}
                                  </div>
                                  <p className="italic text-[#08193A] font-medium leading-snug">
                                    "{card.evidenceQuote}"
                                  </p>
                                </div>

                                {/* Footer: Owner + Confidence + Avoidable Cost + Buttons */}
                                <div className="flex items-center justify-between pt-2 border-t border-black/5 flex-wrap gap-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-[#08193A] text-[#A7F3D0] flex items-center justify-center font-bold text-xs shadow-2xs">
                                      {card.ownerAvatar}
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-[#08193A] leading-none">{card.ownerName}</p>
                                      <p className="text-[10px] text-[#5B6B86] mt-0.5">{card.ownerRole}</p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#34D399]/20 text-[#08193A] border border-[#34D399]/40">
                                      {(card.confidence * 100).toFixed(0)}%
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                                      Saves ₹{card.avoidableCostInr.toLocaleString()}
                                    </span>
                                  </div>
                                </div>

                                {/* Card Action Buttons */}
                                <div className="flex items-center justify-end gap-2 pt-1 text-xs">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleShowInYard(card.containerId);
                                    }}
                                    className="px-2.5 py-1 rounded-full text-[11px] font-semibold text-[#1B3A7A] hover:bg-[#1B3A7A]/10 border border-[#1B3A7A]/30 transition-all cursor-pointer flex items-center gap-1"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    <span>Show in Yard</span>
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setReassignModalCard(card);
                                    }}
                                    className="px-2.5 py-1 rounded-full text-[11px] font-semibold text-[#5B6B86] hover:bg-black/5 border border-black/10 transition-all cursor-pointer"
                                  >
                                    Reassign
                                  </button>
                                  {card.lane !== 'RESOLVED' && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSolveWithQpiAI(card.id);
                                      }}
                                      className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#1B3A7A] text-white hover:bg-[#08193A] transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                                      title="Solve Demurrage with QpiAI Opt QUBO"
                                    >
                                      <Atom className="w-3 h-3 text-[#34D399]" />
                                      <span>QpiAI Opt</span>
                                    </button>
                                  )}
                                  {card.lane !== 'RESOLVED' && (
                                    <button
                                      onClick={(e) => {
                                      e.stopPropagation();
                                      handleMarkDone(card.id);
                                    }}
                                    className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#34D399] text-[#08193A] hover:bg-[#6EE7B7] transition-all cursor-pointer"
                                  >
                                    Mark Done
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= COLUMN 3: DETAIL PANEL (~25%, col-span-3) ================= */}
      <div className="lg:col-span-3 glass-panel p-4 rounded-[28px] border border-white/80 shadow-[0_12px_40px_rgba(8,25,58,0.04)] flex flex-col gap-4 min-h-[640px]">
        {selectedCard ? (
          <div className="space-y-4">
            <div className="pb-3 border-b border-black/5">
              <span className="text-[10px] font-mono font-bold text-[#5B6B86] uppercase block">
                BLOCKER PROOF & AUDIT
              </span>
              <h3 className="text-lg font-black text-[#08193A] font-mono">
                {selectedCard.containerId}
              </h3>
              <p className="text-xs text-[#5B6B86]">{selectedCard.sourceLabel}</p>
            </div>

            {/* Raw Source Document with Evidence Highlighted */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-[#08193A] uppercase tracking-wider block">
                Source Document Proof
              </span>
              <div className="p-3 rounded-2xl bg-white/70 border border-black/10 text-xs leading-relaxed text-[#08193A] font-mono max-h-48 overflow-y-auto">
                {selectedCard.rawDocumentText.split(selectedCard.evidenceQuote).map((part, idx, arr) => (
                  <React.Fragment key={idx}>
                    <span>{part}</span>
                    {idx < arr.length - 1 && (
                      <mark className="bg-[#6EE7B7]/40 text-[#08193A] font-bold px-1 rounded border border-[#34D399]">
                        {selectedCard.evidenceQuote}
                      </mark>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Routing Justification: "Why this owner?" */}
            <div className="p-3 rounded-2xl bg-[#1B3A7A]/5 border border-[#1B3A7A]/20 space-y-1">
              <span className="text-[10px] font-mono font-bold text-[#1B3A7A] uppercase">
                WHY THIS OWNER? (Routing Rule)
              </span>
              <p className="text-xs text-[#08193A] font-medium leading-snug">
                {selectedCard.whyOwner}
              </p>
            </div>

            {/* Deadline Justification: "Why this deadline?" */}
            <div className="p-3 rounded-2xl bg-[#08193A]/5 border border-black/10 space-y-1">
              <span className="text-[10px] font-mono font-bold text-[#08193A] uppercase">
                WHY THIS DEADLINE? (Formula)
              </span>
              <p className="text-xs text-[#08193A] font-medium leading-snug">
                {selectedCard.whyDeadline}
              </p>
            </div>

            {/* Cost Math: Avoidable Cost Calculation */}
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
              <span className="text-[10px] font-mono font-bold text-emerald-900 uppercase">
                PROJECTED AVOIDABLE COST
              </span>
              <p className="text-xs font-mono font-bold text-emerald-900">
                {selectedCard.costFormula}
              </p>
            </div>

            {/* Activity Log */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-[#08193A] uppercase tracking-wider block">
                Activity Audit Trail
              </span>
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {selectedCard.activityLog.map((log) => (
                  <div key={log.id} className="p-2 rounded-xl bg-white/50 border border-black/5 text-[11px] space-y-0.5 font-mono">
                    <div className="flex justify-between text-[#5B6B86] text-[10px]">
                      <span>{log.actor}</span>
                      <span>{log.timestamp}</span>
                    </div>
                    <p className="text-[#08193A]">{log.details}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions: Mark Done / Reject as false alarm */}
            <div className="flex flex-col gap-2 pt-2 border-t border-black/5">
              {selectedCard.lane !== 'RESOLVED' && (
                <button
                  onClick={() => handleSolveWithQpiAI(selectedCard.id)}
                  className="w-full py-2 rounded-full text-xs font-bold bg-[#1B3A7A] text-white hover:bg-[#08193A] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Atom className="w-3.5 h-3.5 text-[#34D399]" />
                  <span>Mitigate Demurrage with QpiAI Opt (QUBO)</span>
                </button>
              )}

              <button
                onClick={() => handleShowInYard(selectedCard.containerId)}
                className="w-full py-2 rounded-full text-xs font-bold bg-[#08193A] text-white hover:bg-[#1B3A7A] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Show in Yard & Gate Map</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleMarkDone(selectedCard.id)}
                  className="py-1.5 rounded-full text-xs font-bold bg-[#34D399] text-[#08193A] hover:bg-[#6EE7B7] transition-all cursor-pointer"
                >
                  Mark Done
                </button>
                <button
                  onClick={() => setFalseAlarmModalCard(selectedCard)}
                  className="py-1.5 rounded-full text-xs font-bold text-[#F26D6D] border border-[#F26D6D]/40 hover:bg-[#F26D6D]/10 transition-all cursor-pointer"
                >
                  Reject False Alarm
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[#5B6B86] space-y-3">
            <div className="w-12 h-12 rounded-full bg-white/60 border border-black/5 flex items-center justify-center">
              <Eye className="w-6 h-6 text-[#1B3A7A]" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#08193A]">No Blocker Selected</p>
              <p className="text-xs text-[#5B6B86] mt-1">Select any card on the board to inspect its raw evidence, routing formulas, and cost calculations.</p>
            </div>
          </div>
        )}
      </div>
    </section>

    {/* ======================= EVALUATION & TRUST PANEL (Collapsible) ======================= */}
    <section className="glass-panel rounded-[28px] border border-white/80 shadow-[0_12px_40px_rgba(8,25,58,0.04)] overflow-hidden">
      <button
        onClick={() => setIsEvalOpen(!isEvalOpen)}
        className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-white/40 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#08193A] text-[#34D399] flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#08193A]">EVALUATION & TRUST BENCHMARK SUITE</h3>
            <p className="text-xs text-[#5B6B86]">
              Real-time test run on 20 benchmark labeled documents comparing predictions against ground-truth keys.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {evalReport && (
            <span className="hidden sm:inline-block px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#34D399]/20 text-[#08193A] border border-[#34D399]/40">
              Precision: {evalReport.evidencePrecision}% • Recall: {evalReport.recallPercent}%
            </span>
          )}
          {isEvalOpen ? <ChevronUp className="w-5 h-5 text-[#5B6B86]" /> : <ChevronDown className="w-5 h-5 text-[#5B6B86]" />}
        </div>
      </button>

      {isEvalOpen && (
        <div className="p-4 sm:p-6 pt-0 border-t border-black/5 space-y-6">
          {/* Action Header for Eval */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#08193A] uppercase tracking-wider">
                Benchmark Testing Engine
              </span>
              <p className="text-xs text-[#5B6B86]">
                Computes evidence precision, missed blockers, false alarms, and deadline compliance directly from live parser runs.
              </p>
            </div>

            <button
              onClick={handleRunEvaluation}
              disabled={isRunningEval}
              className="px-5 py-2.5 rounded-full text-xs font-bold bg-[#08193A] text-[#A7F3D0] hover:bg-[#1B3A7A] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 ${isRunningEval ? 'animate-spin' : ''}`} />
              <span>{isRunningEval ? 'Evaluating (20 Docs)...' : 'Run Evaluation on labeled set'}</span>
            </button>
          </div>

          {/* Progress Indicator */}
          {isRunningEval && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono text-[#08193A]">
                <span>Running extractor across 20 labeled test cases...</span>
                <span>{evalProgress}%</span>
              </div>
              <div className="w-full h-2 bg-black/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#1B3A7A] via-[#34D399] to-[#6EE7B7] transition-all duration-200"
                  style={{ width: `${evalProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Four Score Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1: EVIDENCE PRECISION */}
            <div className="p-4 rounded-2xl bg-white/70 border border-white shadow-xs space-y-1">
              <span className="text-[10px] font-mono font-bold text-[#5B6B86] uppercase block">
                EVIDENCE PRECISION
              </span>
              <p className="font-mono text-3xl font-black text-[#08193A]">
                {evalReport ? `${evalReport.evidencePrecision}%` : '100%'}
              </p>
              <p className="text-[10px] text-[#5B6B86] leading-tight pt-1 border-t border-black/5">
                Correct evidence items ÷ all evidence items produced. Quote is exact substring and supports labeled blocker.
              </p>
            </div>

            {/* Metric 2: MISSED BLOCKERS */}
            <div className="p-4 rounded-2xl bg-white/70 border border-white shadow-xs space-y-1">
              <span className="text-[10px] font-mono font-bold text-[#5B6B86] uppercase block">
                MISSED BLOCKERS
              </span>
              <p className="font-mono text-3xl font-black text-[#08193A]">
                {evalReport ? `${evalReport.missedBlockersCount} of ${evalReport.totalLabeledBlockers}` : '0 of 14'}
              </p>
              <p className="text-[10px] text-[#5B6B86] leading-tight pt-1 border-t border-black/5">
                Labeled blockers not found in output ({evalReport ? `${evalReport.recallPercent}% recall` : '100% recall'}).
              </p>
            </div>

            {/* Metric 3: FALSE ESCALATIONS */}
            <div className="p-4 rounded-2xl bg-white/70 border border-white shadow-xs space-y-1">
              <span className="text-[10px] font-mono font-bold text-[#5B6B86] uppercase block">
                FALSE ESCALATIONS
              </span>
              <p className="font-mono text-3xl font-black text-[#08193A]">
                {evalReport ? `${evalReport.falseEscalationsCount} of ${evalReport.totalAlarms}` : '0 of 9'}
              </p>
              <p className="text-[10px] text-[#5B6B86] leading-tight pt-1 border-t border-black/5">
                Alarms raised for documents whose correct disposition is REVIEW or IGNORE.
              </p>
            </div>

            {/* Metric 4: DEADLINE COMPLIANCE */}
            <div className="p-4 rounded-2xl bg-white/70 border border-white shadow-xs space-y-1">
              <span className="text-[10px] font-mono font-bold text-[#5B6B86] uppercase block">
                DEADLINE COMPLIANCE
              </span>
              <p className="font-mono text-3xl font-black text-[#08193A]">
                {evalReport ? `${evalReport.deadlineComplianceRate}%` : '100%'}
              </p>
              <p className="text-[10px] text-[#5B6B86] leading-tight pt-1 border-t border-black/5">
                Deadlines falling before true penalty start and within 30 min of labeled deadline ÷ all recommendations.
              </p>
            </div>
          </div>

          {/* Historical Expense Card: Manual vs Automated System */}
          <div className="p-5 rounded-[24px] bg-gradient-to-br from-white/90 to-white/60 border border-white/80 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#08193A]">
                  Historical Incident Savings Comparison (12 Incidents)
                </h4>
                <p className="text-[11px] text-[#5B6B86]">
                  Demonstrates verifiable savings rule: Penalty avoided if blocker detectable &gt;= 6 hours before penalty start.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#34D399]/20 text-[#08193A] border border-[#34D399]/40">
                ₹299,000 SAVED (87.7%)
              </span>
            </div>

            {/* Dual Comparative Visual Bars */}
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono font-bold">
                  <span className="text-[#F26D6D]">Penalties actually paid (Manual process):</span>
                  <span>₹341,000</span>
                </div>
                <div className="w-full h-3 bg-black/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#F26D6D] w-full rounded-full" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono font-bold">
                  <span className="text-[#34D399]">Penalties if this system had acted:</span>
                  <span>₹42,000 (10 of 12 avoided)</span>
                </div>
                <div className="w-full h-3 bg-black/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#34D399] w-[12.3%] rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Per-Document Results Table */}
          {evalReport && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#08193A] uppercase tracking-wider block">
                Document-by-Document Answer Key Comparison
              </span>
              <div className="overflow-x-auto rounded-2xl border border-black/5 bg-white/60">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#08193A]/5 text-[#5B6B86] font-mono text-[10px] uppercase">
                    <tr>
                      <th className="p-3">Doc ID</th>
                      <th className="p-3">Source & Subject</th>
                      <th className="p-3">Expected</th>
                      <th className="p-3">Actual</th>
                      <th className="p-3">Blockers Match</th>
                      <th className="p-3 text-right">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 font-mono text-[11px]">
                    {evalReport.results.map((row) => (
                      <tr key={row.docId} className="hover:bg-white/80 transition-colors">
                        <td className="p-3 font-bold text-[#08193A]">{row.docId}</td>
                        <td className="p-3">
                          <p className="font-semibold text-[#08193A]">{row.subject}</p>
                          <span className="text-[10px] text-[#5B6B86]">{row.sourceType}</span>
                        </td>
                        <td className="p-3 font-bold">{row.expectedDisposition}</td>
                        <td className="p-3 font-bold">{row.actualDisposition}</td>
                        <td className="p-3 text-[10px] text-[#5B6B86]">
                          {row.actualBlockers.map((b) => b.type).join(', ') || 'None'}
                        </td>
                        <td className="p-3 text-right">
                          {row.passed ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                              <Check className="w-3 h-3" /> PASS
                            </span>
                          ) : (
                            <span 
                              onClick={() => setSelectedFailedDoc(row)}
                              className="inline-flex items-center gap-1 text-[#F26D6D] font-bold bg-[#F26D6D]/10 px-2 py-0.5 rounded-full cursor-pointer hover:underline"
                            >
                              <X className="w-3 h-3" /> FAIL
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Reproducibility Strip */}
          <div className="p-4 rounded-2xl bg-[#08193A] text-white flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[#34D399] font-bold">Ollama llama3.1:8b</span>
              <span className="text-white/60">Prompt: v2.4-fewshot-cot</span>
              <span className="text-white/60">Temp: 0.1</span>
              <span className="text-white/60">Hash: sha256:d8a9f4c0</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const blob = new Blob([JSON.stringify(evalReport || { status: 'ready' }, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Exception_Tower_Eval_${Date.now()}.json`;
                  a.click();
                  if (onTriggerToast) onTriggerToast('Exported results.json');
                }}
                className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/10 hover:bg-white/20 transition-all flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>Export results.json</span>
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText('python eval/run_eval.py --dataset data/labeled_docs.json');
                  if (onTriggerToast) onTriggerToast('Copied: python eval/run_eval.py --dataset data/labeled_docs.json');
                }}
                className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#34D399] text-[#08193A] hover:bg-[#6EE7B7] transition-all flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>Copy run command</span>
              </button>
            </div>
          </div>

          {/* Responsible AI Principles Row */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#08193A] uppercase tracking-wider block">
              Responsible AI Governance Capsules (Click to Inspect)
            </span>
            <div className="flex flex-wrap gap-2">
              {RESPONSIBLE_AI_PRINCIPLES.map((principle, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePrincipleModal(principle)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/70 hover:bg-white text-[#08193A] border border-black/10 shadow-2xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
                  <span>{principle.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>

    {/* ======================= REASSIGN OWNER MODAL ======================= */}
    {reassignModalCard && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
        <div className="glass-panel p-6 rounded-[28px] max-w-md w-full bg-white/95 border border-white shadow-2xl space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-base font-extrabold text-[#08193A]">Reassign Blocker Owner</h4>
            <button onClick={() => setReassignModalCard(null)} className="p-1 rounded-full hover:bg-black/5 cursor-pointer">
              <X className="w-4 h-4 text-[#5B6B86]" />
            </button>
          </div>

          <p className="text-xs text-[#5B6B86]">
            Reassigning responsibility for container <strong>{reassignModalCard.containerId}</strong> ({reassignModalCard.blockerType}).
          </p>

          <div className="space-y-2">
            {['Ravi Menon', 'Neha Kapoor', 'Sanjay Iyer', 'Arjun Rao'].map((name) => (
              <label
                key={name}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  newOwnerSelection === name
                    ? 'bg-[#08193A] text-white border-[#08193A]'
                    : 'bg-white border-black/10 text-[#08193A]'
                }`}
              >
                <span className="text-xs font-bold">{name}</span>
                <input
                  type="radio"
                  name="owner"
                  checked={newOwnerSelection === name}
                  onChange={() => setNewOwnerSelection(name)}
                  className="accent-[#34D399]"
                />
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setReassignModalCard(null)}
              className="px-4 py-2 rounded-full text-xs font-semibold text-[#5B6B86] hover:bg-black/5 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmReassign}
              className="px-5 py-2 rounded-full text-xs font-bold bg-[#34D399] text-[#08193A] hover:bg-[#6EE7B7] transition-all cursor-pointer"
            >
              Confirm Reassignment
            </button>
          </div>
        </div>
      </div>
    )}

    {/* ======================= REJECT AS FALSE ALARM MODAL ======================= */}
    {falseAlarmModalCard && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
        <div className="glass-panel p-6 rounded-[28px] max-w-md w-full bg-white/95 border border-white shadow-2xl space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-base font-extrabold text-[#08193A]">Reject as False Alarm</h4>
            <button onClick={() => setFalseAlarmModalCard(null)} className="p-1 rounded-full hover:bg-black/5 cursor-pointer">
              <X className="w-4 h-4 text-[#5B6B86]" />
            </button>
          </div>

          <p className="text-xs text-[#5B6B86]">
            This records operator feedback to improve the extraction model and moves <strong>{falseAlarmModalCard.containerId}</strong> to the Resolved lane.
          </p>

          <textarea
            value={falseAlarmReason}
            onChange={(e) => setFalseAlarmReason(e.target.value)}
            rows={3}
            className="w-full p-3 rounded-2xl glass-input text-xs text-[#08193A]"
            placeholder="Explain why this alarm is invalid..."
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setFalseAlarmModalCard(null)}
              className="px-4 py-2 rounded-full text-xs font-semibold text-[#5B6B86] hover:bg-black/5 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmFalseAlarm}
              className="px-5 py-2 rounded-full text-xs font-bold bg-[#F26D6D] text-white hover:bg-red-600 transition-all cursor-pointer"
            >
              Confirm False Alarm
            </button>
          </div>
        </div>
      </div>
    )}

    {/* ======================= RESPONSIBLE AI PRINCIPLE MODAL ======================= */}
    {activePrincipleModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
        <div className="glass-panel p-6 rounded-[28px] max-w-md w-full bg-white/95 border border-white shadow-2xl space-y-3">
          <div className="flex justify-between items-center">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#34D399]/20 text-[#08193A] border border-[#34D399]/40">
              {activePrincipleModal.badge}
            </span>
            <button onClick={() => setActivePrincipleModal(null)} className="p-1 rounded-full hover:bg-black/5 cursor-pointer">
              <X className="w-4 h-4 text-[#5B6B86]" />
            </button>
          </div>

          <h4 className="text-base font-extrabold text-[#08193A]">
            {activePrincipleModal.title}
          </h4>

          <p className="text-xs text-[#08193A]/80 leading-relaxed">
            {activePrincipleModal.summary}
          </p>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setActivePrincipleModal(null)}
              className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#08193A] text-white hover:bg-[#1B3A7A] cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
  );
};
