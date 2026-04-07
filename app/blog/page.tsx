import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Recruitment Blog — AI Hiring Tips, ATS Guides and Talent Acquisition Strategies',
    description: 'Expert guides on AI recruitment, ATS scoring, resume screening automation, and modern hiring strategies. Learn how to hire faster and smarter with Recruit Flow.',
    keywords: 'AI recruitment blog, ATS optimization guide, resume screening tips, talent acquisition strategies, hiring automation, reduce time to hire',
    openGraph: { title: 'Recruitment Blog | Recruit Flow', description: 'Expert guides on AI hiring, ATS optimization, and modern recruitment strategies.', type: 'website' },
};

import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Recruitment Blog — AI Hiring Tips, ATS Guides & Talent Acquisition Strategies',
    description: 'Expert guides on AI recruitment, ATS score optimization, resume screening automation, and modern hiring strategies. Learn how to reduce time-to-hire and build a better recruitment process.',
    keywords: 'AI recruitment blog, ATS optimization guide, resume screening tips, talent acquisition strategies, hiring automation blog, reduce time to hire, recruitment software tips',
    openGraph: { title: 'Recruitment Blog | Recruit Flow', description: 'Expert guides on AI hiring, ATS optimization, and modern recruitment strategies.', type: 'website' },
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

export const posts = [
    {
        slug: 'ai-resume-screening-guide',
        title: 'The Complete Guide to AI Resume Screening in 2026',
        excerpt: 'How AI-powered ATS scoring works, why it is replacing manual screening, and how to implement it without losing the human judgment that separates good hires from great ones.',
        category: 'AI Recruitment',
        readTime: '8 min read',
        date: 'April 2, 2026',
        featured: true,
    },
    {
        slug: 'reduce-time-to-hire',
        title: 'How to Reduce Time-to-Hire from 45 Days to Under 2 Weeks',
        excerpt: 'The exact process high-performing recruitment teams use to cut hiring time in half â€” with specific steps for automating screening, compressing interview rounds, and eliminating scheduling friction.',
        category: 'Hiring Strategy',
        readTime: '6 min read',
        date: 'March 28, 2026',
        featured: false,
    },
    {
        slug: 'ats-score-optimization',
        title: 'What is an ATS Score and Why Every Recruiter Should Understand It',
        excerpt: 'A technical explanation of how ATS scores are calculated, what each scoring dimension measures, and how recruiters can use score data to make faster, more defensible hiring decisions.',
        category: 'ATS Guide',
        readTime: '5 min read',
        date: 'March 20, 2026',
        featured: false,
    },
    {
        slug: 'recruitment-automation-small-business',
        title: 'Recruitment Automation for Small Businesses: A Practical Starting Guide',
        excerpt: 'Small businesses competing for the same talent as enterprise companies need a structured hiring process. Here is where to start with automation, what tools to use, and how to build a professional candidate experience on a limited budget.',
        category: 'Small Business',
        readTime: '7 min read',
        date: 'March 15, 2026',
        featured: false,
    },
];

export default function BlogPage() {
    const [featured, ...rest] = posts;

    return (
        <div className="min-h-screen bg-white font-sans">
            <PublicNavbar />

            {/* Hero */}
            <section className="pt-32 pb-16 bg-[#fafafa] border-b border-slate-100 relative overflow-hidden">
                <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                <motion.div
                    className="relative max-w-4xl mx-auto px-6 text-center"
                    initial="hidden"
                    animate="visible"
                    variants={stagger}
                >
                    <motion.span variants={fadeInUp} className="inline-block text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">
                        Recruit Flow Blog
                    </motion.span>
                    <motion.h1 variants={fadeInUp} className="text-5xl font-black text-slate-900 tracking-tighter mb-4 leading-tight">
                        Recruitment intelligence<br />for modern hiring teams.
                    </motion.h1>
                    <motion.p variants={fadeInUp} className="text-lg text-slate-500 font-medium max-w-xl mx-auto leading-relaxed">
                        Practical guides on AI-powered screening, ATS optimization, time-to-hire reduction, and building hiring processes that scale.
                    </motion.p>
                </motion.div>
            </section>

            {/* Posts */}
            <section className="py-16 px-6">
                <div className="max-w-5xl mx-auto">
                    {/* Featured post */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeInUp}
                        className="mb-12"
                    >
                        <Link href={`/blog/${featured.slug}`} className="block group">
                            <article className="bg-slate-900 rounded-sm p-10 md:p-14 relative overflow-hidden hover:bg-slate-800 transition-all duration-300">
                                <div className="flex items-center gap-3 mb-5">
                                    <span className="inline-block text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-white/10 text-white/60 rounded-sm">
                                        Featured
                                    </span>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40">
                                        {featured.category}
                                    </span>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4 max-w-2xl group-hover:text-slate-200 transition-colors leading-tight">
                                    {featured.title}
                                </h2>
                                <p className="text-slate-400 max-w-xl mb-6 leading-relaxed text-sm">
                                    {featured.excerpt}
                                </p>
                                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    <span>{featured.date}</span>
                                    <span>Â·</span>
                                    <span>{featured.readTime}</span>
                                    <span>Â·</span>
                                    <span className="text-white/40 group-hover:text-white/60 transition-colors">Read Article</span>
                                </div>
                            </article>
                        </Link>
                    </motion.div>

                    {/* Other posts */}
                    <motion.div
                        className="grid md:grid-cols-3 gap-6"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={stagger}
                    >
                        {rest.map((post) => (
                            <motion.div key={post.slug} variants={fadeInUp}>
                                <Link href={`/blog/${post.slug}`} className="group block h-full">
                                    <article className="bg-white border border-slate-100 rounded-sm p-6 h-full hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
                                            {post.category}
                                        </span>
                                        <h2 className="text-base font-black text-slate-900 mb-3 leading-snug group-hover:text-slate-600 transition-colors flex-1">
                                            {post.title}
                                        </h2>
                                        <p className="text-sm text-slate-500 leading-relaxed mb-4">
                                            {post.excerpt}
                                        </p>
                                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 pt-4 border-t border-slate-50">
                                            <span>{post.date}</span>
                                            <span>Â·</span>
                                            <span>{post.readTime}</span>
                                        </div>
                                    </article>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Topics section */}
            <section className="py-16 px-6 bg-slate-50 border-t border-slate-100">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        className="text-center mb-10"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={stagger}
                    >
                        <motion.h2 variants={fadeInUp} className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                            Topics we cover
                        </motion.h2>
                        <motion.p variants={fadeInUp} className="text-slate-500 text-sm">
                            Practical content for recruiters, HR leaders, and founders building hiring processes that scale.
                        </motion.p>
                    </motion.div>
                    <motion.div
                        className="flex flex-wrap gap-3 justify-center"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={stagger}
                    >
                        {[
                            'AI Resume Screening',
                            'ATS Score Optimization',
                            'Time-to-Hire Reduction',
                            'Recruitment Automation',
                            'Candidate Experience',
                            'Hiring for Startups',
                            'Interview Process Design',
                            'Talent Acquisition Strategy',
                        ].map((topic, i) => (
                            <motion.span
                                key={i}
                                variants={fadeInUp}
                                className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-white border border-slate-200 text-slate-500 rounded-sm"
                            >
                                {topic}
                            </motion.span>
                        ))}
                    </motion.div>
                </div>
            </section>

            <PublicFooter />
        </div>
    );
}



