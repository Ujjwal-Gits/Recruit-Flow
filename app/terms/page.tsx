import Link from 'next/link';
import { Scale, ArrowLeft, Mail, FileText } from 'lucide-react';

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans selection:bg-slate-900 selection:text-white pb-20">
            {/* Header */}
            <header className="bg-white border-b border-slate-100 h-20 sticky top-0 z-[60] flex items-center justify-center px-6">
                <div className="w-full max-w-[900px] flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="h-8 w-auto">
                            <img src="/recruit-flow-logo.png" alt="Recruit Flow" className="h-full w-auto object-contain" />
                        </div>
                    </Link>
                    <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors text-[10px] font-black uppercase tracking-widest">
                        <ArrowLeft className="size-3" />
                        Return Home
                    </Link>
                </div>
            </header>

            <main className="max-w-[700px] mx-auto px-6 pt-20">
                <div className="space-y-4 mb-16 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-white rounded text-[10px] font-black uppercase tracking-widest mb-4">
                        <Scale className="size-3" />
                        Legal Framework
                    </div>
                    <h1 className="text-5xl font-black tracking-tight text-slate-900 leading-none">
                        Terms of Service
                    </h1>
                    <p className="text-slate-400 text-sm font-medium">Last updated: March 2026</p>
                </div>

                <div className="bg-white border border-slate-100 rounded shadow-sm overflow-hidden mb-12">
                    <div className="p-10 md:p-16 space-y-12">
                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                                <span className="size-2 rounded-full bg-slate-900" />
                                Acceptance of Protocols
                            </h2>
                            <p className="text-slate-600 leading-relaxed font-medium">
                                By accessing or using the Recruit Flow platform (the "Platform"), you engage with our high-fidelity recruitment infrastructure. Using the Platform constitutes your complete agreement to these terms and our synchronized Privacy Protocol.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                                <span className="size-2 rounded-full bg-slate-900" />
                                User Conduct & Intelligence
                            </h2>
                            <p className="text-slate-600 leading-relaxed font-medium">
                                Recruiters and candidates alike must use the Platform for professional, legitimate recruitment purposes. Any attempt to compromise our intelligence infrastructure, scrape data, or submit fraudulent professional information will result in immediate termination of access.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                                <span className="size-2 rounded-full bg-slate-900" />
                                Service Tiers & Limitations
                            </h2>
                            <p className="text-slate-600 leading-relaxed font-medium">
                                Access to mission-critical features (AI Summaries, Bulk Processing, Direct Emailing) is governed by your specific User Tier (Free, Pro, or Enterprise). We reserve the right to synchronize or modify these tiers to maintain platform performance and fidelity.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                                <span className="size-2 rounded-full bg-slate-900" />
                                Data Integrity & Liability
                            </h2>
                            <p className="text-slate-600 leading-relaxed font-medium">
                                While our high-fidelity Gemini layer provides structured insights, you acknowledge that AI-generated summaries are for evaluation support only. Recruit Flow is not liable for recruitment decisions based on these automated dossiers.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                                <span className="size-2 rounded-full bg-slate-900" />
                                Administrative Contact
                            </h2>
                            <p className="text-slate-600 leading-relaxed font-medium">
                                For inquiries regarding our service protocols or to report a synchronization breach, please contact our squad at:
                            </p>
                            <div className="inline-flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-100 rounded font-bold text-slate-900 text-sm">
                                <Mail className="size-4 text-slate-400" />
                                recruitflow@ujjwalrupakheti.com.np
                            </div>
                        </section>
                    </div>
                </div>

                <div className="text-center p-8 bg-slate-100/50 rounded-lg border border-dashed border-slate-200">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-loose">
                        Your professional success is our mission. By using Recruit Flow, you commit to a high-fidelity recruitment architecture that values precision and integrity.
                    </p>
                </div>
            </main>
        </div>
    );
}
