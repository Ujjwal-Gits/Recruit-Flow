import type { Metadata } from 'next';
import Link from 'next/link';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';

export const metadata: Metadata = {
    title: 'Recruitment Blog — AI Hiring Tips, ATS Guides & Talent Acquisition Strategies | Recruit Flow',
    description: 'Expert guides on AI recruitment, ATS optimization, resume screening, and modern hiring strategies. Learn how to hire faster and smarter with Recruit Flow.',
    keywords: 'AI recruitment blog, ATS optimization guide, resume screening tips, talent acquisition strategies, hiring automation, recruitment software tips, reduce time to hire',
    openGraph: {
        title: 'Recruitment Blog — Recruit Flow',
        description: 'Expert guides on AI hiring, ATS optimization, and modern recruitment strategies.',
        type: 'website',
    },
};

export const posts = [
    {
        slug: 'ai-resume-screening-guide',
        title: 'The Complete Guide to AI Resume Screening in 2026',
        excerpt: 'How AI-powered ATS scoring works, why it\'s replacing manual screening, and how to implement it without losing the human touch in your hiring process.',
        category: 'AI Recruitment',
        readTime: '8 min read',
        date: 'April 2, 2026',
        featured: true,
    },
    {
        slug: 'reduce-time-to-hire',
        title: 'How to Reduce Time-to-Hire from 45 Days to Under 2 Weeks',
        excerpt: 'The exact process top-performing recruitment teams use to cut hiring time in half — without sacrificing candidate quality or team culture fit.',
        category: 'Hiring Strategy',
        readTime: '6 min read',
        date: 'March 28, 2026',
        featured: false,
    },
    {
        slug: 'ats-score-optimization',
        title: 'What is an ATS Score and Why Every Recruiter Should Care',
        excerpt: 'A plain-English explanation of how ATS scoring works, what makes a resume score high, and how recruiters can use scores to make better hiring decisions faster.',
        category: 'ATS Guide',
        readTime: '5 min read',
        date: 'March 20, 2026',
        featured: false,
    },
    {
        slug: 'recruitment-automation-small-business',
        title: 'Recruitment Automation for Small Businesses: Where to Start',
        excerpt: 'You don\'t need a 10-person HR team to automate hiring. Here\'s how small businesses and startups can use AI recruitment tools to compete with larger companies.',
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

            <section className="pt-32 pb-16 bg-[#fafafa] border-b border-slate-100 relative overflow-hidden">
                <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                <div className="relative max-w-4xl mx-auto px-6 text-center">
                    <span className="inline-block text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">Recruit Flow Blog</span>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4 leading-tight">
                        Hire smarter.<br />Learn faster.
                    </h1>
                    <p className="text-lg text-slate-500 font-medium max-w-xl mx-auto leading-relaxed">
                        Practical guides on AI recruitment, ATS optimization, and modern hiring strategies.
                    </p>
                </div>
            </section>

            <section className="py-16 px-6">
                <div className="max-w-5xl mx-auto">
                    {/* Featured post */}
                    <Link href={`/blog/${featured.slug}`} className="block mb-12 group">
                        <article className="bg-slate-900 rounded-sm p-10 md:p-14 relative overflow-hidden hover:bg-slate-800 transition-all">
                            <span className="inline-block text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-white/10 text-white/60 rounded-sm mb-4">Featured · {featured.category}</span>
                            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4 max-w-2xl group-hover:text-slate-200 transition-colors leading-tight">{featured.title}</h2>
                            <p className="text-slate-400 max-w-xl mb-6 leading-relaxed">{featured.excerpt}</p>
                            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                <span>{featured.date}</span>
                                <span>·</span>
                                <span>{featured.readTime}</span>
                            </div>
                        </article>
                    </Link>

                    {/* Other posts */}
                    <div className="grid md:grid-cols-3 gap-6">
                        {rest.map((post) => (
                            <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
                                <article className="bg-white border border-slate-100 rounded-sm p-6 h-full hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 block">{post.category}</span>
                                    <h2 className="text-base font-black text-slate-900 mb-3 leading-snug group-hover:text-slate-600 transition-colors">{post.title}</h2>
                                    <p className="text-sm text-slate-500 leading-relaxed mb-4">{post.excerpt}</p>
                                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 pt-4 border-t border-slate-50">
                                        <span>{post.date}</span>
                                        <span>·</span>
                                        <span>{post.readTime}</span>
                                    </div>
                                </article>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <PublicFooter />
        </div>
    );
}
