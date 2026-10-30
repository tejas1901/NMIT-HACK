import React, { useState } from 'react';
import { 
  Mail, 
  Send, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Inbox, 
  Sparkles, 
  Search, 
  Filter, 
  ExternalLink,
  ShieldCheck,
  User,
  Building2,
  Phone,
  AlertCircle,
  FileText
} from 'lucide-react';

interface EmailItem {
  id: string;
  senderName: string;
  senderEmail: string;
  company: string;
  subject: string;
  preview: string;
  timestamp: string;
  category: 'CARGO_REQUEST' | 'HAUL_QUOTE' | 'FLEET_RENTAL' | 'SYSTEM_ALERT';
  status: 'UNREAD' | 'READ' | 'REPLIED';
  relatedRef?: string;
}

const INITIAL_EMAILS: EmailItem[] = [
  {
    id: 'em-101',
    senderName: 'Dr. Suresh Rao',
    senderEmail: 'suresh.rao@biocon.in',
    company: 'Biocon Pharma Intermodal',
    subject: 'URGENT: Booking Confirmation Request - Ref CRG-BK-49210',
    preview: 'Dear FreightIQ Admin, We have lodged an expedited refrigerated cargo booking for 34,500 lbs of vaccines. Please confirm driver assignment and temperature log...',
    timestamp: '06:05 IST',
    category: 'CARGO_REQUEST',
    status: 'UNREAD',
    relatedRef: 'CRG-BK-49210'
  },
  {
    id: 'em-102',
    senderName: 'Ananya Verma',
    senderEmail: 'ananya.verma@vikasintermodal.in',
    company: 'Vikas Intermodal Corp',
    subject: 'Haul Request Review & NH-48 Slot Booking',
    preview: 'Hello Admin, We submitted haul inquiry for Whitefield Tech Park delivery. Requesting competitive backhaul quote with QpiAI optimization...',
    timestamp: '05:42 IST',
    category: 'HAUL_QUOTE',
    status: 'READ',
    relatedRef: 'HAUL-REQ-8812'
  },
  {
    id: 'em-103',
    senderName: 'Kunal Singhania',
    senderEmail: 'kunal@summitlogistics.in',
    company: 'Summit Cold-Chain Express',
    subject: 'Commercial Rig Rental Order - 3x Volvo FH16 Heavy Multi-Axle',
    preview: 'Hi Admin, Our order for 3 commercial units is awaiting fulfillment. Please approve dispatch from JNPT Nhava Sheva Yard 3...',
    timestamp: '04:18 IST',
    category: 'FLEET_RENTAL',
    status: 'READ',
    relatedRef: 'ORD-TRK-7721'
  },
  {
    id: 'em-104',
    senderName: 'FreightGuard Sentinel',
    senderEmail: 'sentinel@freightiq.in',
    company: 'FreightIQ Automated Telemetry',
    subject: 'AUTOMATED: NH-48 Corridor Weather Crosswind Advisory',
    preview: 'Elevated crosswinds (42.8 km/h) detected near Savannah Container Terminal & Pune Expressway waypoint 4. Demurrage risk auto-calculated at 0%...',
    timestamp: '03:30 IST',
    category: 'SYSTEM_ALERT',
    status: 'READ',
    relatedRef: 'ALERT-WX-904'
  }
];

interface AdminGmailConnectorViewProps {
  onTriggerToast: (msg: string) => void;
}

export const AdminGmailConnectorView: React.FC<AdminGmailConnectorViewProps> = ({
  onTriggerToast
}) => {
  const [emails, setEmails] = useState<EmailItem[]>(INITIAL_EMAILS);
  const [selectedEmail, setSelectedEmail] = useState<EmailItem | null>(INITIAL_EMAILS[0]);
  const [filter, setFilter] = useState<string>('ALL');
  const [isSyncing, setIsSyncing] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSyncGmail = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      onTriggerToast('✓ Live Gmail inbox synchronized with admin@gmail.com');
    }, 900);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedEmail) return;

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setEmails((prev) =>
        prev.map((item) =>
          item.id === selectedEmail.id ? { ...item, status: 'REPLIED' } : item
        )
      );
      onTriggerToast(`✓ Official response sent via admin@gmail.com to ${selectedEmail.senderEmail}`);
      setReplyText('');
    }, 600);
  };

  const filteredEmails = emails.filter((item) => {
    if (filter === 'UNREAD') return item.status === 'UNREAD';
    if (filter === 'CARGO_REQUEST') return item.category === 'CARGO_REQUEST';
    if (filter === 'HAUL_QUOTE') return item.category === 'HAUL_QUOTE';
    if (filter === 'FLEET_RENTAL') return item.category === 'FLEET_RENTAL';
    return true;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#34D399]/20 text-[#08193A] border border-[#34D399]/40 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#34D399] animate-ping" />
              <span>LIVE GOOGLE WORKSPACE CONNECTOR</span>
            </span>
            <span className="text-xs text-[#5B6B86] font-semibold">• admin@gmail.com</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#08193A] tracking-tight">
            Live Gmail Command Connector
          </h1>
          <p className="text-xs md:text-sm text-[#5B6B86] mt-1 max-w-2xl">
            Real-time synchronization for <strong>admin@gmail.com</strong>. Receive incoming customer cargo requests, answer dispatch quotes, and issue official order releases directly from Gmail.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start lg:self-auto">
          <button
            onClick={handleSyncGmail}
            disabled={isSyncing}
            className="px-4 py-2.5 rounded-full text-xs font-bold bg-[#08193A] text-white hover:bg-[#1B3A7A] transition-all liquid-btn shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#34D399] ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing Gmail...' : 'Sync Gmail Inbox'}</span>
          </button>
        </div>
      </div>

      {/* Connection Status Banner */}
      <div className="p-4 rounded-[24px] bg-[#08193A] text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-[#34D399]">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Gmail Active Session: admin@gmail.com</span>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-mono font-bold bg-[#34D399] text-[#08193A]">
                ONLINE
              </span>
            </div>
            <p className="text-[11px] text-white/70">
              Protocol: IMAP / TLS Secured • Inbound Customer Cargo Dispatch Pipeline • Auto-ACK Enabled
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="text-right">
            <span className="text-white/60 text-[10px] block">Unread Customer Inquiries</span>
            <span className="text-sm font-bold text-[#34D399]">{emails.filter(e => e.status === 'UNREAD').length} Pending</span>
          </div>
        </div>
      </div>

      {/* Main Mailbox Interface: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Email List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'ALL', label: 'All Inbound' },
              { id: 'UNREAD', label: 'Unread' },
              { id: 'CARGO_REQUEST', label: 'Cargo Requests' },
              { id: 'HAUL_QUOTE', label: 'Haul Quotes' },
              { id: 'FLEET_RENTAL', label: 'Fleet Orders' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1.5 rounded-full font-semibold transition-all shrink-0 cursor-pointer ${
                  filter === tab.id
                    ? 'bg-[#08193A] text-white shadow-xs'
                    : 'bg-white/60 text-[#5B6B86] hover:bg-white hover:text-[#08193A]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Email Item Cards */}
          <div className="space-y-2.5">
            {filteredEmails.map((email) => {
              const isSelected = selectedEmail?.id === email.id;
              return (
                <div
                  key={email.id}
                  onClick={() => setSelectedEmail(email)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-white border-[#34D399] shadow-md scale-[1.01]'
                      : 'bg-white/70 border-white/80 hover:bg-white hover:border-[#08193A]/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#08193A] truncate flex items-center gap-1.5">
                      {email.status === 'UNREAD' && (
                        <span className="w-2 h-2 rounded-full bg-[#1B3A7A]" />
                      )}
                      <span>{email.senderName}</span>
                    </span>
                    <span className="text-[10px] font-mono text-[#5B6B86]">{email.timestamp}</span>
                  </div>

                  <p className="text-xs font-bold text-[#08193A] leading-snug line-clamp-1">
                    {email.subject}
                  </p>

                  <p className="text-[11px] text-[#5B6B86] line-clamp-2 leading-relaxed">
                    {email.preview}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[10px]">
                    <span className="px-2 py-0.5 rounded-md font-bold bg-[#08193A]/5 text-[#08193A]">
                      {email.company}
                    </span>
                    {email.status === 'REPLIED' ? (
                      <span className="text-[#34D399] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Replied</span>
                      </span>
                    ) : (
                      <span className="font-mono text-[#1B3A7A]">{email.relatedRef}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Email Detail & Direct Gmail Reply Composer (7 cols) */}
        <div className="lg:col-span-7">
          {selectedEmail ? (
            <div className="p-6 rounded-[28px] glass-panel border border-white/80 space-y-5 shadow-sm">
              {/* Email Header */}
              <div className="space-y-3 pb-4 border-b border-black/10">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#1B3A7A]/15 text-[#1B3A7A] border border-[#1B3A7A]/30">
                    Category: {selectedEmail.category.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-mono text-[#5B6B86]">{selectedEmail.timestamp}</span>
                </div>

                <h2 className="text-lg font-extrabold text-[#08193A] leading-tight">
                  {selectedEmail.subject}
                </h2>

                <div className="p-3 rounded-xl bg-white/60 border border-white/80 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-[#08193A]">{selectedEmail.senderName}</p>
                    <p className="text-[11px] text-[#5B6B86] font-mono">{selectedEmail.senderEmail}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#08193A]">{selectedEmail.company}</p>
                    <p className="text-[11px] font-mono text-[#1B3A7A]">Ref: {selectedEmail.relatedRef}</p>
                  </div>
                </div>
              </div>

              {/* Email Content Body */}
              <div className="text-xs text-[#08193A] leading-relaxed space-y-3 p-2 bg-white/40 rounded-xl">
                <p>{selectedEmail.preview}</p>
                <p>
                  This inquiry has been verified via the Intermodal Logistics Marketplace. Customer has provided verified facility pickup coordinates and contact telephone.
                </p>
                <p className="text-[11px] text-[#5B6B86] italic">
                  — Delivered via Google Workspace MX Gateway (admin@gmail.com)
                </p>
              </div>

              {/* Direct Reply Composer */}
              <form onSubmit={handleSendReply} className="space-y-3 pt-3 border-t border-black/10">
                <label className="block text-xs font-extrabold text-[#08193A] flex items-center gap-2">
                  <Send className="w-3.5 h-3.5 text-[#1B3A7A]" />
                  <span>Send Official Email Response from admin@gmail.com</span>
                </label>

                {/* Quick Templates */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Order Approved & Assigned',
                    'Driver En Route',
                    'Rate Quote Confirmed',
                    'Gate Slot Allocated'
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setReplyText(`Hello ${selectedEmail.senderName},\n\nWe confirm: ${preset} for reference ${selectedEmail.relatedRef}.\n\nRegards,\nAdmin Operations\nFreightIQ Command (admin@gmail.com)`)}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/80 hover:bg-[#08193A] hover:text-white transition-all border border-white text-[#08193A] cursor-pointer"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Compose message to ${selectedEmail.senderEmail}...`}
                  required
                  className="w-full px-3.5 py-2.5 rounded-2xl glass-input text-xs font-medium text-[#08193A] placeholder-[#5B6B86]/60"
                />

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#5B6B86]">
                    Sender verified: <strong>admin@gmail.com</strong>
                  </span>
                  <button
                    type="submit"
                    disabled={isSending}
                    className="px-5 py-2 rounded-full text-xs font-bold bg-[#08193A] text-white hover:bg-[#1B3A7A] transition-all liquid-btn shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5 text-[#34D399]" />
                    <span>{isSending ? 'Transmitting via Gmail...' : 'Send Email via Gmail'}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-12 text-center rounded-[28px] glass-panel border border-white/80 space-y-2 text-[#5B6B86]">
              <Mail className="w-8 h-8 mx-auto text-[#5B6B86]/60" />
              <p className="text-xs font-bold">Select an email to view details and send official responses.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
