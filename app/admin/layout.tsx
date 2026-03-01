"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import {
    LayoutDashboard, ShoppingBag, Image as ImageIcon, FileText,
    MessageSquare, Users, Settings, LogOut, Hammer, Menu, X,
    Home, Phone
} from "lucide-react";

const NAV = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { label: "CONTENT", divider: true },
    { href: "/admin/hero", label: "Hero Slides", icon: ImageIcon },
    { href: "/admin/services", label: "Service Gallery", icon: FileText },
    { href: "/admin/products", label: "Products", icon: ShoppingBag },
    { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquare },
    { label: "SITE INFO", divider: true },
    { href: "/admin/about", label: "About Page", icon: Users },
    { href: "/admin/contact", label: "Contact Info", icon: Phone },
    { href: "/admin/content", label: "Site Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    if (pathname === "/admin/login") return <>{children}</>;

    const handleLogout = async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        router.push("/admin/login");
    };

    return (
        <div className="flex min-h-screen bg-mint/10" style={{ paddingTop: 0 }}>
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-forest/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 h-full w-72 bg-forest text-mint flex flex-col z-50 shadow-2xl transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
                {/* Brand */}
                <div className="flex items-center gap-4 p-8 border-b border-white/10">
                    <div className="bg-mint text-forest p-3 rounded-2xl">
                        <Hammer size={22} />
                    </div>
                    <div>
                        <p className="font-black text-lg text-white uppercase">SSM Admin</p>
                        <p className="text-[10px] font-bold text-mint/40 tracking-widest uppercase">Content Manager</p>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-mint/60 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-6 overflow-y-auto flex flex-col gap-1">
                    {NAV.map((item, i) => {
                        if ((item as any).divider) {
                            return <p key={i} className="text-[9px] font-black tracking-[0.25em] text-mint/30 uppercase mt-6 mb-2 ml-2">{item.label}</p>;
                        }
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href as string}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${isActive
                                    ? "bg-mint text-forest"
                                    : "text-mint/60 hover:text-white hover:bg-white/10"
                                    }`}
                            >
                                {item.icon && <item.icon size={18} />}
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Actions */}
                <div className="p-6 border-t border-white/10 flex flex-col gap-2">
                    <Link href="/" target="_blank" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-mint/50 hover:text-white hover:bg-white/10 font-bold transition-all">
                        <Home size={18} />
                        View Website
                    </Link>
                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-2xl text-rose-400 hover:text-white hover:bg-rose-500/20 font-bold transition-all">
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 lg:ml-72 min-h-screen">
                {/* Mobile Top Bar */}
                <div className="lg:hidden bg-forest text-white px-6 py-4 flex items-center gap-4 sticky top-0 z-30">
                    <button onClick={() => setSidebarOpen(true)}>
                        <Menu size={24} />
                    </button>
                    <span className="font-black uppercase tracking-wider">SSM Admin</span>
                </div>
                <div className="p-6 lg:p-10">
                    {children}
                </div>
            </div>
        </div>
    );
}
