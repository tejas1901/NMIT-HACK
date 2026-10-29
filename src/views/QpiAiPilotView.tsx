import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Paperclip, 
  Sparkles, 
  CloudRain, 
  Wind, 
  Navigation,
  CreditCard,
  CheckCircle2,
  Package,
  ArrowRight
} from 'lucide-react';
import { ChatMessage, CheckoutItem } from '../types';

interface QpiAiPilotProps {
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
  userName?: string;
  userRole?: string;
  onInitiateCheckout?: (item: CheckoutItem) => void;
}

export const QpiAiPilotView: React.FC<QpiAiPilotProps> = ({ 
  initialPrompt, 
  onClearInitialPrompt,
  userName = 'Customer',
  userRole = 'customer',
  onInitiateCheckout
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'pilot',
      text: `Hello ${userName}! I am your FreightIQ Assistant.\n\nI can help you check your shipments, monitor weather along highway routes, or book a haul for you right away. If you'd like to book, simply tell me where you want to send your cargo (e.g. "Book a haul from Mumbai to Pune") and I'll arrange it and open the payment page for you!`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      dataBadges: ['FreightIQ Assistant', 'Active GPS Radar', 'Instant Booking Ready']
    }
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const promptChips = [
    { label: 'How are my active shipments?', icon: Package },
    { label: 'Any rain or delays on the highway?', icon: CloudRain },
    { label: 'Book a haul from Mumbai to Pune', icon: Sparkles },
    { label: 'Book a truck from Bengaluru to Chennai', icon: Sparkles }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Handle passed initial prompt from sidebar quick assistant
  useEffect(() => {
    if (initialPrompt) {
      handleSendMessage(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  const handleSendMessage = (queryText?: string) => {
    const text = queryText || inputVal;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = '';
      let badges: string[] = [];
      let actionItem: CheckoutItem | undefined = undefined;
      let actionLabel: string | undefined = undefined;

      const queryLower = text.toLowerCase();

      // Check if user is asking to book or request a haul
      const isBooking = 
        queryLower.includes('book') || 
        queryLower.includes('booking') || 
        queryLower.includes('reserve') || 
        queryLower.includes('hire') || 
        queryLower.includes('rent a truck') ||
        queryLower.includes('haul') || 
        queryLower.includes('ship cargo') || 
        queryLower.includes('send cargo') ||
        queryLower.includes('order');

      if (isBooking) {
        // Parse cities or default to popular corridor
        let origin = 'Mumbai JNPT Port Gate 4';
        let destination = 'Pune Logistics Hub, Chakan';
        let priceInr = 24500;

        if ((queryLower.includes('bengaluru') || queryLower.includes('bangalore')) && queryLower.includes('chennai')) {
          origin = 'Bengaluru Logistics Park, Whitefield';
          destination = 'Chennai Harbour Terminal Dock 3';
          priceInr = 28000;
        } else if (queryLower.includes('delhi') && queryLower.includes('mumbai')) {
          origin = 'Delhi NCR Logistics Hub';
          destination = 'Mumbai Nhava Sheva Port Gate 4';
          priceInr = 48000;
        } else if (queryLower.includes('pune') && (queryLower.includes('mumbai') || queryLower.includes('jnpt'))) {
          origin = 'Mumbai JNPT Port Gate 4';
          destination = 'Pune Logistics Hub, Chakan';
          priceInr = 24500;
        } else if (queryLower.includes('chennai')) {
          origin = 'Bengaluru Logistics Park';
          destination = 'Chennai Harbour Terminal';
          priceInr = 28000;
        }

        actionItem = {
          type: 'CONSIGNMENT',
          title: `Express Haul: ${origin} → ${destination}`,
          subtitle: 'Full 24-Ton Truckload • Monitored Corridor Transit',
          referenceId: `CRG-BK-${Math.floor(10000 + Math.random() * 90000)}`,
          priceUsd: Math.round(priceInr / 83),
          priceInr: priceInr,
          metadata: {
            Origin: origin,
            Destination: destination,
            Cargo: 'Commercial Intermodal Freight',
            Weight: '24,000 kg',
            TransitTime: '5-7 Hours',
            type: 'CONSIGNMENT'
          }
        };

        actionLabel = `Open Payment Page (₹${priceInr.toLocaleString('en-IN')})`;
        reply = `I have set up your booking from ${origin} to ${destination} for ₹${priceInr.toLocaleString('en-IN')}.\n\nI am opening the payment page for you right now so you can enter your payment details manually and confirm your haul!`;
        badges = ['Booking Created', `${origin} → ${destination}`, `Total: ₹${priceInr.toLocaleString('en-IN')}`];

        // Automatically trigger the payment checkout modal as requested by user
        if (onInitiateCheckout && actionItem) {
          const itemToCheckout = actionItem;
          setTimeout(() => {
            onInitiateCheckout(itemToCheckout);
          }, 600);
        }
      } else if (queryLower.includes('weather') || queryLower.includes('risk') || queryLower.includes('rain')) {
        reply = "Weather update: The highway route has light drizzle near Khandala Ghat, but the roads remain open and our drivers are driving carefully at safe speeds. All your shipments are completely safe with no significant delays.";
        badges = ['Weather: Light Drizzle', 'Route: Safe Speeds', 'Status: On Track'];
      } else if (queryLower.includes('shipment') || queryLower.includes('track') || queryLower.includes('cargo') || queryLower.includes('status')) {
        reply = "Status update: All your active shipments are moving smoothly on highway NH-48. GPS tracking is active and your deliveries are scheduled to arrive on time with no delays.";
        badges = ['Active Shipments: 100% On Time', 'GPS: Active', 'Delays: None'];
      } else if (queryLower.includes('nh-48') || queryLower.includes('corridor') || queryLower.includes('highway')) {
        reply = "Highway update: The NH-48 corridor from Bengaluru to Mumbai is moving normally. Traffic flow is smooth and estimated delivery times are right on schedule.";
        badges = ['Highway NH-48: Clear', 'Traffic: Normal', 'Delivery: On Schedule'];
      } else {
        reply = `I'm here to help! All your shipments are active and running safely. You can ask me about route weather, check delivery status, or simply say "Book a haul from Mumbai to Pune" and I will create the booking and open the payment page for you.`;
        badges = ['Status: All Clear', 'Tracking: Live'];
      }

      const pilotMsg: ChatMessage = {
        id: `plt-${Date.now()}`,
        sender: 'pilot',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        dataBadges: badges,
        actionItem,
        actionLabel
      };

      setMessages((prev) => [...prev, pilotMsg]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <div className="space-y-6 pb-12 flex flex-col h-[calc(100vh-140px)]">
      {/* Title & Subtitle */}
      <div className="shrink-0">
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#08193A] tracking-tight">
          FreightIQ Assistant
        </h1>
        <p className="text-xs md:text-sm text-[#5B6B86] mt-1 max-w-4xl leading-relaxed">
          Your personal shipping assistant. Ask questions about your shipments, check weather along the highway, or ask to book a new truck haul.
        </p>
      </div>

      {/* Main Glass Chat Container */}
      <div className="flex-1 glass-panel rounded-[32px] p-4 md:p-6 flex flex-col justify-between overflow-hidden shadow-md">
        {/* Top Strip: QUICK PROMPT CHIPS */}
        <div className="pb-4 border-b border-[#08193A]/10 shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#34D399]" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#5B6B86]">
              Quick Assistant Options:
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {promptChips.map((chip, idx) => {
              const Icon = chip.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip.label)}
                  className="px-3.5 py-1.5 rounded-full bg-white/70 hover:bg-white text-[#08193A] font-semibold border border-white/90 shadow-2xs flex items-center gap-1.5 shrink-0 transition-all liquid-btn cursor-pointer"
                >
                  <Icon className="w-3.5 h-3.5 text-[#1B3A7A]" />
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-2">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-[75%] ${isUser ? 'ml-auto' : 'mr-auto'}`}
              >
                <div
                  className={`p-4 rounded-[24px] shadow-xs text-xs md:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-[#08193A] text-white rounded-br-xs'
                      : 'bg-[#A7F3D0]/30 border border-[#34D399]/40 text-[#08193A] rounded-bl-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 pb-1 border-b border-white/10 mb-1.5">
                    <span className="font-bold text-[11px] uppercase tracking-wider">
                      {isUser ? userName : 'FreightIQ Assistant'}
                    </span>
                    <span className={`text-[10px] font-mono ${isUser ? 'text-white/60' : 'text-[#5B6B86]'}`}>
                      {msg.timestamp}
                    </span>
                  </div>

                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Booking Action Button (opens payment modal manually) */}
                  {msg.actionItem && onInitiateCheckout && (
                    <div className="mt-3 pt-2.5 border-t border-black/10">
                      <button
                        type="button"
                        onClick={() => onInitiateCheckout(msg.actionItem!)}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-full text-xs font-bold bg-[#08193A] text-white hover:bg-[#1B3A7A] shadow-md liquid-btn flex items-center justify-center gap-2 cursor-pointer transition-all"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-[#34D399]" />
                        <span>{msg.actionLabel || 'Open Payment Page'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Grounded Data Badges */}
                  {msg.dataBadges && msg.dataBadges.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-2.5 mt-2 border-t border-black/5">
                      {msg.dataBadges.map((badge, bIdx) => (
                        <span
                          key={bIdx}
                          className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/70 text-[#08193A] border border-white"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-2 p-3.5 rounded-[22px] bg-[#A7F3D0]/25 border border-[#34D399]/30 text-xs text-[#08193A] w-fit">
              <Bot className="w-4 h-4 text-[#34D399] animate-spin" />
              <span className="font-semibold">Assistant is preparing an answer...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Floating Glass Message Composer at Bottom */}
        <div className="pt-3 border-t border-[#08193A]/10 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 relative"
          >
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask about shipments, weather, or type 'Book a haul from Mumbai to Pune'..."
              className="flex-1 px-4 py-2.5 rounded-full text-xs md:text-sm font-medium glass-input text-[#08193A] placeholder-[#5B6B86]/70 shadow-xs"
            />

            <button
              type="submit"
              disabled={!inputVal.trim() || isTyping}
              aria-label="Send Message"
              className="px-4 py-2.5 rounded-full text-xs font-bold bg-[#08193A] text-white hover:bg-[#1B3A7A] transition-all liquid-btn shadow-xs flex items-center gap-1.5 shrink-0 disabled:opacity-50 cursor-pointer"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5 text-[#34D399]" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
