import type { Metadata } from 'next';
import Link from 'next/link';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';

export const metadata: Metadata = {
    title: 'Recruitment Use Cases — Recruit Flow for Startups, Agencies & Enterprise Teams',
    description: 'See how Recruit Flow helps startups, recruitment agencies, HR teams, and enterprise companies automate resume screening and hire faster with AI.',
    keywords: 'recruitment software for startups, HR automation tools, recruitment agency software, enterprise hiring platform, AI hiring for small business, talent acquisition automation',
};

const useCases = [
    {
        title: 'Startups & Scale-ups',
        subtitle: 'Hire fast without a dedicated HR team',
        description: 'When you\'re growing fast, you don\'t have time to read 200 resumes for a single role. Recruit Flow\'s AI screens every applicant instantly, so your founding team can focus on building — not sorting CVs.',
        points: ['Post jobs in 2 minutes with AI-generated descriptions', 'Get ATS scores on every resume automatically', 'Accept or reject candidates with one click', 'Free plan supports 1 active job — perfect for early-stage hiring'],
    },
    {
        title: 'Recruitment Agencies',
        subtitle: 'Manage multiple clients and roles at once',
        description: 'Agencies running multiple active roles need a system that scales. Recruit Flow\'s Enterprise plan gives you 10 simultaneous job postings, a global candidate CRM, and bulk PDF export for client presentations.',
        points: ['10 active job postings simultaneously', 'Candidate CRM across all roles', 'Bulk PDF export for client reports', 'AI shortlist for top-5 recommendations per role'],
    },
    {
        title: 'In-House HR Teams',
        subtitle: 'Reduce time-to-hire across departments',
        description: 'HR teams at mid-size companies deal with high application volumes and multiple hiring managers. Recruit Flow centralizes everything — applications, AI scores, candidate communication, and interview scheduling.',
        points: ['Centralized candidate pipeline per job', 'Email candidates directly from the platform', 'Interview calendar with conflict detection', 'Role-based access for hiring managers'],
    },
    {
        title: 'Universities & Institutions',
        subtitle: 'Streamline campus recruitment and internship hiring',
        description: 'Educational institutions hiring for internships, research roles, or administrative positions can use Recruit Flow to process high volumes of student applications with AI scoring and structured review.',
        points: ['Handle high application volumes efficiently', 'AI scoring for entry-level and internship roles', 'Public application links for campus sharing', 'Structured accept/reject with reason documentation'],
    },
    {
        title: 'Freelance Recruiters',
        subtitle: 'Professional tools without enterprise pricing',
        description: 'Independent recruiters working with multiple clients need professional tools that don\'t cost a fortune. Recruit Flow\'s Pro plan gives you everything you need for 4 active roles at a fraction of traditional ATS pricing.',
        points: ['4 active job postings on Pro plan', 'AI-powered candidate analysis', 'Professional flipbook for client presentations', 'Email workflows for candidate communication'],
    },
    {
        title: 'Remote-First Companies',
        subtitle: 'Hire globally without geographic limits',
        description: 'Remote companies receive applications from around the world. Recruit Flow\'s AI handles any resume regardless of format or origin, and the platform works entirely in the browser — no downloads, no installs.',
        points: ['Works with resumes from any country', 'No geographic restrictions on applicants', 'Browser-based — works on any device', 'Virtual interview scheduling built-in'],
    },
];

export default function UseCasesPage() {
    return (
        <div className="min-h-screen bg-white font-sans">
            <PublicNavbar />

            <section className="pt-32 pb-20 bg-[#fafafa] border-b border-slate-100 relative overflow-hidden">
                <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                <div className="relative max-w-4xl mx-auto px-6 text-center">
                    <span className="inline-block text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">Use Cases</span>
                    <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter mb-6 leading-tight">
                        Built for every team<br />that hires.
                    </h1>
                    <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
                        Whether you're a solo founder, a recruitment agency, or an enterprise HR team — Recruit Flow adapts to how you hire.
                    </p>
                </div>
            </section>

            <section className="py-24 px-6">
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {useCases.map((uc, i) => (
                        <article key={i} className="bg-white border border-slate-100 rounded-sm p-8 hover:shadow-lg transition-all hover:-translate-y-0.5 duration-300">
                            <h2 className="text-xl font-black text-slate-900 mb-1">{uc.title}</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{uc.subtitle}</p>
                            <p className="text-sm text-slate-600 leading-relaxed mb-5">{uc.description}</p>
                            <ul className="space-y-2">
                                {uc.points.map((p, j) => (
                                    <li key={j} className="flex items-start gap-2 text-sm text-slate-600">
                                        <span className="size-1.5 bg-slate-900 rounded-full shrink-0 mt-1.5" />
                                        {p}
                                    </li>
                                ))}
                            </ul>
                        </article>
                    ))}
                </div>
            </section>

            <section className="py-20 bg-slate-900 px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Which plan fits your team?</h2>
                    <p className="text-slate-400 mb-8 font-medium">From solo recruiters to enterprise teams — there's a Recruit Flow plan for every hiring volume.</p>
                    <Link href="/pricing" className="inline-block px-10 py-4 bg-white text-slate-900 rounded text-sm font-black uppercase tracking-widest hover:bg-slate-100 transition-all">
                        See Pricing
                    </Link>
                </div>
            </section>

            <PublicFooter />
        </div>
    );
}
