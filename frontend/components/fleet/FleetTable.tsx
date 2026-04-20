"use client";

import { useState } from "react";
import Link from "next/link";
import type { FleetSummaryRow } from "@/lib/types";
import { useWorkspacePrefix, useWorkspaceColors } from "@/lib/workspace";
import { Plane, FileText, AlertTriangle, Gauge, ArrowRight, Trash2 } from "lucide-react";

interface FleetTableProps {
    data: FleetSummaryRow[];
    groupBy: "aircraft_type" | "engine_type";
}

function getSeverityIndicator(findingCount: number) {
    if (findingCount === 0) return "bg-emerald-50 text-emerald-600";
    if (findingCount <= 2) return "bg-sky-50 text-sky-500";
    if (findingCount <= 5) return "bg-amber-50 text-amber-500";
    return "bg-rose-50 text-rose-500";
}

export default function FleetTable({ data, groupBy }: FleetTableProps) {
    const ws = useWorkspacePrefix();
    const c = useWorkspaceColors();
    const [deleting, setDeleting] = useState<string | null>(null);

    async function handleDelete(caseId: string) {
        if (!confirm(`Are you sure you want to delete case "${caseId}" and all its related records? This cannot be undone.`)) return;
        setDeleting(caseId);
        try {
            const res = await fetch(`/api/cases/${encodeURIComponent(caseId)}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');
            // Remove from local data by triggering page refresh
            window.location.reload();
        } catch (err) {
            alert('Failed to delete case. Please try again.');
        } finally {
            setDeleting(null);
        }
    }

    const groups = data.reduce((acc, row) => {
        const key = row[groupBy] || "Unknown";
        if (!acc[key]) acc[key] = [];
        acc[key].push(row);
        return acc;
    }, {} as Record<string, FleetSummaryRow[]>);

    const groupKeys = Object.keys(groups).sort();

    return (
        <div className="flex flex-col gap-10">
            {groupKeys.map((groupTitle) => (
                <div key={groupTitle} className="space-y-4">
                    <div className={`flex items-center justify-between px-6 py-4 ${c.bg} text-white rounded-2xl shadow-xl ${c.shadow.replace('/20', '/10')}`}>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-semibold uppercase tracking-widest text-blue-100">
                                {groupBy === "aircraft_type" ? "Asset Category" : "Engine Series"}
                            </span>
                            <h4 className="text-[16px] font-semibold tracking-tight">{groupTitle}</h4>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[11px] font-semibold uppercase tracking-widest">
                           {groups[groupTitle].length} Assets
                        </div>
                    </div>
                    
                    <div className={`overflow-hidden rounded-2xl border ${c.borderLight} bg-white`}>
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className={`${c.bgLight}/30 border-b ${c.borderLight}`}>
                                    <th className="px-6 py-4 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Identity</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Registration</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Metrics</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Findings</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Health Score</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {groups[groupTitle].map((row, idx) => (
                                    <tr key={row.case_id} className={`group hover:${c.bgLight}/20 transition-all border-b last:border-0 ${c.borderLight}/50`}>
                                        <td className="px-6 py-5">
                                            <Link href={`${ws}/cases/${row.case_id}`} className={`${c.text} font-semibold font-mono text-[13px] ${c.textHover}`}>
                                                {row.case_id}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className={`p-1.5 rounded-lg ${c.bgLight} ${c.textLight}`}><Plane size={14} /></div>
                                                <span className="text-[14px] font-semibold text-slate-900">{row.registration}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                               <div className="flex items-center gap-1.5">
                                                  <FileText size={12} className="text-slate-300" />
                                                  <span className="text-[12px] font-semibold text-slate-500">{row.doc_count}</span>
                                               </div>
                                               <div className="flex items-center gap-1.5">
                                                  <Gauge size={12} className="text-slate-300" />
                                                  <span className="text-[12px] font-semibold text-slate-500">{row.engine_metric_count}</span>
                                               </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex px-2.5 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-widest ${
                                                row.finding_count === 0 ? "bg-emerald-50 text-emerald-600" :
                                                row.finding_count < 3 ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                                            }`}>
                                                {row.finding_count} Issues
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className={`flex-1 max-w-[80px] h-1.5 ${c.bgLight} rounded-full overflow-hidden`}>
                                                   <div 
                                                     className={`h-full rounded-full ${row.finding_count === 0 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                                                     style={{ width: `${Math.max(10, 100 - row.finding_count * 10)}%` }} 
                                                   />
                                                </div>
                                                <span className="text-[11px] font-semibold text-slate-400">{Math.max(0, 100 - row.finding_count * 10)}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button
                                                type="button"
                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(row.case_id); }}
                                                disabled={deleting === row.case_id}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors mr-2 disabled:opacity-50"
                                                title="Delete case"
                                            >
                                                {deleting === row.case_id ? (
                                                    <div className="w-4 h-4 border-2 border-rose-300 border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <Trash2 size={16} />
                                                )}
                                            </button>
                                            <Link href={`${ws}/cases/${row.case_id}`} className={`inline-flex items-center gap-1 text-[15px] font-bold ${c.text} ${c.textHover} transition-colors`}>
                                                Report <ArrowRight size={16} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
    );
}

