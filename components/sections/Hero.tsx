"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { HeroSlide, HeroMetric } from "@/lib/siteData";

export default function Hero({ slides, metrics }: { slides: HeroSlide[], metrics: HeroMetric[] }) {
    const [current, setCurrent] = useState(0);
    const [dir, setDir] = useState(1);

    const next = useCallback(() => {
        setDir(1);
        setCurrent((c) => (c + 1) % slides.length);
    }, [slides.length]);

    const prev = useCallback(() => {
        setDir(-1);
        setCurrent((c) => (c - 1 + slides.length) % slides.length);
    }, [slides.length]);

    useEffect(() => {
        const timer = setInterval(next, 5000);
        return () => clearInterval(timer);
    }, [next]);

    const slide = slides[current];

    return (
        <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-forest">
            {/* Background image */}
            <AnimatePresence mode="sync">
                <motion.div
                    key={current}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0"
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={slide.img}
                        alt={slide.tag}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-forest/90 via-forest/60 to-transparent" />
                </motion.div>
            </AnimatePresence>

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 w-full py-24">
                <div className="max-w-2xl">
                    <AnimatePresence mode="wait">
                        <motion.div key={`tag-${current}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
                            <span className="inline-block bg-gold text-forest text-xs font-black tracking-[0.2em] uppercase px-4 py-2 rounded-full mb-8">
                                {slide.tag}
                            </span>
                        </motion.div>
                    </AnimatePresence>

                    <AnimatePresence mode="wait">
                        <motion.h1
                            key={`title-${current}`}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                            transition={{ duration: 0.5, delay: 0.05 }}
                            className="text-5xl md:text-7xl font-black text-white leading-tight mb-6 whitespace-pre-line"
                        >
                            {slide.title}
                        </motion.h1>
                    </AnimatePresence>

                    <AnimatePresence mode="wait">
                        <motion.p
                            key={`sub-${current}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                            className="text-lg text-white/70 leading-relaxed mb-10 max-w-lg"
                        >
                            {slide.sub}
                        </motion.p>
                    </AnimatePresence>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="flex flex-wrap gap-4"
                    >
                        <Link
                            href="/catalog"
                            className="bg-mint text-forest px-8 py-5 rounded-3xl font-bold flex items-center gap-3 hover:scale-105 transition-all shadow-xl"
                        >
                            Explore Catalog
                            <ArrowRight size={20} />
                        </Link>
                        <Link
                            href="/contact"
                            className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-5 rounded-3xl font-bold hover:bg-white/20 transition-all"
                        >
                            Get a Free Quote
                        </Link>
                    </motion.div>
                </div>

                {/* Stats bar */}
                <div className="mt-20 flex flex-wrap gap-12 border-t border-white/10 pt-10">
                    {metrics.map((m) => (
                        <div key={m.label} className="flex flex-col">
                            <span className="text-3xl font-black text-mint">{m.value}</span>
                            <span className="text-xs text-white/50 font-semibold tracking-widest uppercase mt-1">{m.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Slide Controls */}
            <div className="absolute bottom-8 right-8 z-20 flex items-center gap-4">
                {/* Dots */}
                <div className="flex gap-2">
                    {slides.map((_: any, i: number) => (
                        <button
                            key={i}
                            onClick={() => { setDir(i > current ? 1 : -1); setCurrent(i); }}
                            className={`h-1.5 rounded-full transition-all ${i === current ? "w-8 bg-mint" : "w-2 bg-white/30 hover:bg-white/60"}`}
                        />
                    ))}
                </div>

                {/* Arrows */}
                <div className="flex gap-2 ml-4">
                    <button onClick={prev} className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all">
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={next} className="w-12 h-12 rounded-full bg-mint text-forest flex items-center justify-center hover:scale-105 transition-all shadow-xl">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </section>
    );
}
