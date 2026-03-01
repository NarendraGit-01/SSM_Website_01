"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useState } from "react";


export default function ContactPage() {
    const [formState, setFormState] = useState({ name: "", phone: "", message: "" });
    const [sent, setSent] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSent(true);
        // Add form logic here (e.g., Supabase insert)
    };

    return (
        <div className="min-h-screen pt-12 pb-24 px-6 bg-pearl">
            <div className="max-w-7xl mx-auto">
                <header className="mb-24">
                    <h1 className="text-5xl font-black text-forest mb-4 uppercase">Contact Us</h1>
                    <p className="text-slate/60 text-lg max-w-xl">Get in touch with our experts for a free consultation and project estimation.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white p-12 rounded-[3rem] shadow-2xl border border-forest/5"
                    >
                        {!sent ? (
                            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
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
                                <button onClick={() => setSent(false)} className="mt-8 text-forest font-bold border-b-2 border-forest/20 hover:border-forest pb-1">Send another message</button>
                            </div>
                        )}
                    </motion.div>

                    {/* Contact Info & Map */}
                    <div className="flex flex-col gap-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-8">
                            {[
                                { title: "Phone", value: "+91 99999 88888", icon: Phone, sub: "Mon - Sat, 9am - 7pm" },
                                { title: "Email", value: "contact@ssmetals.com", icon: Mail, sub: "24/7 Online Support" },
                                { title: "Office", value: "123 Industrial Area, Phase II, Hyderabad", icon: MapPin, sub: "Get Directions" },
                            ].map((info) => (
                                <div key={info.title} className="bg-white/50 border border-forest/5 p-8 rounded-3xl flex items-start gap-5">
                                    <div className="bg-forest text-mint p-3 rounded-xl">
                                        <info.icon size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black uppercase text-slate/40 tracking-widest mb-1">{info.title}</h4>
                                        <p className="text-lg font-bold text-forest leading-tight mb-1">{info.value}</p>
                                        <span className="text-xs text-gold font-bold">{info.sub}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Map Placeholder */}
                        <div className="bg-forest/5 rounded-[3rem] aspect-video w-full flex items-center justify-center overflow-hidden border-2 border-forest/5 relative group">
                            <span className="text-forest/10 font-bold text-2xl group-hover:scale-110 transition-transform">Google Maps API<br />Integration Placeholder</span>
                            <div className="absolute inset-0 bg-white/5 group-hover:bg-transparent transition-all" />
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
