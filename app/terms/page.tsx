'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Scale, ChevronRight } from 'lucide-react';
import PublicNavbar from '@/components/PublicNavbar';

const SECTIONS = [
    { id: 'agreement', title: '1. Agreement to Terms' },
    { id: 'description', title: '2. Platform Description' },
    { id: 'eligibility', title: '3. Eligibility' },
    { id: 'accounts', title: '4. User Accounts' },
    { id: 'recruiter-obligations', title: '5. Recruiter Obligations' },
    { id: 'candidate-obligations', title: '6. Candidate Obligations' },
    { id: 'subscriptions', title: '7. Subscriptions & Payments' },
    { id: 'ai-disclaimer', title: '8. AI Features Disclaimer' },
    { id: 'intellectual-property', title: '9. Intellectual Property' },
    { id: 'prohibited', title: '10. Prohibited Conduct' },
    { id: 'liability', title: '11. Limitation of Liability' },
    { id: 'indemnification', title: '12. Indemnification' },
    { id: 'termination', title: '13. Termination' },
    { id: 'disputes', title: '14. Dispute Resolution' },
    { id: 'governing-law', title: '15. Governing Law' },
    { id: 'changes', title: '16. Changes to Terms' },
    { id: 'contact', title: '17. Contact' },
];

export default function TermsOfService() {
    const [active, setActive] = useState('agreement');

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
                    <Scale className="size-3" /> Legal
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-3">Terms of Service</h1>
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

                    <section id="agreement" className="scroll-mt-28">
                        <h2 className="text-xl font-black text-slate-900 mb-4 pb-3 border-b border-slate-100">1. Agreement to Terms</h2>
                        <p className="mb-3">These Terms of Service ("Terms") constitute a legally binding agreement between you ("User") and Recruit Flow, operated by Ujjwal Rupakheti ("we", "us", "our"), governing your access to and use of the Recruit Flow platform and all related services (the "Platform").</p>
                        <p className="mb-3">By creating an account, accessing the Platform, or submitting an application through a recruiter-generated link, you confirm that you have read, understood, and agree to be bound by these Terms and our Privacy Policy.</p>
                        <p>If you are using the Platform on behalf of an organization, you represent that you have the authority to bind that organization to these Terms.</p>
                    </section>

                    <section id="description" className="scroll-mt-28">
                        <h2 className="text-xl font-black text-slate-900 mb-4 pb-3 border-b border-slate-100">2. Platform Description</h2>
                        <p className="mb-3">Recruit Flow is a Software-as-a-Service (SaaS) recruitment management platform that enables recruiters to create job postings, receive and review candidate applications, generate AI-powered resume summaries and ATS scores, communicate with candidates via email, schedule interviews, and access a candidate CRM and analytics dashboard.</p>
                        <p>The Platform also provides a public-facing application portal through which job candidates can submit their resumes and information to recruiters.</p>
                    </section>

                    <section id="eligibility" className="scroll-mt-28">
                        <h2 className="text-xl font-black text-slate-900 mb-4 pb-3 border-b border-slate-100">3. Eligibility</h2>
                        <p className="mb-3">To use the Platform, you must be at least 18 years of age, have the legal capacity to enter into a binding contract, not be prohibited from using the Platform under applicable laws, and provide accurate and truthful information during registration.</p>
                        <p>We reserve the right to refuse service to anyone for any reason at any time.</p>
                    </section>

                    <section id="accounts" className="scroll-mt-28">
                        <h2 className="text-xl font-black text-slate-900 mb-4 pb-3 border-b border-slate-100">4. User Accounts</h2>
                        <p className="mb-3">When you create an account, you agree to provide accurate and complete information, keep your password confidential, notify us immediately of any unauthorized use, and accept responsibility for all activities under your account.</p>
                        <p>You may not create more than one account per person without our prior written consent. We reserve the right to suspend or terminate accounts that violate these Terms.</p>
                    </section>

                    <section id="recruiter-obligations" className="scroll-mt-28">
                        <h2 className="text-xl font-black text-slate-900 mb-4 pb-3 border-b border-slate-100">5. Recruiter Obligations</h2>
                        <p className="mb-3">As a recruiter, you agree to use the Platform only for legitimate recruitment purposes, post only genuine job opportunities, comply with all applicable employment and data protection laws, not use candidate data for purposes other than evaluating suitability for the specific role applied for, not share candidate data with unauthorized third parties, and ensure all communications sent to candidates are professional and lawful.</p>
                        <p>You acknowledge that you are the data controller for candidate information collected through your job postings, and Recruit Flow acts as a data processor on your behalf.</p>
                    </section>

                    <section id="candidate-obligations" className="scroll-mt-28">
                        <h2 className="text-xl font-black text-slate-900 mb-4 pb-3 border-b border-slate-100">6. Candidate Obligations</h2>
                        <p className="mb-3">As a candidate, you agree to provide accurate and truthful information, not submit false or fraudulent resumes or credentials, consent to your information being processed by the Platform's AI systems, and consent to your application data being shared with the recruiter who posted the job you applied for.</p>
                        <p>Submitting false information may result in disqualification and may have legal consequences.</p>
                    </section>

                    <section id="subscriptions" className="scroll-mt-28">
                        <h2 className="text-xl font-black text-slate-900 mb-4 pb-3 border-b border-slate-100">7. Subscriptions & Payments</h2>
                        <h3 className="font-bold text-slate-800 mb-2">7.1 Subscription Tiers</h3>
                        <p className="mb-3">The Platform offers Essential (Free), Arctic Pro, and Enterprise tiers. Features are described on our Pricing page and are subject to change with notice.</p>
                        <h3 className="font-bold text-slate-800 mb-2">7.2 Payment Process</h3>
                        <p className="mb-3">Paid subscriptions are activated manually after receipt and verification of payment via QR code bank transfer. We do not store payment card information.</p>
                        <h3 className="font-bold text-slate-800 mb-2">7.3 Refund Policy</h3>
                        <p className="mb-3">All payments are non-refundable once a subscription has been activated, except where required by applicable law. Billing errors must be reported within 7 days.</p>
                        <h3 className="font-bold text-slate-800 mb-2">7.4 Price Changes</h3>
                        <p>We may change subscription prices with at least 30 days' notice to existing subscribers. Continued use after a price change constitutes acceptance.</p>
                    </section>

                    <section id="ai-disclaimer" className="scroll-mt-28">
                        <h2 className="text-xl font-black text-slate-900 mb-4 pb-3 border-b border-slate-100">8. AI Features Disclaimer</h2>
                        <p className="mb-3">The Platform uses Google Gemini AI to generate resume summaries and ATS scores. You acknowledge that AI-generated content is for informational purposes only, may contain errors or inaccuracies, and should not be the sole basis for any hiring decision. Recruiters are solely responsible for all hiring decisions. Recruit Flow is not liable for any employment decisions, discrimination claims, or other consequences arising from reliance on AI-generated content. AI processing is also subject to Google's own terms and privacy policy.</p>
                    </section>

                    <section id="intellectual-property" className="scroll-mt-28">
                        <h2 className="text-xl font-black text-slate-900 mb-4 pb-3 border-b border-slate-100">9. Intellectual Property</h2>
                        <p className="mb-3">The Platform, including its design, code, features, and branding, is owned by Ujjwal Rupakheti. You are granted a limited, non-exclusive, non-transferable license to use the Platform for its intended purposes. You may not copy, modify, distribute, reverse engineer, or create derivative works from the Platform.</p>
                        <p>You retain ownership of content you upload. By uploading content, you grant us a limited license to store, process, and display it as necessary to provide the Platform's services.</p>
                    </section>

                    <section id="prohibited" className="scroll-mt-28">
                        <h2 className="text-xl font-black text-slate-900 mb-4 pb-3 border-b border-slate-100">10. Prohibited Conduct</h2>
                        <p className="mb-3">You agree not to use the Platform to violate any applicable law, engage in discrimination, scrape or harvest data using automated tools, attempt unauthorized access to the Platform or its infrastructure, upload malicious code, impersonate any person or entity, send spam or harass other users, circumvent usage limits or access controls, or post fraudulent job listings.</p>
                        <p>Violations may result in immediate account termination and may expose you to civil or criminal liability.</p>
                    </section>

                    <section id="liability" className="scroll-mt-28">
                        <h2 className="text-xl font-black text-slate-900 mb-4 pb-3 border-b border-slate-100">11. Limitation of Liability</h2>
                        <p className="mb-3">The Platform is provided "as is" without warranties of any kind. Recruit Flow shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform. Our total liability for any claims shall not exceed the amount you paid to us in the 12 months preceding the claim, or NPR 1,000, whichever is greater.</p>
                        <p>Some jurisdictions do not allow certain liability exclusions, so some limitations may not apply to you.</p>
                    </section>

                    <section id="indemnification" className="scroll-mt-28">
                        <h2 className="text-xl font-black text-slate-900 mb-4 pb-3 border-b border-slate-100">12. Indemnification</h2>
                        <p>You agree to indemnify and hold harmless Recruit Flow and its operator from any claims, liabilities, damages, losses, and expenses arising from your use of the Platform, your violation of these Terms, your violation of any applicable law or third-party rights, or any content you submit to the Platform.</p>
                    </section>

                    <section id="termination" className="scroll-mt-28">
                        <h2 className="text-xl font-black text-slate-900 mb-4 pb-3 border-b border-slate-100">13. Termination</h2>
                        <p className="mb-3">We may suspend or terminate your access at any time, with or without notice, if we believe you have violated these Terms. You may terminate your account by contacting us at work@ujjwalrupakheti.com.np.</p>
                        <p>Sections relating to intellectual property, liability, indemnification, and dispute resolution survive termination.</p>
                    </section>

                    <section id="disputes" className="scroll-mt-28">
                        <h2 className="text-xl font-black text-slate-900 mb-4 pb-3 border-b border-slate-100">14. Dispute Resolution</h2>
                        <p className="mb-3">In the event of any dispute, the parties agree to first attempt informal resolution by contacting us at work@ujjwalrupakheti.com.np within 30 days.</p>
                        <p>If informal resolution fails, disputes shall be resolved through the courts of Sunsari District, Nepal, under applicable Nepali law.</p>
                    </section>

                    <section id="governing-law" className="scroll-mt-28">
                        <h2 className="text-xl font-black text-slate-900 mb-4 pb-3 border-b border-slate-100">15. Governing Law</h2>
                        <p>These Terms are governed by the laws of Nepal. If you access the Platform from outside Nepal, you are responsible for compliance with local laws to the extent applicable.</p>
                    </section>

                    <section id="changes" className="scroll-mt-28">
                        <h2 className="text-xl font-black text-slate-900 mb-4 pb-3 border-b border-slate-100">16. Changes to Terms</h2>
                        <p className="mb-3">When we make material changes, we will update the "Last Updated" date, notify registered users via email at least 14 days before changes take effect, and display a prominent notice on the Platform.</p>
                        <p>Continued use after the effective date constitutes acceptance of the revised Terms.</p>
                    </section>

                    <section id="contact" className="scroll-mt-28">
                        <h2 className="text-xl font-black text-slate-900 mb-4 pb-3 border-b border-slate-100">17. Contact</h2>
                        <p className="mb-4">For questions about these Terms, contact us:</p>
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
