import { LabeledDoc, HistoricalIncident, ExceptionBlockerType } from '../types';

export const DEMURRAGE_RATE_PER_DAY_INR = 14000;
export const DETENTION_RATE_PER_HR_INR = 1800;

export interface OwnerProfile {
  name: string;
  role: string;
  avatar: string;
  why: string;
}

export const OWNER_ROUTING: Record<ExceptionBlockerType, OwnerProfile> = {
  CUSTOMS_HOLD: {
    name: 'Ravi Menon',
    role: 'Documentation Desk',
    avatar: 'RM',
    why: 'Assigned by rule: All ICEGATE, duty verification, and customs examination blocks route to Documentation Desk lead.'
  },
  MISSING_DOCUMENT: {
    name: 'Neha Kapoor',
    role: 'Shipper Liaison',
    avatar: 'NK',
    why: 'Assigned by rule: Unapproved draft BL, missing commercial invoices, and consignee gate approvals route to Shipper Liaison.'
  },
  FREE_TIME_EXPIRING: {
    name: 'Sanjay Iyer',
    role: 'Terminal Coordinator',
    avatar: 'SI',
    why: 'Assigned by rule: Terminal ground storage clocks, ocean carrier free days, and demurrage limits route to Terminal Coordinator.'
  },
  NO_TRUCK_BOOKED: {
    name: 'Arjun Rao',
    role: 'Transport Desk',
    avatar: 'AR',
    why: 'Assigned by rule: Dispatch capacity shortages, unassigned tenders, and missing drayage trucks route to Transport Desk.'
  },
  SLOT_UNAVAILABLE: {
    name: 'Sanjay Iyer',
    role: 'Terminal Coordinator',
    avatar: 'SI',
    why: 'Assigned by rule: Terminal gate congestion, dock bottlenecks, and waiting gate queues route to Terminal Coordinator.'
  }
};

/**
 * 20 Labeled Documents for Exception Control Tower
 * Seeded with Thu 29 Oct 2026 timeline.
 * D01–D10 exact user specification.
 * D11–D20 synthetic test suite (duplicates, traps, ambiguous reviews, ignores).
 */
export const LABELED_DOCUMENTS: LabeledDoc[] = [
  // D01
  {
    docId: 'D01',
    sourceType: 'Email',
    receivedAt: 'Thu 29 Oct 09:14',
    subject: 'MSKU4821937 – Customs release ON HOLD',
    text: 'Subject: MSKU4821937 – Customs release ON HOLD. Hi team, customs release for MSKU4821937 is on hold pending the commercial invoice. Free time at JNPT ends Fri 30 Oct 18:00; demurrage of INR 14,000/day applies after that. Please revert asap. – Maersk Ops',
    answerKey: {
      disposition: 'ESCALATE',
      blockers: [
        {
          containerId: 'MSKU4821937',
          type: 'CUSTOMS_HOLD',
          evidenceQuote: 'customs release for MSKU4821937 is on hold pending the commercial invoice',
          penaltyStart: '2026-10-30T18:00:00',
          actionDeadline: '2026-10-30T12:00:00',
          owner: 'Ravi Menon',
          confidence: 0.94
        }
      ],
      note: 'High-confidence customs hold. Demurrage rate specified explicitly.'
    }
  },
  // D02
  {
    docId: 'D02',
    sourceType: 'Internal note',
    receivedAt: 'Wed 28 Oct 21:40',
    subject: 'TGHU7390125 draft BL approval delay',
    text: 'Note (Neha, 28 Oct 21:40): TGHU7390125 – shipper has not approved the draft Bill of Lading, so the carrier will not issue the delivery order. Free days end Sat 31 Oct 23:59.',
    answerKey: {
      disposition: 'ESCALATE',
      blockers: [
        {
          containerId: 'TGHU7390125',
          type: 'MISSING_DOCUMENT',
          evidenceQuote: 'shipper has not approved the draft Bill of Lading, so the carrier will not issue the delivery order',
          penaltyStart: '2026-10-31T23:59:00',
          actionDeadline: '2026-10-31T17:59:00',
          owner: 'Neha Kapoor',
          confidence: 0.91
        }
      ],
      note: 'Missing DO issuance due to unapproved draft BL.'
    }
  },
  // D03
  {
    docId: 'D03',
    sourceType: 'Terminal feed',
    receivedAt: 'Thu 29 Oct 16:05',
    subject: 'JNPT-FEED CMAU2254810 Discharged Notice',
    text: 'JNPT-FEED 29-OCT 16:05 | CMAU2254810 | STATUS: DISCHARGED | DO: ISSUED | CUSTOMS: CLEARED | FREE TIME LEFT: 1 DAY',
    answerKey: {
      disposition: 'ESCALATE',
      blockers: [
        {
          containerId: 'CMAU2254810',
          type: 'FREE_TIME_EXPIRING',
          evidenceQuote: 'FREE TIME LEFT: 1 DAY',
          penaltyStart: '2026-10-30T16:05:00',
          actionDeadline: '2026-10-30T10:05:00',
          owner: 'Sanjay Iyer',
          confidence: 0.95
        }
      ],
      note: 'One day free time remaining on discharged terminal container.'
    }
  },
  // D04
  {
    docId: 'D04',
    sourceType: 'Email',
    receivedAt: 'Thu 29 Oct 11:20',
    subject: 'MRKU6610473 ready for pickup',
    text: 'Subject: MRKU6610473 ready for pickup. Customs cleared and DO issued today. We still have no truck booked for this container; consignee needs delivery by Sat 31 Oct. – Priya, Consignee Desk',
    answerKey: {
      disposition: 'ESCALATE',
      blockers: [
        {
          containerId: 'MRKU6610473',
          type: 'NO_TRUCK_BOOKED',
          evidenceQuote: 'We still have no truck booked for this container',
          penaltyStart: null,
          actionDeadline: '2026-10-30T23:59:00',
          owner: 'Arjun Rao',
          confidence: 0.89
        }
      ],
      note: 'No truck booked; required delivery is Sat 31 Oct so action deadline is Fri 30 Oct 23:59.'
    }
  },
  // D05
  {
    docId: 'D05',
    sourceType: 'Email',
    receivedAt: 'Thu 29 Oct 15:30',
    subject: 'HLXU3348092 gate slot',
    text: 'Subject: HLXU3348092 gate slot. Terminal confirms no gate-in/out slot is available until Mon 2 Nov 09:00. Truck KA-01-FQ-2048 is already waiting at Gate 1. Detention on the truck is INR 1,800/hr.',
    answerKey: {
      disposition: 'ESCALATE',
      blockers: [
        {
          containerId: 'HLXU3348092',
          type: 'SLOT_UNAVAILABLE',
          evidenceQuote: 'no gate-in/out slot is available until Mon 2 Nov 09:00',
          penaltyStart: '2026-10-29T15:30:00',
          actionDeadline: '2026-10-29T16:30:00',
          owner: 'Sanjay Iyer',
          confidence: 0.96
        }
      ],
      note: 'Immediate detention accruing on waiting truck at Gate 1.'
    }
  },
  // D06
  {
    docId: 'D06',
    sourceType: 'Email',
    receivedAt: 'Thu 29 Oct 14:40',
    subject: 'OOLU9127365 gate-out completed',
    text: 'Subject: OOLU9127365 gate-out completed 14:20 today. POD received from consignee. Nothing pending.',
    answerKey: {
      disposition: 'IGNORE',
      blockers: [],
      note: 'Resolved, should not escalate.'
    }
  },
  // D07
  {
    docId: 'D07',
    sourceType: 'Email',
    receivedAt: 'Thu 29 Oct 08:00',
    subject: 'Port tariff update',
    text: 'Subject: Port tariff update. Dear customers, revised terminal handling charges will apply from next quarter. See the attached circular.',
    answerKey: {
      disposition: 'IGNORE',
      blockers: [],
      note: 'No container, no blocker.'
    }
  },
  // D08
  {
    docId: 'D08',
    sourceType: 'Email',
    receivedAt: 'Thu 29 Oct 13:05',
    subject: 'TCLU5580214 seal inquiry',
    text: 'Subject: TCLU5580214. Maybe an issue with the seal? Will check tomorrow and let you know.',
    answerKey: {
      disposition: 'REVIEW',
      blockers: [],
      note: 'Ambiguous: must go to human review, not escalate.'
    }
  },
  // D09
  {
    docId: 'D09',
    sourceType: 'Email',
    receivedAt: 'Thu 29 Oct 12:10',
    subject: 'GESU1043876 – two things',
    text: 'Subject: GESU1043876 – two things. Customs raised a query on the HS code and has not released the container. Also detention starts Sat 31 Oct 08:00 and no truck is booked yet.',
    answerKey: {
      disposition: 'ESCALATE',
      blockers: [
        {
          containerId: 'GESU1043876',
          type: 'CUSTOMS_HOLD',
          evidenceQuote: 'Customs raised a query on the HS code and has not released the container',
          penaltyStart: '2026-10-31T08:00:00',
          actionDeadline: '2026-10-31T02:00:00',
          owner: 'Ravi Menon',
          confidence: 0.93
        },
        {
          containerId: 'GESU1043876',
          type: 'NO_TRUCK_BOOKED',
          evidenceQuote: 'no truck is booked yet',
          penaltyStart: '2026-10-31T08:00:00',
          actionDeadline: '2026-10-31T02:00:00',
          owner: 'Arjun Rao',
          confidence: 0.91
        }
      ],
      note: 'Document contains two distinct blockers for the same container.'
    }
  },
  // D10
  {
    docId: 'D10',
    sourceType: 'Email',
    receivedAt: 'Thu 29 Oct 10:30',
    subject: 'MSCU7782159 free time conflict',
    text: 'Subject: MSCU7782159. The booking confirmation says free time expires 31 Oct 18:00, but the terminal notice below says free time expires 30 Oct 18:00. --- Terminal notice: MSCU7782159 free time expires 30 Oct 18:00.',
    answerKey: {
      disposition: 'ESCALATE',
      blockers: [
        {
          containerId: 'MSCU7782159',
          type: 'FREE_TIME_EXPIRING',
          evidenceQuote: 'Terminal notice: MSCU7782159 free time expires 30 Oct 18:00',
          penaltyStart: '2026-10-30T18:00:00',
          actionDeadline: '2026-10-30T12:00:00',
          owner: 'Sanjay Iyer',
          confidence: 0.88
        }
      ],
      note: 'Conflicting dates: earlier date must win.'
    }
  },
  // D11: Duplicate forward of D01
  {
    docId: 'D11',
    sourceType: 'Email',
    receivedAt: 'Thu 29 Oct 11:45',
    subject: 'FWD: Urgent attention on MSKU4821937',
    text: 'FWD: Urgent attention on MSKU4821937. Confirming customs release for MSKU4821937 is on hold pending the commercial invoice. Free time at JNPT ends Fri 30 Oct 18:00. – Ramesh Intermodal',
    answerKey: {
      disposition: 'ESCALATE',
      blockers: [
        {
          containerId: 'MSKU4821937',
          type: 'CUSTOMS_HOLD',
          evidenceQuote: 'customs release for MSKU4821937 is on hold pending the commercial invoice',
          penaltyStart: '2026-10-30T18:00:00',
          actionDeadline: '2026-10-30T12:00:00',
          owner: 'Ravi Menon',
          confidence: 0.95
        }
      ],
      note: 'Forwarded duplicate of D01: must merge into D01 card, never duplicate.'
    }
  },
  // D12: Real blocker (CUSTOMS_HOLD)
  {
    docId: 'D12',
    sourceType: 'Customs notice',
    receivedAt: 'Thu 29 Oct 13:40',
    subject: 'ICEGATE GATEWAY DISPATCH: MEDU8821904',
    text: 'ICEGATE GATEWAY DISPATCH: MEDU8821904 bill of entry query. Customs duty payment voucher pending verification by assessment officer. Demurrage free period expires Sat 31 Oct 14:00 at INR 14,000 per day.',
    answerKey: {
      disposition: 'ESCALATE',
      blockers: [
        {
          containerId: 'MEDU8821904',
          type: 'CUSTOMS_HOLD',
          evidenceQuote: 'Customs duty payment voucher pending verification by assessment officer',
          penaltyStart: '2026-10-31T14:00:00',
          actionDeadline: '2026-10-31T08:00:00',
          owner: 'Ravi Menon',
          confidence: 0.92
        }
      ],
      note: 'Customs hold on duty payment verification.'
    }
  },
  // D13: Real blocker (FREE_TIME_EXPIRING)
  {
    docId: 'D13',
    sourceType: 'Terminal feed',
    receivedAt: 'Thu 29 Oct 14:15',
    subject: 'CFS-MUMBAI ALERT: TEMU9928104 ground storage',
    text: 'CFS-MUMBAI ALERT: TEMU9928104 ground storage free time expires tomorrow 12:00 at Dronagiri buffer yard. Move container or daily ground rent begins.',
    answerKey: {
      disposition: 'ESCALATE',
      blockers: [
        {
          containerId: 'TEMU9928104',
          type: 'FREE_TIME_EXPIRING',
          evidenceQuote: 'ground storage free time expires tomorrow 12:00',
          penaltyStart: '2026-10-30T12:00:00',
          actionDeadline: '2026-10-30T06:00:00',
          owner: 'Sanjay Iyer',
          confidence: 0.94
        }
      ],
      note: 'Ground storage free time expiry at off-dock CFS.'
    }
  },
  // D14: Ambiguous review
  {
    docId: 'D14',
    sourceType: 'Email',
    receivedAt: 'Thu 29 Oct 15:10',
    subject: 'SUDU5510293 documentation check',
    text: 'Subject: SUDU5510293 documentation check. Possible certificate of origin discrepancy noticed by clerical assistant. Needs supervisor review to confirm if this will impact clearance.',
    answerKey: {
      disposition: 'REVIEW',
      blockers: [],
      note: 'Ambiguous wording: must go to human review.'
    }
  },
  // D15: Ambiguous review
  {
    docId: 'D15',
    sourceType: 'Terminal feed',
    receivedAt: 'Thu 29 Oct 15:45',
    subject: 'GATE 2 LOG: KHLU3319024 maintenance alert',
    text: 'GATE 2 LOG: KHLU3319024 driver reported chassis brake check needed before highway departure. Mechanical team dispatched to inspect.',
    answerKey: {
      disposition: 'REVIEW',
      blockers: [],
      note: 'Ambiguous operational issue: review required.'
    }
  },
  // D16: Irrelevant document
  {
    docId: 'D16',
    sourceType: 'Internal note',
    receivedAt: 'Thu 29 Oct 08:30',
    subject: 'Safety Bulletin 2026-Q4',
    text: 'Safety Bulletin 2026-Q4: All terminal yard personnel must wear high-visibility vests and steel-toed boots in Zone A and Zone B. No exceptions.',
    answerKey: {
      disposition: 'IGNORE',
      blockers: [],
      note: 'Safety bulletin: irrelevant.'
    }
  },
  // D17: Resolved document
  {
    docId: 'D17',
    sourceType: 'Email',
    receivedAt: 'Thu 29 Oct 12:50',
    subject: 'NYKU6619024 delivery completed',
    text: 'Subject: NYKU6619024 delivery completed at Pune Depot, proof of delivery signed by warehouse receiving manager. File closed.',
    answerKey: {
      disposition: 'IGNORE',
      blockers: [],
      note: 'Completed delivery: ignore.'
    }
  },
  // D18: Irrelevant billing circular
  {
    docId: 'D18',
    sourceType: 'Email',
    receivedAt: 'Thu 29 Oct 09:50',
    subject: 'Monthly statement - Prepaid Accounts',
    text: 'Subject: Monthly statement. Attached is the monthly statement for customer prepaid terminal handling fee accounts ending September 2026.',
    answerKey: {
      disposition: 'IGNORE',
      blockers: [],
      note: 'Billing statement: ignore.'
    }
  },
  // D19: The Trap Document (invoice number looks like a date)
  {
    docId: 'D19',
    sourceType: 'Email',
    receivedAt: 'Thu 29 Oct 11:05',
    subject: 'Vendor Invoice Payment Processed',
    text: 'Subject: Vendor Invoice Payment. Please note that invoice INV-20261030-9901 amount INR 48,000 processed for last month tire replacement on fleet unit TRK-B1.',
    answerKey: {
      disposition: 'IGNORE',
      blockers: [],
      note: 'Trap document: invoice number INV-20261030-9901 looks like date 2026-10-30, but is not a penalty.'
    }
  },
  // D20: Real blocker (NO_TRUCK_BOOKED for reefer)
  {
    docId: 'D20',
    sourceType: 'Booking confirmation',
    receivedAt: 'Thu 29 Oct 14:55',
    subject: 'Booking Note: CRXU9901428 Cold-Chain Dispatch',
    text: 'Booking Note: CRXU9901428 pharma consignment is powered at reefer bay D1, but no drayage carrier accepted the haul tender for NH-48. Delivery required by Sat 31 Oct 16:00.',
    answerKey: {
      disposition: 'ESCALATE',
      blockers: [
        {
          containerId: 'CRXU9901428',
          type: 'NO_TRUCK_BOOKED',
          evidenceQuote: 'no drayage carrier accepted the haul tender',
          penaltyStart: null,
          actionDeadline: '2026-10-30T16:00:00',
          owner: 'Arjun Rao',
          confidence: 0.93
        }
      ],
      note: 'No drayage carrier accepted tender for reefer container.'
    }
  }
];

/**
 * 12 Synthetic Historical Incidents for the Historical Expense Card
 * Comparison between manual handling vs automated detection.
 * Rule: Avoided if blocker was detectable >= 6 hours before penalty start.
 */
export const HISTORICAL_INCIDENTS: HistoricalIncident[] = [
  {
    incidentId: 'INC-2026-101',
    containerId: 'MSKU1092834',
    blockerType: 'CUSTOMS_HOLD',
    penaltyPaidINR: 42000,
    hoursDetectableBeforePenalty: 18
  },
  {
    incidentId: 'INC-2026-102',
    containerId: 'CMAU7719200',
    blockerType: 'MISSING_DOCUMENT',
    penaltyPaidINR: 28000,
    hoursDetectableBeforePenalty: 14
  },
  {
    incidentId: 'INC-2026-103',
    containerId: 'MSKU9918234',
    blockerType: 'FREE_TIME_EXPIRING',
    penaltyPaidINR: 56000,
    hoursDetectableBeforePenalty: 22
  },
  {
    incidentId: 'INC-2026-104',
    containerId: 'NYKU3310928',
    blockerType: 'SLOT_UNAVAILABLE',
    penaltyPaidINR: 14400,
    hoursDetectableBeforePenalty: 8
  },
  {
    incidentId: 'INC-2026-105',
    containerId: 'SUDU4419201',
    blockerType: 'NO_TRUCK_BOOKED',
    penaltyPaidINR: 18000,
    hoursDetectableBeforePenalty: 12
  },
  {
    incidentId: 'INC-2026-106',
    containerId: 'TEMU8810293',
    blockerType: 'CUSTOMS_HOLD',
    penaltyPaidINR: 14000,
    hoursDetectableBeforePenalty: 3 // < 6h: NOT avoided
  },
  {
    incidentId: 'INC-2026-107',
    containerId: 'EGLV2291048',
    blockerType: 'MISSING_DOCUMENT',
    penaltyPaidINR: 42000,
    hoursDetectableBeforePenalty: 16
  },
  {
    incidentId: 'INC-2026-108',
    containerId: 'HLCU9920182',
    blockerType: 'FREE_TIME_EXPIRING',
    penaltyPaidINR: 28000,
    hoursDetectableBeforePenalty: 20
  },
  {
    incidentId: 'INC-2026-109',
    containerId: 'ONEY1102938',
    blockerType: 'SLOT_UNAVAILABLE',
    penaltyPaidINR: 21600,
    hoursDetectableBeforePenalty: 10
  },
  {
    incidentId: 'INC-2026-110',
    containerId: 'KHLU7721904',
    blockerType: 'CUSTOMS_HOLD',
    penaltyPaidINR: 28000,
    hoursDetectableBeforePenalty: 2 // < 6h: NOT avoided
  },
  {
    incidentId: 'INC-2026-111',
    containerId: 'CRXU8810924',
    blockerType: 'NO_TRUCK_BOOKED',
    penaltyPaidINR: 35000,
    hoursDetectableBeforePenalty: 26
  },
  {
    incidentId: 'INC-2026-112',
    containerId: 'CMAU4410293',
    blockerType: 'MISSING_DOCUMENT',
    penaltyPaidINR: 14000,
    hoursDetectableBeforePenalty: 15
  }
];

export const RESPONSIBLE_AI_PRINCIPLES = [
  {
    title: 'Evidence must exist in source (anti-hallucination)',
    badge: 'VERIFIED SUBSTRING',
    summary: 'The model is mathematically forbidden from inventing claims. Every extracted blocker must have a verbatim, normalized substring quote verified against the raw text. If not matched, it is automatically demoted to Human Review.'
  },
  {
    title: 'Low confidence goes to human',
    badge: 'CONFIDENCE GATE',
    summary: 'Any inference scoring below the operator confidence threshold (default 0.70) is routed directly to the Needs Human Review lane. No autonomous actions are executed on uncertain signals.'
  },
  {
    title: 'PII masked before the model',
    badge: 'PRIVACY PRESERVING',
    summary: 'Phone numbers, personal email addresses, and person names are regex-tokenized to [PHONE], [EMAIL], and [PERSON] prior to inference. Evidence quote matching runs against the pristine original copy.'
  },
  {
    title: 'Runs locally, no data leaves the network',
    badge: 'AIR-GAPPED COMPLIANCE',
    summary: 'Inference executes on a local Ollama server running Llama-3.1:8b (or in-browser deterministic parser). Zero shipper manifest data or carrier quotes ever leave the enterprise enclave.'
  },
  {
    title: 'Every action is audit-logged',
    badge: 'TAMPER-EVIDENT',
    summary: 'Document parsing, reassignments, mark-done confirmations, and false-alarm rejections are immediately appended to the cryptographic FreightIQ System Audit Log with user identity and timestamp.'
  },
  {
    title: 'No customer-size preference in urgency ranking',
    badge: 'NEUTRAL DISPATCH',
    summary: 'Urgency priority is computed strictly by elapsed time to penalty deadline and monetary loss per hour. Carrier size, customer tier, or freight value never artificially suppress or inflate blocker queues.'
  }
];
