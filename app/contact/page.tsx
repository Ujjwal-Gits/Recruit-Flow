"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Send, MapPin, Mail, Clock, CheckCircle, MessageSquare, Phone, Globe } from "lucide-react";
import PublicNavbar from "@/components/PublicNavbar";

export default function ContactPage() {
    const [formData, setFormData] = useState({ name: '', email: '', subject: 'general', message: '' });
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const fadeInUp = {
        initial: { opacity: 0, y: 30, filter: "blur(10px)", scale: 0.98 },
        whileInView: { opacity: 1, y: 0, filter: "blur(0px)", scale: 1 },
        transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as any },
        viewport: { once: false, margin: "-50px" }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) return;
        setSending(true);

        try {
            await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            setSent(true);
        } catch {
            setSent(true); // still show success to user
        } finally {
            setSending(false);
        }
    };

    const contactCards = [
        {
            icon: Mail,
            title: "Email Us",
            desc: "For general inquiries and support",
            value: "work@ujjwalrupakheti.com.np",
            href: "mailto:work@ujjwalrupakheti.com.np"
        },
        {
            icon: Phone,
            title: "Call Us",
            desc: "Reach us directly at",
            value: "+977 9826304766",
            href: "tel:+9779826304766"
        },
        {
            icon: MapPin,
            title: "Headquarters",
            desc: "Operating from",
            value: "Itahari, Sunsari, Nepal",
            href: null
        },
    ];

    return (
        <div className="bg-white font-display text-slate-900 antialiased min-h-screen">
            {/* Navigation */}
            <PublicNavbar />

            {/* Hero */}
            <section className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-20">
                <div className="absolute inset-0 z-0 opacity-[0.7] pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '16px 16px' }}
                />
                <div className="relative max-w-5xl mx-auto px-6 z-10">
                    <motion.div className="text-center" {...fadeInUp}>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 leading-[1.05] mb-6">
                            Let's start a<br />
                            <span className="text-slate-400">conversation.</span>
                        </h1>
                        <p className="text-base md:text-lg text-slate-500 max-w-xl mx-auto leading-relaxed font-medium">
                            Whether you have a question about features, pricing, need a demo, or anything else — our team is ready to answer all your questions.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Contact Cards */}
            <motion.section className="pb-16" {...fadeInUp}>
                <div className="max-w-4xl mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-4">
                        {contactCards.map((card, i) => (
                            <div key={i} className="bg-white border border-slate-100 rounded-lg p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] hover:shadow-md transition-all group text-center">
                                <div className="size-10 bg-slate-50 rounded-md flex items-center justify-center mx-auto mb-4 group-hover:bg-slate-900 transition-all">
                                    <card.icon className="size-5 text-slate-400 group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="text-sm font-black text-slate-900 tracking-tight mb-1">{card.title}</h3>
                                <p className="text-[10px] text-slate-400 font-medium mb-3">{card.desc}</p>
                                {card.href ? (
                                    <a href={card.href} className="text-xs font-bold text-slate-900 hover:underline underline-offset-4 break-all">{card.value}</a>
                                ) : (
                                    <p className="text-xs font-bold text-slate-900">{card.value}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </motion.section>

            {/* Contact Form */}
            <section className="py-16 md:py-24 bg-slate-50 border-y border-slate-100">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="grid md:grid-cols-5 gap-12 items-start">
                        {/* Info Panel */}
                        <motion.div className="md:col-span-2 space-y-8" {...fadeInUp}>
                            <div>
                                <span className="font-mono text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mb-4 block">Get in Touch</span>
                                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-4">Send us a message.</h2>
                                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                    Fill out the form and our team will get back to you within 24 hours. For urgent matters, please email us directly.
                                </p>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { icon: MessageSquare, text: "Live chat available inside the dashboard" },
                                    { icon: CheckCircle, text: "Average response time under 24 hours" },
                                    { icon: Globe, text: "Support available in English and Nepali" },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="size-8 bg-white rounded-md flex items-center justify-center border border-slate-100 shadow-sm">
                                            <item.icon className="size-4 text-slate-400" />
                                        </div>
                                        <p className="text-xs font-semibold text-slate-600">{item.text}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Form */}
                        <motion.div className="md:col-span-3" {...fadeInUp} transition={{ ...fadeInUp.transition, delay: 0.15 }}>
                            {sent ? (
                                <div className="bg-white border border-slate-100 rounded-lg p-12 text-center shadow-sm">
                                    <div className="size-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle className="size-8 text-emerald-500" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Message Dispatched</h3>
                                    <p className="text-sm text-slate-500 font-medium mb-8">Thank you for reaching out. Our team will respond within 24 hours.</p>
                                    <button
                                        onClick={() => { setSent(false); setFormData({ name: '', email: '', subject: 'general', message: '' }); }}
                                        className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-all"
                                    >
                                        Send Another Message
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-lg p-6 md:p-8 shadow-sm space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Full Name</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                required
                                                placeholder="John Doe"
                                                className="w-full bg-slate-50 border border-slate-100 rounded-md px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:bg-white transition-all placeholder:text-slate-300 font-medium"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Email</label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                required
                                                placeholder="name@company.com"
                                                className="w-full bg-slate-50 border border-slate-100 rounded-md px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:bg-white transition-all placeholder:text-slate-300 font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Subject</label>
                                        <select
                                            value={formData.subject}
                                            onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-md px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:bg-white transition-all font-medium appearance-none cursor-pointer"
                                        >
                                            <option value="general">General Inquiry</option>
                                            <option value="sales">Sales & Pricing</option>
                                            <option value="support">Technical Support</option>
                                            <option value="partnership">Partnership</option>
                                            <option value="feedback">Feedback</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Message</label>
                                        <textarea
                                            value={formData.message}
                                            onChange={e => setFormData({ ...formData, message: e.target.value })}
                                            required
                                            rows={5}
                                            placeholder="Tell us how we can help..."
                                            className="w-full bg-slate-50 border border-slate-100 rounded-md px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:bg-white transition-all placeholder:text-slate-300 font-medium resize-none"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={sending}
                                        className="group relative w-full h-12 flex items-center justify-center bg-slate-900 text-white rounded-md text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98] disabled:opacity-60 gap-2"
                                    >
                                        {sending ? (
                                            <div className="flex items-center gap-2">
                                                <div className="size-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Dispatching...
                                            </div>
                                        ) : (
                                            <>
                                                <Send className="size-3.5" />
                                                Send Message
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </motion.div>
                    </div>
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
        </div>
    );
}
