"use client";

import { useState } from "react";
import { BarChart3, Download } from "lucide-react";

function exportCSV(data: any[], filename: string) {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(h => JSON.stringify(row[h] ?? "")).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

export default function ReportsClient({ projects, transactions }: { projects: any[], transactions: any[] }) {
    const [tab, setTab] = useState<"revenue" | "pending" | "category">("revenue");

    // Monthly Revenue Report
    const monthlyMap: Record<string, number> = {};
    transactions.filter(t => t.type !== "Refund").forEach(t => {
        const key = new Date(t.transaction_date).toLocaleString("default", { month: "long", year: "numeric" });
        monthlyMap[key] = (monthlyMap[key] || 0) + (t.amount || 0);
    });
    const monthlyRevenue = Object.entries(monthlyMap).map(([month, revenue]) => ({ month, revenue: `₹${Number(revenue).toLocaleString("en-IN")}` }));

    // Pending Payments Report
    const pendingProjects = projects.map(p => {
        const paid = (p.transactions || []).filter((t: any) => t.type !== "Refund").reduce((s: number, t: any) => s + (t.amount || 0), 0);
        const refunded = (p.transactions || []).filter((t: any) => t.type === "Refund").reduce((s: number, t: any) => s + (t.amount || 0), 0);
        const balance = (p.final_project_value || 0) - paid + refunded;
        return { project: p.model_name, customer: p.customers?.name || "", status: p.status, project_value: `₹${(p.final_project_value || 0).toLocaleString("en-IN")}`, paid: `₹${paid.toLocaleString("en-IN")}`, balance: `₹${Math.max(0, balance).toLocaleString("en-IN")}` };
    }).filter(p => {
        const b = parseInt(p.balance.replace(/[₹,]/g, ""));
        return b > 0;
    });

    // Category Revenue Report
    const catMap: Record<string, number> = {};
    projects.forEach(p => {
        catMap[p.category] = (catMap[p.category] || 0) + (p.final_project_value || 0);
    });
    const categoryRevenue = Object.entries(catMap).map(([category, total]) => ({ category, total_projects: projects.filter(p => p.category === category).length, total_value: `₹${Number(total).toLocaleString("en-IN")}` }));

    const tabs = [
        { key: "revenue", label: "Monthly Revenue", data: monthlyRevenue },
        { key: "pending", label: "Pending Payments", data: pendingProjects },
        { key: "category", label: "Category Revenue", data: categoryRevenue },
    ] as const;

    const currentTab = tabs.find(t => t.key === tab)!;
    const tableData = currentTab.data;

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-forest uppercase">Reports</h1>
                    <p className="text-slate/60 mt-1">Business analytics & exports</p>
                </div>
                <button
                    onClick={() => exportCSV(tableData as any[], `ssm-${tab}-report.csv`)}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg">
                    <Download size={18} /> Export CSV
                </button>
            </div>

            {/* Tab Switcher */}
            <div className="flex gap-2 p-1.5 bg-white rounded-2xl shadow-sm border border-forest/5 mb-6 w-fit">
                {tabs.map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)}
                        className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${tab === t.key ? "bg-forest text-mint shadow-md" : "text-slate/60 hover:text-forest"}`}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-forest/5 overflow-hidden">
                {tableData.length === 0 ? (
                    <div className="p-16 text-center text-slate/40">
                        <BarChart3 size={40} className="mx-auto mb-3 opacity-30" />
                        <p className="font-bold">No data available for this report</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-forest/5 text-[11px] font-black text-forest/50 uppercase tracking-widest">
                                <tr>
                                    {Object.keys(tableData[0]).map(col => (
                                        <th key={col} className="text-left p-4 pl-6">{col.replace(/_/g, " ")}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-forest/5">
                                {tableData.map((row, i) => (
                                    <tr key={i} className="hover:bg-forest/2 transition-colors">
                                        {Object.values(row).map((val: any, j) => (
                                            <td key={j} className="p-4 pl-6 text-sm text-forest/80 font-medium">{val}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
