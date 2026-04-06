import type { Metadata } from 'next';
import Link from 'next/link';
import PublicNavbar from '@/components/PublicNavbar';

export const metadata: Metadata = {
    title: 'Careers at Recruit Flow — Join the Team Building the Future of Hiring',
    description: 'We\'re building AI-powered recruitment tools that help companies hire smarter. Join a small, focused team working on real problems in the hiring industry.',
    keywords: 'careers at recruit flow, recruitment software jobs, AI startup jobs, hiring platform careers',
};

export default function CareersPage() {
    return (
        <div className="min-h-screen bg-white font-sans">
            <PublicNavbar />

            <section className="pt-32 pb-20 bg-[#fafafa] border-b border-slate-100 relative overflow-hidden">
                <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                <div className="relative max-w-4xl mx-auto px-6 text-center">
                    <span className="inline-block text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">Careers</span>
                    <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter mb-6">
                        Help us fix how<br />companies hire.
                    </h1>
                    <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
                        Recruit Flow is a small team building AI tools that make hiring faster, fairer, and less painful. We move fast, ship often, and care deeply about the product.
                    </p>
                </div>
            </section>

            <section className="py-24 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-8 mb-20">
                        {[
                            { title: 'Remote First', desc: 'Work from anywhere. We care about output, not office hours.' },
                            { title: 'Small Team', desc: 'Your work has direct impact. No bureaucracy, no endless meetings.' },
                            { title: 'Real Problems', desc: 'We\'re solving a problem that affects millions of people every day.' },
                        ].map((v, i) => (
                            <div key={i} className="text-center p-8 bg-slate-50 border border-slate-100 rounded-sm">
                                <h3 className="text-lg font-black text-slate-900 mb-2">{v.title}</h3>
                                <p className="text-sm text-slate-500">{v.desc}</p>
                            </div>
                        ))}
                    </div>

                    <h2 className="text-3xl font-black text-slate-900 mb-8 tracking-tight">Open Positions</h2>
                    <div className="bg-white border border-slate-100 rounded-sm p-12 text-center">
                        <div className="text-4xl mb-4">🔭</div>
                        <h3 className="text-xl font-black text-slate-900 mb-2">No open roles right now</h3>
                        <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">
                            We're not actively hiring at the moment, but we're always interested in talking to exceptional people. Send us a note.
                        </p>
                        <Link href="/contact" className="inline-block px-8 py-3 bg-slate-900 text-white rounded text-sm font-bold hover:bg-slate-800 transition-all">
                            Get in Touch
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
