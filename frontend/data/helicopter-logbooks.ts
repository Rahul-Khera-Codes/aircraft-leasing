/**
 * Synthetic helicopter logbook data for OriginTrace.ai demo.
 * Matches the structure consumed by MaintenanceTimeline and the logbooks page.
 * All data is fictional — for demonstration purposes only.
 */

export type LogbookFlag = {
  severity: "FLAG" | "ADVISORY" | "CLEAR";
  category: string;
  title: string;
  evidence: string;
  action: string;
};

export type LLPEntry = {
  part: string;
  pn: string;
  sn: string;
  life_fh: number;
  current_fh: number;
  rem_fh: number;
  life_cycles: string;
  btb: "VERIFIED" | "PENDING" | string;
};

export type MaintenanceEntry = {
  date: string;   // "DD MMM YYYY"
  type: string;
  fh: string;
  desc: string;
  org: string;
};

export type ADEntry = {
  ref: string;
  title: string;
  status: "COMPLIED" | "ADVISORY" | "NOT COMPLIED";
  date: string;
  fh_at: string;
  interval: string;
  org: string;
};

export type ComponentChange = {
  date: string;
  item: string;
  pn_off: string;
  sn_off: string;
  pn_on: string;
  sn_on: string;
  reason: string;
  form1: string;
  org: string;
};

export type HelicopterLogbook = {
  registration: string;
  msn: string;
  manufacturer: string;
  model: string;
  engine_model: string;
  engine_sn: string[];
  mfg_date: string;
  crs_date: string;
  mtow_kg: number;
  tah: string;
  tl: string;
  last_a_check: { date: string; fh: string; loc: string };
  last_b_check: { date: string; fh: string; loc: string };
  last_c_check: { date: string; fh: string; loc: string };
  flags: LogbookFlag[];
  llp: LLPEntry[];
  maintenance_history: MaintenanceEntry[];
  ads: ADEntry[];
  component_changes: ComponentChange[];
  pdf_filename: string;
};

// ─── Airbus H145 — EI-AH1 ───────────────────────────────────────────────────
const EI_AH1: HelicopterLogbook = {
  registration: "EI-AH1",
  msn: "20164",
  manufacturer: "Airbus Helicopters",
  model: "H145 (EC145 T2)",
  engine_model: "2 × Safran Turbomeca Arriel 2E",
  engine_sn: ["E2E-17-4421", "E2E-17-4422"],
  mfg_date: "14 February 2018",
  crs_date: "22 March 2018",
  mtow_kg: 3800,
  tah: "4,287.4",
  tl: "8,574",
  last_a_check: { date: "12 March 2026",    fh: "4,240.5", loc: "Airbus Helicopters Services Ireland, Dublin" },
  last_b_check: { date: "09 November 2025", fh: "4,110.2", loc: "Airbus Helicopters Services Ireland, Dublin" },
  last_c_check: { date: "17 June 2023",     fh: "3,650.0", loc: "Airbus Helicopters MRO, Donauwörth, Germany" },
  flags: [
    {
      severity: "ADVISORY",
      category: "Documentation",
      title: "Engine 2 Technical Log — 3 pages missing from 2021 record set",
      evidence: "Engine tech log section dated 14–16 Sep 2021 absent from physical record package. Records confirmed destroyed in MRO facility flood event (Stavanger, Sept 2021). MRO issued letter of confirmation reference STA-MRO-2021-4422.",
      action: "Obtain duplicate records or formal MRO confirmation letter. Low risk — confirmed event with paper trail.",
    },
    {
      severity: "ADVISORY",
      category: "Airworthiness Directive",
      title: "AD 2023-0142-E (EGT margin monitoring) — compliance record unclear",
      evidence: "AD 2023-0142-E requires periodic EGT margin check every 300 FH. Last compliance record shows 3,900 FH. Current TAH 4,287 FH implies overdue by 87 FH unless intermediate compliance is on file with operator.",
      action: "Request operator confirmation of AD compliance records post-4,050 FH.",
    },
  ],
  llp: [
    { part: "Main Rotor Blade (×4)", pn: "H145-MRB-4022",  sn: "MRB-22-0041~44",  life_fh: 10000, current_fh: 4287, rem_fh: 5713,  life_cycles: "N/A",         btb: "VERIFIED" },
    { part: "Main Rotor Hub",        pn: "H145-MRH-3010",  sn: "MRH-18-0017",      life_fh: 12000, current_fh: 4287, rem_fh: 7713,  life_cycles: "N/A",         btb: "VERIFIED" },
    { part: "Tail Rotor Blade (×3)", pn: "H145-TRB-1508",  sn: "TRB-22-0011~13",  life_fh: 8000,  current_fh: 4287, rem_fh: 3713,  life_cycles: "N/A",         btb: "VERIFIED" },
    { part: "Main Gearbox",          pn: "H145-MGB-9001",  sn: "MGB-18-0042",      life_fh: 15000, current_fh: 4287, rem_fh: 10713, life_cycles: "N/A",         btb: "VERIFIED" },
    { part: "Tail Rotor Gearbox",    pn: "H145-TGB-4002",  sn: "TGB-20-0088",      life_fh: 6000,  current_fh: 1450, rem_fh: 4550,  life_cycles: "N/A",         btb: "VERIFIED" },
    { part: "Engine 1 — Arriel 2E", pn: "ARL2E-ASSY",     sn: "E2E-17-4421",      life_fh: 20000, current_fh: 4287, rem_fh: 15713, life_cycles: "20,000 FC",   btb: "VERIFIED" },
    { part: "Engine 2 — Arriel 2E", pn: "ARL2E-ASSY",     sn: "E2E-17-4422",      life_fh: 20000, current_fh: 4287, rem_fh: 15713, life_cycles: "20,000 FC",   btb: "PENDING"  },
    { part: "Intermediate Gearbox",  pn: "H145-IGB-5503",  sn: "IGB-19-0033",      life_fh: 10000, current_fh: 4287, rem_fh: 5713,  life_cycles: "N/A",         btb: "VERIFIED" },
    { part: "Main Rotor Mast",       pn: "H145-MRM-2211",  sn: "MRM-18-0019",      life_fh: 20000, current_fh: 4287, rem_fh: 15713, life_cycles: "N/A",         btb: "VERIFIED" },
    { part: "Swashplate Assembly",   pn: "H145-SWP-7701",  sn: "SWP-18-0022",      life_fh: 15000, current_fh: 4287, rem_fh: 10713, life_cycles: "N/A",         btb: "VERIFIED" },
  ],
  maintenance_history: [
    { date: "12 Mar 2026", type: "A-Check",      fh: "4,240.5", org: "Airbus Helicopters Services Ireland, Dublin",    desc: "A-Check. Main gearbox oil filter replaced. Engine BSI Eng 1 — NFF. AD 2031-AD reviewed. Aircraft released serviceable." },
    { date: "09 Nov 2025", type: "A-Check + B",  fh: "4,110.2", org: "Airbus Helicopters Services Ireland, Dublin",    desc: "A+B Check. Vibration dampers (Eng 1 & 2 mounts) replaced per SB AH-H145-71-003. Cabin ELT bracket reinforced per SB AH-H145-25-004." },
    { date: "19 Sep 2024", type: "A-Check",      fh: "4,012.3", org: "Airbus Helicopters Services Ireland, Dublin",    desc: "A-Check. AD 2024-0055-E (HUMS software v4.2 update) complied with." },
    { date: "18 Mar 2024", type: "A-Check + B",  fh: "3,875.4", org: "Airbus Helicopters Services Ireland, Dublin",    desc: "Routine A+B Check. Engine borescope inspection Engine 1 & 2 — NFF." },
    { date: "17 Jun 2023", type: "C-Check",      fh: "3,650.0", org: "Airbus Helicopters MRO, Donauwörth, Germany",   desc: "Full C-Check. Main rotor blades ×4 replaced (erosion). Tail rotor gearbox overhauled at zero hours. Airframe structural inspection — NFF. Paint refinished." },
    { date: "14 Feb 2023", type: "Special Insp", fh: "3,510.0", org: "Airbus Helicopters MRO, Donauwörth, Germany",   desc: "AD 2022-0178-E: Engine anti-icing system function test. System serviceable." },
    { date: "29 Oct 2022", type: "A-Check + B",  fh: "3,200.8", org: "Airbus Helicopters Services Ireland, Dublin",    desc: "A+B Check. Main rotor lead-lag dampers replaced (life limit). New Form 1 ref FORM1-2022-LLD-002 on file." },
    { date: "08 May 2021", type: "Special Insp", fh: "2,544.7", org: "Airbus Helicopters Services Ireland, Dublin",    desc: "AD 2021-0099-E: Tail rotor blade crack detection check. UT inspection — NFF. Released serviceable." },
    { date: "12 Jun 2021", type: "A-Check",      fh: "1,215.4", org: "Airbus Helicopters Services Ireland, Dublin",    desc: "Routine A-Check. Tail rotor pitch links inspected per SB." },
    { date: "18 Nov 2020", type: "A-Check + B",  fh: "925.7",   org: "Airbus Helicopters Services Ireland, Dublin",    desc: "A+B Check. HUMS data review — no anomalies. Engine EGT margins within limits." },
    { date: "04 May 2020", type: "A-Check",      fh: "760.3",   org: "Airbus Helicopters Services Ireland, Dublin",    desc: "A-Check. AD 2019-0215-E (pitch link inspection) complied with. NFF." },
    { date: "22 Sep 2019", type: "A-Check + B",  fh: "458.9",   org: "Airbus Helicopters Services Ireland, Dublin",    desc: "A+B combined check. Flight control rigging verified. Swashplate torque checked within limits." },
    { date: "15 Mar 2019", type: "A-Check",      fh: "305.2",   org: "Airbus Helicopters Services Ireland, Dublin",    desc: "Routine A-Check. Hydraulic filter replaced. No other defects." },
    { date: "18 Sep 2018", type: "A-Check",      fh: "148.6",   org: "Airbus Helicopters Services Ireland, Dublin",    desc: "First A-Check. All systems serviceable. No defects noted." },
    { date: "22 Mar 2018", type: "Delivery/CRS", fh: "0.0",     org: "Airbus Helicopters, Marignane, France",           desc: "CRS issued. Aircraft delivered new from Airbus Helicopters. Registration EI-AH1 assigned by IAA." },
  ],
  ads: [
    { ref: "AD 2025-0031-E", title: "Main Gearbox Oil Filter — Replacement",        status: "COMPLIED",     date: "12 Mar 2026", fh_at: "4,240.5", interval: "A-Check (every 150 FH)", org: "Airbus Helicopters Services Ireland, Dublin" },
    { ref: "AD 2024-0055-E", title: "HUMS System Software Update v4.2",             status: "COMPLIED",     date: "19 Sep 2024", fh_at: "4,012.3", interval: "One-time",              org: "Airbus Helicopters Services Ireland, Dublin" },
    { ref: "AD 2023-0142-E", title: "Arriel 2E — EGT Margin Monitoring",            status: "ADVISORY",     date: "See remarks", fh_at: "3,900.0", interval: "Every 300 FH",          org: "—" },
    { ref: "AD 2022-0178-E", title: "Engine Air Intake Anti-Icing — Function Test", status: "COMPLIED",     date: "14 Feb 2023", fh_at: "3,510.0", interval: "Annual",                org: "Airbus Helicopters MRO, Donauwörth" },
    { ref: "AD 2021-0099-E", title: "Tail Rotor Blade — Crack Detection Check",     status: "COMPLIED",     date: "08 May 2021", fh_at: "2,544.7", interval: "On Condition",          org: "Airbus Helicopters Services Ireland, Dublin" },
    { ref: "AD 2019-0215-E", title: "Main Rotor Head — Pitch Link Assembly Insp.",  status: "COMPLIED",     date: "22 Jan 2020", fh_at: "1,120.0", interval: "One-time",              org: "Airbus Helicopters Services Ireland, Dublin" },
  ],
  component_changes: [
    { date: "12 Mar 2026", item: "Main Gearbox Oil Filter",   pn_off: "H145-MGBF-0500",  sn_off: "N/A (consumable)",    pn_on: "H145-MGBF-0500",  sn_on: "N/A (consumable)",    reason: "A-Check routine replacement",                             form1: "FORM1-2026-MGF-001",  org: "Airbus Helicopters Services Ireland, Dublin" },
    { date: "09 Nov 2025", item: "Vibration Damper (Eng 1)",  pn_off: "H145-VDM-3300A",  sn_off: "VDM-17-0088",          pn_on: "H145-VDM-3300B",  sn_on: "VDM-24-0177",          reason: "SB AH-H145-71-003 — improved damper kit",                form1: "FORM1-2025-VDM-001",  org: "Airbus Helicopters Services Ireland, Dublin" },
    { date: "17 Jun 2023", item: "Main Rotor Blades (×4)",   pn_off: "H145-MRB-4021",   sn_off: "MRB-16-0011~14",       pn_on: "H145-MRB-4022",   sn_on: "MRB-22-0041~44",       reason: "Blade erosion strip delamination (SB AH-H145-05-001)",   form1: "FORM1-2023-MRB-004",  org: "Airbus Helicopters MRO, Donauwörth, Germany" },
    { date: "17 Jun 2023", item: "Tail Rotor Gearbox",       pn_off: "H145-TGB-4001",   sn_off: "TGB-15-0031",          pn_on: "H145-TGB-4002",   sn_on: "TGB-20-0088",          reason: "Life limit expiry (6,000 FH)",                            form1: "FORM1-2023-TGB-001",  org: "Airbus Helicopters MRO, Donauwörth, Germany" },
  ],
  pdf_filename: "EI-AH1_Helicopter_Logbook.pdf",
};

// ─── Bell 412EP — EI-BT1 ────────────────────────────────────────────────────
const EI_BT1: HelicopterLogbook = {
  registration: "EI-BT1",
  msn: "36578",
  manufacturer: "Bell Textron Inc.",
  model: "Bell 412EP",
  engine_model: "2 × Pratt & Whitney Canada PT6T-3D Twin Pac",
  engine_sn: ["PCE-PE0098221", "PCE-PE0098222"],
  mfg_date: "08 September 2015",
  crs_date: "02 November 2015",
  mtow_kg: 5397,
  tah: "7,142.8",
  tl: "14,285",
  last_a_check: { date: "24 February 2026",   fh: "7,080.5", loc: "Heli-One, Stavanger, Norway" },
  last_b_check: { date: "18 October 2025",    fh: "6,950.2", loc: "Heli-One, Stavanger, Norway" },
  last_c_check: { date: "15 September 2022",  fh: "5,900.0", loc: "Heli-One, Stavanger, Norway" },
  flags: [
    {
      severity: "FLAG",
      category: "Structural",
      title: "Main Rotor Blade S/N MRB-15-0022 — Crack indication at root fitting",
      evidence: "During C-Check inspection (Sep 2022, 5,900 FH) a hairline indication was detected at the root fitting of main rotor blade S/N MRB-15-0022 via FPI. Blade removed and quarantined. Replacement blade installed (Form 1 ref FORM1-2022-MRB-007). Bell Textron Engineering Report BT-ENG-2023-0417 concluded indication was within allowable damage limits but recommended replacement. Current blades (installed 2023) are new manufacture.",
      action: "RESOLVED — replacement blade installed. Engineering report on file. Recommend verification of current blade inspection history at next C-Check.",
    },
    {
      severity: "ADVISORY",
      category: "Engine",
      title: "PT6T-3D Twin Pac No. 2 — Oil consumption elevated (trend noted)",
      evidence: "HUMS data shows Engine 2 oil consumption at 0.14 qt/hr over last 300 FH (limit 0.25 qt/hr). Within limits but trending upward. Borescope at 7,080 FH shows minor hot section oxidation on first stage turbine blades — within AMM limits.",
      action: "Engine 2 hot section inspection recommended at next 500 FH interval or 7,500 FH TAH. Monitor oil consumption trend.",
    },
    {
      severity: "ADVISORY",
      category: "Documentation",
      title: "Intermediate gearbox BTB records — gap 2017–2019",
      evidence: "IGB S/N IGB-15-0044 BTB records show gap 2017–2019. Previous operator (Global Offshore Helicopters, Aberdeen) confirmed IGB was part of pooled component exchange. Written confirmation obtained (GOH-2021-IGB-0044) but individual FH/FC records for pooled period unavailable.",
      action: "BTB gap documented. Recommend operator obtain certified extract of total time from GOH or Bell Textron support.",
    },
  ],
  llp: [
    { part: "Main Rotor Blade (×4)",          pn: "412-015-125-157", sn: "MRB-23-0071~74", life_fh: 10000, current_fh: 7143, rem_fh: 2857,  life_cycles: "N/A",        btb: "VERIFIED" },
    { part: "Main Rotor Hub",                 pn: "412-010-402-101", sn: "MRH-15-0044",    life_fh: 25000, current_fh: 7143, rem_fh: 17857, life_cycles: "N/A",        btb: "VERIFIED" },
    { part: "Tail Rotor Blade (×2)",          pn: "412-015-260-101", sn: "TRB-18-0088/89", life_fh: 12000, current_fh: 7143, rem_fh: 4857,  life_cycles: "N/A",        btb: "VERIFIED" },
    { part: "Main Gearbox",                   pn: "412-040-102-101", sn: "MGB-15-0113",    life_fh: 30000, current_fh: 7143, rem_fh: 22857, life_cycles: "N/A",        btb: "VERIFIED" },
    { part: "Intermediate Gearbox",           pn: "412-040-702-101", sn: "IGB-15-0044",    life_fh: 15000, current_fh: 7143, rem_fh: 7857,  life_cycles: "N/A",        btb: "PENDING (gap 2017–2019)" },
    { part: "Tail Rotor Gearbox",             pn: "412-040-802-105", sn: "TGB-18-0099",    life_fh: 15000, current_fh: 7143, rem_fh: 7857,  life_cycles: "N/A",        btb: "VERIFIED" },
    { part: "Engine — PT6T-3D (No. 1)",       pn: "PT6T-3D-ASSY",   sn: "PCE-PE0098221",  life_fh: 30000, current_fh: 7143, rem_fh: 22857, life_cycles: "Unlimited",  btb: "VERIFIED" },
    { part: "Engine — PT6T-3D (No. 2)",       pn: "PT6T-3D-ASSY",   sn: "PCE-PE0098222",  life_fh: 30000, current_fh: 7143, rem_fh: 22857, life_cycles: "Unlimited",  btb: "VERIFIED" },
    { part: "Main Rotor Mast",                pn: "412-010-121-101", sn: "MRM-15-0051",    life_fh: 25000, current_fh: 7143, rem_fh: 17857, life_cycles: "N/A",        btb: "VERIFIED" },
    { part: "Swashplate Assembly",            pn: "412-011-200-101", sn: "SWP-15-0033",    life_fh: 20000, current_fh: 7143, rem_fh: 12857, life_cycles: "N/A",        btb: "VERIFIED" },
  ],
  maintenance_history: [
    { date: "24 Feb 2026", type: "A-Check",      fh: "7,080.5", org: "Heli-One, Stavanger, Norway",  desc: "A-Check. AD 2024-0074-E compressor bleed valve check — serviceable. GTN 750Xi avionics upgrade installed (SB 412-95-04). Engine 2 BSI — minor oxidation within limits. Released serviceable." },
    { date: "18 Oct 2025", type: "A-Check + B",  fh: "6,950.2", org: "Heli-One, Stavanger, Norway",  desc: "B-Check. AD 2025-0018-E: Anti-torque pedal inspection — NFF. SB 412-71-22: exhaust insulation replaced. Engine 2 oil consumption trend — 0.14 qt/hr (within limits, advisory noted)." },
    { date: "09 Sep 2023", type: "A-Check + B",  fh: "6,555.0", org: "Heli-One, Stavanger, Norway",  desc: "A+B Check. Engine 2 oil consumption trend noted — 0.12 qt/hr (within limits)." },
    { date: "22 Mar 2023", type: "A-Check",      fh: "6,210.4", org: "Heli-One, Stavanger, Norway",  desc: "Post-C-Check A-Check. New main rotor blades (Form 1 FORM1-2023-MRB-0944) installed. Aircraft balanced — within limits." },
    { date: "15 Sep 2022", type: "C-Check",      fh: "5,900.0", org: "Heli-One, Stavanger, Norway",  desc: "Full C-Check. MR blade MRB-15-0022 — FPI crack indication at root fitting. Blade quarantined. Lead-lag dampers replaced (SB 412-65-07). Tail boom doublers installed (SB 412-54-19 mandatory). AD 2022-0209-E complied with." },
    { date: "28 Jan 2022", type: "A-Check + B",  fh: "5,480.7", org: "Heli-One, Stavanger, Norway",  desc: "A+B Check. Main gearbox chip detector — trace metallic fines noted. Oil flushed. Trend monitoring initiated. No further fines detected at 50FH follow-up check." },
    { date: "09 Mar 2021", type: "A-Check",      fh: "4,920.3", org: "Heli-One, Stavanger, Norway",  desc: "AD 2020-0155-E: Tail boom attach fitting inspection at 5,000 FH interval. NFF. Aircraft refinished in new operator livery." },
    { date: "18 Nov 2019", type: "Special Insp", fh: "3,750.0", org: "Heli-One, Stavanger, Norway",  desc: "AD 2019-0212-E: Main rotor hub pitch horn bolt inspection. One bolt replaced (fretting found). NF on remaining. Released serviceable." },
    { date: "14 Mar 2019", type: "A-Check + B",  fh: "3,100.0", org: "Heli-One, Stavanger, Norway",  desc: "Combined A+B Check. IGB borescope — NFF. Lead-lag damper condition noted (approaching life limit)." },
    { date: "22 Apr 2018", type: "A-Check",      fh: "2,210.5", org: "Heli-One, Stavanger, Norway",  desc: "AD 2018-0087-E: PT6T-3D power turbine governor inspection. NFF. Engine 2 EGT margin 48°C above limit." },
    { date: "15 Jan 2017", type: "Special Insp", fh: "820.0",   org: "Heli-One, Stavanger, Norway",  desc: "AD 2016-0110-E: Tail rotor blade retention nut torque check. Torque verified — serviceable." },
    { date: "18 Apr 2016", type: "A-Check",      fh: "155.0",   org: "Heli-One, Stavanger, Norway",  desc: "First A-Check. All systems serviceable." },
    { date: "02 Nov 2015", type: "Delivery/CRS", fh: "0.0",     org: "Bell Textron, Fort Worth, TX",  desc: "Aircraft delivered new from Bell Textron. CRS issued. Registration EI-BT1 (IAA). Placed on lease with North Sea operator (Global Offshore Helicopters)." },
  ],
  ads: [
    { ref: "AD 2025-0018-E", title: "Bell 412 — Anti-Torque Pedal Assembly Inspection",    status: "COMPLIED",     date: "18 Oct 2025", fh_at: "6,950.2", interval: "B-Check",             org: "Heli-One, Stavanger" },
    { ref: "AD 2024-0074-E", title: "PT6T-3D — Compressor Bleed Valve Check",              status: "COMPLIED",     date: "24 Feb 2026", fh_at: "7,080.5", interval: "Every 600 FH",        org: "Heli-One, Stavanger" },
    { ref: "AD 2022-0209-E", title: "Bell 412 — Main Rotor Blade Root Fitting FPI",        status: "COMPLIED",     date: "15 Sep 2022", fh_at: "5,900.0", interval: "C-Check / 3,000 FH",  org: "Heli-One, Stavanger" },
    { ref: "AD 2020-0155-E", title: "Bell 412 — Tail Boom Attach Fitting Inspection",      status: "COMPLIED",     date: "09 Mar 2021", fh_at: "4,920.3", interval: "5,000 FH intervals",  org: "Heli-One, Stavanger" },
    { ref: "AD 2019-0212-E", title: "Bell 412 — Main Rotor Hub Pitch Horn Bolt Insp.",     status: "COMPLIED",     date: "18 Nov 2019", fh_at: "3,750.0", interval: "One-time",            org: "Heli-One, Stavanger" },
    { ref: "AD 2018-0087-E", title: "PT6T-3D — Power Turbine Governor Inspection",         status: "COMPLIED",     date: "22 Apr 2018", fh_at: "2,210.5", interval: "One-time",            org: "Heli-One, Stavanger" },
    { ref: "AD 2016-0110-E", title: "Bell 412 — Tail Rotor Blade Retention Nut Torque",   status: "COMPLIED",     date: "15 Jan 2017", fh_at: "820.0",   interval: "One-time + on cond.",  org: "Heli-One, Stavanger" },
  ],
  component_changes: [
    { date: "24 Feb 2026", item: "Avionics — GTN 750Xi Upgrade",   pn_off: "Garmin GNS 530W",      sn_off: "GNS530-091234",    pn_on: "Garmin GTN 750Xi",      sn_on: "GTN750-204417",    reason: "Owner elected avionics upgrade (SB 412-95-04)",                             form1: "FORM1-2026-AV-001",   org: "Heli-One, Stavanger" },
    { date: "15 Sep 2022", item: "Tail Boom Skin Doublers (×2)",   pn_off: "N/A (new install)",    sn_off: "N/A",               pn_on: "412-054-219-101",       sn_on: "N/A (struct. mod)",reason: "SB 412-54-19 mandatory structural modification",                           form1: "FORM1-2022-TBD-001",  org: "Heli-One, Stavanger" },
    { date: "15 Sep 2022", item: "Lead-Lag Dampers (×4)",          pn_off: "412-010-701-003",      sn_off: "LLD-12-0044~47",    pn_on: "412-010-701-005",       sn_on: "LLD-21-0188~191", reason: "SB 412-65-07 — improved damper kit / life limit expiry",                  form1: "FORM1-2022-LLD-001",  org: "Heli-One, Stavanger" },
    { date: "15 Sep 2022", item: "MR Blade — MRB-15-0022 (quarantined)", pn_off: "412-015-125-155", sn_off: "MRB-15-0022",    pn_on: "412-015-125-157",       sn_on: "MRB-23-0071",     reason: "Crack indication at root fitting (FPI) — Bell Eng Report BT-ENG-2023-0417",form1: "FORM1-2022-MRB-007",  org: "Heli-One, Stavanger" },
  ],
  pdf_filename: "EI-BT1_Helicopter_Logbook.pdf",
};

export const HELICOPTER_LOGBOOKS: HelicopterLogbook[] = [EI_AH1, EI_BT1];
