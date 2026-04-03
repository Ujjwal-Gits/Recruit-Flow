import React, { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
    Users, X, BookOpen, MoreHorizontal, Mail, Lock, Search, ShieldCheck, CheckCircle2, Loader2, Calendar, ChevronLeft, ChevronRight, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BouncyLoader from '@/components/BouncyLoader';
import PDFDossierViewer from '@/components/PDFDossierViewer';

import { CRMCandidate } from '@/types/dashboard';

const CRMCandidateRow = memo(({ c, user, setPreviewUrl, setMailTarget, statusColor }: { 
    c: CRMCandidate, 
    user: any, 
    setPreviewUrl: (url: string) => void, 
    setMailTarget: (target: CRMCandidate) => void,
    statusColor: (s: string) => string 
}) => {
    return (
        <tr className="hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-4">
                <p className="text-sm font-bold text-slate-900">{c.name}</p>
            </td>
            <td className="px-6 py-4 text-xs text-slate-500 font-medium">{c.email}</td>
            <td className="px-6 py-4">
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-100">{c.job_title}</span>
            </td>
            <td className="px-6 py-4 text-sm font-black text-slate-900">{c.ats_score}%</td>
            <td className="px-6 py-4">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded border ${statusColor(c.status)}`}>{c.status}</span>
            </td>
            <td className="px-6 py-4 text-xs text-slate-400 font-medium">{new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
            <td className="px-6 py-4">
                {c.resume_url ? (
                    <button
                        onClick={() => setPreviewUrl(c.resume_url)}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all group"
                    >
                        <BookOpen className="size-3.5 group-hover:scale-110 transition-transform text-emerald-500" />
                        View CV
                    </button>
                ) : (
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-200">No CV</span>
                )}
            </td>
            <td className="px-6 py-4">
                <button
                    onClick={() => (user?.tier === 'enterprise' || user?.tier === 'pro') ? setMailTarget(c) : null}
                    className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all group ${!(user?.tier === 'enterprise' || user?.tier === 'pro') ? 'text-slate-200 cursor-not-allowed' : 'text-slate-400 hover:text-slate-900'}`}
                >
                    <Mail className={`size-3.5 group-hover:scale-110 transition-transform ${!(user?.tier === 'enterprise' || user?.tier === 'pro') ? 'text-slate-100' : 'text-slate-400 group-hover:text-slate-900'}`} />
                    Email
                    {!(user?.tier === 'enterprise' || user?.tier === 'pro') && <Lock className="size-2.5 opacity-50" />}
                </button>
            </td>
        </tr>
    );
});
CRMCandidateRow.displayName = 'CRMCandidateRow';

export default function CRMSection({ user, mailSettings }: { user: any, mailSettings: any }) {
    const [candidates, setCandidates] = useState<CRMCandidate[]>([]);
    const [loadingCandidates, setLoadingCandidates] = useState(true);
    const [crmFilter, setCrmFilter] = useState<'all' | 'accepted' | 'rejected' | 'pending'>('all');
    const [crmSearch, setCrmSearch] = useState('');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [mailTarget, setMailTarget] = useState<CRMCandidate | null>(null);
    const [sendingMail, setSendingMail] = useState(false);
    const [mailSent, setMailSent] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<'custom' | 'rejection' | 'virtual' | 'onsite'>('custom');
    const [mailSubject, setMailSubject] = useState('');
    const [mailBody, setMailBody] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mailTarget) {
            setSelectedTemplate('custom');
            setMailSubject('');
            setMailBody('');
        }
    }, [mailTarget]);

    useEffect(() => {
        if (!mailTarget) return;
        if (selectedTemplate === 'virtual') {
            setMailSubject(mailSettings.virtualSubject);
            setMailBody(mailSettings.virtualBody.replace(/{{NAME}}/g, mailTarget.name));
        } else if (selectedTemplate === 'onsite') {
            setMailSubject(mailSettings.onsiteSubject);
            setMailBody(mailSettings.onsiteBody.replace(/{{NAME}}/g, mailTarget.name));
        } else if (selectedTemplate === 'rejection') {
            setMailSubject(mailSettings.rejectionSubject);
            setMailBody(mailSettings.rejectionBody.replace(/{{NAME}}/g, mailTarget.name));
        } else {
            setMailSubject('');
            setMailBody('');
        }
    }, [selectedTemplate, mailTarget, mailSettings]);

    useEffect(() => {
        if (previewUrl || mailTarget) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        };
    }, [previewUrl, mailTarget]);

    useEffect(() => {
        if (user?.id) fetchCandidates(user.id);
    }, [user?.id]);

    const fetchCandidates = async (forcedId?: string) => {
        const id = forcedId || user?.id;
        if (!id) return;
        setLoadingCandidates(true);
        try {
            const res = await fetch(`/api/crm/candidates?userId=${id}&t=${Date.now()}`, { cache: 'no-store' });
            const data = await res.json();
            setCandidates(data.candidates || []);
        } catch (err) { console.error('CRM fetch err:', err); }
        finally { setLoadingCandidates(false); }
    };

    const filteredCandidates = useMemo(() => {
        return candidates.filter(c => {
            const matchFilter = crmFilter === 'all' || c.status === crmFilter;
            const matchSearch = !crmSearch ||
                c.name.toLowerCase().includes(crmSearch.toLowerCase()) ||
                c.email.toLowerCase().includes(crmSearch.toLowerCase()) ||
                c.job_title.toLowerCase().includes(crmSearch.toLowerCase());
            return matchFilter && matchSearch;
        });
    }, [candidates, crmFilter, crmSearch]);

    const statusColor = (s: string) => {
        if (s === 'accepted') return 'bg-emerald-50 text-emerald-600 border-emerald-100';
        if (s === 'rejected') return 'bg-red-50 text-red-600 border-red-100';
        return 'bg-amber-50 text-amber-600 border-amber-100';
    };

    if (user?.tier !== 'enterprise' && user?.tier !== 'pro') {
        return (
            <div className="bg-white border border-slate-100 rounded-md p-20 text-center shadow-sm">
                <div className="size-16 bg-amber-50 rounded-md flex items-center justify-center mx-auto mb-6 text-amber-600 ring-8 ring-amber-50/50">
                    <Lock className="size-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Carrier Restricted Feature</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto mb-8 font-medium">
                    The Candidate CRM is part of our professional suite. Upgrade your account to unlock global applicant indexing and advanced correspondence.
                </p>
                <div className="flex items-center justify-center gap-4">
                    <button className="bg-slate-900 text-white px-8 py-3 rounded text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
                        Upgrade to Arctic Pro
                    </button>
                    <button onClick={() => window.location.href = '#pricing'} className="text-slate-400 px-8 py-3 text-[10px] font-black uppercase tracking-widest hover:text-slate-900 transition-all">
                        View Tiers
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Toolbar — wraps on mobile */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-slate-100 border border-slate-100 rounded-sm p-1">
                        <div className="flex items-center gap-2 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-sm bg-white shadow-sm text-slate-900">
                            <Users className="size-3" /> Candidates
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center bg-white border border-slate-200 rounded-sm px-3 py-2 focus-within:border-slate-900 transition-all flex-1 min-w-0">
                        <Search className="size-3.5 text-slate-300 shrink-0" />
                        <input
                            value={crmSearch}
                            onChange={(e) => setCrmSearch(e.target.value)}
                            placeholder="Search Applications..."
                            className="bg-transparent border-none text-xs font-bold text-slate-900 outline-none w-full min-w-0 placeholder:text-slate-300 ml-2"
                        />
                    </div>
                    <div className="relative group shrink-0">
                        <select
                            value={crmFilter}
                            onChange={(e) => setCrmFilter(e.target.value as any)}
                            className="bg-white border border-slate-200 rounded-sm py-2 px-4 pr-8 text-[10px] font-black uppercase tracking-widest text-slate-900 outline-none hover:border-slate-400 transition-all appearance-none cursor-pointer"
                        >
                            <option value="all">All</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                            <option value="pending">Pending</option>
                        </select>
                        <MoreHorizontal className="absolute right-2 top-1/2 -translate-y-1/2 size-3 text-slate-300 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Table — horizontally scrollable on mobile */}
            <div className="bg-white border border-slate-100 rounded shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] overflow-hidden">
                <div className="overflow-x-auto">
                {loadingCandidates ? (
                    <div className="flex items-center justify-center py-20">
                        <BouncyLoader />
                    </div>
                ) : filteredCandidates.length === 0 ? (
                    <div className="py-16 text-center">
                        <Users className="size-10 text-slate-200 mx-auto mb-4" />
                        <p className="text-sm font-bold text-slate-400">No candidates found</p>
                    </div>
                ) : (
                    <table className="w-full text-left min-w-[640px]">
                        <thead className="border-b border-slate-100 bg-slate-50/50">
                            <tr>
                                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Candidate</th>
                                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Email</th>
                                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Job</th>
                                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">ATS</th>
                                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Resume</th>
                                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Contact</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                             {filteredCandidates.map(c => (
                                <CRMCandidateRow
                                    key={c.id}
                                    c={c}
                                    user={user}
                                    setPreviewUrl={setPreviewUrl}
                                    setMailTarget={setMailTarget}
                                    statusColor={statusColor}
                                />
                            ))}
                        </tbody>
                    </table>
                )}
                </div>
                <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {filteredCandidates.length} candidate{filteredCandidates.length !== 1 ? 's' : ''} indexed
                </div>
            </div>

            {mounted && createPortal(
                <AnimatePresence>
                    {mailTarget && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6" data-lenis-prevent="true">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                                onClick={() => !sendingMail && setMailTarget(null)}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                className="relative bg-white rounded-sm border border-slate-100 w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden"
                            >
                                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 bg-slate-900 rounded flex items-center justify-center text-white">
                                            <Mail className="size-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900">Direct Correspondence</h3>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Recipient: {mailTarget.email}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => !sendingMail && setMailTarget(null)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-all">
                                        <X className="size-5" />
                                    </button>
                                </div>

                                <div className="flex-1 p-8 space-y-6 overflow-y-auto">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Communication Template</label>
                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                { id: 'custom', label: 'Custom' },
                                                { id: 'rejection', label: 'Rejection' },
                                                { id: 'virtual', label: 'Virtual Meet' },
                                                { id: 'onsite', label: 'On-Site' }
                                            ].map(t => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => setSelectedTemplate(t.id as any)}
                                                    className={`px-3 py-1.5 rounded-sm border text-[9px] font-black uppercase tracking-widest transition-all ${selectedTemplate === t.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-400'}`}
                                                >
                                                    {t.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Subject Header</label>
                                            <input
                                                value={mailSubject}
                                                onChange={(e) => setMailSubject(e.target.value)}
                                                placeholder="Transmission Subject..."
                                                className="w-full bg-slate-50 border border-slate-100 rounded-md px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-slate-900 transition-all font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Message Body</label>
                                            <textarea
                                                rows={8}
                                                value={mailBody}
                                                onChange={(e) => setMailBody(e.target.value)}
                                                placeholder="Compose candidate briefing..."
                                                className="w-full bg-slate-50 border border-slate-100 rounded-md px-4 py-3 text-xs font-medium text-slate-600 outline-none focus:bg-white focus:border-slate-900 transition-all resize-none leading-relaxed"
                                            />
                                        </div>
                                    </div>
                                </div>

                                 <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <ShieldCheck className="size-3" /> Secure Payload Delivery
                                    </p>
                                    <button
                                        disabled={sendingMail || !mailSubject || !mailBody}
                                        onClick={() => {
                                            setSendingMail(true);
                                            setTimeout(() => {
                                                setSendingMail(false);
                                                setMailSent(true);
                                                setTimeout(() => {
                                                    setMailSent(false);
                                                    setMailTarget(null);
                                                }, 2000);
                                            }, 1500);
                                        }}
                                        className="bg-slate-900 text-white px-8 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                                    >
                                        {sendingMail ? <BouncyLoader size="sm" /> : mailSent ? <CheckCircle2 className="size-3.5" /> : 'Execute Dispatch'}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}

                    {previewUrl && (
                        <div className="fixed inset-0 z-[10000] flex items-start justify-center p-0" data-lenis-prevent="true">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                                onClick={() => setPreviewUrl(null)}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                                className="relative bg-white rounded-sm border border-slate-200 w-full max-w-3xl h-full shadow-2xl flex flex-col overflow-hidden"
                            >
                                <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Application Curriculum Vitae</span>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => window.open(previewUrl, '_blank')}
                                            className="size-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all"
                                            title="External View"
                                        >
                                            <ExternalLink className="size-3.5" />
                                        </button>
                                        <button 
                                            onClick={() => setPreviewUrl(null)} 
                                            className="size-8 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                        >
                                            <X className="size-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 relative overflow-hidden">
                                     <PDFDossierViewer url={previewUrl} />
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}
