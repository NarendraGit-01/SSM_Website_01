"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Zap, Clock, ThumbsUp } from "lucide-react";

const REASONS = [
    {
        title: "15+ Years Experience",
        desc: "Decades of mastery in steel fabrication and interior design.",
        icon: Clock
    },
    {
        title: "Premium Materials",
        desc: "We use only the highest-grade steel and international standard UPVC.",
        icon: ShieldCheck
    },
    {
        title: "Fast Turnaround",
        desc: "Efficient manufacturing processes ensuring timely delivery of projects.",
        icon: Zap
    },
    {
        title: "Expert Craftmanship",
        desc: "Our team of skilled artisans ensures perfection in every detail.",
        icon: ThumbsUp
    }
];

export default function WhyChooseUs() {
    return (
        <section className="py-24 px-6 bg-white">
            <div className="max-w-7xl mx-auto flex flex-col items-center">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-black text-forest mb-4">Why Choose SSM?</h2>
                    <p className="text-slate/60 max-w-lg">We combine traditional craftsmanship with modern technology to deliver excellence.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 w-full">
                    {REASONS.map((r, i) => (
                        <motion.div
                            key={r.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex flex-col items-center text-center"
                        >
                            <div className="w-16 h-16 rounded-full bg-mint flex items-center justify-center text-forest mb-6">
                                <r.icon size={28} />
                            </div>
                            <h4 className="text-xl font-bold text-forest mb-3">{r.title}</h4>
                            <p className="text-slate/70 text-sm leading-relaxed">{r.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
