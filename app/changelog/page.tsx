import type { Metadata } from 'next';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';

export const metadata: Metadata = {
    title: 'Changelog — Recruit Flow Product Updates & New Features',
    description: 'See what\'s new in Recruit Flow. Product updates, new features, bug fixes, and improvements to the AI recruitment platform.',
    keywords: 'recruit flow updates, recruitment software changelog, new features ATS platform',
};

const updates = [
    {
        version: 'v2.4',
        date: 'April 2026',
        tag: 'New Feature',
        tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        title: 'AI Candidate Shortlist',
        items: ['Enterprise users can run a one-time AI shortlist per job', 'AI ranks top 5 candidates with detailed reasoning, strengths, and gaps', 'Results saved permanently to the job record', 'Confirmation modal before using the one-time credit'],
    },
    {
        version: 'v2.3',
        date: 'April 2026',
        tag: 'New Feature',
        tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        title: 'AI Job Description Generator',
        items: ['Pro and Enterprise users can auto-generate job descriptions with one click', 'Respects experience level, education, work mode, and job type selections', 'Structured output with sections and bullet points', 'Human-sounding tone — no corporate buzzwords'],
    },
    {
        version: 'v2.2',
        date: 'March 2026',
        tag: 'Improvement',
        tagColor: 'bg-blue-50 text-blue-700 border-blue-100',
        title: 'Job Posting Form Redesign',
        items: ['Removed company name field — now auto-uses profile company name', 'Added Job Type dropdown: Full-time, Part-time, Internship', 'Added Min. Education dropdown: 10+, +2, Bachelor, Master', 'Added Experience multi-select (up to 2 options)', 'Apply page now shows all new fields to candidates'],
    },
    {
        version: 'v2.1',
        date: 'March 2026',
        tag: 'Performance',
        tagColor: 'bg-amber-50 text-amber-700 border-amber-100',
        title: 'Auth & API Speed Improvements',
        items: ['JWT decoded locally from cookies — eliminates auth server round-trip on cached requests', 'Dashboard now prefetches all data in parallel on load', 'CRM and Calendar data loaded once and passed as props — no refetch on tab switch', 'Support queue queries optimized — select only needed columns, reduced limit to 200'],
    },
    {
        version: 'v2.0',
        date: 'February 2026',
        tag: 'Major Release',
        tagColor: 'bg-slate-100 text-slate-700 border-slate-200',
        title: 'ATS Engine Overhaul & Skeleton Loaders',
        items: ['ATS scoring rebuilt with 5 proper dimensions: skills, experience, title, education, achievements', 'Removed biased company name matching from scoring algorithm', 'Skeleton loaders added across dashboard, apply page, flipbook, and CRM', 'Admin dashboard tabs now persist across page refreshes'],
    },
];

export default function ChangelogPage() {
    return (
        <div className="min-h-screen bg-white font-sans">
            <PublicNavbar />

            <section className="pt-32 pb-20 bg-[#fafafa] border-b border-slate-100 relative overflow-hidden">
                <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                <div className="relative max-w-4xl mx-auto px-6 text-center">
                    <span className="inline-block text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">Product Updates</span>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">Changelog</h1>
                    <p className="text-lg text-slate-500 font-medium">What's new in Recruit Flow.</p>
                </div>
            </section>

            <section className="py-24 px-6">
                <div className="max-w-3xl mx-auto space-y-12">
                    {updates.map((u, i) => (
                        <article key={i} className="relative pl-8 border-l-2 border-slate-100">
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
                        </article>
                    ))}
                </div>
            </section>

            <PublicFooter />
        </div>
    );
}
