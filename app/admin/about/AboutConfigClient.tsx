"use client";

import { useState } from "react";
import { Save, RefreshCw } from "lucide-react";
import { SiteConfig } from "@/lib/siteData";
import { saveSiteConfig } from "@/app/actions";

export default function AboutConfigClient({ initialConfig }: { initialConfig: SiteConfig }) {
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
        <div className="max-w-4xl mx-auto">
            <header className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-4xl font-black text-forest uppercase">About Page</h1>
                    <p className="text-slate/60 font-medium mt-1">Edit company story, mission & vision</p>
                </div>
                <button onClick={handleSave} disabled={isSaving} className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black transition-all ${saved ? "bg-emerald-500 text-white" : "bg-forest text-mint shadow-xl disabled:opacity-50"}`}>
                    {isSaving ? <><RefreshCw size={18} className="animate-spin" /> Saving...</> : saved ? <><RefreshCw size={18} /> Saved!</> : <><Save size={18} /> Save Changes</>}
                </button>
            </header>

            <div className="flex flex-col gap-8">
                <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-forest/5">
                    <h3 className="text-xl font-black text-forest mb-8">Company Story</h3>
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest">Story Paragraph (shown under "Our Story")</label>
                        <textarea
                            rows={5}
                            className="bg-pearl/50 border-none rounded-2xl p-5 text-forest font-bold text-sm leading-relaxed"
                            value={data.aboutStory}
                            onChange={(e) => update("aboutStory", e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-forest/5">
                        <h3 className="text-xl font-black text-forest mb-8">Mission Statement</h3>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest">Mission Text</label>
                            <textarea
                                rows={4}
                                className="bg-pearl/50 border-none rounded-2xl p-5 text-forest font-bold text-sm leading-relaxed"
                                value={data.missionText}
                                onChange={(e) => update("missionText", e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-forest/5">
                        <h3 className="text-xl font-black text-forest mb-8">Vision Statement</h3>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest">Vision Text</label>
                            <textarea
                                rows={4}
                                className="bg-pearl/50 border-none rounded-2xl p-5 text-forest font-bold text-sm leading-relaxed"
                                value={data.visionText}
                                onChange={(e) => update("visionText", e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
