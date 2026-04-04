"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Sparkles, ArrowRight, X, HelpCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import PublicNavbar from "@/components/PublicNavbar";

export default function PricingPage() {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
    const [currency, setCurrency] = useState('$');
    const [multiplier, setMultiplier] = useState(1);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<{name: string, price: string} | null>(null);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const fadeInUp = {
        initial: { opacity: 0, y: 30, filter: "blur(10px)", scale: 0.98 },
        whileInView: { opacity: 1, y: 0, filter: "blur(0px)", scale: 1 },
        transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as any },
        viewport: { once: false, margin: "-50px" }
    };

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setIsLoggedIn(!!session);
            if (session?.user?.email) setUserEmail(session.user.email);
        });
    }, []);

    useEffect(() => {
        let mounted = true;
        const detect = async () => {
            // Pass 1 — timezone (instant, no network)
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
            if (tz && (tz === 'Asia/Kathmandu' || tz.toLowerCase().includes('kathmandu'))) {
                if (mounted) { setCurrency('NPR '); setMultiplier(130); }
                return;
            }
            // Pass 2 — IP geo fallback
            try {
                const res = await fetch('https://get.geojs.io/v1/ip/country.json');
                const data = await res.json();
                if (mounted && (data.country === 'NP' || data.name === 'Nepal')) {
                    setCurrency('NPR '); setMultiplier(130);
                }
            } catch { /* stay on $ */ }
        };
        detect();
        return () => { mounted = false; };
    }, []);

    const handleUpgrade = (planName: string, price: string) => {
        if (!isLoggedIn) { window.location.href = '/login'; return; }
        setSelectedPlan({ name: planName, price });
        setShowPaymentModal(true);
    };

    const plans = [
        {
            name: "Essential",
            monthlyUsd: "0", monthlyNpr: "0",
            annualUsd: "0", annualNpr: "0",
            features: [
                { text: "1 Active Job Posting", included: true },
                { text: "5 CV Processing Capacity", included: true },
                { text: "Basic Candidate Preview", included: true },
                { text: "CRM Analytics", included: false },
                { text: "Priority Support", included: false },
            ],
            cta: "Deploy Starter",
            highlight: false,
        },
        {
            name: "Arctic Pro",
            monthlyUsd: "6.99", monthlyNpr: "299",
            annualUsd: "64.99", annualNpr: "2,999",
            savingsUsd: "$18.89", savingsNpr: "NPR 589",
            features: [
                { text: "4 Active Job Listings", included: true },
                { text: "30 CV Processing Capacity", included: true },
                { text: "Interactive Flipbook Engine", included: true },
                { text: "Candidate CRM Access", included: true },
                { text: "AI Profile Narrative Summary", included: true },
                { text: "Automated Email Workflows", included: true },
                { text: "Direct Support Connection", included: true },
            ],
            cta: "Initialize Upgrade",
            highlight: true,
        },
        {
            name: "Enterprise",
            monthlyUsd: "9.99", monthlyNpr: "499",
            annualUsd: "99.99", annualNpr: "4,599",
            savingsUsd: "$19.89", savingsNpr: "NPR 1,389",
            features: [
                { text: "10 Active Listings", included: true },
                { text: "200 CV Processing Capacity", included: true },
                { text: "AI Agent Live Chat", included: true },
                { text: "Complete PDF Bulk Exports", included: true },
                { text: "Dedicated Support Officer", included: true },
                { text: "Enterprise Calendar Protocol", included: true },
            ],
            cta: "Secure Access",
            highlight: false,
        },
    ];

    const faqs = [
        { q: "Can I switch plans anytime?", a: "Absolutely. You can upgrade or downgrade your plan at any time. Changes take effect immediately and your billing is adjusted pro-rata." },
        { q: "How does the payment process work?", a: "After selecting your plan, you'll be connected with our support team who will guide you through the secure activation process. We support multiple payment methods." },
        { q: "Is there a free trial for Pro?", a: "The Essential tier is permanently free. For Pro and Enterprise, contact our team to discuss trial options for your specific use case." },
        { q: "What happens to my data if I downgrade?", a: "Your data is always safe. When downgrading, you retain read-only access to all historical data. Active job postings beyond your new tier limit are archived, not deleted." },
        { q: "Do you offer custom enterprise pricing?", a: "Yes. For teams larger than 50 recruiters, we offer custom volume pricing with dedicated infrastructure. Contact our sales team for a tailored quote." },
    ];

    return (
        <div className="bg-white font-display text-slate-900 antialiased min-h-screen">
            <style jsx>{`
                @keyframes pure-glass-shine {
                    0% { transform: translateX(-150%) skewX(12deg); }
                    100% { transform: translateX(200%) skewX(12deg); }
                }
                .pure-animate-shine {
                    animation: pure-glass-shine 3s infinite ease-in-out;
                }
            `}</style>

            {/* Navigation */}
            <PublicNavbar />

            {/* Hero */}
            <section className="relative overflow-hidden pt-32 pb-12 md:pt-40 md:pb-16">
                <div className="absolute inset-0 z-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, #E2E8F0 0%, transparent 70%)' }} />
                <div className="absolute inset-0 z-0 opacity-[0.5] pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '16px 16px' }}
                />
                <div className="relative max-w-5xl mx-auto px-6 z-10">
                    <motion.div className="text-center" {...fadeInUp}>
                        <span className="font-mono text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mb-4 block">Access Tiers</span>
                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-4">Transparent Pricing.</h1>
                        <p className="text-slate-500 max-w-xl mx-auto font-medium text-base mb-8">Equip your talent team with the right tools. Upgrade anytime.</p>
                        <div className="inline-flex items-center bg-slate-100 rounded-md p-1 gap-0">
                            <button
                                onClick={() => setBillingCycle('monthly')}
                                className={`px-5 py-2.5 rounded text-[10px] font-black uppercase tracking-widest transition-all ${billingCycle === 'monthly' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
                            >Monthly</button>
                            <button
                                onClick={() => setBillingCycle('annual')}
                                className={`px-5 py-2.5 rounded text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${billingCycle === 'annual' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
                            >Annual <span className={`text-[8px] px-1.5 py-0.5 rounded ${billingCycle === 'annual' ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-600'}`}>Save 25%</span></button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="pb-20 md:pb-28 relative z-10">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-6 md:gap-8 items-center">
                        {plans.map((plan, i) => {
                            const price = billingCycle === 'monthly'
                                ? `${currency}${multiplier === 1 ? plan.monthlyUsd : plan.monthlyNpr}`
                                : `${currency}${multiplier === 1 ? plan.annualUsd : plan.annualNpr}`;
                            const period = billingCycle === 'monthly' ? '/mo' : '/yr';

                            return (
                                <motion.div
                                    key={i}
                                    className={`relative rounded-lg p-8 border flex flex-col overflow-hidden transition-all duration-500 ${
                                        plan.highlight
                                            ? 'border-slate-900/5 bg-white shadow-2xl hover:shadow-[0_40px_80px_-20px_rgba(15,23,42,0.15)] md:-translate-y-4 min-h-[520px]'
                                            : 'border-slate-200 bg-white shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-lg min-h-[460px]'
                                    }`}
                                    {...fadeInUp}
                                    transition={{ ...fadeInUp.transition, delay: i * 0.1 }}
                                >
                                    {plan.highlight && (
                                        <>
                                            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(248,250,252,0.8)_0%,rgba(255,255,255,1)_50%,rgba(241,245,249,0.8)_100%)] z-0" />
                                            <div className="absolute inset-0 -translate-x-[150%] pure-animate-shine bg-gradient-to-r from-transparent via-slate-900/5 to-transparent z-10 pointer-events-none transform skew-x-[12deg]" />
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 px-6 py-1.5 bg-slate-900 rounded-b-md z-20 shadow-xl">
                                                <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Professional</span>
                                            </div>
                                        </>
                                    )}

                                    <div className={`mb-6 relative z-20 ${plan.highlight ? 'mt-6' : ''}`}>
                                        <h3 className={`font-black text-slate-900 tracking-tight uppercase mb-2 flex items-center gap-3 ${plan.highlight ? 'text-2xl' : 'text-xl'}`}>
                                            {plan.highlight && <Sparkles className="size-5 text-amber-500" />}
                                            {plan.name}
                                        </h3>
                                        <div className="flex items-baseline gap-1">
                                            <span className={`font-black text-slate-900 ${plan.highlight ? 'text-4xl' : 'text-3xl'}`}>{price}</span>
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{period}</span>
                                        </div>
                                        {billingCycle === 'annual' && plan.savingsUsd && (
                                            <p className="text-[10px] text-emerald-600 font-bold mt-1">Save {multiplier === 1 ? plan.savingsUsd : plan.savingsNpr} vs monthly</p>
                                        )}
                                    </div>

                                    <ul className="space-y-4 mb-8 flex-1 relative z-20">
                                        {plan.features.map((feat, j) => (
                                            <li key={j} className={`flex items-start gap-3 text-sm ${feat.included ? (plan.highlight ? 'font-bold text-slate-900' : 'font-medium text-slate-600') : 'font-medium text-slate-300 opacity-70 uppercase tracking-widest font-mono text-[9px]'}`}>
                                                {feat.included
                                                    ? <CheckCircle className={`size-4 mt-0.5 ${plan.highlight ? 'text-slate-900' : 'text-slate-300'}`} />
                                                    : <span className="material-symbols-outlined text-[14px]">block</span>
                                                }
                                                {feat.text}
                                            </li>
                                        ))}
                                    </ul>

                                    {plan.name === 'Essential' ? (
                                        <div className="group relative w-full h-12 flex items-center justify-center overflow-hidden rounded border border-slate-200 text-[10px] font-black uppercase tracking-[0.2em] bg-white cursor-default">
                                            <span className="relative z-10 text-slate-400">Free</span>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleUpgrade(plan.name, `${price}${period}`)}
                                            className={`group relative w-full flex items-center justify-center overflow-hidden rounded text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98] z-20 ${
                                                plan.highlight
                                                    ? 'h-14 bg-white border border-slate-900/10 text-slate-900 shadow-[0_15px_35px_-12px_rgba(0,0,0,0.08)] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.2)] hover:border-slate-900 hover:scale-[1.02] duration-500'
                                                    : 'h-12 bg-white border border-slate-200 text-slate-900 shadow-sm hover:shadow-md hover:border-slate-900'
                                            }`}
                                        >
                                            <span className="relative z-10 group-hover:text-white transition-colors duration-300 leading-none">{plan.cta}</span>
                                            <div className="absolute inset-0 bg-slate-950 translate-y-full group-hover:translate-y-0 transition-transform duration-[400ms] ease-[0.23,_1,_0.32,_1]" />
                                        </button>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Feature Comparison */}
            <section className="py-20 bg-slate-50 border-y border-slate-100">
                <div className="max-w-4xl mx-auto px-6">
                    <motion.div className="text-center mb-12" {...fadeInUp}>
                        <span className="font-mono text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mb-4 block">Compare Plans</span>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Full feature breakdown.</h2>
                    </motion.div>
                    <motion.div className="bg-white border border-slate-100 rounded-lg overflow-hidden shadow-sm" {...fadeInUp}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/50">
                                        <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Feature</th>
                                        <th className="text-center px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Essential</th>
                                        <th className="text-center px-4 py-4 text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Pro</th>
                                        <th className="text-center px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Enterprise</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { feature: "Active Job Postings", essential: "1", pro: "4", enterprise: "10" },
                                        { feature: "CV Processing", essential: "5", pro: "30", enterprise: "200" },
                                        { feature: "Flipbook Engine", essential: "—", pro: "✓", enterprise: "✓" },
                                        { feature: "CRM Access", essential: "—", pro: "✓", enterprise: "✓" },
                                        { feature: "AI Summaries", essential: "—", pro: "✓", enterprise: "✓" },
                                        { feature: "Bulk PDF Export", essential: "—", pro: "—", enterprise: "✓" },
                                        { feature: "Interview Calendar", essential: "—", pro: "—", enterprise: "✓" },
                                        { feature: "Priority Support", essential: "—", pro: "✓", enterprise: "✓" },
                                        { feature: "Email Workflows", essential: "—", pro: "✓", enterprise: "✓" },
                                    ].map((row, i) => (
                                        <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-3.5 font-semibold text-slate-700 text-xs">{row.feature}</td>
                                            <td className="text-center px-4 py-3.5 text-xs font-bold text-slate-400">{row.essential}</td>
                                            <td className="text-center px-4 py-3.5 text-xs font-bold text-slate-900">{row.pro}</td>
                                            <td className="text-center px-4 py-3.5 text-xs font-bold text-slate-700">{row.enterprise}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-20 md:py-28">
                <div className="max-w-3xl mx-auto px-6">
                    <motion.div className="text-center mb-12" {...fadeInUp}>
                        <span className="font-mono text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mb-4 block">Support</span>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Frequently asked questions.</h2>
                    </motion.div>
                    <motion.div className="space-y-3" {...fadeInUp}>
                        {faqs.map((faq, i) => (
                            <div key={i} className="border border-slate-100 rounded-lg overflow-hidden bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-slate-50/50"
                                >
                                    <span className="text-sm font-bold text-slate-900 pr-4">{faq.q}</span>
                                    <motion.div
                                        animate={{ rotate: openFaq === i ? 180 : 0 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                    >
                                        <HelpCircle className={`size-4 shrink-0 transition-colors ${openFaq === i ? 'text-slate-900' : 'text-slate-300'}`} />
                                    </motion.div>
                                </button>
                                <AnimatePresence initial={false}>
                                    {openFaq === i && (
                                        <motion.div
                                            key="content"
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                                            style={{ overflow: 'hidden' }}
                                        >
                                            <div className="px-5 pb-5">
                                                <p className="text-xs text-slate-500 leading-relaxed font-medium">{faq.a}</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white py-12 px-6 border-t border-slate-100">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="font-mono text-[10px] text-slate-400 uppercase tracking-widest">© 2026 Recruit Flow Systems Inc.</div>
                    <div className="flex gap-8 font-mono text-[10px] text-slate-400 uppercase tracking-widest">
                        <Link className="hover:text-slate-900 transition-colors" href="/privacy">Privacy Policy</Link>
                        <Link className="hover:text-slate-900 transition-colors" href="/terms">Terms of Service</Link>
                    </div>
                </div>
            </footer>

            {/* Payment Modal */}
            {showPaymentModal && selectedPlan && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-white rounded-2xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border border-slate-100 w-full max-w-sm overflow-hidden relative"
                    >
                        <button onClick={() => setShowPaymentModal(false)} className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all z-10">
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
                                To activate your recruitment seat, please coordinate with our HQ Terminal.
                            </p>
                            <div className="w-full p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-xs font-bold text-slate-900 leading-relaxed py-1">
                                    Want to upgrade to {selectedPlan.name}?{' '}
                                    <Link href="/contact" className="text-slate-900 underline decoration-slate-900/30 underline-offset-4 hover:decoration-slate-900 transition-all font-black uppercase tracking-tight">
                                        Contact Here.
                                    </Link>
                                </p>
                            </div>
                            <button onClick={() => setShowPaymentModal(false)} className="mt-8 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-all">
                                Return to Tiers
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
