
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Product Changelog — Latest Updates & New Features | Recruit Flow',
    description: 'Stay up to date with Recruit Flow product updates. New features, performance improvements, bug fixes, and platform enhancements for the AI recruitment platform.',
    keywords: 'recruit flow changelog, recruitment software updates, ATS platform new features, product updates hiring software',
    openGraph: { title: 'Changelog | Recruit Flow', description: 'Latest product updates, new features, and improvements to the Recruit Flow platform.', type: 'website' },
};
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

const updates = [
    {
        version: 'v2.4',
        date: 'April 2026',
        tag: 'New Feature',
        tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        title: 'AI Candidate Shortlist',
        items: [
            'Enterprise users can trigger a one-time AI shortlist analysis per job posting',
            'AI ranks the top 5 candidates with detailed written reasoning covering strengths, experience gaps, and a hire recommendation',
            'Shortlist results are saved permanently to the job record and accessible to all team members',
            'Confirmation modal prevents accidental use of the one-time credit',
        ],
    },
    {
        version: 'v2.3',
        date: 'April 2026',
        tag: 'New Feature',
        tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        title: 'AI Job Description Generator',
        items: [
            'Pro and Enterprise users can generate a complete job description with one click from the job creation form',
            'Generator respects all selected parameters: experience level, education requirement, work mode, and job type',
            'Output is structured with labeled sections and bullet points â€” ready to publish without editing',
            'Tone is professional and specific â€” no generic filler phrases or corporate buzzwords',
        ],
    },
    {
        version: 'v2.2',
        date: 'March 2026',
        tag: 'Improvement',
        tagColor: 'bg-blue-50 text-blue-700 border-blue-100',
        title: 'Job Posting Form Redesign',
        items: [
            'Removed the company name field â€” the platform now auto-populates from the recruiter\'s profile',
            'Added Job Type selector: Full-time, Part-time, Contract, and Internship',
            'Added Minimum Education dropdown: 10+2, Bachelor\'s Degree, Master\'s Degree, and PhD',
            'Added Experience Level multi-select supporting up to 2 selections per posting',
            'Public application page updated to display all new fields to candidates before they apply',
        ],
    },
    {
        version: 'v2.1',
        date: 'March 2026',
        tag: 'Performance',
        tagColor: 'bg-amber-50 text-amber-700 border-amber-100',
        title: 'Authentication and API Performance Improvements',
        items: [
            'JWT is now decoded locally from the HTTP-only cookie â€” eliminates a server round-trip on every authenticated request',
            'Dashboard data is prefetched in parallel on initial load, reducing time-to-interactive by approximately 40%',
            'CRM and Calendar data is loaded once and passed as props â€” no redundant API calls when switching between tabs',
            'Support queue queries optimized to select only required columns with a reduced result limit of 200 records',
        ],
    },
    {
        version: 'v2.0',
        date: 'February 2026',
        tag: 'Major Release',
        tagColor: 'bg-slate-100 text-slate-700 border-slate-200',
        title: 'ATS Scoring Engine Overhaul',
        items: [
            'ATS scoring engine rebuilt with 5 weighted dimensions: skills match (35), experience relevance (25), title alignment (20), education fit (10), and quantified achievements (10)',
            'Removed company name matching from the scoring algorithm â€” this dimension introduced bias toward candidates from well-known companies regardless of actual fit',
            'Skeleton loaders added across the dashboard, application page, flipbook, and CRM for improved perceived performance',
            'Admin dashboard tab state now persists across page refreshes using URL query parameters',
        ],
    },
    {
        version: 'v1.9',
        date: 'January 2026',
        tag: 'New Feature',
        tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        title: 'Interview Calendar',
        items: [
            'Enterprise users can create interview invites with start time, end time, and virtual or on-site designation',
            'Built-in conflict detection prevents scheduling two interviews at the same time for the same recruiter',
            'Interviews are linked to specific candidates and jobs for full pipeline context',
            'Calendar view shows all upcoming interviews across all active jobs in a single interface',
        ],
    },
    {
        version: 'v1.8',
        date: 'January 2026',
        tag: 'New Feature',
        tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        title: 'Bulk PDF Export',
        items: [
            'Enterprise users can merge all candidate resumes for a single job into one downloadable PDF',
            'Export includes candidate name, ATS score, and application date as a cover sheet for each resume',
            'Cross-job export available from the CRM â€” export all candidates across all active jobs',
            'PDF generation happens server-side â€” no client-side processing or browser memory issues',
        ],
    },
];

export default function ChangelogPage() {
    return (
        <div className="min-h-screen bg-white font-sans">
            <PublicNavbar />

            {/* Hero */}
            <section className="pt-32 pb-20 bg-[#fafafa] border-b border-slate-100 relative overflow-hidden">
                <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                <motion.div
                    className="relative max-w-4xl mx-auto px-6 text-center"
                    initial="hidden"
                    animate="visible"
                    variants={stagger}
                >
                    <motion.span variants={fadeInUp} className="inline-block text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">
                        Product Updates
                    </motion.span>
                    <motion.h1 variants={fadeInUp} className="text-5xl font-black text-slate-900 tracking-tighter mb-4">
                        Changelog
                    </motion.h1>
                    <motion.p variants={fadeInUp} className="text-lg text-slate-500 font-medium max-w-xl mx-auto leading-relaxed">
                        A complete record of every feature release, improvement, and fix shipped to the Recruit Flow platform.
                    </motion.p>
                </motion.div>
            </section>

            {/* Updates timeline */}
            <section className="py-24 px-6">
                <div className="max-w-3xl mx-auto">
                    <motion.div
                        className="space-y-12"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={stagger}
                    >
                        {updates.map((u, i) => (
                            <motion.article key={i} variants={fadeInUp} className="relative pl-8 border-l-2 border-slate-100">
                                <div className="absolute -left-1.5 top-1 size-3 bg-slate-900 rounded-full" />
                                <div className="flex items-center gap-3 mb-3 flex-wrap">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{u.date}</span>
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm border ${u.tagColor}`}>{u.tag}</span>
                                    <span className="text-[10px] font-black text-slate-300">{u.version}</span>
                                </div>
                                <h2 className="text-xl font-black text-slate-900 mb-4">{u.title}</h2>
                                <ul className="space-y-2">
                                    {u.items.map((item, j) => (
                                        <li key={j} className="flex items-start gap-2 text-sm text-slate-600">
                                            <span className="size-1.5 bg-slate-400 rounded-full shrink-0 mt-1.5" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </motion.article>
                        ))}
                    </motion.div>
                </div>
            </section>

            <PublicFooter />
        </div>
    );
}




