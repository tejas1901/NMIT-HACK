import { YardSlot, GateQueueTruck } from '../types';

export const IDLE_COST_PER_HR_INR = 600;
export const COSTLY_COST_PER_HR_INR = 1800;

export const INITIAL_GATE_QUEUE: GateQueueTruck[] = [
  {
    id: 'GQ-1',
    plateNumber: 'KA-01-FQ-2048',
    containerId: 'HLXU3348092',
    containerType: 'DRY',
    driverName: 'Rameshwar Pawar',
    driverPhone: '+91 98201 10293',
    carrierName: 'Maersk Inland Intermodal',
    etaMinutes: 0,
    recommendedSlotId: 'B4',
    recommendationReason: 'Waiting at Gate 1. Gate slot blocked until Mon 2 Nov 09:00 (Detention ₹1,800/hr)'
  },
  {
    id: 'GQ-2',
    plateNumber: 'MH-12-RN-8819',
    containerId: 'CMAU9182301',
    containerType: 'DRY',
    driverName: 'Sunil Jagtap',
    driverPhone: '+91 94220 55192',
    carrierName: 'Expedited Regional Express',
    etaMinutes: 25,
    recommendedSlotId: 'A2',
    recommendationReason: 'Customs green channel pre-cleared, direct loading dock'
  },
  {
    id: 'GQ-3',
    plateNumber: 'DL-01-AX-9940',
    containerId: 'TGHU7719284',
    containerType: 'REEFER',
    driverName: 'Harpreet Singh',
    driverPhone: '+91 98110 33491',
    carrierName: 'CryoArctic Cold Logistics',
    etaMinutes: 40,
    recommendedSlotId: 'D3',
    recommendationReason: 'Reefer cargo (-20°C pharma), 32A shore plug verified'
  }
];

// Current Yard initial state: 16 occupied slots (8 free, 5 ready, 7 idle, 2 costly, 2 reefer)
export const INITIAL_YARD_SLOTS: YardSlot[] = [
  // ZONE A: READY TO LOAD BAYS (6 slots, nearest to Gate 2)
  {
    slotId: 'A1',
    zone: 'ZONE_A',
    zoneLabel: 'Ready Bays',
    status: 'READY',
    truck: {
      truckId: 'TRK-A1',
      plateNumber: 'MH-12-AA-4021',
      containerId: 'MEDU7821904',
      containerType: 'DRY',
      driverName: 'Vikram Malhotra',
      driverPhone: '+91 98200 44192',
      carrierName: 'FreightIQ Autonomous Logistics',
      parkedSince: '10:15 IST',
      idleDurationMinutes: 35,
      status: 'READY',
      idleCostAccruedInr: 0,
      recommendedAction: 'Dispatch via Gate 2 to NH-48 Express Corridor'
    }
  },
  {
    slotId: 'A2',
    zone: 'ZONE_A',
    zoneLabel: 'Ready Bays',
    status: 'IDLE', // Misplaced in Zone A! Blocks ready bay
    truck: {
      truckId: 'TRK-A2',
      plateNumber: 'KA-04-MB-8802',
      containerId: 'MSKU1092834',
      containerType: 'DRY',
      driverName: 'Dhananjay Hegde',
      driverPhone: '+91 98450 11928',
      carrierName: 'Intermodal Prime Rail',
      parkedSince: '08:45 IST',
      idleDurationMinutes: 145,
      status: 'IDLE',
      idleCostAccruedInr: 1450,
      blocker: {
        type: 'CUSTOMS_HOLD',
        plainReason: 'Customs ICEGATE hold: Bill of Lading stamp verification pending',
        evidenceSource: 'Email from Maersk Line, 09:14',
        evidenceQuote: 'Customs release on hold pending commercial invoice and BL endorsement for consignment.',
        ownerName: 'Pooja Kulkarni (Customs Liaison)',
        deadlineCountdown: '01h 40m remaining',
        fineRatePerHourInr: 600
      },
      recommendedAction: 'Relocate to Zone C (Customs Hold) to unblock bay'
    }
  },
  {
    slotId: 'A3',
    zone: 'ZONE_A',
    zoneLabel: 'Ready Bays',
    status: 'READY',
    truck: {
      truckId: 'TRK-A3',
      plateNumber: 'TN-09-CQ-5519',
      containerId: 'TEMU9928104',
      containerType: 'DRY',
      driverName: 'Senthil Kumar',
      driverPhone: '+91 98400 99120',
      carrierName: 'Dedicated Priority Air Cargo',
      parkedSince: '10:40 IST',
      idleDurationMinutes: 20,
      status: 'READY',
      idleCostAccruedInr: 0,
      recommendedAction: 'Paperwork cleared. Proceed to outbound inspection.'
    }
  },
  {
    slotId: 'A4',
    zone: 'ZONE_A',
    zoneLabel: 'Ready Bays',
    status: 'IDLE', // Misplaced in Zone A! Blocks ready bay
    truck: {
      truckId: 'TRK-A4',
      plateNumber: 'GJ-01-AX-3301',
      containerId: 'CMAU7719200',
      containerType: 'DRY',
      driverName: 'Bhavesh Solanki',
      driverPhone: '+91 98250 88219',
      carrierName: 'Sanand Industrial Express',
      parkedSince: '07:30 IST',
      idleDurationMinutes: 190,
      status: 'IDLE',
      idleCostAccruedInr: 1900,
      blocker: {
        type: 'MISSING_INVOICE',
        plainReason: 'Shipper commercial invoice discrepancy: HS code mismatch',
        evidenceSource: 'EDI Portal Log #88190, 08:22',
        evidenceQuote: 'Declaration rejected by customs gateway: HS code 8708.29 does not match invoice item description.',
        ownerName: 'Manish Bhatt (Shipper Lead)',
        deadlineCountdown: '00h 48m remaining',
        fineRatePerHourInr: 600
      },
      recommendedAction: 'Relocate to Zone B (Waiting Area)'
    }
  },
  {
    slotId: 'A5',
    zone: 'ZONE_A',
    zoneLabel: 'Ready Bays',
    status: 'READY',
    truck: {
      truckId: 'TRK-A5',
      plateNumber: 'MH-14-BT-1129',
      containerId: 'HLCU8810293',
      containerType: 'DRY',
      driverName: 'Sachin Gaikwad',
      driverPhone: '+91 98220 44910',
      carrierName: 'Chakan Corridor Hauler',
      parkedSince: '10:50 IST',
      idleDurationMinutes: 15,
      status: 'READY',
      idleCostAccruedInr: 0,
      recommendedAction: 'Ready to load. Awaiting trailer seal.'
    }
  },
  {
    slotId: 'A6',
    zone: 'ZONE_A',
    zoneLabel: 'Ready Bays',
    status: 'FREE'
  },

  // ZONE B: WAITING AREA (10 slots)
  {
    slotId: 'B1',
    zone: 'ZONE_B',
    zoneLabel: 'Waiting Area',
    status: 'READY',
    truck: {
      truckId: 'TRK-B1',
      plateNumber: 'DL-01-EE-7019',
      containerId: 'NYKU6619024',
      containerType: 'DRY',
      driverName: 'Mohan Sharma',
      driverPhone: '+91 98100 88491',
      carrierName: 'Delhi Dadri Multimodal',
      parkedSince: '10:00 IST',
      idleDurationMinutes: 45,
      status: 'READY',
      idleCostAccruedInr: 0,
      recommendedAction: 'Move to Zone A Bay when bay A6 clear'
    }
  },
  {
    slotId: 'B2',
    zone: 'ZONE_B',
    zoneLabel: 'Waiting Area',
    status: 'READY',
    truck: {
      truckId: 'TRK-B2',
      plateNumber: 'KA-01-MN-3810',
      containerId: 'EGLV4401928',
      containerType: 'DRY',
      driverName: 'Sanjay Reddy',
      driverPhone: '+91 99800 12048',
      carrierName: 'Vikas Intermodal Corp',
      parkedSince: '09:40 IST',
      idleDurationMinutes: 50,
      status: 'READY',
      idleCostAccruedInr: 0,
      recommendedAction: 'Cleared for NH-48 departure'
    }
  },
  {
    slotId: 'B3',
    zone: 'ZONE_B',
    zoneLabel: 'Waiting Area',
    status: 'FREE'
  },
  {
    slotId: 'B4',
    zone: 'ZONE_B',
    zoneLabel: 'Waiting Area',
    status: 'RESERVED',
    reservedEta: '12 min (KA-01-FQ-2048)',
    reservationReason: 'Incoming truck from Gate 1. Container clears in 40 min.'
  },
  {
    slotId: 'B5',
    zone: 'ZONE_B',
    zoneLabel: 'Waiting Area',
    status: 'IDLE',
    truck: {
      truckId: 'TRK-B5',
      plateNumber: 'KL-07-BB-9014',
      containerId: 'SUDU5510293',
      containerType: 'DRY',
      driverName: 'Naveen Kurup',
      driverPhone: '+91 98470 66291',
      carrierName: 'Kochi Marine Port Transit',
      parkedSince: '08:10 IST',
      idleDurationMinutes: 160,
      status: 'IDLE',
      idleCostAccruedInr: 1600,
      blocker: {
        type: 'TERMINAL_SLOT_WAIT',
        plainReason: 'Railhead gantry crane bottleneck: Awaiting flatbed wagon placement',
        evidenceSource: 'JNPT Operations SMS Alert, 08:30',
        evidenceQuote: 'Track 3 gantry maintenance extended by 90 minutes. Staging delayed.',
        ownerName: 'Anil Shinde (Yard Master)',
        deadlineCountdown: '01h 10m remaining',
        fineRatePerHourInr: 600
      },
      recommendedAction: 'Hold until Track 3 rail gantry restored'
    }
  },
  {
    slotId: 'B6',
    zone: 'ZONE_B',
    zoneLabel: 'Waiting Area',
    status: 'IDLE',
    truck: {
      truckId: 'TRK-B6',
      plateNumber: 'MH-04-GP-6612',
      containerId: 'ONEY3391024',
      containerType: 'DRY',
      driverName: 'Kishore Kadam',
      driverPhone: '+91 98690 33102',
      carrierName: 'Western Corridor Freightways',
      parkedSince: '07:15 IST',
      idleDurationMinutes: 210,
      status: 'IDLE',
      idleCostAccruedInr: 2100,
      blocker: {
        type: 'CUSTOMS_HOLD',
        plainReason: 'Phytosanitary inspection pending for agricultural shipment',
        evidenceSource: 'PQ Portal Ref #PQ-8819, 07:45',
        evidenceQuote: 'Inspector scheduled for sampling between 11:30 and 12:30 IST.',
        ownerName: 'Dr. V. Rao (Plant Quarantine)',
        deadlineCountdown: '00h 35m remaining',
        fineRatePerHourInr: 600
      },
      recommendedAction: 'Awaiting inspector sampling'
    }
  },
  {
    slotId: 'B7',
    zone: 'ZONE_B',
    zoneLabel: 'Waiting Area',
    status: 'COSTLY', // High detention fine!
    truck: {
      truckId: 'TRK-B7',
      plateNumber: 'KA-05-AB-7711',
      containerId: 'MSKU9918234',
      containerType: 'DRY',
      driverName: 'Girish Murthy',
      driverPhone: '+91 98451 90822',
      carrierName: 'Bangalore Inland Logistics',
      parkedSince: '05:30 IST',
      idleDurationMinutes: 320,
      status: 'COSTLY',
      idleCostAccruedInr: 9600,
      blocker: {
        type: 'CUSTOMS_HOLD',
        plainReason: 'Detention fine started! Ocean carrier free days expired 2 hours ago',
        evidenceSource: 'Ocean Line Demurrage Notice #DM-44102',
        evidenceQuote: 'Demurrage & detention clock active since 08:00 IST at ₹1,800/hr tariff.',
        ownerName: 'Ananya Verma (Account Director)',
        deadlineCountdown: 'OVERDUE (Accruing ₹1,800/hr)',
        fineRatePerHourInr: 1800
      },
      recommendedAction: 'URGENT: Clear payment voucher to stop ₹1,800/hr penalty'
    }
  },
  {
    slotId: 'B8',
    zone: 'ZONE_B',
    zoneLabel: 'Waiting Area',
    status: 'IDLE',
    truck: {
      truckId: 'TRK-B8',
      plateNumber: 'AP-16-TX-4402',
      containerId: 'TGHU8821901',
      containerType: 'DRY',
      driverName: 'Venkat Naidu',
      driverPhone: '+91 98480 77129',
      carrierName: 'Coromandel Coastal Express',
      parkedSince: '08:20 IST',
      idleDurationMinutes: 155,
      status: 'IDLE',
      idleCostAccruedInr: 1550,
      blocker: {
        type: 'E_WAY_EXPIRED',
        plainReason: 'e-Way Bill expired due to transit delay on NH-16',
        evidenceSource: 'NIC GST Portal Alert, 08:00',
        evidenceQuote: 'e-Way bill EWB-990142 expired at 23:59. Vehicle movement restricted until renewed.',
        ownerName: 'Rajat Sharma (Compliance)',
        deadlineCountdown: '00h 25m remaining',
        fineRatePerHourInr: 600
      },
      recommendedAction: 'Extend e-Way bill via automated GST API'
    }
  },
  {
    slotId: 'B9',
    zone: 'ZONE_B',
    zoneLabel: 'Waiting Area',
    status: 'IDLE',
    truck: {
      truckId: 'TRK-B9',
      plateNumber: 'HR-55-AK-9921',
      containerId: 'CMAU1109284',
      containerType: 'DRY',
      driverName: 'Gurmeet Singh',
      driverPhone: '+91 98120 44910',
      carrierName: 'NCR Logistics Relay',
      parkedSince: '08:00 IST',
      idleDurationMinutes: 170,
      status: 'IDLE',
      idleCostAccruedInr: 1700,
      blocker: {
        type: 'MISSING_INVOICE',
        plainReason: 'Receiver warehouse receiving dock gate pass missing signature',
        evidenceSource: 'Warehouse WMS Webhook #WH-881',
        evidenceQuote: 'Inbound dock 4 appointment required before yard release.',
        ownerName: 'Priya Sharma (Operations)',
        deadlineCountdown: '01h 05m remaining',
        fineRatePerHourInr: 600
      },
      recommendedAction: 'Confirm receiving dock gate pass'
    }
  },
  {
    slotId: 'B10',
    zone: 'ZONE_B',
    zoneLabel: 'Waiting Area',
    status: 'FREE'
  },

  // ZONE C: CUSTOMS HOLD (4 slots)
  {
    slotId: 'C1',
    zone: 'ZONE_C',
    zoneLabel: 'Customs Hold',
    status: 'COSTLY', // Detention penalty!
    truck: {
      truckId: 'TRK-C1',
      plateNumber: 'WB-02-AK-1104',
      containerId: 'MSKU3310928',
      containerType: 'DRY',
      driverName: 'Subir Das',
      driverPhone: '+91 98300 44910',
      carrierName: 'Haldia Dock Hauler',
      parkedSince: '04:15 IST',
      idleDurationMinutes: 380,
      status: 'COSTLY',
      idleCostAccruedInr: 11400,
      blocker: {
        type: 'CUSTOMS_HOLD',
        plainReason: 'ICEGATE Customs Red Lane physical examination ordered',
        evidenceSource: 'ICEGATE Portal Status: EXAMINATION_ORDERED',
        evidenceQuote: 'Container flagged by Risk Management System (RMS) for 100% physical tally.',
        ownerName: 'Customs Inspector S. Sengupta',
        deadlineCountdown: 'CRITICAL (₹1,800/hr fine)',
        fineRatePerHourInr: 1800
      },
      recommendedAction: 'Expedite customs examiner presence at Examination Bay'
    }
  },
  {
    slotId: 'C2',
    zone: 'ZONE_C',
    zoneLabel: 'Customs Hold',
    status: 'COSTLY',
    truck: {
      truckId: 'TRK-C2',
      plateNumber: 'MH-46-AZ-9902',
      containerId: 'MSKU4821937',
      containerType: 'DRY',
      driverName: 'Rameshwar Pawar',
      driverPhone: '+91 98201 10293',
      carrierName: 'Maersk Inland Intermodal',
      parkedSince: '06:30 IST',
      idleDurationMinutes: 290,
      status: 'COSTLY',
      idleCostAccruedInr: 8700,
      blocker: {
        type: 'CUSTOMS_HOLD',
        plainReason: 'Customs release on hold pending commercial invoice (Maersk Ops)',
        evidenceSource: 'Email · Maersk Ops · 09:14',
        evidenceQuote: 'customs release for MSKU4821937 is on hold pending the commercial invoice',
        ownerName: 'Ravi Menon (Documentation Desk)',
        deadlineCountdown: 'Action deadline: Fri 30 Oct 12:00',
        fineRatePerHourInr: 1800
      },
      recommendedAction: 'Submit commercial invoice to Customs to terminate ₹14,000/day demurrage'
    }
  },
  {
    slotId: 'C3',
    zone: 'ZONE_C',
    zoneLabel: 'Customs Hold',
    status: 'FREE'
  },
  {
    slotId: 'C4',
    zone: 'ZONE_C',
    zoneLabel: 'Customs Hold',
    status: 'FREE'
  },

  // ZONE D: REEFER / COLD-CHAIN (4 slots with power plug)
  {
    slotId: 'D1',
    zone: 'ZONE_D',
    zoneLabel: 'Cold-Chain Reefer',
    status: 'READY',
    isReeferPlugAvailable: true,
    truck: {
      truckId: 'TRK-D1',
      plateNumber: 'KL-07-EK-8104',
      containerId: 'CRXU9901428',
      containerType: 'REEFER',
      driverName: 'Pradeep Nair',
      driverPhone: '+91 98470 55192',
      carrierName: 'Summit Cold-Chain Express',
      parkedSince: '09:30 IST',
      idleDurationMinutes: 65,
      status: 'READY',
      idleCostAccruedInr: 0,
      recommendedAction: 'Temperature verified at -20°C. Cleared for refrigerated departure.'
    }
  },
  {
    slotId: 'D2',
    zone: 'ZONE_D',
    zoneLabel: 'Cold-Chain Reefer',
    status: 'IDLE',
    isReeferPlugAvailable: true,
    truck: {
      truckId: 'TRK-D2',
      plateNumber: 'MH-12-FK-9901',
      containerId: 'FROST441920',
      containerType: 'REEFER',
      driverName: 'Arjun Nambiar',
      driverPhone: '+91 99800 77210',
      carrierName: 'FrostShield Reefer Line',
      parkedSince: '08:30 IST',
      idleDurationMinutes: 150,
      status: 'IDLE',
      idleCostAccruedInr: 1500,
      blocker: {
        type: 'REEFER_POWER_WAIT',
        plainReason: 'Waiting for secondary 32A three-phase generator plug coupling',
        evidenceSource: 'IoT Sensor Gateway #RF-02, 08:50',
        evidenceQuote: 'Battery reserve at 62%. Shore plug cable inspected, technician on-site.',
        ownerName: 'Deepak Sawant (Electrical Tech)',
        deadlineCountdown: '00h 20m remaining',
        fineRatePerHourInr: 600
      },
      recommendedAction: 'Verify shore power plug locked to socket D2'
    }
  },
  {
    slotId: 'D3',
    zone: 'ZONE_D',
    zoneLabel: 'Cold-Chain Reefer',
    status: 'FREE',
    isReeferPlugAvailable: true
  },
  {
    slotId: 'D4',
    zone: 'ZONE_D',
    zoneLabel: 'Cold-Chain Reefer',
    status: 'FREE',
    isReeferPlugAvailable: true
  }
];

// Optimized Yard state after QpiAI quantum optimization: 14 free slots / 10 occupied
export const OPTIMIZED_YARD_SLOTS: YardSlot[] = INITIAL_YARD_SLOTS.map((slot) => {
  // Zone A bays are freed from idle trucks!
  if (slot.slotId === 'A2') {
    // Relocated to Zone C!
    return { ...slot, status: 'FREE', truck: undefined };
  }
  if (slot.slotId === 'A4') {
    // Relocated to Zone B!
    return { ...slot, status: 'FREE', truck: undefined };
  }
  // B7 costly truck paid & expedited release!
  if (slot.slotId === 'B7') {
    return { ...slot, status: 'FREE', truck: undefined };
  }
  // B8 and B9 e-way/invoice resolved and released!
  if (slot.slotId === 'B8' || slot.slotId === 'B9') {
    return { ...slot, status: 'FREE', truck: undefined };
  }
  // C1 examiner expedited and cleared!
  if (slot.slotId === 'C1') {
    return { ...slot, status: 'FREE', truck: undefined };
  }
  return slot;
});

export const YARD_EVENT_TICKER = [
  'KA-01-FQ-2048 entered Gate 1 queue: Target slot B4',
  'Slot B7 detention alarm: Demurrage penalty active at ₹1,800/hr',
  'Bay A1 loading complete: Cleared for dispatch through Gate 2',
  'Slot D2 32A shore power plug locked and active',
  'Customs ICEGATE clearance webhook received for CMAU9182301',
  'Slot A6 became FREE after container offloaded'
];
