"use client";

import { useState } from "react";
import { Save, ImageIcon, RefreshCw, Plus, Edit2, Trash2, X, CheckCircle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { HeroSlide, ServiceCategory } from "@/lib/siteData";
import { saveHeroSlides, saveServiceCategory, deleteServiceCategory, uploadImage } from "@/app/actions";
import NextImage from "next/image";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

type Toast = { type: "success" | "error"; message: string } | null;
type ConfirmDialog = { title: string; message: string; onConfirm: () => void } | null;

export default function HeroClient({ initialSlides, initialCategories }: { initialSlides: HeroSlide[], initialCategories: ServiceCategory[] }) {
    const router = useRouter();
    const [slides, setSlides] = useState<HeroSlide[]>(initialSlides);
    const [saved, setSaved] = useState(false);
    const [previewIdx, setPreviewIdx] = useState(0);
    const [isSaving, setIsSaving] = useState(false);

    // Category state
    const [categories, setCategories] = useState<ServiceCategory[]>(initialCategories);
    const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [toast, setToast] = useState<Toast>(null);
    const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>(null);

    const showToast = (type: "success" | "error", message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 4000);
    };

    // --- Hero Slide Actions ---
    const update = (id: number, field: keyof HeroSlide, value: string) => {
        setSlides(slides.map(s => s.id === id ? { ...s, [field]: value } : s));
        setSaved(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        await saveHeroSlides(slides);
        setSaved(true);
        setIsSaving(false);
        setTimeout(() => setSaved(false), 3000);
    };

    // --- Category Actions ---
    const openNewCategory = () => setEditingCategory({ id: 0, name: "", img: "", icon: "Fence" });
    const openEditCategory = (c: ServiceCategory) => setEditingCategory({ ...c });

    const saveCategoryItem = async () => {
        if (!editingCategory) return;
        setIsSaving(true);
        const res = await saveServiceCategory(editingCategory);
        if (res.success && res.data) {
            showToast("success", "Category saved!");
            setCategories(prev => {
                const exists = prev.find(i => i.id === res.data.id);
                return exists ? prev.map(i => i.id === res.data.id ? res.data : i) : [...prev, res.data];
            });
            setEditingCategory(null);
            router.refresh();
        } else {
            showToast("error", res.error || "Save failed.");
        }
        setIsSaving(false);
    };

    const removeCategory = (id: number) => {
        setConfirmDialog({
            title: "Delete Category",
            message: "Are you sure? This will remove the category from both the home page and services page.",
            onConfirm: async () => {
                setConfirmDialog(null);
                const res = await deleteServiceCategory(id);
                if (res.success) {
                    setCategories(prev => prev.filter(i => i.id !== id));
                    showToast("success", "Category deleted.");
                    router.refresh();
                } else {
                    showToast("error", res.error || "Delete failed.");
                }
            }
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        const res = await uploadImage(formData);
        if (res.success && res.url) {
            if (editingCategory) setEditingCategory({ ...editingCategory, img: res.url });
            showToast("success", "Image uploaded!");
        } else {
            showToast("error", res.error || "Upload failed.");
        }
        setIsUploading(false);
    };

    return (
        <div className="max-w-6xl mx-auto pb-20">
            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        className={cn("fixed top-6 right-6 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl font-bold text-sm", toast.type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white")}
                    >
                        {toast.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ===== HERO SLIDES SECTION ===== */}
            <header className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-4xl font-black text-forest uppercase">Hero Slides</h1>
                    <p className="text-slate/60 font-medium mt-1">Edit all 4 carousel slides shown on the homepage</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black transition-all ${saved ? "bg-emerald-500 text-white" : "bg-forest text-mint shadow-xl disabled:opacity-50"}`}
                >
                    {isSaving ? <><RefreshCw size={18} className="animate-spin" /> Saving...</> : saved ? <><RefreshCw size={18} /> Saved!</> : <><Save size={18} /> Save All</>}
                </button>
            </header>

            {/* Preview */}
            <div className="relative aspect-[21/9] rounded-[2.5rem] overflow-hidden shadow-2xl mb-12 bg-forest">
                <AnimatePresence mode="sync">
                    <motion.img
                        key={slides[previewIdx].img}
                        src={slides[previewIdx].img}
                        alt="Preview"
                        className="absolute inset-0 w-full h-full object-cover"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                    />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-r from-forest/80 to-transparent flex items-end p-12">
                    <div>
                        <span className="inline-block bg-gold text-forest text-xs font-black tracking-[0.2em] uppercase px-3 py-1 rounded-full mb-4">
                            {slides[previewIdx].tag}
                        </span>
                        <h2 className="text-4xl font-black text-white whitespace-pre-line leading-tight mb-3">{slides[previewIdx].title}</h2>
                        <p className="text-white/70 max-w-lg">{slides[previewIdx].sub}</p>
                    </div>
                </div>
                <div className="absolute top-6 right-6 flex gap-2">
                    {slides.map((_, i) => (
                        <button key={i} onClick={() => setPreviewIdx(i)}
                            className={`h-1.5 rounded-full transition-all ${i === previewIdx ? "w-8 bg-mint" : "w-2 bg-white/40"}`}
                        />
                    ))}
                </div>
                <div className="absolute top-6 left-6 bg-black/40 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-xl">
                    LIVE PREVIEW
                </div>
            </div>

            {/* Slide Edit Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
                {slides.map((slide, i) => (
                    <div
                        key={slide.id}
                        onClick={() => setPreviewIdx(i)}
                        className={`bg-white rounded-[2rem] overflow-hidden shadow-sm border-2 transition-all cursor-pointer ${previewIdx === i ? "border-forest" : "border-transparent hover:border-forest/20"}`}
                    >
                        <div className="aspect-video relative">
                            <img src={slide.img} className="w-full h-full object-cover" alt={slide.title} />
                            <div className="absolute inset-0 bg-gradient-to-t from-forest/60 to-transparent flex items-end p-4">
                                <span className="text-white font-black text-sm">Slide {i + 1}: {slide.tag}</span>
                            </div>
                            {previewIdx === i && (
                                <div className="absolute top-3 right-3 bg-forest text-mint text-[10px] font-black uppercase px-2 py-1 rounded-lg">Previewing</div>
                            )}
                        </div>
                        <div className="p-8 flex flex-col gap-5">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest">Category Tag</label>
                                <input className="bg-pearl/50 border-none rounded-xl p-3 text-forest font-bold text-sm" value={slide.tag} onChange={(e) => update(slide.id, "tag", e.target.value)} placeholder="e.g. Steel Gates" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest">Headline (use \n for line break)</label>
                                <textarea rows={2} className="bg-pearl/50 border-none rounded-xl p-3 text-forest font-bold text-sm" value={slide.title} onChange={(e) => update(slide.id, "title", e.target.value)} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest">Subtitle</label>
                                <textarea rows={2} className="bg-pearl/50 border-none rounded-xl p-3 text-forest font-bold text-sm" value={slide.sub} onChange={(e) => update(slide.id, "sub", e.target.value)} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest flex items-center gap-2"><ImageIcon size={12} />Background Image URL</label>
                                <input className="bg-pearl/50 border-none rounded-xl p-3 text-forest font-bold text-sm" value={slide.img} onChange={(e) => update(slide.id, "img", e.target.value)} placeholder="https://..." />
                                {slide.img && (
                                    <div className="flex items-center gap-2 mt-1">
                                        <img src={slide.img} className="w-10 h-10 rounded-lg object-cover" alt="" onError={(e) => (e.currentTarget.style.opacity = "0.3")} />
                                        <span className="text-[10px] text-slate/40 font-medium truncate">{slide.img}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ===== HOME PAGE CATEGORIES SECTION ===== */}
            <div className="border-t-2 border-forest/5 pt-16">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-forest uppercase">Home Page Categories</h1>
                        <p className="text-slate/60 font-medium mt-1">Manage the category cards displayed on the home page. Synced with Services.</p>
                    </div>
                    <button
                        onClick={openNewCategory}
                        className="bg-emerald-500 text-white px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                    >
                        <Plus size={18} /> Add Category
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {categories.length > 0 ? (
                        categories.map((cat) => (
                            <motion.div key={cat.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-forest/5 group relative"
                            >
                                <div className="aspect-video relative bg-forest/5">
                                    {cat.img && <NextImage src={cat.img} alt={cat.name} fill unoptimized className="object-cover" />}
                                    <div className="absolute inset-0 bg-forest/40" />
                                    <div className="absolute inset-0 p-8 flex flex-col justify-end">
                                        <h3 className="text-2xl font-black text-white">{cat.name}</h3>
                                        <p className="text-mint/60 text-[10px] font-black uppercase tracking-widest mt-1">Icon: {cat.icon}</p>
                                    </div>
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openEditCategory(cat)} className="p-3 bg-white rounded-xl text-forest shadow-lg hover:bg-forest hover:text-white transition-all">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => removeCategory(cat.id)} className="p-3 bg-rose-500 rounded-xl text-white shadow-lg hover:bg-rose-600 transition-all z-10 relative">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full py-12 px-8 border-4 border-dashed border-forest/5 rounded-[2.5rem] bg-pearl/20 text-center">
                            <ImageIcon size={48} className="mx-auto text-forest/10 mb-4" />
                            <h3 className="text-xl font-bold text-forest/40">No categories found</h3>
                            <p className="text-sm text-slate/40 max-w-sm mx-auto mt-2">Add a category or run the SQL script to seed initial data.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Category Edit Modal */}
            <AnimatePresence>
                {editingCategory && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingCategory(null)} className="absolute inset-0 bg-forest/50 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden"
                        >
                            <div className="p-10 border-b border-forest/5 flex items-center justify-between">
                                <h2 className="text-2xl font-black text-forest uppercase">{editingCategory.id === 0 ? "New Category" : "Edit Category"}</h2>
                                <button onClick={() => setEditingCategory(null)} className="p-2 hover:bg-forest/5 rounded-full"><X size={20} /></button>
                            </div>
                            <div className="p-10 flex flex-col gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest flex items-center gap-2"><ImageIcon size={12} /> Image Preview</label>
                                    <div className="aspect-video relative rounded-3xl overflow-hidden bg-forest/5 mb-2 border border-forest/5">
                                        {editingCategory.img ? (
                                            <NextImage src={editingCategory.img} alt="Preview" fill className="object-cover" unoptimized />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-forest/20 gap-2">
                                                <ImageIcon size={32} />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">No Image selected</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-3">
                                        <input className="hidden" id="hero-cat-file-upload" type="file" accept="image/*" onChange={handleFileChange} />
                                        <label htmlFor="hero-cat-file-upload" className="bg-forest text-mint px-5 py-4 rounded-2xl font-bold text-sm cursor-pointer hover:bg-forest/90 transition-all flex items-center gap-2 shrink-0">
                                            {isUploading ? <RefreshCw size={16} className="animate-spin" /> : <ImageIcon size={16} />} {isUploading ? "Uploading..." : "Upload File"}
                                        </label>
                                        <input className="bg-pearl/50 border-none rounded-2xl p-4 text-forest font-bold text-xs flex-1" placeholder="Or paste image URL" value={editingCategory.img} onChange={e => setEditingCategory({ ...editingCategory, img: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest">Category Name</label>
                                        <input className="bg-pearl/50 border-none rounded-2xl p-4 text-forest font-bold text-sm" value={editingCategory.name} onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })} />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest">Icon Name (Lucide)</label>
                                        <input className="bg-pearl/50 border-none rounded-2xl p-4 text-forest font-bold text-sm" value={editingCategory.icon} onChange={e => setEditingCategory({ ...editingCategory, icon: e.target.value })} placeholder="e.g. Fence, Hammer" />
                                    </div>
                                </div>
                                <div className="flex gap-4 mt-2">
                                    <button onClick={saveCategoryItem} disabled={isSaving} className="flex-grow bg-forest text-mint p-5 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-forest/90 transition-all shadow-lg shadow-forest/20">
                                        {isSaving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />} Save Category
                                    </button>
                                    <button onClick={() => setEditingCategory(null)} className="px-8 border-2 border-forest/10 text-forest rounded-2xl font-bold">Cancel</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Custom Delete Confirmation Modal */}
            <AnimatePresence>
                {confirmDialog && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfirmDialog(null)} className="absolute inset-0 bg-forest/60 backdrop-blur-sm" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.85, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.85, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden"
                        >
                            <div className="h-1.5 bg-gradient-to-r from-rose-500 via-rose-400 to-orange-400" />
                            <div className="p-10 flex flex-col items-center text-center gap-5">
                                <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center">
                                    <Trash2 size={28} className="text-rose-500" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-forest mb-2">{confirmDialog.title}</h2>
                                    <p className="text-sm text-slate/60 leading-relaxed">{confirmDialog.message}</p>
                                </div>
                                <div className="flex gap-3 w-full mt-2">
                                    <button onClick={() => setConfirmDialog(null)} className="flex-1 px-6 py-4 border-2 border-forest/10 text-forest rounded-2xl font-bold hover:bg-forest/5 transition-all">Cancel</button>
                                    <button onClick={confirmDialog.onConfirm} className="flex-1 px-6 py-4 bg-rose-500 text-white rounded-2xl font-bold hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2">
                                        <Trash2 size={16} /> Delete
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
