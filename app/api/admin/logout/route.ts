import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function POST() {
    if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set("ssm-admin-token", "", {
        httpOnly: true,
        maxAge: 0,
        path: "/",
    });
    return response;
}
