'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Shield, ChevronRight } from 'lucide-react';
import PublicNavbar from '@/components/PublicNavbar';

const SECTIONS = [
    { id: 'overview', title: '1. Overview' },
    { id: 'information-collected', title: '2. Information We Collect' },
    { id: 'how-we-use', title: '3. How We Use Your Information' },
    { id: 'data-sharing', title: '4. Data Sharing & Disclosure' },
    { id: 'data-storage', title: '5. Data Storage & Security' },
    { id: 'ai-processing', title: '6. AI Processing' },
    { id: 'cookies', title: '7. Cookies & Tracking' },
    { id: 'your-rights', title: '8. Your Rights' },
    { id: 'children', title: "9. Children's Privacy" },
    { id: 'international', title: '10. International Transfers' },
    { id: 'changes', title: '11. Changes to This Policy' },
    { id: 'contact', title: '12. Contact Us' },
];

export default function PrivacyPolicy() {
    const [active, setActive] = useState('overview');

    // Scroll-spy: update active section based on scroll position
    useEffect(() => {
        const handleScroll = () => {
            for (let i = SECTIONS.length - 1; i >= 0; i--) {
                const el = document.getElementById(SECTIONS[i].id);
                if (el && el.getBoundingClientRect().top <= 120) {
                    setActive(SECTIONS[i].id);
                    return;
                }
            }
            setActive(SECTIONS[0].id);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans">
            <PublicNavbar />

            {/* Hero */}
            <div className="bg-slate-900 pt-32 pb-16 px-6 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 text-white rounded-sm text-[9px] font-black uppercase tracking-widest mb-5">
                    <Shield className="size-3" /> Privacy Policy
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-3">Privacy Policy</h1>
                <p className="text-slate-400 text-sm font-medium">Effective Date: April 1, 2026 &nbsp;·&nbsp; Last Updated: April 2, 2026</p>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-12 flex gap-12">
                {/* Sidebar TOC */}
                <aside className="hidden lg:block w-56 shrink-0">
                    <div className="sticky top-24 space-y-1">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Contents</p>
                        {SECTIONS.map(s => (
                            <a key={s.id} href={`#${s.id}`}
                                className={`flex items-center gap-2 px-3 py-2 rounded-sm text-xs font-medium transition-all ${active === s.id ? 'bg-slate-900 text-white font-bold' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>
                                {active === s.id && <ChevronRight className="size-3 shrink-0" />}
                                {s.title}
                            </a>
                        ))}
                    </div>
                </aside>

                {/* Content */}
                <main className="flex-1 max-w-3xl space-y-12 text-sm leading-relaxed text-slate-600">

                    <section id="overview" className="scroll-mt-28">
                        <h2 className="text-xl font-black text-slate-900 mb-4 pb-3 border-b border-slate-100">1. Overview</h2>
                        <p className="mb-3">Recruit Flow ("we", "our", "us") is a recruitment management platform operated by Ujjwal Rupakheti, based in Itahari, Sunsari, Nepal. This Privacy Policy explains how we collect, use, store, and protect personal information when you use our platform (the "Platform").</p>
                        <p className="mb-3">This policy applies to all users of the Platform, including recruiters who create accounts and manage job postings, and candidates who submit applications through recruiter-generated links.</p>
                        <p>By accessing or using the Platform, you acknowledge that you have read and understood this Privacy Policy. If you do not agree, you must discontinue use immediately.</p>
                    </section>

                    <section id="information-collected" className="scroll-mt-28">
                        <h2 className="text-xl font-black text-slate-900 mb-4 pb-3 border-b border-slate-100">2. Information We Collect</h2>
                        <h3 className="font-bold text-slate-800 mb-2">2.1 Information You Provide Directly</h3>
                        <ul className="list-disc pl-5 space-y-1.5 mb-4">
                            <li><strong>Account Registration:</strong> Full name, email address, password (hashed), company name, phone number, and company logo.</li>
                            <li><strong>Job Applications (Candidates):</strong> Full name, email address, resume/CV (PDF), social profile links (LinkedIn, GitHub, portfolio), and any additional information entered in the application form.</li>
                            <li><strong>Support Communications:</strong> Messages sent through our support chat system, including any attachments or images you upload.</li>
                            <li><strong>Payment Requests:</strong> When requesting a plan upgrade, we collect payment confirmation details (receipt images). We do not store credit card or banking credentials.</li>
                        </ul>
                        <h3 className="font-bold text-slate-800 mb-2">2.2 Information Collected Automatically</h3>
                        <ul className="list-disc pl-5 space-y-1.5 mb-4">
                            <li><strong>Session Data:</strong> Authentication tokens stored in cookies to maintain your login session.</li>
                            <li><strong>Usage Data:</strong> Pages visited, features used, and actions taken within the Platform.</li>
                            <li><strong>Device & Browser Information:</strong> IP address, browser type, operating system, and timezone — used for security and location-based pricing.</li>
                        </ul>
                        <h3 className="font-bold text-slate-800 mb-2">2.3 AI-Generated Data</h3>
                        <p>When a candidate submits an application, our Platform uses Google Gemini AI to generate a structured summary and ATS compatibility score from the submitted resume. This AI-generated content is stored alongside the application and is visible only to the recruiter who owns the job posting.</p>
                    </section>

                    <section id="how-we-use" className="scroll-mt-28">
                        <h2 className="text-xl font-black text-slate-900 mb-4 pb-3 border-b border-slate-100">3. How We Use Your Information</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Platform Operation:</strong> To create and manage your account, authenticate your identity, and provide access to Platform features.</li>
                            <li><strong>Recruitment Processing:</strong> To display candidate applications to the relevant recruiter, generate AI summaries, and facilitate interview scheduling and email communications.</li>
                            <li><strong>Communication:</strong> To send OTP verification codes, system notifications, and responses to support requests. We do not send unsolicited marketing emails.</li>
                            <li><strong>Security:</strong> To detect and prevent fraudulent activity, unauthorized access, and abuse of the Platform.</li>
                            <li><strong>Service Improvement:</strong> To understand how the Platform is used and improve its features and performance.</li>
                            <li><strong>Legal Compliance:</strong> To comply with applicable laws and regulations in Nepal and internationally.</li>
                            <li><strong>Pricing Localization:</strong> To detect your approximate location via timezone and IP address to display pricing in the appropriate currency (NPR or USD).</li>
                        </ul>
                    </section>

                    <section id="data-sharing" className="scroll-mt-28">
                        <h2 className="text-xl font-black text-slate-900 mb-4 pb-3 border-b border-slate-100">4. Data Sharing & Disclosure</h2>
                        <p className="mb-3">We do not sell, rent, or trade your personal information to third parties. We may share your information only in the following limited circumstances:</p>
                        <ul className="list-disc pl-5 space-y-2 mb-4">
                            <li><strong>With Recruiters:</strong> Candidate application data is shared with the recruiter who owns the job posting the candidate applied to. Candidates consent to this by submitting an application.</li>
                            <li><strong>Service Providers:</strong> We use Supabase (database, auth, storage), Google Gemini AI (resume analysis), Gmail/SMTP (email delivery), and GeoJS (anonymous IP-based country detection). All providers are contractually obligated to handle data securely.</li>
                            <li><strong>Legal Requirements:</strong> We may disclose your information if required by law, court order, or governmental authority.</li>
                            <li><strong>Business Transfer:</strong> In the event of a merger or acquisition, your information may be transferred. You will be notified in advance.</li>
                        </ul>
                    </section>

                    <section id="data-storage" className="scroll-mt-28">
                        <h2 className="text-xl font-black text-slate-900 mb-4 pb-3 border-b border-slate-100">5. Data Storage & Security</h2>
                        <p className="mb-3">Your data is stored on Supabase infrastructure. We implement the following security measures: HTTPS/TLS encryption for all data in transit, hashed passwords (never stored in plain text), Row-Level Security (RLS) policies so recruiters can only access their own data, API rate limiting and authentication middleware, and OTP codes that expire within 10 minutes.</p>
                        <p className="mb-3"><strong>Data Retention:</strong> We retain your personal data for as long as your account is active. Upon account deletion request, we will delete your personal data within 30 days, except where retention is required by law.</p>
                        <p>Despite our security measures, no system is completely secure. We cannot guarantee absolute security and are not liable for unauthorized access resulting from circumstances beyond our reasonable control.</p>
                    </section>

                    <section id="ai-processing" className="scroll-mt-28">
                        <h2 className="text-xl font-black text-slate-900 mb-4 pb-3 border-b border-slate-100">6. AI Processing</h2>
                        <p className="mb-3">By submitting an application through our Platform, you consent to your resume being processed by Google Gemini AI to generate summaries and ATS scores.</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>AI-generated summaries are for informational purposes only and do not constitute a definitive assessment.</li>
                            <li>Hiring decisions are made solely by the recruiter. Recruit Flow is not responsible for any employment decisions based on AI-generated content.</li>
                            <li>Resume data sent to Google Gemini is subject to Google's own privacy and data processing policies.</li>
                            <li>We do not use candidate data to train our own AI models.</li>
                        </ul>
                    </section>

                    <section id="cookies" className="scroll-mt-28">
                        <h2 className="text-xl font-black text-slate-900 mb-4 pb-3 border-b border-slate-100">7. Cookies & Tracking</h2>
                        <p className="mb-3">We use cookies and similar technologies to operate the Platform:</p>
                        <ul className="list-disc pl-5 space-y-2 mb-4">
                            <li><strong>Authentication Cookies:</strong> Essential cookies set by Supabase to maintain your login session. These are required for the Platform to function.</li>
                            <li><strong>Local Storage:</strong> We use browser localStorage to save your mail template settings and AI chat history. This data is stored locally on your device and is not transmitted to our servers.</li>
                        </ul>
                        <p>We do not use advertising cookies, third-party tracking pixels, or analytics services that track you across other websites.</p>
                    </section>

                    <section id="your-rights" className="scroll-mt-28">
                        <h2 className="text-xl font-black text-slate-900 mb-4 pb-3 border-b border-slate-100">8. Your Rights</h2>
                        <p className="mb-3">You may have the following rights regarding your personal data: right of access, right to rectification, right to erasure, right to restriction of processing, right to data portability, and right to object to processing.</p>
                        <p>To exercise any of these rights, contact us at <strong>work@ujjwalrupakheti.com.np</strong>. We will respond within 30 days. We may need to verify your identity before processing your request.</p>
                    </section>

                    <section id="children" className="scroll-mt-28">
                        <h2 className="text-xl font-black text-slate-900 mb-4 pb-3 border-b border-slate-100">9. Children's Privacy</h2>
                        <p>The Platform is intended for individuals who are at least 18 years of age. We do not knowingly collect personal information from anyone under 18. If we become aware that a minor has provided us with personal information, we will delete it promptly.</p>
                    </section>

                    <section id="international" className="scroll-mt-28">
                        <h2 className="text-xl font-black text-slate-900 mb-4 pb-3 border-b border-slate-100">10. International Data Transfers</h2>
                        <p className="mb-3">Recruit Flow is operated from Nepal. Our infrastructure providers (Supabase, Google) may store and process your data on servers located in other countries, including the United States and EU member states.</p>
                        <p>By using the Platform, you consent to the transfer of your information to countries outside Nepal, which may have different data protection laws.</p>
                    </section>

                    <section id="changes" className="scroll-mt-28">
                        <h2 className="text-xl font-black text-slate-900 mb-4 pb-3 border-b border-slate-100">11. Changes to This Policy</h2>
                        <p className="mb-3">When we make material changes, we will update the "Last Updated" date, notify registered users via email at least 14 days before changes take effect, and display a prominent notice on the Platform.</p>
                        <p>Your continued use of the Platform after the effective date constitutes acceptance of the updated policy.</p>
                    </section>

                    <section id="contact" className="scroll-mt-28">
                        <h2 className="text-xl font-black text-slate-900 mb-4 pb-3 border-b border-slate-100">12. Contact Us</h2>
                        <p className="mb-4">For questions, concerns, or data requests regarding this Privacy Policy:</p>
                        <div className="bg-slate-50 border border-slate-100 rounded-sm p-5 space-y-2 text-sm">
                            <p><strong>Recruit Flow</strong> — Operated by Ujjwal Rupakheti</p>
                            <p>Address: Itahari, Sunsari, Nepal</p>
                            <p>Email: <a href="mailto:work@ujjwalrupakheti.com.np" className="text-slate-900 font-bold underline underline-offset-2">work@ujjwalrupakheti.com.np</a></p>
                            <p>Phone: <a href="tel:+9779826304766" className="text-slate-900 font-bold">+977 9826304766</a></p>
                        </div>
                    </section>

                    <div className="border-t border-slate-100 pt-8 text-xs text-slate-400 font-medium">
                        <p>© 2026 Recruit Flow. All rights reserved. Last reviewed April 2, 2026.</p>
                    </div>
                </main>
            </div>

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
