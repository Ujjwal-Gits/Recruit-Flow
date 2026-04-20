
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'How Recruit Flow Works — AI Recruitment in 4 Simple Steps',
    description: 'Learn how Recruit Flow automates your hiring process: post a job in 2 minutes, share your application link, let AI screen every resume instantly, and hire the best candidate. No manual screening required.',
    keywords: 'how AI recruitment works, automated hiring process, resume screening steps, recruitment workflow, ATS setup guide, how to use recruitment software',
    alternates: { canonical: 'https://recruitflow.app/how-it-works' },
    openGraph: { title: 'How Recruit Flow Works | Recruit Flow', description: 'Post a job, share a link, let AI screen every resume, and hire faster. See the 4-step process.', type: 'website' },
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
    visible: { transition: { staggerChildren: 0.12 } },
};

const steps = [
    {
        number: '01',
        title: 'Create Your Job Posting',
        description: 'Configure a job in under 2 minutes. Set the title, work mode, required experience level, minimum education, and employment type. Pro and Enterprise users can click AI Generate to produce a complete, structured job description â€” responsibilities, requirements, and benefits â€” in under 15 seconds.',
        note: 'Each job generates a unique public application URL you can share on LinkedIn, your careers page, or directly with candidates.',
    },
    {
        number: '02',
        title: 'Candidates Apply via Your Branded Link',
        description: 'Applicants visit your branded application page, review the full job description, and submit their name, email address, and resume. No account creation required on their end. The form is mobile-optimized and accepts PDF, DOC, and DOCX files up to 10MB.',
        note: 'The application page displays your company logo, job title, work mode, experience requirements, education level, and employment type â€” giving candidates the context they need to self-qualify.',
    },
    {
        number: '03',
        title: 'AI Screens Every Resume in Under 10 Seconds',
        description: 'The moment a resume is submitted, Recruit Flow extracts the document text server-side, sends it to Gemini AI alongside your job description, and generates a calibrated ATS score plus a four-paragraph written analysis. This happens automatically for every applicant â€” no manual trigger required.',
        note: 'The AI evaluates five dimensions: skills and technology match (35 pts), experience relevance (25 pts), job title alignment (20 pts), education fit (10 pts), and quantified achievements (10 pts).',
    },
    {
        number: '04',
        title: 'Review Candidates and Make Your Hire',
        description: 'Open your job\'s flipbook to browse candidates sorted by ATS score. Read AI summaries, view full resumes in-panel, accept or reject with structured reason tags, and send emails directly from the platform. Enterprise users can run the AI Shortlist for a ranked top-5 with detailed reasoning.',
        note: 'The entire review workflow â€” from reading summaries to sending offer emails â€” happens without leaving Recruit Flow.',
    },
];

const faqs = [
    {
        q: 'How long does AI resume screening take?',
        a: 'Under 10 seconds per resume. The moment a candidate submits their application, Gemini AI processes the document and generates both a numerical score and a written four-paragraph analysis covering fit, strengths, relevant experience, and a recommendation.',
    },
    {
        q: 'Do candidates need to create an account to apply?',
        a: 'No. Candidates visit your public application link, enter their name and email, and upload their resume. There is no signup, no password, and no friction on the candidate side.',
    },
    {
        q: 'What file formats does Recruit Flow accept?',
        a: 'PDF, DOC, and DOCX files up to 10MB. Text is extracted server-side from all three formats before AI analysis begins.',
    },
    {
        q: 'Can I manage multiple open roles simultaneously?',
        a: 'Yes. The Free plan supports 1 active job posting, Pro supports 4, and Enterprise supports 10 simultaneous postings â€” each with its own application link, candidate pipeline, and AI screening.',
    },
    {
        q: 'How accurate is the ATS scoring?',
        a: 'Scores are calibrated to reflect genuine match quality. A score above 85 indicates a strong alignment across most dimensions. Scores between 50 and 70 typically indicate relevant experience with one or two gaps. The written analysis explains the reasoning behind every score, so you\'re never relying on a number alone.',
    },
    {
        q: 'Can I use Recruit Flow without writing a job description?',
        a: 'You can post a job with just a title and basic requirements. However, AI screening accuracy improves significantly with a detailed job description â€” the more specific your JD, the more precise the candidate matching.',
    },
];


const pageSchema = {"@context":"https://schema.org","@type":"HowTo","name":"How to Use Recruit Flow for AI Recruitment","description":"Set up AI-powered recruitment in 4 steps using Recruit Flow","step":[{"@type":"HowToStep","position":1,"name":"Create Your Job Posting","text":"Set up a job in under 2 minutes with title, work mode, experience requirements, and employment type."},{"@type":"HowToStep","position":2,"name":"Share Your Application Link","text":"Share the unique public application URL on LinkedIn, your careers page, or directly with candidates."},{"@type":"HowToStep","position":3,"name":"AI Screens Every Resume","text":"Gemini AI automatically scores every resume across 5 dimensions in under 10 seconds."},{"@type":"HowToStep","position":4,"name":"Review and Hire","text":"Browse candidates sorted by ATS score, read AI summaries, and make hiring decisions."}]};
export default function HowItWorksPage() {
    return (
        <div className="min-h-screen bg-white font-sans">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />
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
                        The Process
                    </motion.span>
                    <motion.h1 variants={fadeInUp} className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter mb-6 leading-tight">
                        From job post to hire<br />in four steps.
                    </motion.h1>
                    <motion.p variants={fadeInUp} className="text-lg text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
                        Recruit Flow removes the administrative work from hiring. Post a job, share a link, and let AI handle the screening â€” you focus on the conversations that lead to a hire.
                    </motion.p>
                </motion.div>
            </section>

            {/* Timeline Steps */}
            <section className="py-24 px-6">
                <div className="max-w-4xl mx-auto">
                    {steps.map((step, i) => (
                        <motion.div
                            key={i}
                            className="grid md:grid-cols-[1fr_1fr] border-b border-slate-100 last:border-0"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: '-80px' }}
                            variants={stagger}
                        >
                            <motion.div
                                variants={fadeInUp}
                                className={`py-16 px-8 ${i % 2 === 1 ? 'md:order-2' : ''}`}
                            >
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">Step {step.number}</span>
                                <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">{step.title}</h2>
                                <p className="text-slate-600 leading-relaxed mb-4">{step.description}</p>
                                <p className="text-sm text-slate-500 leading-relaxed bg-slate-50 border border-slate-100 rounded-sm p-4">{step.note}</p>
                            </motion.div>
                            <motion.div
                                variants={fadeInUp}
                                className={`bg-slate-900 flex items-center justify-center py-16 px-8 ${i % 2 === 1 ? 'md:order-1' : ''}`}
                            >
                                <span className="text-[120px] font-black text-white/10 leading-none select-none">{step.number}</span>
                            </motion.div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* What happens after */}
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
                            What the AI delivers on every resume
                        </motion.h2>
                        <motion.p variants={fadeInUp} className="text-slate-500 max-w-xl mx-auto leading-relaxed">
                            Every application produces two outputs: a calibrated score and a written analysis. Together, they give you everything you need to make a fast, informed decision.
                        </motion.p>
                    </motion.div>
                    <motion.div
                        className="grid md:grid-cols-2 gap-6"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={stagger}
                    >
                        {[
                            { title: 'ATS Score (0â€“100)', desc: 'A calibrated numerical score reflecting how closely the candidate\'s background matches your job description across five weighted dimensions.' },
                            { title: 'Candidate Fit Summary', desc: 'A paragraph explaining the overall match quality â€” what makes this candidate relevant or not for this specific role.' },
                            { title: 'Strengths Analysis', desc: 'Specific skills, experiences, and achievements from the resume that align with your requirements.' },
                            { title: 'Hire Recommendation', desc: 'A clear recommendation â€” strong hire, consider, or pass â€” with the reasoning that supports it.' },
                        ].map((item, i) => (
                            <motion.div key={i} variants={fadeInUp} className="bg-white border border-slate-100 rounded-sm p-6">
                                <h3 className="text-sm font-black text-slate-900 mb-2">{item.title}</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-20 border-t border-slate-100 px-6">
                <div className="max-w-3xl mx-auto">
                    <motion.h2
                        className="text-3xl font-black text-slate-900 mb-12 text-center tracking-tight"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                    >
                        Common Questions
                    </motion.h2>
                    <motion.div
                        className="space-y-4"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={stagger}
                    >
                        {faqs.map((faq, i) => (
                            <motion.div key={i} variants={fadeInUp} className="bg-white border border-slate-100 rounded-sm p-6">
                                <h3 className="text-sm font-black text-slate-900 mb-2">{faq.q}</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">{faq.a}</p>
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
                        Post your first job in under 2 minutes.
                    </motion.h2>
                    <motion.p variants={fadeInUp} className="text-slate-400 mb-8 font-medium">
                        No credit card required. AI screens every applicant automatically from the moment you go live.
                    </motion.p>
                    <motion.div variants={fadeInUp}>
                        <Link href="/register" className="inline-block px-10 py-4 bg-white text-slate-900 rounded text-sm font-black uppercase tracking-widest hover:bg-slate-100 transition-all">
                            Start Free Today
                        </Link>
                    </motion.div>
                </motion.div>
            </section>

            <PublicFooter />
        </div>
    );
}







