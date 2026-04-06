import type { Metadata } from 'next';
import Link from 'next/link';
import PublicNavbar from '@/components/PublicNavbar';

export const metadata: Metadata = {
    title: 'What is an ATS Score and Why Every Recruiter Should Care | Recruit Flow Blog',
    description: 'A plain-English explanation of ATS scores: how they\'re calculated, what makes a resume score high, and how recruiters can use ATS scoring to make better hiring decisions.',
    keywords: 'what is ATS score, ATS scoring explained, applicant tracking system score, resume ATS score, how ATS works, ATS optimization for recruiters',
};

export default function BlogPost3() {
    return (
        <div className="min-h-screen bg-white font-sans">
            <PublicNavbar />
            <article className="pt-32 pb-24 px-6">
                <div className="max-w-3xl mx-auto">
                    <header className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <Link href="/blog" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">← Blog</Link>
                            <span className="text-slate-200">/</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">ATS Guide</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-tight mb-6">
                            What is an ATS Score and Why Every Recruiter Should Care
                        </h1>
                        <p className="text-xl text-slate-500 leading-relaxed mb-8">
                            A plain-English explanation of how ATS scoring works, what makes a resume score high, and how recruiters can use scores to make better hiring decisions faster.
                        </p>
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400 pb-8 border-b border-slate-100">
                            <span>March 20, 2026</span><span>·</span><span>5 min read</span><span>·</span><span>Recruit Flow Team</span>
                        </div>
                    </header>

                    <div className="space-y-8 text-slate-700 leading-relaxed">
                        <p className="text-lg">If you've used any modern recruitment software, you've probably seen a number next to each candidate — 78%, 45%, 92%. That's an ATS score. But what does it actually mean, and should you trust it?</p>

                        <h2 className="text-2xl font-black text-slate-900 mt-12 mb-4">ATS Score: The Simple Definition</h2>
                        <p>An ATS (Applicant Tracking System) score is a number that represents how well a candidate's resume matches a specific job description. It's calculated by comparing the content of the resume against the requirements in the job posting.</p>
                        <p>A score of 90+ means the candidate's background closely matches what you're looking for. A score of 30 means there's a significant mismatch. The score is a starting point for evaluation — not a final verdict.</p>

                        <h2 className="text-2xl font-black text-slate-900 mt-12 mb-4">How ATS Scores Are Calculated</h2>
                        <p>Different ATS systems calculate scores differently. Older systems use simple keyword matching — if the resume contains the exact words from the job description, it scores higher. This is why you've probably seen advice telling candidates to "mirror the job description language."</p>
                        <p>Modern AI-powered ATS systems like Recruit Flow use large language models instead. This means the system understands context and synonyms. "Led a cross-functional team" scores well for a "Team Lead" role even without the exact phrase. "Proficient in React" and "5 years of React development" both register as relevant to a frontend role.</p>

                        <div className="bg-slate-50 border border-slate-100 rounded-sm p-6">
                            <h3 className="text-sm font-black text-slate-900 mb-4">What Recruit Flow's AI Scores</h3>
                            <div className="space-y-3 text-sm">
                                {[
                                    ['Job title alignment', 'Does the candidate\'s current/recent title match the role?'],
                                    ['Skill coverage', 'How many required skills appear in the resume?'],
                                    ['Experience relevance', 'Is the candidate\'s work history relevant to this role?'],
                                    ['Company context', 'Has the candidate worked at companies mentioned in the JD?'],
                                    ['Quantified achievements', 'Does the resume include measurable results?'],
                                    ['Education fit', 'Does the candidate meet the education requirements?'],
                                ].map(([factor, desc], i) => (
                                    <div key={i} className="flex gap-3">
                                        <span className="size-1.5 bg-slate-400 rounded-full shrink-0 mt-1.5" />
                                        <div><strong className="text-slate-900">{factor}:</strong> {desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <h2 className="text-2xl font-black text-slate-900 mt-12 mb-4">How to Use ATS Scores Effectively</h2>
                        <p><strong className="text-slate-900">Use scores as a filter, not a decision.</strong> Sort your candidates by score and start reviewing from the top. But don't automatically reject everyone below a certain threshold — read the AI summary for candidates in the 40–70 range, because non-traditional backgrounds often score lower despite being strong fits.</p>
                        <p><strong className="text-slate-900">Pay attention to the written analysis.</strong> A score of 75 with a summary that says "strong technical skills but limited management experience" tells you something a number alone can't. The written analysis is where the real insight lives.</p>
                        <p><strong className="text-slate-900">Calibrate based on your role.</strong> For highly technical roles with specific skill requirements, a score below 60 is usually a genuine mismatch. For roles where attitude and potential matter more than specific experience, be more flexible with the score.</p>

                        <h2 className="text-2xl font-black text-slate-900 mt-12 mb-4">What ATS Scores Can't Tell You</h2>
                        <p>ATS scores are good at measuring resume-to-JD match. They're not good at measuring:</p>
                        <ul className="space-y-2">
                            {['Culture fit and team dynamics', 'Communication skills and personality', 'Growth potential and learning ability', 'Motivation and genuine interest in the role', 'How well someone performs under pressure'].map((item, i) => (
                                <li key={i} className="flex gap-2 text-sm"><span className="size-1.5 bg-slate-300 rounded-full shrink-0 mt-1.5" />{item}</li>
                            ))}
                        </ul>
                        <p>These things require a conversation. ATS scoring gets you to the right conversations faster — it doesn't replace them.</p>

                        <div className="mt-12 p-8 bg-slate-900 rounded-sm text-center">
                            <h3 className="text-xl font-black text-white mb-2">See ATS scoring in action</h3>
                            <p className="text-slate-400 text-sm mb-6">Post a job on Recruit Flow and watch every resume get scored automatically.</p>
                            <Link href="/register" className="inline-block px-8 py-3 bg-white text-slate-900 rounded text-sm font-black uppercase tracking-widest hover:bg-slate-100 transition-all">Try It Free</Link>
                        </div>
                    </div>
                </div>
            </article>
        </div>
    );
}
