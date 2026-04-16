"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Plane, ArrowRight, ChevronLeft } from "lucide-react";
import { WORKSPACES, type WorkspaceSlug } from "@/lib/workspace";

/* ── Helicopter SVG icon — side profile ── */
function HelicopterIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Main rotor */}
      <path d="M2 4h20" />
      <path d="M12 4v4" />
      {/* Fuselage — side profile */}
      <path d="M5 8h12a3 3 0 0 1 3 3v1H5a3 3 0 0 1-3-3v0a1 1 0 0 1 1-1z" />
      {/* Tail boom */}
      <path d="M5 12l-2 4h4" />
      {/* Tail rotor */}
      <path d="M3 14v4" />
      {/* Skids */}
      <path d="M8 12v3" />
      <path d="M15 12v3" />
      <path d="M6 15h12" />
    </svg>
  );
}

/* ── Drone SVG icon ── */
function DroneIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="6" cy="18" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path d="M8.5 8.5L12 12" />
      <path d="M15.5 8.5L12 12" />
      <path d="M8.5 15.5L12 12" />
      <path d="M15.5 15.5L12 12" />
      <rect x="10" y="10" width="4" height="4" rx="1" />
    </svg>
  );
}

const CARD_CONFIG: Record<WorkspaceSlug, {
  icon: React.ReactNode;
  gradient: string;
  border: string;
  hoverBorder: string;
  iconBg: string;
  accentText: string;
  tag: string;
}> = {
  "fixed-wing": {
    icon: <Plane className="w-8 h-8" />,
    gradient: "from-blue-50 to-blue-100/50",
    border: "border-blue-200/60",
    hoverBorder: "hover:border-blue-400",
    iconBg: "bg-blue-600",
    accentText: "text-blue-600",
    tag: "Commercial & Cargo",
  },
  "rotary-wing": {
    icon: <HelicopterIcon className="w-8 h-8" />,
    gradient: "from-emerald-50 to-emerald-100/50",
    border: "border-emerald-200/60",
    hoverBorder: "hover:border-emerald-400",
    iconBg: "bg-emerald-600",
    accentText: "text-emerald-600",
    tag: "Helicopters",
  },
  uncrewed: {
    icon: <DroneIcon className="w-8 h-8" />,
    gradient: "from-violet-50 to-violet-100/50",
    border: "border-violet-200/60",
    hoverBorder: "hover:border-violet-400",
    iconBg: "bg-violet-600",
    accentText: "text-violet-600",
    tag: "Drone & UAV",
  },
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const card = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const } },
};

export default function WorkspaceSelectorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0f5fa] via-white to-[#f8fafb] flex flex-col"
      style={{ fontFamily: "var(--font-geist-sans, 'Manrope', system-ui, sans-serif)" }}
    >
      {/* Top bar — back link left, centred logo */}
      <nav className="w-full px-6 py-5 max-w-[1200px] mx-auto relative flex items-center justify-center">
        <Link href="/" className="absolute left-6 flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors no-underline text-[13px] font-medium">
          <ChevronLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <img
          src="/images/origintraceLogo.png"
          alt="OriginTrace Logo"
          className="h-14 w-auto object-contain"
        />
      </nav>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20 -mt-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h1 className="text-[48px] md:text-[64px] lg:text-[72px] font-extrabold text-[#1a2a3a] tracking-tight mb-4 leading-[1.05]">
            Select Your Workspace
          </h1>
          <p className="text-[15px] text-[#5a6b7d] max-w-[420px] mx-auto leading-relaxed font-medium">
            Choose a sector to access its dashboard, fleet management, and analytics tools.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-[960px]"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {(Object.keys(WORKSPACES) as WorkspaceSlug[]).map((slug) => {
            const ws = WORKSPACES[slug];
            const cfg = CARD_CONFIG[slug];

            return (
              <motion.div key={slug} variants={card}>
                <Link
                  href={`/${slug}/dashboard`}
                  className={`group relative block rounded-2xl border ${cfg.border} ${cfg.hoverBorder} bg-white p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 no-underline`}
                >
                  {/* Tag */}
                  <span className={`inline-block text-[10px] font-bold uppercase tracking-[0.15em] ${cfg.accentText} mb-6`}>
                    {cfg.tag}
                  </span>

                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl ${cfg.iconBg} text-white flex items-center justify-center mb-6 shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                    {cfg.icon}
                  </div>

                  {/* Title */}
                  <h2 className="text-[22px] font-bold text-[#1a2a3a] tracking-tight mb-2">
                    {ws.label}
                  </h2>

                  {/* Description */}
                  <p className="text-[14px] text-[#5a6b7d] leading-[1.7] font-medium mb-8">
                    {ws.description}
                  </p>

                  {/* Enter link */}
                  <div className={`flex items-center gap-2 ${cfg.accentText} font-semibold text-[14px] transition-all group-hover:gap-3`}>
                    Enter Workspace
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>

                  {/* Bottom gradient accent */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl bg-gradient-to-r ${cfg.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Footer — company tagline */}
      <div className="text-center pb-10 px-6">
        <p className="text-[13px] text-slate-400 font-medium max-w-[600px] mx-auto leading-relaxed">
          OriginTrace.AI &mdash; Immutable record layer and AI decision engine for aviation asset risk intelligence.
        </p>
      </div>
    </div>
  );
}
