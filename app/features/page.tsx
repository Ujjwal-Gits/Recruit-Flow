import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'AI Recruitment Features — ATS Scoring, Resume Screening & Candidate Management',
    description: 'Explore Recruit Flow features: AI-powered ATS scoring, interactive resume flipbook, candidate CRM, AI job description generator, interview calendar, and bulk PDF export. Built for modern recruitment teams.',
    keywords: 'AI recruitment features, ATS scoring software, resume screening automation, candidate management system, AI hiring tools, recruitment platform features',
    openGraph: { title: 'AI Recruitment Features | Recruit Flow', description: 'Everything your team needs to hire smarter — AI ATS scoring, resume flipbooks, candidate CRM, and more.', type: 'website' },
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

const atsDimensions = [
    { label: 'Skills & Technology Match', score: 35, description: 'Evaluates required technical skills, tools, and domain expertise against the job description requirements.' },
    { label: 'Experience Relevance', score: 25, description: 'Assesses years of experience, industry background, and role-specific accomplishments.' },
    { label: 'Job Title Alignment', score: 20, description: 'Compares the candidate\'s career trajectory and current title against the target role level.' },
    { label: 'Education & Certifications', score: 10, description: 'Verifies minimum education requirements and relevant professional certifications.' },
    { label: 'Quantified Achievements', score: 10, description: 'Identifies measurable results, metrics, and impact statements that signal high performance.' },
];

const features = [
    {
        number: '01',
        title: 'AI-Powered ATS Scoring',
        description: 'Every submitted resume receives an instant score from 0 to 100. Recruit Flow\'s AI reads the full document, evaluates it across five weighted dimensions against your job description, and produces a written analysis in under 10 seconds â€” before you open a single file.',
        detail: 'All plans',
    },
    {
        number: '02',
        title: 'Interactive Resume Flipbook',
        description: 'Browse your entire candidate pipeline in a visual, page-turning interface sorted by ATS score. Read AI summaries, view full resumes, and make accept or reject decisions with reason tagging â€” all without switching screens.',
        detail: 'Pro & Enterprise',
    },
    {
        number: '03',
        title: 'Candidate CRM',
        description: 'A searchable, filterable database of every applicant across all active jobs. Filter by application status, search by name or email, preview resumes in-panel, and send templated emails directly from the platform without exporting data.',
        detail: 'Pro & Enterprise',
    },
    {
        number: '04',
        title: 'AI Job Description Generator',
        description: 'Select a job title, experience level, work mode, and employment type â€” then click generate. The AI writes a complete, structured job description with responsibilities, requirements, and benefits tailored to your exact criteria in under 15 seconds.',
        detail: 'Pro & Enterprise',
    },
    {
        number: '05',
        title: 'AI Recruiter Chat',
        description: 'Query your candidate pool in plain language. Ask "Which candidates have led engineering teams of 10 or more?" or "Compare the top three applicants for culture fit." The AI references every candidate\'s score and written summary to deliver data-grounded answers.',
        detail: 'Enterprise',
    },
    {
        number: '06',
        title: 'AI Candidate Shortlist',
        description: 'A one-time deep analysis per job that ranks your top five candidates with detailed reasoning â€” covering each candidate\'s primary strengths, experience gaps, and a clear recommendation. Results are saved permanently to the job record.',
        detail: 'Enterprise',
    },
    {
        number: '07',
        title: 'Interview Calendar',
        description: 'Create interview invites with start and end times, virtual or on-site designation, and candidate assignment. Built-in conflict detection prevents double-booking. All scheduling is managed within the platform â€” no calendar integrations required.',
        detail: 'Enterprise',
    },
    {
        number: '08',
        title: 'Bulk PDF Export',
        description: 'Merge all candidate resumes for a single job â€” or across your entire pipeline â€” into one downloadable PDF. Designed for sharing shortlists with hiring committees, archiving candidate pools, or presenting to clients.',
        detail: 'Enterprise',
    },
];

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-white font-sans">
            <PublicNavbar />

            {/* Hero */}
            <section className="relative overflow-hidden pt-32 pb-20 bg-[#fafafa] border-b border-slate-100">
                <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                <motion.div
                    className="relative max-w-4xl mx-auto px-6 text-center"
                    initial="hidden"
                    animate="visible"
                    variants={stagger}
                >
                    <motion.span variants={fadeInUp} className="inline-block text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">
                        Platform Features
                    </motion.span>
                    <motion.h1 variants={fadeInUp} className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter mb-6 leading-tight">
                        Every tool your team<br />needs to hire faster.
                    </motion.h1>
                    <motion.p variants={fadeInUp} className="text-lg text-slate-500 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
                        Recruit Flow combines AI resume screening, structured candidate management, and interview scheduling into a single platform â€” eliminating the manual work between job post and hire.
                    </motion.p>
                    <motion.div variants={fadeInUp} className="flex items-center justify-center gap-4 flex-wrap">
                        <Link href="/register" className="px-8 py-3.5 bg-slate-900 text-white rounded text-sm font-bold hover:bg-slate-800 transition-all">
                            Start Free
                        </Link>
                        <Link href="/pricing" className="px-8 py-3.5 border border-slate-200 text-slate-700 rounded text-sm font-bold hover:border-slate-900 transition-all">
                            View Pricing
                        </Link>
                    </motion.div>
                </motion.div>
            </section>

            {/* Stats */}
            <section className="py-12 border-b border-slate-100 bg-white">
                <div className="max-w-5xl mx-auto px-6">
                    <motion.div
                        className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={stagger}
                    >
                        {[
                            { value: '< 10s', label: 'Resume processing time' },
                            { value: '5', label: 'ATS scoring dimensions' },
                            { value: '0â€“100', label: 'Calibrated score range' },
                            { value: '8', label: 'Core platform features' },
                        ].map((stat, i) => (
                            <motion.div key={i} variants={fadeInUp}>
                                <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ATS Scoring Dimensions */}
            <section className="py-24 px-6 bg-slate-900">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        className="text-center mb-14"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={stagger}
                    >
                        <motion.span variants={fadeInUp} className="inline-block text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">
                            How Our AI Works
                        </motion.span>
                        <motion.h2 variants={fadeInUp} className="text-4xl font-black text-white tracking-tighter mb-4">
                            Five dimensions. One score.
                        </motion.h2>
                        <motion.p variants={fadeInUp} className="text-slate-400 max-w-xl mx-auto leading-relaxed">
                            Recruit Flow's scoring engine evaluates each resume across five weighted dimensions, producing a calibrated 0â€“100 score and a written analysis that explains the reasoning behind every result.
                        </motion.p>
                    </motion.div>

                    <motion.div
                        className="space-y-6"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={stagger}
                    >
                        {atsDimensions.map((dim, i) => (
                            <motion.div key={i} variants={fadeInUp} className="bg-white/5 border border-white/10 rounded-sm p-6">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-black text-white">{dim.label}</h3>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{dim.score} pts</span>
                                </div>
                                <div className="h-1.5 bg-white/10 rounded-full mb-3 overflow-hidden">
                                    <motion.div
                                        className="h-full bg-white rounded-full"
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${dim.score * 2.86}%` }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                                    />
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed">{dim.description}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Features list */}
            <section className="py-24 px-6">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        className="text-center mb-16"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={stagger}
                    >
                        <motion.h2 variants={fadeInUp} className="text-4xl font-black text-slate-900 tracking-tighter mb-4">
                            The complete feature set
                        </motion.h2>
                        <motion.p variants={fadeInUp} className="text-slate-500 max-w-xl mx-auto leading-relaxed">
                            From the moment a candidate applies to the moment you extend an offer, every step is covered.
                        </motion.p>
                    </motion.div>

                    <motion.div
                        className="space-y-0"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={stagger}
                    >
                        {features.map((f, i) => (
                            <motion.article
                                key={i}
                                variants={fadeInUp}
                                className={`grid md:grid-cols-[80px_1fr] gap-8 py-14 ${i < features.length - 1 ? 'border-b border-slate-100' : ''}`}
                            >
                                <div className="text-5xl font-black text-slate-100 leading-none pt-1">{f.number}</div>
                                <div>
                                    <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{f.title}</h2>
                                        <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 bg-slate-100 text-slate-500 rounded-sm border border-slate-100 shrink-0">{f.detail}</span>
                                    </div>
                                    <p className="text-slate-600 leading-relaxed max-w-2xl">{f.description}</p>
                                </div>
                            </motion.article>
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
                        Start screening smarter today.
                    </motion.h2>
                    <motion.p variants={fadeInUp} className="text-slate-400 mb-8 font-medium">
                        Post your first job in under 2 minutes. AI screening activates automatically on every application.
                    </motion.p>
                    <motion.div variants={fadeInUp}>
                        <Link href="/register" className="inline-block px-10 py-4 bg-white text-slate-900 rounded text-sm font-black uppercase tracking-widest hover:bg-slate-100 transition-all">
                            Get Started Free
                        </Link>
                    </motion.div>
                </motion.div>
            </section>

            <PublicFooter />
        </div>
    );
}



