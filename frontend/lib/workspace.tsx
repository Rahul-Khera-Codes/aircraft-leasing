"use client";

import { createContext, useContext } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Plane,
  Gauge,
  ShieldCheck,
  Radio,
  Plug,
  Box,
  type LucideIcon,
} from "lucide-react";

/* ── workspace slugs ── */
export const WORKSPACE_SLUGS = ["fixed-wing", "rotary-wing", "uncrewed"] as const;
export type WorkspaceSlug = (typeof WORKSPACE_SLUGS)[number];

export function isWorkspaceSlug(v: string): v is WorkspaceSlug {
  return (WORKSPACE_SLUGS as readonly string[]).includes(v);
}

/* ── nav item type ── */
export interface NavItem {
  href: string;      // relative path inside workspace, e.g. "/dashboard"
  icon: LucideIcon;
  label: string;
  secondary?: boolean;
}

/* ── workspace Tailwind colour classes ── */
export interface WorkspaceColors {
  bg: string;           // e.g. "bg-blue-600"
  bgHover: string;      // e.g. "hover:bg-blue-700"
  bgLight: string;      // e.g. "bg-blue-50"
  bgLight2: string;     // e.g. "bg-blue-100"
  text: string;         // e.g. "text-blue-600"
  textLight: string;    // e.g. "text-blue-400"
  textHover: string;    // e.g. "hover:text-blue-600"
  border: string;       // e.g. "border-blue-100"
  borderLight: string;  // e.g. "border-blue-50"
  ring: string;         // e.g. "focus:ring-blue-600/5"
  hoverBg: string;      // e.g. "hover:bg-blue-50"
  shadow: string;       // e.g. "shadow-blue-600/20"
}

const COLOR_MAP: Record<string, WorkspaceColors> = {
  blue: {
    bg: "bg-blue-600", bgHover: "hover:bg-blue-700", bgLight: "bg-blue-50", bgLight2: "bg-blue-100",
    text: "text-blue-600", textLight: "text-blue-400", textHover: "hover:text-blue-600",
    border: "border-blue-100", borderLight: "border-blue-50",
    ring: "focus:ring-blue-600/5", hoverBg: "hover:bg-blue-50", shadow: "shadow-blue-600/20",
  },
  emerald: {
    bg: "bg-emerald-600", bgHover: "hover:bg-emerald-700", bgLight: "bg-emerald-50", bgLight2: "bg-emerald-100",
    text: "text-emerald-600", textLight: "text-emerald-400", textHover: "hover:text-emerald-600",
    border: "border-emerald-100", borderLight: "border-emerald-50",
    ring: "focus:ring-emerald-600/5", hoverBg: "hover:bg-emerald-50", shadow: "shadow-emerald-600/20",
  },
  violet: {
    bg: "bg-violet-600", bgHover: "hover:bg-violet-700", bgLight: "bg-violet-50", bgLight2: "bg-violet-100",
    text: "text-violet-600", textLight: "text-violet-400", textHover: "hover:text-violet-600",
    border: "border-violet-100", borderLight: "border-violet-50",
    ring: "focus:ring-violet-600/5", hoverBg: "hover:bg-violet-50", shadow: "shadow-violet-600/20",
  },
};

/* ── workspace config ── */
export interface WorkspaceConfig {
  slug: WorkspaceSlug;
  label: string;
  shortLabel: string;
  description: string;
  accent: string;         // tailwind color class stem e.g. "blue"
  accentHex: string;      // for inline styles
  colors: WorkspaceColors;
  mainNav: NavItem[];
  secondaryNav: NavItem[];
}

const SHARED_SECONDARY: NavItem[] = [
  { href: "/integrations", icon: Plug, label: "Integrations", secondary: true },
  { href: "/adsb", icon: Radio, label: "Live Traffic", secondary: true },
];

export const WORKSPACES: Record<WorkspaceSlug, WorkspaceConfig> = {
  "fixed-wing": {
    slug: "fixed-wing",
    label: "Fixed Wing",
    shortLabel: "FW",
    description: "Commercial & cargo aircraft — A320, 737, 777 and more",
    accent: "blue",
    accentHex: "#2563eb",
    colors: COLOR_MAP.blue,
    mainNav: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/fleet", icon: Plane, label: "Fleet" },
      { href: "/engine-health", icon: Gauge, label: "Engines" },
      { href: "/llp", icon: ShieldCheck, label: "Life Limited Parts" },
      { href: "/aircraft", icon: Plane, label: "Aircraft" },
    ],
    secondaryNav: SHARED_SECONDARY,
  },
  "rotary-wing": {
    slug: "rotary-wing",
    label: "Rotary Wing",
    shortLabel: "RW",
    description: "Helicopters — AW139, AW169, H145, H175 and more",
    accent: "emerald",
    accentHex: "#059669",
    colors: COLOR_MAP.emerald,
    mainNav: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/fleet", icon: Plane, label: "Fleet" },
      { href: "/engine-health", icon: Gauge, label: "Engines" },
      { href: "/llp", icon: ShieldCheck, label: "Life Limited Parts" },
      { href: "/aircraft", icon: Plane, label: "Aircraft" },
    ],
    secondaryNav: SHARED_SECONDARY,
  },
  uncrewed: {
    slug: "uncrewed",
    label: "Uncrewed Systems",
    shortLabel: "UAS",
    description: "Drones & UAVs — component traceability and compliance",
    accent: "violet",
    accentHex: "#7c3aed",
    colors: COLOR_MAP.violet,
    mainNav: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/drone-compliance", icon: Box, label: "Drone Trace" },
    ],
    secondaryNav: [
      { href: "/integrations", icon: Plug, label: "Integrations", secondary: true },
    ],
  },
};

/* ── extract workspace slug from pathname ── */
export function workspaceFromPath(pathname: string): WorkspaceSlug {
  const seg = pathname.split("/")[1]; // e.g. "/fixed-wing/dashboard" → "fixed-wing"
  return isWorkspaceSlug(seg) ? seg : "fixed-wing";
}

/** Returns the workspace URL prefix, e.g. "/fixed-wing" */
export function useWorkspacePrefix(): string {
  const pathname = usePathname();
  return `/${workspaceFromPath(pathname)}`;
}

/** Returns the full workspace config for the current route */
export function useWorkspaceConfig(): WorkspaceConfig {
  const pathname = usePathname();
  return WORKSPACES[workspaceFromPath(pathname)];
}

/** Returns workspace Tailwind colour classes for the current route */
export function useWorkspaceColors(): WorkspaceColors {
  return useWorkspaceConfig().colors;
}

/* ── context ── */
const WorkspaceContext = createContext<WorkspaceConfig>(WORKSPACES["fixed-wing"]);

export function useWorkspace() {
  return useContext(WorkspaceContext);
}

export { WorkspaceContext };
