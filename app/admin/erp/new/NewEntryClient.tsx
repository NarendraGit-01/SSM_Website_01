"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, User, Phone, MessageCircle, MapPin,
    Briefcase, IndianRupee, CheckCircle,
    X, Loader2, Plus, Save, ArrowRight,
    AlertCircle, RefreshCcw, UserCheck, History, Image as ImageIcon,
    Camera, Upload, Trash
} from "lucide-react";
import { searchCustomers, createCustomerAndProject, uploadProjectPhoto, checkDuplicateCustomer, getERPCategories, getERPSubCategories } from "../actions";
import DateInput from "@/components/ui/DateInput";

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = ["Steel Products", "UPVC Products", "Interiors", "Iron Works", "Lifts"];
const STATUSES = ["Not Started", "In Progress", "On Hold", "Completed", "Delivered"];
const STATUS_COLORS: Record<string, string> = {
    "Not Started": "bg-slate-100 text-slate-600",
    "In Progress": "bg-blue-50 text-blue-700",
    "On Hold": "bg-amber-50 text-amber-700",
    "Completed": "bg-emerald-50 text-emerald-700",
    "Delivered": "bg-purple-50 text-purple-700",
};

const emptyCustomer = () => ({
    id: "",
    display_id: "",
    name: "",
    phone_number: "",
    whatsapp_number: "",
    address: "",
    notes: "",
});

const emptyProduct = () => ({
    category: "",
    sub_category: "",
    model_name: "",
    quality_type: "",
    rate_per_unit: "",
    estimated_weight_size: "",
    estimated_cost: "",
});

const emptyProjectMeta = () => ({
    start_date: "",
    delivery_date: "",
    status: "Not Started",
    notes: "",
    final_project_value: "",
});

const emptyAdvance = () => ({
    amount: "",
    date: new Date().toISOString().split('T')[0],
    mode: "Cash"
});

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }: { msg: string; type: "success" | "error"; onClose: () => void }) {
    useEffect(() => {
        const t = setTimeout(onClose, 4000);
        return () => clearTimeout(t);
    }, [onClose]);
    return (
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}
            className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-sm font-bold
                ${type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}>
            {type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {msg}
            <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X size={14} /></button>
        </motion.div>
    );
}

// ─── Input Component ──────────────────────────────────────────────────────────
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
            </label>
            {children}
        </div>
    );
}

const inputCls = "bg-[#f5f7f5] rounded-xl px-4 py-3 text-forest font-medium text-sm border-2 border-transparent focus:border-forest/20 focus:outline-none transition placeholder:text-slate-300 w-full";
const inputDateCls = `${inputCls} [&::-webkit-calendar-picker-indicator]:opacity-50 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 cursor-pointer [&::-webkit-calendar-picker-indicator]:transition-opacity`;
const selectCls = `${inputCls} cursor-pointer`;

// ─── Main Component ───────────────────────────────────────────────────────────
export default function NewEntryClient() {
    // Search
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Customer & Project
    const [customer, setCustomer] = useState(emptyCustomer());
    const [isExistingCustomer, setIsExistingCustomer] = useState(false);
    const [selectedCustomerProjects, setSelectedCustomerProjects] = useState<any[]>([]);
    const [products, setProducts] = useState([emptyProduct()]);
    const [projectMeta, setProjectMeta] = useState(emptyProjectMeta());
    const [advance, setAdvance] = useState(emptyAdvance());

    // UI state
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [savedProjectId, setSavedProjectId] = useState<string | null>(null);
    const [selectedPhotos, setSelectedPhotos] = useState<{ file: File, preview: string }[]>([]);
    const [duplicateCustomer, setDuplicateCustomer] = useState<any | null>(null);
    const [isWhatsappSame, setIsWhatsappSame] = useState(true);

    const [dynamicCategories, setDynamicCategories] = useState<string[]>([]);
    const [dynamicSubCategories, setDynamicSubCategories] = useState<{ category: string; subCategory: string }[]>([]);

    useEffect(() => {
        async function loadCats() {
            const [c, sc] = await Promise.all([getERPCategories(), getERPSubCategories()]);
            setDynamicCategories(c);
            setDynamicSubCategories(sc);
            if (c.length > 0 && !project.category) {
                setProject(p => ({ ...p, category: c[0] }));
            }
        }
        loadCats();
    }, []);

    // Helpers for product array
    const updateProduct = (idx: number, field: string, value: string) => {
        setProducts(prev => {
            const next = prev.map((p, i) => i === idx ? { ...p, [field]: value } : p);
            // Auto-calc cost
            if (field === "rate_per_unit" || field === "estimated_weight_size") {
                const prod = next[idx];
                const rate = Math.max(0, parseFloat(field === "rate_per_unit" ? value : prod.rate_per_unit) || 0);
                const weight = Math.max(0, parseFloat(field === "estimated_weight_size" ? value : prod.estimated_weight_size) || 0);
                if (rate > 0 && weight > 0) {
                    next[idx].estimated_cost = String(Math.round(rate * weight));
                }
            }
            // Reset sub_category when category changes
            if (field === "category") {
                next[idx] = { ...next[idx], sub_category: "" };
            }
            return next;
        });
    };

    const addProduct = () => setProducts(prev => [...prev, emptyProduct()]);
    const removeProduct = (idx: number) => setProducts(prev => prev.filter((_, i) => i !== idx));

    const totalEstimatedCost = products.reduce((sum, p) => sum + (parseFloat(p.estimated_cost) || 0), 0);
    const estimatedBalance = totalEstimatedCost - (parseFloat(advance.amount) || 0);
    const photoInputRef = useRef<HTMLInputElement>(null);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const newPhotos = files.map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }));
        setSelectedPhotos(prev => [...prev, ...newPhotos]);
    };

    const removePhoto = (index: number) => {
        setSelectedPhotos(prev => {
            const next = [...prev];
            URL.revokeObjectURL(next[index].preview);
            next.splice(index, 1);
            return next;
        });
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Sync WhatsApp if toggle is on
    useEffect(() => {
        if (isWhatsappSame) {
            setCustomer(prev => ({ ...prev, whatsapp_number: prev.phone_number }));
        }
    }, [customer.phone_number, isWhatsappSame]);

    // Live duplicate check
    useEffect(() => {
        if (isExistingCustomer) {
            setDuplicateCustomer(null);
            return;
        }
        if (!customer.name.trim() && customer.phone_number.length < 10) {
            setDuplicateCustomer(null);
            return;
        }
        const timer = setTimeout(async () => {
            const existing = await checkDuplicateCustomer(customer.name, customer.phone_number);
            setDuplicateCustomer(existing);
        }, 600);
        return () => clearTimeout(timer);
    }, [customer.name, customer.phone_number, isExistingCustomer]);

    // Debounced search
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (searchQuery.trim().length < 2) {
            setSearchResults([]);
            setShowDropdown(false);
            return;
        }
        // Stop it from re-searching immediately after selecting a customer
        if (isExistingCustomer && searchQuery === customer.name) {
            return;
        }
        
        debounceRef.current = setTimeout(async () => {
            setIsSearching(true);
            const results = await searchCustomers(searchQuery);
            setSearchResults(results);
            setShowDropdown(true);
            setIsSearching(false);
        }, 300);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [searchQuery, isExistingCustomer, customer.name]);

    const selectExistingCustomer = (c: any) => {
        setCustomer({
            id: c.id,
            display_id: c.display_id || "",
            name: c.name || "",
            phone_number: c.phone_number || "",
            whatsapp_number: c.whatsapp_number || "",
            address: c.address || "",
            notes: c.notes || "",
        });
        setIsExistingCustomer(true);
        setSelectedCustomerProjects(c.projects || []);
        setSearchQuery(c.name);
        setShowDropdown(false);
        setErrors({});
    };

    const resetToNewCustomer = () => {
        setCustomer(emptyCustomer());
        setIsExistingCustomer(false);
        setSelectedCustomerProjects([]);
        setSearchQuery("");
        setErrors({});
        setSavedProjectId(null);
        setProducts([emptyProduct()]);
        setProjectMeta(emptyProjectMeta());
    };

    const validate = () => {
        const e: Record<string, string> = {};
        if (!customer.name.trim()) e.name = "Customer name is required";
        if (!customer.phone_number.trim()) e.phone_number = "Mobile number is required";
        else if (!/^\d{10}$/.test(customer.phone_number.trim())) e.phone_number = "Must be exactly 10 digits";
        products.forEach((p, i) => {
            if (!p.model_name.trim()) e[`model_name_${i}`] = "Model / Product name is required";
            if (!p.category) e[`category_${i}`] = "Category is required";
        });
        if (projectMeta.start_date && projectMeta.delivery_date) {
            if (new Date(projectMeta.delivery_date) < new Date(projectMeta.start_date)) {
                e.delivery_date = "Delivery date cannot be before start date";
            }
        }
        return e;
    };

    const handleSave = async () => {
        const e = validate();
        if (Object.keys(e).length > 0) {
            setErrors(e);
            setToast({ msg: "Please fix the highlighted errors", type: "error" });
            return;
        }
        setIsSaving(true);
        setErrors({});
        try {
            let firstProjectId: string | null = null;
            let savedCustomerId: string | null = customer.id || null;
            let tempCustomer = { ...customer };

            for (let i = 0; i < products.length; i++) {
                const prod = products[i];
                const projPayload = {
                    ...projectMeta,
                    category: prod.category,
                    sub_category: prod.sub_category || prod.category,
                    model_name: prod.model_name,
                    quality_type: prod.quality_type,
                    estimated_weight_size: parseFloat(prod.estimated_weight_size) || 0,
                    rate_per_unit: parseFloat(prod.rate_per_unit) || 0,
                    estimated_cost: parseFloat(prod.estimated_cost) || 0,
                    final_project_value: parseFloat(prod.estimated_cost) || 0,
                    start_date: projectMeta.start_date || null,
                    delivery_date: projectMeta.delivery_date || null,
                    // Only attach advance to the first project
                    advance_amount: i === 0 ? (parseFloat(advance.amount) || 0) : 0,
                    advance_date: advance.date,
                    payment_mode: advance.mode,
                };

                // After first project, use the customer id we got back
                if (savedCustomerId) tempCustomer = { ...tempCustomer, id: savedCustomerId };

                const result = await createCustomerAndProject(tempCustomer, projPayload);
                if (!result.success) {
                    if (result.error?.includes("mobile number")) setErrors({ phone_number: result.error });
                    setToast({ msg: result.error || "Save failed", type: "error" });
                    setIsSaving(false);
                    return;
                }
                if (i === 0) {
                    firstProjectId = result.data?.projectId || null;
                    savedCustomerId = result.data?.customerId || savedCustomerId;
                    setSavedProjectId(firstProjectId);
                }
            }

            // Photo Uploads — attach to first project
            if (selectedPhotos.length > 0 && firstProjectId) {
                try {
                    for (const p of selectedPhotos) {
                        const formData = new FormData();
                        formData.append("file", p.file);
                        await uploadProjectPhoto(formData, firstProjectId);
                    }
                } catch (photoErr) {
                    console.error("Photo upload error:", photoErr);
                } finally {
                    selectedPhotos.forEach(p => URL.revokeObjectURL(p.preview));
                    setSelectedPhotos([]);
                }
            }

            setToast({ msg: `${products.length} project(s) created successfully!`, type: "success" });
            setProducts([emptyProduct()]);
            setProjectMeta(emptyProjectMeta());
            setCustomer(emptyCustomer());
            setAdvance(emptyAdvance());
            setIsExistingCustomer(false);
            setSelectedCustomerProjects([]);
            setSearchQuery("");
            setErrors({});

        } catch (err: any) {
            console.error("HandleSave error:", err);
            setToast({ msg: `Error: ${err instanceof Error ? err.message : String(err)}`, type: "error" });
        }
        setIsSaving(false);
    };

    const totalProjectValue = selectedCustomerProjects.reduce((s: number, p: any) => s + (p.final_project_value || 0), 0);

    return (
        <div className="max-w-5xl mx-auto pb-24">
            <AnimatePresence>
                {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
            </AnimatePresence>

            {/* Header */}
            <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-forest uppercase tracking-wide">New Entry</h1>
                    <p className="text-slate-400 mt-1 font-medium">Register a customer & start a new project — all in one step.</p>
                </div>
                {savedProjectId && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2.5 rounded-2xl text-sm font-bold">
                        <CheckCircle size={16} />
                        Project Created!
                    </motion.div>
                )}
            </div>

            {/* ── SECTION 1: Customer Search ───────────────────────────── */}
            <div ref={searchRef} className="relative mb-6">
                <div className={`flex items-center gap-3 bg-white border-2 rounded-2xl px-5 py-4 shadow-sm transition-all ${showDropdown ? "border-forest rounded-b-none" : "border-forest/10"}`}>
                    <Search size={20} className="text-forest/40 shrink-0" />
                    <input
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search existing customer by name or mobile number…"
                        className="flex-1 text-forest font-medium text-sm bg-transparent outline-none placeholder:text-slate-300"
                    />
                    {isSearching && <Loader2 size={18} className="animate-spin text-forest/40 shrink-0" />}
                    {searchQuery && !isSearching && (
                        <button onClick={resetToNewCustomer} className="text-slate-400 hover:text-forest transition shrink-0"><X size={18} /></button>
                    )}
                </div>

                {/* Dropdown */}
                <AnimatePresence>
                    {showDropdown && (
                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                            className="absolute top-full left-0 right-0 bg-white border-2 border-t-0 border-forest rounded-b-2xl shadow-xl z-50 overflow-hidden">
                            {searchResults.length === 0 ? (
                                <div className="p-5 flex flex-col items-center gap-3 text-center">
                                    <p className="text-sm text-slate-400 font-medium">No customer found for "<span className="font-bold text-forest">{searchQuery}</span>"</p>
                                    <button
                                        onClick={() => { setIsExistingCustomer(false); setShowDropdown(false); setCustomer({ ...emptyCustomer(), name: searchQuery }); }}
                                        className="flex items-center gap-2 bg-forest text-mint px-5 py-2.5 rounded-xl text-sm font-black hover:bg-forest/90 transition">
                                        <Plus size={16} /> Create New Customer
                                    </button>
                                </div>
                            ) : (
                                <div className="max-h-72 overflow-y-auto divide-y divide-forest/5">
                                    {searchResults.map(c => (
                                        <button key={c.id} onClick={() => selectExistingCustomer(c)}
                                            className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-forest/5 transition text-left">
                                            <div className="w-10 h-10 bg-forest text-mint rounded-xl flex items-center justify-center font-black text-sm shrink-0">
                                                {c.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-forest text-sm truncate">{c.name}</p>
                                                <p className="text-[11px] text-slate-400 font-medium">{c.phone_number} · {c.projects?.length || 0} project(s)</p>
                                            </div>
                                            <ArrowRight size={15} className="text-forest/30 shrink-0" />
                                        </button>
                                    ))}
                                    <div className="px-5 py-3 bg-forest/5">
                                        <button
                                            onClick={() => { setIsExistingCustomer(false); setShowDropdown(false); setCustomer(emptyCustomer()); }}
                                            className="flex items-center gap-2 text-forest text-xs font-black hover:underline">
                                            <Plus size={13} /> Create New Customer Instead
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Existing Customer Badge */}
            {isExistingCustomer && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="mb-6 flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-3">
                    <UserCheck size={18} className="text-emerald-600 shrink-0" />
                    <div className="flex-1">
                        <p className="text-sm font-black text-emerald-800">Existing Customer Selected</p>
                        <p className="text-[11px] text-emerald-600 font-medium">Details are auto-filled. You can add a new project below.</p>
                    </div>
                    <button onClick={resetToNewCustomer} className="text-xs font-bold text-emerald-700 border border-emerald-300 px-3 py-1.5 rounded-xl hover:bg-emerald-100 transition">
                        Clear
                    </button>
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                {/* ── LEFT COLUMN ─── Customer Form ── */}
                <div className="lg:col-span-2 flex flex-col gap-6">

                    {/* Customer Card */}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                        className="bg-white rounded-3xl shadow-sm border border-forest/5 overflow-hidden">
                        <div className="flex items-center gap-3 px-6 py-4 border-b border-forest/5 bg-forest/[0.02]">
                            <div className="w-9 h-9 bg-forest text-mint rounded-xl flex items-center justify-center">
                                <User size={17} />
                            </div>
                            <div>
                                <h2 className="font-black text-forest text-sm uppercase tracking-wide">
                                    Customer Info {isExistingCustomer && customer.display_id && <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md ml-2 text-xs">{customer.display_id}</span>}
                                </h2>
                                <p className="text-[10px] text-slate-400 font-medium">{isExistingCustomer ? "Existing customer" : "New customer"}</p>
                            </div>
                        </div>
                        <div className="p-6 flex flex-col gap-4">
                            <Field label="Full Name" required>
                                <input value={customer.name} onChange={e => setCustomer(p => ({ ...p, name: e.target.value }))}
                                    disabled={isExistingCustomer}
                                    className={`${inputCls} ${errors.name ? "border-rose-400 bg-rose-50" : ""} ${isExistingCustomer ? "opacity-70 cursor-not-allowed" : ""}`}
                                    placeholder="e.g. Venkatesh Kumar" />
                                {errors.name && <p className="text-[11px] text-rose-500 font-bold">{errors.name}</p>}
                            </Field>

                            <Field label="Mobile Number" required>
                                <div className="relative">
                                    <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                                    <input type="tel" value={customer.phone_number}
                                        onKeyDown={e => {
                                            // Allow: Backspace, Delete, Tab, Escape, Enter, Arrows
                                            if (['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;

                                            // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Cmd+A, Cmd+C, Cmd+V, Cmd+X
                                            if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) return;

                                            // If not a digit, prevent
                                            if (!/\d/.test(e.key)) {
                                                e.preventDefault();
                                            }

                                            // Length limit (if not selecting text)
                                            const selection = window.getSelection();
                                            if (customer.phone_number.length >= 10 && selection?.toString().length === 0) {
                                                e.preventDefault();
                                            }
                                        }}
                                        onChange={e => setCustomer(p => ({ ...p, phone_number: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
                                        disabled={isExistingCustomer}
                                        className={`${inputCls} pl-9 ${errors.phone_number ? "border-rose-400 bg-rose-50" : ""} ${isExistingCustomer ? "opacity-70 cursor-not-allowed" : ""}`}
                                        placeholder="10-digit number" />
                                </div>
                                {duplicateCustomer && (
                                    <div className="mt-2 p-3 bg-rose-50 border border-rose-200 rounded-xl flex flex-col gap-2">
                                        <div className="flex items-center gap-2 text-rose-600">
                                            <AlertCircle size={14} />
                                            <p className="text-[11px] font-black uppercase">Customer already exists!</p>
                                        </div>
                                        <p className="text-[10px] text-rose-500 font-medium">
                                            <span className="font-black text-rose-700">{duplicateCustomer.name}</span> ({duplicateCustomer.display_id}) is already registered with this {
                                                duplicateCustomer.phone_number === customer.phone_number ? "number" : "name"
                                            }.
                                        </p>
                                        <button
                                            onClick={() => selectExistingCustomer(duplicateCustomer)}
                                            className="w-full bg-rose-600 text-white py-1.5 rounded-lg text-[10px] font-black hover:bg-rose-700 transition flex items-center justify-center gap-2">
                                            <UserCheck size={12} /> Use Existing Customer Details
                                        </button>
                                    </div>
                                )}
                                {errors.phone_number && <p className="text-[11px] text-rose-500 font-bold">{errors.phone_number}</p>}
                            </Field>

                            <Field label="WhatsApp Number">
                                <div className="relative">
                                    <MessageCircle size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                                    <input type="tel" value={customer.whatsapp_number}
                                        onKeyDown={e => {
                                            if (['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
                                            if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) return;
                                            if (!/\d/.test(e.key)) e.preventDefault();
                                            const selection = window.getSelection();
                                            if (customer.whatsapp_number.length >= 10 && selection?.toString().length === 0) e.preventDefault();
                                        }}
                                        onChange={e => {
                                            const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                                            setCustomer(p => ({ ...p, whatsapp_number: val }));
                                            if (val !== customer.phone_number) setIsWhatsappSame(false);
                                        }}
                                        disabled={isExistingCustomer || isWhatsappSame}
                                        className={`${inputCls} pl-9 ${isExistingCustomer || isWhatsappSame ? "opacity-70 cursor-not-allowed" : ""}`}
                                        placeholder="Same or different" />
                                </div>
                                {!isExistingCustomer && (
                                    <button
                                        onClick={() => {
                                            const nextState = !isWhatsappSame;
                                            setIsWhatsappSame(nextState);
                                            if (!nextState) {
                                                setCustomer(p => ({ ...p, whatsapp_number: "" }));
                                            }
                                        }}
                                        className={`mt-2 flex items-center gap-2 text-[10px] font-black uppercase transition
                                            ${isWhatsappSame ? "text-forest" : "text-slate-400 hover:text-forest"}`}>
                                        <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition
                                            ${isWhatsappSame ? "bg-forest border-forest text-mint" : "border-slate-300"}`}>
                                            {isWhatsappSame && <CheckCircle size={10} />}
                                        </div>
                                        Same as Mobile
                                    </button>
                                )}
                            </Field>

                            <Field label="Address">
                                <div className="relative">
                                    <MapPin size={15} className="absolute left-3.5 top-3.5 text-slate-300" />
                                    <textarea value={customer.address}
                                        onChange={e => setCustomer(p => ({ ...p, address: e.target.value }))}
                                        disabled={isExistingCustomer}
                                        rows={3} className={`${inputCls} pl-9 resize-none ${isExistingCustomer ? "opacity-70 cursor-not-allowed" : ""}`}
                                        placeholder="Street, Area, City…" />
                                </div>
                            </Field>

                            <Field label="Notes">
                                <textarea value={customer.notes}
                                    onChange={e => setCustomer(p => ({ ...p, notes: e.target.value }))}
                                    disabled={isExistingCustomer}
                                    rows={2} className={`${inputCls} resize-none ${isExistingCustomer ? "opacity-70 cursor-not-allowed" : ""}`}
                                    placeholder="Any additional notes…" />
                            </Field>
                        </div>
                    </motion.div>

                    {/* Previous Projects Summary (existing customer) */}
                    <AnimatePresence>
                        {isExistingCustomer && selectedCustomerProjects.length > 0 && (
                            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className="bg-white rounded-3xl shadow-sm border border-forest/5 overflow-hidden">
                                <div className="flex items-center gap-3 px-6 py-4 border-b border-forest/5 bg-forest/[0.02]">
                                    <div className="w-9 h-9 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center">
                                        <History size={17} />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="font-black text-forest text-sm uppercase tracking-wide">Previous Projects</h2>
                                        <p className="text-[10px] text-slate-400 font-medium">Total: ₹{totalProjectValue.toLocaleString("en-IN")}</p>
                                    </div>
                                    <span className="text-xs font-black bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">{selectedCustomerProjects.length}</span>
                                </div>
                                <div className="p-4 flex flex-col gap-3 max-h-72 overflow-y-auto">
                                    {[...selectedCustomerProjects]
                                        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                        .slice(0, 5)
                                        .map((p: any) => (
                                            <div key={p.id} className="bg-forest/[0.03] rounded-2xl p-3.5 flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-forest truncate flex items-center gap-2">
                                                        {p.model_name || "Unnamed Project"}
                                                        {p.display_id && <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{p.display_id}</span>}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">{p.category}</p>
                                                </div>
                                                <div className="flex flex-col items-end gap-1.5 shrink-0">
                                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${STATUS_COLORS[p.status] || "bg-slate-100 text-slate-600"}`}>
                                                        {p.status}
                                                    </span>
                                                    {p.final_project_value > 0 && (
                                                        <p className="text-xs font-black text-forest">₹{(p.final_project_value || 0).toLocaleString("en-IN")}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ── RIGHT COLUMN ── Project Form ── */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="lg:col-span-3 bg-white rounded-3xl shadow-sm border border-forest/5 overflow-hidden flex flex-col">
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-forest/5 bg-forest/[0.02]">
                        <div className="w-9 h-9 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center">
                            <Briefcase size={17} />
                        </div>
                        <div>
                            <h2 className="font-black text-forest text-sm uppercase tracking-wide">Project Details</h2>
                            <p className="text-[10px] text-slate-400 font-medium">A new project will be linked to this customer</p>
                        </div>
                    </div>

                    <div className="p-6 flex flex-col gap-5 flex-1">

                        {/* ── Products List ── */}
                        <AnimatePresence initial={false}>
                        {products.map((prod, idx) => {
                            const subCats = dynamicSubCategories.filter(s => s.category === prod.category);
                            return (
                                <motion.div key={idx}
                                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                                    className="border border-forest/10 rounded-2xl overflow-hidden">
                                    {/* Product Header */}
                                    <div className="flex items-center justify-between px-4 py-2.5 bg-forest/[0.03] border-b border-forest/8">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-forest/50">
                                            Product {idx + 1}
                                        </span>
                                        {products.length > 1 && (
                                            <button type="button" onClick={() => removeProduct(idx)}
                                                className="w-6 h-6 flex items-center justify-center rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 transition">
                                                <X size={12} />
                                            </button>
                                        )}
                                    </div>

                                    <div className="p-4 flex flex-col gap-3">

                                        {/* Row 1: Category + Sub Category */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <Field label="Category" required>
                                                <div className="relative">
                                                    {prod.category && (
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-forest" />
                                                    )}
                                                    <select value={prod.category}
                                                        onChange={e => updateProduct(idx, "category", e.target.value)}
                                                        className={`${selectCls} ${prod.category ? "pl-7" : ""} appearance-none ${errors[`category_${idx}`] ? "border-rose-400 bg-rose-50" : ""}`}>
                                                        <option value="">Select Category</option>
                                                        {dynamicCategories.map(cat => (
                                                            <option key={cat} value={cat}>{cat}</option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-forest/30">
                                                        <ArrowRight size={13} className="rotate-90" />
                                                    </div>
                                                </div>
                                                {errors[`category_${idx}`] && <p className="text-[11px] text-rose-500 font-bold mt-1">{errors[`category_${idx}`]}</p>}
                                            </Field>

                                            <Field label="Sub Category">
                                                <div className="relative">
                                                    <select value={prod.sub_category}
                                                        onChange={e => updateProduct(idx, "sub_category", e.target.value)}
                                                        disabled={!prod.category}
                                                        className={`${selectCls} appearance-none ${!prod.category ? "opacity-40 cursor-not-allowed" : ""}`}>
                                                        <option value="">{prod.category ? "Select Sub Category" : "Pick category first"}</option>
                                                        {subCats.map(sc => (
                                                            <option key={sc.subCategory} value={sc.subCategory}>{sc.subCategory}</option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-forest/30">
                                                        <ArrowRight size={13} className="rotate-90" />
                                                    </div>
                                                </div>
                                            </Field>
                                        </div>

                                        {/* Row 2: Model Name (full width) */}
                                        <Field label="Model / Product Name" required>
                                            <input value={prod.model_name}
                                                onChange={e => updateProduct(idx, "model_name", e.target.value)}
                                                className={`${inputCls} ${errors[`model_name_${idx}`] ? "border-rose-400 bg-rose-50" : ""}`}
                                                placeholder="e.g. SS Main Gate 10×6ft" />
                                            {errors[`model_name_${idx}`] && <p className="text-[11px] text-rose-500 font-bold">{errors[`model_name_${idx}`]}</p>}
                                        </Field>

                                        {/* Row 3: Quality | Weight | Rate | Cost — single row */}
                                        <div className="grid grid-cols-4 gap-2">
                                            <Field label="Quality Type">
                                                <input value={prod.quality_type}
                                                    onChange={e => updateProduct(idx, "quality_type", e.target.value)}
                                                    className={`${inputCls} text-sm`} placeholder="SS 304" />
                                            </Field>

                                            <Field label="Rate Per Unit (₹)">
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 font-bold pointer-events-none">₹</span>
                                                    <input type="number" value={prod.rate_per_unit}
                                                        onChange={e => updateProduct(idx, "rate_per_unit", e.target.value)}
                                                        step="10" min="0" className={`${inputCls} pl-6 text-sm`} placeholder="0" />
                                                </div>
                                            </Field>

                                            <Field label="Est. Weight / Size">
                                                <div className="relative">
                                                    <input type="number" value={prod.estimated_weight_size}
                                                        onChange={e => updateProduct(idx, "estimated_weight_size", e.target.value)}
                                                        step="10" min="0" className={`${inputCls} text-sm font-bold pr-10`} placeholder="kg / sqft" />
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 font-bold pointer-events-none">kg</span>
                                                </div>
                                            </Field>

                                            <Field label="Est. Cost (₹)">
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-forest/40 font-bold pointer-events-none">₹</span>
                                                    <input type="text" inputMode="numeric" value={prod.estimated_cost ? Number(prod.estimated_cost).toLocaleString("en-IN") : ""}
                                                        onChange={e => {
                                                            const raw = e.target.value.replace(/,/g, '');
                                                            if (!isNaN(Number(raw))) updateProduct(idx, "estimated_cost", raw);
                                                        }}
                                                        onKeyDown={e => { 
                                                            if (e.key === '.') e.preventDefault(); 
                                                            if (e.key === 'ArrowUp') { e.preventDefault(); updateProduct(idx, "estimated_cost", String((Number(prod.estimated_cost)||0) + 100)); }
                                                            if (e.key === 'ArrowDown') { e.preventDefault(); updateProduct(idx, "estimated_cost", String(Math.max(0, (Number(prod.estimated_cost)||0) - 100))); }
                                                        }}
                                                        className={`${inputCls} pl-6 bg-forest/[0.04] border-forest/15 font-black text-forest text-sm`}
                                                        placeholder="Auto" />
                                                </div>
                                                {prod.rate_per_unit && prod.estimated_weight_size && (
                                                    <p className="text-[9px] text-forest/40 font-bold mt-0.5 truncate">
                                                        {prod.rate_per_unit} × {prod.estimated_weight_size}
                                                    </p>
                                                )}
                                            </Field>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                        </AnimatePresence>

                        {/* Add Product Button */}
                        <button type="button" onClick={addProduct}
                            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border-2 border-dashed border-forest/20 text-forest/50 text-xs font-black uppercase tracking-widest hover:border-forest/40 hover:text-forest/70 hover:bg-forest/[0.02] transition">
                            <Plus size={15} /> Add Another Product
                        </button>

                        {/* Total Estimate Banner (shown when multiple products) */}
                        {products.length > 1 && (
                            <div className="flex items-center justify-between bg-forest/5 rounded-2xl px-4 py-3 border border-forest/10">
                                <p className="text-xs font-black text-forest uppercase tracking-widest">Total Estimated ({products.length} products)</p>
                                <p className="text-lg font-black text-forest">₹{totalEstimatedCost.toLocaleString("en-IN")}</p>
                            </div>
                        )}

                        {/* ── Advance Payment Section ── */}
                        <div className="mt-2 pt-4 border-t border-forest/5">
                            <h3 className="text-xs font-black text-forest uppercase tracking-widest mb-4 flex items-center gap-2">
                                <IndianRupee size={14} className="text-emerald-600" /> Advance Payment
                            </h3>
                            <div className="grid grid-cols-3 gap-3">
                                <Field label="Advance Amount (₹)">
                                    <input type="text" inputMode="numeric" value={advance.amount ? Number(advance.amount).toLocaleString("en-IN") : ""}
                                        onChange={e => {
                                            const raw = e.target.value.replace(/,/g, '');
                                            if (!isNaN(Number(raw))) setAdvance(a => ({ ...a, amount: raw }));
                                        }}
                                        onKeyDown={e => { 
                                            if (e.key === '.') e.preventDefault(); 
                                            if (e.key === 'ArrowUp') { e.preventDefault(); setAdvance(a => ({ ...a, amount: String((Number(a.amount)||0) + 1000) })); }
                                            if (e.key === 'ArrowDown') { e.preventDefault(); setAdvance(a => ({ ...a, amount: String(Math.max(0, (Number(a.amount)||0) - 1000)) })); }
                                        }}
                                        className={`${inputCls} font-bold text-emerald-700 bg-emerald-50/50 border-emerald-100`} placeholder="₹0" />
                                </Field>
                                <Field label="Payment Date">
                                    <DateInput
                                        value={advance.date}
                                        onChange={v => setAdvance(a => ({ ...a, date: v }))}
                                        className={inputDateCls} />
                                </Field>
                                <Field label="Mode">
                                    <select value={advance.mode}
                                        onChange={e => setAdvance(a => ({ ...a, mode: e.target.value }))}
                                        className={selectCls}>
                                        <option>Cash</option>
                                        <option>UPI</option>
                                        <option>Bank Transfer</option>
                                    </select>
                                </Field>
                            </div>

                            {/* Estimated Balance Display */}
                            <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Est. Balance Receivable</p>
                                    <p className="text-xl font-black text-forest mt-0.5">₹{estimatedBalance.toLocaleString("en-IN")}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] text-slate-400 font-bold uppercase">Total Cost: ₹{totalEstimatedCost.toLocaleString("en-IN")}</p>
                                    <p className="text-[9px] text-emerald-600 font-bold uppercase mt-0.5">Advance: -₹{parseFloat(advance.amount || "0").toLocaleString("en-IN")}</p>
                                </div>
                            </div>
                        </div>

                        {/* ── Shared Project Fields ── */}
                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <Field label="Start Date">
                                <DateInput
                                    value={projectMeta.start_date}
                                    max={projectMeta.delivery_date || undefined}
                                    onChange={v => setProjectMeta(p => ({ ...p, start_date: v }))}
                                    className={inputDateCls} />
                            </Field>

                            <Field label="Expected Delivery">
                                <DateInput
                                    value={projectMeta.delivery_date}
                                    min={projectMeta.start_date || ""}
                                    onChange={v => setProjectMeta(p => ({ ...p, delivery_date: v }))}
                                    className={`${inputDateCls} ${errors.delivery_date ? "border-rose-400 bg-rose-50" : ""}`} />
                                {errors.delivery_date && <p className="text-[11px] text-rose-500 font-bold">{errors.delivery_date}</p>}
                            </Field>

                            <div className="col-span-2">
                                <Field label="Initial Status">
                                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                        {STATUSES.map(s => (
                                            <button key={s} type="button"
                                                onClick={() => setProjectMeta(p => ({ ...p, status: s }))}
                                                className={`text-[11px] font-black px-2 py-2.5 rounded-xl border-2 transition text-center leading-tight
                                                    ${projectMeta.status === s
                                                        ? "bg-forest text-mint border-forest"
                                                        : "bg-[#f5f7f5] text-forest/60 border-transparent hover:border-forest/20"}`}>
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </Field>
                            </div>

                            <div className="col-span-2">
                                <Field label="Project Notes">
                                    <textarea value={projectMeta.notes}
                                        onChange={e => setProjectMeta(p => ({ ...p, notes: e.target.value }))}
                                        rows={2} className={`${inputCls} resize-none`}
                                        placeholder="Special requirements, design notes, customer preferences…" />
                                </Field>
                            </div>

                            {/* Project Photos */}
                            <div className="col-span-2">
                                <Field label="Reference Photos">
                                    <div className="flex flex-wrap gap-3 mt-1">
                                        <AnimatePresence>
                                            {selectedPhotos.map((p, i) => (
                                                <motion.div key={p.preview} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                                                    className="relative w-20 h-20 rounded-2xl overflow-hidden group shadow-md border border-forest/5">
                                                    <img src={p.preview} className="w-full h-full object-cover" alt="Preview" />
                                                    <button onClick={() => removePhoto(i)} className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition shadow-lg">
                                                        <Trash size={12} />
                                                    </button>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>

                                        <button onClick={() => photoInputRef.current?.click()}
                                            className="w-20 h-20 rounded-2xl border-2 border-dashed border-forest/10 flex flex-col items-center justify-center gap-1.5 text-forest/40 hover:border-forest/30 hover:bg-forest/[0.02] transition">
                                            <Camera size={20} />
                                            <span className="text-[10px] font-black uppercase tracking-wider">Add</span>
                                        </button>
                                        <input ref={photoInputRef} type="file" multiple accept="image/*" onChange={handlePhotoChange} className="hidden" />
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium mt-2">Upload site photos, designs, or reference images.</p>
                                </Field>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* ── SAVE BUTTON ── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="mt-8 flex items-center justify-between gap-4 bg-white border border-forest/10 rounded-3xl p-5 shadow-sm">
                <div className="flex-1">
                    <p className="font-black text-forest">Project Summary</p>
                    <div className="flex items-center gap-4 mt-1">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Value</span>
                            <span className="text-sm font-black text-forest">₹{totalEstimatedCost.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="w-px h-6 bg-forest/10" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Pending Balance</span>
                            <span className={`text-sm font-black ${estimatedBalance > 0 ? "text-rose-500" : "text-emerald-600"}`}>
                                ₹{estimatedBalance.toLocaleString("en-IN")}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3 items-center">
                    <button onClick={resetToNewCustomer}
                        className="px-5 py-3 border-2 border-forest/10 text-forest rounded-2xl font-bold text-sm hover:bg-forest/5 transition flex items-center gap-2">
                        <RefreshCcw size={15} /> Reset
                    </button>
                    <button onClick={handleSave} disabled={isSaving}
                        className="bg-forest text-mint px-8 py-3.5 rounded-2xl font-black text-sm hover:bg-forest/90 transition flex items-center gap-2.5 shadow-lg disabled:opacity-60">
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        {isSaving ? "Saving…" : isExistingCustomer ? "Save New Project" : "Save Customer & Project"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
