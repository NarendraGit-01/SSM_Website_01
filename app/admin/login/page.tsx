"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, User, Hammer, ArrowRight, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";
import { Suspense } from "react";

function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get("redirect") || "/admin/dashboard";

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (res.ok) {
                router.push(redirect);
                router.refresh();
            } else {
                const data = await res.json();
                setError(data.error || "Invalid credentials. Please try again.");
                setLoading(false);
            }
        } catch {
            setError("Connection error. Server may be offline.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-forest flex flex-col items-center justify-center px-6 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-mint/5 rounded-full blur-3xl -ml-48 -mt-48" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-mint/5 rounded-full blur-3xl -mr-48 -mb-48" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white p-12 rounded-[3rem] shadow-2xl w-full max-w-md relative z-10"
            >
                {/* Logo */}
                <div className="flex flex-col items-center gap-4 mb-10">
                    <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="bg-forest p-5 rounded-3xl shadow-xl"
                    >
                        <Hammer className="text-mint w-10 h-10" />
                    </motion.div>
                    <div className="text-center">
                        <h1 className="text-2xl font-black text-forest uppercase">SSM Admin</h1>
                        <span className="text-[10px] font-black text-slate/40 uppercase tracking-[0.2em]">Secure Content Manager</span>
                    </div>
                </div>

                {/* Error Alert */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 bg-rose-50 text-rose-600 p-4 rounded-2xl mb-6 font-semibold text-sm"
                    >
                        <ShieldAlert size={18} />
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleLogin} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest ml-1">Admin Email</label>
                        <div className="relative">
                            <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate/30" size={18} />
                            <input
                                type="email"
                                required
                                autoComplete="email"
                                className="w-full bg-pearl border-none rounded-2xl p-5 pl-12 text-forest font-bold placeholder:text-slate/20 focus:ring-2 focus:ring-forest/20"
                                placeholder="admin@gmail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase text-slate/40 tracking-widest ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate/30" size={18} />
                            <input
                                type="password"
                                required
                                autoComplete="current-password"
                                className="w-full bg-pearl border-none rounded-2xl p-5 pl-12 text-forest font-bold placeholder:text-slate/20 focus:ring-2 focus:ring-forest/20"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-forest text-mint p-6 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:scale-[1.02] disabled:scale-100 disabled:opacity-70 transition-all shadow-xl shadow-forest/20 mt-4"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-mint/30 border-t-mint rounded-full animate-spin" />
                                Authenticating...
                            </>
                        ) : (
                            <>
                                Login to Workspace
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>

                    <div className="flex items-center justify-center gap-2 mt-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <p className="text-center text-xs text-slate/40 font-medium">
                            Secured with httpOnly cookies & session validation
                        </p>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

export default function AdminLoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-forest" />}>
            <LoginForm />
        </Suspense>
    );
}
