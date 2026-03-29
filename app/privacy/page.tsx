import Link from 'next/link';
import { Shield, ArrowLeft, Mail } from 'lucide-react';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans selection:bg-slate-900 selection:text-white pb-20">
            {/* Arctic Header */}
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
                        <Shield className="size-3" />
                        Trust & Safety
                    </div>
                    <h1 className="text-5xl font-black tracking-tight text-slate-900 leading-none">
                        Privacy Policy
                    </h1>
                    <p className="text-slate-400 text-sm font-medium">Last updated: March 2026</p>
                </div>

                <div className="bg-white border border-slate-100 rounded shadow-sm overflow-hidden mb-12">
                    <div className="p-10 md:p-16 space-y-12">
                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                                <span className="size-2 rounded-full bg-slate-900" />
                                Data Intelligence & Collection
                            </h2>
                            <p className="text-slate-600 leading-relaxed font-medium">
                                At Recruit Flow, we leverage mission-critical infrastructure to process candidate information. When you apply for a position through our platform, we collect:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-slate-600 font-medium pl-4">
                                <li>Identity information (Name, Email)</li>
                                <li>Professional history (Resume/CV in PDF format)</li>
                                <li>Manual form inputs (Social profile links)</li>
                                <li>System-generated intelligence summaries (AI-driven analysis)</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                                <span className="size-2 rounded-full bg-slate-900" />
                                Processing Architecture
                            </h2>
                            <p className="text-slate-600 leading-relaxed font-medium">
                                Your data is processed through our high-fidelity intelligence layer (powered by Gemini AI) to provide recruiters with structured dossiers and match scores. This processing is performed solely for the purpose of candidate evaluation by the hiring entity you are applying to.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                                <span className="size-2 rounded-full bg-slate-900" />
                                Security Protocols
                            </h2>
                            <p className="text-slate-600 leading-relaxed font-medium">
                                We implement robust administrative and technical security measures to protect your mission-critical data from unauthorized access or disclosure.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                                <span className="size-2 rounded-full bg-slate-900" />
                                Contact & Support
                            </h2>
                            <p className="text-slate-600 leading-relaxed font-medium">
                                For inquiries regarding your personal data architecture or to request deletion of your applicant profile, please contact our administrative squad at:
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
                        By using the platform or submitting an application, you acknowledge that you have read and synchronized with the protocols outlined in this privacy framework.
                    </p>
                </div>
            </main>
        </div>
    );
}
