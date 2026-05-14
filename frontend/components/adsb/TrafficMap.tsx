"use client";

import { useEffect, useMemo } from "react";
import type { OpenSkyStateVector } from "@/lib/opensky";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const createPlaneIcon = (onGround: boolean) =>
  L.divIcon({
    className: "adsb-marker",
    html: `<div class="adsb-marker-inner ${onGround ? "on-ground" : "in-flight"}" title="Aircraft"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2l-1.8-8.2L16 11l8.2 1.8z"/></svg></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

const createHelicopterIcon = (onGround: boolean) =>
  L.divIcon({
    className: "adsb-marker",
    html: `<div class="adsb-marker-inner ${onGround ? "on-ground" : "in-flight"}" title="Helicopter" style="color:${onGround ? "#059669" : "#2563eb"}">
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 64 64" fill="currentColor">
        <!-- Main rotor -->
        <rect x="4" y="14" width="56" height="4" rx="2"/>
        <!-- Rotor hub -->
        <circle cx="32" cy="16" r="4"/>
        <!-- Fuselage body -->
        <ellipse cx="30" cy="30" rx="14" ry="8"/>
        <!-- Cockpit bubble -->
        <ellipse cx="42" cy="29" rx="7" ry="6" opacity="0.7"/>
        <!-- Tail boom -->
        <rect x="6" y="28" width="20" height="4" rx="2"/>
        <!-- Tail rotor -->
        <rect x="4" y="22" width="4" height="16" rx="2"/>
        <!-- Skid left -->
        <rect x="18" y="40" width="24" height="3" rx="1.5"/>
        <!-- Skid right -->
        <rect x="18" y="46" width="24" height="3" rx="1.5"/>
        <!-- Struts -->
        <rect x="23" y="37" width="3" height="10" rx="1"/>
        <rect x="36" y="37" width="3" height="10" rx="1"/>
      </svg>
    </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

function FitBounds({ states }: { states: OpenSkyStateVector[] }) {
  const map = useMap();
  const positions = useMemo(() => {
    const valid = states.filter(
      (s) => s.latitude != null && s.longitude != null
    ) as (OpenSkyStateVector & { latitude: number; longitude: number })[];
    return valid.map((s) => [s.latitude, s.longitude] as [number, number]);
  }, [states]);

  useEffect(() => {
    if (positions.length === 0) return;
    if (positions.length === 1) {
      map.setView(positions[0], 10);
      return;
    }
    map.fitBounds(positions as [number, number][], {
      padding: [40, 40],
      maxZoom: 10,
    });
  }, [map, positions]);

  return null;
}

function formatAlt(m: number | null): string {
  if (m == null) return "—";
  if (m >= 1000) return `${(m / 1000).toFixed(1)} km`;
  return `${Math.round(m)} m`;
}

function formatSpeed(ms: number | null): string {
  if (ms == null) return "—";
  return `${Math.round(ms * 1.94384)} kt`;
}

/** ICAO type designators for rotorcraft */
const HELICOPTER_TYPES = new Set([
  "A109","AW13","AW16","AW17","AW18",
  "AS32","AS3B","AS35","AS50","AS55","AS65",
  "B06","B06T","B07","B07J","B105","B212","B214","B230","B412","B427","B429","B430",
  "BK17","BO10",
  "EC20","EC25","EC30","EC35","EC45","EC55",
  "H135","H145","H155","H160","H175","H215","H225",
  "K226","K407","K412","K44","K47","K76",
  "MD60","MD52",
  "NH90",
  "R22","R44","R66",
  "S278","S300","S333","S52","S55","S58T","S61","S61N","S61R","S65C","S76","S92",
  "UH1","UH60","VH60",
]);

function isHelicopterState(s: OpenSkyStateVector): boolean {
  if (s.category === "A7") return true;
  if (s.aircraftType && HELICOPTER_TYPES.has(s.aircraftType.toUpperCase())) return true;
  return false;
}

interface TrafficMapProps {
  states: OpenSkyStateVector[];
  fitBoundsOnUpdate?: boolean;
  helicopterMode?: boolean;
}

export default function TrafficMap({
  states,
  fitBoundsOnUpdate = true,
  helicopterMode = false,
}: TrafficMapProps) {
  const withPosition = useMemo(
    () =>
      states.filter(
        (s) =>
          s.latitude != null &&
          s.longitude != null &&
          Number.isFinite(s.latitude) &&
          Number.isFinite(s.longitude)
      ),
    [states]
  );

  const defaultCenter: [number, number] =
    withPosition.length > 0
      ? [withPosition[0].latitude!, withPosition[0].longitude!]
      : [39.5, -98.5]; // US center
  const defaultZoom = withPosition.length <= 1 ? 6 : 4;

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        className="w-full h-full z-0"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {fitBoundsOnUpdate && withPosition.length > 0 && (
          <FitBounds states={withPosition} />
        )}
        {withPosition.map((s) => (
          <Marker
            key={`${s.icao24}-${s.last_contact}`}
            position={[s.latitude!, s.longitude!]}
            icon={(helicopterMode || isHelicopterState(s))
              ? createHelicopterIcon(s.on_ground)
              : createPlaneIcon(s.on_ground)}
          >
            <Popup>
              <div className="min-w-[200px] text-left">
                <div className="font-semibold text-slate-900 font-mono text-sm">
                  {s.registration || (s.callsign ?? "").trim() || s.icao24}
                </div>
                {s.aircraftType && (
                  <div className="text-xs font-bold text-slate-600 mt-0.5">{s.aircraftType}</div>
                )}
                <div className="text-xs text-slate-500 mt-1">ICAO24: {s.icao24}</div>
                <div className="text-xs text-slate-600 mt-2 space-y-1">
                  <div>{s.origin_country || "—"}</div>
                  <div>Alt: {formatAlt(s.baro_altitude ?? s.geo_altitude)}</div>
                  <div>Speed: {formatSpeed(s.velocity)}</div>
                  <div>
                    {s.on_ground ? (
                      <span className="text-emerald-600">On ground</span>
                    ) : (
                      <span className="text-blue-600">In flight</span>
                    )}
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
