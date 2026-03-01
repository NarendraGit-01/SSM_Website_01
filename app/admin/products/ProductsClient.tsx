"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NextImage from "next/image";
import { Plus, Edit2, Trash2, Save, X, ImageIcon, RefreshCw, Search, CheckCircle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductItem, serviceItems } from "@/lib/siteData";
import { saveProduct, deleteProduct, uploadImage } from "@/app/actions";

const CATS = ["Steel products", "UPVC products", "Iron Works", "Interiors", "Home lifts"];

type Toast = { type: "success" | "error"; message: string } | null;

export default function ProductsClient({ initialItems }: { initialItems: ProductItem[] }) {
    const router = useRouter();
    const [items, setItems] = useState<ProductItem[]>(initialItems);
    const [editing, setEditing] = useState<ProductItem | null>(null);
    const [search, setSearch] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [toast, setToast] = useState<Toast>(null);

    const showToast = (type: "success" | "error", message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 4000);
    };

    const filtered = items.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

    const openNew = () => setEditing({ id: 0, code: "", name: "", cat: "Steel", subCat: "", stock: true, img: "", desc: "" });
    const openEdit = (p: ProductItem) => setEditing({ ...p });

    const saveItem = async () => {
        if (!editing) return;
        setIsSaving(true);
        const res = await saveProduct({ ...editing, id: editing.id > 0 ? editing.id : undefined } as any);
        if (res.success && res.data) {
            showToast("success", "Product saved successfully!");

            // Map internal DB fields back to ProductItem type
            const savedItem: ProductItem = {
                ...res.data,
                desc: res.data.desc_text // handle mapping if necessary, though actions.ts should have handled it
            };

            setItems(prev => {
                const exists = prev.find(i => i.id === savedItem.id);
                if (exists) return prev.map(i => i.id === savedItem.id ? savedItem : i);
                return [...prev, savedItem];
            });

            setEditing(null);
            router.refresh();
        } else {
            showToast("error", res.error || "Save failed. Please try again.");
        }
        setIsSaving(false);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !editing) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        const res = await uploadImage(formData);
        if (res.success && res.url) {
            setEditing({ ...editing, img: res.url });
            showToast("success", "Image uploaded! Click Save to apply.");
        } else {
            showToast("error", res.error || "Upload failed. Make sure the 'images' bucket exists in Supabase Storage.");
        }
        setIsUploading(false);
    };

    const remove = async (id: number) => {
        if (confirm("Delete this product?")) {
            const res = await deleteProduct(id);
            if (res.success) {
                setItems(items.filter(i => i.id !== id));
                showToast("success", "Product deleted.");
                router.refresh();
            } else {
                showToast("error", res.error || "Delete failed.");
            }
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl font-bold text-sm ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}
                    >
                        {toast.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>
            <header className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-4xl font-black text-forest uppercase">Products</h1>
                    <p className="text-slate/60 font-medium mt-1">Manage product catalog shown on the Catalog page</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={openNew} className="bg-forest/10 text-forest px-6 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-forest/20 transition-all">
                        <Plus size={18} /> Add Product
                    </button>
                </div>
            </header>

            {/* Search */}
            <div className="bg-white rounded-2xl p-4 flex items-center gap-3 border border-forest/5 mb-8 shadow-sm">
                <Search className="text-slate/30 ml-2" size={18} />
                <input placeholder="Search products..." className="bg-transparent border-none focus:ring-0 text-forest font-semibold flex-1"
                    value={search} onChange={e => setSearch(e.target.value)} />
                <span className="text-xs text-slate/40 font-bold">{filtered.length} items</span>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-forest/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-black uppercase tracking-widest text-slate/40 border-b border-forest/5 bg-pearl/50">
                                <th className="px-8 py-5">Product</th>
                                <th className="px-8 py-5">Category</th>
                                <th className="px-8 py-5">Product Code</th>
                                <th className="px-8 py-5">Sub Category</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {filtered.map((p) => (
                                    <motion.tr key={p.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        className="border-b border-forest/5 hover:bg-pearl/50 transition-colors"
                                    >
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-forest/5 flex-shrink-0 relative">
                                                    {p.img
                                                        ? <NextImage src={p.img} alt={p.name} fill unoptimized className="object-cover" />
                                                        : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={18} className="text-forest/20" /></div>
                                                    }
                                                </div>
                                                <div>
                                                    <p className="font-black text-forest">{p.name}</p>
                                                    <p className="text-[10px] text-slate/40 font-medium line-clamp-1">{p.desc}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="bg-forest/5 text-forest text-xs font-bold px-3 py-1 rounded-lg">{p.cat}</span>
                                        </td>
                                        <td className="px-8 py-5 font-black text-forest">{p.code}</td>
                                        <td className="px-8 py-5 text-sm font-semibold text-forest/70 max-w-[150px] truncate" title={p.subCat}>{p.subCat}</td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${p.stock ? "bg-emerald-500" : "bg-rose-500"}`} />
                                                <span className="text-xs font-bold text-slate/60">{p.stock ? "In Stock" : "Out of Stock"}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => openEdit(p)} className="p-3 bg-forest/5 text-forest rounded-xl hover:bg-forest hover:text-mint transition-all">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => remove(p.id)} className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {editing && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditing(null)} className="absolute inset-0 bg-forest/50 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden max-h-[90vh] overflow-y-auto"
                        >
                            <div className="p-10 border-b border-forest/5 flex items-center justify-between bg-pearl/30 sticky top-0 z-10">
                                <h2 className="text-2xl font-black text-forest uppercase">{editing.id === 0 ? "New Product" : "Edit Product"}</h2>
                                <button onClick={() => setEditing(null)} className="p-2 hover:bg-forest/5 rounded-full"><X size={20} /></button>
                            </div>

                            <div className="p-10 flex flex-col gap-6">
                                {/* Image */}
                                <div className="flex gap-6 items-start">
                                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-forest/5 flex-shrink-0 border border-forest/10 relative">
                                        {editing.img ? (
                                            <NextImage key={editing.img} src={editing.img} alt="Preview" fill unoptimized className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center"><ImageIcon size={24} className="text-forest/20" /></div>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-2 flex-1">
                                        <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest">Product Image</label>
                                        <div className="flex gap-4">
                                            <input className="hidden" id="prod-file-upload" type="file" accept="image/*" onChange={handleFileChange} />
                                            <label htmlFor="prod-file-upload" className="bg-forest text-mint px-6 py-4 rounded-2xl font-bold text-sm cursor-pointer hover:bg-forest/90 transition-all flex items-center gap-2 shrink-0">
                                                {isUploading ? <RefreshCw size={16} className="animate-spin" /> : <ImageIcon size={16} />}
                                                Choose Local File
                                            </label>
                                            <input className="bg-pearl/50 border-none rounded-2xl p-4 text-forest font-bold text-sm flex-1" placeholder="Or paste Image URL (https://...)" value={editing.img} onChange={e => setEditing({ ...editing, img: e.target.value })} />
                                        </div>
                                        <p className="text-[10px] text-slate/30 font-medium whitespace-nowrap">Paste a URL or upload a file directly to Supabase.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="col-span-2 flex flex-col gap-2">
                                        <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest">Product Name</label>
                                        <input className="bg-pearl/50 border-none rounded-2xl p-4 text-forest font-bold text-sm" placeholder="e.g. Premium Gate Handle" value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} />
                                    </div>
                                    <div className="col-span-2 flex flex-col gap-2">
                                        <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest">Product Code</label>
                                        <input className="bg-pearl/50 border-none rounded-2xl p-4 text-forest font-bold text-sm" placeholder="e.g. SS-MG-001" value={editing.code} onChange={e => setEditing({ ...editing, code: e.target.value })} />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest">Category</label>
                                        <select className="bg-pearl/50 border-none rounded-2xl p-4 text-forest font-bold text-sm" value={editing.cat} onChange={e => setEditing({ ...editing, cat: e.target.value, subCat: "" })}>
                                            {CATS.map(c => <option key={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest">Sub Category</label>
                                        <select
                                            className="bg-pearl/50 border-none rounded-2xl p-4 text-forest font-bold text-sm"
                                            value={editing.subCat}
                                            onChange={e => setEditing({ ...editing, subCat: e.target.value })}
                                        >
                                            <option value="">Select Subcategory</option>
                                            {serviceItems
                                                .filter(s => s.cat === editing.cat)
                                                .map(sub => (
                                                    <option key={sub.title} value={sub.title}>{sub.title}</option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                    <div className="col-span-2 flex flex-col gap-2">
                                        <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest">Description</label>
                                        <textarea rows={3} className="bg-pearl/50 border-none rounded-2xl p-4 text-forest font-bold text-sm" value={editing.desc} onChange={e => setEditing({ ...editing, desc: e.target.value })} />
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest">Stock Status</label>
                                        <div className="flex gap-6">
                                            {[true, false].map(val => (
                                                <label key={String(val)} className="flex items-center gap-2 cursor-pointer">
                                                    <input type="radio" name="stock" checked={editing.stock === val} onChange={() => setEditing({ ...editing, stock: val })} className="accent-forest" />
                                                    <span className="font-bold text-sm text-forest">{val ? "✅ In Stock" : "❌ Out of Stock"}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-2">
                                    <button onClick={saveItem} disabled={isSaving} className="flex-grow bg-forest text-mint p-5 rounded-2xl font-black flex items-center justify-center gap-2 disabled:opacity-50">
                                        {isSaving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />} Save Product
                                    </button>
                                    <button onClick={() => setEditing(null)} className="px-8 border-2 border-forest/10 text-forest rounded-2xl font-bold">Cancel</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
