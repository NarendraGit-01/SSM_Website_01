"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-mint flex flex-col items-center justify-center px-6 text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center"
            >
                {/* Big 404 */}
                <div className="relative mb-12">
                    <span className="text-[180px] font-black text-forest/5 leading-none select-none">404</span>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-forest text-mint w-24 h-24 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-forest/30">
                            <span className="text-3xl font-black">!</span>
                        </div>
                    </div>
                </div>

                <h1 className="text-4xl md:text-5xl font-black text-forest mb-4">Page Not Found</h1>
                <p className="text-slate/60 text-lg max-w-md mb-12">
                    Oops! The page you're looking for doesn't exist. It might have been moved or removed.
                </p>

                <div className="flex flex-wrap gap-4 justify-center">
                    <Link
                        href="/"
                        className="bg-forest text-mint px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-forest/20"
                    >
                        <Home size={18} />
                        Go Home
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="bg-white text-forest px-8 py-4 rounded-2xl font-bold flex items-center gap-2 border border-forest/10 hover:bg-forest/5 transition-all"
                    >
                        <ArrowLeft size={18} />
                        Go Back
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
