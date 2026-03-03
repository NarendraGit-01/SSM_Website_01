"use client";

import { useState } from "react";
import { Save, RefreshCw, Phone, Mail, MapPin, MessageCircle, Facebook, Instagram, Twitter, Navigation, Map } from "lucide-react";
import { SiteConfig } from "@/lib/siteData";
import { saveSiteConfig } from "@/app/actions";

const FIELDS: { key: keyof SiteConfig; label: string; icon: React.ElementType; placeholder: string; type?: string; hint?: string }[] = [
    { key: "phone", label: "Primary Phone", icon: Phone, placeholder: "+91 99999 88888" },
    { key: "whatsapp", label: "WhatsApp Number", icon: MessageCircle, placeholder: "+919999988888 (no spaces)" },
    { key: "email", label: "Business Email", icon: Mail, placeholder: "contact@ssmetals.com", type: "email" },
    { key: "address", label: "Office Address", icon: MapPin, placeholder: "123 Industrial Area, Hyderabad" },
    { key: "googleMapsUrl", label: "Google Maps Navigation Link", icon: Navigation, placeholder: "https://maps.google.com/?q=your+address", hint: "Link for 'Get Directions' button. Share link from Google Maps app." },
    { key: "googleMapsEmbedUrl", label: "Google Maps Embed URL", icon: Map, placeholder: "https://www.google.com/maps/embed?pb=...", hint: "Embed URL from Google Maps. Go to Google Maps → Share → Embed a map → copy the src URL." },
    { key: "facebook", label: "Facebook URL", icon: Facebook, placeholder: "https://facebook.com/..." },
    { key: "instagram", label: "Instagram URL", icon: Instagram, placeholder: "https://instagram.com/..." },
    { key: "twitter", label: "Twitter/X URL", icon: Twitter, placeholder: "https://twitter.com/..." },
];

export default function ContactConfigClient({ initialConfig }: { initialConfig: SiteConfig }) {
    const [data, setData] = useState<SiteConfig>(initialConfig);
    const [saved, setSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const update = (field: keyof SiteConfig, value: string) => {
        setData({ ...data, [field]: value });
        setSaved(false);
        setSaveError(null);
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveError(null);
        const result = await saveSiteConfig(data);
        if (result.success) {
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } else {
            setSaveError(result.error || "Unknown error. Check console for details.");
        }
        setIsSaving(false);
    };

    return (
        <div className="max-w-3xl mx-auto">
            <header className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-4xl font-black text-forest uppercase">Contact Info</h1>
                    <p className="text-slate/60 font-medium mt-1">Update phone, email, address, maps & social links</p>
                </div>
                <button onClick={handleSave} disabled={isSaving} className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black transition-all ${saved ? "bg-emerald-500 text-white" : "bg-forest text-mint shadow-xl disabled:opacity-50"}`}>
                    {isSaving ? <><RefreshCw size={18} className="animate-spin" /> Saving...</> : saved ? <><RefreshCw size={18} /> Saved!</> : <><Save size={18} /> Save Changes</>}
                </button>
            </header>

            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-forest/5 flex flex-col gap-8">
                {saveError && (
                    <div className="flex items-start gap-3 bg-rose-50 text-rose-600 p-5 rounded-2xl font-semibold text-sm border border-rose-100">
                        <span className="text-lg">⚠️</span>
                        <div>
                            <p className="font-black mb-1">Save Failed</p>
                            <p>{saveError}</p>
                            {saveError.includes("google_maps") && (
                                <p className="mt-2 text-xs font-medium text-rose-500">Run the <code>add_maps_columns.sql</code> script in your Supabase SQL Editor first.</p>
                            )}
                        </div>
                    </div>
                )}
                {FIELDS.map(({ key, label, icon: Icon, placeholder, type, hint }) => (
                    <div key={key} className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest flex items-center gap-2">
                            <Icon size={12} /> {label}
                        </label>
                        <div className="relative">
                            <Icon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate/20" size={18} />
                            <input
                                type={type || "text"}
                                className="w-full bg-pearl/50 border-none rounded-2xl p-4 pl-12 text-forest font-bold text-sm"
                                placeholder={placeholder}
                                value={(data as any)[key] || ""}
                                onChange={(e) => update(key, e.target.value)}
                            />
                        </div>
                        {hint && (
                            <p className="text-xs text-slate/40 font-medium ml-1">💡 {hint}</p>
                        )}
                    </div>
                ))}

                {/* Map Preview */}
                {data.googleMapsEmbedUrl && (
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest flex items-center gap-2">
                            <Map size={12} /> Map Preview
                        </label>
                        <div className="rounded-2xl overflow-hidden aspect-video w-full border border-forest/10">
                            <iframe
                                src={data.googleMapsEmbedUrl}
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        </div>
                    </div>
                )}

                <div className="p-6 bg-mint/20 rounded-2xl text-sm text-forest/60 font-medium">
                    💡 Changes here will update the Contact page, Footer, and floating WhatsApp button. WhatsApp number should be in international format without spaces (e.g. 919999988888).
                </div>
            </div>
        </div>
    );
}
