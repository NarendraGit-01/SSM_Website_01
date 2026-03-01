"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NextImage from "next/image";
import { Plus, Edit2, Trash2, Save, X, ImageIcon, RefreshCw, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ServiceCategory } from "@/lib/siteData";
import { saveServiceCategory, deleteServiceCategory, uploadImage } from "@/app/actions";
import Link from "next/link";

type Toast = { type: "success" | "error"; message: string } | null;

export default function CategoriesClient({ initialItems }: { initialItems: ServiceCategory[] }) {
    const router = useRouter();
    const [items, setItems] = useState<ServiceCategory[]>(initialItems);
    const [editing, setEditing] = useState<ServiceCategory | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [toast, setToast] = useState<Toast>(null);

    const showToast = (type: "success" | "error", message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 4000);
    };

    const openNew = () => setEditing({ id: 0, name: "", img: "", icon: "Fence" });
    const openEdit = (c: ServiceCategory) => setEditing({ ...c });

    const saveItem = async () => {
        if (!editing) return;
        setIsSaving(true);
        const res = await saveServiceCategory(editing);
        if (res.success && res.data) {
            showToast("success", "Category saved successfully!");

            setItems(prev => {
                const exists = prev.find(i => i.id === res.data.id);
                if (exists) return prev.map(i => i.id === res.data.id ? res.data : i);
                return [...prev, res.data];
            });

            setEditing(null);
            router.refresh();
        } else {
            showToast("error", res.error || "Save failed.");
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
            showToast("success", "Image uploaded!");
        } else {
            showToast("error", res.error || "Upload failed.");
        }
        setIsUploading(false);
    };

    const remove = async (id: number) => {
        if (confirm("Delete this category? This might affect items assigned to it.")) {
            const res = await deleteServiceCategory(id);
            if (res.success) {
                setItems(items.filter(i => i.id !== id));
                showToast("success", "Category deleted.");
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
                    <Link href="/admin/services" className="text-forest/40 hover:text-forest flex items-center gap-2 text-xs font-bold mb-4 transition-colors">
                        <ArrowLeft size={14} /> Back to Gallery
                    </Link>
                    <h1 className="text-4xl font-black text-forest uppercase">Service Categories</h1>
                    <p className="text-slate/60 font-medium mt-1">Manage the primary service cards shown on the website</p>
                </div>
                <button onClick={openNew} className="bg-forest/10 text-forest px-6 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-forest/20 transition-all">
                    <Plus size={18} /> Add Category
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {items.map((item) => (
                    <motion.div key={item.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-forest/5 group relative"
                    >
                        <div className="aspect-video relative bg-forest/5">
                            {item.img && (
                                <NextImage src={item.img} alt={item.name} fill unoptimized className="object-cover" />
                            )}
                            <div className="absolute inset-0 bg-forest/40" />
                            <div className="absolute inset-0 p-8 flex flex-col justify-end">
                                <h3 className="text-2xl font-black text-white">{item.name}</h3>
                                <p className="text-mint/60 text-[10px] font-black uppercase tracking-widest mt-1">Icon: {item.icon}</p>
                            </div>
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openEdit(item)} className="p-3 bg-white rounded-xl text-forest shadow-lg hover:bg-forest hover:text-white transition-all">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => remove(item.id)} className="p-3 bg-rose-500 rounded-xl text-white shadow-lg hover:bg-rose-600 transition-all">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {editing && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditing(null)} className="absolute inset-0 bg-forest/50 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden"
                        >
                            <div className="p-10 border-b border-forest/5 flex items-center justify-between">
                                <h2 className="text-2xl font-black text-forest uppercase">{editing.id === 0 ? "New Category" : "Edit Category"}</h2>
                                <button onClick={() => setEditing(null)} className="p-2 hover:bg-forest/5 rounded-full"><X size={20} /></button>
                            </div>

                            <div className="p-10 flex flex-col gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest">Category Name</label>
                                    <input className="bg-pearl/50 border-none rounded-2xl p-4 text-forest font-bold text-sm" value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest">Cover Image</label>
                                    <div className="flex gap-3">
                                        <input className="hidden" id="cat-file-upload" type="file" accept="image/*" onChange={handleFileChange} />
                                        <label htmlFor="cat-file-upload" className="bg-forest text-mint px-5 py-4 rounded-2xl font-bold text-sm cursor-pointer hover:bg-forest/90 transition-all flex items-center gap-2">
                                            {isUploading ? <RefreshCw size={16} className="animate-spin" /> : <ImageIcon size={16} />}
                                            Upload
                                        </label>
                                        <input className="bg-pearl/50 border-none rounded-2xl p-4 text-forest font-bold text-xs flex-1" placeholder="Or paste URL" value={editing.img} onChange={e => setEditing({ ...editing, img: e.target.value })} />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest">Icon Name (Lucide)</label>
                                    <input className="bg-pearl/50 border-none rounded-2xl p-4 text-forest font-bold text-sm" value={editing.icon} onChange={e => setEditing({ ...editing, icon: e.target.value })} placeholder="e.g. Fence, Hammer, DoorOpen" />
                                </div>

                                <div className="flex gap-4 mt-2">
                                    <button onClick={saveItem} disabled={isSaving} className="flex-grow bg-forest text-mint p-5 rounded-2xl font-black flex items-center justify-center gap-2 disabled:opacity-50">
                                        {isSaving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />} Save
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
