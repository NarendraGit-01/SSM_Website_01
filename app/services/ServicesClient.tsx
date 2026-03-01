"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Suspense, useState, useMemo } from "react";
import * as LucideIcons from "lucide-react";
import { Search, X, ZoomIn, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ServiceItem, ServiceCategory } from "@/lib/siteData";
import NextImage from "next/image";

const FALLBACK_CATEGORIES = [
    { id: "Steel products", name: "Steel products", icon: "Fence", img: "https://images.unsplash.com/photo-1590069230005-db393739d22b?q=80&w=800&auto=format&fit=crop" },
    { id: "UPVC products", name: "UPVC products", icon: "LayoutPanelLeft", img: "https://images.unsplash.com/photo-1503708928676-1cb796a0891e?q=80&w=800&auto=format&fit=crop" },
    { id: "Interiors", name: "Interiors", icon: "DoorOpen", img: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=800&auto=format&fit=crop" },
    { id: "Iron Works", name: "Iron Works", icon: "Hammer", img: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop" },
    { id: "Home lifts", name: "Home lifts", icon: "Construction", img: "https://images.unsplash.com/photo-1588613146197-2fed2e05df5e?q=80&w=800&auto=format&fit=crop" },
];

function ServicesContent({ projects, categoriesFromDb }: { projects: ServiceItem[], categoriesFromDb: ServiceCategory[] }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialCat = searchParams.get("cat") || "all";
    const [selectedCat, setSelectedCat] = useState(initialCat);

    // Merge DB categories with fallback
    const mergedCategories = useMemo(() => {
        const base = categoriesFromDb.length > 0
            ? categoriesFromDb.map(c => ({ id: c.name, name: c.name, icon: c.icon, img: c.img }))
            : FALLBACK_CATEGORIES;

        return [
            { id: "all", name: "All Services", icon: "Search", img: "" },
            ...base
        ];
    }, [categoriesFromDb]);

    const filteredProjects = useMemo(() => {
        if (selectedCat === "all") return projects;
        return projects.filter(p => p.cat === selectedCat);
    }, [selectedCat, projects]);

    // Helper to get Lucide icon component
    const getIcon = (iconName: string) => {
        const Icon = (LucideIcons as any)[iconName] || LucideIcons.HelpCircle;
        return <Icon size={18} />;
    };

    return (
        <div className="min-h-screen pt-12 pb-24 px-6 bg-pearl">
            <div className="max-w-7xl mx-auto">
                <header className="mb-16">
                    <h1 className="text-5xl font-black text-forest mb-4 uppercase">Our Expertise</h1>
                    <p className="text-slate/60 max-w-xl text-lg">Detailed showcase of our manufacturing capabilities and high-quality installations.</p>
                </header>

                {/* Categories Filter */}
                <div className="flex flex-wrap gap-4 mb-16">
                    {mergedCategories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCat(cat.id)}
                            className={cn(
                                "flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all border-2",
                                selectedCat === cat.id
                                    ? "bg-forest text-mint border-forest shadow-lg"
                                    : "bg-white text-slate border-forest/5 hover:border-forest/20"
                            )}
                        >
                            {getIcon(cat.icon)}
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Categories Cards (if 'all' is selected) */}
                {selectedCat === "all" && (
                    <motion.div
                        layout
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        <AnimatePresence mode="popLayout">
                            {mergedCategories.filter(c => c.id !== "all").map((cat, i) => (
                                <motion.button
                                    key={cat.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3, delay: i * 0.05 }}
                                    onClick={() => setSelectedCat(cat.id)}
                                    className="group relative aspect-video rounded-[2.5rem] overflow-hidden bg-white shadow-xl hover:-translate-y-2 transition-transform duration-500 cursor-pointer text-left border-4 border-transparent hover:border-mint"
                                >
                                    {cat.img ? (
                                        <NextImage src={cat.img} alt={cat.name} fill className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" unoptimized />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center bg-forest/5 text-forest/20">
                                            <ImageIcon size={48} />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-forest/90 via-forest/40 to-transparent p-10 flex flex-col justify-end">
                                        <div className="flex justify-between items-end w-full">
                                            <div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-mint mb-2 block">Our Offerings</span>
                                                <h3 className="text-3xl font-black text-white leading-tight">{cat.name}</h3>
                                            </div>
                                            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white group-hover:bg-mint group-hover:text-forest transition-colors flex-shrink-0">
                                                <div className="group-hover:scale-110 transition-transform">
                                                    {getIcon(cat.icon)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.button>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* Sub-Category Projects Grid */}
                {selectedCat !== "all" && (
                    <motion.div
                        layout
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        <AnimatePresence mode="popLayout">
                            {filteredProjects.map((proj) => (
                                <motion.div
                                    key={proj.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                    className="group relative aspect-video rounded-[2.5rem] overflow-hidden bg-white shadow-xl hover:-translate-y-2 transition-transform duration-500 cursor-pointer"
                                    onClick={() => router.push(`/catalog?cat=${encodeURIComponent(proj.cat)}&sub=${encodeURIComponent(proj.title)}`)}
                                >
                                    <NextImage
                                        src={proj.img}
                                        fill
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        alt={proj.title}
                                        unoptimized
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-forest/90 via-forest/20 to-transparent p-10 flex flex-col justify-end">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-mint mb-2">{proj.cat}</span>
                                        <h3 className="text-2xl font-black text-white leading-tight mb-4">{proj.title}</h3>
                                        <p className="text-white/60 text-sm opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-500 line-clamp-2">
                                            {proj.desc}
                                        </p>
                                    </div>
                                    {/* Zoom icon */}
                                    <div className="absolute top-6 right-6 w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ZoomIn size={18} className="text-white" />
                                    </div>
                                </motion.div>
                            ))}
                            {filteredProjects.length === 0 && (
                                <div className="col-span-full py-20 text-center">
                                    <h3 className="text-2xl font-bold text-forest">No items found</h3>
                                    <p className="text-slate/60">We are adding more sub-categories to this section soon.</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

export default function ServicesClient({ projects, categories }: { projects: ServiceItem[], categories: ServiceCategory[] }) {
    return (
        <Suspense fallback={<div className="min-h-screen py-24 text-center">Loading expertise...</div>}>
            <ServicesContent projects={projects} categoriesFromDb={categories} />
        </Suspense>
    );
}
