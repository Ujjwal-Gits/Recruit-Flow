import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Security and Data Privacy — Enterprise-Grade Recruitment Security',
    description: 'Recruit Flow protects candidate data with JWT authentication, Row-Level Security, OTP verification, rate limiting, TLS encryption, and complete account data isolation.',
    keywords: 'recruitment software security, HR data privacy, secure ATS platform, candidate data protection, GDPR recruitment software, data isolation',
    openGraph: { title: 'Security and Data Privacy | Recruit Flow', description: 'Enterprise-grade security at every layer — from authentication to database access to file storage.', type: 'website' },
};

import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Security & Data Privacy — Enterprise-Grade Recruitment Security | Recruit Flow',
    description: 'Recruit Flow protects your candidate data with JWT authentication, Row-Level Security, OTP verification, rate limiting, TLS encryption, and complete data isolation between accounts.',
    keywords: 'recruitment software security, HR data privacy, secure ATS platform, candidate data protection, GDPR recruitment software, applicant data security',
    openGraph: { title: 'Security & Data Privacy | Recruit Flow', description: 'Enterprise-grade security at every layer — from authentication to database access to file storage.', type: 'website' },
};
import Link from 'next/link';
import { motion } from 'framer-motion';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';

const fadeInUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const stagger = {
    visible: { transition: { staggerChildren: 0.1 } },
};

const securityFeatures = [
    {
        title: 'JWT Authentication',
        desc: 'Every session uses a signed JSON Web Token issued and verified by Supabase Auth. Tokens expire automatically and are refreshed via HTTP-only cookies with SameSite=Lax â€” preventing token theft through XSS or CSRF attacks.',
    },
    {
        title: 'Row-Level Security',
        desc: 'Every database table enforces Row-Level Security policies at the PostgreSQL layer. Recruiters can only read and write their own jobs, candidates, and profile data. Cross-account data access is architecturally impossible â€” not just restricted by application logic.',
    },
    {
        title: 'OTP Verification',
        desc: 'Account registration, password resets, and sensitive profile changes require a 6-digit one-time password sent to your verified email address. OTP codes expire after 2 minutes and are invalidated after 5 consecutive failed attempts.',
    },
    {
        title: 'Rate Limiting on Auth Endpoints',
        desc: 'All authentication endpoints are rate-limited by IP address. Login attempts are capped at 5 per 5-minute window. Registration is limited to 3 attempts per 10 minutes. These limits prevent brute-force credential attacks without impacting legitimate users.',
    },
    {
        title: 'Secure Resume File Storage',
        desc: 'Uploaded resumes are stored in Supabase Storage with randomized, non-guessable filenames. No personally identifiable information is embedded in storage paths. All files are served exclusively over HTTPS with signed URLs that expire after use.',
    },
    {
        title: 'TLS Encryption in Transit',
        desc: 'All data transmitted between your browser and Recruit Flow\'s servers is encrypted via TLS 1.2 or higher. Production cookies are set with the Secure flag, ensuring they are never transmitted over unencrypted connections.',
    },
    {
        title: 'Role-Based Admin Access Control',
        desc: 'Admin routes are protected at both the Next.js middleware layer and the API route level. Only users with verified owner, manager, support, or admin roles can access the admin panel â€” role verification happens server-side on every request, not just at login.',
    },
    {
        title: 'Complete Data Isolation Between Accounts',
        desc: 'Each recruiter\'s data is fully isolated at the database level. Knowing another user\'s ID does not grant any access to their jobs, candidates, or profile. All queries are scoped to the authenticated user\'s ID before execution.',
    },
];

const faqs = [
    {
        q: 'Where is candidate data stored?',
        a: 'All structured data â€” applications, scores, summaries, and recruiter profiles â€” is stored in a PostgreSQL database hosted by Supabase on AWS infrastructure. Resume files are stored in Supabase Storage. All data is encrypted at rest using AES-256 and in transit via TLS.',
    },
    {
        q: 'Can candidates request deletion of their data?',
        a: 'Yes. Recruiters can delete individual applications from their dashboard at any time, which removes the candidate\'s data from the system. For direct data deletion requests, candidates can contact us at work@ujjwalrupakheti.com.np and we will process the request within 30 days.',
    },
    {
        q: 'Do you share or sell candidate data to third parties?',
        a: 'No. Candidate data is accessible only to the recruiter who received the application. We do not sell, license, share, or use candidate data for advertising, model training, or any purpose beyond delivering the Recruit Flow service.',
    },
    {
        q: 'How is AI analysis handled â€” does Google store resume data?',
        a: 'Resume text is sent to the Google Gemini API for analysis. Only the extracted plain text is transmitted â€” not the original file. Google\'s API data processing terms apply to this step. Gemini API requests are not used to train Google\'s models by default under the current API terms.',
    },
    {
        q: 'What happens to data if I close my account?',
        a: 'Account closure triggers deletion of all associated jobs, applications, and candidate data from the active database. Backups are retained for 30 days before permanent deletion in accordance with our data retention policy.',
    },
];

export default function SecurityPage() {
    return (
        <div className="min-h-screen bg-white font-sans">
            <PublicNavbar />

            {/* Hero */}
            <section className="pt-32 pb-20 bg-slate-900 relative overflow-hidden">
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                <motion.div
                    className="relative max-w-4xl mx-auto px-6 text-center"
                    initial="hidden"
                    animate="visible"
                    variants={stagger}
                >
                    <motion.span variants={fadeInUp} className="inline-block text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">
                        Security and Privacy
                    </motion.span>
                    <motion.h1 variants={fadeInUp} className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-6 leading-tight">
                        Candidate data protected<br />at every layer.
                    </motion.h1>
                    <motion.p variants={fadeInUp} className="text-lg text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
                        Recruit Flow is built on enterprise-grade infrastructure with security enforced at the authentication, database, storage, and transport layers â€” not bolted on as an afterthought.
                    </motion.p>
                </motion.div>
            </section>

            {/* Security pillars */}
            <section className="py-16 px-6 border-b border-slate-100">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={stagger}
                    >
                        {[
                            { label: 'Authentication', detail: 'JWT + OTP' },
                            { label: 'Database', detail: 'Row-Level Security' },
                            { label: 'Transport', detail: 'TLS Encrypted' },
                            { label: 'Storage', detail: 'Signed URLs' },
                        ].map((item, i) => (
                            <motion.div key={i} variants={fadeInUp}>
                                <p className="text-lg font-black text-slate-900">{item.label}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{item.detail}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Security features */}
            <section className="py-24 px-6">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        className="text-center mb-16"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={stagger}
                    >
                        <motion.h2 variants={fadeInUp} className="text-3xl font-black text-slate-900 tracking-tight mb-4">
                            Security at every layer
                        </motion.h2>
                        <motion.p variants={fadeInUp} className="text-slate-500 max-w-xl mx-auto leading-relaxed">
                            Each security control is implemented independently â€” a failure at one layer does not compromise the others.
                        </motion.p>
                    </motion.div>
                    <motion.div
                        className="grid md:grid-cols-2 gap-6"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={stagger}
                    >
                        {securityFeatures.map((f, i) => (
                            <motion.div key={i} variants={fadeInUp} className="bg-white border border-slate-100 rounded-sm p-6">
                                <h3 className="text-sm font-black text-slate-900 mb-2">{f.title}</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-20 bg-slate-50 border-t border-slate-100 px-6">
                <div className="max-w-3xl mx-auto">
                    <motion.h2
                        className="text-3xl font-black text-slate-900 mb-12 text-center tracking-tight"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                    >
                        Data and Privacy FAQ
                    </motion.h2>
                    <motion.div
                        className="space-y-4"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={stagger}
                    >
                        {faqs.map((faq, i) => (
                            <motion.div key={i} variants={fadeInUp} className="bg-white border border-slate-100 rounded-sm p-6">
                                <h3 className="text-sm font-black text-slate-900 mb-2">{faq.q}</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">{faq.a}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-slate-900 px-6">
                <motion.div
                    className="max-w-3xl mx-auto text-center"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={stagger}
                >
                    <motion.h2 variants={fadeInUp} className="text-4xl font-black text-white mb-4 tracking-tight">
                        Questions about data handling?
                    </motion.h2>
                    <motion.p variants={fadeInUp} className="text-slate-400 mb-8 font-medium">
                        Contact our team directly for security documentation, data processing agreements, or compliance questions.
                    </motion.p>
                    <motion.div variants={fadeInUp}>
                        <Link href="/contact" className="inline-block px-10 py-4 bg-white text-slate-900 rounded text-sm font-black uppercase tracking-widest hover:bg-slate-100 transition-all">
                            Contact Us
                        </Link>
                    </motion.div>
                </motion.div>
            </section>

            <PublicFooter />
        </div>
    );
}



