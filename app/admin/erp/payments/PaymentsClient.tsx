"use client";

import { useState } from "react";
import { Plus, Trash2, X, Save, RefreshCw, CreditCard, CheckCircle, AlertCircle, Upload, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { saveTransaction, deleteTransaction, uploadTransactionScreenshot } from "../actions";
import DateInput from "@/components/ui/DateInput";

type Toast = { type: "success" | "error"; message: string } | null;

const TXN_TYPE_COLORS: Record<string, string> = {
    "Advance": "bg-blue-100 text-blue-700",
    "Payment": "bg-emerald-100 text-emerald-700",
    "Refund": "bg-rose-100 text-rose-700",
};

export default function PaymentsClient({ initialTransactions, projects }: { initialTransactions: any[], projects: any[] }) {
    const [transactions, setTransactions] = useState(initialTransactions);
    const [editing, setEditing] = useState<any | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [toast, setToast] = useState<Toast>(null);
    const [confirm, setConfirm] = useState<{ id: string } | null>(null);
    const [viewImg, setViewImg] = useState<string | null>(null);

    const showToast = (type: "success" | "error", message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3500);
    };

    const openNew = () => setEditing({ project_id: "", type: "Payment", amount: "", payment_mode: "Cash", reference_number: "", screenshot_url: "", transaction_date: new Date().toISOString().split("T")[0], notes: "" });

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        const res = await uploadTransactionScreenshot(formData);
        if (res.success) {
            setEditing((prev: any) => ({ ...prev, screenshot_url: res.data }));
            showToast("success", "Screenshot uploaded!");
        } else showToast("error", res.error || "Upload failed");
        setIsUploading(false);
    };

    const handleSave = async () => {
        if (!editing.project_id || !editing.amount) { showToast("error", "Project and amount are required."); return; }
        setIsSaving(true);
        const res = await saveTransaction(editing);
        if (res.success) {
            showToast("success", "Transaction saved!");
            const project = projects.find(p => p.id === editing.project_id);
            const newTxn = { ...res.data, projects: { model_name: project?.model_name, customers: project?.customers } };
            setTransactions(prev => editing.id ? prev.map(t => t.id === res.data.id ? newTxn : t) : [newTxn, ...prev]);
            setEditing(null);
        } else showToast("error", res.error || "Save failed");
        setIsSaving(false);
    };

    const handleDelete = async (id: string) => {
        const res = await deleteTransaction(id);
        if (res.success) {
            setTransactions(prev => prev.filter(t => t.id !== id));
            showToast("success", "Transaction deleted.");
        } else showToast("error", res.error || "Delete failed");
        setConfirm(null);
    };

    const totalRevenue = transactions.filter(t => t.type !== "Refund").reduce((s, t) => s + (t.amount || 0), 0);
    const totalRefunds = transactions.filter(t => t.type === "Refund").reduce((s, t) => s + (t.amount || 0), 0);

    return (
        <div className="max-w-6xl mx-auto">
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl font-semibold text-sm ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}>
                        {toast.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-forest uppercase">Payments</h1>
                    <p className="text-slate/60 mt-1">{transactions.length} total transactions</p>
                </div>
                <button onClick={openNew} className="flex items-center gap-2 bg-forest text-mint px-5 py-3 rounded-2xl font-bold hover:bg-forest/90 transition-all shadow-lg">
                    <Plus size={18} /> Add Transaction
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-forest/5">
                    <p className="text-xs text-slate/40 font-black uppercase tracking-widest mb-1">Total Collected</p>
                    <p className="text-2xl font-black text-emerald-600">₹{totalRevenue.toLocaleString("en-IN")}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-forest/5">
                    <p className="text-xs text-slate/40 font-black uppercase tracking-widest mb-1">Total Refunds</p>
                    <p className="text-2xl font-black text-rose-600">₹{totalRefunds.toLocaleString("en-IN")}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-forest/5">
                    <p className="text-xs text-slate/40 font-black uppercase tracking-widest mb-1">Net Revenue</p>
                    <p className="text-2xl font-black text-forest">₹{(totalRevenue - totalRefunds).toLocaleString("en-IN")}</p>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-forest/5 overflow-hidden">
                {transactions.length === 0 ? (
                    <div className="p-16 text-center text-slate/40">
                        <CreditCard size={40} className="mx-auto mb-3 opacity-30" />
                        <p className="font-bold">No transactions yet</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-forest/5 text-[11px] font-black text-forest/50 uppercase tracking-widest">
                                <tr>
                                    <th className="text-left p-4 pl-6">Date</th>
                                    <th className="text-left p-4">Project / Customer</th>
                                    <th className="text-left p-4">Type</th>
                                    <th className="text-left p-4">Mode</th>
                                    <th className="text-right p-4">Amount</th>
                                    <th className="text-left p-4">Receipt</th>
                                    <th className="text-left p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-forest/5">
                                {transactions.map(t => (
                                    <tr key={t.id} className="hover:bg-forest/2 transition-colors">
                                        <td className="p-4 pl-6 text-sm text-slate/60 whitespace-nowrap">
                                            {new Date(t.transaction_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
                                        </td>
                                        <td className="p-4">
                                            <p className="font-bold text-forest text-sm">{t.projects?.model_name || "—"}</p>
                                            <p className="text-xs text-slate/40">{t.projects?.customers?.name}</p>
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${TXN_TYPE_COLORS[t.type] || "bg-slate/10 text-slate/60"}`}>{t.type}</span>
                                        </td>
                                        <td className="p-4 text-sm text-slate/60">{t.payment_mode}</td>
                                        <td className={`p-4 text-right font-black text-base ${t.type === "Refund" ? "text-rose-600" : "text-emerald-600"}`}>
                                            {t.type === "Refund" ? "-" : "+"}₹{Number(t.amount).toLocaleString("en-IN")}
                                        </td>
                                        <td className="p-4">
                                            {t.screenshot_url ? (
                                                <button onClick={() => setViewImg(t.screenshot_url)} className="p-1.5 text-forest/50 hover:text-forest hover:bg-forest/10 rounded-lg transition">
                                                    <Eye size={16} />
                                                </button>
                                            ) : <span className="text-slate/30 text-xs">None</span>}
                                        </td>
                                        <td className="p-4">
                                            <button onClick={() => setConfirm({ id: t.id })} className="p-2 text-rose-400 hover:bg-rose-50 rounded-xl transition"><Trash2 size={15} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add Modal */}
            <AnimatePresence>
                {editing && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditing(null)} className="absolute inset-0 bg-forest/50 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative z-10 overflow-hidden">
                            <div className="p-6 border-b border-forest/5 flex items-center justify-between">
                                <h2 className="text-xl font-black text-forest">New Transaction</h2>
                                <button onClick={() => setEditing(null)} className="p-2 hover:bg-forest/5 rounded-full"><X size={18} /></button>
                            </div>
                            <div className="p-6 grid grid-cols-2 gap-4">
                                <div className="col-span-2 flex flex-col gap-1">
                                    <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest">Project*</label>
                                    <select value={editing.project_id} onChange={e => setEditing({ ...editing, project_id: e.target.value })} className="bg-[#f5f7f5] rounded-xl p-3 text-forest font-medium text-sm border-none focus:outline-none">
                                        <option value="">Select Project...</option>
                                        {projects.map(p => <option key={p.id} value={p.id}>{p.model_name} ({p.customers?.name || ""})</option>)}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest">Type</label>
                                    <select value={editing.type} onChange={e => setEditing({ ...editing, type: e.target.value })} className="bg-[#f5f7f5] rounded-xl p-3 text-forest font-medium text-sm border-none focus:outline-none">
                                        {["Advance", "Payment", "Refund"].map(t => <option key={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest">Amount (₹)*</label>
                                    <input type="number" value={editing.amount} onChange={e => setEditing({ ...editing, amount: e.target.value })} className="bg-[#f5f7f5] rounded-xl p-3 text-forest font-medium text-sm border-none focus:outline-none" placeholder="0" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest">Payment Mode</label>
                                    <select value={editing.payment_mode} onChange={e => setEditing({ ...editing, payment_mode: e.target.value })} className="bg-[#f5f7f5] rounded-xl p-3 text-forest font-medium text-sm border-none focus:outline-none">
                                        {["Cash", "UPI", "Bank Transfer"].map(m => <option key={m}>{m}</option>)}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest">Date</label>
                                    <DateInput value={editing.transaction_date} onChange={v => setEditing({ ...editing, transaction_date: v })} className="bg-[#f5f7f5] rounded-xl p-3 text-forest font-medium text-sm border-none focus:outline-none" />
                                </div>
                                <div className="col-span-2 flex flex-col gap-1">
                                    <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest">Reference Number</label>
                                    <input value={editing.reference_number} onChange={e => setEditing({ ...editing, reference_number: e.target.value })} className="bg-[#f5f7f5] rounded-xl p-3 text-forest font-medium text-sm border-none focus:outline-none" placeholder="UPI Txn ID / Cheque No." />
                                </div>
                                {/* Screenshot Upload */}
                                <div className="col-span-2 flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest">Payment Screenshot</label>
                                    <div className="flex items-center gap-3">
                                        <input type="file" id="screenshot-upload" accept="image/*" className="hidden" onChange={handleFileUpload} />
                                        <label htmlFor="screenshot-upload" className="flex items-center gap-2 px-4 py-3 bg-forest text-mint rounded-xl font-semibold text-sm cursor-pointer hover:bg-forest/90 transition-all">
                                            {isUploading ? <RefreshCw size={16} className="animate-spin" /> : <Upload size={16} />}
                                            {isUploading ? "Uploading..." : "Upload"}
                                        </label>
                                        {editing.screenshot_url && (
                                            <img src={editing.screenshot_url} className="w-12 h-12 rounded-xl object-cover border border-forest/10" alt="preview" />
                                        )}
                                    </div>
                                </div>
                                <div className="col-span-2 flex flex-col gap-1">
                                    <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest">Notes</label>
                                    <textarea rows={2} value={editing.notes} onChange={e => setEditing({ ...editing, notes: e.target.value })} className="bg-[#f5f7f5] rounded-xl p-3 text-forest font-medium text-sm border-none focus:outline-none resize-none" />
                                </div>
                                <div className="col-span-2 flex gap-3 pt-2">
                                    <button onClick={handleSave} disabled={isSaving} className="flex-1 bg-forest text-mint py-3 rounded-2xl font-black flex items-center justify-center gap-2">
                                        {isSaving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                                        {isSaving ? "Saving..." : "Save Transaction"}
                                    </button>
                                    <button onClick={() => setEditing(null)} className="px-6 border-2 border-forest/10 text-forest rounded-2xl font-bold">Cancel</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Screenshot Viewer */}
            <AnimatePresence>
                {viewImg && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewImg(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                        <motion.img initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} src={viewImg} className="max-w-xl w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl relative z-10" />
                    </div>
                )}
            </AnimatePresence>

            {/* Confirm Delete */}
            <AnimatePresence>
                {confirm && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfirm(null)} className="absolute inset-0 bg-forest/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white w-full max-w-sm rounded-3xl shadow-2xl relative z-10 p-8 flex flex-col items-center text-center gap-4">
                            <div className="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center"><Trash2 size={24} className="text-rose-500" /></div>
                            <div>
                                <h3 className="font-black text-forest text-lg">Delete Transaction?</h3>
                                <p className="text-slate/60 text-sm mt-1">This action cannot be undone.</p>
                            </div>
                            <div className="flex gap-3 w-full">
                                <button onClick={() => setConfirm(null)} className="flex-1 py-3 border-2 border-forest/10 text-forest rounded-2xl font-bold">Cancel</button>
                                <button onClick={() => handleDelete(confirm.id)} className="flex-1 py-3 bg-rose-500 text-white rounded-2xl font-bold">Delete</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
