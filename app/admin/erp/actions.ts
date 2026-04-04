"use server";

import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

const ERR = (msg: string) => ({ success: false, error: msg, data: null });
const OK = (data?: any) => ({ success: true, error: null, data: data || null });

// ==========================================
// CUSTOMERS
// ==========================================

export async function getCustomers() {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase
        .from("customers")
        .select("*, projects(*, transactions(*))")
        .order("created_at", { ascending: false });
    if (error) { console.error(error); return []; }
    return data || [];
}

export async function getCustomer(id: string) {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase
        .from("customers")
        .select("*, projects(*, transactions(*), project_stages(*), workers(name))")
        .eq("id", id)
        .single();
    if (error) return null;
    return data;
}

export async function saveCustomer(customer: any) {
    if (!isSupabaseConfigured()) return ERR("Supabase not configured");
    const { id, projects, ...fields } = customer;
    let result;
    if (id) {
        result = await supabase.from("customers").update(fields).eq("id", id).select().single();
    } else {
        result = await supabase.from("customers").insert(fields).select().single();
    }
    if (result.error) return ERR(result.error.message);
    revalidatePath("/admin/erp/customers");
    return OK(result.data);
}

export async function deleteCustomer(id: string) {
    if (!isSupabaseConfigured()) return ERR("Supabase not configured");
    const { error } = await supabase.from("customers").delete().eq("id", id);
    if (error) return ERR(error.message);
    revalidatePath("/admin/erp/customers");
    return OK();
}

export async function checkDuplicateCustomer(name?: string, phone?: string) {
    if (!isSupabaseConfigured()) return null;
    
    const conditions = [];
    if (name?.trim()) conditions.push(`name.ilike.${name.trim()}`);
    if (phone && phone.length === 10) conditions.push(`phone_number.eq.${phone}`);
    
    if (conditions.length === 0) return null;

    const { data, error } = await supabase
        .from("customers")
        .select("*, projects(id, display_id, model_name, status, final_project_value, created_at, category, project_photos(url))")
        .or(conditions.join(','))
        .limit(1)
        .maybeSingle();

    if (error) { console.error(error); return null; }
    return data;
}

export async function searchCustomers(query: string) {
    if (!isSupabaseConfigured()) return [];
    if (!query || query.trim().length < 2) return [];
    const q = query.trim();
    const { data, error } = await supabase
        .from("customers")
        .select("*, projects(id, display_id, model_name, status, final_project_value, created_at, category, project_photos(url))")
        .or(`name.ilike.%${q}%,phone_number.ilike.%${q}%,whatsapp_number.ilike.%${q}%,display_id.ilike.%${q}%`)
        .order("created_at", { ascending: false })
        .limit(10);
    if (error) { console.error(error); return []; }
    return data || [];
}

export async function createCustomerAndProject(customerData: any, projectData: any) {
    if (!isSupabaseConfigured()) return ERR("Supabase not configured");

    let customerId = customerData.id;

    // Step 1: Create or update customer if no ID
    if (!customerId) {
        // Check for duplicate name or phone
        const conditions = [];
        if (customerData.name?.trim()) conditions.push(`name.ilike.${customerData.name.trim()}`);
        if (customerData.phone_number?.trim()) conditions.push(`phone_number.eq.${customerData.phone_number.trim()}`);

        const { data: existing } = await supabase
            .from("customers")
            .select("id, name, phone_number")
            .or(conditions.join(','))
            .limit(1)
            .maybeSingle();

        if (existing) {
            if (existing.name.toLowerCase() === customerData.name?.trim().toLowerCase()) {
                return ERR(`A customer with the name "${existing.name}" already exists.`);
            }
            return ERR(`A customer with this mobile number already exists.`);
        }

        const { name, phone_number, whatsapp_number, address, notes } = customerData;
        const { data: newCustomer, error: custErr } = await supabase
            .from("customers")
            .insert({ name, phone_number, whatsapp_number, address, notes })
            .select()
            .single();
        if (custErr) {
            if (custErr.code === '23505' || custErr.message.includes("unique_phone") || custErr.message.includes("duplicate key")) {
                return ERR("A customer with this mobile number already exists.");
            }
            return ERR(custErr.message);
        }
        customerId = newCustomer.id;
    }

    // Step 2: Create project
    const {
        id: _pid, customers: _c, workers: _w, transactions: _t, project_stages: _ps,
        advance_amount, advance_date, payment_mode,
        ...projFields
    } = projectData;

    const { data: newProject, error: projErr } = await supabase
        .from("projects")
        .insert({
            ...projFields,
            customer_id: customerId,
            sub_category: projectData.sub_category || projectData.category
        })
        .select()
        .single();
    if (projErr) return ERR(projErr.message);

    // Step 2b: Create advance transaction if payment was made
    if (advance_amount > 0) {
        await supabase.from("transactions").insert({
            project_id: newProject.id,
            amount: advance_amount,
            transaction_date: advance_date || new Date().toISOString(),
            payment_mode: payment_mode || "Cash",
            type: "Payment",
            notes: "Initial Advance Payment"
        });
    }

    // Step 3: Auto-create default stages
    const stages = ["Measurement Done", "Material Ordered", "Fabrication", "Installation", "Delivered"];
    await supabase.from("project_stages").insert(
        stages.map((s, i) => ({ project_id: newProject.id, stage_name: s, stage_order: i, completed: false }))
    );

    revalidatePath("/admin/erp/projects");
    revalidatePath("/admin/erp/customers");
    revalidatePath("/admin/erp/new");
    return OK({ customerId, projectId: newProject.id, project: newProject });
}

export async function uploadProjectPhoto(formData: FormData, projectId: string) {
    if (!isSupabaseConfigured()) return ERR("Supabase not configured");
    const res = await uploadERPFile(formData, "ssm-project-assets");
    if (!res.success) return res;

    // Save to DB
    const { error } = await supabase
        .from("project_photos")
        .insert({ project_id: projectId, url: res.data });

    if (error) return ERR(error.message);
    return OK(res.data);
}

export async function getProjectPhotos(projectId: string) {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase
        .from("project_photos")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: true });
    if (error) { console.error(error); return []; }
    return data || [];
}

export async function deleteProjectPhoto(id: string, url: string) {
    if (!isSupabaseConfigured()) return ERR("Supabase not configured");
    // Extract filename from URL (assumes basic formatting .../bucket/filename)
    const fileName = url.split("/").pop();
    if (fileName) {
        await supabase.storage.from("ssm-project-assets").remove([fileName]);
    }
    const { error } = await supabase.from("project_photos").delete().eq("id", id);
    if (error) return ERR(error.message);
    revalidatePath("/admin/erp/projects");
    return OK();
}


// ==========================================
// WORKERS
// ==========================================

export async function getWorkers() {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase
        .from("workers")
        .select("*, projects(id, status, model_name, customers(name))")
        .order("name");
    if (error) { console.error(error); return []; }
    return data || [];
}

export async function saveWorker(worker: any) {
    if (!isSupabaseConfigured()) return ERR("Supabase not configured");
    const { id, projects, ...fields } = worker;
    let result;
    if (id) {
        result = await supabase.from("workers").update(fields).eq("id", id).select().single();
    } else {
        result = await supabase.from("workers").insert(fields).select().single();
    }
    if (result.error) return ERR(result.error.message);
    revalidatePath("/admin/erp/workers");
    return OK(result.data);
}

export async function deleteWorker(id: string) {
    if (!isSupabaseConfigured()) return ERR("Supabase not configured");
    const { error } = await supabase.from("workers").delete().eq("id", id);
    if (error) return ERR(error.message);
    revalidatePath("/admin/erp/workers");
    return OK();
}

// ==========================================
// PROJECTS
// ==========================================

export async function getProjects() {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase
        .from("projects")
        .select("*, customers(name, phone_number, whatsapp_number, address, display_id), workers(name), project_stages(*), transactions(*), project_photos(*)")
        .order("created_at", { ascending: false });
    if (error) { console.error(error); return []; }
    return data || [];
}

export async function getProject(id: string) {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase
        .from("projects")
        .select("*, customers(name, phone_number, address), workers(name, phone), transactions(*), project_stages(*), project_photos(*)")
        .eq("id", id)
        .single();
    if (error) return null;
    return data;
}

export async function saveProject(project: any) {
    if (!isSupabaseConfigured()) return ERR("Supabase not configured");
    const { id, ...fields } = project;
    // Remove virtual or transactional fields
    delete fields.customers;
    delete fields.workers;
    delete fields.transactions;
    delete fields.project_stages;
    delete fields.project_photos;
    delete fields.advance_amount;
    delete fields.advance_date;
    delete fields.payment_mode;

    let result;
    if (id) {
        result = await supabase.from("projects").update(fields).eq("id", id).select().single();
    } else {
        result = await supabase.from("projects").insert(fields).select().single();
    }
    if (result.error) return ERR(result.error.message);
    // Auto-create default stages if new project
    if (!id && result.data) {
        const stages = ["Measurement Done", "Material Ordered", "Fabrication", "Installation", "Delivered"];
        await supabase.from("project_stages").insert(
            stages.map(s => ({ project_id: result.data.id, stage_name: s, completed: false }))
        );
    }
    revalidatePath("/admin/erp/projects");
    return OK(result.data);
}

export async function deleteProject(id: string) {
    if (!isSupabaseConfigured()) return ERR("Supabase not configured");
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) return ERR(error.message);
    revalidatePath("/admin/erp/projects");
    return OK();
}

export async function updateProjectStage(id: string, completed: boolean) {
    if (!isSupabaseConfigured()) return ERR("Supabase not configured");
    const { error } = await supabase.from("project_stages").update({ completed, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) return ERR(error.message);
    return OK();
}

// ==========================================
// TRANSACTIONS
// ==========================================

export async function getTransactions(filters?: { project_id?: string }) {
    if (!isSupabaseConfigured()) return [];
    let query = supabase
        .from("transactions")
        .select("*, projects(model_name, customers(name))")
        .order("transaction_date", { ascending: false });
    if (filters?.project_id) query = query.eq("project_id", filters.project_id);
    const { data, error } = await query;
    if (error) { console.error(error); return []; }
    return data || [];
}

export async function saveTransaction(txn: any) {
    if (!isSupabaseConfigured()) return ERR("Supabase not configured");
    const { id, ...fields } = txn;
    delete fields.projects;
    let result;
    if (id) {
        result = await supabase.from("transactions").update(fields).eq("id", id).select().single();
    } else {
        result = await supabase.from("transactions").insert(fields).select().single();
    }
    if (result.error) return ERR(result.error.message);
    revalidatePath("/admin/erp/payments");
    revalidatePath("/admin/erp/projects");
    return OK(result.data);
}

export async function deleteTransaction(id: string) {
    if (!isSupabaseConfigured()) return ERR("Supabase not configured");
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) return ERR(error.message);
    revalidatePath("/admin/erp/payments");
    return OK();
}

export async function uploadERPFile(formData: FormData, bucket: string = "docs") {
    if (!isSupabaseConfigured()) return ERR("Supabase not configured");
    const file = formData.get("file") as File;
    if (!file) return ERR("No file provided");
    const ext = file.name.split(".").pop();
    const fileName = `${bucket}-${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage.from(bucket).upload(fileName, file, { upsert: true });
    if (error) return ERR(error.message);
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return OK(urlData.publicUrl);
}

export async function uploadTransactionScreenshot(formData: FormData) {
    return uploadERPFile(formData, "screenshots");
}

// ==========================================
// DASHBOARD STATS
// ==========================================

export async function getDashboardStats() {
    if (!isSupabaseConfigured()) return null;

    const [projectsRes, transactionsRes] = await Promise.all([
        supabase.from("projects").select("id, status, final_project_value, delivery_date, category, created_at"),
        supabase.from("transactions").select("type, amount, transaction_date"),
    ]);

    const projects = projectsRes.data || [];
    const transactions = transactionsRes.data || [];

    const totalRevenue = transactions
        .filter(t => t.type !== "Refund")
        .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

    const totalRefunded = transactions
        .filter(t => t.type === "Refund")
        .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

    const activeProjects = projects.filter(p => p.status === "In Progress").length;
    const completedProjects = projects.filter(p => p.status === "Completed").length;

    const totalProjectValue = projects.reduce((sum: number, p: any) => sum + (p.final_project_value || 0), 0);
    const pendingAmount = totalProjectValue - totalRevenue + totalRefunded;

    // Upcoming deliveries (next 7 days)
    const now = new Date();
    const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingDeliveries = projects.filter((p: any) => {
        if (!p.delivery_date || p.status === "Completed") return false;
        const d = new Date(p.delivery_date);
        return d >= now && d <= in7days;
    }).length;

    // Monthly revenue for the last 6 months
    const monthlyRevenue: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
        monthlyRevenue[key] = 0;
    }
    transactions.filter(t => t.type !== "Refund").forEach((t: any) => {
        const d = new Date(t.transaction_date);
        const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
        if (key in monthlyRevenue) monthlyRevenue[key] += t.amount || 0;
    });

    // Category revenue
    const categoryRevenue: Record<string, number> = {};
    projects.forEach((p: any) => {
        const cat = p.category || "Other";
        categoryRevenue[cat] = (categoryRevenue[cat] || 0) + (p.final_project_value || 0);
    });

    // Project status distribution
    const statusDist: Record<string, number> = {};
    projects.forEach((p: any) => {
        statusDist[p.status] = (statusDist[p.status] || 0) + 1;
    });

    return {
        totalRevenue,
        pendingAmount: Math.max(0, pendingAmount),
        activeProjects,
        completedProjects,
        upcomingDeliveries,
        monthlyRevenue: Object.entries(monthlyRevenue).map(([month, revenue]) => ({ month, revenue })),
        categoryRevenue: Object.entries(categoryRevenue).map(([name, value]) => ({ name, value })),
        statusDist: Object.entries(statusDist).map(([name, value]) => ({ name, value })),
    };
}

// ==========================================
// DYNAMIC CATEGORIES FOR ERP
// ==========================================

export async function getERPCategories() {
    if (!isSupabaseConfigured()) return [];
    const { data } = await supabase.from("service_categories").select("name").order("name");
    return (data || []).map(c => c.name);
}

export async function getERPSubCategories() {
    if (!isSupabaseConfigured()) return [];
    const { data } = await supabase.from("services").select("cat, title").order("title");
    return (data || []).map(s => ({ category: s.cat, subCategory: s.title }));
}
