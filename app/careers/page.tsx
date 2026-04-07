import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Careers at Recruit Flow — Join the Team Building the Future of Hiring',
    description: 'Join Recruit Flow and help build AI-powered recruitment tools that make hiring faster and fairer. Remote-first, small team, high ownership, real impact.',
    keywords: 'careers recruit flow, recruitment software jobs, AI startup careers, remote hiring platform jobs',
    openGraph: { title: 'Careers | Recruit Flow', description: 'Help us fix how companies hire. Remote-first, small team, real problems.', type: 'website' },
};

import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Careers at Recruit Flow — Join the Team Building the Future of Hiring',
    description: 'Join Recruit Flow and help build AI-powered recruitment tools that make hiring faster and more structured. Remote-first, small team, high ownership, real impact.',
    keywords: 'careers at recruit flow, recruitment software jobs, AI startup careers, remote hiring platform jobs, tech startup jobs',
    openGraph: { title: 'Careers | Recruit Flow', description: 'Help us fix how companies hire. Remote-first, small team, high ownership.', type: 'website' },
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

const values = [
    {
        title: 'Remote by Default',
        desc: 'We are a distributed team. Every role is remote-first, and we optimize for async communication over synchronous meetings. Output matters â€” not office hours.',
    },
    {
        title: 'Small Team, High Ownership',
        desc: 'We are a small team where every person owns a meaningful surface area of the product. There is no bureaucracy between an idea and shipping it.',
    },
    {
        title: 'Solving a Real Problem',
        desc: 'Hiring is broken for most companies. We are building tools that make it faster, more structured, and less dependent on gut instinct. The problem is large and the market is underserved.',
    },
    {
        title: 'Ship Fast, Iterate Faster',
        desc: 'We deploy multiple times per week. We prefer a working feature over a perfect spec. We learn from real usage, not from internal debates about hypothetical edge cases.',
    },
    {
        title: 'Transparent by Default',
        desc: 'Roadmap, priorities, and company direction are shared openly with the team. We do not operate with information silos or hidden agendas.',
    },
    {
        title: 'Compensation That Reflects Contribution',
        desc: 'We pay competitively for the value people create. Compensation is reviewed regularly and tied to impact â€” not tenure or title inflation.',
    },
];

export default function CareersPage() {
    return (
        <div className="min-h-screen bg-white font-sans">
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
                        Careers
                    </motion.span>
                    <motion.h1 variants={fadeInUp} className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter mb-6 leading-tight">
                        Help us rebuild<br />how companies hire.
                    </motion.h1>
                    <motion.p variants={fadeInUp} className="text-lg text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
                        Recruit Flow is a focused team building AI-powered recruitment infrastructure. We ship fast, operate with high ownership, and work on a problem that affects every company that hires.
                    </motion.p>
                </motion.div>
            </section>

            {/* Values */}
            <section className="py-24 px-6">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        className="text-center mb-14"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={stagger}
                    >
                        <motion.h2 variants={fadeInUp} className="text-3xl font-black text-slate-900 tracking-tighter mb-4">
                            How we work
                        </motion.h2>
                        <motion.p variants={fadeInUp} className="text-slate-500 max-w-xl mx-auto leading-relaxed">
                            These are not aspirational values written for a careers page. They describe how we actually operate day to day.
                        </motion.p>
                    </motion.div>
                    <motion.div
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={stagger}
                    >
                        {values.map((v, i) => (
                            <motion.div key={i} variants={fadeInUp} className="p-8 bg-slate-50 border border-slate-100 rounded-sm">
                                <h3 className="text-base font-black text-slate-900 mb-2">{v.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">{v.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Open Positions */}
            <section className="py-20 px-6 bg-slate-50 border-t border-slate-100">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={stagger}
                    >
                        <motion.h2 variants={fadeInUp} className="text-3xl font-black text-slate-900 mb-8 tracking-tight">
                            Open Positions
                        </motion.h2>
                        <motion.div variants={fadeInUp} className="bg-white border border-slate-100 rounded-sm p-12 text-center">
                            <h3 className="text-xl font-black text-slate-900 mb-3">No open roles at this time</h3>
                            <p className="text-slate-500 text-sm max-w-md mx-auto mb-6 leading-relaxed">
                                We are not actively hiring right now, but we are always interested in speaking with engineers, designers, and growth specialists who care deeply about developer tooling and AI products. Send us a note with what you would build.
                            </p>
                            <Link href="/contact" className="inline-block px-8 py-3 bg-slate-900 text-white rounded text-sm font-bold hover:bg-slate-800 transition-all">
                                Get in Touch
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* What we look for */}
            <section className="py-20 px-6 border-t border-slate-100">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        className="grid md:grid-cols-2 gap-12 items-start"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={stagger}
                    >
                        <motion.div variants={fadeInUp}>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-6">
                                What we look for
                            </h2>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                We hire people who take ownership of outcomes, not just tasks. The best candidates we have worked with share a few traits: they ship before they feel ready, they ask why before they ask how, and they improve the systems around them â€” not just the code they write.
                            </p>
                            <p className="text-slate-600 leading-relaxed">
                                We do not require specific degrees or years of experience. We care about what you have built, what you have learned from shipping it, and how you think about the problems in front of you.
                            </p>
                        </motion.div>
                        <motion.div variants={fadeInUp} className="space-y-4">
                            {[
                                'Strong written communication â€” we are async-first',
                                'Comfort with ambiguity and incomplete information',
                                'Track record of shipping, not just planning',
                                'Genuine curiosity about AI and its applications in enterprise software',
                                'Ability to own a problem end-to-end without hand-holding',
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-3 text-sm text-slate-600">
                                    <span className="size-1.5 bg-slate-900 rounded-full shrink-0 mt-1.5" />
                                    {item}
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            <PublicFooter />
        </div>
    );
}




