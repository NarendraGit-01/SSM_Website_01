"use client";

import { motion } from "framer-motion";
import { Target, Eye, Award, Users } from "lucide-react";
import { SiteConfig } from "@/lib/siteData";

export default function AboutClient({ config }: { config: SiteConfig }) {
    return (
        <div className="min-h-screen pt-12 pb-24 px-6 bg-pearl">
            <div className="max-w-7xl mx-auto">
                {/* Hero Section */}
                <header className="mb-24 flex flex-col items-center text-center">
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-7xl md:text-9xl font-black text-forest uppercase leading-tight mb-8"
                    >
                        Legacy of <br />
                        <span className="text-white drop-shadow-xl">{config.businessName.split(" ").slice(1).join(" ") || "Steel Metals"}</span>
                    </motion.h1>
                    <p className="text-xl text-slate/70 max-w-2xl">
                        For 15+ years, {config.businessName} has been at the forefront of manufacturing premium infrastructure for homes and businesses across India.
                    </p>
                </header>

                {/* History & Story */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
                    <div className="relative aspect-square rounded-[3rem] overflow-hidden bg-forest/5 shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-br from-mint to-forest/20 flex items-center justify-center">
                            <span className="text-forest/10 font-black text-8xl">EST 2010</span>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-4xl font-black text-forest mb-8 underline decoration-gold decoration-4 underline-offset-8">Our Story</h2>
                        <div className="flex flex-col gap-6 text-slate/80 text-lg leading-relaxed whitespace-pre-line">
                            {config.aboutStory}
                        </div>
                    </div>
                </section>

                {/* Mission & Vision */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-32">
                    {[
                        { title: "Our Mission", icon: Target, desc: config.missionText },
                        { title: "Our Vision", icon: Eye, desc: config.visionText }
                    ].map((item, i) => (
                        <motion.div
                            key={item.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="premium-card p-12 flex flex-col items-center text-center"
                        >
                            <div className="w-16 h-16 rounded-full bg-forest text-mint flex items-center justify-center mb-8">
                                <item.icon size={32} />
                            </div>
                            <h3 className="text-3xl font-black text-forest mb-6">{item.title}</h3>
                            <p className="text-slate/70 text-lg">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        { label: "Years Experience", value: "15+", icon: Award },
                        { label: "Completed Projects", value: "1200+", icon: Target },
                        { label: "Skilled Artisans", value: "50+", icon: Users },
                        { label: "Satisfied Clients", value: "98%", icon: Users },
                    ].map((stat, i) => (
                        <div key={stat.label} className="flex flex-col items-center text-center">
                            <span className="text-5xl font-black text-forest mb-2">{stat.value}</span>
                            <span className="text-xs font-bold text-gold uppercase tracking-widest">{stat.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
