import type { Metadata } from 'next';
import Link from 'next/link';
import PublicNavbar from '@/components/PublicNavbar';

export const metadata: Metadata = {
    title: 'How Recruit Flow Works — AI Recruitment Platform Setup in Minutes',
    description: 'Learn how Recruit Flow automates your hiring process in 4 simple steps: post a job, share your link, let AI screen resumes, and hire the best candidate.',
    keywords: 'how AI recruitment works, automated hiring process, resume screening steps, recruitment workflow automation',
    openGraph: {
        title: 'How Recruit Flow Works — AI Recruitment in 4 Steps',
        description: 'Post a job, share a link, let AI screen every resume, and hire faster. See exactly how Recruit Flow works.',
        type: 'website',
    },
};

const steps = [
    {
        number: '01',
        title: 'Create Your Job Posting',
        description: 'Set up a job in under 2 minutes. Add the title, work mode, experience requirements, and education level. Use the AI Description Generator to write a professional job description instantly — just type the role and click generate.',
        detail: 'Your job gets a unique public application link that you can share anywhere — LinkedIn, email, your website, or directly with candidates.',
        color: 'bg-slate-900',
    },
    {
        number: '02',
        title: 'Candidates Apply via Your Link',
        description: 'Candidates visit your branded application page, read the job description, and submit their name, email, and resume (PDF or Word). No account required on their end — just a clean, fast form.',
        detail: 'The application page shows your company logo, job details, required experience, and education level — everything a candidate needs to decide if they\'re a fit.',
        color: 'bg-slate-800',
    },
    {
        number: '03',
        title: 'AI Screens Every Resume Instantly',
        description: 'The moment a resume is submitted, Recruit Flow extracts the text, sends it to Gemini AI with your job description, and generates an ATS score (0–100) plus a written analysis. This happens in under 10 seconds.',
        detail: 'The AI checks for skill matches, experience alignment, education fit, and even company name matches. You get a score and a 4-paragraph summary for every single applicant.',
        color: 'bg-slate-700',
    },
    {
        number: '04',
        title: 'Review, Decide, and Hire',
        description: 'Open your job\'s flipbook to browse candidates sorted by ATS score. Read AI summaries, view full resumes, accept or reject with reason tags, and send emails — all without leaving the platform.',
        detail: 'Enterprise users can run the AI Shortlist to get a ranked top-5 with detailed reasoning, or chat with the AI assistant to ask questions about their candidate pool.',
        color: 'bg-slate-600',
    },
];

export default function HowItWorksPage() {
    return (
        <div className="min-h-screen bg-white font-sans">
            <PublicNavbar />

            {/* Hero */}
            <section className="pt-32 pb-20 bg-[#fafafa] border-b border-slate-100 relative overflow-hidden">
                <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                <div className="relative max-w-4xl mx-auto px-6 text-center">
                    <span className="inline-block text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">The Process</span>
                    <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter mb-6">
                        From job post to hire<br />in four steps.
                    </h1>
                    <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
                        Recruit Flow removes the manual work from hiring. Post a job, share a link, and let AI handle the screening — you just make the final call.
                    </p>
                </div>
            </section>

            {/* Steps */}
            <section className="py-24 px-6">
                <div className="max-w-4xl mx-auto space-y-24">
                    {steps.map((step, i) => (
                        <div key={i} className={`flex flex-col ${i % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} gap-12 items-center`}>
                            {/* Number block */}
                            <div className={`${step.color} rounded-2xl p-12 flex items-center justify-center shrink-0 w-full md:w-64 h-48`}>
                                <span className="text-7xl font-black text-white/20">{step.number}</span>
                            </div>
                            {/* Content */}
                            <div className="flex-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Step {step.number}</span>
                                <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">{step.title}</h2>
                                <p className="text-slate-600 leading-relaxed mb-4">{step.description}</p>
                                <p className="text-sm text-slate-500 leading-relaxed bg-slate-50 border border-slate-100 rounded-sm p-4">{step.detail}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* FAQ Schema-ready section */}
            <section className="py-20 bg-slate-50 border-t border-slate-100 px-6">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-black text-slate-900 mb-12 text-center tracking-tight">Common Questions</h2>
                    <div className="space-y-6">
                        {[
                            { q: 'How long does AI resume screening take?', a: 'Under 10 seconds per resume. The moment a candidate submits their application, Gemini AI processes the document and generates a score and written summary.' },
                            { q: 'Do candidates need to create an account?', a: 'No. Candidates just visit your public application link, fill in their name, email, and upload their resume. No signup required on their end.' },
                            { q: 'What file formats does Recruit Flow accept?', a: 'PDF, DOC, and DOCX files up to 10MB. The system extracts text from all three formats server-side.' },
                            { q: 'Can I use Recruit Flow for multiple jobs at once?', a: 'Yes. Free plan supports 1 active job, Pro supports 4, and Enterprise supports 10 simultaneous job postings.' },
                        ].map((faq, i) => (
                            <div key={i} className="bg-white border border-slate-100 rounded-sm p-6">
                                <h3 className="text-sm font-black text-slate-900 mb-2">{faq.q}</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-slate-900 px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-4xl font-black text-white mb-4 tracking-tight">See it in action.</h2>
                    <p className="text-slate-400 mb-8 font-medium">Create your first job posting in under 2 minutes. No credit card required.</p>
                    <Link href="/register" className="inline-block px-10 py-4 bg-white text-slate-900 rounded text-sm font-black uppercase tracking-widest hover:bg-slate-100 transition-all">
                        Start Free Today
                    </Link>
                </div>
            </section>
        </div>
    );
}
