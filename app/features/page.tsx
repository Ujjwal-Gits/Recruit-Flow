import type { Metadata } from 'next';
import Link from 'next/link';
import PublicNavbar from '@/components/PublicNavbar';

export const metadata: Metadata = {
    title: 'AI Recruitment Features — Recruit Flow | ATS, Resume Screening & Candidate Management',
    description: 'Discover Recruit Flow\'s powerful AI recruitment features: automated ATS scoring, resume flipbook viewer, candidate CRM, interview scheduling, bulk PDF export, and AI-powered job descriptions.',
    keywords: 'AI recruitment software, ATS scoring, resume screening software, candidate management system, recruitment automation, AI hiring tools',
    openGraph: {
        title: 'AI Recruitment Features — Recruit Flow',
        description: 'Everything you need to hire faster and smarter. AI-powered ATS scoring, resume flipbooks, candidate CRM, and more.',
        type: 'website',
    },
};

const features = [
    {
        icon: '⚡',
        title: 'AI-Powered ATS Scoring',
        h2: 'Automated Resume Screening with Gemini AI',
        description: 'Every resume submitted gets an instant ATS score from 0–100. Our AI reads the full document, matches it against your job description, and writes a detailed analysis — so you spend time on the best candidates, not reading every CV.',
        bullets: ['Scores every resume in under 10 seconds', 'Detailed written analysis per candidate', 'Identifies skills gaps and strengths', 'Works with PDF and Word documents'],
        badge: 'All Plans',
    },
    {
        icon: '📖',
        title: 'Interactive Resume Flipbook',
        h2: 'Review Resumes Like a Magazine, Not a Spreadsheet',
        description: 'The Recruit Flow flipbook turns your candidate pipeline into a visual, page-turning experience. Flip through resumes side by side, see AI scores at a glance, and make decisions faster than any traditional ATS.',
        bullets: ['Page-flip animation for natural reading', 'Side-by-side candidate comparison', 'Instant accept/reject with reason tagging', 'Full PDF rendering in-browser'],
        badge: 'Pro & Enterprise',
    },
    {
        icon: '🗂️',
        title: 'Candidate CRM',
        h2: 'Track Every Applicant Across All Your Jobs',
        description: 'A searchable, filterable database of every candidate who has ever applied to any of your jobs. Filter by status, search by name or email, view their resume, and send emails — all from one screen.',
        bullets: ['Global applicant index across all jobs', 'Filter by accepted, rejected, pending', 'One-click email to any candidate', 'Full resume preview in-panel'],
        badge: 'Pro & Enterprise',
    },
    {
        icon: '🤖',
        title: 'AI Recruiter Chat',
        h2: 'Ask Your AI Assistant About Your Candidates',
        description: 'Open the AI chat on any job and ask questions like "Who is the best fit for a remote role?" or "Compare the top 3 candidates." The AI knows every candidate\'s score and summary and gives you data-driven answers.',
        bullets: ['Powered by Gemini 2.5 Flash', 'Knows every candidate in your pipeline', 'Candidate profile links in responses', 'Rate-limited to prevent abuse'],
        badge: 'Enterprise',
    },
    {
        icon: '✨',
        title: 'AI Job Description Generator',
        h2: 'Write Professional Job Descriptions in One Click',
        description: 'Type a job title, select experience level and work mode, and click AI Generate. Recruit Flow writes a complete, human-sounding job description with responsibilities, requirements, and benefits — tailored to your exact criteria.',
        bullets: ['Respects your experience requirements', 'Structured with sections and bullets', 'Sounds human, not corporate AI', 'Editable before posting'],
        badge: 'Pro & Enterprise',
    },
    {
        icon: '🏆',
        title: 'AI Candidate Shortlist',
        h2: 'Rank Your Top 5 Candidates with AI Analysis',
        description: 'For enterprise users, the AI Shortlist feature analyzes your entire candidate pool and ranks the top 5 with detailed explanations — why each candidate ranks where they do, their key strengths, and their main gap.',
        bullets: ['One-time use per job (results saved permanently)', 'Ranks top 5 with detailed reasoning', 'Highlights strengths and gaps', 'Direct link to each candidate profile'],
        badge: 'Enterprise',
    },
    {
        icon: '📅',
        title: 'Interview Calendar',
        h2: 'Schedule and Track Interviews Without Leaving the Platform',
        description: 'Create interview invites, set start and end times, choose virtual or on-site, and track status (pending, accepted, rejected). Conflict detection prevents double-booking.',
        bullets: ['Virtual and on-site interview types', 'Automatic conflict detection', 'Status tracking per interview', 'Linked to candidate applications'],
        badge: 'Enterprise',
    },
    {
        icon: '📦',
        title: 'Bulk PDF Export',
        h2: 'Download All Candidate Resumes as One PDF',
        description: 'Enterprise users can merge all candidate resumes for a job — or across all jobs — into a single downloadable PDF. Perfect for sharing with hiring committees or archiving.',
        bullets: ['Per-job or global export', 'All resumes merged in order', 'Instant download', 'Enterprise-only feature'],
        badge: 'Enterprise',
    },
];

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-white font-sans">
            <PublicNavbar />

            {/* Hero */}
            <section className="relative overflow-hidden pt-32 pb-20 bg-[#fafafa] border-b border-slate-100">
                <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, #E2E8F0 0%, transparent 70%)' }} />
                <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                <div className="relative max-w-4xl mx-auto px-6 text-center">
                    <span className="inline-block text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">Platform Features</span>
                    <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter mb-6 leading-tight">
                        Everything you need to<br />hire smarter, faster.
                    </h1>
                    <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto mb-10">
                        Recruit Flow combines AI resume screening, candidate management, and interview scheduling into one platform — so your team spends time on people, not paperwork.
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <Link href="/register" className="px-8 py-3.5 bg-slate-900 text-white rounded text-sm font-bold hover:bg-slate-800 transition-all">
                            Start Free
                        </Link>
                        <Link href="/pricing" className="px-8 py-3.5 border border-slate-200 text-slate-700 rounded text-sm font-bold hover:border-slate-900 transition-all">
                            View Pricing
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12">
                        {features.map((f, i) => (
                            <article key={i} className="group">
                                <div className="flex items-start gap-5">
                                    <div className="text-3xl shrink-0 mt-1">{f.icon}</div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-slate-100 text-slate-500 rounded-sm border border-slate-100">{f.badge}</span>
                                        </div>
                                        <h2 className="text-xl font-black text-slate-900 mb-1">{f.title}</h2>
                                        <h3 className="text-sm font-bold text-slate-500 mb-3">{f.h2}</h3>
                                        <p className="text-sm text-slate-600 leading-relaxed mb-4">{f.description}</p>
                                        <ul className="space-y-1.5">
                                            {f.bullets.map((b, j) => (
                                                <li key={j} className="flex items-center gap-2 text-sm text-slate-600">
                                                    <span className="size-1.5 bg-slate-900 rounded-full shrink-0" />
                                                    {b}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
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
                    <p className="text-slate-400 mb-8 font-medium">Join recruiters who use Recruit Flow to process candidates 10x faster.</p>
                    <Link href="/register" className="inline-block px-10 py-4 bg-white text-slate-900 rounded text-sm font-black uppercase tracking-widest hover:bg-slate-100 transition-all">
                        Get Started Free
                    </Link>
                </div>
            </section>
        </div>
    );
}
