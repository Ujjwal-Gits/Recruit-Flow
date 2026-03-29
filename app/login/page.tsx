"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Mail, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import BouncyLoader from "@/components/BouncyLoader";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const fadeInUp = {
        initial: { opacity: 0, y: 15, filter: "blur(4px)" },
        animate: { opacity: 1, y: 0, filter: "blur(0px)" },
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Login failed.");
                setLoading(false);
                return;
            }

            // Store the session in Supabase client
            if (data.session?.access_token) {
                await supabase.auth.setSession({
                    access_token: data.session.access_token,
                    refresh_token: data.session.refresh_token
                });
            }

            // Redirect instantly to dashboard — the dashboard handles admin redirects itself
            setSuccess("Login successful! Redirecting...");
            router.push("/dashboard");

        } catch (err) {
            setError("Network error. Please try again.");
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError("");
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/api/auth/callback`
            }
        });
        if (error) setError(error.message);
    };

    return (
        <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6 font-sans">
            <motion.div
                className="w-full max-w-[400px]"
                initial="initial"
                animate="animate"
                variants={{
                    initial: { opacity: 0 },
                    animate: { opacity: 1, transition: { staggerChildren: 0.08 } }
                }}
            >
                {/* Header */}
                <motion.div variants={fadeInUp} className="text-center mb-10">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
                        <div className="h-16 w-auto transition-transform group-hover:scale-105">
                            <img src="/recruit-flow-logo.png" alt="Recruit Flow" className="h-full w-auto object-contain" />
                        </div>
                    </Link>
                </motion.div>

                {/* Wrapper for Card and Footer to shift them 1cm upward */}
                <div className="-translate-y-[1cm]">
                    {/* Card */}
                    <motion.div
                        variants={fadeInUp}
                        className="bg-white border border-slate-200 rounded-lg p-10 shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_1px_2px_0_rgba(0,0,0,0.06)]"
                    >
                    <div className="mb-8">
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-1">Sign in</h1>
                        <p className="text-slate-500 text-xs font-medium tracking-tight">to continue to Recruit Flow workspace</p>
                    </div>

                    {error && (
                        <div className="mb-6 flex items-center gap-2 bg-red-50 border border-red-100 rounded-md px-4 py-3">
                            <AlertCircle className="size-3.5 text-red-500 shrink-0" />
                            <p className="text-xs text-red-600 font-medium">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 flex items-center gap-2 bg-green-50 border border-green-100 rounded-md px-4 py-3">
                            <CheckCircle2 className="size-3.5 text-green-600 shrink-0" />
                            <p className="text-xs text-green-700 font-medium">{success}</p>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@company.com"
                                    required
                                    className="w-full bg-white border border-slate-200 rounded-md py-2.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all placeholder:text-slate-300"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Password</label>
                                <Link href="/forgot-password" className="text-[10px] font-bold text-slate-400 hover:text-slate-900 transition-colors">Forgot?</Link>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full bg-white border border-slate-200 rounded-md py-2.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all placeholder:text-slate-300"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 text-white rounded-md py-3 text-xs font-bold hover:bg-slate-800 transition-all active:scale-[0.99] flex items-center justify-center gap-2 mt-2 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? <BouncyLoader size="sm" /> : <>Continue <ArrowRight className="size-3.5" /></>}
                        </button>
                    </form>

                    <div className="relative my-10 text-center">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-100"></div>
                        </div>
                        <span className="relative bg-white px-3 text-[10px] font-bold uppercase tracking-widest text-slate-300">or use social</span>
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        className="w-full bg-white border border-slate-200 rounded-md py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-2.5 active:scale-[0.99] shadow-sm"
                    >
                        <svg className="size-4" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335" />
                        </svg>
                        Sign in with Google
                    </button>
                </motion.div>

                    {/* Footer Link */}
                    <motion.p variants={fadeInUp} className="text-center mt-10 text-xs text-slate-400 font-medium tracking-tight">
                        Don't have an account?{" "}
                        <Link href="/register" className="text-slate-900 font-bold hover:underline underline-offset-4">
                            Create one now
                        </Link>
                    </motion.p>
                </div>
            </motion.div>
        </div>
    );
}
