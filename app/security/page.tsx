import type { Metadata } from 'next';
import Link from 'next/link';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';

export const metadata: Metadata = {
    title: 'Security & Data Privacy — Recruit Flow | Enterprise-Grade Recruitment Security',
    description: 'Recruit Flow uses enterprise-grade security: Supabase Auth with JWT, Row-Level Security, encrypted data storage, OTP verification, and rate limiting on all endpoints.',
    keywords: 'recruitment software security, HR data privacy, secure ATS platform, candidate data protection, GDPR recruitment software',
};

const securityFeatures = [
    { title: 'JWT Authentication', desc: 'Every session uses a signed JSON Web Token verified by Supabase Auth. Tokens expire automatically and are refreshed securely via HTTP-only cookies with SameSite=Lax.' },
    { title: 'Row-Level Security', desc: 'Every database table has RLS policies enforced at the PostgreSQL level. Recruiters can only access their own jobs and candidates — no cross-account data leakage is possible at any level.' },
    { title: 'OTP Verification', desc: 'Registration, password reset, and profile changes all require a 6-digit OTP sent to your email. Codes expire in 2 minutes and are invalidated after 5 failed attempts.' },
    { title: 'Rate Limiting', desc: 'All authentication endpoints are rate-limited by IP address. Login allows 5 attempts per 5 minutes. Registration allows 3 per 10 minutes. This prevents brute-force attacks.' },
    { title: 'Secure File Storage', desc: 'Resumes are stored in Supabase Storage with randomized filenames. No personally identifiable information is included in storage paths. Files are served over HTTPS only.' },
    { title: 'HTTPS Everywhere', desc: 'All data in transit is encrypted via TLS. Cookies are set with SameSite=Lax and Secure flags in production to prevent CSRF and interception.' },
    { title: 'Admin Access Control', desc: 'Admin routes are protected at both the middleware and API level. Only users with owner, manager, support, or admin roles can access the admin panel — verified server-side on every request.' },
    { title: 'Complete Data Isolation', desc: 'Each recruiter\'s data is completely isolated. You cannot access another recruiter\'s jobs, candidates, or profile — even if you know their user ID.' },
];

export default function SecurityPage() {
    return (
        <div className="min-h-screen bg-white font-sans">
            <PublicNavbar />

            <section className="pt-32 pb-20 bg-slate-900 relative overflow-hidden">
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                <div className="relative max-w-4xl mx-auto px-6 text-center">
                    <span className="inline-block text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">Security & Privacy</span>
                    <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-6 leading-tight">
                        Your candidate data<br />is safe with us.
                    </h1>
                    <p className="text-lg text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
                        Recruit Flow is built on enterprise-grade infrastructure with security at every layer — from authentication to database access to file storage.
                    </p>
                </div>
            </section>

            <section className="py-24 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Security at every layer</h2>
                        <p className="text-slate-500 max-w-xl mx-auto leading-relaxed">We don't bolt on security as an afterthought. Every feature is designed with data protection in mind from the start.</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        {securityFeatures.map((f, i) => (
                            <div key={i} className="bg-white border border-slate-100 rounded-sm p-6">
                                <h3 className="text-sm font-black text-slate-900 mb-2">{f.title}</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-20 bg-slate-50 border-t border-slate-100 px-6">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-black text-slate-900 mb-12 text-center tracking-tight">Data & Privacy FAQ</h2>
                    <div className="space-y-4">
                        {[
                            { q: 'Where is candidate data stored?', a: 'All data is stored in Supabase (PostgreSQL) hosted on AWS. Resume files are stored in Supabase Storage. Data is encrypted at rest and in transit.' },
                            { q: 'Can candidates request their data be deleted?', a: 'Yes. Recruiters can delete individual applications from their dashboard. Contact us at work@ujjwalrupakheti.com.np for data deletion requests.' },
                            { q: 'Do you share candidate data with third parties?', a: 'No. Candidate data is only accessible to the recruiter who received the application. We do not sell, share, or use candidate data for any purpose other than providing the service.' },
                            { q: 'How is AI analysis handled?', a: 'Resume text is sent to Google Gemini API for analysis. Only the extracted text is sent — not the original file. Google\'s data processing terms apply to this step.' },
                        ].map((faq, i) => (
                            <div key={i} className="bg-white border border-slate-100 rounded-sm p-6">
                                <h3 className="text-sm font-black text-slate-900 mb-2">{faq.q}</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <PublicFooter />
        </div>
    );
}
