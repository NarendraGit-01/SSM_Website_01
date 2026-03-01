// ============================================================
// SSM Site Data Store
// This is an in-memory store for all editable site content.
// When Supabase is connected, replace these defaults with DB reads.
// ============================================================

export type HeroSlide = {
    id: number;
    img: string;
    tag: string;
    title: string;
    sub: string;
};

export type ServiceItem = {
    id: number;
    title: string;
    cat: string;
    desc: string;
    img: string;
};

export type ServiceCategory = {
    id: number;
    name: string;
    img: string;
    icon: string;
};

export type ProductItem = {
    id: number;
    code: string;
    name: string;
    cat: string;
    subCat: string;
    stock: boolean;
    img: string;
    desc: string;
};

// Removed Testimonials

export type SiteConfig = {
    businessName: string;
    tagline: string;
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
    aboutStory: string;
    missionText: string;
    visionText: string;
    facebook: string;
    instagram: string;
    twitter: string;
};

// ---- Default Data ----

export const heroSlides: HeroSlide[] = [
    {
        id: 1,
        img: "https://images.unsplash.com/photo-1590069230005-db393739d22b?q=80&w=1600&auto=format&fit=crop",
        tag: "Steel Gates",
        title: "The Art of\nStrong Entrances",
        sub: "Custom steel gates designed to last a lifetime — secure, elegant, and built to your vision.",
    },
    {
        id: 2,
        img: "https://images.unsplash.com/photo-1503708928676-1cb796a0891e?q=80&w=1600&auto=format&fit=crop",
        tag: "UPVC Windows",
        title: "Modern Windows,\nTimeless Comfort",
        sub: "Energy-efficient UPVC windows that keep your home cool, quiet, and beautiful.",
    },
    {
        id: 3,
        img: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=1600&auto=format&fit=crop",
        tag: "Home Interiors",
        title: "Luxury Interiors\nFor Modern Living",
        sub: "From kitchen modular units to wall panels — we design spaces you'll love every day.",
    },
    {
        id: 4,
        img: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1600&auto=format&fit=crop",
        tag: "Iron Works",
        title: "Iron Crafted\nWith Precision",
        sub: "Ornamental railings and structural iron work that blend safety with artistry.",
    },
];

export const serviceItems: ServiceItem[] = [
    // Steel Products
    { id: 1, title: "Stainless Steel Main Gate", cat: "Steel products", desc: "Premium custom-designed stainless steel entry gates.", img: "https://images.unsplash.com/photo-1590069230005-db393739d22b?q=80&w=800&auto=format&fit=crop" },
    { id: 2, title: "Stainless Steel Staircase Railing", cat: "Steel products", desc: "Durable and aesthetic SS railings for modern staircases.", img: "https://images.unsplash.com/photo-1510557880182-3d4d3cba3f21?q=80&w=800&auto=format&fit=crop" },
    { id: 3, title: "Stainless Steel Balcony Railing", cat: "Steel products", desc: "Safe and contemporary SS balcony enclosures.", img: "https://images.unsplash.com/photo-1628172901323-5c74fb3ff240?q=80&w=800&auto=format&fit=crop" },
    { id: 4, title: "Stainless Steel Safety Door", cat: "Steel products", desc: "High-security SS doors with elegant aesthetics.", img: "https://images.unsplash.com/photo-1517581177682-a085bc7fc0ce?q=80&w=800&auto=format&fit=crop" },
    { id: 5, title: "Stainless Steel Spiral Railing", cat: "Steel products", desc: "Curved and custom-bent SS spiral staircase handrails.", img: "https://images.unsplash.com/photo-1551608249-f0d5defa9ca2?q=80&w=800&auto=format&fit=crop" },
    { id: 6, title: "Stainless Steel Canopies", cat: "Steel products", desc: "Weather-resistant SS canopies with glass or polycarbonate.", img: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop" },

    // Iron Works
    { id: 7, title: "Iron Main Gate", cat: "Iron Works", desc: "Heavy-duty wrought and cast iron entry gates.", img: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop" },
    { id: 8, title: "Iron Stair Railing", cat: "Iron Works", desc: "Ornamental handcrafted iron railings for indoor and outdoor stairs.", img: "https://images.unsplash.com/photo-1551608249-f0d5defa9ca2?q=80&w=800&auto=format&fit=crop" },
    { id: 9, title: "Iron Balcony Railing", cat: "Iron Works", desc: "Classic cast iron balcony safety grilles.", img: "https://images.unsplash.com/photo-1628172901323-5c74fb3ff240?q=80&w=800&auto=format&fit=crop" },
    { id: 10, title: "Iron Safety Door", cat: "Iron Works", desc: "Robust ornamental iron security doors.", img: "https://images.unsplash.com/photo-1517581177682-a085bc7fc0ce?q=80&w=800&auto=format&fit=crop" },
    { id: 11, title: "Iron Spiral Stair", cat: "Iron Works", desc: "Space-saving elegant cast iron spiral staircases.", img: "https://images.unsplash.com/photo-1503708928676-1cb796a0891e?q=80&w=800&auto=format&fit=crop" },

    // UPVC Products
    { id: 12, title: "UPVC Doors", cat: "UPVC products", desc: "Weather-proof and soundproof UPVC entry and balcony doors.", img: "https://images.unsplash.com/photo-1503708928676-1cb796a0891e?q=80&w=800&auto=format&fit=crop" },
    { id: 13, title: "UPVC Windows", cat: "UPVC products", desc: "Energy-efficient sliding and casement UPVC windows.", img: "https://images.unsplash.com/photo-1605276374104-aa237e7ce871?q=80&w=800&auto=format&fit=crop" },

    // Interiors
    { id: 14, title: "Modular Kitchen", cat: "Interiors", desc: "Custom designed modern modular kitchens with premium fittings.", img: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=800&auto=format&fit=crop" },
    { id: 15, title: "Wooden Cupboards", cat: "Interiors", desc: "Space-optimized custom wardrobes and wooden cupboards.", img: "https://images.unsplash.com/photo-1595526051245-4506e0005bd0?q=80&w=800&auto=format&fit=crop" },
    { id: 16, title: "False Celining", cat: "Interiors", desc: "Elegant POP and Gypsum false ceiling designs with hidden lighting.", img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop" },

    // Lifts
    { id: 17, title: "Home Lifts", cat: "Home lifts", desc: "Compact, silent, and luxurious home elevator solutions.", img: "https://images.unsplash.com/photo-1588613146197-2fed2e05df5e?q=80&w=800&auto=format&fit=crop" },
    { id: 18, title: "Commercial Lifts", cat: "Home lifts", desc: "Reliable, high-capacity lifts for commercial establishments.", img: "https://images.unsplash.com/photo-1616010515152-dbf1a30f7855?q=80&w=800&auto=format&fit=crop" },
];

export const productItems: ProductItem[] = [
    { id: 1, code: "SS-MG-001", name: "Premium Laser Cut Gate", cat: "Steel products", subCat: "Stainless Steel Main Gate", stock: true, img: "https://images.unsplash.com/photo-1590069230005-db393739d22b?q=80&w=400&fit=crop", desc: "Luxury solid steel gate with premium laser cut design." },
    { id: 2, code: "SS-SR-012", name: "Glass & Steel Railing", cat: "Steel products", subCat: "Stainless Steel Staircase Railing", stock: true, img: "https://images.unsplash.com/photo-1510557880182-3d4d3cba3f21?q=80&w=400&fit=crop", desc: "Modern staircase railing with toughened glass." },
    { id: 3, code: "UP-DR-105", name: "Sliding Patio Door", cat: "UPVC products", subCat: "UPVC doors", stock: true, img: "https://images.unsplash.com/photo-1503708928676-1cb796a0891e?q=80&w=400&fit=crop", desc: "Smooth sliding UPVC door for patios and balconies." },
    { id: 4, code: "UP-WD-202", name: "Casement Window", cat: "UPVC products", subCat: "UPVC Windows", stock: false, img: "https://images.unsplash.com/photo-1605276374104-aa237e7ce871?q=80&w=400&fit=crop", desc: "Classic openable casement window with acoustic seal." },
    { id: 5, code: "IR-FN-055", name: "Ornamental Iron Safety Door", cat: "Iron Works", subCat: "Iron Safety Door", stock: true, img: "https://images.unsplash.com/photo-1517581177682-a085bc7fc0ce?q=80&w=400&fit=crop", desc: "Robust security door with ornamental iron filigree." },
];

// Removed Testimonials

export const siteConfig: SiteConfig = {
    businessName: "Srinivasa Steel Metals",
    tagline: "Premium Gates, UPVC & Interiors",
    phone: "+91 99999 88888",
    whatsapp: "+919999988888",
    email: "contact@ssmetals.com",
    address: "123 Industrial Area, Phase II, Hyderabad, Telangana 500001",
    aboutStory: "Founded with a vision to revolutionize the steel fabrication industry, SSM started as a small workshop specializing in ornamental gates. Our dedication to quality and precision quickly earned us the trust of elite homeowners. Today, we have expanded into UPVC windows, modern interior design, and home lift installations.",
    missionText: "To provide innovative, durable, and aesthetically superior infrastructure solutions that enhance the security and beauty of every home.",
    visionText: "To become India's leading manufacturer of custom home infrastructure, known for craftsmanship and technological excellence.",
    facebook: "https://facebook.com/ssm",
    instagram: "https://instagram.com/ssm",
    twitter: "https://twitter.com/ssm",
};
