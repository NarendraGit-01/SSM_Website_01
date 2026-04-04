"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Search, X, Save, RefreshCw, Briefcase, CheckCircle, AlertCircle, CheckSquare, Square, Upload, FileText, Ruler, Camera, ExternalLink, Printer, Hash, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { saveProject, deleteProject, updateProjectStage, uploadERPFile, getERPCategories, getERPSubCategories, saveTransaction, deleteProjectPhoto, deleteTransaction, getCustomers } from "../actions";
import { supabase } from "@/lib/supabase";
import DateInput from "@/components/ui/DateInput";

type Toast = { type: "success" | "error"; message: string } | null;

const STATUSES = ["Not Started", "In Progress", "On Hold", "Completed", "Cancelled"];
const STATUS_COLORS: Record<string, string> = {
    "Not Started": "bg-slate/10 text-slate/60",
    "In Progress": "bg-blue-100 text-blue-700",
    "On Hold": "bg-amber-100 text-amber-700",
    "Completed": "bg-emerald-100 text-emerald-700",
    "Cancelled": "bg-rose-100 text-rose-700",
};

function calcBalance(project: any) {
    const txns = project.transactions || [];
    const paid = txns.filter((t: any) => t.type !== "Refund").reduce((s: number, t: any) => s + (t.amount || 0), 0);
    const refunded = txns.filter((t: any) => t.type === "Refund").reduce((s: number, t: any) => s + (t.amount || 0), 0);
    const projectTotal = parseFloat(project.actual_project_value) || project.final_project_value || 0;
    return { paid, refunded, balance: projectTotal - paid + refunded };
}

export default function ProjectsClient({ initialProjects, customers, workers }: { initialProjects: any[], customers: any[], workers: any[] }) {
    const [projects, setProjects] = useState(initialProjects);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [editing, setEditing] = useState<any | null>(null);
    const [detail, setDetail] = useState<any | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isPaying, setIsPaying] = useState(false);
    const [toast, setToast] = useState<Toast>(null);
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [newPayment, setNewPayment] = useState<any>({ amount: "", payment_mode: "Cash", transaction_date: new Date().toISOString().split('T')[0], notes: "" });
    const [confirmAction, setConfirmAction] = useState<{ title: string; message: string; onConfirm: () => void; type: "danger" | "warning" } | null>(null);
    
    // Filtering logic for the main list
    const filtered = projects.filter(p => {
        const matchesSearch = p.project_name?.toLowerCase().includes(search.toLowerCase()) || 
                             p.model_name?.toLowerCase().includes(search.toLowerCase()) ||
                             p.customers?.name?.toLowerCase().includes(search.toLowerCase()) ||
                             p.id?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "All" || p.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const filteredProjects = filtered; // Simplified to use the same logic if they were different
    const [selectedPhotos, setSelectedPhotos] = useState<{ file: File, preview: string }[]>([]);
    const photoInputRef = useState<HTMLInputElement | null>(null);
    
    // Remote states for sync
    const [allCustomers, setAllCustomers] = useState(customers);

    const [dynamicCategories, setDynamicCategories] = useState<string[]>([]);
    const [dynamicSubCategories, setDynamicSubCategories] = useState<{ category: string; subCategory: string }[]>([]);

    useEffect(() => {
        async function loadCats() {
            const [c, sc] = await Promise.all([getERPCategories(), getERPSubCategories()]);
            setDynamicCategories(c || []);
            setDynamicSubCategories(sc || []);
        }
        loadCats();
    }, []);

    // Filter sub-categories based on selected category in editing modal
    const filteredSubCats = dynamicSubCategories.filter(s => s.category === editing?.category);

    const searchParams = useSearchParams();
    const router = useRouter();

    // Deep linking: Open project if ID is in URL
    useEffect(() => {
        const id = searchParams.get("id");
        if (id && !detail) {
            const p = initialProjects.find(p => p.id === id);
            if (p) {
                setDetail(p);
                // Clean URL
                router.replace("/admin/erp/projects", { scroll: false });
            }
        }
    }, [searchParams, detail, initialProjects, router]);
    useEffect(() => {
        const isNew = searchParams.get("new") === "true";
        const cid = searchParams.get("customerId");
        if (isNew && cid) {
            setEditing({
                customer_id: cid, category: dynamicCategories[0] || "Steel", sub_category: "", model_name: "", start_date: "", delivery_date: "",
                status: "Not Started", estimated_weight_size: 0, actual_weight_size: null, rate_per_unit: 0,
                negotiated_price: 0, final_project_value: 0, actual_project_value: null, worker_id: "", notes: ""
            });
            // Clean up URL
            const nextParams = new URLSearchParams(searchParams.toString());
            nextParams.delete("new");
            nextParams.delete("customerId");
            router.replace(`?${nextParams.toString()}`);
        }
    }, [searchParams, dynamicCategories, router]);

    // Focus Listener: Refresh customers when tab is focused (handles multi-tab sync)
    useEffect(() => {
        const handleFocus = async () => {
            const latest = await getCustomers();
            if (latest.length > 0) setAllCustomers(latest);
        };
        window.addEventListener("focus", handleFocus);
        return () => window.removeEventListener("focus", handleFocus);
    }, []);

    // Manual Refresh Support
    const refreshCustomers = async () => {
        const latest = await getCustomers();
        setAllCustomers(latest);
    };

    const showToast = (type: "success" | "error", message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3500);
    };

    const updateEditing = (updates: any) => {
        setEditing((prev: any) => {
            const next = { ...prev, ...updates };
            
            // Auto-calc Est. Project Value
            if ('rate_per_unit' in updates || 'estimated_weight_size' in updates) {
                const r = parseFloat(String(next.rate_per_unit).replace(/,/g, '')) || 0;
                const w = parseFloat(String(next.estimated_weight_size).replace(/,/g, '')) || 0;
                next.final_project_value = Math.round(r * w);
            }
            
            // Auto-calc Actual Project Value
            if ('rate_per_unit' in updates || 'actual_weight_size' in updates) {
                const r = parseFloat(String(next.rate_per_unit).replace(/,/g, '')) || 0;
                const w = parseFloat(String(next.actual_weight_size).replace(/,/g, '')) || 0;
                next.actual_project_value = Math.round(r * w);
            }
            
            return next;
        });
    };

    const openNew = () => {
        refreshCustomers(); // Quick refresh when opening form
        setEditing({
            customer_id: "", category: dynamicCategories[0] || "Steel", sub_category: "", model_name: "", start_date: "", delivery_date: "",
            status: "Not Started", estimated_weight_size: 0, actual_weight_size: null, rate_per_unit: 0,
            negotiated_price: 0, final_project_value: 0, actual_project_value: null, worker_id: "", notes: ""
        });
    };

    const handleSave = async () => {
        if (!editing.customer_id || !editing.model_name || !editing.category) { showToast("error", "Customer, category, and model name are required."); return; }
        
        // Date Validation
        if (editing.start_date && editing.delivery_date) {
            if (new Date(editing.delivery_date) < new Date(editing.start_date)) {
                showToast("error", "Delivery date cannot be before start date.");
                return;
            }
        }

        setIsSaving(true);

        const projPayload = {
            ...editing,
            sub_category: editing.sub_category || editing.category
        };

        const res = await saveProject(projPayload);
        if (res.success) {
            const newProjectId = res.data.id;
            
            // Upload Photos if any
            if (selectedPhotos.length > 0) {
                for (const p of selectedPhotos) {
                    const formData = new FormData();
                    formData.append("file", p.file);
                    const uploadRes = await uploadERPFile(formData, "ssm-project-assets");
                    if (uploadRes.success) {
                        await supabase.from("project_photos").insert({ project_id: newProjectId, url: uploadRes.data });
                    }
                }
                selectedPhotos.forEach(p => URL.revokeObjectURL(p.preview));
                setSelectedPhotos([]);
            }

            showToast("success", editing.id ? "Project updated!" : "Project created!");
            const customer = customers.find(c => c.id === editing.customer_id);
            const worker = workers.find(w => w.id === editing.worker_id);
            
            // Refetch to get full object with relations if needed, or build manually
            const { data: finalProj } = await supabase.from("projects").select("*, customers(*), workers(*), transactions(*), project_stages(*), project_photos(*)").eq("id", newProjectId).single();
            
            setProjects((prev: any) => editing.id ? prev.map((p: any) => p.id === newProjectId ? finalProj : p) : [finalProj, ...prev]);
            setEditing(null);
        } else showToast("error", res.error || "Save failed");
        setIsSaving(false);
    };

    const handleDelete = async (id: string) => {
        const res = await deleteProject(id);
        if (res.success) {
            setProjects((prev: any) => prev.filter((p: any) => p.id !== id));
            showToast("success", "Project deleted.");
            setConfirmAction(null);
        } else showToast("error", res.error || "Delete failed");
    };

    const toggleStage = async (stage: any) => {
        const res = await updateProjectStage(stage.id, !stage.completed);
        if (res.success && detail) {
            const newStages = detail.project_stages.map((s: any) => s.id === stage.id ? { ...s, completed: !s.completed } : s);
            const newDetail = { ...detail, project_stages: newStages };
            setDetail(newDetail);
            setProjects((prev: any) => prev.map((p: any) => p.id === detail.id ? { ...p, project_stages: newStages } : p));
        }
    };

    const handleDeletePhoto = async (photo: any) => {
        setConfirmAction({
            title: "Delete Photo?",
            message: "This will permanently remove the image from storage.",
            type: "danger",
            onConfirm: async () => {
                const res = await deleteProjectPhoto(photo.id, photo.url);
                if (res.success) {
                    const updatedPhotos = (detail.project_photos || []).filter((p: any) => p.id !== photo.id);
                    setDetail({ ...detail, project_photos: updatedPhotos });
                    setProjects((prev: any) => prev.map((p: any) => p.id === detail.id ? { ...p, project_photos: updatedPhotos } : p));
                    showToast("success", "Photo deleted");
                } else showToast("error", "Failed to delete photo");
            }
        });
    };

    const handleAddPayment = async () => {
        if (!newPayment.amount || parseFloat(newPayment.amount) <= 0) return showToast("error", "Enter valid amount");
        setIsPaying(true);
        const res = await saveTransaction({
            ...newPayment,
            project_id: detail.id,
            amount: parseFloat(newPayment.amount),
            type: "Payment",
            notes: newPayment.notes || "Incremental Payment"
        });

        if (res.success) {
            let updatedTxns;
            if (newPayment.id) {
                updatedTxns = detail.transactions.map((t: any) => t.id === res.data.id ? res.data : t);
            } else {
                updatedTxns = [...(detail.transactions || []), res.data];
            }
            const updatedDetail = { ...detail, transactions: updatedTxns };
            setDetail(updatedDetail);
            setProjects((prev: any) => prev.map((p: any) => p.id === detail.id ? { ...p, transactions: updatedTxns } : p));
            setNewPayment({ amount: "", payment_mode: "Cash", transaction_date: new Date().toISOString().split('T')[0], notes: "" });
            setShowPaymentForm(false);
            showToast("success", newPayment.id ? "Payment updated!" : "Payment added!");
        } else showToast("error", "Failed to save payment");
        setIsPaying(false);
    };

    const handleDeleteTransaction = async (txnId: string) => {
        setConfirmAction({
            title: "Delete Payment Entry?",
            message: "This will remove the transaction from the ledger and update the balance.",
            type: "danger",
            onConfirm: async () => {
                const res = await deleteTransaction(txnId);
                if (res.success) {
                    const updatedTxns = (detail.transactions || []).filter((t: any) => t.id !== txnId);
                    const updatedDetail = { ...detail, transactions: updatedTxns };
                    setDetail(updatedDetail);
                    setProjects((prev: any) => prev.map((p: any) => p.id === detail.id ? { ...p, transactions: updatedTxns } : p));
                    showToast("success", "Transaction deleted");
                } else showToast("error", "Failed to delete transaction");
            }
        });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const file = e.target.files?.[0];
        if (!file || !detail) return;
        setIsSaving(true);
        const formData = new FormData();
        formData.append("file", file);
        const res = await uploadERPFile(formData, "docs");
        if (res.success) {
            const updatedProject = { ...detail, [field]: res.data };
            const saveRes = await saveProject(updatedProject);
            if (saveRes.success) {
                setDetail(updatedProject);
                setProjects(prev => prev.map(p => p.id === detail.id ? updatedProject : p));
                showToast("success", "File uploaded and project updated!");
            } else showToast("error", "File uploaded but project update failed");
        } else showToast("error", res.error || "Upload failed");
        setIsSaving(false);
    };

    const printSummary = () => {
        if (!detail) return;
        const win = window.open("", "_blank");
        if (!win) return;
        const balanceInfo = calcBalance(detail);
        
        const val = parseFloat(detail.actual_project_value) || detail.final_project_value || 0;
        
        const html = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Project Report - ${detail.display_id || detail.model_name}</title>
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
                        
                        /* Layout */
                        .row { display: flex; gap: 30px; margin-bottom: 30px; }
                        .col { flex: 1; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; background: #f8fafc; }
                        .section-title { font-size: 12px; font-weight: 900; text-transform: uppercase; color: #1a2f1a; letter-spacing: 1px; margin-bottom: 15px; border-bottom: 2px solid #e1fee1; padding-bottom: 5px; display: inline-block; }
                        
                        /* Info Grid */
                        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 20px; }
                        .info-item label { display: block; font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px; }
                        .info-item span { display: block; font-size: 14px; font-weight: 600; color: #0f172a; margin-top: 3px; }
                        
                        /* Main Spec Table */
                        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
                        th { background: #1a2f1a; color: #fff; text-align: left; padding: 12px 15px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
                        td { padding: 14px 15px; border-bottom: 1px solid #e2e8f0; font-size: 14px; font-weight: 600; color: #334155; }
                        th.text-right, td.text-right { text-align: right; }
                        tr:last-child td { border-bottom: none; }
                        .table-wrap { border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; margin-bottom: 30px; }
                        .table-wrap table { margin-bottom: 0; border: none; }
                        
                        /* Summary Box */
                        .summary-box { border: 2px solid #1a2f1a; border-radius: 12px; width: 350px; margin-left: auto; padding: 20px; background: #fff; }
                        .summary-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dashed #cbd5e1; font-size: 14px; font-weight: 600; color: #334155; }
                        .summary-row:last-child { border-bottom: none; padding-bottom: 0; }
                        .summary-total { font-size: 18px; font-weight: 900; color: #1a2f1a; border-bottom: none; margin-top: 10px; padding-top: 15px; border-top: 2px solid #1a2f1a; }
                        
                        /* Badges */
                        .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: 800; text-transform: uppercase; background: #f1f5f9; color: #475569; }
                        .badge-adv { background: #e1fee1; color: #059669; }
                        .badge-ref { background: #ffe4e6; color: #e11d48; }

                        /* Footer */
                        .footer { margin-top: 60px; text-align: center; color: #94a3b8; font-size: 12px; font-weight: 600; border-top: 2px solid #f1f5f9; padding-top: 25px; }
                        
                        @media print {
                            body { padding: 0; }
                            .col { background: #f8fafc !important; -webkit-print-color-adjust: exact; }
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
                            <h2>PROJECT SUMMARY</h2>
                            <p><strong>Date:</strong> ${new Date().toLocaleDateString("en-IN")}</p>
                            ${detail.display_id ? `<p><strong>Project ID:</strong> ${detail.display_id}</p>` : ''}
                            <p><strong>Status:</strong> ${detail.status}</p>
                        </div>
                    </div>
                    
                    <!-- Customer Section -->
                    <div class="section-title">Customer Details</div>
                    <div class="info-grid" style="grid-template-columns: 1fr; margin-bottom: 30px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px;">
                        <div class="info-item" style="background: transparent; border: none; padding: 0;">
                            <span style="color:#1a2f1a; font-size: 15px; font-weight: 900; display: block; margin-bottom: 8px;">Name: ${detail.customers?.name || "—"} ${detail.customers?.display_id ? `(${detail.customers.display_id})` : ""}</span>
                            <div style="display: flex; flex-direction: column; gap: 4px;">
                                ${detail.customers?.phone_number ? `<p style="margin: 0; font-size: 13px; font-weight: 600;"><strong>Phone:</strong> ${detail.customers.phone_number}</p>` : ''}
                                <p style="margin: 4px 0 0; font-size: 13px; color: #334155; line-height: 1.5; font-weight: 600;"><strong>Address:</strong> ${detail.customers?.address || "—"}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Project Overview -->
                    <div class="section-title">Project Overview</div>
                    <div class="info-grid" style="margin-bottom: 30px; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; background: #f8fafc;">
                        <div class="info-item" style="grid-column: 1 / -1;"><label>Product / Model</label><span style="font-size: 16px; color:#1a2f1a; font-weight:900;">${detail.model_name}</span></div>
                        <div class="info-item"><label>Category</label><span>${detail.category}</span></div>
                        <div class="info-item"><label>Sub Category</label><span>${detail.sub_category || "—"}</span></div>
                        <div class="info-item"><label>Start Date</label><span>${detail.start_date ? new Date(detail.start_date).toLocaleDateString("en-IN") : "—"}</span></div>
                        <div class="info-item"><label>Expected Delivery</label><span>${detail.delivery_date ? new Date(detail.delivery_date).toLocaleDateString("en-IN") : "—"}</span></div>
                        <div class="info-item"><label>Assigned Worker</label><span>${detail.workers?.name || "—"}</span></div>
                    </div>

                    <!-- Technical Specs -->
                    <div class="section-title">Technical Specifications & Costing</div>
                    <div class="table-wrap">
                        <table>
                            <tr>
                                <th>Quality Type</th>
                                <th class="text-right">Rate / Unit</th>
                                <th class="text-right">Weight / Size</th>
                                <th class="text-right">Total Base Amount</th>
                            </tr>
                            <tr>
                                <td>${detail.quality_type || "Standard"}</td>
                                <td class="text-right">${detail.rate_per_unit ? `₹${detail.rate_per_unit}` : "—"}</td>
                                <td class="text-right">${detail.actual_weight_size ? `${detail.actual_weight_size} (Actual)` : (detail.estimated_weight_size ? `${detail.estimated_weight_size} (Est.)` : "—")}</td>
                                <td class="text-right"><strong style="font-size: 16px; color: #1a2f1a;">₹${val.toLocaleString("en-IN")}</strong></td>
                            </tr>
                        </table>
                    </div>
                    
                    <!-- Ledger & Financials -->
                    <div style="display: flex; justify-content: space-between; gap: 30px; margin-bottom: 20px;">
                        <!-- Payment Ledger -->
                        <div style="flex: 1;">
                            <div class="section-title">Payment Ledger</div>
                            ${(!detail.transactions || detail.transactions.length === 0) ? '<p style="font-size: 13px; color: #94a3b8; font-weight:600; font-style:italic;">No payments recorded yet.</p>' : `
                            <div class="table-wrap">
                                <table>
                                    <tr>
                                        <th>Date</th>
                                        <th>Mode</th>
                                        <th class="text-right">Amount</th>
                                    </tr>
                                    ${detail.transactions.sort((a: any, b: any) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()).map((t: any) => `
                                    <tr>
                                        <td>${new Date(t.transaction_date).toLocaleDateString("en-IN")} ${t.notes === "Initial Advance Payment" ? '<span class="badge badge-adv">Advance</span>' : ''}</td>
                                        <td>${t.payment_mode} ${t.type === "Refund" ? '<span class="badge badge-ref">Refund</span>' : ''}</td>
                                        <td class="text-right" style="font-weight: 800; ${t.type === "Refund" ? 'color:#e11d48;' : 'color:#047857;'}">${t.type === "Refund" ? '-' : ''}₹${t.amount.toLocaleString("en-IN")}</td>
                                    </tr>
                                    `).join('')}
                                </table>
                            </div>
                            `}
                        </div>
                        
                        <!-- Summary Box -->
                        <div>
                            <div class="summary-box">
                                <div class="summary-row">
                                    <span>Total Project Value</span>
                                    <span>₹${val.toLocaleString("en-IN")}</span>
                                </div>
                                <div class="summary-row" style="color: #047857;">
                                    <span>Total Amount Paid</span>
                                    <span>₹${balanceInfo.paid.toLocaleString("en-IN")}</span>
                                </div>
                                ${balanceInfo.refunded > 0 ? `
                                <div class="summary-row" style="color: #e11d48;">
                                    <span>Total Refunded</span>
                                    <span>₹${balanceInfo.refunded.toLocaleString("en-IN")}</span>
                                </div>
                                ` : ''}
                                <div class="summary-row summary-total" style="${balanceInfo.balance > 0 ? 'color: #e11d48;' : 'color: #047857;'}">
                                    <span>Balance Pending</span>
                                    <span>₹${balanceInfo.balance.toLocaleString("en-IN")}</span>
                                </div>
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
        <div className="max-w-7xl mx-auto">
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-forest uppercase">Projects</h1>
                    <p className="text-slate/60 mt-1">{projects.length} total, {projects.filter(p => p.status === "In Progress").length} active</p>
                </div>
                <button onClick={openNew} className="flex items-center gap-2 bg-forest text-mint px-5 py-3 rounded-2xl font-bold hover:bg-forest/90 transition-all shadow-lg">
                    <Plus size={18} /> New Project
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate/40" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by project or customer..." className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-forest/10 text-forest font-medium focus:outline-none focus:border-forest/40 transition" />
                </div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-white rounded-2xl border border-forest/10 px-4 py-3 text-forest font-medium text-sm focus:outline-none">
                    <option value="All">All Statuses</option>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
            </div>

            {/* Projects List */}
            <div className="flex flex-col gap-4">
                {filtered.length === 0 ? (
                    <div className="py-16 text-center text-slate/40 bg-white rounded-3xl">
                        <Briefcase size={40} className="mx-auto mb-3 opacity-30" />
                        <p className="font-bold">No projects found</p>
                    </div>
                ) : filtered.map(p => {
                    const { paid, balance } = calcBalance(p);
                    return (
                        <motion.div key={p.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-3xl p-5 shadow-sm border border-forest/5 hover:border-forest/20 transition-all cursor-pointer"
                            onClick={() => setDetail(p)}>
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${STATUS_COLORS[p.status]}`}>{p.status}</span>
                                        <span className="text-[10px] font-semibold text-slate/40 bg-slate/5 px-2.5 py-1 rounded-full">{p.category}</span>
                                        <span className="text-[9px] font-mono text-slate/40 bg-slate/5 px-1.5 py-0.5 rounded-md border border-slate/10">ID: #{p.display_id || p.id?.slice(0, 8)}</span>
                                    </div>
                                    <h3 className="font-black text-forest text-lg truncate">{p.model_name}</h3>
                                    <div className="text-slate/40 text-xs font-bold mt-1.5 flex items-center gap-2">
                                        <div className="flex items-center gap-1.5 lowercase">
                                            <User size={12} className="text-slate/20" />
                                            {p.customers?.name || "No Customer"}
                                        </div>
                                        {p.customers?.id && (
                                            <span className="text-[9px] font-mono text-slate/30 bg-slate/5 px-1.5 py-0.5 rounded border border-slate/10">
                                                CUST: #{p.customers.id.slice(0, 8)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <div className="text-right mr-2">
                                        <p className="text-lg font-black text-forest">₹{(p.actual_project_value || p.final_project_value || 0).toLocaleString("en-IN")}</p>
                                        <p className={`text-xs font-bold ${balance > 0 ? "text-rose-500" : "text-emerald-600"}`}>
                                            {balance > 0 ? `₹${balance.toLocaleString("en-IN")} due` : "Paid"}
                                        </p>
                                    </div>
                                    <button onClick={e => { e.stopPropagation(); setEditing({ ...p }); }} className="p-2 text-forest/50 hover:bg-forest/10 rounded-xl transition"><Edit2 size={15} /></button>
                                    <button onClick={e => {
                                        e.stopPropagation();
                                        setConfirmAction({
                                            title: "Delete Project?",
                                            message: `"${p.model_name}" and all its transactions will be removed.`,
                                            type: "danger",
                                            onConfirm: () => handleDelete(p.id)
                                        });
                                    }} className="p-2 text-rose-400 hover:bg-rose-50 rounded-xl transition"><Trash2 size={15} /></button>
                                </div>
                            </div>
                            {p.delivery_date && (
                                <p className="text-xs text-slate/40 mt-3 border-t border-forest/5 pt-3">
                                    Delivery: {new Date(p.delivery_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                </p>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Detail Slide-over */}
            <AnimatePresence>
                {detail && (
                    <div className="fixed inset-0 z-50 flex items-start justify-end">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDetail(null)} className="absolute inset-0 bg-forest/40 backdrop-blur-sm" />
                        <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="relative w-full max-w-lg h-full bg-white shadow-2xl overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b border-forest/5 p-6 flex items-center justify-between z-10">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="font-black text-forest text-xl">{detail.model_name}</h2>
                                        {detail.display_id && <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200">{detail.display_id}</span>}
                                    </div>
                                    <p className="text-sm text-slate/50">{detail.customers?.name}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={printSummary} className="p-2.5 bg-forest/5 text-forest hover:bg-forest/10 rounded-xl transition shadow-sm" title="Print Summary"><Printer size={18} /></button>
                                    <button onClick={() => setDetail(null)} className="p-2 hover:bg-forest/5 rounded-full"><X size={20} /></button>
                                </div>
                            </div>
                            <div className="p-6 flex flex-col gap-6">
                                {/* 1. Timeline / Stages */}
                                {detail.project_stages && (
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-xs font-black uppercase text-forest/50 tracking-widest">Project Progress</h3>
                                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-tight">
                                                {detail.project_stages.filter((s: any) => s.completed).length} / {detail.project_stages.length} Stages Done
                                            </span>
                                        </div>
                                        <div className="relative pl-8 flex flex-col gap-6 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-0.5 before:bg-forest/5">
                                            {detail.project_stages.length === 0 ? (
                                                <p className="text-xs text-slate/40 italic">No stages defined for this project.</p>
                                            ) : detail.project_stages.sort((a: any, b: any) => (a.stage_order || 0) - (b.stage_order || 0)).map((stage: any) => (
                                                <div key={stage.id} className="relative">
                                                    <button onClick={() => toggleStage(stage)}
                                                        className={`absolute -left-[31px] top-0 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10 border-4 border-white shadow-sm ${stage.completed ? "bg-emerald-500 text-white" : "bg-forest/10 text-forest/30"}`}>
                                                        {stage.completed ? <CheckCircle size={14} /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                                                    </button>
                                                    <div className="flex flex-col">
                                                        <button onClick={() => toggleStage(stage)} className={`text-sm font-bold transition-colors ${stage.completed ? "text-forest" : "text-slate/40"}`}>
                                                            {stage.stage_name}
                                                        </button>
                                                        {stage.completed && stage.updated_at && (
                                                            <span className="text-[10px] text-slate/40 font-medium">Completed on {new Date(stage.updated_at).toLocaleDateString("en-IN")}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* 2. Details grid */}
                                <div>
                                    <h3 className="text-xs font-black uppercase text-forest/50 tracking-widest mb-4">Details</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { label: "Category", val: detail.category },
                                            { label: "Sub Category", val: detail.sub_category || "—" },
                                            { label: "Worker", val: detail.workers?.name || "—" },
                                            { label: "Quality", val: detail.quality_type || "—" },
                                            { label: "Rate/Unit", val: detail.rate_per_unit ? `₹${detail.rate_per_unit}` : "—" },
                                            { label: "Est. Weight/Size", val: detail.estimated_weight_size || "—" },
                                            { label: "Est. Value", val: detail.final_project_value ? `₹${detail.final_project_value.toLocaleString("en-IN")}` : "—" },
                                            { label: "Delivery", val: detail.delivery_date ? new Date(detail.delivery_date).toLocaleDateString("en-IN") : "—" },
                                        ].map(i => (
                                            <div key={i.label} className="bg-forest/5 rounded-xl p-3 flex flex-col justify-between min-h-[64px]">
                                                <p className="text-[10px] text-slate/40 font-semibold uppercase tracking-widest">{i.label}</p>
                                                <p className="text-sm font-bold text-forest mt-0.5">{i.val}</p>
                                            </div>
                                        ))}
                                    </div>
                                    {detail.notes && (
                                        <div className="bg-amber-50 rounded-2xl p-4 text-sm text-amber-800 mt-3">{detail.notes}</div>
                                    )}
                                </div>

                                {/* 3. At Completion — Actual Weight & Value */}
                                <div>
                                    <h3 className="text-xs font-black uppercase text-amber-700/70 tracking-widest mb-4 flex items-center gap-2">
                                        <CheckCircle size={14} className="text-amber-600" /> At Completion
                                    </h3>
                                    <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 flex flex-col gap-4">
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[10px] font-black text-amber-700/60 uppercase tracking-widest">Rate / Unit</label>
                                                <div className="bg-amber-100/50 border border-amber-200/50 rounded-xl px-3 py-2.5 text-sm font-bold text-amber-800/60 min-h-[42px] flex items-center">
                                                    {detail.rate_per_unit ? `₹${detail.rate_per_unit}` : "—"}
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[10px] font-black text-amber-700/80 uppercase tracking-widest">Actual Weight</label>
                                                <input type="number" step="10"
                                                    value={detail.actual_weight_size || ""}
                                                    onChange={(e) => {
                                                        const val = parseFloat(e.target.value) || 0;
                                                        const rate = detail.rate_per_unit || 0;
                                                        const actualValue = val * rate;
                                                        setDetail({ ...detail, actual_weight_size: val, actual_project_value: actualValue });
                                                    }}
                                                    className="bg-white border border-amber-300 rounded-xl px-3 py-2.5 text-sm font-black text-amber-900 focus:outline-none focus:border-amber-500 w-full" placeholder="kg / sqft" />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[10px] font-black text-amber-700/80 uppercase tracking-widest">Actual Value</label>
                                                <div className="bg-white border border-amber-300 rounded-xl px-3 py-2.5 text-sm font-black text-amber-900 min-h-[42px] flex items-center">
                                                    {detail.actual_project_value ? `₹${parseFloat(detail.actual_project_value).toLocaleString("en-IN")}` : <span className="text-amber-400 font-medium text-xs">Auto Calc</span>}
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={async (e) => {
                                                const btn = e.currentTarget;
                                                const originalHtml = btn.innerHTML;
                                                btn.disabled = true;
                                                btn.innerHTML = `<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Saving...`;

                                                try {
                                                    const res = await saveProject({
                                                        ...detail,
                                                        project_stages: undefined,
                                                        transactions: undefined,
                                                        customers: undefined,
                                                        workers: undefined,
                                                        project_photos: undefined
                                                    });
                                                    if (res.success) {
                                                        setProjects(prev => prev.map(p => p.id === detail.id ? { ...p, actual_weight_size: detail.actual_weight_size, actual_project_value: detail.actual_project_value } : p));
                                                        showToast("success", "Actual details saved!");
                                                    } else showToast("error", "Failed to save details");
                                                } finally {
                                                    btn.disabled = false;
                                                    btn.innerHTML = originalHtml;
                                                }
                                            }}
                                            className="w-full bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-black tracking-wide flex justify-center items-center transition-all shadow-sm"
                                        >
                                            <Save size={14} className="mr-2" /> Save Details
                                        </button>

                                        {detail.actual_project_value && (
                                            <div className="mt-2 pt-4 border-t border-amber-200 flex items-center justify-between">
                                                <div>
                                                    <p className="text-[10px] text-amber-700/60 font-black uppercase tracking-widest">Final Balance Due</p>
                                                    <p className="text-xl font-black text-rose-600 mt-0.5">
                                                        ₹{Math.max(0, (parseFloat(detail.actual_project_value) || 0) - calcBalance(detail).paid).toLocaleString("en-IN")}
                                                    </p>
                                                </div>
                                                <div className="text-right text-[9px] text-amber-700/50 font-bold uppercase space-y-0.5">
                                                    <p>Actual Value: ₹{parseFloat(detail.actual_project_value).toLocaleString("en-IN")}</p>
                                                    <p>Paid: ₹{calcBalance(detail).paid.toLocaleString("en-IN")}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* 4. Actual Financials */}
                                <div className="bg-forest/5 rounded-2xl p-5 border border-forest/10">
                                    <h3 className="text-xs font-black uppercase text-forest/50 tracking-widest">Actual Values</h3>
                                    {[
                                        { label: "Actual Project Value", val: `₹${(parseFloat(detail.actual_project_value) || detail.final_project_value || 0).toLocaleString("en-IN")}` },
                                        { label: "Total Paid So Far", val: `₹${calcBalance(detail).paid.toLocaleString("en-IN")}`, color: "text-emerald-700" },
                                        { label: "Final Balance Due", val: `₹${Math.max(0, (parseFloat(detail.actual_project_value) || detail.final_project_value || 0) - calcBalance(detail).paid).toLocaleString("en-IN")}`, color: ((parseFloat(detail.actual_project_value) || detail.final_project_value || 0) - calcBalance(detail).paid) > 0 ? "text-rose-600" : "text-emerald-600" },
                                    ].map(i => (
                                        <div key={i.label} className="flex justify-between items-center py-2.5 border-b border-forest/10 last:border-0">
                                            <span className="text-sm font-semibold text-forest/70 uppercase tracking-wider">{i.label}</span>
                                            <span className={`font-black text-xl ${i.color || "text-forest"}`}>{i.val}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* 5. Payment Ledger */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xs font-black uppercase text-forest/50 tracking-widest">Financial Ledger</h3>
                                        <button
                                            onClick={() => setShowPaymentForm(!showPaymentForm)}
                                            className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-full transition"
                                        >
                                            {showPaymentForm ? <X size={12} /> : <Plus size={12} />}
                                            {showPaymentForm ? "Cancel" : "Add Payment"}
                                        </button>
                                    </div>

                                    <div className="bg-forest/5 rounded-3xl p-5 flex flex-col gap-4 border border-forest/5">
                                        {showPaymentForm && (
                                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-4 border-2 border-emerald-100 shadow-sm flex flex-col gap-3">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="flex flex-col gap-1">
                                                        <label className="text-[10px] font-black text-slate/40 uppercase">Amount (₹)</label>
                                                        <input type="number" step="100"
                                                            value={newPayment.amount}
                                                            onChange={e => setNewPayment({ ...newPayment, amount: e.target.value })}
                                                            className="bg-slate/5 rounded-xl p-2.5 text-sm font-bold text-forest focus:outline-none focus:ring-2 ring-emerald-100" placeholder="0.00" />
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <label className="text-[10px] font-black text-slate/40 uppercase">Mode</label>
                                                        <select
                                                            value={newPayment.payment_mode}
                                                            onChange={e => setNewPayment({ ...newPayment, payment_mode: e.target.value })}
                                                            className="bg-slate/5 rounded-xl p-2.5 text-sm font-bold text-forest focus:outline-none focus:ring-2 ring-emerald-100">
                                                            {["Cash", "Online", "Cheque", "Transfer"].map(m => <option key={m}>{m}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[10px] font-black text-slate/40 uppercase">Date</label>
                                                    <DateInput
                                                        value={newPayment.transaction_date}
                                                        onChange={v => setNewPayment({ ...newPayment, transaction_date: v })}
                                                        className="bg-slate/5 rounded-xl p-2.5 text-sm font-bold text-forest focus:outline-none" />
                                                </div>
                                                <button
                                                    onClick={handleAddPayment}
                                                    disabled={isPaying}
                                                    className="bg-emerald-600 text-white rounded-xl py-2.5 text-sm font-black uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
                                                >
                                                    {isPaying ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                                                    Confirm Payment
                                                </button>
                                            </motion.div>
                                        )}

                                        <div className="flex flex-col gap-2">
                                            {(!detail.transactions || detail.transactions.length === 0) ? (
                                                <div className="py-4 text-center text-xs text-slate/40 font-medium italic">No transactions recorded yet</div>
                                            ) : detail.transactions.sort((a: any, b: any) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()).map((t: any) => (
                                                <div key={t.id} className="bg-white rounded-2xl p-3 flex items-center justify-between border border-forest/5 shadow-sm group">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${t.type === "Payment" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                                                            {t.type === "Payment" ? "₹" : "↺"}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-forest">{t.type === "Payment" ? "Payment Received" : "Refund Issued"} via {t.payment_mode}</p>
                                                            <p className="text-[10px] text-slate/40 font-medium">{new Date(t.transaction_date).toLocaleDateString("en-IN")}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <p className={`text-sm font-black ${t.type === "Payment" ? "text-emerald-700" : "text-rose-600"}`}>
                                                            {t.type === "Payment" ? "+" : "-"} ₹{t.amount.toLocaleString("en-IN")}
                                                        </p>
                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                                                            <button onClick={() => { setNewPayment({ ...t, transaction_date: t.transaction_date?.split('T')[0] }); setShowPaymentForm(true); }} className="p-1.5 text-slate/40 hover:text-forest transition"><Edit2 size={13} /></button>
                                                            <button onClick={() => handleDeleteTransaction(t.id)} className="p-1.5 text-slate/40 hover:text-rose-500 transition"><Trash2 size={13} /></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* 6. Documents */}
                                <div>
                                    <h3 className="text-xs font-black uppercase text-forest/50 tracking-widest mb-4">Documents & Photos</h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        {[
                                            { label: "Agreement", key: "agreement_url", icon: FileText },
                                            { label: "Measurements", key: "measurement_url", icon: Ruler },
                                            { label: "Completion Photo", key: "completion_url", icon: Camera },
                                        ].map(doc => (
                                            <div key={doc.key} className="bg-forest/5 rounded-2xl p-4 flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-white rounded-xl text-forest/60 shadow-sm"><doc.icon size={18} /></div>
                                                    <span className="text-sm font-bold text-forest">{doc.label}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {detail[doc.key] ? (
                                                        <>
                                                            <a href={detail[doc.key]} target="_blank" rel="noopener noreferrer" className="p-2 bg-white text-forest/60 hover:text-forest rounded-xl shadow-sm transition"><ExternalLink size={16} /></a>
                                                            <label htmlFor={`upload-${doc.key}`} className="p-2 bg-white text-forest/60 hover:text-forest rounded-xl shadow-sm transition cursor-pointer"><RefreshCw size={16} /></label>
                                                        </>
                                                    ) : (
                                                        <label htmlFor={`upload-${doc.key}`} className="p-2 bg-forest text-mint rounded-xl shadow-md transition cursor-pointer hover:bg-forest/90 flex items-center gap-2 text-xs font-bold">
                                                            <Upload size={14} /> Upload
                                                        </label>
                                                    )}
                                                    <input type="file" id={`upload-${doc.key}`} className="hidden" onChange={e => handleFileUpload(e, doc.key)} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 7. Project Gallery */}
                                <div>
                                    <h3 className="text-xs font-black uppercase text-forest/50 tracking-widest mb-4">Project Gallery</h3>
                                    <div className="grid grid-cols-3 gap-3">
                                        {(detail.project_photos || []).map((photo: any) => (
                                            <div key={photo.id} className="relative aspect-square rounded-2xl overflow-hidden border border-forest/5 shadow-sm group">
                                                <img src={photo.url} className="w-full h-full object-cover transition group-hover:scale-110" alt="Project" />
                                                <div className="absolute inset-0 bg-forest/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                                                    <a href={photo.url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition">
                                                        <ExternalLink size={16} />
                                                    </a>
                                                    <button
                                                        onClick={() => handleDeletePhoto(photo)}
                                                        className="p-2 bg-rose-500/20 hover:bg-rose-500/40 rounded-full text-white backdrop-blur-sm transition"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <label className="aspect-square rounded-2xl border-2 border-dashed border-forest/10 flex flex-col items-center justify-center gap-1.5 text-forest/40 hover:border-forest/30 hover:bg-forest/[0.02] transition cursor-pointer">
                                            <Camera size={20} />
                                            <span className="text-[10px] font-black uppercase tracking-wider">Add</span>
                                            <input type="file" multiple accept="image/*" className="hidden"
                                                onChange={async (e) => {
                                                    const files = Array.from(e.target.files || []);
                                                    if (files.length === 0) return;
                                                    setIsSaving(true);
                                                    for (const file of files) {
                                                        const formData = new FormData();
                                                        formData.append("file", file);
                                                        const res = await uploadERPFile(formData, "ssm-project-assets");
                                                        if (res.success) {
                                                            await supabase.from("project_photos").insert({ project_id: detail.id, url: res.data });
                                                        }
                                                    }

                                                    // Fetch only updated photos to avoid dropping populated relations like transactions
                                                    const { data: newPhotos } = await supabase.from("project_photos").select("*").eq("project_id", detail.id).order("created_at", { ascending: true });
                                                    if (newPhotos) {
                                                        setDetail((prev: any) => ({ ...prev, project_photos: newPhotos }));
                                                        setProjects((prev: any) => prev.map((p: any) => p.id === detail.id ? { ...p, project_photos: newPhotos } : p));
                                                    }
                                                    setIsSaving(false);
                                                }} />
                                        </label>
                                    </div>
                                </div>

                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {editing && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditing(null)} className="absolute inset-0 bg-forest/50 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl relative z-10 overflow-hidden max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-forest/5 flex items-center justify-between sticky top-0 bg-white">
                                <h2 className="text-xl font-black text-forest">{editing.id ? "Edit Project" : "New Project"}</h2>
                                <button onClick={() => setEditing(null)} className="p-2 hover:bg-forest/5 rounded-full"><X size={18} /></button>
                            </div>
                            <div className="p-6 grid grid-cols-2 gap-4">
                                <div className="col-span-2 flex flex-col gap-1">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest">Customer*</label>
                                        <Link href="/admin/erp/customers?new=true" target="_blank" className="text-[10px] font-black text-forest hover:underline uppercase tracking-widest flex items-center gap-1">
                                            <Plus size={10} /> New Customer
                                        </Link>
                                    </div>
                                    <select value={editing.customer_id} onChange={e => updateEditing({ customer_id: e.target.value })} className="bg-[#f5f7f5] rounded-xl p-3 text-forest font-medium text-sm border-none focus:outline-none">
                                        <option value="">Select Customer...</option>
                                        {allCustomers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="col-span-2 flex flex-col gap-1">
                                    <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest">Model / Product Name*</label>
                                    <input value={editing.model_name || ""} onChange={e => updateEditing({ model_name: e.target.value })} className="bg-[#f5f7f5] rounded-xl p-3 text-forest font-medium text-sm border-none focus:outline-none" placeholder="e.g. SS Main Gate 10x6ft" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest">Category*</label>
                                    <select value={editing.category || ""} onChange={e => {
                                        const cat = e.target.value;
                                        setEditing({ ...editing, category: cat, sub_category: "" });
                                    }} className="bg-[#f5f7f5] rounded-xl p-3 text-forest font-medium text-sm border-none focus:outline-none">
                                        <option value="">Select Category...</option>
                                        {dynamicCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest">Sub Category</label>
                                    <select value={editing.sub_category || ""} onChange={e => updateEditing({ sub_category: e.target.value })} className="bg-[#f5f7f5] rounded-xl p-3 text-forest font-medium text-sm border-none focus:outline-none">
                                        <option value="">Select Sub Category...</option>
                                        {filteredSubCats.map(sc => <option key={sc.subCategory} value={sc.subCategory}>{sc.subCategory}</option>)}
                                    </select>
                                </div>
                                <div className="col-span-2 grid grid-cols-3 gap-4">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest">Start Date</label>
                                        <DateInput lang="en-IN" value={editing.start_date || ""} 
                                            max={editing.delivery_date || undefined}
                                            onChange={v => updateEditing({ start_date: v })} 
                                            className="bg-[#f5f7f5] rounded-xl p-3 text-forest font-medium text-sm border-none focus:outline-none" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest">Delivery Date</label>
                                        <DateInput lang="en-IN" value={editing.delivery_date || ""} 
                                            min={editing.start_date || ""}
                                            onChange={v => updateEditing({ delivery_date: v })} 
                                            className="bg-[#f5f7f5] rounded-xl p-3 text-forest font-medium text-sm border-none focus:outline-none" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest">Status</label>
                                        <select value={editing.status} onChange={e => updateEditing({ status: e.target.value })} className="bg-[#f5f7f5] rounded-xl p-3 text-forest font-medium text-sm border-none focus:outline-none">
                                            {STATUSES.map(s => <option key={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="col-span-2 grid grid-cols-4 gap-3">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest">Quality Type</label>
                                        <input value={editing.quality_type || ""} onChange={e => updateEditing({ quality_type: e.target.value })} className="bg-[#f5f7f5] rounded-xl p-3 text-forest font-medium text-sm border-none focus:outline-none" placeholder="SS 304" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest">Rate (₹)</label>
                                        <input type="number" value={editing.rate_per_unit || ""} min="0" step="10" onChange={e => updateEditing({ rate_per_unit: Math.max(0, parseFloat(e.target.value) || 0) })} className="bg-[#f5f7f5] rounded-xl p-3 text-forest font-medium text-sm border-none focus:outline-none" placeholder="0" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest">Est. Weight</label>
                                        <input type="number" value={editing.estimated_weight_size || ""} min="0" step="10" onChange={e => updateEditing({ estimated_weight_size: Math.max(0, parseFloat(e.target.value) || 0) })} className="bg-[#f5f7f5] rounded-xl p-3 text-forest font-medium text-sm border-none focus:outline-none" placeholder="kg / sqft" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest">Est. Value (₹)</label>
                                        <input type="text" inputMode="numeric" value={editing.final_project_value ? Number(editing.final_project_value).toLocaleString("en-IN") : ""} 
                                            onChange={e => {
                                                const val = e.target.value.replace(/,/g, "");
                                                if (!isNaN(Number(val))) updateEditing({ final_project_value: Math.max(0, parseFloat(val) || 0) });
                                            }}
                                            className="bg-[#f5f7f5] rounded-xl p-3 text-forest font-black text-sm border-none focus:outline-none" placeholder="Auto" />
                                    </div>
                                </div>

                                <div className="col-span-2 bg-amber-50/20 rounded-[24px] p-5 border border-amber-100/50 flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-[10px] font-black uppercase text-amber-700 tracking-widest">Actual Completion Details</h3>
                                        <div className="text-[10px] font-bold text-amber-600/60 selection:bg-amber-100">Update after finishing</div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] font-black uppercase text-amber-600/60 tracking-widest">Est. Weight Ref.</label>
                                            <div className="bg-white/50 rounded-xl p-3 text-sm font-bold text-amber-900/40 border border-amber-100/30">
                                                {editing.estimated_weight_size || 0} kg/sqft
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] font-black uppercase text-amber-700 tracking-widest">Actual Weight / Size</label>
                                            <input type="number" value={editing.actual_weight_size || ""} min="0" step="10" onChange={e => updateEditing({ actual_weight_size: Math.max(0, parseFloat(e.target.value) || 0) })} 
                                                className="bg-white rounded-xl p-3 text-sm font-bold text-forest border border-amber-200 focus:border-amber-400 outline-none transition" placeholder="Enter final weight" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1.5 pt-1">
                                        <label className="text-[10px] font-black uppercase text-forest tracking-widest flex items-center gap-2">
                                            Actual Project Value (₹)
                                            <span className="text-[9px] font-medium text-slate-400">(Auto-calculated from Rate × Actual Weight)</span>
                                        </label>
                                        <input type="text" inputMode="numeric" value={editing.actual_project_value ? Number(editing.actual_project_value).toLocaleString("en-IN") : ""} 
                                            onChange={e => {
                                                const val = e.target.value.replace(/,/g, "");
                                                if (!isNaN(Number(val))) updateEditing({ actual_project_value: Math.max(0, parseFloat(val) || 0) });
                                            }}
                                            className="bg-forest/[0.03] rounded-xl p-4 text-forest font-black text-xl border-2 border-forest/10 focus:border-forest transition outline-none" placeholder="Auto" />
                                    </div>
                                </div>
                                <div className="col-span-2 flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest">Assign Skilled Worker (Active)</label>
                                    <select value={editing.worker_id || ""} onChange={e => setEditing({ ...editing, worker_id: e.target.value || null })} 
                                        className="bg-[#f5f7f5] rounded-xl p-3.5 text-forest font-bold text-sm border-2 border-transparent focus:border-forest/10 transition outline-none">
                                        <option value="">No worker assigned</option>
                                        {workers.filter(w => w.active_status && (w.skill_category === editing.category || !editing.category)).map(w => (
                                            <option key={w.id} value={w.id}>{w.name} — {w.skill_category}</option>
                                        ))}
                                    </select>
                                    <p className="text-[9px] text-slate-400 font-medium">Only workers matching the project category "{editing.category}" are shown.</p>
                                </div>
                                
                                <div className="col-span-2 flex flex-col gap-1">
                                    <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest">Attachments / References</label>
                                    <div className="flex flex-wrap gap-3 mt-1">
                                        <AnimatePresence>
                                            {selectedPhotos.map((p, i) => (
                                                <motion.div key={p.preview} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                                                    className="relative w-16 h-16 rounded-xl overflow-hidden group shadow-md border border-forest/5">
                                                    <img src={p.preview} className="w-full h-full object-cover" alt="Preview" />
                                                    <button onClick={() => {
                                                        setSelectedPhotos(prev => prev.filter((_, idx) => idx !== i));
                                                        URL.revokeObjectURL(p.preview);
                                                    }} className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition shadow-lg">
                                                        <X size={10} />
                                                    </button>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                        <button onClick={() => {
                                            const input = document.createElement('input');
                                            input.type = 'file';
                                            input.multiple = true;
                                            input.accept = 'image/*';
                                            input.onchange = (e: any) => {
                                                const files = Array.from(e.target.files) as File[];
                                                const news = files.map(f => ({ file: f, preview: URL.createObjectURL(f) }));
                                                setSelectedPhotos(prev => [...prev, ...news]);
                                            };
                                            input.click();
                                        }} className="w-16 h-16 rounded-xl border-2 border-dashed border-forest/10 flex flex-col items-center justify-center gap-1 text-forest/40 hover:border-forest/30 hover:bg-forest/[0.02] transition">
                                            <Camera size={16} />
                                            <span className="text-[8px] font-bold uppercase tracking-wider">Add</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="col-span-2 flex flex-col gap-1">
                                    <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest">Internal Notes</label>
                                    <textarea rows={2} value={editing.notes || ""} onChange={e => updateEditing({ notes: e.target.value })} className="bg-[#f5f7f5] rounded-xl p-3.5 text-forest font-medium text-sm border-none focus:outline-none resize-none" placeholder="Special requirements, measurements, or design preferences..." />
                                </div>
                                <div className="col-span-2 flex gap-3 pt-2">
                                    <button onClick={handleSave} disabled={isSaving} className="flex-1 bg-forest text-mint py-3 rounded-2xl font-black flex items-center justify-center gap-2">
                                        {isSaving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                                        {isSaving ? "Saving..." : "Save Project"}
                                    </button>
                                    <button onClick={() => setEditing(null)} className="px-6 border-2 border-forest/10 text-forest rounded-2xl font-bold">Cancel</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Generic Confirmation Modal */}
            <AnimatePresence>
                {confirmAction && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfirmAction(null)} className="absolute inset-0 bg-forest/60 backdrop-blur-md" />
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl relative z-10 p-8 flex flex-col items-center text-center gap-6 border border-forest/5">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${confirmAction.type === 'danger' ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-500'}`}>
                                <AlertCircle size={32} />
                            </div>
                            <div>
                                <h3 className="font-black text-forest text-2xl uppercase tracking-tight">{confirmAction.title}</h3>
                                <p className="text-slate/60 text-sm mt-2 font-medium leading-relaxed">{confirmAction.message}</p>
                            </div>
                            <div className="flex gap-3 w-full">
                                <button onClick={() => setConfirmAction(null)} className="flex-1 py-4 border-2 border-forest/10 text-forest rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-forest/5 transition">Cancel</button>
                                <button onClick={() => { confirmAction.onConfirm(); setConfirmAction(null); }} className={`flex-1 py-4 ${confirmAction.type === 'danger' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-amber-500 hover:bg-amber-600'} text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg transition`}>
                                    Confirm
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
