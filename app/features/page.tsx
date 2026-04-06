import type { Metadata } from 'next';
import Link from 'next/link';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';

export const metadata: Metadata = {
    title: 'AI Recruitment Features — Recruit Flow | ATS Scoring, Resume Screening & Candidate Management',
    description: 'Discover Recruit Flow\'s AI recruitment features: automated ATS scoring, resume flipbook viewer, candidate CRM, interview scheduling, bulk PDF export, and AI job description generator.',
    keywords: 'AI recruitment software, ATS scoring, resume screening software, candidate management system, recruitment automation, AI hiring tools, applicant tracking system',
    openGraph: {
        title: 'AI Recruitment Features — Recruit Flow',
        description: 'Everything you need to hire faster and smarter. AI-powered ATS scoring, resume flipbooks, candidate CRM, and more.',
        type: 'website',
    },
};

const features = [
    {
        number: '01',
        title: 'AI-Powered ATS Scoring',
        description: 'Every resume submitted gets an instant score from 0 to 100. The AI reads the full document, matches it against your job description across five dimensions — skills, experience, title alignment, education, and measurable achievements — and writes a detailed analysis in under 10 seconds.',
        detail: 'Available on all plans.',
    },
    {
        number: '02',
        title: 'Interactive Resume Flipbook',
        description: 'Browse your candidate pipeline in a visual, page-turning interface. Candidates are sorted by ATS score. You can flip through resumes, read AI summaries, and make accept or reject decisions without leaving the view.',
        detail: 'Pro and Enterprise plans.',
    },
    {
        number: '03',
        title: 'Candidate CRM',
        description: 'A searchable, filterable database of every applicant across all your jobs. Filter by status, search by name or email, view resumes in-panel, and send emails directly from the platform.',
        detail: 'Pro and Enterprise plans.',
    },
    {
        number: '04',
        title: 'AI Job Description Generator',
        description: 'Type a job title, select experience level, work mode, and job type, then click generate. The AI writes a complete, structured job description with responsibilities, requirements, and benefits — tailored to your exact criteria.',
        detail: 'Pro and Enterprise plans.',
    },
    {
        number: '05',
        title: 'AI Recruiter Chat',
        description: 'Ask your AI assistant questions about your candidate pool. "Who is the best fit for a remote role?" or "Compare the top three candidates." The AI knows every candidate\'s score and summary and gives data-driven answers.',
        detail: 'Enterprise plan.',
    },
    {
        number: '06',
        title: 'AI Candidate Shortlist',
        description: 'One-time AI analysis per job that ranks your top five candidates with detailed reasoning — why each candidate ranks where they do, their key strengths, and their main gap. Results are saved permanently.',
        detail: 'Enterprise plan.',
    },
    {
        number: '07',
        title: 'Interview Calendar',
        description: 'Create interview invites, set start and end times, choose virtual or on-site, and track status. Conflict detection prevents double-booking. All scheduling happens without leaving the platform.',
        detail: 'Enterprise plan.',
    },
    {
        number: '08',
        title: 'Bulk PDF Export',
        description: 'Merge all candidate resumes for a job — or across all jobs — into a single downloadable PDF. Useful for sharing with hiring committees or archiving candidate pools.',
        detail: 'Enterprise plan.',
    },
];

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-white font-sans">
            <PublicNavbar />

            {/* Hero */}
            <section className="relative overflow-hidden pt-32 pb-20 bg-[#fafafa] border-b border-slate-100">
                <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                <div className="relative max-w-4xl mx-auto px-6 text-center">
                    <span className="inline-block text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">Platform Features</span>
                    <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter mb-6 leading-tight">
                        Everything you need<br />to hire smarter.
                    </h1>
                    <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
                        Recruit Flow combines AI resume screening, candidate management, and interview scheduling into one platform — so your team spends time on people, not paperwork.
                    </p>
                    <div className="flex items-center justify-center gap-4 flex-wrap">
                        <Link href="/register" className="px-8 py-3.5 bg-slate-900 text-white rounded text-sm font-bold hover:bg-slate-800 transition-all">
                            Start Free
                        </Link>
                        <Link href="/pricing" className="px-8 py-3.5 border border-slate-200 text-slate-700 rounded text-sm font-bold hover:border-slate-900 transition-all">
                            View Pricing
                        </Link>
                    </div>
                </div>
            </section>

            {/* Animated stats bar */}
            <section className="py-12 border-b border-slate-100 bg-white">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {[
                            { value: '< 10s', label: 'Resume processing time' },
                            { value: '5', label: 'ATS scoring dimensions' },
                            { value: '0–100', label: 'Calibrated score range' },
                            { value: '10+', label: 'Active jobs on Enterprise' },
                        ].map((stat, i) => (
                            <div key={i}>
                                <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features list */}
            <section className="py-24 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="space-y-16">
                        {features.map((f, i) => (
                            <article key={i} className={`grid md:grid-cols-[80px_1fr] gap-8 pb-16 ${i < features.length - 1 ? 'border-b border-slate-100' : ''}`}>
                                <div className="text-5xl font-black text-slate-100 leading-none pt-1">{f.number}</div>
                                <div>
                                    <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{f.title}</h2>
                                        <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 bg-slate-100 text-slate-500 rounded-sm border border-slate-100 shrink-0">{f.detail}</span>
                                    </div>
                                    <p className="text-slate-600 leading-relaxed max-w-2xl">{f.description}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-slate-900 px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Ready to transform your hiring?</h2>
                    <p className="text-slate-400 mb-8 font-medium">Join recruiters who use Recruit Flow to process candidates faster.</p>
                    <Link href="/register" className="inline-block px-10 py-4 bg-white text-slate-900 rounded text-sm font-black uppercase tracking-widest hover:bg-slate-100 transition-all">
                        Get Started Free
                    </Link>
                </div>
            </section>

            <PublicFooter />
        </div>
    );
}
