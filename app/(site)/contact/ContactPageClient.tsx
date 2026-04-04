"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, Navigation, MessageCircle, ExternalLink } from "lucide-react";
import { useState } from "react";
import { SiteConfig } from "@/lib/siteData";

export default function ContactPageClient({ config }: { config: SiteConfig }) {
    const [formState, setFormState] = useState({ name: "", phone: "", message: "" });
    const [sent, setSent] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSent(true);
        // Add form logic here (e.g., Supabase insert)
    };

    const contactCards = [
        {
            title: "Phone",
            value: config.phone,
            icon: Phone,
            sub: "Mon – Sat, 9am – 7pm",
            href: `tel:${config.phone.replace(/\s/g, "")}`,
        },
        {
            title: "Email",
            value: config.email,
            icon: Mail,
            sub: "24/7 Online Support",
            href: `mailto:${config.email}`,
        },
        {
            title: "WhatsApp",
            value: config.whatsapp,
            icon: MessageCircle,
            sub: "Chat with us instantly",
            href: `https://wa.me/${config.whatsapp.replace(/\D/g, "")}`,
        },
        {
            title: "Office",
            value: config.address,
            icon: MapPin,
            sub: "Get Directions",
            href: config.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(config.address)}`,
        },
    ];

    return (
        <div className="min-h-screen pt-12 pb-24 px-6 bg-pearl">
            <div className="max-w-7xl mx-auto">
                <header className="mb-16">
                    <h1 className="text-5xl font-black text-forest mb-4 uppercase">Contact Us</h1>
                    <p className="text-slate/60 text-lg max-w-xl">
                        Get in touch with our experts for a free consultation and project estimation.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white p-12 rounded-[3rem] shadow-2xl border border-forest/5"
                    >
                        {!sent ? (
                            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                                <div>
                                    <h2 className="text-2xl font-black text-forest mb-1">Send an Inquiry</h2>
                                    <p className="text-slate/50 text-sm font-medium">We'll get back to you within 24 hours.</p>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-black uppercase text-slate/40 tracking-widest">Full Name</label>
                                    <input
                                        required
                                        className="bg-pearl/50 border-none rounded-2xl p-5 text-forest font-bold placeholder:text-slate/20 focus:ring-2 focus:ring-forest/20"
                                        placeholder="John Doe"
                                        value={formState.name}
                                        onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-black uppercase text-slate/40 tracking-widest">Phone Number</label>
                                    <input
                                        required
                                        className="bg-pearl/50 border-none rounded-2xl p-5 text-forest font-bold placeholder:text-slate/20 focus:ring-2 focus:ring-forest/20"
                                        placeholder="+91 99999 00000"
                                        value={formState.phone}
                                        onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-black uppercase text-slate/40 tracking-widest">Your Message</label>
                                    <textarea
                                        required
                                        rows={4}
                                        className="bg-pearl/50 border-none rounded-2xl p-5 text-forest font-bold placeholder:text-slate/20 focus:ring-2 focus:ring-forest/20"
                                        placeholder="I'm interested in a steel gate for my home..."
                                        value={formState.message}
                                        onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                                    />
                                </div>
                                <button className="bg-forest text-mint p-6 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-xl shadow-forest/20">
                                    Send Inquiry
                                    <Send size={20} />
                                </button>
                            </form>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center py-20">
                                <div className="w-20 h-20 rounded-full bg-mint flex items-center justify-center mb-8 text-forest">
                                    <Send size={40} />
                                </div>
                                <h3 className="text-3xl font-black text-forest mb-4">Message Sent!</h3>
                                <p className="text-slate/60 px-8">Thank you for reaching out. Our team will contact you within 24 hours.</p>
                                <button onClick={() => setSent(false)} className="mt-8 text-forest font-bold border-b-2 border-forest/20 hover:border-forest pb-1">
                                    Send another message
                                </button>
                            </div>
                        )}
                    </motion.div>

                    {/* Contact Info & Map */}
                    <div className="flex flex-col gap-8">
                        {/* Contact Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {contactCards.map((info) => (
                                <motion.a
                                    key={info.title}
                                    href={info.href}
                                    target={info.title === "Office" || info.title === "WhatsApp" ? "_blank" : undefined}
                                    rel="noopener noreferrer"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    whileHover={{ scale: 1.02 }}
                                    className="bg-white border border-forest/5 p-7 rounded-3xl flex items-start gap-5 group cursor-pointer hover:shadow-lg transition-all"
                                >
                                    <div className="bg-forest text-mint p-3 rounded-xl group-hover:bg-mint group-hover:text-forest transition-colors shrink-0">
                                        <info.icon size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-xs font-black uppercase text-slate/40 tracking-widest mb-1">{info.title}</h4>
                                        <p className="text-sm font-bold text-forest leading-tight mb-1 break-words">{info.value}</p>
                                        <span className="text-xs text-gold font-bold flex items-center gap-1">
                                            {info.sub}
                                            <ExternalLink size={10} />
                                        </span>
                                    </div>
                                </motion.a>
                            ))}
                        </div>

                        {/* Google Maps Embed */}
                        <div className="flex flex-col gap-3">
                            <div className="bg-white rounded-[2.5rem] overflow-hidden border border-forest/5 shadow-lg aspect-video w-full">
                                {config.googleMapsEmbedUrl ? (
                                    <iframe
                                        src={config.googleMapsEmbedUrl}
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title="Business Location on Google Maps"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-forest/5 gap-3">
                                        <MapPin className="text-forest/20" size={48} />
                                        <p className="text-forest/30 font-bold text-sm">
                                            Set an Embed URL in Admin → Contact to show the map
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Directions Button */}
                            <a
                                href={config.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(config.address)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-3 bg-forest text-mint p-5 rounded-2xl font-black hover:scale-[1.01] transition-all shadow-lg shadow-forest/20 text-sm"
                            >
                                <Navigation size={18} />
                                Get Directions on Google Maps
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
