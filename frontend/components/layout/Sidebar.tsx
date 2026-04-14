"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
    ChevronLeft,
    ChevronRight,
    ArrowLeftRight,
} from "lucide-react";
import {
    WORKSPACES,
    workspaceFromPath,
    type WorkspaceSlug,
} from "@/lib/workspace";

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
    const pathname = usePathname();
    const wsSlug: WorkspaceSlug = workspaceFromPath(pathname);
    const ws = WORKSPACES[wsSlug];
    const prefix = `/${wsSlug}`;

    const isActive = (relHref: string) => {
        const full = `${prefix}${relHref}`;
        if (relHref === "/dashboard") return pathname === full;
        return pathname.startsWith(full);
    };

    return (
        <motion.aside
            className="fixed top-0 left-0 bottom-0 bg-[#f8fbff] flex flex-col z-50 overflow-hidden border-r border-[#0f172a]/[0.06] shadow-[1px_0_0_rgba(15,23,42,0.02)]"
            animate={{ width: collapsed ? 72 : 240 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
            {/* Logo */}
            <div className={`flex items-center justify-center ${collapsed ? "min-h-[72px]" : "min-h-[110px]"} px-2 overflow-hidden`}>
                <Link href="/" className="flex items-center justify-center no-underline w-full h-full">
                    <img
                        src="/images/origintraceLogo.png"
                        alt="OriginTrace Logo"
                        className={`${collapsed ? "w-16 h-16" : "w-full h-auto max-h-[80px]"} object-contain scale-[2.2] transition-transform duration-300 hover:scale-[1.5]`}
                    />
                </Link>
            </div>

            {/* Workspace badge */}
            {!collapsed && (
                <div className="px-4 mb-2">
                    <Link
                        href="/workspace"
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100/80 border border-slate-200/60 hover:border-slate-300 transition-all no-underline group"
                    >
                        <div
                            className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-bold"
                            style={{ backgroundColor: ws.accentHex }}
                        >
                            {ws.shortLabel}
                        </div>
                        <span className="text-[12px] font-semibold text-slate-600 flex-1 truncate">{ws.label}</span>
                        <ArrowLeftRight size={12} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
                    </Link>
                </div>
            )}
            {collapsed && (
                <div className="flex justify-center mb-2">
                    <Link
                        href="/workspace"
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-[10px] font-bold no-underline hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: ws.accentHex }}
                        title={`${ws.label} — Switch workspace`}
                    >
                        {ws.shortLabel}
                    </Link>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 px-3 overflow-y-auto modern-scrollbar">
                <div className="space-y-1">
                    {!collapsed && (
                        <span className="block px-4 mb-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Main Menu</span>
                    )}
                    <ul className="list-none m-0 p-0 space-y-1">
                        {ws.mainNav.map((item) => {
                            const active = isActive(item.href);
                            return (
                                <li key={item.label}>
                                    <Link
                                        href={`${prefix}${item.href}`}
                                        className={`group relative flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 ${
                                            active
                                                ? "text-white shadow-lg"
                                                : "text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                                        }`}
                                        style={active ? { backgroundColor: ws.accentHex, boxShadow: `0 10px 15px -3px ${ws.accentHex}33` } : undefined}
                                    >
                                        <item.icon size={19} className={`shrink-0 transition-transform group-hover:scale-110 ${active ? "text-white" : "text-slate-400 group-hover:text-blue-500"}`} />
                                        {!collapsed && (
                                            <motion.span
                                                className="text-[13.5px] font-semibold whitespace-nowrap"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                            >
                                                {item.label}
                                            </motion.span>
                                        )}
                                        {active && !collapsed && (
                                            <motion.div
                                                layoutId="active-indicator"
                                                className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white/60"
                                            />
                                        )}
                                    </Link>
                                </li>
                            );
                        })}

                        {/* Secondary items */}
                        {ws.secondaryNav.map((item) => (
                            <li key={item.label}>
                                <Link
                                    href={`${prefix}${item.href}`}
                                    className={`group relative flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 ${
                                        isActive(item.href)
                                            ? "bg-slate-500/90 text-white"
                                            : "bg-slate-400/60 text-white hover:bg-slate-600/80"
                                    }`}
                                >
                                    <item.icon
                                        size={19}
                                        className={`shrink-0 ${isActive(item.href) ? "text-white" : "text-white/85 group-hover:text-white"}`}
                                    />
                                    {!collapsed && (
                                        <motion.span
                                            className="text-[13px] font-medium whitespace-nowrap text-white"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                    {isActive(item.href) && !collapsed && (
                                        <motion.div
                                            layoutId={`active-indicator-${item.label}`}
                                            className="absolute right-3 w-1.5 h-1.5 rounded-full bg-slate-400"
                                        />
                                    )}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </nav>

            {/* Toggle footer */}
            <div className={`mt-auto p-4 border-t border-[#0f172a]/[0.04] flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
                {!collapsed && (
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-2">Collapse Sidebar</span>
                )}
                <button
                    className={`flex items-center justify-center rounded-xl border border-slate-100 hover:bg-blue-50 transition-all ${
                        collapsed ? "w-10 h-10 text-slate-400 hover:text-blue-600" : "w-8 h-8 text-slate-400 hover:text-blue-600"
                    }`}
                    onClick={onToggle}
                    title={collapsed ? "Expand" : "Collapse"}
                >
                    {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={16} />}
                </button>
            </div>
        </motion.aside>
    );
}
