"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, PlayCircle, Verified, Bolt, CheckCircle, Snowflake, FileText, Sparkles, Eye, Network, Shield, X, MessageSquare, QrCode, ShieldCheck, LayoutDashboard } from "lucide-react";
import BouncyLoader from "@/components/BouncyLoader";
import { supabase } from "@/lib/supabase";
import PublicNavbar from "@/components/PublicNavbar";

export default function LandingPage() {
    const [isTicked, setIsTicked] = useState(false);
    const [count, setCount] = useState(8421);
    const [showLoginMsg, setShowLoginMsg] = useState(false);
    const [atsScore, setAtsScore] = useState(0);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currency, setCurrency] = useState('$');
    const [multiplier, setMultiplier] = useState(1);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<{name: string, price: string} | null>(null);
    const [paymentMessage, setPaymentMessage] = useState('');
    const [messageSent, setMessageSent] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [userRole, setUserRole] = useState<string | null>(null);
    const [roleLoading, setRoleLoading] = useState(true);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

    const fadeInUp = {
        initial: { opacity: 0, y: 30, filter: "blur(10px)", scale: 0.98 },
        whileInView: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            scale: 1
        },
        exit: {
            opacity: 0,
            y: -20,
            filter: "blur(5px)",
            scale: 1.02
        },
        transition: {
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1] as any
        },
        viewport: { once: false, margin: "-50px" }
    };

    const staggerContainer = {
        initial: {},
        whileInView: {
            transition: {
                staggerChildren: 0.15
            }
        },
        exit: {
            transition: {
                staggerChildren: 0.05,
                staggerDirection: -1
            }
        }
    };

    // Check real auth session
    useEffect(() => {
        const fetchRole = async () => {
            setRoleLoading(true);
            try {
                const res = await fetch('/api/profile', { cache: 'no-store' });
                if (res.ok) {
                    const { profile } = await res.json();
                    setUserRole(profile?.role ?? null);
                } else {
                    setUserRole(null);
                }
            } catch {
                setUserRole(null);
            } finally {
                setRoleLoading(false);
            }
        };

        supabase.auth.getSession().then(({ data: { session } }) => {
            setIsLoggedIn(!!session);
            if (session?.user?.email) setUserEmail(session.user.email);
            if (session?.user?.id) {
                fetchRole();
            } else {
                setRoleLoading(false);
                setUserRole(null);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsLoggedIn(!!session);
            if (session?.user?.email) setUserEmail(session.user.email);
            if (session?.user?.id) {
                fetchRole();
            } else {
                setUserRole(null);
                setRoleLoading(false);
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setAtsScore(prev => (prev < 100 ? prev + 1 : 0));
        }, 100);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (showPaymentModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showPaymentModal]);

    useEffect(() => {
        let mounted = true;
        const checkLocation = async () => {
            try {
                // First pass - Timezone check
                const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                if (tz && (tz.toLowerCase().includes('kathmandu') || tz.toLowerCase().includes('asia/dhaka') /* some fallback mappings */)) {
                    if (mounted) {
                        setCurrency('NPR ');
                        setMultiplier(130);
                    }
                    return; // Early return if tz is clearly Nepal
                }
                
                // Second pass - IP based reliable check if TZ is inconclusive
                const res = await fetch('https://get.geojs.io/v1/ip/country.json');
                const data = await res.json();
                if (mounted) {
                    if (data.country === 'NP' || data.name === 'Nepal') {
                        setCurrency('NPR ');
                        setMultiplier(130);
                    } else {
                        setCurrency('$');
                        setMultiplier(1);
                    }
                }
            } catch (e) {
                if (mounted) {
                    setCurrency('$');
                    setMultiplier(1);
                }
            }
        };
        
        checkLocation();
        
        return () => { mounted = false; };
    }, []);

    const handleTick = () => {
        if (!isLoggedIn) {
            setShowLoginMsg(true);
            setTimeout(() => setShowLoginMsg(false), 3000);
            return;
        }
        setIsTicked(!isTicked);
        setCount(prev => (isTicked ? prev - 1 : prev + 1));
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-deep-slate antialiased min-h-screen">
            {/* 1. Floating Navigation */}
            <PublicNavbar />

            {/* 2. Hero Section */}
            <section className="relative overflow-hidden min-h-screen flex items-center">
                <div className="absolute inset-0 z-0 opacity-[0.7] pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '16px 16px' }}>
                </div>

                <div className="relative w-full pt-24 pb-12 px-5 max-w-7xl mx-auto z-10">
                    <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                        <motion.div className="space-y-6 relative" {...fadeInUp}>
                            {/* Sticky note — hidden on mobile, shown md+ */}
                            <div className="hidden md:block absolute -top-32 right-0 md:-right-28 z-20 pointer-events-auto">
                                <motion.div
                                    className="relative w-[220px] aspect-square bg-[#fff9c4] shadow-2xl p-6 transform -rotate-[0.5deg] border border-yellow-200/50"
                                    initial={{ opacity: 0, rotate: -10, scale: 0.9 }}
                                    whileInView={{ opacity: 1, rotate: -0.5, scale: 1 }}
                                    viewport={{ once: false }}
                                    transition={{ duration: 1, delay: 0.3, type: "spring" }}
                                >
                                    <div className="absolute top-3 left-1/2 -translate-x-1/2 size-2 bg-red-500 rounded-full shadow-sm ring-4 ring-red-500/10"></div>
                                    <div className="space-y-5 pt-4">
                                        <p className="text-slate-600 leading-relaxed text-base tracking-wide" style={{ fontFamily: '"Caveat", cursive' }}>
                                            "I do a commitment to use Recruit Flow for better experience."
                                        </p>
                                        <div className="space-y-4 pt-4 border-t border-yellow-600/20">
                                            <div className="flex items-center gap-3 group cursor-pointer" onClick={handleTick}>
                                                <div className={`size-5 rounded flex items-center justify-center transition-all border ${isTicked ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-300 group-hover:border-slate-900'}`}>
                                                    <CheckCircle className={`size-3 text-white transition-opacity ${isTicked ? 'opacity-100' : 'opacity-0'}`} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className={`text-[11px] tracking-widest uppercase transition-all ${isTicked ? 'text-slate-400 line-through' : 'text-slate-900 font-medium'}`}>
                                                        Formal Commitment
                                                    </p>
                                                    {showLoginMsg && (
                                                        <p className="text-[9px] text-red-500 font-bold mt-0.5 whitespace-nowrap">
                                                            Login required
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between pt-1 opacity-80">
                                                <div className="flex -space-x-1.5">
                                                    {[1, 2, 3].map(i => (
                                                        <div key={i} className="size-5 rounded-full border border-yellow-500/20 bg-slate-200 overflow-hidden">
                                                            <div className="w-full h-full bg-slate-300"></div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <span className="text-[9px] font-medium text-slate-700 whitespace-nowrap">{(count / 1000).toFixed(1)}k Users Committed</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                                Hire Staff with <br />Absolute Precision.
                            </h1>
                            <p className="text-sm sm:text-base text-slate-500 max-w-sm leading-relaxed">
                                The minimalist engine for modern recruitment. Intelligent candidate insights delivered instantly.
                            </p>
                            <div className="flex items-center gap-4 pt-2">
                                <Link
                                    href={isLoggedIn
                                        ? (['owner', 'manager', 'support', 'admin'].includes(userRole || '') ? '/iamadmin' : '/dashboard')
                                        : '/login'
                                    }
                                    className="bg-slate-900 text-white px-6 sm:px-8 py-3.5 rounded text-xs font-black uppercase tracking-[0.15em] hover:bg-slate-800 transition-all active:scale-95 shadow-lg h-12 flex items-center gap-2.5 w-full sm:w-auto justify-center"
                                >
                                    <LayoutDashboard className="size-4 text-slate-400" />
                                    Post a Vacancy
                                </Link>
                            </div>
                        </motion.div>

                        <motion.div
                            className="relative flex items-center justify-center lg:justify-end md:pr-24"
                            {...fadeInUp}
                            transition={{ ...fadeInUp.transition, delay: 0.2 }}
                        >
                            <div className="relative w-[260px] h-[380px] sm:w-[310px] sm:h-[440px] md:translate-x-32">
                                <div className="absolute inset-0 bg-slate-100 border border-slate-200 rounded shadow-sm -rotate-12 -translate-x-12 translate-y-4 overflow-hidden pointer-events-none">
                                    <div className="p-6 h-full flex flex-col space-y-4 opacity-30 grayscale text-slate-900 font-sans">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-0.5">
                                                <h2 className="text-xs font-bold tracking-tight leading-none">Alex Rivera</h2>
                                                <p className="text-[7px] font-bold uppercase tracking-widest text-slate-500">Backend Engineer</p>
                                            </div>
                                            <div className="size-8 rounded-full border border-slate-200 bg-slate-200 shadow-sm overflow-hidden">
                                                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&h=150&auto=format&fit=crop" alt="Photo" className="w-full h-full object-cover rounded-full" />
                                            </div>
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <div className="space-y-2">
                                                <p className="text-[7px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-0.5">Experience</p>
                                                <div className="space-y-2 text-[6px] text-slate-500 leading-tight">
                                                    <p className="font-bold text-slate-900">Staff Engineer @ Orion</p>
                                                    <p>Architected distributed systems serving millions.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <article className="relative w-full h-full bg-white border border-slate-200 rounded-lg shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] p-8 flex flex-col rotate-2">
                                    <header className="mb-6 pt-3">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="space-y-1">
                                                <h2 className="text-base font-bold text-slate-900 tracking-tight leading-none">Sarah Chen</h2>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Product Designer</p>
                                            </div>
                                            <div className="size-10 rounded-full border border-slate-100 p-0.5 shadow-sm overflow-hidden bg-slate-50">
                                                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&h=150&auto=format&fit=crop" alt="Photo" className="w-full h-full object-cover rounded-full grayscale-[0.2]" />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-[7px] text-slate-400 font-bold uppercase tracking-widest">
                                            <span>SF, CA</span>
                                            <span className="size-0.5 bg-slate-300 rounded-full"></span>
                                            <span>8+ YRS EXP</span>
                                        </div>
                                    </header>
                                    <div className="flex-1 space-y-6">
                                        <section className="space-y-3">
                                            <h3 className="text-[8px] font-black text-slate-900 uppercase tracking-[0.2em] border-b border-slate-50 pb-1">Experience</h3>
                                            <div className="space-y-3">
                                                <div className="flex justify-between text-[9px] font-bold text-slate-800">
                                                    <span>Lead Designer @ Meta</span>
                                                    <span className="text-slate-400 font-normal italic">2021 — Pres.</span>
                                                </div>
                                            </div>
                                        </section>
                                    </div>
                                    <footer className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="size-5 bg-slate-900 rounded-md flex items-center justify-center">
                                                <CheckCircle className="size-3 text-white" />
                                            </div>
                                            <span className="text-[9px] font-black text-slate-900 uppercase tracking-tighter">Verified</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">Score</p>
                                            <p className="text-lg font-black text-slate-900 leading-none tracking-tight">98.4</p>
                                        </div>
                                    </footer>
                                </article>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 3. Social Proof */}
            <motion.section className="py-10 border-y border-slate-100 bg-slate-50/30" {...fadeInUp}>
                <div className="max-w-7xl mx-auto px-5">
                    <h4 className="text-center font-mono text-[10px] uppercase tracking-widest text-slate-400 mb-8">Trusted by Global Innovators</h4>
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-20 opacity-30 grayscale">
                        <div className="text-xl font-black italic tracking-tighter">VOLTA</div>
                        <div className="text-xl font-black italic tracking-tighter">ORION</div>
                        <div className="text-xl font-black italic tracking-tighter">HEXA</div>
                        <div className="text-xl font-black italic tracking-tighter">QUANTUM</div>
                        <div className="text-xl font-black italic tracking-tighter">APEX</div>
                    </div>
                </div>
            </motion.section>

            {/* 4. The Bridge Section */}
            <section className="py-16 md:py-24 max-w-7xl mx-auto px-5">
                <motion.div className="text-center mb-12 md:mb-16" {...fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-800 mb-4">The Professional Nexus</h2>
                    <p className="font-mono text-xs text-slate-500 uppercase tracking-[0.2em] font-bold">The intelligent medium where talent meets vision</p>
                </motion.div>

                <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 lg:gap-24 md:px-12">
                    {/* The Connecting Line (Improved Centering) */}
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-200 hidden md:flex items-center justify-center -translate-y-1/2 z-0">
                        <motion.div
                            className="size-12 rounded-full border border-slate-200 bg-white flex items-center justify-center shadow-sm group cursor-pointer z-10"
                            whileHover={{ scale: 1.1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                            <span className="material-symbols-outlined text-slate-400 animate-pulse group-hover:text-slate-900 transition-colors">hub</span>
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded shadow-xl opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all pointer-events-none whitespace-nowrap">
                                Recruit Flow
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 size-2 bg-slate-900 rotate-45"></div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Recruiter Card */}
                    <motion.div
                        className="z-10 bg-white p-8 rounded-lg border border-slate-200 w-full max-w-sm shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]"
                        {...fadeInUp}
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="size-14 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 grayscale opacity-80">
                                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjWNIjKUf-Z5oTW9IkX7j21EbtmDR6e_fxEu0oeOo4u8oUwY0uSRj9p57U65MoG09Z99bUQWauNLHS4xpUCsYrb2vXuvq6FtcxNQ81tVHUy5tsbgGBK5LN2o9xLx2B2fL52jn8BNGjcDvjVe1LXVRzDueXcXZkD1U2VhCEIiYnqbgic8XORDrWocjSV1uzn7fP1LuV_380_-BQl7_U4mXGVKy2UgNagOSuUAAzw_H0eU4M-f63jNHq_Jp7qXU8hbmXUW1Av98hM1w" alt="Recruiter" className="w-full h-full object-cover" />
                            </div>
                            <div><p className="font-bold text-slate-800">Recruiter</p><p className="text-xs font-mono text-slate-400">Talent Acquisition Lead</p></div>
                        </div>
                        <div className="space-y-2 mb-6">
                            <div className="w-full h-2 bg-slate-200 rounded animate-skeleton-slow"></div>
                            <div className="w-3/4 h-2 bg-slate-200 rounded animate-skeleton-slow" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <button className="w-full py-2 border border-slate-200 rounded text-xs font-mono text-slate-800 hover:border-slate-800 transition-all uppercase tracking-widest">VIEW PIPELINE</button>
                    </motion.div>

                    {/* Mobile vertical connector — hidden on md+ */}
                    <div className="flex md:hidden flex-col items-center z-10 -my-4">
                        <div className="w-px h-8 bg-slate-200" />
                        <div className="size-10 rounded-full border border-slate-200 bg-white flex items-center justify-center shadow-sm my-1">
                            <span className="material-symbols-outlined text-slate-400 text-base">hub</span>
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">Recruit Flow</p>
                        <div className="w-px h-8 bg-slate-200 mt-1" />
                    </div>

                    {/* Applicant Card */}
                    <motion.div
                        className="z-10 bg-white p-8 rounded-lg border border-slate-200 w-full max-w-sm shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]"
                        {...fadeInUp}
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="size-14 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 grayscale opacity-80">
                                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNEiJgTdNd-FezP6ArF2B2urPB_hWZHxb_aIJcUhOIvmGZMyvODl4yUwwydwnFsTzbGmmbv5ckKLCM8q1TndkrV60hOTN6reBp2vpYjONCxicO4s8DsVtfBNQ-omx9kzER3FxVMc-yA0T2Mnt1AaT26WtsaqdTDHzVcns8tzJlopdH0Tvmas-VEMHKT2jztr_9KGMrZfkSoDflkTQa1uA_knTq9CoPRpFFjEtMy6nkJLNrNdojckG6JH1IQf99iaKY32RprP31X6M" alt="Applicant" className="w-full h-full object-cover" />
                            </div>
                            <div><p className="font-bold text-slate-800">Applicant</p><p className="text-xs font-mono text-slate-500">Senior Architecture Lead</p></div>
                        </div>
                        <div className="space-y-2 mb-6">
                            <div className="w-full h-2 bg-slate-200 rounded animate-skeleton-slow"></div>
                            <div className="w-3/4 h-2 bg-slate-200 rounded animate-skeleton-slow" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <button className="w-full py-2 bg-slate-900 text-white rounded text-xs font-mono hover:bg-slate-800 transition-all uppercase tracking-widest">INVITE TO INTERVIEW</button>
                    </motion.div>
                </div>
            </section>

            {/* 5. The Flipbook Innovation */}
            <section className="py-16 md:py-24 px-5 max-w-6xl mx-auto">
                <motion.div className="text-center mb-12 md:mb-16" {...fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight mb-4 text-slate-900">
                        Stop downloading PDFs.<br />
                        <span className="text-slate-400">Start reading stories.</span>
                    </h2>
                    <p className="text-slate-500 max-w-xl mx-auto font-medium text-sm md:text-base">Our Flipbook engine visualizes candidate data in high-fidelity, transforming static resumes into living performance models.</p>
                </motion.div>

                <motion.div
                    className="grid md:grid-cols-2 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden shadow-sm"
                    {...fadeInUp}
                >
                    <div className="bg-white p-12 space-y-8">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                            <div className="flex items-center gap-3">
                                <div className="size-8 bg-slate-50 rounded flex items-center justify-center"><span className="material-symbols-outlined text-slate-400 text-sm">description</span></div>
                                <div><span className="block text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">PDF Source</span><span className="text-[8px] text-slate-400 font-mono uppercase">Standard_Ingest_v1</span></div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="h-4 w-2/3 bg-slate-200 rounded animate-skeleton-slow"></div>
                            <div className="h-2 w-full bg-slate-200 rounded-full animate-skeleton-slow"></div>
                        </div>
                    </div>

                    <div className="bg-white p-12 space-y-8">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">AI Narrative View</span>
                            <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full"><span className="material-symbols-outlined text-slate-400 text-sm">bolt</span><span className="font-mono text-[9px] text-slate-500 uppercase tracking-tighter font-bold">Instant_Process</span></div>
                        </div>
                        <div className="flex items-center gap-8">
                            <div className="relative size-24 flex items-center justify-center">
                                <svg className="size-full transform -rotate-90">
                                    <circle cx="48" cy="48" fill="transparent" r="42" stroke="#f8fafc" strokeWidth="8"></circle>
                                    <circle cx="48" cy="48" fill="transparent" r="42" stroke="#0f172a" strokeWidth="8" strokeDasharray="264" strokeDashoffset={264 - (264 * (atsScore / 100))} strokeLinecap="round"></circle>
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-xl font-black text-slate-900 leading-none">{atsScore}</span><span className="text-[9px] font-mono text-slate-400 uppercase tracking-tighter">ATS</span></div>
                            </div>
                            <div className="space-y-2 flex-1">
                                <div className="h-2 w-full bg-slate-200 rounded-full animate-skeleton-slow"></div>
                                <p className="text-xs text-slate-500 mt-2 leading-relaxed italic font-medium opacity-80">Candidate demonstrates exceptional system design skills.</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* 5.5. Pricing Section */}
            <section className="py-16 md:py-24 bg-slate-50 border-y border-slate-100 relative overflow-hidden" id="pricing">
                <style jsx>{`
                    @keyframes pure-glass-shine {
                        0% { transform: translateX(-150%) skewX(12deg); }
                        100% { transform: translateX(200%) skewX(12deg); }
                    }
                    .pure-animate-shine {
                        animation: pure-glass-shine 3s infinite ease-in-out;
                    }
                `}</style>

                <div className="absolute inset-0 z-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, #E2E8F0 0%, transparent 70%)' }}></div>
                <div className="max-w-7xl mx-auto px-5 relative z-10">
                    <motion.div className="text-center mb-10 md:mb-16" {...fadeInUp}>
                        <span className="font-mono text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mb-4 block">Access Tiers</span>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tighter mb-4">Transparent Pricing.</h2>
                        <p className="text-slate-500 max-w-xl mx-auto font-medium mb-8 text-sm">Equip your talent team with the right tools. Upgrade anytime.</p>
                        <div className="inline-flex items-center bg-slate-100 rounded-md p-1 gap-0">
                            <button onClick={() => setBillingCycle('monthly')}
                                className={`px-4 sm:px-5 py-2 rounded text-[10px] font-black uppercase tracking-widest transition-all ${billingCycle === 'monthly' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
                            >Monthly</button>
                            <button onClick={() => setBillingCycle('annual')}
                                className={`px-4 sm:px-5 py-2 rounded text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${billingCycle === 'annual' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
                            >Annual <span className={`text-[8px] px-1.5 py-0.5 rounded ${billingCycle === 'annual' ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-600'}`}>Save 25%</span></button>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-center max-w-5xl mx-auto">                        {/* Free Tier */}
                        <motion.div
                            className="bg-white rounded-md p-6 sm:p-8 border border-slate-200 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all flex flex-col relative group"
                            {...fadeInUp}
                        >
                            <div className="mb-6">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase mb-2">Essential</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-black text-slate-900">{currency}0</span>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">/mo</span>
                                </div>
                            </div>
                            <ul className="space-y-3 mb-8 flex-1">
                                <li className="flex items-start gap-3 text-sm font-medium text-slate-600"><CheckCircle className="size-4 text-slate-300 mt-0.5 shrink-0" /> 1 Active Job Posting</li>
                                <li className="flex items-start gap-3 text-sm font-medium text-slate-600"><CheckCircle className="size-4 text-slate-300 mt-0.5 shrink-0" /> 5 CV Processing Capacity</li>
                                <li className="flex items-start gap-3 text-sm font-medium text-slate-600"><CheckCircle className="size-4 text-slate-300 mt-0.5 shrink-0" /> Basic Candidate Preview</li>
                                <li className="flex items-start gap-3 text-sm font-medium text-slate-300 opacity-70 uppercase tracking-widest font-mono text-[9px]"><span className="material-symbols-outlined text-[14px]">block</span> No CRM Analytics</li>
                                <li className="flex items-start gap-3 text-sm font-medium text-slate-300 opacity-70 uppercase tracking-widest font-mono text-[9px]"><span className="material-symbols-outlined text-[14px]">block</span> Limited Support</li>
                            </ul>
                            <div className="group relative w-full h-12 flex items-center justify-center bg-white border border-slate-200 rounded text-[10px] font-black uppercase tracking-[0.2em] shadow-sm cursor-default overflow-hidden">
                                <span className="relative z-10 text-slate-400">Free</span>
                            </div>
                        </motion.div>

                        {/* Medium Tier */}
                        <motion.div
                            className="relative rounded-lg p-6 sm:p-8 border border-slate-900/5 bg-white shadow-2xl hover:shadow-[0_40px_80px_-20px_rgba(15,23,42,0.15)] flex flex-col group overflow-hidden sm:col-span-2 lg:col-span-1 lg:-translate-y-4 transition-all duration-500"
                            {...fadeInUp}
                            transition={{ ...fadeInUp.transition, delay: 0.1 }}
                        >
                            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(248,250,252,0.8)_0%,rgba(255,255,255,1)_50%,rgba(241,245,249,0.8)_100%)] z-0"></div>
                            <div className="absolute inset-0 -translate-x-[150%] pure-animate-shine bg-gradient-to-r from-transparent via-slate-900/5 to-transparent z-10 pointer-events-none transform skew-x-[12deg]"></div>
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 px-6 py-1.5 bg-slate-900 rounded-b-md z-20 shadow-xl">
                                <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Professional</span>
                            </div>

                            <div className="mb-6 relative z-20 mt-6">
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase mb-2 flex items-center gap-3">
                                    <Sparkles className="size-5 text-amber-500" /> Arctic Pro
                                </h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black text-slate-900">{currency}{billingCycle === 'monthly' ? (multiplier === 1 ? '6.99' : '499') : (multiplier === 1 ? '64.99' : '4,499')}</span>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{billingCycle === 'monthly' ? '/mo' : '/yr'}</span>
                                </div>
                                {billingCycle === 'annual' && <p className="text-[10px] text-emerald-600 font-bold mt-1">Save {multiplier === 1 ? '$18.89' : 'NPR 1,489'} vs monthly</p>}
                            </div>
                            <ul className="space-y-4 mb-8 flex-1 relative z-20">
                                <li className="flex items-start gap-3 text-sm font-bold text-slate-900"><CheckCircle className="size-4 text-slate-900 mt-0.5" /> 4 Active Job Listings</li>
                                <li className="flex items-start gap-3 text-sm font-bold text-slate-900"><CheckCircle className="size-4 text-slate-900 mt-0.5" /> 30 CV Processing Capacity</li>
                                <li className="flex items-start gap-3 text-sm font-medium text-slate-600"><CheckCircle className="size-4 text-slate-900 mt-0.5" /> Interactive Flipbook Engine</li>
                                <li className="flex items-start gap-3 text-sm font-medium text-slate-600"><CheckCircle className="size-4 text-slate-900 mt-0.5" /> Direct Support Connection</li>
                                <li className="flex items-start gap-3 text-sm font-medium text-slate-600"><CheckCircle className="size-4 text-slate-900 mt-0.5" /> Candidate CRM Access</li>
                                <li className="flex items-start gap-3 text-sm font-medium text-slate-600"><CheckCircle className="size-4 text-slate-900 mt-0.5" /> AI Profile Narrative Summary</li>
                                <li className="flex items-start gap-3 text-sm font-medium text-slate-600"><CheckCircle className="size-4 text-slate-900 mt-0.5" /> Automated Email Workflows</li>
                            </ul>
                             <button 
                                onClick={() => {
                                    if (!isLoggedIn) { setShowLoginMsg(true); setTimeout(() => setShowLoginMsg(false), 3000); return; }
                                    const price = billingCycle === 'monthly' 
                                        ? `${currency}${multiplier === 1 ? '6.99' : '499'}/mo`
                                        : `${currency}${multiplier === 1 ? '64.99' : '4,499'}/yr`;
                                    setSelectedPlan({ name: 'Arctic Pro', price });
                                    const ref = userEmail ? userEmail.split('@')[0] : 'username';
                                    setPaymentMessage(`Hi, I have completed my payment for Arctic Pro (${price}). My reference name is "${ref}". Please verify and activate my account. Thank you.`);
                                    setShowPaymentModal(true);
                                    setMessageSent(false);
                                }}
                                className="group relative w-full h-14 flex items-center justify-center bg-white border border-slate-900/10 text-slate-900 rounded text-[11px] font-black uppercase tracking-[0.2em] shadow-[0_15px_35px_-12px_rgba(0,0,0,0.08)] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.2)] hover:border-slate-900 hover:scale-[1.02] transition-all duration-500 overflow-hidden active:scale-95 z-20"
                            >
                                <span className="relative z-10 group-hover:text-white transition-colors duration-300 leading-none">Initialize Upgrade</span>
                                <div className="absolute inset-0 bg-slate-950 translate-y-full group-hover:translate-y-0 transition-transform duration-[500ms] ease-[0.16, 1, 0.3, 1]"></div>
                            </button>
                        </motion.div>

                        {/* Premium Tier */}
                        <motion.div 
                            className="bg-white rounded-md p-8 border border-slate-200 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all h-[460px] flex flex-col relative group"
                            {...fadeInUp}
                            transition={{ ...fadeInUp.transition, delay: 0.2 }}
                        >
                            <div className="mb-6">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase mb-2">Enterprise</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-black text-slate-900">{currency}{billingCycle === 'monthly' ? (multiplier === 1 ? '9.99' : '799') : (multiplier === 1 ? '99.99' : '6,499')}</span>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{billingCycle === 'monthly' ? '/mo' : '/yr'}</span>
                                </div>
                                {billingCycle === 'annual' && <p className="text-[10px] text-emerald-600 font-bold mt-1">Save {multiplier === 1 ? '$19.89' : 'NPR 3,089'} vs monthly</p>}
                            </div>
                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex items-start gap-3 text-sm font-bold text-slate-900"><CheckCircle className="size-4 text-slate-900 mt-0.5" /> 10 Active Listings</li>
                                <li className="flex items-start gap-3 text-sm font-bold text-slate-900"><CheckCircle className="size-4 text-slate-900 mt-0.5" /> 200 CV Processing Capacity</li>
                                <li className="flex items-start gap-3 text-sm font-medium text-slate-700"><CheckCircle className="size-4 text-slate-900 mt-0.5" /> AI Agent Live Chat</li>
                                <li className="flex items-start gap-3 text-sm font-medium text-slate-700"><CheckCircle className="size-4 text-slate-900 mt-0.5" /> Complete PDF Bulk Exports</li>
                                <li className="flex items-start gap-3 text-sm font-medium text-slate-700"><CheckCircle className="size-4 text-slate-900 mt-0.5" /> Dedicated Support Officer</li>
                                <li className="flex items-start gap-3 text-sm font-medium text-slate-700"><CheckCircle className="size-4 text-slate-900 mt-0.5" /> Enterprise Calendar Protocol</li>
                            </ul>
                            <button 
                                onClick={() => {
                                    if (!isLoggedIn) { setShowLoginMsg(true); setTimeout(() => setShowLoginMsg(false), 3000); return; }
                                    const price = billingCycle === 'monthly'
                                        ? `${currency}${multiplier === 1 ? '9.99' : '799'}/mo`
                                        : `${currency}${multiplier === 1 ? '99.99' : '6,499'}/yr`;
                                    setSelectedPlan({ name: 'Enterprise', price });
                                    const ref = userEmail ? userEmail.split('@')[0] : 'username';
                                    setPaymentMessage(`Hi, I have completed my payment for Enterprise (${price}). My reference name is "${ref}". Please verify and activate my account. Thank you.`);
                                    setShowPaymentModal(true);
                                    setMessageSent(false);
                                }}
                                className="group relative w-full h-12 flex items-center justify-center bg-white border border-slate-200 text-slate-900 rounded text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:border-slate-900 overflow-hidden shadow-sm hover:shadow-md active:scale-[0.98]"
                            >
                                <span className="relative z-10 group-hover:text-white transition-colors duration-300 leading-none">Secure Access</span>
                                <div className="absolute inset-0 bg-slate-950 translate-y-full group-hover:translate-y-0 transition-transform duration-[400ms] ease-[0.23, 1, 0.32, 1]"></div>
                            </button>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 6. Process Section */}
            <section className="py-16 md:py-32 bg-white border-y border-slate-100">
                <div className="max-w-6xl mx-auto px-5">
                    <motion.div className="text-center mb-12 md:mb-24" {...fadeInUp}>
                        <span className="font-mono text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mb-4 block">Workflow Methodology</span>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">The Arctic Protocol</h2>
                    </motion.div>

                    <motion.div
                        className="grid md:grid-cols-3 gap-12 relative"
                        variants={staggerContainer}
                        initial="initial"
                        whileInView="whileInView"
                        exit="exit"
                        viewport={{ once: false, margin: "-50px" }}
                    >
                        <div className="hidden md:block absolute top-[23px] left-[15%] right-[15%] h-[1px] bg-slate-100"></div>
                        {[
                            { step: "01", title: "Ingest", desc: "Connect ATS or drop raw data directly into the engine." },
                            { step: "02", title: "Analyze", desc: "AI parses narrative & traits to build deep candidate profiles.", highlight: true },
                            { step: "03", title: "Execute", desc: "Instantly sync top tier talent to your interview pipeline." }
                        ].map((item, i) => (
                            <motion.div key={i} className="relative flex flex-col items-center text-center group" variants={fadeInUp}>
                                <div className={`size-12 rounded-full bg-white border-2 flex items-center justify-center font-black text-sm z-10 mb-8 transition-all duration-500 ${item.highlight ? 'border-slate-900 text-slate-900 shadow-lg' : 'border-slate-200 text-slate-400 group-hover:border-slate-900 group-hover:text-slate-900'}`}>{item.step}</div>
                                <h3 className="text-lg font-black mb-3 text-slate-900 uppercase tracking-tight">{item.title}</h3>
                                <p className="text-sm text-slate-500 max-w-[200px] leading-relaxed font-medium">{item.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* 7. Feature Mosaic */}
            <section className="py-16 md:py-24 px-5 max-w-7xl mx-auto">
                <motion.div className="text-center mb-12 md:mb-20" {...fadeInUp}>
                    <span className="font-mono text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mb-4 block">Core Capabilities</span>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">Everything you need to hire at scale.</h2>
                </motion.div>
                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="whileInView"
                    exit="exit"
                    viewport={{ once: false, margin: "-50px" }}
                >
                    {[
                        { icon: "auto_awesome", title: "Adaptive Scoring", desc: "Our AI learns from your hiring decisions, tuning the scoring model to reflect your unique DNA." },
                        { icon: "visibility", title: "Blind Review Mode", desc: "Eliminate unconscious bias with automated data redaction, focusing purely on skill." },
                        { icon: "hub", title: "Network Analysis", desc: "Understand the ripple effect of a hire by analyzing professional connections." },
                        { icon: "security", title: "Enterprise Safety", desc: "SOC2 Type II compliant with role-based access control and granular data management." }
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            className="bg-white border border-slate-100 rounded-lg p-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] hover:shadow-md transition-all group"
                            variants={fadeInUp}
                        >
                            <div className="size-10 bg-slate-50 rounded-md flex items-center justify-center mb-6 group-hover:bg-slate-900 group-hover:text-white transition-all"><span className="material-symbols-outlined text-sm">{feature.icon}</span></div>
                            <h3 className="text-lg font-black mb-3 text-slate-900 tracking-tight">{feature.title}</h3>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">{feature.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* 8. Candidate Experience */}
            <motion.section className="py-16 md:py-24 bg-slate-50 border-y border-slate-100" {...fadeInUp}>
                <div className="max-w-5xl mx-auto px-5 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
                    <div className="text-slate-900">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-5">Designed for those who apply.</h2>
                        <p className="text-slate-500 text-base leading-relaxed mb-6">Candidates love the Arctic experience. No more redundant forms—just a single upload and our AI does the rest, providing immediate feedback on their profile strength.</p>
                        <ul className="space-y-4">
                            {[
                                "One-click LinkedIn sync",
                                "Real-time application tracking",
                                "Personalized skill gap insights"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 font-semibold text-slate-700">
                                    <CheckCircle className="size-5 text-slate-900" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xl overflow-hidden relative">
                        <div className="mb-10 text-center text-slate-900">
                            <h4 className="font-bold">Join the Arctic Design Team</h4>
                            <p className="text-xs text-slate-400 capitalize font-mono">Senior UI/UX Designer • Remote</p>
                        </div>
                        <div className="border-2 border-dashed border-slate-100 rounded-xl p-10 flex flex-col items-center justify-center bg-slate-50/30">
                            <div className="size-12 rounded-lg bg-slate-100 flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-slate-400">upload_file</span>
                            </div>
                            <div className="text-sm font-bold mb-1 text-slate-800 text-center">Drag & Drop Resume</div>
                            <div className="text-[10px] text-slate-400 font-mono uppercase text-center">PDF, DOCX (Max. 10MB)</div>
                        </div>
                        <div className="mt-8 space-y-3">
                            <div className="flex items-center justify-between text-[10px] font-mono font-medium">
                                <span className="text-slate-400 uppercase tracking-tighter">AI Analyzing Profile...</span>
                                <span className="text-slate-900">75%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-slate-900 rounded-full"
                                    initial={{ width: "0%" }}
                                    whileInView={{ width: "75%" }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* 8. Arctic Footer */}
            <footer className="bg-white pt-16 md:pt-24 pb-12 px-5 border-t border-slate-100">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 md:gap-12 mb-12 md:mb-20 text-slate-900">
                        <div className="col-span-2 lg:col-span-2">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="h-12 w-auto">
                                    <img src="/recruit-flow-logo.png" alt="Recruit Flow" className="h-full w-auto object-contain" />
                                </div>
                            </div>
                            <p className="text-slate-500 text-sm max-w-xs leading-relaxed font-medium">
                                High-fidelity recruitment intelligence for teams that value speed and precision.
                            </p>
                        </div>
                        <div>
                            <h5 className="font-black text-[10px] mb-6 uppercase tracking-[0.2em] text-slate-400">Platform</h5>
                            <ul className="space-y-4 text-sm font-bold text-slate-500">
                                <li><a className="hover:text-slate-900 transition-colors" href="#">Flipbook Suite</a></li>
                                <li><a className="hover:text-slate-900 transition-colors" href="#">AI Narrative</a></li>
                                <li><a className="hover:text-slate-900 transition-colors" href="#">ATS Sync</a></li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-black text-[10px] mb-6 uppercase tracking-[0.2em] text-slate-400">Company</h5>
                            <ul className="space-y-4 text-sm font-bold text-slate-500">
                                <li><Link className="hover:text-slate-900 transition-colors" href="/about">About Us</Link></li>
                                <li><Link className="hover:text-slate-900 transition-colors" href="/pricing">Pricing</Link></li>
                                <li><Link className="hover:text-slate-900 transition-colors" href="/contact">Contact Us</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-black text-[10px] mb-6 uppercase tracking-[0.2em] text-slate-400">Support</h5>
                            <ul className="space-y-4 text-sm font-bold text-slate-500">
                                <li><a className="hover:text-slate-900 transition-colors" href="#">Documentation</a></li>
                                <li><a className="hover:text-slate-900 transition-colors" href="#">API Status</a></li>
                                <li><a className="hover:text-slate-900 transition-colors" href="#">Help Center</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-slate-100 pt-12 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="font-mono text-[10px] text-slate-400 uppercase tracking-widest">
                            © 2026 Recruit Flow Systems Inc.
                        </div>
                        <div className="flex gap-8 font-mono text-[10px] text-slate-400 uppercase tracking-widest">
                            <Link className="hover:text-slate-900 transition-colors" href="/privacy">Privacy Policy</Link>
                            <Link className="hover:text-slate-900 transition-colors" href="/terms">Terms of Service</Link>
                            <Link className="hover:text-slate-900 transition-colors" href="/contact">Contact</Link>
                        </div>
                    </div>
                </div>
            </footer>
            {/* Payment QR Modal */}
            {showPaymentModal && selectedPlan && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-white rounded-2xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border border-slate-100 w-full max-w-sm overflow-hidden relative"
                    >
                        <button 
                            onClick={() => setShowPaymentModal(false)} 
                            className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all z-10"
                        >
                            <X className="size-3.5" />
                        </button>

                        <div className="px-6 pt-5 pb-4 text-center border-b border-slate-100 bg-[#fafafa]">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-white rounded-full text-[9px] font-black uppercase tracking-widest mb-2">
                                <Sparkles className="size-2.5" /> Protocol Upgrade
                            </div>
                            <h2 className="text-base font-black text-slate-900 tracking-tight">Access Management</h2>
                        </div>

                        <div className="px-8 py-10 flex flex-col items-center">
                            <div className="size-20 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                                <Sparkles className="size-10 text-slate-900" />
                            </div>
                            
                            <h3 className="text-lg font-black text-slate-900 mb-2">Ready for {selectedPlan.name}?</h3>
                            <p className="text-xs text-slate-500 text-center mb-10 leading-relaxed font-medium">
                                To activate your high-fidelity recruitment seat and unlock advanced telemetry, please coordinate with our HQ Terminal.
                            </p>

                            <div className="w-full p-4 bg-slate-50 rounded-xl border border-slate-100 relative group">
                                <div className="absolute -top-2.5 left-4 px-2 bg-white border border-slate-100 rounded-md">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Dispatch Command</p>
                                </div>
                                <p className="text-xs font-bold text-slate-900 leading-relaxed py-1">
                                    Want to upgrade to {selectedPlan.name}?{' '}
                                    <button 
                                        onClick={() => {
                                            window.dispatchEvent(new CustomEvent('open-support-chat', { 
                                                detail: { message: `I want to upgrade my workspace to ${selectedPlan.name} (${selectedPlan.price}). Please initialize activation.` } 
                                            }));
                                            setShowPaymentModal(false);
                                        }}
                                        className="text-slate-900 underline decoration-slate-900/30 underline-offset-4 hover:decoration-slate-900 transition-all font-black uppercase tracking-tight"
                                    >
                                        Contact Here.
                                    </button>
                                </p>
                            </div>

                            <button 
                                onClick={() => setShowPaymentModal(false)}
                                className="mt-8 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-all"
                            >
                                Return to Tiers
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
