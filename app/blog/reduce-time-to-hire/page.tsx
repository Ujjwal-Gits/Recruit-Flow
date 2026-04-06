import type { Metadata } from 'next';
import Link from 'next/link';
import PublicNavbar from '@/components/PublicNavbar';

export const metadata: Metadata = {
    title: 'How to Reduce Time-to-Hire from 45 Days to Under 2 Weeks | Recruit Flow Blog',
    description: 'The exact process top recruitment teams use to cut time-to-hire in half. Practical steps to speed up candidate screening, interviews, and decision-making.',
    keywords: 'reduce time to hire, faster hiring process, time to hire optimization, recruitment speed, hiring efficiency, talent acquisition speed',
    openGraph: {
        title: 'How to Reduce Time-to-Hire from 45 Days to Under 2 Weeks',
        description: 'The exact process top-performing recruitment teams use to cut hiring time in half without sacrificing quality.',
        type: 'article',
    },
};

export default function BlogPost2() {
    return (
        <div className="min-h-screen bg-white font-sans">
            <PublicNavbar />
            <article className="pt-32 pb-24 px-6">
                <div className="max-w-3xl mx-auto">
                    <header className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <Link href="/blog" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">← Blog</Link>
                            <span className="text-slate-200">/</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hiring Strategy</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-tight mb-6">
                            How to Reduce Time-to-Hire from 45 Days to Under 2 Weeks
                        </h1>
                        <p className="text-xl text-slate-500 leading-relaxed mb-8">
                            The exact process top-performing recruitment teams use to cut hiring time in half — without sacrificing candidate quality or culture fit.
                        </p>
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400 pb-8 border-b border-slate-100">
                            <span>March 28, 2026</span><span>·</span><span>6 min read</span><span>·</span><span>Recruit Flow Team</span>
                        </div>
                    </header>

                    <div className="space-y-8 text-slate-700 leading-relaxed">
                        <p className="text-lg">
                            The average time-to-hire across industries is <strong className="text-slate-900">44 days</strong>. For tech roles, it's often longer. Every day a role stays open costs money — in lost productivity, in team strain, and in the risk of losing your top candidate to a faster-moving competitor.
                        </p>

                        <p>Here's the thing: most of that time isn't spent evaluating candidates. It's spent on administrative tasks that can be automated or eliminated entirely.</p>

                        <h2 className="text-2xl font-black text-slate-900 mt-12 mb-4">Where the Time Actually Goes</h2>
                        <p>Before you can fix time-to-hire, you need to understand where it's being lost. In most hiring processes, the breakdown looks like this:</p>
                        <div className="bg-slate-50 border border-slate-100 rounded-sm p-6 space-y-3">
                            {[
                                ['Resume screening', '7–14 days', 'Reading every CV manually'],
                                ['Scheduling interviews', '3–7 days', 'Back-and-forth email coordination'],
                                ['Interview rounds', '7–14 days', 'Multiple rounds with multiple stakeholders'],
                                ['Decision & offer', '3–7 days', 'Internal alignment and approval'],
                                ['Candidate response', '2–5 days', 'Waiting for acceptance'],
                            ].map(([stage, time, note], i) => (
                                <div key={i} className="flex items-start justify-between gap-4 text-sm">
                                    <div>
                                        <span className="font-bold text-slate-900">{stage}</span>
                                        <span className="text-slate-400 ml-2 text-xs">{note}</span>
                                    </div>
                                    <span className="font-black text-slate-500 shrink-0">{time}</span>
                                </div>
                            ))}
                        </div>

                        <h2 className="text-2xl font-black text-slate-900 mt-12 mb-4">Step 1: Automate Resume Screening (Save 7–14 Days)</h2>
                        <p>This is the single biggest lever. If you're manually reading every resume, you're spending a week or more just to create a shortlist. AI screening tools like Recruit Flow do this in seconds — every resume gets an ATS score and written summary the moment it's submitted.</p>
                        <p>Instead of spending a week reading 200 resumes, you spend 30 minutes reviewing the AI summaries of the top 20 candidates. That's a 95% time reduction on the most time-consuming part of hiring.</p>

                        <h2 className="text-2xl font-black text-slate-900 mt-12 mb-4">Step 2: Reduce Interview Rounds (Save 7–10 Days)</h2>
                        <p>Most companies do too many interview rounds. Three rounds is the maximum for most roles — anything beyond that is usually about internal politics, not candidate evaluation.</p>
                        <p>The fix: define what you need to know from each round before you start. Round 1 is a 30-minute culture and motivation screen. Round 2 is a technical or skills assessment. Round 3 (if needed) is a final conversation with the hiring manager. That's it.</p>

                        <h2 className="text-2xl font-black text-slate-900 mt-12 mb-4">Step 3: Eliminate Scheduling Friction (Save 3–5 Days)</h2>
                        <p>Scheduling interviews via email is a productivity killer. Every back-and-forth adds a day. Use a scheduling tool that lets candidates book directly into your calendar, or use Recruit Flow's built-in interview calendar to manage scheduling without leaving the platform.</p>

                        <h2 className="text-2xl font-black text-slate-900 mt-12 mb-4">Step 4: Make Faster Decisions (Save 3–5 Days)</h2>
                        <p>The most common reason hiring decisions take too long is that the decision-making process isn't defined upfront. Before you post a job, agree on: who makes the final call, what criteria matter most, and what the offer range is. When you have a strong candidate, you should be able to move from final interview to offer in 24 hours.</p>

                        <h2 className="text-2xl font-black text-slate-900 mt-12 mb-4">The Result: Under 2 Weeks</h2>
                        <div className="bg-slate-50 border border-slate-100 rounded-sm p-6 space-y-3">
                            {[
                                ['Day 1', 'Post job, AI screens all applicants automatically'],
                                ['Day 2–3', 'Review AI summaries, shortlist top 10'],
                                ['Day 4–5', 'Round 1 interviews (30 min each, back-to-back)'],
                                ['Day 6–7', 'Round 2 for top 3 candidates'],
                                ['Day 8', 'Decision and offer sent'],
                                ['Day 9–10', 'Candidate accepts, paperwork begins'],
                            ].map(([day, action], i) => (
                                <div key={i} className="flex gap-4 text-sm">
                                    <span className="font-black text-slate-400 shrink-0 w-16">{day}</span>
                                    <span className="text-slate-700">{action}</span>
                                </div>
                            ))}
                        </div>

                        <p>This isn't theoretical. It's the process that fast-moving companies actually use. The key is removing the administrative friction — and AI screening is the biggest single lever you have.</p>

                        <div className="mt-12 p-8 bg-slate-900 rounded-sm text-center">
                            <h3 className="text-xl font-black text-white mb-2">Start hiring faster today</h3>
                            <p className="text-slate-400 text-sm mb-6">Recruit Flow automates resume screening so you can focus on the conversations that matter.</p>
                            <Link href="/register" className="inline-block px-8 py-3 bg-white text-slate-900 rounded text-sm font-black uppercase tracking-widest hover:bg-slate-100 transition-all">Get Started Free</Link>
                        </div>
                    </div>
                </div>
            </article>
        </div>
    );
}
