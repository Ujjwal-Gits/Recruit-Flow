"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, CheckCircle2, KeyRound, ShieldCheck } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState<"email" | "otp" | "reset">("email");

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [otpDebug, setOtpDebug] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [countdown, setCountdown] = useState(0);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const fadeInUp = {
        initial: { opacity: 0, y: 15, filter: "blur(4px)" },
        animate: { opacity: 1, y: 0, filter: "blur(0px)" },
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    };

    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setInterval(() => setCountdown(c => c - 1), 1000);
        return () => clearInterval(timer);
    }, [countdown]);

    // ── Step 1: Request reset code ──
    const handleRequestCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Failed to send reset code.");
                setLoading(false);
                return;
            }

            setOtpDebug(data.otp_debug || "");
            setCountdown(data.expiresIn || 120);
            setStep("otp");
            setLoading(false);

        } catch (err) {
            setError("Network error.");
            setLoading(false);
        }
    };

    // ── Step 2: Verify OTP → go to reset form ──
    const handleVerifyCode = () => {
        const code = otp.join("");
        if (code.length !== 6) {
            setError("Enter the full 6-digit code.");
            return;
        }
        setError("");
        setStep("reset");
    };

    // ── Step 3: Reset password ──
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const code = otp.join("");
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code, newPassword, confirmPassword })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Failed to reset password.");
                setLoading(false);
                return;
            }

            setSuccess("Password reset! Redirecting to login...");
            setTimeout(() => router.push("/login"), 2000);

        } catch (err) {
            setError("Network error.");
            setLoading(false);
        }
    };

    // OTP input handling
    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) value = value.slice(-1);
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 5) inputRefs.current[index + 1]?.focus();
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
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
                        <div className="h-10 w-auto transition-transform group-hover:scale-105">
                            <img src="/recruit-flow-logo.png" alt="Recruit Flow" className="h-full w-auto object-contain" />
                        </div>
                    </Link>
                </motion.div>

                <AnimatePresence mode="wait">
                    {/* ── STEP 1: Enter Email ── */}
                    {step === "email" && (
                        <motion.div
                            key="email"
                            variants={fadeInUp}
                            initial="initial"
                            animate="animate"
                            exit={{ opacity: 0, x: -30 }}
                            className="bg-white border border-slate-200 rounded-lg p-10 shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_1px_2px_0_rgba(0,0,0,0.06)]"
                        >
                            <div className="mb-8 text-center">
                                <div className="size-14 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-5">
                                    <KeyRound className="size-6 text-slate-600" />
                                </div>
                                <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-1">Reset Password</h1>
                                <p className="text-slate-500 text-xs font-medium tracking-tight">Enter your email to receive a reset code.</p>
                            </div>

                            {error && (
                                <div className="mb-6 flex items-center gap-2 bg-red-50 border border-red-100 rounded-md px-4 py-3">
                                    <AlertCircle className="size-3.5 text-red-500 shrink-0" />
                                    <p className="text-xs text-red-600 font-medium">{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleRequestCode} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" required
                                            className="w-full bg-white border border-slate-200 rounded-md py-2.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all placeholder:text-slate-300" />
                                    </div>
                                </div>

                                <button type="submit" disabled={loading}
                                    className="w-full bg-slate-900 text-white rounded-md py-3 text-xs font-bold hover:bg-slate-800 transition-all active:scale-[0.99] flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed">
                                    {loading ? <Loader2 className="size-3.5 animate-spin" /> : <>Send Reset Code <ArrowRight className="size-3.5" /></>}
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {/* ── STEP 2: Enter OTP ── */}
                    {step === "otp" && (
                        <motion.div
                            key="otp"
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -30 }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            className="bg-white border border-slate-200 rounded-lg p-10 shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_1px_2px_0_rgba(0,0,0,0.06)]"
                        >
                            <div className="mb-8 text-center">
                                <div className="size-14 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-5">
                                    <ShieldCheck className="size-6 text-slate-600" />
                                </div>
                                <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-1">Enter Code</h1>
                                <p className="text-slate-500 text-xs font-medium tracking-tight">
                                    Sent to <span className="font-bold text-slate-700">{email}</span>
                                </p>
                            </div>

                            {error && (
                                <div className="mb-6 flex items-center gap-2 bg-red-50 border border-red-100 rounded-md px-4 py-3">
                                    <AlertCircle className="size-3.5 text-red-500 shrink-0" />
                                    <p className="text-xs text-red-600 font-medium">{error}</p>
                                </div>
                            )}

                            {otpDebug && (
                                <div className="mb-6 bg-amber-50 border border-amber-200 rounded-md px-4 py-3 text-center">
                                    <p className="text-[9px] font-bold text-amber-600 uppercase tracking-wider mb-1">Demo Mode — Your Code</p>
                                    <p className="text-2xl font-black text-amber-800 tracking-[0.3em] font-mono">{otpDebug}</p>
                                </div>
                            )}

                            <div className="flex justify-center gap-3 mb-6">
                                {otp.map((digit, i) => (
                                    <input key={i} ref={(el) => { inputRefs.current[i] = el; }} type="text" inputMode="numeric" maxLength={1} value={digit}
                                        onChange={(e) => handleOtpChange(i, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                        className="w-12 h-14 text-center text-xl font-bold border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all" />
                                ))}
                            </div>

                            <p className="text-center text-xs text-slate-400 font-medium mb-8">
                                {countdown > 0 ? (
                                    <>Expires in <span className="font-bold text-slate-700">{Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}</span></>
                                ) : (
                                    <span className="text-red-500 font-bold">Code expired</span>
                                )}
                            </p>

                            <button onClick={handleVerifyCode} disabled={countdown <= 0}
                                className="w-full bg-slate-900 text-white rounded-md py-3 text-xs font-bold hover:bg-slate-800 transition-all active:scale-[0.99] flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed">
                                Continue <ArrowRight className="size-3.5" />
                            </button>

                            <button onClick={() => { setStep("email"); setError(""); setOtp(["", "", "", "", "", ""]); }}
                                className="w-full mt-4 text-xs text-slate-400 font-bold hover:text-slate-900 transition-colors">
                                ← Back
                            </button>
                        </motion.div>
                    )}

                    {/* ── STEP 3: New Password ── */}
                    {step === "reset" && (
                        <motion.div
                            key="reset"
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -30 }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            className="bg-white border border-slate-200 rounded-lg p-10 shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_1px_2px_0_rgba(0,0,0,0.06)]"
                        >
                            <div className="mb-8 text-center">
                                <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-1">Set New Password</h1>
                                <p className="text-slate-500 text-xs font-medium tracking-tight">Choose a strong, unique password.</p>
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

                            <form onSubmit={handleResetPassword} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">New Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" required minLength={8}
                                            className="w-full bg-white border border-slate-200 rounded-md py-2.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all placeholder:text-slate-300" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Confirm Password</label>
                                    <div className="relative group">
                                        <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required minLength={8}
                                            className="w-full bg-white border border-slate-200 rounded-md py-2.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all placeholder:text-slate-300" />
                                    </div>
                                </div>

                                <button type="submit" disabled={loading}
                                    className="w-full bg-slate-900 text-white rounded-md py-3 text-xs font-bold hover:bg-slate-800 transition-all active:scale-[0.99] flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed">
                                    {loading ? <Loader2 className="size-3.5 animate-spin" /> : <>Reset Password <ArrowRight className="size-3.5" /></>}
                                </button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.p variants={fadeInUp} className="text-center mt-10 text-xs text-slate-400 font-medium tracking-tight">
                    Remember your password?{" "}
                    <Link href="/login" className="text-slate-900 font-bold hover:underline underline-offset-4">
                        Back to login
                    </Link>
                </motion.p>
            </motion.div>
        </div>
    );
}
