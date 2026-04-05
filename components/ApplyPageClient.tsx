/**
 * ApplyPageClient.tsx
 *
 * Renders the job application page, integrates job info and application form.
 * Security: Authenticated users only, input validation for application data.
 * APIs used: Next.js API routes for job info and application submission.
 */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowLeft, Shield, CheckCircle2, ChevronRight } from 'lucide-react';
import BouncyLoader from '@/components/BouncyLoader';
import ApplyForm from '@/components/ApplyForm';

interface JobInfo {
    title: string;
    company_name: string;
    description: string;
    logo_url?: string;
    created_at?: string;
}

export default function ApplyPageClient({ jobId }: { jobId: string }) {
    const [job, setJob] = useState<JobInfo | null>(null);
    const [isClosed, setIsClosed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [parsedJob, setParsedJob] = useState<{ text: string, workMode: string, deadline: string, jobType: string, education: string, experience: string[], links: any[] }>({ text: '', workMode: 'Remote / Global', deadline: '', jobType: 'Full-time', education: '', experience: [], links: [] });

    useEffect(() => {
        fetch(`/api/job-info/${jobId}`)
            .then(res => res.json())
            .then(data => {
                setJob(data.job);
                setIsClosed(data.isClosed);
                let text = data.job?.description || '';
                let workMode = 'Remote / Global';
                let deadline = '';
                let jobType = 'Full-time';
                let education = '';
                let experience: string[] = [];
                let links: any[] = [];
                try {
                    const parsed = JSON.parse(text);
                    if (parsed.text !== undefined) {
                        text = parsed.text;
                        workMode = parsed.workMode || workMode;
                        deadline = parsed.deadline || '';
                        jobType = parsed.jobType || 'Full-time';
                        education = parsed.education || '';
                        experience = parsed.experience || [];
                        links = parsed.links || [];
                    }
                } catch (e) {}
                setParsedJob({ text, workMode, deadline, jobType, education, experience, links });
            })
            .catch(() => setJob({ title: 'Open Position', company_name: 'Company', description: '' }))
            .finally(() => setLoading(false));
    }, [jobId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#fafafa]">
                <header className="bg-white border-b border-slate-100 h-20 flex items-center px-6">
                    <div className="w-full max-w-[1200px] mx-auto flex items-center justify-between">
                        <div className="h-8 w-32 bg-slate-100 rounded-sm relative overflow-hidden">
                            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                        </div>
                        <div className="h-7 w-28 bg-slate-100 rounded-sm" />
                    </div>
                </header>
                <div className="max-w-[1200px] mx-auto px-6 pt-16 flex flex-col md:flex-row gap-16">
                    <div className="flex-1 space-y-8">
                        <div className="space-y-4">
                            <div className="h-3 w-32 bg-slate-100 rounded-sm" />
                            <div className="h-14 w-3/4 bg-slate-100 rounded-sm relative overflow-hidden">
                                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                            </div>
                            <div className="h-6 w-48 bg-slate-100 rounded-sm" />
                        </div>
                        <div className="bg-white border border-slate-100 p-8 rounded space-y-3">
                            <div className="h-3 w-24 bg-slate-100 rounded-sm mb-6" />
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-4 bg-slate-100 rounded-sm relative overflow-hidden" style={{ width: i % 3 === 2 ? '75%' : '100%' }}>
                                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="bg-white border border-slate-100 p-6 rounded space-y-2">
                                    <div className="h-3 w-20 bg-slate-100 rounded-sm" />
                                    <div className="h-5 w-28 bg-slate-100 rounded-sm" />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="w-full md:w-[480px]">
                        <div className="bg-white border border-slate-100 p-10 rounded space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="size-10 bg-slate-100 rounded" />
                                <div className="space-y-2">
                                    <div className="h-5 w-24 bg-slate-100 rounded-sm" />
                                    <div className="h-3 w-32 bg-slate-100 rounded-sm" />
                                </div>
                            </div>
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="h-3 w-24 bg-slate-100 rounded-sm" />
                                    <div className="h-10 w-full bg-slate-100 rounded-sm relative overflow-hidden">
                                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                                    </div>
                                </div>
                            ))}
                            <div className="h-12 w-full bg-slate-100 rounded-sm" />
                        </div>
                    </div>
                </div>
                <style>{`@keyframes shimmer { 100% { transform: translateX(100%); } }`}</style>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans selection:bg-slate-900 selection:text-white pb-20">
            {/* Arctic Header */}
            <header className="bg-white border-b border-slate-100 h-20 sticky top-0 z-[60] flex items-center justify-center px-6">
                <div className="w-full max-w-[1200px] flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="flex items-center gap-2 group border-r border-slate-100 pr-6">
                            <div className="h-8 w-auto transition-transform group-hover:scale-105">
                                <img src="/recruit-flow-logo.png" alt="Recruit Flow" className="h-full w-auto object-contain" />
                            </div>
                        </Link>
                        {job?.logo_url && (
                            <div className="h-10 w-auto">
                                <img src={job.logo_url} alt={job.company_name} className="h-full w-auto object-contain" />
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-100 rounded text-slate-400 text-[10px] font-black uppercase tracking-widest">
                        <Shield className="size-3" />
                        Secure Channel
                    </div>
                </div>
            </header>

            <main className="max-w-[1200px] mx-auto px-6 pt-16 flex flex-col md:flex-row gap-16">
                {/* Left: Job Info */}
                <div className="flex-1 space-y-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black uppercase tracking-[2px] text-slate-400">Position Profile</span>
                            <div className="h-px w-8 bg-slate-200" />
                        </div>
                        <h1 className="text-5xl font-bold tracking-tight text-slate-900 leading-tight">
                            {job?.title}
                        </h1>
                        <p className="text-xl text-slate-500 font-medium">
                            at <span className="text-slate-900 font-bold underline underline-offset-8 decoration-slate-200">{job?.company_name}</span>
                        </p>
                    </div>

                    <div className="bg-white border border-slate-100 p-8 rounded shadow-sm">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">About This Role</h3>
                        <div className="text-slate-600 leading-relaxed font-medium space-y-3">
                            {(parsedJob.text || "We're looking for someone to join our team and help us build great things.").split('\n').map((line, i) => {
                                const trimmed = line.trim();
                                if (!trimmed) return null;
                                // Render **bold** headers — entire line is wrapped in **
                                const isBoldHeader = trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length > 4;
                                if (isBoldHeader) {
                                    return <p key={i} className="font-black text-slate-900 text-sm uppercase tracking-wide mt-5 first:mt-0">{trimmed.replace(/\*\*/g, '')}</p>;
                                }
                                // Render bullet points
                                if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
                                    return <p key={i} className="flex gap-2 text-sm"><span className="text-slate-400 shrink-0">•</span><span>{trimmed.replace(/^[•\-]\s*/, '')}</span></p>;
                                }
                                // Inline **bold** within text
                                const parts = trimmed.split(/\*\*(.*?)\*\*/g);
                                return (
                                    <p key={i} className="text-sm">
                                        {parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="font-bold text-slate-900">{part}</strong> : part)}
                                    </p>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white border border-slate-100 p-6 rounded shadow-sm">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Location</h4>
                            <p className="text-sm font-bold text-slate-900 leading-tight">{parsedJob.workMode || 'Global / Remote'}</p>
                        </div>
                        <div className="bg-white border border-slate-100 p-6 rounded shadow-sm">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Job Type</h4>
                            <p className="text-sm font-bold text-slate-900 leading-tight">{parsedJob.jobType || 'Full-time'}</p>
                        </div>
                        {parsedJob.education && (
                            <div className="bg-white border border-slate-100 p-6 rounded shadow-sm">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Min. Education</h4>
                                <p className="text-sm font-bold text-slate-900 leading-tight">{parsedJob.education}</p>
                            </div>
                        )}
                        {parsedJob.experience?.length > 0 && (
                            <div className="bg-white border border-slate-100 p-6 rounded shadow-sm">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Experience</h4>
                                <p className="text-sm font-bold text-slate-900 leading-tight">{parsedJob.experience.join(' / ')}</p>
                            </div>
                        )}
                        <div className="bg-white border border-slate-100 p-6 rounded shadow-sm">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Posted</h4>
                            <p className="text-sm font-bold text-slate-900 leading-tight">
                                {job?.created_at ? new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'ASAP'}
                            </p>
                        </div>
                        <div className="bg-white border border-slate-100 p-6 rounded shadow-sm">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Deadline</h4>
                            <p className="text-sm font-bold text-slate-900 leading-tight">
                                {parsedJob.deadline ? new Date(parsedJob.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Ongoing'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right: Form */}
                <div className="w-full md:w-[480px]">
                    <div className="bg-white border border-slate-100 p-1 rounded shadow-sm sticky top-32">
                        <div className="p-10">
                            {isClosed || (parsedJob.deadline && new Date(parsedJob.deadline) < new Date()) ? (
                                <div className="text-center py-10">
                                    <div className="size-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-red-50/50">
                                        <Shield className="size-6" />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900 mb-2">Application Closed</h2>
                                    <p className="text-sm font-medium text-slate-500 max-w-xs mx-auto leading-relaxed">
                                        This job is currently not accepting new applications. {isClosed ? 'The processing capacity for this account has been reached.' : 'The deadline has passed.'}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="size-10 bg-slate-900 rounded flex items-center justify-center text-white">
                                            <Sparkles className="size-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-900 leading-none">Apply Now</h2>
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1.5">AI-Powered Verification</p>
                                        </div>
                                    </div>
                                    <ApplyForm jobId={jobId} requiredLinks={parsedJob.links} />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
