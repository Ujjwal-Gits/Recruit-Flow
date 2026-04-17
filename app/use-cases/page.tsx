import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Recruitment Use Cases — Startups, Agencies, HR Teams & Enterprise | Recruit Flow',
    description: 'See how Recruit Flow helps startups, recruitment agencies, in-house HR teams, universities, freelance recruiters, and remote-first companies automate hiring and reduce time-to-hire with AI.',
    keywords: 'recruitment software use cases, AI hiring for startups, recruitment agency software, HR automation tools, enterprise hiring platform, small business ATS',
    alternates: { canonical: 'https://recruitflow.app/use-cases' },
    openGraph: { title: 'Recruitment Use Cases | Recruit Flow', description: 'Built for every team that hires — from solo founders to enterprise HR departments.', type: 'website' },
};
import Link from 'next/link';
import { motion } from 'framer-motion';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';

const fadeInUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as any } },
};

const stagger = {
    visible: { transition: { staggerChildren: 0.1 } },
};

const useCases = [
    {
        title: 'Startups and Scale-ups',
        subtitle: 'Hire fast without a dedicated HR function',
        description: 'Early-stage companies receive hundreds of applications for roles that need to be filled in days, not months. Recruit Flow\'s AI screens every applicant the moment they apply, so founders and engineering leads spend 30 minutes reviewing the top candidates â€” not 3 days reading every CV.',
        points: [
            'Post a job and generate a complete job description with AI in under 2 minutes',
            'Receive an ATS score and written analysis on every resume automatically',
            'Accept or reject candidates with structured reason tags for documentation',
            'Free plan supports 1 active job â€” sufficient for most early-stage hiring rounds',
        ],
    },
    {
        title: 'Recruitment Agencies',
        subtitle: 'Manage multiple client roles without losing pipeline visibility',
        description: 'Agencies running 5â€“10 active roles simultaneously need a system that scales without adding headcount. Recruit Flow\'s Enterprise plan provides 10 concurrent job postings, a cross-role candidate CRM, and bulk PDF export for client-ready shortlist presentations.',
        points: [
            '10 simultaneous active job postings with independent pipelines',
            'Global candidate CRM searchable across all roles and clients',
            'Bulk PDF export for presenting shortlists to hiring managers',
            'AI Shortlist generates a ranked top-5 with written reasoning per role',
        ],
    },
    {
        title: 'In-House HR Teams',
        subtitle: 'Reduce time-to-hire across multiple departments',
        description: 'Mid-size company HR teams manage high application volumes across engineering, sales, operations, and support â€” often simultaneously. Recruit Flow centralizes every pipeline, automates the screening layer, and gives hiring managers structured candidate data without requiring them to log into a separate system.',
        points: [
            'Centralized candidate pipeline per job with status tracking',
            'Email candidates directly from the platform with templated messages',
            'Interview calendar with conflict detection for multi-interviewer scheduling',
            'AI summaries give hiring managers candidate context before the first call',
        ],
    },
    {
        title: 'Universities and Academic Institutions',
        subtitle: 'Process high-volume student and research applications efficiently',
        description: 'Educational institutions hiring for internships, research assistant roles, teaching positions, or administrative functions receive large volumes of student applications with limited HR bandwidth. Recruit Flow\'s AI scoring handles the initial evaluation layer, surfacing the strongest candidates for human review.',
        points: [
            'Handle 100+ applications per role without manual pre-screening',
            'AI scoring calibrated for entry-level and internship role requirements',
            'Public application links shareable on campus portals and job boards',
            'Structured accept/reject workflow with reason documentation for compliance',
        ],
    },
    {
        title: 'Freelance and Independent Recruiters',
        subtitle: 'Professional-grade tools without enterprise pricing',
        description: 'Independent recruiters managing placements for multiple clients need tools that project professionalism and deliver results â€” without the cost structure of legacy ATS platforms. Recruit Flow\'s Pro plan provides AI screening, the candidate flipbook, and email workflows for four active roles at a fraction of traditional ATS pricing.',
        points: [
            '4 active job postings on the Pro plan',
            'AI-powered candidate analysis and written summaries per application',
            'Resume flipbook for presenting shortlists to clients visually',
            'Direct email workflows for candidate communication within the platform',
        ],
    },
    {
        title: 'Remote-First Companies',
        subtitle: 'Hire globally without geographic constraints',
        description: 'Remote companies receive applications from candidates across multiple countries, time zones, and resume formats. Recruit Flow\'s AI processes any resume regardless of origin or formatting style, and the platform operates entirely in the browser â€” no downloads, no installs, no VPN requirements.',
        points: [
            'Processes resumes from any country in any standard format',
            'No geographic restrictions on applicants or recruiters',
            'Browser-based platform accessible from any device or operating system',
            'Virtual interview scheduling built into the platform without third-party integrations',
        ],
    },
];


const pageSchema = {"@context":"https://schema.org","@type":"WebPage","name":"Recruitment Use Cases","description":"How different types of organizations use Recruit Flow for AI-powered hiring","mainEntity":{"@type":"ItemList","itemListElement":[{"@type":"ListItem","position":1,"name":"Startups and Scale-ups"},{"@type":"ListItem","position":2,"name":"Recruitment Agencies"},{"@type":"ListItem","position":3,"name":"In-House HR Teams"},{"@type":"ListItem","position":4,"name":"Universities and Institutions"},{"@type":"ListItem","position":5,"name":"Freelance Recruiters"},{"@type":"ListItem","position":6,"name":"Remote-First Companies"}]}};
export default function UseCasesPage() {
    return (
        <div className="min-h-screen bg-white font-sans">
            <PublicNavbar />

            {/* Hero — introduces the page and sets context for who Recruit Flow is built for */}
            <section className="pt-32 pb-20 bg-[#fafafa] border-b border-slate-100 relative overflow-hidden">
                <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                <motion.div
                    className="relative max-w-4xl mx-auto px-6 text-center"
                    initial="hidden"
                    animate="visible"
                    variants={stagger}
                >
                    <motion.span variants={fadeInUp} className="inline-block text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">
                        Use Cases
                    </motion.span>
                    <motion.h1 variants={fadeInUp} className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter mb-6 leading-tight">
                        Built for every team<br />that hires.
                    </motion.h1>
                    <motion.p variants={fadeInUp} className="text-lg text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
                        Whether you are a solo founder filling your first engineering role or an agency managing 10 client pipelines simultaneously â€” Recruit Flow adapts to your hiring volume and workflow.
                    </motion.p>
                </motion.div>
            </section>

            {/* Use Cases Grid */}
            <section className="py-24 px-6">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={stagger}
                    >
                        {useCases.map((uc, i) => (
                            <motion.article
                                key={i}
                                variants={fadeInUp}
                                className="bg-white border border-slate-100 rounded-sm p-8 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                            >
                                <h2 className="text-xl font-black text-slate-900 mb-1">{uc.title}</h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{uc.subtitle}</p>
                                <p className="text-sm text-slate-600 leading-relaxed mb-5">{uc.description}</p>
                                <ul className="space-y-2">
                                    {uc.points.map((p, j) => (
                                        <li key={j} className="flex items-start gap-2 text-sm text-slate-600">
                                            <span className="size-1.5 bg-slate-900 rounded-full shrink-0 mt-1.5" />
                                            {p}
                                        </li>
                                    ))}
                                </ul>
                            </motion.article>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Comparison section */}
            <section className="py-20 px-6 bg-slate-50 border-t border-slate-100">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        className="text-center mb-14"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={stagger}
                    >
                        <motion.h2 variants={fadeInUp} className="text-3xl font-black text-slate-900 tracking-tighter mb-4">
                            Find the right plan for your hiring volume.
                        </motion.h2>
                        <motion.p variants={fadeInUp} className="text-slate-500 max-w-xl mx-auto leading-relaxed">
                            Recruit Flow scales from a single job posting to 10 simultaneous roles. Every plan includes AI screening on every application.
                        </motion.p>
                    </motion.div>
                    <motion.div
                        className="grid md:grid-cols-3 gap-6"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={stagger}
                    >
                        {[
                            { plan: 'Free', audience: 'Founders and early-stage teams', jobs: '1 active job', cvs: '5 CV slots', ai: 'AI ATS scoring included' },
                            { plan: 'Pro', audience: 'Growing teams and freelance recruiters', jobs: '4 active jobs', cvs: '20 CV slots', ai: 'AI scoring + JD generator' },
                            { plan: 'Enterprise', audience: 'Agencies and in-house HR teams', jobs: '10 active jobs', cvs: 'Unlimited CV slots', ai: 'Full AI suite including Shortlist and Chat' },
                        ].map((tier, i) => (
                            <motion.div key={i} variants={fadeInUp} className="bg-white border border-slate-100 rounded-sm p-6">
                                <h3 className="text-lg font-black text-slate-900 mb-1">{tier.plan}</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{tier.audience}</p>
                                <ul className="space-y-2 text-sm text-slate-600">
                                    <li className="flex gap-2"><span className="size-1.5 bg-slate-400 rounded-full shrink-0 mt-1.5" />{tier.jobs}</li>
                                    <li className="flex gap-2"><span className="size-1.5 bg-slate-400 rounded-full shrink-0 mt-1.5" />{tier.cvs}</li>
                                    <li className="flex gap-2"><span className="size-1.5 bg-slate-400 rounded-full shrink-0 mt-1.5" />{tier.ai}</li>
                                </ul>
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
                        Find the right plan for your team.
                    </motion.h2>
                    <motion.p variants={fadeInUp} className="text-slate-400 mb-8 font-medium">
                        Start free and upgrade as your hiring volume grows. No long-term contracts.
                    </motion.p>
                    <motion.div variants={fadeInUp} className="flex items-center justify-center gap-4 flex-wrap">
                        <Link href="/pricing" className="inline-block px-10 py-4 bg-white text-slate-900 rounded text-sm font-black uppercase tracking-widest hover:bg-slate-100 transition-all">
                            See Pricing
                        </Link>
                        <Link href="/register" className="inline-block px-10 py-4 border border-white/20 text-white rounded text-sm font-black uppercase tracking-widest hover:border-white/40 transition-all">
                            Start Free
                        </Link>
                    </motion.div>
                </motion.div>
            </section>

            <PublicFooter />
        </div>
    );
}






