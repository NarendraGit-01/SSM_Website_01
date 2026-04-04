"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { TrendingUp, Clock, Briefcase, CheckCircle, Users, AlertCircle } from "lucide-react";

const COLORS = ["#1a3c34", "#d4af37", "#2d6a4f", "#e76f51", "#457b9d"];

const fmt = (n: number) => {
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
    return `₹${n}`;
};

export default function DashboardClient({ stats }: { stats: any }) {
    if (!stats) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-slate/40 gap-3">
                <AlertCircle size={40} />
                <p className="font-bold">Could not load dashboard data. Check your Supabase connection.</p>
            </div>
        );
    }

    const kpis = [
        { label: "Monthly Revenue", value: fmt(stats.totalRevenue), sub: "All time collected", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Pending Amount", value: fmt(stats.pendingAmount), sub: "Outstanding dues", icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50" },
        { label: "Active Projects", value: stats.activeProjects, sub: "In Progress", icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Completed Projects", value: stats.completedProjects, sub: "All time", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Upcoming Deliveries", value: stats.upcomingDeliveries, sub: "Next 7 days", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    ];

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-forest uppercase">Dashboard</h1>
                <p className="text-slate/60 mt-1">Business overview & analytics</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
                {kpis.map(k => (
                    <div key={k.label} className="bg-white rounded-3xl p-6 shadow-sm border border-forest/5 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl ${k.bg} flex items-center justify-center shrink-0`}>
                            <k.icon size={22} className={k.color} />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-forest">{k.value}</p>
                            <p className="text-[11px] text-slate/50 font-semibold uppercase tracking-widest">{k.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Revenue Bar Chart */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-forest/5">
                    <h2 className="font-black text-forest mb-6">Revenue (Last 6 Months)</h2>
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={stats.monthlyRevenue} barSize={28}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#888" }} axisLine={false} tickLine={false} />
                            <YAxis tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} />
                            <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString("en-IN")}`, "Revenue"]} contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.1)" }} />
                            <Bar dataKey="revenue" fill="#1a3c34" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Project Status Pie */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-forest/5">
                    <h2 className="font-black text-forest mb-6">Project Status</h2>
                    {stats.statusDist.length > 0 ? (
                        <ResponsiveContainer width="100%" height={240}>
                            <PieChart>
                                <Pie data={stats.statusDist} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                                    {stats.statusDist.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.1)" }} />
                                <Legend formatter={v => <span style={{ fontSize: "11px", color: "#555" }}>{v}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : <p className="text-slate/40 text-center py-16 text-sm">No project data yet</p>}
                </div>
            </div>

            {/* Category Revenue */}
            {stats.categoryRevenue.length > 0 && (
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-forest/5">
                    <h2 className="font-black text-forest mb-6">Revenue by Category</h2>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={stats.categoryRevenue} layout="vertical" barSize={18}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f0" horizontal={false} />
                            <XAxis type="number" tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} />
                            <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "#555" }} axisLine={false} tickLine={false} width={90} />
                            <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString("en-IN")}`, "Revenue"]} contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.1)" }} />
                            <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                                {stats.categoryRevenue.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
