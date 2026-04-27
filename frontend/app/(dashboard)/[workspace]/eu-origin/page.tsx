"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/layout/Header";
import { useWorkspaceColors } from "@/lib/workspace";
import type { PartOrigin } from "@/components/drone/EUOriginMap";
import { EU_COUNTRIES } from "@/components/drone/EUOriginMap";
import {
  Globe,
  CheckCircle,
  AlertTriangle,
  FileText,
  MapPin,
  Package,
  Search,
  Download,
  Info,
} from "lucide-react";

/* ── Dynamic import to avoid SSR issues with Leaflet ── */
const EUOriginMap = dynamic(() => import("@/components/drone/EUOriginMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[560px] rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center">
      <div className="flex items-center gap-3 text-slate-400 text-sm">
        <div className="w-5 h-5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
        Loading EU map...
      </div>
    </div>
  ),
});

/* ── Sample data — will be replaced with real scanned data as documents are uploaded ── */
const SAMPLE_PARTS: PartOrigin[] = [
  {
    id: "p1", partName: "Flight Controller Unit", batchId: "BAT-2026-FC01",
    supplier: "AeroTech GmbH", countryCode: "DE", countryName: "Germany",
    city: "Munich", lat: 48.14, lng: 11.58, isEU: true,
    documentId: "doc-fc01", documentName: "FC01_Certificate_of_Origin.pdf",
    verificationDate: "2026-03-15", quantity: 200,
  },
  {
    id: "p2", partName: "Carbon Fibre Propeller Blades", batchId: "BAT-2026-PB02",
    supplier: "CompositeFab SAS", countryCode: "FR", countryName: "France",
    city: "Toulouse", lat: 43.60, lng: 1.44, isEU: true,
    documentId: "doc-pb02", documentName: "PB02_EU_Compliance_Cert.pdf",
    verificationDate: "2026-02-28", quantity: 500,
  },
  {
    id: "p3", partName: "LiPo Battery Pack 6S", batchId: "BAT-2026-BP03",
    supplier: "DroneCell Ireland", countryCode: "IE", countryName: "Ireland",
    city: "Dublin", lat: 53.35, lng: -6.26, isEU: true,
    documentId: "doc-bp03", documentName: "BP03_Origin_Declaration.pdf",
    verificationDate: "2026-03-01", quantity: 350,
  },
  {
    id: "p4", partName: "GPS/GNSS Module", batchId: "BAT-2026-GPS04",
    supplier: "NavSat Sp. z o.o.", countryCode: "PL", countryName: "Poland",
    city: "Warsaw", lat: 52.23, lng: 21.01, isEU: true,
    documentId: "doc-gps04", documentName: "GPS04_Supplier_Declaration.pdf",
    verificationDate: "2026-01-20", quantity: 400,
  },
  {
    id: "p5", partName: "ESC Motor Controller", batchId: "BAT-2026-ESC05",
    supplier: "MotorDrive Srl", countryCode: "IT", countryName: "Italy",
    city: "Milan", lat: 45.46, lng: 9.19, isEU: true,
    documentId: "doc-esc05", documentName: "ESC05_Origin_Certificate.pdf",
    verificationDate: "2026-02-10", quantity: 600,
  },
  {
    id: "p6", partName: "Camera Gimbal Assembly", batchId: "BAT-2026-CG06",
    supplier: "ShenZhen DroneParts Co.", countryCode: "CN", countryName: "China",
    city: "Shenzhen", lat: 22.54, lng: 114.06, isEU: false,
    documentId: "doc-cg06", documentName: "CG06_Import_Declaration.pdf",
    verificationDate: "2026-03-05", quantity: 150,
  },
  {
    id: "p7", partName: "Telemetry Radio Module", batchId: "BAT-2026-TR07",
    supplier: "RF Solutions Ltd", countryCode: "GB", countryName: "United Kingdom",
    city: "Cambridge", lat: 52.21, lng: 0.12, isEU: false,
    documentId: "doc-tr07", documentName: "TR07_Supplier_Invoice.pdf",
    verificationDate: "2026-02-18", quantity: 250,
  },
  {
    id: "p8", partName: "Airframe Carbon Structure", batchId: "BAT-2026-AF08",
    supplier: "AeroStruct AB", countryCode: "SE", countryName: "Sweden",
    city: "Gothenburg", lat: 57.71, lng: 11.97, isEU: true,
    documentId: "doc-af08", documentName: "AF08_Manufacturing_Cert.pdf",
    verificationDate: "2026-03-22", quantity: 100,
  },
  {
    id: "p9", partName: "Parachute Recovery System", batchId: "BAT-2026-PR09",
    supplier: "SafeFly Oy", countryCode: "FI", countryName: "Finland",
    city: "Helsinki", lat: 60.17, lng: 24.94, isEU: true,
    documentId: "doc-pr09", documentName: "PR09_EU_Type_Approval.pdf",
    verificationDate: "2026-01-30", quantity: 75,
  },
  {
    id: "p10", partName: "Sensor Fusion Board", batchId: "BAT-2026-SF10",
    supplier: "TechSense Inc.", countryCode: "US", countryName: "United States",
    city: "Austin", lat: 30.27, lng: -97.74, isEU: false,
    documentId: "doc-sf10", documentName: "SF10_Commercial_Invoice.pdf",
    verificationDate: "2026-03-10", quantity: 180,
  },
];

export default function EUOriginPage() {
  const c = useWorkspaceColors();
  const [search, setSearch] = useState("");
  const [filterEU, setFilterEU] = useState<"all" | "eu" | "non-eu">("all");
  const [selectedPart, setSelectedPart] = useState<PartOrigin | null>(null);

  const filteredParts = useMemo(() => {
    let result = SAMPLE_PARTS;
    if (filterEU === "eu") result = result.filter((p) => p.isEU);
    if (filterEU === "non-eu") result = result.filter((p) => !p.isEU);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.partName.toLowerCase().includes(q) ||
          p.supplier.toLowerCase().includes(q) ||
          p.countryName.toLowerCase().includes(q) ||
          p.batchId.toLowerCase().includes(q)
      );
    }
    return result;
  }, [search, filterEU]);

  // EU compliance stats
  const totalParts = SAMPLE_PARTS.length;
  const euParts = SAMPLE_PARTS.filter((p) => p.isEU).length;
  const nonEuParts = totalParts - euParts;
  const euPercentage = totalParts > 0 ? Math.round((euParts / totalParts) * 100) : 0;
  const meetsThreshold = euPercentage >= 65;

  // Countries with parts
  const countrySummary = useMemo(() => {
    const map: Record<string, { name: string; count: number; isEU: boolean }> = {};
    for (const p of SAMPLE_PARTS) {
      if (!map[p.countryCode]) {
        map[p.countryCode] = { name: p.countryName, count: 0, isEU: p.isEU };
      }
      map[p.countryCode].count++;
    }
    return Object.entries(map).sort((a, b) => b[1].count - a[1].count);
  }, []);

  function handlePartClick(part: PartOrigin) {
    setSelectedPart(part);
  }

  function exportCSV() {
    const headers = ["Part Name", "Batch ID", "Supplier", "Country", "EU Origin", "Quantity", "Verified", "Document"];
    const rows = SAMPLE_PARTS.map((p) => [
      p.partName, p.batchId, p.supplier, p.countryName,
      p.isEU ? "Yes" : "No", p.quantity, p.verificationDate, p.documentName || "",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "eu-origin-traceability.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <Header
        title="EU Origin Map"
        subtitle="Component origin traceability — EU Drone Regulation (2019/947) compliance"
      >
        <button type="button" onClick={exportCSV} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors`}>
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </button>
      </Header>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-xl ${c.bgLight}`}>
              <Package className={`w-4 h-4 ${c.text}`} />
            </div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Parts</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">{totalParts}</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-emerald-50">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">EU Origin</span>
          </div>
          <div className="text-2xl font-bold text-emerald-600 tabular-nums">{euParts}</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-amber-50">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Non-EU</span>
          </div>
          <div className="text-2xl font-bold text-amber-600 tabular-nums">{nonEuParts}</div>
        </div>

        <div className={`rounded-2xl border p-5 shadow-sm ${meetsThreshold ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-xl ${meetsThreshold ? "bg-emerald-100" : "bg-rose-100"}`}>
              <Globe className={`w-4 h-4 ${meetsThreshold ? "text-emerald-600" : "text-rose-600"}`} />
            </div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">EU Compliance</span>
          </div>
          <div className={`text-2xl font-bold tabular-nums ${meetsThreshold ? "text-emerald-700" : "text-rose-700"}`}>
            {euPercentage}%
          </div>
          <div className={`text-[11px] font-semibold mt-1 ${meetsThreshold ? "text-emerald-600" : "text-rose-600"}`}>
            {meetsThreshold ? "Meets 65% EU threshold" : "Below 65% EU threshold"}
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by part, supplier, country, or batch ID..."
            className={`w-full pl-9 pr-4 py-2.5 rounded-xl border ${c.border} text-sm focus:outline-none focus:ring-2 ${c.ring} bg-white`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {(["all", "eu", "non-eu"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilterEU(f)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                filterEU === f
                  ? f === "eu" ? "bg-emerald-600 text-white" : f === "non-eu" ? "bg-amber-500 text-white" : `${c.bg} text-white`
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {f === "all" ? "All Origins" : f === "eu" ? "EU Only" : "Non-EU Only"}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <EUOriginMap parts={filteredParts} onPartClick={handlePartClick} />

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-violet-50 border border-violet-200">
        <Info className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-violet-900">EU Drone Regulation (2019/947) — Origin Compliance</p>
          <p className="text-xs text-violet-700 mt-1 leading-relaxed">
            Under the mid-2026 EU regulatory mandate, drone components must demonstrate a minimum of 65% EU origin
            for commercial operations within the EU. Each green marker on the map represents an EU-origin verified
            component with linked source documentation. Amber markers indicate non-EU origin parts requiring
            additional import declarations.
          </p>
        </div>
      </div>

      {/* Country breakdown + Parts table side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Country breakdown */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-violet-500" />
            Origin Countries
          </h3>
          <div className="space-y-3">
            {countrySummary.map(([code, info]) => (
              <div key={code} className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${info.isEU ? "bg-emerald-500" : "bg-amber-500"}`} />
                <span className="text-xs font-medium text-slate-700 flex-1">{info.name}</span>
                <span className="text-xs font-bold text-slate-500 tabular-nums">{info.count} part{info.count !== 1 ? "s" : ""}</span>
              </div>
            ))}
          </div>
          {/* EU bar */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">EU Origin</span>
              <span className={`text-sm font-bold ${meetsThreshold ? "text-emerald-600" : "text-rose-600"}`}>{euPercentage}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${meetsThreshold ? "bg-emerald-500" : "bg-rose-500"}`}
                style={{ width: `${euPercentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[10px] text-slate-400">0%</span>
              <span className="text-[10px] text-slate-400 font-semibold">65% threshold</span>
              <span className="text-[10px] text-slate-400">100%</span>
            </div>
          </div>
        </div>

        {/* Parts table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-violet-500" />
              Component Origin Register
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {["Part Name", "Supplier", "Country", "Origin", "Qty", "Batch", "Document"].map((col) => (
                    <th key={col} className="px-4 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredParts.map((p) => (
                  <tr key={p.id} className="border-b border-slate-50 hover:bg-violet-50/30 transition-colors">
                    <td className="px-4 py-3 text-xs font-medium text-slate-800 whitespace-nowrap">{p.partName}</td>
                    <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">{p.supplier}</td>
                    <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">{p.countryName}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        p.isEU ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {p.isEU ? "EU" : "Non-EU"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 tabular-nums">{p.quantity}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 font-mono">{p.batchId}</td>
                    <td className="px-4 py-3">
                      {p.documentName ? (
                        <button
                          type="button"
                          onClick={() => setSelectedPart(p)}
                          className="text-xs text-violet-600 hover:text-violet-700 font-semibold underline bg-transparent border-0 p-0 cursor-pointer"
                        >
                          {p.documentName}
                        </button>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Document detail modal */}
      {selectedPart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setSelectedPart(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Document Details</h3>
              <button type="button" onClick={() => setSelectedPart(null)} className="text-slate-400 hover:text-slate-600">
                &times;
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Part</span>
                <p className="text-sm font-medium text-slate-900">{selectedPart.partName}</p>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Supplier</span>
                <p className="text-sm text-slate-700">{selectedPart.supplier}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Country</span>
                  <p className="text-sm text-slate-700">{selectedPart.countryName}</p>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Origin</span>
                  <p className={`text-sm font-semibold ${selectedPart.isEU ? "text-emerald-600" : "text-amber-600"}`}>
                    {selectedPart.isEU ? "EU Origin" : "Non-EU Origin"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Batch ID</span>
                  <p className="text-sm font-mono text-slate-700">{selectedPart.batchId}</p>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Quantity</span>
                  <p className="text-sm text-slate-700">{selectedPart.quantity}</p>
                </div>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Verification Date</span>
                <p className="text-sm text-slate-700">{selectedPart.verificationDate}</p>
              </div>
              {selectedPart.documentName && (
                <div className="pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Linked Document</span>
                  <div className="flex items-center gap-2 mt-1 p-3 rounded-xl bg-violet-50 border border-violet-200">
                    <FileText className="w-5 h-5 text-violet-500 shrink-0" />
                    <span className="text-sm font-medium text-violet-700">{selectedPart.documentName}</span>
                  </div>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setSelectedPart(null)}
              className="mt-5 w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
