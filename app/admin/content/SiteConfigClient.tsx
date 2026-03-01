"use client";

import { useState } from "react";
import { Save, RefreshCw, Globe, Hash } from "lucide-react";
import { SiteConfig } from "@/lib/siteData";
import { saveSiteConfig } from "@/app/actions";

export default function SiteConfigClient({ initialConfig }: { initialConfig: SiteConfig }) {
    const [data, setData] = useState<SiteConfig>(initialConfig);
    const [saved, setSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const update = (field: keyof SiteConfig, value: string) => {
        setData({ ...data, [field]: value });
        setSaved(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        await saveSiteConfig(data);
        setSaved(true);
        setIsSaving(false);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="max-w-3xl mx-auto">
            <header className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-4xl font-black text-forest uppercase">Site Settings</h1>
                    <p className="text-slate/60 font-medium mt-1">Global website configuration</p>
                </div>
                <button onClick={handleSave} disabled={isSaving} className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black transition-all ${saved ? "bg-emerald-500 text-white" : "bg-forest text-mint shadow-xl disabled:opacity-50"}`}>
                    {isSaving ? <><RefreshCw size={18} className="animate-spin" /> Saving...</> : saved ? <><RefreshCw size={18} /> Saved!</> : <><Save size={18} /> Save Settings</>}
                </button>
            </header>

            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-forest/5 flex flex-col gap-8">
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest flex items-center gap-2">
                        <Globe size={12} /> Business Name
                    </label>
                    <input
                        className="w-full bg-pearl/50 border-none rounded-2xl p-4 text-forest font-bold text-lg"
                        placeholder="Srinivasa Steel Metals"
                        value={data.businessName}
                        onChange={(e) => update("businessName", e.target.value)}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest flex items-center gap-2">
                        <Hash size={12} /> Tagline (Header/Footer text)
                    </label>
                    <input
                        className="w-full bg-pearl/50 border-none rounded-2xl p-4 text-forest font-bold text-sm"
                        placeholder="Premium Gates, UPVC & Interiors"
                        value={data.tagline}
                        onChange={(e) => update("tagline", e.target.value)}
                    />
                </div>

                <div className="p-6 bg-mint/20 rounded-2xl text-sm text-forest/60 font-medium">
                    💡 This is a global configuration. Site Name and Tagline will update across the Navbar, Footer, and page titles.
                </div>
            </div>
        </div>
    );
}
