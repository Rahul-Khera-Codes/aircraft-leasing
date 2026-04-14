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

/* ── workspace config ── */
export interface WorkspaceConfig {
  slug: WorkspaceSlug;
  label: string;
  shortLabel: string;
  description: string;
  accent: string;         // tailwind color class stem e.g. "blue"
  accentHex: string;      // for inline styles
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

/* ── context ── */
const WorkspaceContext = createContext<WorkspaceConfig>(WORKSPACES["fixed-wing"]);

export function useWorkspace() {
  return useContext(WorkspaceContext);
}

export { WorkspaceContext };
