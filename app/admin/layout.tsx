"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
    LayoutDashboard, ShoppingBag, Image as ImageIcon, FileText,
    MessageSquare, Users, Settings, LogOut, Hammer, Menu, X,
    Home, Phone, Briefcase, UserCheck, CreditCard, BarChart3,
    ChevronRight, PlusCircle, PanelLeftClose, PanelLeftOpen
} from "lucide-react";

const NAV = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { label: "ERP MODULES", divider: true },
    { href: "/admin/erp/new", label: "New Entry", icon: PlusCircle },
    { href: "/admin/erp/customers", label: "Customers", icon: Users },
    { href: "/admin/erp/projects", label: "Projects", icon: Briefcase },
    { href: "/admin/erp/payments", label: "Payments", icon: CreditCard },
    { href: "/admin/erp/workers", label: "Workers", icon: UserCheck },
    { href: "/admin/erp/reports", label: "Reports", icon: BarChart3 },
    { label: "WEBSITE CONTENT", divider: true },
    { href: "/admin/hero", label: "Hero Slides", icon: ImageIcon },
    { href: "/admin/services", label: "Service Gallery", icon: FileText },
    { href: "/admin/products", label: "Products", icon: ShoppingBag },
    { label: "SITE INFO", divider: true },
    { href: "/admin/contact", label: "Contact Info", icon: Phone },
    { href: "/admin/content", label: "Site Settings", icon: Settings },
];

const COLLAPSED_WIDTH = "w-[68px]";
const EXPANDED_WIDTH = "w-72";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);   // mobile drawer
    const [collapsed, setCollapsed] = useState(false);        // desktop collapse

    // Persist collapsed state
    useEffect(() => {
        const saved = localStorage.getItem("admin-sidebar-collapsed");
        if (saved === "true") setCollapsed(true);
    }, []);

    const toggleCollapse = () => {
        setCollapsed(prev => {
            localStorage.setItem("admin-sidebar-collapsed", String(!prev));
            return !prev;
        });
    };

    if (pathname === "/admin/login") return <>{children}</>;

    const handleLogout = async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        router.push("/admin/login");
    };

    const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

    const sidebarWidth = collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

    return (
        <div className="flex min-h-screen bg-[#f0f4f0]">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-forest/40 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ── Sidebar ── */}
            <aside
                className={`fixed top-0 left-0 h-full bg-forest text-mint flex flex-col z-50 shadow-2xl
                    transition-all duration-300 ease-in-out
                    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
                    ${sidebarWidth}`}
            >
                {/* Brand Header */}
                <div className={`flex items-center border-b border-white/10 h-[72px] px-4 gap-3 ${collapsed ? "justify-center" : ""}`}>
                    <div className="bg-mint text-forest p-2.5 rounded-xl shrink-0">
                        <Hammer size={20} />
                    </div>

                    {/* Labels — hidden when collapsed */}
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="font-black text-base text-white uppercase tracking-wide truncate">SSM Admin</p>
                            <p className="text-[9px] font-bold text-mint/40 tracking-widest uppercase">Business Manager</p>
                        </div>
                    )}

                    {/* Mobile close */}
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-mint/60 hover:text-white ml-auto shrink-0">
                        <X size={18} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-3 px-2 overflow-y-auto flex flex-col gap-0.5 overflow-x-hidden">
                    {NAV.map((item, i) => {
                        if ((item as any).divider) {
                            if (collapsed) {
                                // Divider in collapsed mode: thin horizontal line
                                return <div key={i} className="my-2 mx-3 border-t border-white/10" />;
                            }
                            return (
                                <p key={i} className="text-[9px] font-black tracking-[0.25em] text-mint/30 uppercase mt-5 mb-1.5 ml-3 truncate">
                                    {item.label}
                                </p>
                            );
                        }
                        const active = isActive(item.href!);
                        return (
                            <Link
                                key={item.href}
                                href={item.href as string}
                                onClick={() => setSidebarOpen(false)}
                                title={collapsed ? item.label : undefined}
                                className={`flex items-center gap-3 rounded-xl font-semibold text-sm transition-all group
                                    ${collapsed ? "justify-center px-2 py-3" : "px-4 py-2.5"}
                                    ${active
                                        ? "bg-mint text-forest shadow-lg"
                                        : "text-mint/60 hover:text-white hover:bg-white/10"
                                    }`}
                            >
                                {item.icon && (
                                    <item.icon size={18} className="shrink-0" />
                                )}
                                {!collapsed && (
                                    <span className="flex-1 truncate">{item.label}</span>
                                )}
                                {!collapsed && active && <ChevronRight size={14} className="shrink-0" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Actions */}
                <div className={`border-t border-white/10 flex flex-col gap-1 py-3 px-2`}>
                    <Link
                        href="/"
                        target="_blank"
                        title={collapsed ? "View Website" : undefined}
                        className={`flex items-center gap-3 rounded-xl text-mint/50 hover:text-white hover:bg-white/10 font-semibold text-sm transition-all
                            ${collapsed ? "justify-center px-2 py-3" : "px-4 py-2.5"}`}
                    >
                        <Home size={17} className="shrink-0" />
                        {!collapsed && <span>View Website</span>}
                    </Link>
                    <button
                        onClick={handleLogout}
                        title={collapsed ? "Logout" : undefined}
                        className={`flex items-center gap-3 rounded-xl text-rose-400 hover:text-white hover:bg-rose-500/20 font-semibold text-sm transition-all
                            ${collapsed ? "justify-center px-2 py-3" : "px-4 py-2.5"}`}
                    >
                        <LogOut size={17} className="shrink-0" />
                        {!collapsed && <span>Logout</span>}
                    </button>

                    {/* Desktop Collapse Toggle */}
                    <button
                        onClick={toggleCollapse}
                        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                        className={`hidden lg:flex items-center gap-3 rounded-xl text-mint/40 hover:text-white hover:bg-white/10 font-semibold text-sm transition-all mt-1
                            ${collapsed ? "justify-center px-2 py-3" : "px-4 py-2.5"}`}
                    >
                        {collapsed
                            ? <PanelLeftOpen size={17} className="shrink-0" />
                            : <PanelLeftClose size={17} className="shrink-0" />
                        }
                        {!collapsed && <span className="text-mint/40">Collapse</span>}
                    </button>
                </div>
            </aside>

            {/* ── Main Content ── */}
            <div className={`flex-1 min-h-screen transition-all duration-300 ease-in-out
                ${collapsed ? "lg:ml-[68px]" : "lg:ml-72"}`}>
                {/* Mobile Top Bar */}
                <div className="lg:hidden bg-forest text-white px-6 py-4 flex items-center gap-4 sticky top-0 z-30 shadow-lg">
                    <button onClick={() => setSidebarOpen(true)}>
                        <Menu size={24} />
                    </button>
                    <span className="font-black uppercase tracking-wider">SSM Admin</span>
                </div>
                <div className="p-6 lg:p-8">
                    {children}
                </div>
            </div>
        </div>
    );
}
