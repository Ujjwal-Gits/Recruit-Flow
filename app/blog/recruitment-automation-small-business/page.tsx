import type { Metadata } from 'next';
import Link from 'next/link';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';

export const metadata: Metadata = {
    title: 'Recruitment Automation for Small Businesses: Where to Start | Recruit Flow Blog',
    description: 'Small businesses don\'t need a big HR team to automate hiring. Learn which recruitment tasks to automate first, what tools to use, and how to compete with larger companies for top talent.',
    keywords: 'recruitment automation small business, HR automation for startups, small business hiring tools, affordable ATS for small business, recruitment software SMB',
};

export default function BlogPost4() {
    return (
        <div className="min-h-screen bg-white font-sans">
            <PublicNavbar />
            <article className="pt-32 pb-24 px-6">
                <div className="max-w-3xl mx-auto">
                    <header className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <Link href="/blog" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">← Blog</Link>
                            <span className="text-slate-200">/</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Small Business</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-tight mb-6">
                            Recruitment Automation for Small Businesses: Where to Start
                        </h1>
                        <p className="text-xl text-slate-500 leading-relaxed mb-8">
                            You don't need a 10-person HR team to automate hiring. Here's how small businesses and startups can use AI recruitment tools to compete with larger companies for top talent.
                        </p>
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400 pb-8 border-b border-slate-100">
                            <span>March 15, 2026</span><span>·</span><span>7 min read</span><span>·</span><span>Recruit Flow Team</span>
                        </div>
                    </header>

                    <div className="space-y-8 text-slate-700 leading-relaxed">
                        <p className="text-lg">Small businesses have a hiring problem that large companies don't: you're competing for the same talent with a fraction of the resources. A startup founder hiring their 5th employee is competing against companies with dedicated HR teams, employer branding budgets, and sophisticated ATS systems.</p>
                        <p>The good news: AI has leveled the playing field. The same tools that enterprise companies use for recruitment automation are now accessible to any business, often for free or at very low cost.</p>

                        <h2 className="text-2xl font-black text-slate-900 mt-12 mb-4">The 3 Biggest Hiring Pain Points for Small Businesses</h2>
                        <p><strong className="text-slate-900">1. No time to screen resumes.</strong> When you're running a small business, hiring is one of 50 things on your plate. Spending 3 hours reading resumes for a single role is genuinely painful.</p>
                        <p><strong className="text-slate-900">2. No professional application process.</strong> Asking candidates to email their CV to a Gmail address doesn't inspire confidence. Candidates judge your company by your hiring process.</p>
                        <p><strong className="text-slate-900">3. Slow decision-making.</strong> Small businesses often move slowly on hiring decisions because there's no defined process. Top candidates accept other offers while you're still deliberating.</p>

                        <h2 className="text-2xl font-black text-slate-900 mt-12 mb-4">Start Here: Automate Resume Screening First</h2>
                        <p>If you only automate one thing in your hiring process, make it resume screening. This is where the most time is lost, and it's the easiest thing to automate.</p>
                        <p>With a tool like Recruit Flow, you post a job, share a link, and every applicant gets automatically scored by AI. You don't read a single resume until you've already identified the top candidates. For a small business hiring 2–3 people per year, this alone saves dozens of hours.</p>

                        <div className="bg-slate-50 border border-slate-100 rounded-sm p-6">
                            <h3 className="text-sm font-black text-slate-900 mb-4">What Recruit Flow's Free Plan Includes</h3>
                            <ul className="space-y-2 text-sm">
                                {[
                                    '1 active job posting',
                                    'Up to 5 CV processing slots',
                                    'AI ATS scoring on every resume',
                                    'Public application link',
                                    'Accept/reject with reason tagging',
                                    'Basic candidate preview',
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-2"><span className="size-1.5 bg-emerald-500 rounded-full shrink-0 mt-1.5" />{item}</li>
                                ))}
                            </ul>
                        </div>

                        <h2 className="text-2xl font-black text-slate-900 mt-12 mb-4">Build a Professional Application Experience</h2>
                        <p>Your application process is a candidate's first impression of your company. A clean, professional application page — with your logo, job details, and a simple form — signals that you're a serious employer.</p>
                        <p>Recruit Flow generates a branded application page for every job you post. Candidates see your company logo, the job description, required experience and education, and a clean form. No email addresses, no Google Forms, no friction.</p>

                        <h2 className="text-2xl font-black text-slate-900 mt-12 mb-4">Define Your Process Before You Post</h2>
                        <p>The biggest time-waster in small business hiring isn't screening — it's indecision. Before you post a job, answer these questions:</p>
                        <ul className="space-y-2">
                            {[
                                'What does success look like in this role after 90 days?',
                                'What are the 3 non-negotiable requirements?',
                                'Who makes the final hiring decision?',
                                'What\'s the salary range you\'re willing to offer?',
                                'How many interview rounds will you do?',
                            ].map((q, i) => (
                                <li key={i} className="flex gap-2 text-sm"><span className="size-1.5 bg-slate-400 rounded-full shrink-0 mt-1.5" />{q}</li>
                            ))}
                        </ul>
                        <p>Having these answers before you start means you can move fast when you find the right person — and fast movement is one of the few advantages small businesses have over large companies.</p>

                        <h2 className="text-2xl font-black text-slate-900 mt-12 mb-4">The Small Business Hiring Stack</h2>
                        <div className="space-y-4">
                            {[
                                { tool: 'Recruit Flow', use: 'Job posting, AI resume screening, candidate management', cost: 'Free to start' },
                                { tool: 'LinkedIn / Indeed', use: 'Job distribution and candidate sourcing', cost: 'Free basic posting' },
                                { tool: 'Google Meet / Zoom', use: 'Video interviews', cost: 'Free' },
                                { tool: 'Notion / Google Docs', use: 'Interview notes and decision tracking', cost: 'Free' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-4 p-4 bg-white border border-slate-100 rounded-sm text-sm">
                                    <div className="flex-1">
                                        <strong className="text-slate-900">{item.tool}</strong>
                                        <p className="text-slate-500 mt-0.5">{item.use}</p>
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 shrink-0">{item.cost}</span>
                                </div>
                            ))}
                        </div>

                        <p>This entire stack costs nothing to start. You can run a professional, AI-powered hiring process for your first 5 hires completely free.</p>

                        <div className="mt-12 p-8 bg-slate-900 rounded-sm text-center">
                            <h3 className="text-xl font-black text-white mb-2">Start hiring like a pro</h3>
                            <p className="text-slate-400 text-sm mb-6">Recruit Flow gives small businesses enterprise-grade recruitment tools, starting free.</p>
                            <Link href="/register" className="inline-block px-8 py-3 bg-white text-slate-900 rounded text-sm font-black uppercase tracking-widest hover:bg-slate-100 transition-all">Get Started Free</Link>
                        </div>
                    </div>
                </div>
            </article>
            <PublicFooter />
        </div>
    );
}
