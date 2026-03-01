"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NextImage from "next/image";
import { Plus, Edit2, Trash2, Save, X, ImageIcon, RefreshCw, CheckCircle, AlertCircle, LayoutGrid, List } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ServiceItem, ServiceCategory } from "@/lib/siteData";
import { saveService, deleteService, saveServiceCategory, deleteServiceCategory, uploadImage } from "@/app/actions";
import { cn } from "@/lib/utils";

type Toast = { type: "success" | "error"; message: string } | null;
type ConfirmDialog = { title: string; message: string; onConfirm: () => void } | null;

export default function ServicesClient({ initialItems, categories: initialCategories }: { initialItems: ServiceItem[], categories: ServiceCategory[] }) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"category" | "subcategory">("category");

    // State for projects (subcategories)
    const [items, setItems] = useState<ServiceItem[]>(initialItems);
    const [editingProject, setEditingProject] = useState<ServiceItem | null>(null);

    // State for categories
    const [categories, setCategories] = useState<ServiceCategory[]>(initialCategories);
    const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);

    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [toast, setToast] = useState<Toast>(null);
    const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>(null);

    // Derived CATS list for project dropdown
    const CATS = categories.length > 0 ? categories.map(c => c.name) : ["Steel products", "UPVC products", "Iron Works", "Interiors", "Home lifts"];

    const showToast = (type: "success" | "error", message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 4000);
    };

    // --- Project Actions ---
    const openNewProject = () => setEditingProject({ id: 0, title: "", cat: CATS[0] || "Steel products", desc: "", img: "" });
    const openEditProject = (s: ServiceItem) => setEditingProject({ ...s });

    const saveProjectItem = async () => {
        if (!editingProject) return;
        setIsSaving(true);
        const res = await saveService({ ...editingProject, id: editingProject.id > 0 ? editingProject.id : undefined } as any);
        if (res.success && res.data) {
            showToast("success", "Project saved successfully!");
            const savedItem: ServiceItem = {
                id: res.data.id,
                title: res.data.title,
                cat: res.data.cat,
                img: res.data.img,
                desc: res.data.desc_text
            };
            setItems(prev => {
                const exists = prev.find(i => i.id === savedItem.id);
                return exists ? prev.map(i => i.id === savedItem.id ? savedItem : i) : [...prev, savedItem];
            });
            setEditingProject(null);
            router.refresh();
        } else {
            showToast("error", res.error || "Save failed.");
        }
        setIsSaving(false);
    };

    const removeProject = (id: number) => {
        setConfirmDialog({
            title: "Delete Sub Category",
            message: "Are you sure you want to delete this sub category? This action cannot be undone.",
            onConfirm: async () => {
                setConfirmDialog(null);
                const res = await deleteService(id);
                if (res.success) {
                    setItems(prev => prev.filter(i => i.id !== id));
                    showToast("success", "Item deleted.");
                    router.refresh();
                } else {
                    showToast("error", res.error || "Delete failed.");
                }
            }
        });
    };

    // --- Category Actions ---
    const openNewCategory = () => setEditingCategory({ id: 0, name: "", img: "", icon: "Fence" });
    const openEditCategory = (c: ServiceCategory) => setEditingCategory({ ...c });

    const saveCategoryItem = async () => {
        if (!editingCategory) return;
        setIsSaving(true);
        const res = await saveServiceCategory(editingCategory);
        if (res.success && res.data) {
            showToast("success", "Category saved successfully!");
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
            message: "Are you sure you want to delete this category? This may also affect sub categories assigned to it.",
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

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, target: "project" | "category") => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        const res = await uploadImage(formData);
        if (res.success && res.url) {
            if (target === "project" && editingProject) setEditingProject({ ...editingProject, img: res.url });
            if (target === "category" && editingCategory) setEditingCategory({ ...editingCategory, img: res.url });
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

            <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                <div>
                    <h1 className="text-4xl font-black text-forest uppercase">
                        {activeTab === "category" ? "Manage Categories" : "Manage Subcategories"}
                    </h1>
                    <p className="text-slate/60 font-medium mt-1">
                        {activeTab === "category"
                            ? "Configure the primary service cards shown on the website"
                            : "Manage detailed subcategory photos and info within each category"}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    {/* Mode Toggle */}
                    <div className="bg-forest/5 p-1.5 rounded-2xl flex gap-1 self-start">
                        <button
                            onClick={() => setActiveTab("category")}
                            className={cn("px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all",
                                activeTab === "category" ? "bg-forest text-mint shadow-md" : "text-forest/40 hover:text-forest")}
                        >
                            <LayoutGrid size={14} /> Manage Category
                        </button>
                        <button
                            onClick={() => setActiveTab("subcategory")}
                            className={cn("px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all",
                                activeTab === "subcategory" ? "bg-forest text-mint shadow-md" : "text-forest/40 hover:text-forest")}
                        >
                            <List size={14} /> Manage Subcategory
                        </button>
                    </div>

                    <button
                        onClick={activeTab === "category" ? openNewCategory : openNewProject}
                        className="bg-emerald-500 text-white px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                    >
                        <Plus size={18} /> Add {activeTab === "category" ? "Category" : "Sub Category"}
                    </button>
                </div>
            </header>

            {/* Content View */}
            {activeTab === "category" ? (
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
                            <p className="text-sm text-slate/40 max-w-sm mx-auto mt-2">
                                Please add a category or run the SQL script to seed initial data.
                            </p>
                        </div>
                    )}
                    <button onClick={openNewCategory} className="border-4 border-dashed border-forest/10 rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-forest/20 hover:text-forest/40 hover:border-forest/20 transition-all min-h-[200px]">
                        <Plus size={32} className="mb-2" />
                        <span className="font-bold text-xs uppercase tracking-widest">New Category</span>
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence>
                        {items.map((item) => (
                            <motion.div key={item.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-forest/5 group"
                            >
                                <div className="aspect-[4/3] relative bg-forest/5">
                                    {item.img ? <NextImage src={item.img} alt={item.title} fill className="object-cover" unoptimized /> : <div className="w-full h-full flex items-center justify-center text-forest/20"><ImageIcon size={48} /></div>}
                                    <div className="absolute inset-0 bg-forest/20 group-hover:bg-forest/40 transition-all" />
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openEditProject(item)} className="p-3 bg-white rounded-xl text-forest shadow-lg hover:bg-forest hover:text-white transition-all"><Edit2 size={16} /></button>
                                        <button onClick={() => removeProject(item.id)} className="p-3 bg-rose-500 rounded-xl text-white shadow-lg hover:bg-rose-600 transition-all z-10 relative"><Trash2 size={16} /></button>
                                    </div>
                                    <span className="absolute bottom-4 left-4 bg-forest text-mint text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">{item.cat}</span>
                                </div>
                                <div className="p-6">
                                    <h4 className="font-black text-forest text-lg mb-1">{item.title || "Untitled"}</h4>
                                    <p className="text-xs text-slate/50 font-medium line-clamp-2">{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    <button onClick={openNewProject} className="border-4 border-dashed border-forest/10 rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-forest/20 hover:text-forest/40 hover:border-forest/20 transition-all min-h-[280px]">
                        <Plus size={40} className="mb-3" />
                        <span className="font-bold text-sm">Add New Sub Category</span>
                    </button>
                </div>
            )}

            {/* Category Modal */}
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
                                    <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest flex items-center gap-2"><ImageIcon size={12} /> Category Image Preview</label>
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
                                        <input className="hidden" id="cat-file-upload" type="file" accept="image/*" onChange={(e) => handleFileChange(e, "category")} />
                                        <label htmlFor="cat-file-upload" className="bg-forest text-mint px-5 py-4 rounded-2xl font-bold text-sm cursor-pointer hover:bg-forest/90 transition-all flex items-center gap-2 shrink-0">
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
                                        <input className="bg-pearl/50 border-none rounded-2xl p-4 text-forest font-bold text-sm" value={editingCategory.icon} onChange={e => setEditingCategory({ ...editingCategory, icon: e.target.value })} placeholder="e.g. Fence, Hammer, DoorOpen" />
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

            {/* Sub Category Modal */}
            <AnimatePresence>
                {
                    editingProject && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingProject(null)} className="absolute inset-0 bg-forest/50 backdrop-blur-sm" />
                            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden max-h-[90vh] overflow-y-auto"
                            >
                                <div className="p-10 border-b border-forest/5 flex items-center justify-between sticky top-0 bg-white z-20">
                                    <h2 className="text-2xl font-black text-forest uppercase">{editingProject.id === 0 ? "New Sub Category" : "Edit Sub Category"}</h2>
                                    <button onClick={() => setEditingProject(null)} className="p-2 hover:bg-forest/5 rounded-full transition-colors"><X size={20} /></button>
                                </div>
                                <div className="p-10 flex flex-col gap-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest flex items-center gap-2"><ImageIcon size={12} /> Sub Category Image</label>
                                        <div className="flex gap-3">
                                            <input className="hidden" id="file-upload" type="file" accept="image/*" onChange={(e) => handleFileChange(e, "project")} />
                                            <label htmlFor="file-upload" className="bg-forest text-mint px-5 py-4 rounded-2xl font-bold text-sm cursor-pointer hover:bg-forest/90 transition-all flex items-center gap-2 shrink-0">
                                                {isUploading ? <RefreshCw size={16} className="animate-spin" /> : <ImageIcon size={16} />} {isUploading ? "Uploading..." : "Upload File"}
                                            </label>
                                            <input className="bg-pearl/50 border-none rounded-2xl p-4 text-forest font-bold text-xs flex-1" placeholder="Or paste image URL" value={editingProject.img} onChange={e => setEditingProject({ ...editingProject, img: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest">Title</label>
                                            <input className="bg-pearl/50 border-none rounded-2xl p-4 text-forest font-bold text-sm" value={editingProject.title} onChange={e => setEditingProject({ ...editingProject, title: e.target.value })} />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest">Main Category</label>
                                            <select className="bg-pearl/50 border-none rounded-2xl p-4 text-forest font-bold text-sm outline-none" value={editingProject.cat} onChange={e => setEditingProject({ ...editingProject, cat: e.target.value })}>
                                                {CATS.map(c => <option key={c}>{c}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest">Description</label>
                                        <textarea rows={3} className="bg-pearl/50 border-none rounded-2xl p-4 text-forest font-bold text-sm" value={editingProject.desc} onChange={e => setEditingProject({ ...editingProject, desc: e.target.value })} />
                                    </div>
                                    <div className="flex gap-4 mt-2">
                                        <button onClick={saveProjectItem} disabled={isSaving} className="flex-grow bg-forest text-mint p-5 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-forest/90 transition-all shadow-lg shadow-forest/20">
                                            {isSaving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />} Save Sub Category
                                        </button>
                                        <button onClick={() => setEditingProject(null)} className="px-8 border-2 border-forest/10 text-forest rounded-2xl font-bold">Cancel</button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence >

            {/* Custom Delete Confirmation Modal */}
            <AnimatePresence>
                {confirmDialog && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setConfirmDialog(null)}
                            className="absolute inset-0 bg-forest/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.85, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.85, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden"
                        >
                            {/* Red accent bar */}
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
                                    <button
                                        onClick={() => setConfirmDialog(null)}
                                        className="flex-1 px-6 py-4 border-2 border-forest/10 text-forest rounded-2xl font-bold hover:bg-forest/5 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmDialog.onConfirm}
                                        className="flex-1 px-6 py-4 bg-rose-500 text-white rounded-2xl font-bold hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2"
                                    >
                                        <Trash2 size={16} /> Delete
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    );
}
