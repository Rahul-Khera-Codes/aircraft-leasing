"use client";

import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* ── Types ── */
export interface PartOrigin {
  id: string;
  partName: string;
  batchId: string;
  supplier: string;
  countryCode: string;   // ISO 3166-1 alpha-2
  countryName: string;
  city?: string;
  lat: number;
  lng: number;
  isEU: boolean;
  documentId?: string;
  documentName?: string;
  verificationDate: string;
  quantity: number;
}

/* ── EU member state coordinates (capitals) for reference ── */
export const EU_COUNTRIES: Record<string, { name: string; lat: number; lng: number }> = {
  AT: { name: "Austria", lat: 48.21, lng: 16.37 },
  BE: { name: "Belgium", lat: 50.85, lng: 4.35 },
  BG: { name: "Bulgaria", lat: 42.70, lng: 23.32 },
  HR: { name: "Croatia", lat: 45.81, lng: 15.98 },
  CY: { name: "Cyprus", lat: 35.17, lng: 33.36 },
  CZ: { name: "Czechia", lat: 50.08, lng: 14.43 },
  DK: { name: "Denmark", lat: 55.68, lng: 12.57 },
  EE: { name: "Estonia", lat: 59.44, lng: 24.75 },
  FI: { name: "Finland", lat: 60.17, lng: 24.94 },
  FR: { name: "France", lat: 48.86, lng: 2.35 },
  DE: { name: "Germany", lat: 52.52, lng: 13.41 },
  GR: { name: "Greece", lat: 37.98, lng: 23.73 },
  HU: { name: "Hungary", lat: 47.50, lng: 19.04 },
  IE: { name: "Ireland", lat: 53.35, lng: -6.26 },
  IT: { name: "Italy", lat: 41.90, lng: 12.50 },
  LV: { name: "Latvia", lat: 56.95, lng: 24.11 },
  LT: { name: "Lithuania", lat: 54.69, lng: 25.28 },
  LU: { name: "Luxembourg", lat: 49.61, lng: 6.13 },
  MT: { name: "Malta", lat: 35.90, lng: 14.51 },
  NL: { name: "Netherlands", lat: 52.37, lng: 4.90 },
  PL: { name: "Poland", lat: 52.23, lng: 21.01 },
  PT: { name: "Portugal", lat: 38.72, lng: -9.14 },
  RO: { name: "Romania", lat: 44.43, lng: 26.10 },
  SK: { name: "Slovakia", lat: 48.15, lng: 17.11 },
  SI: { name: "Slovenia", lat: 46.05, lng: 14.51 },
  ES: { name: "Spain", lat: 40.42, lng: -3.70 },
  SE: { name: "Sweden", lat: 59.33, lng: 18.07 },
};

/* ── Marker icons ── */
const euIcon = L.divIcon({
  className: "eu-origin-marker",
  html: `<div style="width:32px;height:32px;border-radius:50%;background:#059669;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const nonEuIcon = L.divIcon({
  className: "non-eu-origin-marker",
  html: `<div style="width:32px;height:32px;border-radius:50%;background:#f59e0b;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

/* ── Fit to EU bounds ── */
function FitEU() {
  const map = useMap();
  useMemo(() => {
    // Fit to EU region: from Portugal/Ireland to Finland/Cyprus
    map.fitBounds(
      [[34, -12], [62, 35]],
      { padding: [30, 30], maxZoom: 5 }
    );
  }, [map]);
  return null;
}

/* ── Component ── */
interface EUOriginMapProps {
  parts: PartOrigin[];
  onPartClick?: (part: PartOrigin) => void;
}

export default function EUOriginMap({ parts, onPartClick }: EUOriginMapProps) {
  // Group parts by location (some suppliers may be at same coordinates)
  const markers = useMemo(() => {
    const grouped: Record<string, PartOrigin[]> = {};
    for (const p of parts) {
      const key = `${p.lat.toFixed(2)}_${p.lng.toFixed(2)}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(p);
    }
    return Object.values(grouped);
  }, [parts]);

  return (
    <div className="relative w-full h-[560px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
      <MapContainer
        center={[50, 10]}
        zoom={4}
        className="w-full h-full z-0"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitEU />

        {markers.map((group, i) => {
          const first = group[0];
          const allEU = group.every((p) => p.isEU);
          return (
            <Marker
              key={`origin-${i}`}
              position={[first.lat, first.lng]}
              icon={allEU ? euIcon : nonEuIcon}
              eventHandlers={onPartClick ? {
                click: () => onPartClick(first),
              } : undefined}
            >
              <Popup>
                <div className="min-w-[240px] max-w-[300px] text-left">
                  <div className="font-bold text-slate-900 text-sm mb-1">
                    {first.city ? `${first.city}, ` : ""}{first.countryName}
                  </div>
                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 ${
                    allEU ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {allEU ? "EU Origin" : "Non-EU Origin"}
                  </div>
                  <div className="space-y-2 mt-2">
                    {group.map((p) => (
                      <div key={p.id} className="border-t border-slate-100 pt-2">
                        <div className="text-xs font-semibold text-slate-800">{p.partName}</div>
                        <div className="text-[11px] text-slate-500">
                          {p.supplier} &middot; Qty: {p.quantity}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Batch: {p.batchId} &middot; Verified: {p.verificationDate}
                        </div>
                        {p.documentName && (
                          <button
                            type="button"
                            onClick={() => onPartClick?.(p)}
                            className="text-[11px] text-violet-600 hover:text-violet-700 font-semibold mt-1 underline cursor-pointer bg-transparent border-0 p-0"
                          >
                            View: {p.documentName}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
