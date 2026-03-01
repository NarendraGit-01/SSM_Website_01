"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Phone, Hammer, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: "Catalog", href: "/catalog" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
];

export default function Navbar({ config }: { config: any }) {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4",
                scrolled ? "bg-white/80 backdrop-blur-lg shadow-sm py-3" : "bg-transparent"
            )}
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="bg-forest p-2 rounded-xl group-hover:rotate-12 transition-transform">
                        <Hammer className="text-mint w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-bold tracking-tight text-forest leading-none">SSM</span>
                        <span className="text-[10px] uppercase tracking-widest text-slate font-semibold">Steel Metals</span>
                    </div>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {NAV_LINKS.map((link) => {
                        const isActive = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href));
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={cn(
                                    "text-sm font-bold transition-colors relative group",
                                    isActive ? "text-forest" : "text-slate hover:text-forest"
                                )}
                            >
                                {link.name}
                                <span className={cn(
                                    "absolute -bottom-1 left-0 h-0.5 bg-forest transition-all duration-300",
                                    isActive ? "w-full" : "w-0 group-hover:w-full"
                                )} />
                            </Link>
                        );
                    })}
                    <Link
                        href={`tel:${config.phone.replace(/\s+/g, "")}`}
                        className="bg-forest text-mint px-5 py-2.5 rounded-2xl flex items-center gap-2 hover:bg-forest/90 transition-all shadow-md active:scale-95"
                    >
                        <Phone size={16} />
                        <span className="text-sm font-semibold">Call Now</span>
                    </Link>
                    <Link
                        href="/admin"
                        className="p-2.5 rounded-2xl bg-forest/5 text-forest hover:bg-forest hover:text-mint transition-all shadow-sm border border-forest/5"
                        title="Admin Login"
                    >
                        <User size={20} />
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button className="md:hidden p-2 text-forest" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-full left-0 right-0 bg-white shadow-xl border-t border-gray-100 p-6 flex flex-col gap-4 md:hidden"
                    >
                        {NAV_LINKS.map((link) => {
                            const isActive = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href));
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className={cn(
                                        "text-lg font-bold p-2 transition-colors rounded-xl",
                                        isActive ? "text-forest bg-forest/5" : "text-slate hover:text-forest hover:bg-slate/5"
                                    )}
                                >
                                    {link.name}
                                </Link>
                            );
                        })}
                        <hr className="border-gray-100" />
                        <Link
                            href={`tel:${config.phone.replace(/\s+/g, "")}`}
                            className="bg-forest text-mint p-4 rounded-2xl flex items-center justify-center gap-2 font-bold"
                        >
                            <Phone size={20} />
                            Call Now
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
