"use client";

import { motion } from "framer-motion";
import { ShoppingBag, Image as ImageIcon, Settings, ArrowRight, ExternalLink, Phone, Users, Briefcase, CreditCard, BarChart3, PlusCircle, UserCheck } from "lucide-react";
import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase";
import ConfigWarning from "@/components/admin/ConfigWarning";

const ERP_SECTIONS = [
    {
        group: "ERP Modules",
        items: [
            { title: "New Entry", sub: "Register customer & create a new project", href: "/admin/erp/new", icon: PlusCircle, color: "text-forest", bg: "bg-mint/40" },
            { title: "Dashboard & Analytics", sub: "Revenue, projects, and business overview", href: "/admin/erp/dashboard", icon: BarChart3, color: "text-purple-600", bg: "bg-purple-50" },
            { title: "Customers", sub: "Customer profiles and outstanding dues", href: "/admin/erp/customers", icon: Users, color: "text-sky-600", bg: "bg-sky-50" },
            { title: "Projects", sub: "Orders, timelines, and status tracking", href: "/admin/erp/projects", icon: Briefcase, color: "text-amber-600", bg: "bg-amber-50" },
            { title: "Payments", sub: "Payment logs, advances, and refunds", href: "/admin/erp/payments", icon: CreditCard, color: "text-emerald-600", bg: "bg-emerald-50" },
            { title: "Workers", sub: "Staff management and task assignment", href: "/admin/erp/workers", icon: UserCheck, color: "text-rose-600", bg: "bg-rose-50" },
            { title: "Reports", sub: "Monthly revenue, pending, and CSV exports", href: "/admin/erp/reports", icon: BarChart3, color: "text-indigo-600", bg: "bg-indigo-50" },
        ],
    },
    {
        group: "Website Content",
        items: [
            { title: "Hero Slides", sub: "Edit carousel images and headings", href: "/admin/hero", icon: ImageIcon, color: "text-sky-600", bg: "bg-sky-50" },
            { title: "Products Catalog", sub: "Add, edit, delete products with images", href: "/admin/products", icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
            { title: "Contact Info", sub: "Update phone, email, address and maps", href: "/admin/contact", icon: Phone, color: "text-rose-600", bg: "bg-rose-50" },
            { title: "Site Settings", sub: "Edit business name, tagline and about", href: "/admin/content", icon: Settings, color: "text-slate-600", bg: "bg-slate-50" },
        ],
    },
];

export default function AdminDashboardPage() {
    const isConfigured = isSupabaseConfigured();

    return (
        <div className="flex flex-col min-h-screen">
            <ConfigWarning isConfigured={isConfigured} />
            <div className="max-w-6xl mx-auto w-full pb-24">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-black text-forest uppercase">SSM Admin</h1>
                        <p className="text-slate/60 font-medium mt-1">Select a module to get started</p>
                    </div>
                    <Link href="/" target="_blank" className="bg-white border-2 border-forest/10 text-forest px-5 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-forest hover:text-mint transition-all text-sm">
                        View Live Site <ExternalLink size={15} />
                    </Link>
                </header>

                <div className="flex flex-col gap-10">
                    {ERP_SECTIONS.map((section) => (
                        <div key={section.group}>
                            <h2 className="text-xs font-black text-slate/30 uppercase tracking-[0.25em] mb-5">{section.group}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {section.items.map((item) => (
                                    <motion.div key={item.href} whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
                                        <Link href={item.href} className="group flex flex-col bg-white rounded-3xl p-6 shadow-sm border border-forest/5 hover:border-forest/20 transition-all h-full">
                                            <div className={`w-11 h-11 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center mb-5`}>
                                                <item.icon size={20} />
                                            </div>
                                            <h3 className="font-black text-forest mb-1 group-hover:underline underline-offset-4">{item.title}</h3>
                                            <p className="text-xs text-slate/50 font-medium flex-1">{item.sub}</p>
                                            <div className="flex items-center gap-2 mt-5 text-forest/30 group-hover:text-forest transition-all">
                                                <span className="text-xs font-bold">Open</span>
                                                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
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
