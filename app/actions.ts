"use server";

import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { HeroSlide, ServiceItem, ProductItem, SiteConfig, ServiceCategory } from "@/lib/siteData";
import * as fallbacks from "@/lib/siteData";
import { revalidatePath } from "next/cache";

// ==========================================
// SITE CONFIG
// ==========================================
export async function getSiteConfig() {
    if (!isSupabaseConfigured()) return fallbacks.siteConfig;
    const { data, error } = await supabase.from("site_config").select("*").single();
    if (error || !data) return fallbacks.siteConfig;

    return {
        businessName: data.business_name || fallbacks.siteConfig.businessName,
        tagline: data.tagline || fallbacks.siteConfig.tagline,
        phone: data.phone || fallbacks.siteConfig.phone,
        whatsapp: data.whatsapp || fallbacks.siteConfig.whatsapp,
        email: data.email || fallbacks.siteConfig.email,
        address: data.address || fallbacks.siteConfig.address,
        facebook: data.facebook || fallbacks.siteConfig.facebook,
        instagram: data.instagram || fallbacks.siteConfig.instagram,
        twitter: data.twitter || fallbacks.siteConfig.twitter,
        aboutStory: data.about_story || fallbacks.siteConfig.aboutStory,
        missionText: data.mission_text || fallbacks.siteConfig.missionText,
        visionText: data.vision_text || fallbacks.siteConfig.visionText,
    };
}

export async function saveSiteConfig(newConfig: typeof fallbacks.siteConfig) {
    if (!isSupabaseConfigured()) {
        return { success: false, error: "Supabase not configured. Please add your URL and Key to .env.local" };
    }

    const mapped = {
        business_name: newConfig.businessName,
        tagline: newConfig.tagline,
        phone: newConfig.phone,
        whatsapp: newConfig.whatsapp,
        email: newConfig.email,
        address: newConfig.address,
        facebook: newConfig.facebook,
        instagram: newConfig.instagram,
        twitter: newConfig.twitter,
        about_story: newConfig.aboutStory,
        mission_text: newConfig.missionText,
        vision_text: newConfig.visionText
    };

    const { error } = await supabase.from("site_config").update(mapped).eq("id", (await getSiteConfigId()));
    if (error) return { success: false, error: error.message };

    revalidatePath("/", "layout");
    return { success: true };
}

async function getSiteConfigId() {
    const { data } = await supabase.from("site_config").select("id").limit(1).single();
    return data?.id;
}

// ==========================================
// HERO SLIDES
// ==========================================
export async function getHeroSlides() {
    if (!isSupabaseConfigured()) return fallbacks.heroSlides;
    const { data, error } = await supabase.from("hero_slides").select("*").order("order_idx");
    if (error || !data || data.length === 0) return fallbacks.heroSlides;
    return data;
}

export async function saveHeroSlides(slides: typeof fallbacks.heroSlides) {
    if (!isSupabaseConfigured()) {
        return { success: false, error: "Supabase not configured. Please add your URL and Key to .env.local" };
    }

    // Clear existing and replace (simple approach for small arrays)
    await supabase.from("hero_slides").delete().neq("id", 0);
    const { error } = await supabase.from("hero_slides").insert(slides.map((s, i) => ({ ...s, order_idx: i })));

    if (error) return { success: false, error: error.message };
    revalidatePath("/", "layout");
    return { success: true };
}

// ==========================================
// SERVICES
// ==========================================
export async function getServices() {
    if (!isSupabaseConfigured()) return fallbacks.serviceItems;
    const { data, error } = await supabase.from("services").select("*").order("id");
    if (error || !data || data.length === 0) return fallbacks.serviceItems;
    return data.map(s => ({
        id: s.id,
        title: s.title,
        cat: s.cat,
        img: s.img,
        desc: s.desc_text
    }));
}

export async function saveService(service: typeof fallbacks.serviceItems[0] & { id?: number }) {
    if (!isSupabaseConfigured()) {
        return { success: false, error: "Supabase not configured. Please add your URL and Key to .env.local" };
    }

    const mapped = {
        title: service.title,
        cat: service.cat,
        img: service.img,
        desc_text: service.desc
    };

    const { data, error } = service.id
        ? await supabase.from("services").update(mapped).eq("id", service.id).select().single()
        : await supabase.from("services").insert(mapped).select().single();

    if (error) return { success: false, error: error.message };
    revalidatePath("/", "layout");
    return { success: true, data };
}

export async function getServiceCategories(): Promise<ServiceCategory[]> {
    if (!isSupabaseConfigured()) return [];
    const { data } = await supabase.from("service_categories").select("*").order("id");
    return data || [];
}

export async function saveServiceCategory(cat: ServiceCategory) {
    if (!isSupabaseConfigured()) return { success: false, error: "Supabase not configured" };

    const mapped = {
        name: cat.name,
        img: cat.img,
        icon: cat.icon
    };

    const { data, error } = cat.id > 0
        ? await supabase.from("service_categories").update(mapped).eq("id", cat.id).select().single()
        : await supabase.from("service_categories").insert(mapped).select().single();

    if (error) return { success: false, error: error.message };
    revalidatePath("/", "layout");
    return { success: true, data };
}

export async function deleteServiceCategory(id: number) {
    if (!isSupabaseConfigured()) return { success: false, error: "Supabase not configured" };
    const { error } = await supabase.from("service_categories").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidatePath("/", "layout");
    return { success: true };
}

export async function deleteService(id: number) {
    if (!isSupabaseConfigured()) {
        return { success: false, error: "Supabase not configured. Please add your URL and Key to .env.local" };
    }
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidatePath("/", "layout");
    return { success: true };
}

// ==========================================
// PRODUCTS
// ==========================================
export async function getProducts() {
    if (!isSupabaseConfigured()) return fallbacks.productItems;
    const { data, error } = await supabase.from("products").select("*").order("id");
    if (error || !data || data.length === 0) return fallbacks.productItems;
    return data.map(p => ({
        id: p.id,
        code: p.code,
        name: p.name,
        cat: p.cat,
        subCat: p.sub_cat,
        stock: p.stock,
        img: p.img,
        desc: p.desc_text
    }));
}

export async function saveProduct(product: typeof fallbacks.productItems[0] & { id?: number }) {
    if (!isSupabaseConfigured()) {
        return { success: false, error: "Supabase not configured. Please add your URL and Key to .env.local" };
    }

    const mapped = {
        code: product.code,
        name: product.name,
        cat: product.cat,
        sub_cat: product.subCat,
        stock: product.stock,
        img: product.img,
        desc_text: product.desc
    };

    const { data, error } = product.id
        ? await supabase.from("products").update(mapped).eq("id", product.id).select().single()
        : await supabase.from("products").insert(mapped).select().single();

    if (error) return { success: false, error: error.message };
    revalidatePath("/", "layout");
    return { success: true, data };
}

export async function deleteProduct(id: number) {
    if (!isSupabaseConfigured()) {
        return { success: false, error: "Supabase not configured. Please add your URL and Key to .env.local" };
    }
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidatePath("/", "layout");
    return { success: true };
}


// ==========================================
// IMAGE UPLOAD
// ==========================================
export async function uploadImage(formData: FormData) {
    if (!isSupabaseConfigured()) {
        console.warn("Supabase not configured. Cannot upload real images.");
        return { success: false, error: "Supabase not configured. Please add credentials to .env.local" };
    }

    const file = formData.get("file") as File;
    if (!file) return { success: false, error: "No file provided" };

    // Standard filename cleanup
    const timestamp = Date.now();
    const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, "-");
    const fileName = `${timestamp}-${cleanName}`;

    const { data, error } = await supabase.storage
        .from("images")
        .upload(fileName, file);

    if (error) return { success: false, error: error.message };

    const { data: { publicUrl } } = supabase.storage
        .from("images")
        .getPublicUrl(data.path);

    return { success: true, url: publicUrl };
}
