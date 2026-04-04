"use client";

import { useState } from "react";
import { Plus, Search, Edit2, Trash2, Phone, X, Save, RefreshCw, Users, CheckCircle, AlertCircle, MessageSquare, ExternalLink, Briefcase, Hash, ArrowUpDown, ChevronLeft, CalendarRange, Printer } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { saveCustomer, deleteCustomer, checkDuplicateCustomer } from "../actions";

type Toast = { type: "success" | "error"; message: string } | null;

function calcOutstanding(customer: any) {
    const projects = customer.projects || [];
    let total = 0;
    projects.forEach((p: any) => {
        const paid = (p.transactions || []).filter((t: any) => t.type !== "Refund").reduce((s: number, t: any) => s + t.amount, 0);
        const refunded = (p.transactions || []).filter((t: any) => t.type === "Refund").reduce((s: number, t: any) => s + t.amount, 0);
        total += (p.final_project_value || 0) - paid + refunded;
    });
    return Math.max(0, total);
}

export default function CustomersClient({ initialCustomers }: { initialCustomers: any[] }) {
    const [customers, setCustomers] = useState(initialCustomers);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState<"name" | "amount" | "date">("date");
    const [editing, setEditing] = useState<any | null>(null);
    const [detail, setDetail] = useState<any | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState<Toast>(null);
    const [confirm, setConfirm] = useState<{ id: string; name: string } | null>(null);
    const [isWhatsappSame, setIsWhatsappSame] = useState(true);
    const [duplicateCustomer, setDuplicateCustomer] = useState<any | null>(null);
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const id = searchParams.get("id");
        const isNew = searchParams.get("new") === "true";
        if (id) {
            const found = customers.find(c => c.id === id || c.display_id === id);
            if (found) setDetail(found);
            else setDetail(null);
        } else if (isNew) {
            openNew();
            // Clean up URL
            const params = new URLSearchParams(searchParams.toString());
            params.delete("new");
            router.replace(`?${params.toString()}`, { scroll: false });
        } else {
            setDetail(null);
        }
    }, [searchParams, customers, router]);

    // Sync WhatsApp if toggle is on
    useEffect(() => {
        if (isWhatsappSame && editing && !editing.id) {
            setEditing((prev: any) => ({ ...prev, whatsapp_number: prev.phone_number }));
        }
    }, [editing?.phone_number, isWhatsappSame, editing?.id]);

    // Live duplicate check (Only for new customers)
    useEffect(() => {
        if (!editing || editing.id) {
            setDuplicateCustomer(null);
            return;
        }
        if (!editing.name?.trim() && (editing.phone_number?.length || 0) < 10) {
            setDuplicateCustomer(null);
            return;
        }
        const timer = setTimeout(async () => {
            const existing = await checkDuplicateCustomer(editing.name, editing.phone_number);
            setDuplicateCustomer(existing);
        }, 600);
        return () => clearTimeout(timer);
    }, [editing?.name, editing?.phone_number, editing?.id]);

    const updateDetail = (c: any | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (c) {
            params.set("id", c.display_id || c.id);
        } else {
            params.delete("id");
        }
        router.push(`?${params.toString()}`);
    };

    const showToast = (type: "success" | "error", message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3500);
    };

    const filtered = customers
        .filter(c =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.phone_number?.includes(search)
        )
        .sort((a, b) => {
            if (sortBy === "name") return a.name.localeCompare(b.name);
            if (sortBy === "amount") return calcOutstanding(b) - calcOutstanding(a);
            return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        });

    const openNew = () => {
        setIsWhatsappSame(true);
        setEditing({ name: "", phone_number: "", whatsapp_number: "", address: "", notes: "" });
    };
    const openEdit = (c: any) => {
        setIsWhatsappSame(c.whatsapp_number === c.phone_number);
        setEditing({ ...c });
    };

    const handleSave = async () => {
        if (!editing.name?.trim()) return showToast("error", "Name is required");
        if (editing.phone_number?.length !== 10) return showToast("error", "Phone number must be exactly 10 digits");
        
        setIsSaving(true);
        const res = await saveCustomer(editing);
        if (res.success) {
            setCustomers((prev: any) => editing.id ? prev.map((c: any) => c.id === editing.id ? { ...c, ...editing } : c) : [res.data, ...prev]);
            setEditing(null);
            showToast("success", editing.id ? "Profile updated" : "Customer added");
        } else showToast("error", "Failed to save customer");
        setIsSaving(false);
    };

    const handleDelete = async (id: string) => {
        const res = await deleteCustomer(id);
        if (res.success) {
            setCustomers((prev: any) => prev.filter((c: any) => c.id !== id));
            showToast("success", "Customer deleted");
            setConfirm(null);
        } else showToast("error", res.error || "Delete failed");
    };

    const printCustomerSummary = () => {
        if (!detail) return;
        const win = window.open("", "_blank");
        if (!win) return;
        const totalValue = (detail.projects || []).reduce((s: number, p: any) => s + (p.final_project_value || 0), 0);
        const outstanding = calcOutstanding(detail);
        
        const html = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Customer Report - ${detail.display_id || detail.name}</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap');
                        body { font-family: 'Inter', sans-serif; padding: 40px; color: #111; max-width: 900px; margin: 0 auto; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                        * { box-sizing: border-box; }
                        
                        /* Header */
                        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #1a2f1a; padding-bottom: 20px; margin-bottom: 30px; }
                        .brand h1 { margin: 0; color: #1a2f1a; font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.5px; }
                        .brand p { margin: 5px 0 0; color: #666; font-size: 13px; font-weight: 600; }
                        .doc-info { text-align: right; }
                        .doc-info h2 { margin: 0 0 5px; color: #1a2f1a; font-size: 20px; text-transform: uppercase; font-weight: 900; background: #e1fee1; display: inline-block; padding: 4px 12px; border-radius: 4px; }
                        .doc-info p { margin: 4px 0; font-size: 12px; color: #333; }
                        
                        /* Info Grid */
                        .info-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 30px; padding: 20px; border-radius: 12px; background: #f8fafc; border: 1px solid #e2e8f0; }
                        .info-item label { display: block; font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px; }
                        .info-item span { display: block; font-size: 16px; font-weight: 900; color: #0f172a; margin-top: 3px; }
                        .info-item p { margin: 2px 0 0; font-size: 13px; color: #334155; font-weight: 600; }
                        
                        /* Layout */
                        .section-title { font-size: 12px; font-weight: 900; text-transform: uppercase; color: #1a2f1a; letter-spacing: 1px; margin-bottom: 15px; border-bottom: 2px solid #e1fee1; padding-bottom: 5px; display: inline-block; }
                        
                        /* Main Spec Table */
                        table { width: 100%; border-collapse: collapse; margin-bottom: 40px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
                        th { background: #1a2f1a; color: #fff; text-align: left; padding: 12px 15px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
                        td { padding: 14px 15px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: 600; color: #334155; }
                        th.text-right, td.text-right { text-align: right; }
                        tr:last-child td { border-bottom: none; }
                        .table-wrap { border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; margin-bottom: 30px; }
                        .table-wrap table { margin-bottom: 0; border: none; }
                        
                        /* Summary Box */
                        .flex-row { display: flex; justify-content: space-between; align-items: flex-end; }
                        .summary-box { border: 2px solid #1a2f1a; border-radius: 12px; width: 350px; padding: 20px; background: #fff; margin-bottom: 30px; }
                        .summary-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dashed #cbd5e1; font-size: 14px; font-weight: 600; color: #334155; }
                        .summary-row:last-child { border-bottom: none; padding-bottom: 0; }
                        .summary-total { font-size: 18px; font-weight: 900; color: #1a2f1a; border-bottom: none; margin-top: 10px; padding-top: 15px; border-top: 2px solid #1a2f1a; }
                        
                        /* Badges */
                        .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: 800; text-transform: uppercase; background: #f1f5f9; color: #475569; }
                        .badge-status { background: #e2e8f0; color: #334155; }

                        /* Footer */
                        .footer { margin-top: 60px; text-align: center; color: #94a3b8; font-size: 12px; font-weight: 600; border-top: 2px solid #f1f5f9; padding-top: 25px; }
                        
                        @media print {
                            body { padding: 0; }
                            th { background: #1a2f1a !important; color: #fff !important; }
                        }
                    </style>
                </head>
                <body>
                    <!-- Header Branding -->
                    <div class="header">
                        <div class="brand">
                            <h1>Srinivasa Steel Metals</h1>
                            <p>Premium Metal & Interior Works</p>
                        </div>
                        <div class="doc-info">
                            <h2>CUSTOMER REPORT</h2>
                            <p><strong>Date:</strong> ${new Date().toLocaleDateString("en-IN")}</p>
                            ${detail.display_id ? `<p><strong>Cust ID:</strong> ${detail.display_id}</p>` : ''}
                        </div>
                    </div>
                    
                    <div class="section-title">Customer Details</div>
                    <div class="info-grid" style="grid-template-columns: 1fr;">
                        <div class="info-item" style="background: transparent; border: none; padding: 0;">
                            <span style="color:#1a2f1a; font-size: 15px; font-weight: 900; display: block; margin-bottom: 8px;">Name: ${detail.name} ${detail.display_id ? `(${detail.display_id})` : ""}</span>
                            <div style="display: flex; flex-direction: column; gap: 4px;">
                                ${detail.phone_number ? `<p style="margin: 0; font-size: 13px;"><strong>Phone:</strong> ${detail.phone_number}</p>` : ''}
                                ${detail.whatsapp_number && detail.whatsapp_number !== detail.phone_number ? `<p style="margin: 0; font-size: 13px;"><strong>WhatsApp:</strong> ${detail.whatsapp_number}</p>` : ''}
                                <p style="margin: 4px 0 0; font-size: 13px; color: #334155; line-height: 1.5;"><strong>Address:</strong> ${detail.address || "—"}</p>
                            </div>
                        </div>
                    </div>

                    <div class="section-title">Projects History</div>

                    <!-- Projects Table -->
                    ${(!detail.projects || detail.projects.length === 0) ? '<p style="font-size: 13px; color: #94a3b8; font-weight:600; font-style:italic;">No projects recorded for this customer.</p>' : `
                    <div class="table-wrap">
                        <table>
                            <tr>
                                <th>Project Name</th>
                                <th>Category</th>
                                <th>Status</th>
                                <th>Date Started</th>
                                <th class="text-right">Value (₹)</th>
                            </tr>
                            ${detail.projects.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((p: any) => `
                            <tr>
                                <td>
                                    <div style="font-weight: 800; color: #1a2f1a; margin-bottom: 2px;">${p.model_name}</div>
                                    <div style="font-size: 10px; color: #94a3b8; font-weight: 800; text-transform: uppercase;">ID: ${p.display_id || p.id.split('-')[0]}</div>
                                </td>
                                <td>${p.category} ${p.sub_category ? `> ${p.sub_category}` : ''}</td>
                                <td><span class="badge badge-status">${p.status}</span></td>
                                <td>${p.start_date ? new Date(p.start_date).toLocaleDateString("en-IN") : "—"}</td>
                                <td class="text-right" style="font-weight: 800; color: #1a2f1a;">${p.final_project_value ? `₹${p.final_project_value.toLocaleString("en-IN")}` : "—"}</td>
                            </tr>
                            `).join('')}
                        </table>
                    </div>
                    `}
                    
                    <!-- Financial Summary Box -->
                    <div style="display: flex; justify-content: flex-end;">
                        <div class="summary-box">
                            <div class="summary-row">
                                <span>Total Lifetime Value</span>
                                <span>₹${totalValue.toLocaleString("en-IN")}</span>
                            </div>
                            <div class="summary-row summary-total" style="${outstanding > 0 ? 'color: #e11d48;' : 'color: #047857;'}">
                                <span>Outstanding Due</span>
                                <span>₹${outstanding.toLocaleString("en-IN")}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="footer">
                        This is an automatically generated document from the SSM ERP system.<br>
                        Thank you for your business!
                    </div>
                    
                    <script>
                        setTimeout(() => {
                            window.print();
                        }, 800);
                    </script>
                </body>
            </html>
        `;
        win.document.write(html);
        win.document.close();
    };

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

            {/* Master / Detail Switch */}
            {!detail ? (
                <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-black text-forest uppercase">Customers</h1>
                            <p className="text-slate/60 mt-1">{customers.length} total customers</p>
                        </div>
                        <button onClick={openNew} className="flex items-center gap-2 bg-forest text-mint px-5 py-3 rounded-2xl font-bold hover:bg-forest/90 transition-all shadow-lg">
                            <Plus size={18} /> Add Customer
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 mb-6">
                        <div className="relative flex-1">
                            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate/40" />
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or phone..." className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-forest/10 text-forest font-medium focus:outline-none focus:border-forest/40 transition" />
                        </div>
                        <div className="flex items-center gap-1 bg-white border border-forest/10 rounded-2xl p-1.5">
                            <ArrowUpDown size={14} className="text-slate/40 mx-2" />
                            {(["date", "name", "amount"] as const).map(s => (
                                <button key={s} onClick={() => setSortBy(s)}
                                    className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-xl transition ${sortBy === s ? "bg-forest text-mint" : "text-slate/50 hover:bg-forest/5"
                                        }`}>
                                    {s === "date" ? "Latest" : s === "name" ? "Name" : "Amount"}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {filtered.length === 0 ? (
                            <div className="col-span-full py-16 text-center text-slate/40">
                                <Users size={40} className="mx-auto mb-3 opacity-30" />
                                <p className="font-bold">No customers found</p>
                            </div>
                        ) : filtered.map(c => {
                            const projects = c.projects || [];
                            const activeProjects = projects.filter((p: any) => p.status === "In Progress").length;
                            const outstanding = calcOutstanding(c);
                            return (
                                <motion.div key={c.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                    className="bg-white p-5 rounded-3xl border border-forest/5 shadow-sm hover:shadow-md hover:border-forest/20 transition-all cursor-pointer group flex flex-col gap-4 relative overflow-hidden"
                                    onClick={() => updateDetail(c)}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-black text-forest text-lg truncate group-hover:text-emerald-700 transition-colors">{c.name}</h3>
                                                {c.display_id && (
                                                    <span className="shrink-0 bg-forest/5 text-forest/70 font-black text-[9px] px-2 py-0.5 rounded border border-forest/10 uppercase tracking-wider">
                                                        {c.display_id}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {c.phone_number && (
                                                    <a href={`tel:${c.phone_number}`} onClick={e => e.stopPropagation()} className="flex items-center gap-1 text-[11px] font-bold text-slate/40 hover:text-forest transition">
                                                        <Phone size={10} /> {c.phone_number}
                                                    </a>
                                                )}
                                                {c.whatsapp_number && (
                                                    <a href={`https://wa.me/${c.whatsapp_number.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="flex items-center gap-1 text-[11px] font-bold text-emerald-600/60 hover:text-emerald-600 transition">
                                                        <MessageSquare size={10} /> WhatsApp
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <button onClick={e => { e.stopPropagation(); openEdit(c); }} className="p-2 text-forest/50 hover:bg-forest/10 rounded-xl transition"><Edit2 size={15} /></button>
                                            <button onClick={e => { e.stopPropagation(); setConfirm({ id: c.id, name: c.name }); }} className="p-2 text-rose-400 hover:bg-rose-50 rounded-xl transition"><Trash2 size={15} /></button>
                                        </div>
                                    </div>
                                    {c.address && <p className="text-xs text-slate/50 leading-relaxed line-clamp-2">{c.address}</p>}
                                    <div className="flex gap-3 pt-2 border-t border-forest/5">
                                        <div className="flex-1 text-center">
                                            <p className="text-xl font-black text-forest">{projects.length}</p>
                                            <p className="text-[10px] text-slate/40 font-semibold uppercase tracking-widest">Projects</p>
                                        </div>
                                        <div className="flex-1 text-center border-x border-forest/5">
                                            <p className="text-xl font-black text-amber-600">{activeProjects}</p>
                                            <p className="text-[10px] text-slate/40 font-semibold uppercase tracking-widest">Active</p>
                                        </div>
                                        <div className="flex-1 text-center">
                                            <p className="text-xl font-black text-rose-600">₹{outstanding.toLocaleString("en-IN")}</p>
                                            <p className="text-[10px] text-slate/40 font-semibold uppercase tracking-widest">Due</p>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            ) : (
                <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-4">
                            <button onClick={() => updateDetail(null)} className="p-3 bg-white rounded-2xl border border-forest/10 hover:border-forest/20 text-forest transition shadow-sm">
                                <ChevronLeft size={20} />
                            </button>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-3xl font-black text-forest uppercase tracking-wide">{detail.name}</h1>
                                    {detail.display_id && <span className="bg-forest/5 text-forest/70 font-black text-xs px-2.5 py-1 rounded-lg border border-forest/10">{detail.display_id}</span>}
                                </div>
                                <p className="text-slate/50 font-medium mt-1">{detail.address || "No address provided"}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={printCustomerSummary} className="p-2.5 bg-forest/5 text-forest hover:bg-forest/10 rounded-xl transition shadow-sm" title="Print Customer Report">
                                <Printer size={18} />
                            </button>
                            <button onClick={() => openEdit(detail)} className="flex items-center gap-2 bg-white border border-forest/10 text-forest px-4 py-2.5 rounded-xl font-bold hover:bg-forest/5 transition shadow-sm">
                                <Edit2 size={16} /> Edit Profile
                            </button>
                            <Link href={`/admin/erp/projects?new=true&customerId=${detail.id}`} className="flex items-center gap-2 bg-forest text-mint px-5 py-2.5 rounded-xl font-bold hover:bg-forest/90 transition shadow-md">
                                <Plus size={16} /> New Project
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* LEFT COLUMN: Contact & Financials */}
                        <div className="flex flex-col gap-6">
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-forest/5 flex flex-col gap-4">
                                <h3 className="text-xs font-black uppercase text-forest/50 tracking-widest border-b border-forest/5 pb-3">Contact Details</h3>
                                <div className="flex flex-col gap-3">
                                    {detail.phone_number ? (
                                        <a href={`tel:${detail.phone_number}`} className="flex items-center justify-between group outline-none rounded-xl hover:bg-forest/5 p-2 -mx-2 transition">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-forest/5 text-forest flex items-center justify-center group-hover:bg-forest/10 transition"><Phone size={14} /></div>
                                                <span className="font-bold text-forest">{detail.phone_number}</span>
                                            </div>
                                            <span className="text-[10px] uppercase font-bold text-forest/40 opacity-0 group-hover:opacity-100 transition px-2">Call</span>
                                        </a>
                                    ) : <p className="text-sm text-slate-400 italic">No mobile number</p>}
                                    
                                    {detail.whatsapp_number ? (
                                        <a href={`https://wa.me/${detail.whatsapp_number.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between group outline-none rounded-xl hover:bg-emerald-50 p-2 -mx-2 transition">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-100 transition"><MessageSquare size={14} /></div>
                                                <span className="font-bold text-emerald-700">{detail.whatsapp_number}</span>
                                            </div>
                                            <span className="text-[10px] uppercase font-bold text-emerald-600/50 opacity-0 group-hover:opacity-100 transition px-2">Chat</span>
                                        </a>
                                    ) : <p className="text-sm text-slate-400 italic">No WhatsApp number</p>}
                                </div>
                            </div>

                            <div className="bg-forest/5 rounded-3xl p-6 shadow-none">
                                <h3 className="text-xs font-black uppercase text-forest/60 tracking-widest border-b border-forest/10 pb-3 mb-5">Financial Overview</h3>
                                <div className="flex flex-col gap-4">
                                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-forest/5">
                                        <p className="text-2xl font-black text-forest">₹{((detail.projects || []).reduce((s: number, p: any) => s + (p.final_project_value || 0), 0)).toLocaleString("en-IN")}</p>
                                        <p className="text-[10px] text-slate/40 font-bold uppercase tracking-widest mt-1">Total Lifetime Value</p>
                                    </div>
                                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-rose-100 relative overflow-hidden">
                                        <div className="absolute right-0 top-0 w-24 h-24 bg-rose-50 rounded-full blur-2xl -mr-6 -mt-6"></div>
                                        <p className="text-2xl font-black text-rose-600 relative z-10">₹{calcOutstanding(detail).toLocaleString("en-IN")}</p>
                                        <p className="text-[10px] text-rose-400 font-bold uppercase tracking-widest mt-1 relative z-10">Total Outstanding Due</p>
                                    </div>
                                </div>
                            </div>

                            {detail.notes && (
                                <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100/50">
                                    <h3 className="text-xs font-black uppercase text-amber-700/60 tracking-widest border-b border-amber-200/50 pb-3 mb-4">Customer Notes</h3>
                                    <p className="text-sm text-amber-900 leading-relaxed font-medium whitespace-pre-wrap">{detail.notes}</p>
                                </div>
                            )}
                        </div>

                        {/* RIGHT COLUMN: Rich Project History */}
                        <div className="lg:col-span-2">
                            <h3 className="text-lg font-black uppercase text-forest tracking-wide mb-6 flex items-center gap-2">
                                <Briefcase size={20} className="text-forest/50" /> Project History
                                <span className="text-xs bg-forest/10 text-forest px-2.5 py-1 rounded-full font-bold ml-2">{(detail.projects || []).length}</span>
                            </h3>
                            
                            <div className="flex flex-col gap-4">
                                {(detail.projects || []).length === 0 ? (
                                    <div className="bg-white rounded-3xl p-12 shadow-sm border border-forest/5 text-center flex flex-col items-center">
                                        <div className="w-16 h-16 bg-forest/5 rounded-full flex items-center justify-center mb-4 text-forest/30">
                                            <Briefcase size={32} />
                                        </div>
                                        <p className="font-bold text-forest text-lg mb-1">No Projects Yet</p>
                                        <p className="text-slate-400 text-sm">Start by creating a new entry for this customer.</p>
                                        <Link href={`/admin/erp/projects?new=true&customerId=${detail.id}`} className="mt-6 px-6 py-2.5 bg-forest text-mint font-bold rounded-xl hover:bg-forest/90 transition shadow-md">
                                            Create First Project
                                        </Link>
                                    </div>
                                ) : (detail.projects || []).map((p: any) => (
                                    <Link key={p.id} href={`/admin/erp/projects?id=${p.id}`}
                                        className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-forest/5 flex flex-col sm:flex-row gap-6 hover:shadow-lg hover:-translate-y-0.5 hover:border-forest/20 transition-all group">
                                        
                                        <div className="flex-1 flex flex-col justify-center">
                                            <div className="flex items-center gap-2 mb-2">
                                                {p.display_id && <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded border border-slate-200">{p.display_id}</span>}
                                                <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${
                                                    p.status === "In Progress" ? "bg-amber-100 text-amber-700" :
                                                    p.status === "Completed" ? "bg-emerald-100 text-emerald-700" :
                                                    p.status === "Delivered" ? "bg-purple-100 text-purple-700" :
                                                    "bg-slate-100 text-slate-600"
                                                }`}>{p.status}</span>
                                            </div>
                                            
                                            <h4 className="text-xl font-black text-forest group-hover:text-emerald-700 transition-colors mb-4">{p.model_name}</h4>
                                            
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 gap-y-5">
                                                <div>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Category</p>
                                                    <p className="text-sm font-bold text-forest line-clamp-1">{p.category || "—"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Sub Category</p>
                                                    <p className="text-sm font-bold text-forest line-clamp-1">{p.sub_category || "—"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Quality</p>
                                                    <p className="text-sm font-bold text-forest">{p.quality_type || "—"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Weight / Size</p>
                                                    <p className="text-sm font-bold text-forest">{p.estimated_weight_size ? `${p.estimated_weight_size} ${p.category?.includes("Steel") || p.category?.includes("Iron") ? "kg" : "sqft"}` : "—"}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-4 mt-6 pt-5 border-t border-forest/5">
                                                {p.start_date && (
                                                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                                                        <CalendarRange size={13} />
                                                        Started: {new Date(p.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                                    </div>
                                                )}
                                                {p.delivery_date && (
                                                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-600/70">
                                                        <CalendarRange size={13} />
                                                        Expected: {new Date(p.delivery_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="sm:w-48 shrink-0 flex flex-col justify-center items-start sm:items-end sm:border-l border-forest/5 sm:pl-6">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Final Project Value</p>
                                            <p className="text-2xl font-black text-forest mb-6">₹{p.final_project_value?.toLocaleString("en-IN") || "0"}</p>
                                            
                                            <div className="text-right w-full">
                                                <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-widest mb-1 group-hover:text-forest transition-colors">Calculated Cost</p>
                                                <p className="text-sm font-bold text-slate-600 group-hover:text-forest transition-colors">₹{p.estimated_cost?.toLocaleString("en-IN") || "0"}</p>
                                                {p.rate_per_unit && p.estimated_weight_size && (
                                                    <p className="text-[9px] text-slate-400/70 font-bold mt-1">₹{p.rate_per_unit} × {p.estimated_weight_size}</p>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {editing && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditing(null)} className="absolute inset-0 bg-forest/50 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative z-10 overflow-hidden">
                            <div className="p-6 border-b border-forest/5 flex items-center justify-between">
                                <h2 className="text-xl font-black text-forest">{editing.id ? "Edit Customer" : "New Customer"}</h2>
                                <button onClick={() => setEditing(null)} className="p-2 hover:bg-forest/5 rounded-full"><X size={18} /></button>
                            </div>
                            <div className="p-6 grid grid-cols-2 gap-4">
                                {[{ label: "Full Name*", key: "name", span: 2, placeholder: "Customer Name" },
                                { label: "Phone (10-digit)*", key: "phone_number", placeholder: "e.g. 9876543210" },
                                { label: "WhatsApp (10-digit)", key: "whatsapp_number", placeholder: "e.g. 9876543210" },
                                { label: "Address", key: "address", span: 2, placeholder: "Full address for deliveries..." },
                                { label: "Notes", key: "notes", span: 2, placeholder: "Special instructions or preferences..." },
                                ].map(f => {
                                    const isPhone = f.key === "phone_number" || f.key === "whatsapp_number";
                                    const isLocked = (f.key === "whatsapp_number" && isWhatsappSame);
                                    
                                    return (
                                        <div key={f.key} className={`flex flex-col gap-1.5 ${f.span === 2 ? "col-span-2" : ""}`}>
                                            <div className="flex items-center justify-between">
                                                <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest">{f.label}</label>
                                                {f.key === "whatsapp_number" && (
                                                    <button 
                                                        onClick={() => {
                                                            const next = !isWhatsappSame;
                                                            setIsWhatsappSame(next);
                                                            if (next) setEditing({ ...editing, whatsapp_number: editing.phone_number });
                                                        }}
                                                        className={`text-[9px] font-black uppercase tracking-tight flex items-center gap-1.5 transition ${isWhatsappSame ? "text-forest" : "text-slate-400 hover:text-forest"}`}
                                                    >
                                                        <div className={`w-3 h-3 rounded border flex items-center justify-center ${isWhatsappSame ? "bg-forest border-forest text-white" : "border-slate-300"}`}>
                                                            {isWhatsappSame && <CheckCircle size={8} />}
                                                        </div>
                                                        Same as Phone
                                                    </button>
                                                )}
                                            </div>
                                            <input
                                                type={isPhone ? "tel" : "text"}
                                                value={editing[f.key] || ""}
                                                onKeyDown={isPhone ? e => {
                                                    const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'];
                                                    if (!/[\d]/.test(e.key) && !allowed.includes(e.key)) e.preventDefault();
                                                    if ((editing[f.key] || "").length >= 10 && !allowed.includes(e.key)) e.preventDefault();
                                                } : undefined}
                                                onChange={e => {
                                                    let val = e.target.value;
                                                    if (isPhone) val = val.replace(/\D/g, "").slice(0, 10);
                                                    setEditing({ ...editing, [f.key]: val });
                                                    if (f.key === "whatsapp_number" && val !== editing.phone_number) setIsWhatsappSame(false);
                                                }}
                                                disabled={isLocked}
                                                className={`bg-forest/[0.03] rounded-xl p-3.5 text-forest font-bold text-sm border-2 border-transparent focus:border-forest/10 focus:bg-white transition outline-none ${isLocked ? "opacity-60 cursor-not-allowed" : ""}`}
                                                placeholder={f.placeholder} />
                                        </div>
                                    );
                                })}
                                
                                {duplicateCustomer && !editing.id && (
                                    <div className="col-span-2 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex flex-col gap-3">
                                        <div className="flex items-center gap-2 text-rose-600">
                                            <AlertCircle size={16} />
                                            <span className="text-xs font-black uppercase tracking-wide">Duplicate Found</span>
                                        </div>
                                        <p className="text-[11px] text-rose-500 font-medium leading-relaxed">
                                            <span className="font-black text-rose-700">{duplicateCustomer.name}</span> is already registered with this details.
                                        </p>
                                        <button 
                                            onClick={() => {
                                                const id = duplicateCustomer.id;
                                                setEditing(null);
                                                updateDetail(duplicateCustomer);
                                            }}
                                            className="w-full bg-rose-600 text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition shadow-sm flex items-center justify-center gap-2"
                                        >
                                            <ExternalLink size={12} /> View Existing Customer
                                        </button>
                                    </div>
                                )}
                                <div className="col-span-2 flex gap-3 pt-2">
                                    <button onClick={handleSave} disabled={isSaving} className="flex-1 bg-forest text-mint py-3 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-forest/90 transition-all">
                                        {isSaving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                                        {isSaving ? "Saving..." : "Save Customer"}
                                    </button>
                                    <button onClick={() => setEditing(null)} className="px-6 border-2 border-forest/10 text-forest rounded-2xl font-bold">Cancel</button>
                                </div>
                            </div>
                        </motion.div>
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
                                <h3 className="font-black text-forest text-lg">Delete Customer?</h3>
                                <p className="text-slate/60 text-sm mt-1">{confirm.name} and all related projects will be removed.</p>
                            </div>
                            <div className="flex gap-3 w-full">
                                <button onClick={() => setConfirm(null)} className="flex-1 py-3 border-2 border-forest/10 text-forest rounded-2xl font-bold">Cancel</button>
                                <button onClick={() => handleDelete(confirm.id)} className="flex-1 py-3 bg-rose-500 text-white rounded-2xl font-bold hover:bg-rose-600 transition-all">Delete</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
