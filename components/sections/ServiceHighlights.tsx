"use client";

import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { ImageIcon } from "lucide-react";
import Link from "next/link";
import NextImage from "next/image";
import { ServiceCategory } from "@/lib/siteData";

const FALLBACK_CATEGORIES = [
    { id: 1, name: "Steel products", icon: "Fence", img: "https://images.unsplash.com/photo-1590069230005-db393739d22b?q=80&w=800&auto=format&fit=crop" },
    { id: 2, name: "UPVC products", icon: "LayoutPanelLeft", img: "https://images.unsplash.com/photo-1503708928676-1cb796a0891e?q=80&w=800&auto=format&fit=crop" },
    { id: 3, name: "Interiors", icon: "DoorOpen", img: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=800&auto=format&fit=crop" },
    { id: 4, name: "Iron Works", icon: "Hammer", img: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop" },
    { id: 5, name: "Home lifts", icon: "Construction", img: "https://images.unsplash.com/photo-1588613146197-2fed2e05df5e?q=80&w=800&auto=format&fit=crop" },
];

export default function ServiceHighlights({ categories }: { categories?: ServiceCategory[] }) {
    const displayCategories = categories && categories.length > 0 ? categories : FALLBACK_CATEGORIES;

    const getIcon = (iconName: string) => {
        const Icon = (LucideIcons as any)[iconName] || LucideIcons.HelpCircle;
        return <Icon size={20} />;
    };

    return (
        <section className="py-24 px-6 bg-pearl">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <motion.span
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="text-xs font-black tracking-[0.2em] text-gold uppercase mb-4 block"
                    >
                        Our Expertise
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-black text-forest"
                    >
                        Quality Manufacturing <br />
                        <span className="text-slate/60">For Modern Homes</span>
                    </motion.h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {displayCategories.map((cat, index) => (
                        <motion.div
                            key={cat.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.08 }}
                            viewport={{ once: true }}
                        >
                            <Link
                                href={`/services?cat=${encodeURIComponent(cat.name)}`}
                                className="group relative aspect-video rounded-[2rem] overflow-hidden shadow-xl block hover:-translate-y-2 transition-transform duration-500 border-4 border-transparent hover:border-mint"
                            >
                                {cat.img ? (
                                    <NextImage
                                        src={cat.img}
                                        alt={cat.name}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-forest/5 text-forest/20">
                                        <ImageIcon size={48} />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-forest/90 via-forest/40 to-transparent p-8 flex flex-col justify-end">
                                    <div className="flex justify-between items-end w-full">
                                        <div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-mint mb-2 block">
                                                Our Offerings
                                            </span>
                                            <h3 className="text-2xl md:text-3xl font-black text-white leading-tight">
                                                {cat.name}
                                            </h3>
                                        </div>
                                        <div className="w-11 h-11 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white group-hover:bg-mint group-hover:text-forest transition-colors flex-shrink-0">
                                            {getIcon(cat.icon)}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
