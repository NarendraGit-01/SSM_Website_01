"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Phone, X, Save, RefreshCw, UserCheck, CheckCircle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { saveWorker, deleteWorker } from "../actions";

type Toast = { type: "success" | "error"; message: string } | null;

const SKILLS = ["Steel", "UPVC", "Interiors", "Iron Works", "Lifts", "All-Round"];

export default function WorkersClient({ initialWorkers }: { initialWorkers: any[] }) {
    const [workers, setWorkers] = useState(initialWorkers);
    const [editing, setEditing] = useState<any | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState<Toast>(null);
    const [confirm, setConfirm] = useState<{ id: string; name: string } | null>(null);

    const showToast = (type: "success" | "error", message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3500);
    };

    const openNew = () => setEditing({ name: "", phone: "", skill_category: "Steel", active_status: true });
    const openEdit = (w: any) => setEditing({ ...w });

    const handleSave = async () => {
        if (!editing.name) { showToast("error", "Name is required."); return; }
        setIsSaving(true);
        const res = await saveWorker(editing);
        if (res.success) {
            showToast("success", editing.id ? "Worker updated!" : "Worker added!");
            setWorkers(prev => editing.id ? prev.map(w => w.id === res.data.id ? { ...w, ...res.data } : w) : [{ ...res.data, projects: [] }, ...prev]);
            setEditing(null);
        } else showToast("error", res.error || "Save failed");
        setIsSaving(false);
    };

    const handleDelete = async (id: string) => {
        const res = await deleteWorker(id);
        if (res.success) {
            setWorkers(prev => prev.filter(w => w.id !== id));
            showToast("success", "Worker removed.");
        } else showToast("error", res.error || "Delete failed");
        setConfirm(null);
    };

    return (
        <div className="max-w-5xl mx-auto">
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl font-semibold text-sm ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}>
                        {toast.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-forest uppercase">Workers</h1>
                    <p className="text-slate/60 mt-1">{workers.filter(w => w.active_status).length} active workers</p>
                </div>
                <button onClick={openNew} className="flex items-center gap-2 bg-forest text-mint px-5 py-3 rounded-2xl font-bold hover:bg-forest/90 transition-all shadow-lg">
                    <Plus size={18} /> Add Worker
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {workers.length === 0 ? (
                    <div className="col-span-full py-16 text-center text-slate/40">
                        <UserCheck size={40} className="mx-auto mb-3 opacity-30" />
                        <p className="font-bold">No workers added yet</p>
                    </div>
                ) : workers.map(w => {
                    const activeProjects = (w.projects || []).filter((p: any) => p.status === "In Progress").length;
                    return (
                        <motion.div key={w.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-3xl p-6 shadow-sm border border-forest/5">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-black text-forest text-lg">{w.name}</h3>
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${w.active_status ? "bg-emerald-100 text-emerald-700" : "bg-slate/10 text-slate/50"}`}>
                                            {w.active_status ? "Active" : "Inactive"}
                                        </span>
                                    </div>
                                    <span className="text-xs font-semibold text-forest/50 bg-forest/5 px-2.5 py-1 rounded-full">{w.skill_category}</span>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => openEdit(w)} className="p-2 text-forest/50 hover:bg-forest/10 rounded-xl transition"><Edit2 size={15} /></button>
                                    <button onClick={() => setConfirm({ id: w.id, name: w.name })} className="p-2 text-rose-400 hover:bg-rose-50 rounded-xl transition"><Trash2 size={15} /></button>
                                </div>
                            </div>
                            {w.phone && <a href={`tel:${w.phone}`} className="flex items-center gap-1.5 text-sm text-slate/50 hover:text-forest transition mb-4"><Phone size={13} /> {w.phone}</a>}
                            <div className="flex gap-3 pt-4 border-t border-forest/5 text-center">
                                <div className="flex-1">
                                    <p className="text-xl font-black text-forest">{(w.projects || []).length}</p>
                                    <p className="text-[10px] text-slate/40 font-semibold uppercase tracking-widest">Total Jobs</p>
                                </div>
                                <div className="flex-1 border-x border-forest/5">
                                    <p className="text-xl font-black text-amber-600">{activeProjects}</p>
                                    <p className="text-[10px] text-slate/40 font-semibold uppercase tracking-widest">Active</p>
                                </div>
                                <div className="flex-1">
                                    <p className="text-xl font-black text-emerald-600">{(w.projects || []).filter((p: any) => p.status === "Completed").length}</p>
                                    <p className="text-[10px] text-slate/40 font-semibold uppercase tracking-widest">Done</p>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {editing && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditing(null)} className="absolute inset-0 bg-forest/50 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative z-10 overflow-hidden">
                            <div className="p-6 border-b border-forest/5 flex items-center justify-between">
                                <h2 className="text-xl font-black text-forest">{editing.id ? "Edit Worker" : "New Worker"}</h2>
                                <button onClick={() => setEditing(null)} className="p-2 hover:bg-forest/5 rounded-full"><X size={18} /></button>
                            </div>
                            <div className="p-6 flex flex-col gap-4">
                                {[{ label: "Full Name*", key: "name", placeholder: "Worker Name" },
                                { label: "Phone", key: "phone", placeholder: "10-digit number" },
                                ].map(f => {
                                    const isPhone = f.key === "phone";
                                    return (
                                        <div key={f.key} className="flex flex-col gap-1">
                                            <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest">{f.label}</label>
                                            <input
                                                type={isPhone ? "tel" : "text"}
                                                value={editing[f.key] || ""}
                                                onKeyDown={isPhone ? e => {
                                                    const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
                                                    if (!/[\d]/.test(e.key) && !allowed.includes(e.key)) {
                                                        e.preventDefault();
                                                    }
                                                    if ((editing[f.key] || "").length >= 10 && !allowed.includes(e.key)) {
                                                        e.preventDefault();
                                                    }
                                                } : undefined}
                                                onChange={e => {
                                                    let val = e.target.value;
                                                    if (isPhone) val = val.replace(/\D/g, "").slice(0, 10);
                                                    setEditing({ ...editing, [f.key]: val });
                                                }}
                                                className="bg-[#f5f7f5] rounded-xl p-3 text-forest font-medium text-sm border-none focus:outline-none"
                                                placeholder={f.placeholder} />
                                        </div>
                                    );
                                })}
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest">Skill Category</label>
                                    <select value={editing.skill_category} onChange={e => setEditing({ ...editing, skill_category: e.target.value })} className="bg-[#f5f7f5] rounded-xl p-3 text-forest font-medium text-sm border-none focus:outline-none">
                                        {SKILLS.map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-[#f5f7f5] rounded-xl">
                                    <input type="checkbox" id="active" checked={editing.active_status} onChange={e => setEditing({ ...editing, active_status: e.target.checked })} className="w-4 h-4 accent-forest" />
                                    <label htmlFor="active" className="text-sm font-semibold text-forest cursor-pointer">Active Worker</label>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button onClick={handleSave} disabled={isSaving} className="flex-1 bg-forest text-mint py-3 rounded-2xl font-black flex items-center justify-center gap-2">
                                        {isSaving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                                        {isSaving ? "Saving..." : "Save"}
                                    </button>
                                    <button onClick={() => setEditing(null)} className="px-6 border-2 border-forest/10 text-forest rounded-2xl font-bold">Cancel</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {confirm && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfirm(null)} className="absolute inset-0 bg-forest/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white w-full max-w-sm rounded-3xl shadow-2xl relative z-10 p-8 flex flex-col items-center text-center gap-4">
                            <div className="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center"><Trash2 size={24} className="text-rose-500" /></div>
                            <div>
                                <h3 className="font-black text-forest text-lg">Remove Worker?</h3>
                                <p className="text-slate/60 text-sm mt-1">{confirm.name}</p>
                            </div>
                            <div className="flex gap-3 w-full">
                                <button onClick={() => setConfirm(null)} className="flex-1 py-3 border-2 border-forest/10 text-forest rounded-2xl font-bold">Cancel</button>
                                <button onClick={() => handleDelete(confirm.id)} className="flex-1 py-3 bg-rose-500 text-white rounded-2xl font-bold">Remove</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
