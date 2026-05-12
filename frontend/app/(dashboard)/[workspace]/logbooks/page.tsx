"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, AlertTriangle, CheckCircle, Clock, Wrench,
  ChevronDown, Download, ChevronRight, Shield, Activity,
  BookOpen, AlertCircle,
} from "lucide-react";
import MaintenanceTimeline, { type TimelineEvent } from "@/components/aircraft/MaintenanceTimeline";
import { HELICOPTER_LOGBOOKS, type HelicopterLogbook, type LLPEntry } from "@/data/helicopter-logbooks";

// ─── Helpers ────────────────────────────────────────────────────────────────
function parseDate(d: string): string {
  // "12 Mar 2026" → ISO approx
  try {
    return new Date(d).toISOString();
  } catch {
    return new Date().toISOString();
  }
}

function toTimelineEvents(ac: HelicopterLogbook): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  for (const m of ac.maintenance_history) {
    const kind =
      m.type === "Delivery/CRS" ? "ownership" :
      m.type.includes("C-Check") ? "maintenance" :
      m.type.includes("Special") ? "maintenance" : "maintenance";
    events.push({
      id: `maint-${m.fh}-${m.type}`,
      date: parseDate(m.date),
      kind,
      title: m.type,
      subtitle: m.org,
      detail: m.desc,
    });
  }

  for (const flag of ac.flags) {
    const sev = flag.severity === "FLAG" ? "STOP" : "ADVISORY";
    events.push({
      id: `flag-${flag.title.slice(0, 20)}`,
      date: new Date().toISOString(),
      kind: "finding",
      title: flag.title.slice(0, 60),
      subtitle: flag.category,
      detail: flag.evidence,
      severity: sev,
    });
  }

  return events;
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function SeverityBadge({ sev }: { sev: "FLAG" | "ADVISORY" | "CLEAR" }) {
  const styles = {
    FLAG:     "bg-rose-100 text-rose-700 border-rose-200",
    ADVISORY: "bg-amber-100 text-amber-700 border-amber-200",
    CLEAR:    "bg-emerald-100 text-emerald-700 border-emerald-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[sev]}`}>
      {sev === "FLAG" ? <AlertTriangle size={10} /> : sev === "ADVISORY" ? <AlertCircle size={10} /> : <CheckCircle size={10} />}
      {sev}
    </span>
  );
}

function LLPBar({ entry }: { entry: LLPEntry }) {
  const pct = Math.min(100, Math.round((entry.current_fh / entry.life_fh) * 100));
  const isLow = entry.rem_fh < 1000;
  const isMed = entry.rem_fh >= 1000 && entry.rem_fh < 3000;
  const barColor = isLow ? "bg-rose-500" : isMed ? "bg-amber-500" : "bg-emerald-500";
  const textColor = isLow ? "text-rose-600" : isMed ? "text-amber-600" : "text-emerald-600";

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${barColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
        />
      </div>
      <span className={`text-[10px] font-bold tabular-nums ${textColor}`}>
        {entry.rem_fh.toLocaleString()} FH left
      </span>
    </div>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white border border-slate-200/60 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
      <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
        {icon}
      </div>
      <div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</div>
        <div className="text-[15px] font-black text-slate-900">{value}</div>
        {sub && <div className="text-[9px] text-slate-400">{sub}</div>}
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function LogbooksPage() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<"overview" | "llp" | "ads" | "changes">("overview");

  const ac = HELICOPTER_LOGBOOKS[selectedIdx];
  const timelineEvents = useMemo(() => toTimelineEvents(ac), [ac]);

  const flagCount = ac.flags.filter(f => f.severity === "FLAG").length;
  const advCount  = ac.flags.filter(f => f.severity === "ADVISORY").length;
  const pendingBtb = ac.llp.filter(l => l.btb !== "VERIFIED").length;

  const tabs = [
    { key: "overview", label: "Overview & Timeline" },
    { key: "llp",      label: "Life Limited Parts" },
    { key: "ads",      label: "AD Compliance" },
    { key: "changes",  label: "Component Changes" },
  ] as const;

  return (
    <div className="flex flex-col min-h-full bg-white font-sans">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900">Helicopter Logbooks</h1>
            <p className="text-[10px] text-slate-400 font-medium">SMFL Demo — Synthetic Records</p>
          </div>
        </div>

        {/* Aircraft selector */}
        <div className="flex items-center gap-2">
          {HELICOPTER_LOGBOOKS.map((a, i) => (
            <button
              key={a.registration}
              onClick={() => setSelectedIdx(i)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                i === selectedIdx
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300"
              }`}
            >
              {a.registration}
              <span className="ml-1 text-[9px] opacity-70">{a.manufacturer.split(" ")[0]} {a.model.split(" ")[0]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={ac.registration}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {/* ── Aircraft identity banner ── */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-5 mb-6 flex items-center justify-between gap-4">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{ac.manufacturer}</div>
                <div className="text-2xl font-black text-white tracking-tight">{ac.registration}</div>
                <div className="text-sm text-slate-400 mt-0.5">{ac.model} · MSN {ac.msn}</div>
                <div className="text-[11px] text-slate-500 mt-1">{ac.engine_model}</div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2">
                  {flagCount > 0 && (
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-rose-500/20 border border-rose-400/30 rounded-lg text-[11px] font-bold text-rose-300">
                      <AlertTriangle size={12} /> {flagCount} Flag{flagCount > 1 ? "s" : ""}
                    </span>
                  )}
                  {advCount > 0 && (
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/20 border border-amber-400/30 rounded-lg text-[11px] font-bold text-amber-300">
                      <AlertCircle size={12} /> {advCount} Advisory
                    </span>
                  )}
                  {flagCount === 0 && advCount === 0 && (
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-lg text-[11px] font-bold text-emerald-300">
                      <CheckCircle size={12} /> No flags
                    </span>
                  )}
                </div>
                <a
                  href={`/logbooks/${ac.pdf_filename}`}
                  download
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-[11px] font-bold transition-all"
                  title="Download PDF logbook"
                >
                  <Download size={13} /> Download PDF
                </a>
              </div>
            </div>

            {/* ── Stat row ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <StatCard icon={<Clock size={18} />}    label="Total Hours"     value={ac.tah}       sub="Flight hours" />
              <StatCard icon={<Activity size={18} />} label="Total Landings"  value={ac.tl}        sub="Cycles" />
              <StatCard icon={<Wrench size={18} />}   label="Last A-Check"    value={ac.last_a_check.date} sub={`@ ${ac.last_a_check.fh} FH`} />
              <StatCard icon={<Shield size={18} />}   label="LLP — Pending BTB" value={pendingBtb.toString()} sub={`of ${ac.llp.length} items`} />
            </div>

            {/* ── Check dates ── */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: "Last A-Check", ...ac.last_a_check },
                { label: "Last B-Check", ...ac.last_b_check },
                { label: "Last C-Check", ...ac.last_c_check },
              ].map(c => (
                <div key={c.label} className="bg-slate-50 border border-slate-200/60 rounded-xl p-3">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{c.label}</div>
                  <div className="text-[13px] font-bold text-slate-900">{c.date}</div>
                  <div className="text-[11px] text-slate-500">@ {c.fh} FH</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 truncate">{c.loc}</div>
                </div>
              ))}
            </div>

            {/* ── Flags & Discrepancies ── */}
            {ac.flags.length > 0 && (
              <div className="mb-6">
                <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <AlertTriangle size={13} className="text-amber-500" />
                  Flags & Discrepancies
                </h2>
                <div className="space-y-3">
                  {ac.flags.map((flag, i) => (
                    <FlagCard key={i} flag={flag} />
                  ))}
                </div>
              </div>
            )}

            {/* ── Tabs ── */}
            <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-5">
              {tabs.map(t => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`flex-1 px-3 py-2 rounded-lg text-[11px] font-bold transition-all ${
                    activeTab === t.key
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {activeTab === "overview" && (
                  <MaintenanceTimeline
                    title="Maintenance & Event Timeline"
                    subtitle="Chronological record of all maintenance checks, findings and events"
                    events={timelineEvents}
                  />
                )}

                {activeTab === "llp" && <LLPTab llp={ac.llp} />}
                {activeTab === "ads" && <ADTab ads={ac.ads} />}
                {activeTab === "changes" && <ChangesTab changes={ac.component_changes} />}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Flag card ───────────────────────────────────────────────────────────────
function FlagCard({ flag }: { flag: HelicopterLogbook["flags"][0] }) {
  const [open, setOpen] = useState(false);
  const borderColor = flag.severity === "FLAG" ? "border-l-rose-500" : "border-l-amber-400";
  const bgColor     = flag.severity === "FLAG" ? "bg-rose-50/60"     : "bg-amber-50/60";

  return (
    <div
      onClick={() => setOpen(!open)}
      className={`border border-slate-200 border-l-4 ${borderColor} ${bgColor} rounded-xl p-4 cursor-pointer transition-all hover:shadow-sm`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <SeverityBadge sev={flag.severity} />
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-0.5">{flag.category}</div>
            <div className="text-[13px] font-bold text-slate-900 leading-snug">{flag.title}</div>
          </div>
        </div>
        <ChevronDown
          size={16}
          className={`text-slate-400 shrink-0 transition-transform mt-1 ${open ? "rotate-180" : ""}`}
        />
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-2 pt-3 border-t border-slate-200/60">
              <div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Evidence</div>
                <p className="text-[12px] text-slate-700 leading-relaxed">{flag.evidence}</p>
              </div>
              <div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Recommended Action</div>
                <p className="text-[12px] text-slate-600 leading-relaxed font-medium">{flag.action}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── LLP Tab ─────────────────────────────────────────────────────────────────
function LLPTab({ llp }: { llp: LLPEntry[] }) {
  return (
    <div className="space-y-2">
      {llp.map((entry, i) => {
        const pct = Math.min(100, Math.round((entry.current_fh / entry.life_fh) * 100));
        const isPending = entry.btb !== "VERIFIED";
        return (
          <div key={i} className="bg-white border border-slate-200/60 rounded-xl p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="min-w-0">
                <div className="text-[12px] font-bold text-slate-900">{entry.part}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">{entry.pn} · S/N {entry.sn}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${isPending ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
                  BTB: {entry.btb}
                </span>
              </div>
            </div>
            <LLPBar entry={entry} />
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[10px] text-slate-400">
                {entry.current_fh.toLocaleString()} FH used of {entry.life_fh.toLocaleString()} FH
              </span>
              <span className="text-[10px] font-bold text-slate-500">{pct}% consumed</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── AD Tab ──────────────────────────────────────────────────────────────────
function ADTab({ ads }: { ads: HelicopterLogbook["ads"] }) {
  return (
    <div className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-slate-900 text-white">
            {["AD Reference", "Title", "Status", "FH", "Date", "Interval"].map(h => (
              <th key={h} className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {ads.map((ad, i) => {
            const sc = ad.status === "COMPLIED" ? "text-emerald-600" : ad.status === "ADVISORY" ? "text-amber-600 font-bold" : "text-rose-600";
            return (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                <td className="px-4 py-3 text-[11px] font-bold text-slate-800 font-mono">{ad.ref}</td>
                <td className="px-4 py-3 text-[11px] text-slate-700">{ad.title}</td>
                <td className={`px-4 py-3 text-[11px] ${sc}`}>{ad.status}</td>
                <td className="px-4 py-3 text-[11px] font-mono text-slate-600">{ad.fh_at}</td>
                <td className="px-4 py-3 text-[11px] text-slate-600">{ad.date}</td>
                <td className="px-4 py-3 text-[11px] text-slate-500">{ad.interval}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Component Changes Tab ───────────────────────────────────────────────────
function ChangesTab({ changes }: { changes: HelicopterLogbook["component_changes"] }) {
  return (
    <div className="space-y-3">
      {changes.map((c, i) => (
        <div key={i} className="bg-white border border-slate-200/60 rounded-xl p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="text-[12px] font-bold text-slate-900">{c.item}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{c.date} · {c.org}</div>
            </div>
            <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded shrink-0">{c.form1}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-rose-50/60 border border-rose-100 rounded-lg p-2">
              <div className="text-[9px] font-bold text-rose-500 uppercase tracking-wider mb-1">Removed</div>
              <div className="font-mono text-slate-700">{c.pn_off}</div>
              <div className="text-slate-500 font-mono">{c.sn_off}</div>
            </div>
            <div className="bg-emerald-50/60 border border-emerald-100 rounded-lg p-2">
              <div className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Installed</div>
              <div className="font-mono text-slate-700">{c.pn_on}</div>
              <div className="text-slate-500 font-mono">{c.sn_on}</div>
            </div>
          </div>
          <div className="mt-2 text-[11px] text-slate-600 leading-relaxed">
            <span className="font-bold text-slate-500">Reason: </span>{c.reason}
          </div>
        </div>
      ))}
    </div>
  );
}
