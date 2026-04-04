"use client";

import { motion } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ShoppingBag, ArrowRight, Boxes, ChevronRight, ArrowLeft } from "lucide-react";

import { ProductItem, serviceItems } from "@/lib/siteData";

export default function CatalogClient({ products }: { products: ProductItem[] }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialCat = searchParams.get("cat");
    const initialSub = searchParams.get("sub");

    const [search, setSearch] = useState("");
    const [selectedCat, setSelectedCat] = useState<string | null>(initialCat);
    const [selectedSubCat, setSelectedSubCat] = useState<string | null>(initialSub);

    // Sync URL changes to state
    useEffect(() => {
        const cat = searchParams.get("cat");
        const sub = searchParams.get("sub");
        setSelectedCat(cat);
        setSelectedSubCat(sub);

        // Auto-detect category from subcategory if missing
        if (sub && !cat) {
            const match = serviceItems.find(s => s.title === sub);
            if (match) setSelectedCat(match.cat);
        }
    }, [searchParams]);

    // Update URL when state changes
    const updateUrl = (cat: string | null, sub: string | null) => {
        const params = new URLSearchParams();
        if (cat) params.set("cat", cat);
        if (sub) params.set("sub", sub);
        router.replace(params.toString() ? `/catalog?${params.toString()}` : "/catalog");
    };

    const handleSetCat = (cat: string | null) => {
        setSelectedCat(cat);
        setSelectedSubCat(null);
        updateUrl(cat, null);
    };

    const handleSetSubCat = (sub: string | null) => {
        setSelectedSubCat(sub);
        updateUrl(selectedCat, sub);
    };

    // Derived Data
    const searchActive = search.trim().length > 0;

    const displayProducts = useMemo(() => {
        let filtered = products;

        if (selectedCat) {
            filtered = filtered.filter(p => p.cat === selectedCat);
        }

        if (selectedSubCat) {
            filtered = filtered.filter(p => p.subCat === selectedSubCat);
        }

        if (searchActive) {
            const s = search.toLowerCase();
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(s) ||
                p.code.toLowerCase().includes(s) ||
                p.subCat.toLowerCase().includes(s) ||
                p.cat.toLowerCase().includes(s)
            );
        }

        return filtered;
    }, [products, searchActive, search, selectedCat, selectedSubCat]);

    return (
        <div className="min-h-screen pt-12 pb-24 px-6 bg-mint/10">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8 text-forest">
                    <div>
                        <h1 className="text-5xl font-black uppercase mb-4">SSM Catalog</h1>
                        <p className="text-slate/60 text-lg">Browse our premium custom hardware and architectural elements.</p>

                        {/* Dropdown Filters */}
                        <div className="mt-6 flex flex-col sm:flex-row gap-4 relative z-20">
                            <div className="flex flex-col gap-1 w-full sm:w-auto">
                                <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest pl-1">Category</label>
                                <select
                                    className="bg-white border-none rounded-2xl p-4 text-forest font-bold text-sm shadow-sm min-w-[200px] appearance-none cursor-pointer hover:bg-forest/5 transition-colors focus:ring-4 focus:ring-mint outline-none"
                                    value={selectedCat || "all"}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === "all") {
                                            handleSetCat(null);
                                        } else {
                                            handleSetCat(val);
                                        }
                                    }}
                                >
                                    <option value="all">All Categories</option>
                                    {Array.from(new Set(serviceItems.map(s => s.cat))).map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            {selectedCat && (
                                <div className="flex flex-col gap-1 w-full sm:w-auto">
                                    <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest pl-1">Subcategory</label>
                                    <select
                                        className="bg-white border-none rounded-2xl p-4 text-forest font-bold text-sm shadow-sm min-w-[240px] appearance-none cursor-pointer hover:bg-forest/5 transition-colors focus:ring-4 focus:ring-mint outline-none"
                                        value={selectedSubCat || "all"}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === "all") {
                                                handleSetSubCat(null);
                                            } else {
                                                handleSetSubCat(val);
                                            }
                                        }}
                                    >
                                        <option value="all">All {selectedCat}</option>
                                        {serviceItems.filter(s => s.cat === selectedCat).map(sub => (
                                            <option key={sub.title} value={sub.title}>
                                                {sub.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="bg-white p-2 rounded-2xl border border-forest/10 flex items-center gap-3 w-full max-w-sm shadow-sm relative z-10">
                        <ShoppingBag className="text-forest ml-4" size={20} />
                        <input
                            placeholder="Search completely..."
                            className="bg-transparent border-none focus:ring-0 text-forest font-semibold placeholder:text-slate/40 w-full p-2 outline-none"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Products View */}

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {displayProducts.map((prod, i) => (
                        <motion.div
                            key={prod.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white rounded-[2rem] p-4 shadow-xl border border-white group overflow-hidden"
                        >
                            <div className="aspect-[4/5] rounded-[1.5rem] bg-mint overflow-hidden relative mb-6">
                                <img src={prod.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={prod.name} />
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest text-forest shadow-sm uppercase">
                                    {prod.code}
                                </div>
                                {!prod.stock && (
                                    <div className="absolute inset-0 bg-forest/40 backdrop-blur-[2px] flex items-center justify-center font-black text-white uppercase tracking-widest text-sm">
                                        Out of Stock
                                    </div>
                                )}
                            </div>

                            <div className="px-4 pb-4 flex flex-col items-center text-center">
                                <span className="text-[10px] font-bold text-forest/40 uppercase tracking-widest mb-2">{prod.subCat}</span>
                                <h4 className="text-xl font-black text-forest mb-6 leading-tight">{prod.name}</h4>

                                <button onClick={() => window.location.href = '/contact'} className="w-full bg-forest text-mint py-4 rounded-2xl font-bold flex items-center justify-center gap-2 group/btn hover:bg-forest/90 transition-all">
                                    Enquire Now
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    {displayProducts.length === 0 && (
                        <div className="col-span-full py-20 text-center">
                            <Boxes className="text-forest/10 mx-auto mb-6" size={64} />
                            <h3 className="text-2xl font-bold text-forest">No models found</h3>
                            <p className="text-slate/60">Try searching for something else.</p>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
