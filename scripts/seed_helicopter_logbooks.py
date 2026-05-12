"""
Seed synthetic helicopter logbook data into the OriginTrace database.
Inserts cases, documents, findings (with anomalies), LLP parts, and engine metrics.
Run from project root: .venv/bin/python3 scripts/seed_helicopter_logbooks.py
"""
from __future__ import annotations
import hashlib
import json
import os
import shutil
import sys
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv
# Load frontend/.env which has DATABASE_BACKEND=snowflake + RSA key path
load_dotenv(dotenv_path=Path(__file__).parent.parent / "frontend" / ".env", override=True)

from src.config import load_settings
from src.backends.database_snowflake import SnowflakeDatabaseBackend

# ─── Bootstrap ───────────────────────────────────────────────────────────────
settings = load_settings()
db = SnowflakeDatabaseBackend(
    account=settings.snowflake_account,
    user=settings.snowflake_user,
    password=settings.snowflake_password,
    database=settings.snowflake_database,
    schema=settings.snowflake_schema,
    warehouse=settings.snowflake_warehouse,
    private_key_path=settings.snowflake_private_key_path or None,
    private_key_passphrase=settings.snowflake_private_key_passphrase or None,
)
db.ensure_schema()

STORAGE_ROOT = Path("./data/storage")
LOGBOOK_DIR  = Path("./synthetic_logbooks")


def pdf_hash(path: Path) -> str:
    h = hashlib.sha256()
    h.update(path.read_bytes())
    return h.hexdigest()


def copy_pdf(case_id: str, src: Path) -> str:
    """Copy PDF into case storage dir and return storage_key."""
    dest_dir = STORAGE_ROOT / "cases" / case_id / "docs"
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest = dest_dir / src.name
    shutil.copy2(src, dest)
    return str(dest.relative_to(STORAGE_ROOT))


def ts(days_ago: int = 0, hours_ago: int = 0) -> datetime:
    return datetime.now(timezone.utc) - timedelta(days=days_ago, hours=hours_ago)


# ─── Aircraft definitions ────────────────────────────────────────────────────
HELICOPTERS = [
    {
        "case_id":      "SMFL-H145-EI-AH1",
        "registration": "EI-AH1",
        "aircraft_type":"H145 (EC145 T2)",
        "engine_type":  "Arriel 2E (×2)",
        "pdf":          "EI-AH1_Helicopter_Logbook.pdf",
        # Engine metrics: name, value, unit, status
        "engine_metrics": [
            ("TOTAL_AIRFRAME_HOURS",          4287.4,  "FH",      "ok"),
            ("TOTAL_FLIGHT_CYCLES",           8574,    "FC",      "ok"),
            ("ENGINE_1_TSN",                  4287.4,  "FH",      "ok"),
            ("ENGINE_2_TSN",                  4287.4,  "FH",      "ok"),
            ("ENGINE_1_CSN",                  8574,    "FC",      "ok"),
            ("ENGINE_2_CSN",                  8574,    "FC",      "ok"),
            ("ENGINE_1_EGT_MARGIN",           47.2,    "°C",      "ok"),
            ("ENGINE_2_EGT_MARGIN",           38.1,    "°C",      "advisory"),   # lower margin
            ("MAIN_GEARBOX_OIL_TEMP",         88.4,    "°C",      "ok"),
            ("MAIN_GEARBOX_OIL_PRESSURE",     3.2,     "bar",     "ok"),
            ("LAST_A_CHECK_FH",               4240.5,  "FH",      "ok"),
            ("LAST_C_CHECK_FH",               3650.0,  "FH",      "ok"),
            ("NEXT_C_CHECK_DUE_FH",           6650.0,  "FH",      "ok"),
            ("HUMS_VIBRATION_MGB_RMS",        0.42,    "IPS",     "advisory"),   # slightly elevated
            ("ENGINE_1_OIL_CONSUMPTION",      0.04,    "qt/hr",   "ok"),
            ("ENGINE_2_OIL_CONSUMPTION",      0.09,    "qt/hr",   "ok"),
        ],
        # LLP parts
        "llp": [
            ("llp-ah1-mrb",  "Main Rotor Blade (×4)",  "H145-MRB-4022", "MRB-22-0041~44",  "FH", 4287, 10000, "verified",       "Replaced at C-Check Jun 2023. New manufacture."),
            ("llp-ah1-mrh",  "Main Rotor Hub",          "H145-MRH-3010", "MRH-18-0017",     "FH", 4287, 12000, "verified",       "Original to aircraft. Within life limits."),
            ("llp-ah1-trb",  "Tail Rotor Blade (×3)",  "H145-TRB-1508", "TRB-22-0011~13",  "FH", 4287, 8000,  "verified",       "3,713 FH remaining. Approaching 50% life used."),
            ("llp-ah1-mgb",  "Main Gearbox",            "H145-MGB-9001", "MGB-18-0042",     "FH", 4287, 15000, "verified",       "Original to aircraft. 10,713 FH remaining."),
            ("llp-ah1-tgb",  "Tail Rotor Gearbox",     "H145-TGB-4002", "TGB-20-0088",     "FH", 1450, 6000,  "verified",       "Overhauled at C-Check 2023. 4,550 FH remaining."),
            ("llp-ah1-eng1", "Engine 1 (Arriel 2E)",   "ARL2E-ASSY",    "E2E-17-4421",     "FH", 4287, 20000, "verified",       "15,713 FH remaining. HSI due at 6,000 FH."),
            ("llp-ah1-eng2", "Engine 2 (Arriel 2E)",   "ARL2E-ASSY",    "E2E-17-4422",     "FH", 4287, 20000, "pending_review", "BTB records incomplete — 2021 flood event. Requires resolution."),
            ("llp-ah1-igb",  "Intermediate Gearbox",   "H145-IGB-5503", "IGB-19-0033",     "FH", 4287, 10000, "verified",       "5,713 FH remaining."),
            ("llp-ah1-mrm",  "Main Rotor Mast",        "H145-MRM-2211", "MRM-18-0019",     "FH", 4287, 20000, "verified",       "15,713 FH remaining."),
            ("llp-ah1-swp",  "Swashplate Assembly",    "H145-SWP-7701", "SWP-18-0022",     "FH", 4287, 15000, "verified",       "10,713 FH remaining."),
        ],
        # Findings: (finding_id, severity, category, title, evidence, confidence, page, iter, days_ago)
        "findings": [
            # ── ADVISORY: AD compliance gap ──
            (
                "find-ah1-001", "ADVISORY", "Airworthiness Directive",
                "AD 2023-0142-E (Arriel 2E EGT Monitoring) — Compliance Overdue by 87 FH",
                "AD 2023-0142-E requires EGT margin check every 300 FH. Last recorded compliance at 3,900.0 FH (signed J. Murphy, AIH MRO). Current TAH is 4,287.4 FH — next compliance was due at 4,200.0 FH. Gap of 87.4 FH with no interim compliance record found in the logbook package. Engine 2 EGT margin measured at 38.1°C, which is reduced compared to Engine 1 (47.2°C) and may indicate creep toward the minimum limit. Operator must confirm whether interim compliance was performed and records held separately.",
                0.94, "Section 6 — AD Compliance", 0, 2
            ),
            # ── ADVISORY: Missing tech log pages ──
            (
                "find-ah1-002", "ADVISORY", "Documentation",
                "Engine 2 Technical Log — 3 Pages Missing (14–16 Sep 2021)",
                "Technical log section for Engine S/N E2E-17-4422 (Engine 2) covering 14–16 September 2021 is absent from the physical document package. MRO (Heli-One, Stavanger) issued confirmation letter STA-MRO-2021-4422 citing records destroyed in facility flood event (Stavanger, September 2021). While the flood event is a documented force majeure incident, the missing records mean Engine 2 maintenance performed during this period cannot be independently verified. This affects EASA Part-M traceability requirements. Low risk given corroborating documentation, but gap must be formally accepted by the lessor's technical representative.",
                0.92, "Section 2 — Engine Records", 0, 5
            ),
            # ── FLAG: Engine 2 BTB pending ──
            (
                "find-ah1-003", "FLAG", "Back-to-Birth Traceability",
                "Engine 2 (S/N E2E-17-4422) — BTB Record Status Unresolved: PENDING",
                "Engine 2 Life Limited Parts Back-to-Birth (BTB) status is recorded as PENDING in the logbook. This is linked to the September 2021 Stavanger MRO flood event which destroyed a portion of the Engine 2 technical log. The BTB chain for engine LLPs cannot be independently verified from birth without these records. Per EASA Part-21 and the IATA iSpec 2200 BTB standard, a complete unbroken record chain is required. A PENDING BTB status is a material deficiency in an aircraft transaction context. Resolution requires either recovery of duplicate records from Safran Helicopter Engines (engine OEM) or a formal BTB gap acceptance by both parties with an adjustment to the asset valuation.",
                0.97, "Section 5 — LLP Tracking", 0, 5
            ),
            # ── ADVISORY: HUMS vibration ──
            (
                "find-ah1-004", "ADVISORY", "Health & Usage Monitoring",
                "HUMS — Main Gearbox Vibration RMS Reading Elevated (0.42 IPS)",
                "HUMS data exported from the last A-Check (4,240.5 FH) shows main gearbox vibration RMS at 0.42 IPS. The Airbus H145 AMM advisory threshold is 0.40 IPS; the maintenance action threshold is 0.55 IPS. The reading is above advisory but below action threshold. Trend data over the last 150 FH shows a gradual increase from 0.34 IPS (at 4,090 FH) to 0.42 IPS — a 23.5% increase. While not yet requiring grounding, the trend suggests early-stage gearbox wear and warrants close monitoring. Recommend gearbox oil spectroscopic analysis (SOAP) at next 50 FH opportunity and HUMS trending review.",
                0.91, "Section 4 — Maintenance Records", 1, 2
            ),
            # ── ADVISORY: C-Check workscope gap ──
            (
                "find-ah1-005", "ADVISORY", "Maintenance Records",
                "C-Check Workscope (Jun 2023) — 2 Sub-Tasks Lack Final Sign-Off Stamps",
                "Review of the C-Check workscope documentation from Airbus Helicopters MRO, Donauwörth (June 2023, 3,650.0 FH) identified two sub-tasks without final inspector sign-off stamps in the physical records: (1) AMM Task 05-20-00-200-001 — Airframe general visual inspection (GVI), station 100–200; (2) AMM Task 12-10-00-680-001 — Engine oil servicing post-check. The tasks appear on the completed workscope printout but the sign-off blocks in the physical job card package are unsigned. This may indicate that the stamps were affixed to a duplicate set held by the MRO or that there is a records management issue. The aircraft was released to service with a valid CRS, suggesting the work was completed, but the unsigned job cards represent a documentation deficiency.",
                0.89, "Section 3 — EASA Form 1", 1, 8
            ),
            # ── CLEAR: Main rotor blade life ──
            (
                "find-ah1-006", "CLEAR", "Life Limited Parts",
                "Main Rotor Blades (×4) — Life Status Verified Within Limits",
                "Main rotor blade set (P/N H145-MRB-4022, S/N MRB-22-0041/0042/0043/0044) installed at C-Check June 2023. Current accumulated hours: 637.4 FH since new install. Life limit: 10,000 FH. Remaining: 9,362.6 FH. Form 1 ref FORM1-2023-MRB-004 (Airbus Helicopters, Marignane, France — EASA.21J.0003) verified as new manufacture. Anti-erosion strips confirmed pre-installed. BTB status: VERIFIED. No findings.",
                0.99, "Section 5 — LLP Tracking", 2, 2
            ),
            # ── CLEAR: AD compliance (main set) ──
            (
                "find-ah1-007", "CLEAR", "Airworthiness Directive",
                "AD Compliance — 5 of 6 ADs Fully Complied With",
                "Review of the Airworthiness Directive compliance record confirms 5 of 6 applicable ADs are fully complied with: AD 2019-0215-E (pitch link, one-time, 1,120 FH ✓), AD 2021-0099-E (TR blade crack check, 2,544.7 FH ✓), AD 2022-0178-E (anti-ice function test, annual, 3,510 FH ✓), AD 2024-0055-E (HUMS software v4.2, one-time, 4,012.3 FH ✓), AD 2025-0031-E (MGB oil filter, A-Check, 4,240.5 FH ✓). One AD (2023-0142-E) has an unresolved compliance gap — see separate finding.",
                0.98, "Section 6 — AD Compliance", 2, 2
            ),
            # ── ADVISORY: Tail rotor blade life approaching midpoint ──
            (
                "find-ah1-008", "ADVISORY", "Life Limited Parts",
                "Tail Rotor Blades (×3) — 53.6% Life Consumed; Replacement Planning Recommended",
                "Tail rotor blade set (P/N H145-TRB-1508, S/N TRB-22-0011/0012/0013) installed at C-Check June 2023. Current accumulated hours: 4,287 FH total airframe (blades installed at 3,650 FH, so 637 FH on new blades — however original blades carried 3,650 FH). The blade set was replaced at C-Check from TRB-16-0011~13 which had consumed 3,650 of 8,000 FH. Current blades (new in Jun 2023) have accrued 637 FH of 8,000 FH limit. Remaining: 7,363 FH. However, at average utilization rate (ca. 550 FH/year), blades will approach life limit within approximately 13.4 years — well within next C-Check cycle. No immediate action required; flag for long-term asset planning.",
                0.88, "Section 5 — LLP Tracking", 2, 3
            ),
        ],
    },
    {
        "case_id":      "SMFL-B412-EI-BT1",
        "registration": "EI-BT1",
        "aircraft_type":"Bell 412EP",
        "engine_type":  "PT6T-3D Twin Pac (×2)",
        "pdf":          "EI-BT1_Helicopter_Logbook.pdf",
        "engine_metrics": [
            ("TOTAL_AIRFRAME_HOURS",          7142.8,  "FH",      "ok"),
            ("TOTAL_FLIGHT_CYCLES",           14285,   "FC",      "ok"),
            ("ENGINE_1_TSN",                  7142.8,  "FH",      "ok"),
            ("ENGINE_2_TSN",                  7142.8,  "FH",      "ok"),
            ("ENGINE_1_CSN",                  14285,   "FC",      "ok"),
            ("ENGINE_2_CSN",                  14285,   "FC",      "ok"),
            ("ENGINE_1_OIL_CONSUMPTION",      0.07,    "qt/hr",   "ok"),
            ("ENGINE_2_OIL_CONSUMPTION",      0.14,    "qt/hr",   "advisory"),   # elevated
            ("ENGINE_1_EGT_MARGIN",           52.1,    "°C",      "ok"),
            ("ENGINE_2_EGT_MARGIN",           44.7,    "°C",      "advisory"),   # reduced
            ("MAIN_GEARBOX_CHIP_EVENTS",      1,       "events",  "advisory"),
            ("LAST_A_CHECK_FH",               7080.5,  "FH",      "ok"),
            ("LAST_C_CHECK_FH",               5900.0,  "FH",      "ok"),
            ("NEXT_C_CHECK_DUE_FH",           8900.0,  "FH",      "ok"),
            ("ENGINE_2_HSI_DUE_FH",           10000.0, "FH",      "advisory"),   # 2,857 FH away
            ("ENGINE_1_POWER_ASSURANCE_PCT",  98.4,    "%",       "ok"),
            ("ENGINE_2_POWER_ASSURANCE_PCT",  94.1,    "%",       "advisory"),
        ],
        "llp": [
            ("llp-bt1-mrb",  "Main Rotor Blade (×4)",   "412-015-125-157", "MRB-23-0071~74", "FH", 7143, 10000, "verified",       "Installed May 2023 (new manufacture). Replaced quarantined blade MRB-15-0022. 2,857 FH remaining."),
            ("llp-bt1-mrh",  "Main Rotor Hub",           "412-010-402-101", "MRH-15-0044",    "FH", 7143, 25000, "verified",       "Original to aircraft. 17,857 FH remaining."),
            ("llp-bt1-trb",  "Tail Rotor Blade (×2)",   "412-015-260-101", "TRB-18-0088/89", "FH", 7143, 12000, "verified",       "4,857 FH remaining."),
            ("llp-bt1-mgb",  "Main Gearbox",             "412-040-102-101", "MGB-15-0113",    "FH", 7143, 30000, "verified",       "22,857 FH remaining."),
            ("llp-bt1-igb",  "Intermediate Gearbox",    "412-040-702-101", "IGB-15-0044",    "FH", 7143, 15000, "pending_review", "BTB records gap 2017–2019 (pooled component). GOH confirmation GOH-2021-IGB-0044 on file but individual period records unavailable."),
            ("llp-bt1-tgb",  "Tail Rotor Gearbox",      "412-040-802-105", "TGB-18-0099",    "FH", 7143, 15000, "verified",       "7,857 FH remaining."),
            ("llp-bt1-eng1", "Engine 1 (PT6T-3D)",      "PT6T-3D-ASSY",   "PCE-PE0098221",  "FH", 7143, 30000, "verified",       "22,857 FH remaining. Unlimited cycles."),
            ("llp-bt1-eng2", "Engine 2 (PT6T-3D)",      "PT6T-3D-ASSY",   "PCE-PE0098222",  "FH", 7143, 30000, "verified",       "22,857 FH remaining. HSI due at 10,000 FH — 2,857 FH away. Monitor oil consumption trend."),
            ("llp-bt1-mrm",  "Main Rotor Mast",          "412-010-121-101", "MRM-15-0051",    "FH", 7143, 25000, "verified",       "17,857 FH remaining."),
            ("llp-bt1-swp",  "Swashplate Assembly",     "412-011-200-101", "SWP-15-0033",    "FH", 7143, 20000, "verified",       "12,857 FH remaining."),
        ],
        "findings": [
            # ── STOP: Structural mod dual-sign missing ──
            (
                "find-bt1-001", "STOP", "Structural Airworthiness",
                "SB 412-54-19 (Mandatory Tail Boom Structural Modification) — Final Inspection Card Unsigned",
                "Service Bulletin 412-54-19 (mandatory — tail boom skin doublers installation) was incorporated during C-Check at Heli-One, Stavanger, September 2022 (5,900.0 FH). Review of the physical work package (Job Card Package Ref. HC-2022-54019) identifies that the final 'Dual Inspection' sign-off block on Card 7 of 9 (final assembly verification card) is unsigned. EASA Part-145 Subpart D, AMC 145.A.50(d) requires independent dual inspection for any structural modification incorporating an SB classified as 'Mandatory'. The CRS was issued (Heli-One release cert HC-CRS-2022-B412EP-004) but it is unclear how the final card remained unsigned. This constitutes a critical airworthiness documentation discrepancy. The aircraft must not be transacted until the MRO provides a retrospective signed inspection card or an independent structural inspection verifies the installation to the required standard.",
                0.98, "Section 7 — SB Status / Section 8", 0, 3
            ),
            # ── FLAG: MR Blade crack (resolved but significant) ──
            (
                "find-bt1-002", "FLAG", "Structural — Rotor System",
                "Main Rotor Blade S/N MRB-15-0022 — FPI Crack Indication at Root Fitting (Resolved)",
                "During C-Check inspection (September 2022, 5,900 FH), fluorescent penetrant inspection (FPI) detected a hairline indication at the root fitting of main rotor blade S/N MRB-15-0022. Blade was quarantined and removed from service. Bell Textron Engineering Disposition Report BT-ENG-2023-0417 (dated 14 March 2023) concluded the indication was within allowable damage limits per Bell 412 SRM Chapter 62. However, Bell recommended preventive replacement. Replacement blade (Form 1 FORM1-2022-MRB-007, P/N 412-015-125-157, new manufacture) installed May 2023. While the finding is resolved operationally, the crack indication in a primary structural component on a 7-year-old aircraft with 5,900 FH warrants review. The quarantined blade's disposition (returned to Bell Textron for engineering teardown) should be confirmed in writing. Recommend lessor obtain copy of Bell Textron teardown report for the asset file.",
                0.96, "Section 9 — Flags & Discrepancies", 0, 4
            ),
            # ── STOP: AD engineering disposition not countersigned ──
            (
                "find-bt1-003", "FLAG", "Airworthiness Directive",
                "AD 2022-0209-E Engineering Disposition (BT-ENG-2023-0417) — Not Countersigned by Lessor Technical Representative",
                "The engineering disposition report for AD 2022-0209-E (main rotor blade root fitting FPI — Bell 412) is Bell Textron document BT-ENG-2023-0417. This report was used to justify the blade removal decision (see separate finding for blade crack). However, the disposition document does not carry a countersignature from the lessor's (SMFL) technical representative, nor from an independent EASA Part-21J Design Organisation. The report was authored by Bell Textron internal engineering and accepted by Heli-One under their MRO authority without independent technical review. EASA Part-21 Subpart M, GM 21.A.431(b) guidance indicates that for fleet-significant structural findings, an independent technical concurrence is best practice. The absence of a countersignature does not void the CRS but represents a governance gap in the technical due diligence record.",
                0.93, "Section 6 — AD Compliance", 0, 5
            ),
            # ── FLAG: Engine 2 oil trend and HSI approaching ──
            (
                "find-bt1-004", "FLAG", "Engine Health",
                "Engine 2 (S/N PCE-PE0098222) — Oil Consumption Trend Elevated; HSI Timeline Requires Planning",
                "HUMS oil consumption data for Engine 2 (PT6T-3D, S/N PCE-PE0098222) shows a progressive upward trend: 0.09 qt/hr at 6,555 FH → 0.12 qt/hr at 6,950 FH → 0.14 qt/hr at 7,080 FH. AMM limit is 0.25 qt/hr. The trend has increased 55.6% over the last 525 FH. Extrapolating the trend, the AMM limit could be approached at approximately 8,800–9,200 FH TAH. Additionally, Engine 2 borescope inspection at 7,080 FH noted minor hot section oxidation on first stage turbine blades (within AMM limits per Heli-One BSI report HL1-BSI-2026-0224). The next mandatory Hot Section Inspection (HSI) is due at 10,000 FH (2,857.2 FH from current). However, the oil consumption trend and BSI finding together suggest the HSI may need to be brought forward. P&WC EMM recommends advanced HSI scheduling when oil consumption increases >40% over 500 FH. This threshold has been exceeded.",
                0.95, "Section 2 — Engine Records", 0, 3
            ),
            # ── ADVISORY: IGB BTB gap ──
            (
                "find-bt1-005", "ADVISORY", "Back-to-Birth Traceability",
                "Intermediate Gearbox (S/N IGB-15-0044) — BTB Record Gap 2017–2019 (Pooled Component)",
                "Intermediate Gearbox S/N IGB-15-0044 Back-to-Birth records show a gap from November 2017 to March 2019. The previous operator (Global Offshore Helicopters, Aberdeen) confirmed in writing (GOH-2021-IGB-0044, dated 08 Apr 2021) that the IGB was part of a pooled rotable exchange during this period. Records for the pooled period are held collectively by GOH and are not itemised to individual component serial numbers. The total time accrued during pooled period is estimated at approximately 1,200 FH by GOH based on pool utilisation averages. This estimate is not independently verifiable. The IGB life limit is 15,000 FH; current total accumulated hours are 7,143 FH. If the 1,200 FH pool estimate is accurate, the BTB-verified hours are correct. Recommend requesting certified extract from Bell Textron FAST (Field Aviation Support Tool) system to determine if OEM records exist for this serial number across its entire life.",
                0.91, "Section 5 — LLP Tracking", 1, 5
            ),
            # ── ADVISORY: Weight and balance not updated post-avionics ──
            (
                "find-bt1-006", "ADVISORY", "Documentation",
                "Weight & Balance Documentation Not Updated Following GTN 750Xi Avionics Upgrade",
                "The Garmin GTN 750Xi navigation system installation (SB 412-95-04, Heli-One, February 2026) replaced the Garmin GNS 530W. The GNS 530W has a published weight of 2.3 kg; the GTN 750Xi has a published weight of 2.7 kg, a delta of +0.4 kg at approximately the same station (fuselage station 241.6). Review of the aircraft Weight & Balance (W&B) schedule (Bell Form 412-W&B-2015-BT1, last revised post-delivery November 2015) shows the weight has not been updated to reflect the avionics exchange. Per EASA Part-M ML.A.302 and Bell 412 AMM Chapter 08-10-00, the W&B record must be updated following any modification that changes the aircraft empty weight by more than 0.5% (approximately 26.9 kg for this aircraft at MTOW 5,397 kg). The 0.4 kg change is below this threshold, so mandatory revision may not be strictly required, but best practice requires the record to be current. Recommend update of W&B schedule at next scheduled maintenance visit.",
                0.88, "Section 8 — Component Changes", 1, 2
            ),
            # ── ADVISORY: MGB chip event ──
            (
                "find-bt1-007", "ADVISORY", "Powerplant / Transmission",
                "Main Gearbox — Historic Chip Detector Event (28 Jan 2022, 5,480.7 FH): Trend Monitoring Required",
                "At A-Check in January 2022 (5,480.7 FH), the main gearbox chip detector triggered a trace metallic fines indication. The oil was drained, gearbox flushed, and fresh oil added per Bell 412 AMM Chapter 63-10-00. A follow-up 50 FH check showed no further metallic particle generation. The event was closed as 'Normal wear particles within acceptable limits.' However, the chip detector event is not followed by a spectroscopic oil analysis (SOAP) result in the logbook package. EASA AMC 145.A.45(d) recommends SOAP analysis following any chip event to baseline the metallic content and establish trend data. The absence of SOAP records means the chip event's root cause was not fully characterised. Recommend requesting SOAP results from Heli-One if held on file, or scheduling a SOAP analysis at next maintenance opportunity.",
                0.90, "Section 4 — Maintenance Records", 1, 8
            ),
            # ── CLEAR: Engine 1 health all good ──
            (
                "find-bt1-008", "CLEAR", "Engine Health",
                "Engine 1 (S/N PCE-PE0098221) — All Health Parameters Within Limits",
                "Engine 1 (PT6T-3D, S/N PCE-PE0098221) health status confirmed satisfactory. Borescope inspection at A-Check (7,080.5 FH) — no findings. Power assurance check: 98.4% (exceeds 95% minimum). Oil consumption: 0.07 qt/hr (well within 0.25 qt/hr AMM limit). EGT margin: 52.1°C (healthy; P&WC EMM minimum is 15°C). No hot section anomalies. Compressor bleed valve (AD 2024-0074-E) inspected and found serviceable. Next HSI due at 10,000 FH (2,857.2 FH remaining). Engine 1 presents no concerns.",
                0.99, "Section 2 — Engine Records", 2, 2
            ),
            # ── CLEAR: Structural SBs ──
            (
                "find-bt1-009", "CLEAR", "Maintenance Records",
                "Structural Modification SB 412-54-19 (Tail Boom Doublers) — Installation Verified Compliant",
                "SB 412-54-19 (mandatory tail boom skin doublers) was incorporated during C-Check September 2022. Physical inspection records confirm doublers installed at correct stations per SB drawing 412-54-019-001. Material certificate (aluminium alloy 7075-T73) and Form 1 (FORM1-2022-TBD-001) are on file. Heli-One NDT report (HL1-NDT-2022-09-001) confirms doubler bonding inspected by penetrant testing — no defects. Note: Final dual-inspection card unsigned (see separate STOP finding) — this CLEAR applies to the physical installation quality only, not to the documentation status.",
                0.95, "Section 7 — SB Status", 2, 3
            ),
        ],
    },
]


# ─── Main seeding logic ──────────────────────────────────────────────────────
def seed():
    print("\n═══ Seeding SMFL Helicopter Logbooks ═══\n")

    for heli in HELICOPTERS:
        case_id = heli["case_id"]
        reg     = heli["registration"]
        print(f"► {reg}  ({heli['aircraft_type']})  →  {case_id}")

        # 1. Create case
        db.insert_case(case_id, reg, heli["aircraft_type"], heli["engine_type"])
        print(f"  ✓ Case created")

        # 2. Copy PDF and register document
        pdf_src = LOGBOOK_DIR / heli["pdf"]
        if not pdf_src.exists():
            print(f"  ✗ PDF not found: {pdf_src} — skipping document")
        else:
            storage_key = copy_pdf(case_id, pdf_src)
            doc_id = f"doc-{case_id}-logbook"
            h = pdf_hash(pdf_src)
            import pdfplumber
            with pdfplumber.open(str(pdf_src)) as p:
                page_count = len(p.pages)
            db.insert_document(
                case_id=case_id,
                doc_id=doc_id,
                filename=heli["pdf"],
                content_hash=h,
                storage_key=storage_key,
                page_count=page_count,
                metadata_json=json.dumps({
                    "document_type": "Helicopter Technical Logbook",
                    "registration": reg,
                    "manufacturer": heli["aircraft_type"].split(" ")[0],
                    "synthetic": True,
                }),
            )
            print(f"  ✓ Document registered ({page_count} pages)")

        # 3. Engine metrics
        for metric_name, value, unit, status in heli["engine_metrics"]:
            db.insert_engine_data(
                case_id=case_id,
                registration=reg,
                aircraft_type=heli["aircraft_type"],
                engine_type=heli["engine_type"],
                metric_name=metric_name,
                metric_value=value,
                unit=unit,
                status=status,
            )
        print(f"  ✓ {len(heli['engine_metrics'])} engine metrics inserted")

        # 4. LLP parts
        for (llp_id, part_name, part_number, serial_number,
             life_unit, current_used, life_limit, btb_status, notes) in heli["llp"]:
            db.insert_llp_part(
                id=llp_id,
                case_id=case_id,
                registration=reg,
                aircraft_type=heli["aircraft_type"],
                part_number=part_number,
                part_name=part_name,
                serial_number=serial_number,
                position=part_name.split("(")[0].strip(),
                life_unit=life_unit,
                current_used=float(current_used),
                life_limit=float(life_limit),
                btb_status=btb_status,
                next_inspection_date=None,
                last_btb_verified_at=None,
                notes=notes,
            )
        print(f"  ✓ {len(heli['llp'])} LLP parts inserted")

        # 5. Findings
        doc_id = f"doc-{case_id}-logbook"
        for (finding_id, severity, category, title, evidence,
             confidence, source_page, iteration, days_ago) in heli["findings"]:
            db.insert_finding(
                case_id=case_id,
                finding_id=finding_id,
                agent_name="TechnicalAirworthinessAgent",
                severity=severity,
                category=category,
                title=title,
                evidence=evidence,
                confidence=confidence,
                source_doc_id=doc_id,
                source_page=source_page,
                iteration=iteration,
                metadata_json=json.dumps({
                    "aviation_reference": source_page,
                    "correlation_group": category,
                    "reasoning": f"Extracted from {heli['aircraft_type']} Technical Logbook section: {source_page}",
                }),
            )
        print(f"  ✓ {len(heli['findings'])} findings inserted")
        print()

    print("═══ Seeding complete ═══\n")
    print("Dashboard:      http://localhost:3591/rotary-wing/dashboard")
    print("Fleet:          http://localhost:3591/rotary-wing/fleet")
    print("Findings EI-AH1: http://localhost:3591/rotary-wing/cases/SMFL-H145-EI-AH1")
    print("Findings EI-BT1: http://localhost:3591/rotary-wing/cases/SMFL-B412-EI-BT1")
    print("LLP:            http://localhost:3591/rotary-wing/llp")
    print("Logbooks:       http://localhost:3591/rotary-wing/logbooks")


if __name__ == "__main__":
    seed()
