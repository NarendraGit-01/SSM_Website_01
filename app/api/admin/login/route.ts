import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        let authSuccess = false;
        let authError = "Invalid credentials";

        if (isSupabaseConfigured()) {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (!error) authSuccess = true;
            else authError = error.message;
        } else {
            // Fallback development credentials
            const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@ssm.com";
            const ADMIN_PASS = process.env.ADMIN_PASSWORD || "ssm123";
            if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
                authSuccess = true;
            }
        }

        if (authSuccess) {
            const response = NextResponse.json({ success: true });
            response.cookies.set("ssm-admin-token", "authenticated", {
                httpOnly: true,
                maxAge: 60 * 60 * 24 * 7, // 7 days
                sameSite: "lax",
                path: "/",
            });
            return response;
        }

        return NextResponse.json({ error: authError }, { status: 401 });
    } catch {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
