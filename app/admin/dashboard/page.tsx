"use client";

import { motion } from "framer-motion";
import {
    ShoppingBag, Image as ImageIcon, Folders, Settings,
    ArrowRight, ExternalLink, MessageSquare, Users,
    Phone, FileText, LayoutDashboard
} from "lucide-react";
import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase";
import ConfigWarning from "@/components/admin/ConfigWarning";

const CMS_SECTIONS = [
    {
        group: "Homepage Content",
        items: [
            { title: "Hero Slides", sub: "Edit carousel images, headings & subtitles", href: "/admin/hero", icon: ImageIcon, color: "text-sky-600", bg: "bg-sky-50" },
        ],
    },
    {
        group: "Catalog & Gallery",
        items: [
            { title: "Products Catalog", sub: "Add, edit, delete products with images", href: "/admin/products", icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
            { title: "Service Gallery", sub: "Manage project photos by category", href: "/admin/services", icon: Folders, color: "text-emerald-600", bg: "bg-emerald-50" },
        ],
    },
    {
        group: "Site Information",
        items: [
            { title: "About Page", sub: "Edit company story, mission & vision", href: "/admin/about", icon: Users, color: "text-amber-600", bg: "bg-amber-50" },
            { title: "Contact Info", sub: "Update phone, email, address & social links", href: "/admin/contact", icon: Phone, color: "text-rose-600", bg: "bg-rose-50" },
            { title: "Site Settings", sub: "Edit business name, tagline & hero text", href: "/admin/content", icon: Settings, color: "text-slate-600", bg: "bg-slate-50" },
        ],
    },
];

export default function AdminDashboardPage() {
    const isConfigured = isSupabaseConfigured();

    return (
        <div className="flex flex-col min-h-screen">
            <ConfigWarning isConfigured={isConfigured} />
            <div className="max-w-6xl mx-auto w-full p-6 md:p-12 pb-24">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-forest uppercase">Dashboard</h1>
                        <p className="text-slate/60 font-medium">Welcome back. Select a section to start editing.</p>
                    </div>
                    <Link
                        href="/"
                        target="_blank"
                        className="bg-white border-2 border-forest/10 text-forest px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-forest hover:text-mint transition-all"
                    >
                        View Live Site <ExternalLink size={16} />
                    </Link>
                </header>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-14">
                    {[
                        { label: "Products", value: "5", icon: ShoppingBag, color: "bg-blue-500" },
                        { label: "Gallery Items", value: "4", icon: ImageIcon, color: "bg-emerald-500" },
                        { label: "Hero Slides", value: "4", icon: FileText, color: "bg-sky-500" },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-white rounded-[2rem] p-6 shadow-sm border border-forest/5 flex items-center gap-4">
                            <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-white`}>
                                <stat.icon size={22} />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-forest">{stat.value}</p>
                                <p className="text-[10px] font-black text-slate/40 uppercase tracking-widest">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CMS Sections */}
                <div className="flex flex-col gap-12">
                    {CMS_SECTIONS.map((section) => (
                        <div key={section.group}>
                            <h2 className="text-xs font-black text-slate/30 uppercase tracking-[0.25em] mb-5">{section.group}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {section.items.map((item) => (
                                    <motion.div key={item.href} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                                        <Link
                                            href={item.href}
                                            className="group flex flex-col bg-white rounded-[2rem] p-8 shadow-sm border border-forest/5 hover:border-forest/20 transition-all h-full"
                                        >
                                            <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center mb-6`}>
                                                <item.icon size={22} />
                                            </div>
                                            <h3 className="font-black text-forest text-lg mb-1 group-hover:underline underline-offset-4">{item.title}</h3>
                                            <p className="text-xs text-slate/50 font-medium flex-1">{item.sub}</p>
                                            <div className="flex items-center gap-2 mt-6 text-forest/30 group-hover:text-forest transition-all">
                                                <span className="text-xs font-bold">Open Editor</span>
                                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
