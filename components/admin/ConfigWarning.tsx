"use client";

import { AlertTriangle } from "lucide-react";

export default function ConfigWarning({ isConfigured }: { isConfigured: boolean }) {
    if (isConfigured) return null;

    return (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-4 flex items-center justify-between animate-in fade-in slide-in-from-top duration-500">
            <div className="flex items-center gap-3 text-amber-800">
                <AlertTriangle size={20} className="shrink-0" />
                <div>
                    <p className="font-black text-sm uppercase tracking-wider">Database Not Connected</p>
                    <p className="text-xs font-medium opacity-80">
                        Changes will not be saved. Please add your Supabase URL and Key to <code className="bg-amber-100 px-1 rounded">.env.local</code> and restart the server.
                    </p>
                </div>
            </div>
            <a
                href="https://supabase.com"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] font-black uppercase tracking-widest bg-amber-800 text-white px-4 py-2 rounded-lg hover:bg-amber-900 transition-colors"
            >
                Get Credentials
            </a>
        </div>
    );
}
