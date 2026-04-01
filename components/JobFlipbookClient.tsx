/**
 * JobFlipbookClient.tsx
 *
 * Displays job flipbook for recruiters and managers, integrates candidate review and AI chat.
 * Security: Role-based access (recruiter/manager), authenticated users only.
 * APIs used: Supabase (database, storage), Next.js API routes, PDF.js for resume rendering.
 */
'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Link2, Users, MessageSquare, X, LayoutDashboard, Sparkles,
    ShieldCheck, Zap, ArrowUpRight, Mail, Filter, Send, CheckCircle2,
    Calendar, Video, MapPin, Info, ArrowRight, Clock, Linkedin, Github, Globe,
    Copy, Check, ExternalLink, Loader2, BookOpen, Eye, FileText, Briefcase,
    Search, Brain, Upload, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FlipbookViewer from '@/components/FlipbookViewer';
import AIChatPanel from '@/components/AIChatPanel';
import { supabase } from '@/lib/supabase';
import { prewarmPdfjs, getPdfjs } from '@/lib/pdf-init';

const NativePDFViewer = ({ url }: { url: string }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        let renderTask: any = null;

        async function renderPdf() {
            try {
                const pdfjsLib = await getPdfjs();
                const pdf = await pdfjsLib.getDocument({
                    url,
                    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
                    cMapPacked: true,
                }).promise;

                const page = await pdf.getPage(1);
                if (cancelled) return;

                const viewport = page.getViewport({ scale: 4.0 });
                const canvas = canvasRef.current;
                if (!canvas) return;

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                const context = canvas.getContext('2d', { alpha: false, willReadFrequently: false });
                if (!context) return;

                renderTask = page.render({
                    canvasContext: context,
                    viewport,
                    intent: 'display',
                });

                await renderTask.promise;
                if (!cancelled) setLoading(false);
            } catch (err: any) {
                console.error('[PDF Render Error]', err);
                if (!cancelled) setLoading(false);
            }
        }

        renderPdf();
        return () => {
            cancelled = true;
            renderTask?.cancel?.();
        };
    }, [url]);

    return (
        <div className="w-full relative bg-white">
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
                </div>
            )}
            <canvas
                ref={canvasRef}
                className={`w-full h-auto origin-top transition-opacity duration-500 rounded border border-slate-100 shadow-sm ${loading ? 'opacity-0' : 'opacity-100'}`}
            />
        </div>
    );
};

interface Job {
    id: string;
    title: string;
    company_name: string;
    description: string;
}

interface Applicant {
    id: string;
    name: string;
    email: string;
    resume_url: string;
    ai_summary: string;
    ats_score: number;
    resume_text?: string;
    status?: 'pending' | 'accepted' | 'rejected';
    reasons?: string[];
    custom_reason?: string;
}


const MatrixApplicantCard = ({ app, links, tier, job, onUpdateStatus, onEmail, NativePDFViewer }: {
    app: Applicant,
    links: any[],
    tier: 'free' | 'pro' | 'enterprise',
    job: Job,
    onUpdateStatus: (id: string, s: 'pending' | 'accepted' | 'rejected', r: string[], c: string) => void,
    onEmail: (email: string, name: string) => void,
    NativePDFViewer: any
}) => {
    const [status, setStatus] = useState<'pending' | 'accepting' | 'rejecting' | 'accepted' | 'rejected'>(app.status || 'pending');
    const [selectedReasons, setSelectedReasons] = useState<string[]>(app.reasons || []);
    const [customReason, setCustomReason] = useState(app.custom_reason || "");

    const currentStatus = app.status || 'pending';

    const toggleReason = (reason: string) => {
        setSelectedReasons(prev => prev.includes(reason) ? prev.filter(r => r !== reason) : [...prev, reason]);
    };

    const confirmAction = () => {
        let finalStatus: 'accepted' | 'rejected' | 'pending' = 'pending';
        if (status === 'accepting') finalStatus = 'accepted';
        if (status === 'rejecting') finalStatus = 'rejected';
        setStatus(finalStatus);
        onUpdateStatus(app.id, finalStatus, selectedReasons, customReason);
    };

    const resetAction = () => {
        setStatus('pending');
        setSelectedReasons([]);
        setCustomReason("");
        onUpdateStatus(app.id, 'pending', [], "");
    };

    return (
        <div id={`applicant-${app.id}`} className="relative bg-white group hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] transition-all duration-700 rounded-xl overflow-hidden border border-slate-100/60 transition-all">
            {/* Dossier Header - Refined & Compact */}
            <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                    {/* Left Column: Identity & Intelligence */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-none truncate">{app.name}</h3>
                            <div className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide rounded border shrink-0 ${currentStatus === 'accepted' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                                currentStatus === 'rejected' ? 'bg-red-50 border-red-100 text-red-600' :
                                    'bg-slate-50 border-slate-100 text-slate-400'
                                }`}>
                                {currentStatus}
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-medium mb-2">
                            <span className="flex items-center gap-1.5"><Mail className="size-3 text-slate-400" /> {app.email}</span>
                            <span className="text-slate-200">|</span>
                            <span>Ref: {app.id.slice(0, 8).toUpperCase()}</span>
                        </div>
                        
                        {/* Candidate Provided Links - Matches User Design Reference */}
                        {links.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-5">
                                {links.map((link, idx) => {
                                    const label = link.label?.toLowerCase() || '';
                                    const isLI = label.includes('linkedin');
                                    const isGH = label.includes('github');
                                    const isIG = label.includes('instagram');
                                    const isDrive = label.includes('drive') || label.includes('google');
                                    const isPort = label.includes('portfolio') || label.includes('website') || label.includes('site');
                                    
                                    const finalUrl = link.url !== 'Not provided' ? (link.url.startsWith('http') ? link.url : `https://${link.url}`) : '#';
                                    
                                    return (
                                        <a key={idx} href={finalUrl} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-sm text-[10px] font-bold text-slate-600 hover:text-slate-900 hover:border-slate-400 hover:shadow-sm transition-all group active:scale-95">
                                            {isLI ? <Linkedin className="size-3.5 text-[#0077b5]" /> : 
                                             isGH ? <Github className="size-3.5 text-slate-900" /> : 
                                             isIG ? <ExternalLink className="size-3.5 text-pink-500" /> : 
                                             isDrive ? <Upload className="size-3.5 text-emerald-500" /> : 
                                             isPort ? <Globe className="size-3.5 text-indigo-500" /> : 
                                             <Link2 className="size-3.5" />}
                                            <span className="uppercase tracking-tight">{link.label}</span>
                                        </a>
                                    );
                                })}
                            </div>
                        )}

                        <div className="mt-4 flex-1 border-t border-slate-50 pt-4 pr-4 md:pr-12 min-h-[100px]">
                            {!(tier === 'pro' || tier === 'enterprise') ? (
                                <div className="py-2 animate-in fade-in duration-500">
                                    <p className="text-[11px] font-medium text-slate-400 leading-relaxed italic">
                                        Ai Overview is not Available for Free Tier users. Want to Upgrade your plan? <a href="/#pricing" className="text-slate-900 font-black underline underline-offset-4 decoration-slate-900/20 hover:decoration-slate-900 transition-all">See Plans...</a>
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                        <Brain className="size-3 text-emerald-500" /> Intelligence Overview
                                    </p>
                                    <div className="space-y-2.5">
                                        <ul className="space-y-2">
                                            {(app.ai_summary?.split('--- PROVIDED CANDIDATE LINKS ---')[0] || 'Dossier analyzing...').split('\n').filter(Boolean).map((para, i) => (
                                                <li key={i} className="text-[11px] font-medium text-slate-600 leading-relaxed pl-4 relative">
                                                    <span className="absolute left-0 top-1.5 size-1 bg-slate-900 rounded-sm" />
                                                    {para.replace(/^[•\-\*]\s*/, '').trim()}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Score & Action Bay */}
                    <div className="flex flex-col items-end gap-6 shrink-0 w-[240px] md:w-[280px]">
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Match Score</p>
                            <span className="text-3xl font-black text-slate-900 tracking-tight leading-none">{app.ats_score}%</span>
                        </div>

                        <div className="w-full">
                            {(tier === 'free' || status === 'pending' || status === 'accepted' || status === 'rejected') ? (
                                <div className="flex gap-2 w-full mt-2">
                                    <button
                                        onClick={() => {
                                            if (tier === 'pro' || tier === 'enterprise') {
                                                onEmail(app.email, app.name);
                                            }
                                        }}
                                        className={`p-2 rounded border transition-all ${tier === 'pro' || tier === 'enterprise' 
                                            ? 'bg-white border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-900 group-hover:scale-110 shadow-sm' 
                                            : 'hidden'}`}
                                        title="Send Email"
                                    >
                                        <Mail className="size-4" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (tier === 'pro' || tier === 'enterprise') {
                                                setStatus('accepting');
                                                setSelectedReasons([]);
                                                setCustomReason("");
                                            } else {
                                                onUpdateStatus(app.id, 'accepted', [], '');
                                            }
                                        }}
                                        className={`flex-1 py-2 px-3 rounded text-[11px] font-bold transition-all ${currentStatus === 'accepted'
                                            ? 'bg-emerald-600 text-white shadow-sm'
                                            : 'bg-slate-900 text-white hover:bg-slate-800'
                                            }`}
                                    >
                                        {currentStatus === 'accepted' ? <span className="flex items-center justify-center gap-1.5"><CheckCircle2 className="size-3" /> Accepted</span> : 'Accept'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (tier === 'pro' || tier === 'enterprise') {
                                                setStatus('rejecting');
                                                setSelectedReasons([]);
                                                setCustomReason("");
                                            } else {
                                                onUpdateStatus(app.id, 'rejected', [], '');
                                            }
                                        }}
                                        className={`flex-1 py-2 px-3 rounded text-[11px] font-bold border transition-all ${currentStatus === 'rejected'
                                            ? 'border-red-500 text-red-600 bg-red-50'
                                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-900 hover:text-slate-900'
                                            }`}
                                    >
                                        {currentStatus === 'rejected' ? 'Rejected' : 'Reject'}
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-white border border-slate-100 rounded p-6 space-y-5 shadow-[0_20px_50px_rgba(0,0,0,0.05)] animate-in fade-in slide-in-from-bottom-2">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase">
                                            {status === 'accepting' ? 'Success Indicators' : 'Rejection Reasons'}
                                        </p>
                                        <button onClick={resetAction} className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors">Cancel</button>
                                    </div>

                                    {/* Requested 3nd row 3-3 section grid */}
                                    <div className="grid grid-cols-3 gap-2">
                                        {(status === 'accepting'
                                            ? ['Strong Skills', 'Relevant Exp', 'Role Match', 'Great Portfolio', 'Quick Starter', 'Culture Match']
                                            : ['Skills Mismatch', 'Low Experience', 'Role Filled', 'Location Diff', 'Exp Mismatch', 'Other Path']
                                        ).map(reason => {
                                            const isSel = selectedReasons.includes(reason);
                                            return (
                                                <button
                                                    key={reason}
                                                    onClick={() => toggleReason(reason)}
                                                    className={`text-[9px] font-bold border rounded py-2.5 transition-all text-center px-2 leading-none ${isSel
                                                        ? (status === 'accepting' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-red-50 border-red-500 text-red-700')
                                                        : 'text-slate-400 border-slate-100 bg-white hover:border-slate-900 hover:text-slate-900 font-medium'}`}
                                                >
                                                    {reason}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        <input
                                            value={customReason}
                                            onChange={(e) => setCustomReason(e.target.value)}
                                            placeholder="Other Detail"
                                            className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded text-xs font-medium text-slate-900 outline-none focus:border-slate-900 transition-colors"
                                        />
                                        <button
                                            onClick={confirmAction}
                                            className={`w-full py-4 rounded text-[10px] font-black uppercase tracking-[0.2em] text-white transition-colors ${status === 'accepting' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}`}
                                        >
                                            Confirm {status === 'accepting' ? 'Acceptance' : 'Rejection'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* True Seamless PDF Canvas */}
            <div className="px-6 lg:px-12 pb-16 bg-white w-full flex justify-center border-t border-slate-50">
                <div className="w-full max-w-4xl pt-8">
                    <NativePDFViewer url={app.resume_url} />

                    {/* Discrete Metadata Footer */}
                    <div className="mt-8 flex items-center justify-end gap-3 text-[10px] font-medium text-slate-400 pr-2">
                        <span>Ref: RF-{app.id.slice(0, 8).toUpperCase()}</span>
                        <span className="size-1 bg-slate-200 rounded-full" />
                        <span>System Verified Record</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function JobFlipbookClient({ jobId }: { jobId: string }) {
    const router = useRouter();
    const [job, setJob] = useState<Job | null>(null);
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [loading, setLoading] = useState(true);
    const [authLoading, setAuthLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isMailOpen, setIsMailOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState<'all' | 'accepted' | 'rejected' | 'pending'>('all');
    const [viewMode, setViewMode] = useState<'flipbook' | 'pdf'>('flipbook');
    const [tier, setTier] = useState<'free' | 'pro' | 'enterprise'>('free'); // Tier system
    const [user, setUser] = useState<any>(null);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchResults, setShowSearchResults] = useState(false);
    const bookRef = useRef<any>(null);

    const handleJumpToApplicant = (applicantId: string) => {
        const totalIndex = applicants.findIndex(a => a.id === applicantId);
        if (totalIndex === -1) return;

        // If applicant is not in current filter, reset filter to 'all'
        const isVisible = filteredApplicants.some(a => a.id === applicantId);
        if (!isVisible) {
            setFilterStatus('all');
        }

        if (viewMode === 'flipbook') {
            setTimeout(() => {
                // Determine index in the view (if filter was 'all', it's totalIndex)
                const targetIndex = !isVisible ? totalIndex : filteredApplicants.findIndex(a => a.id === applicantId);
                bookRef.current?.jumpToApplicant?.(targetIndex);
            }, 100);
        } else {
            // Stay in Matrix view
            setTimeout(() => {
                const el = document.getElementById(`applicant-${applicantId}`);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        }

        setSearchQuery('');
        setShowSearchResults(false);
    };

    // For Bulk Mail Selection
    const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
    const [mailSubject, setMailSubject] = useState('');
    const [mailBody, setMailBody] = useState('');
    const [sendingMail, setSendingMail] = useState(false);
    const [mailSentSuccess, setMailSentSuccess] = useState(false);
    const [mailFilterStatus, setMailFilterStatus] = useState<'all'|'accepted'|'rejected'|'pending'>('all');

    // Interview Logistics
    const [isInviteActive, setIsInviteActive] = useState(false);
    const [inviteMode, setInviteMode] = useState<'virtual' | 'on-site'>('virtual');
    const [inviteTime, setInviteTime] = useState('');
    const [inviteEndTime, setInviteEndTime] = useState('');
    const [inviteLink, setInviteLink] = useState('');
    const [inviteLocation, setInviteLocation] = useState('');
    const [savedSettings, setSavedSettings] = useState<any>(null);
    const [meetingConflict, setMeetingConflict] = useState<string | null>(null);
    const [companyName, setCompanyName] = useState('');

    // Pre-warm PDF.js library so it's ready before the user flips
    useEffect(() => { prewarmPdfjs(); }, []);

    useEffect(() => {
        const checkAuthAndFetch = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
                return;
            }
            setAuthLoading(false);

            try {
                // Fetch profile to get tier securely from backend
                let currentTier = 'free';
                try {
                    const res = await fetch('/api/profile', { cache: 'no-store' });
                    if (res.ok) {
                        const { profile } = await res.json();
                        currentTier = profile?.tier || 'free';
                        if (profile?.company_name) setCompanyName(profile.company_name);
                    }
                } catch (e) {
                    console.error('Tier fetch failed:', e);
                }
                // Use current tier exactly as registered in the database
                setTier(currentTier as any);
                setUser({ ...session.user, tier: currentTier });

                if (currentTier === 'pro' || currentTier === 'enterprise') {
                    setViewMode('flipbook');
                } else {
                    setViewMode('pdf');
                }

                const res = await fetch(`/api/job/${jobId}`);
                const data = await res.json();
                console.log('[Flipbook] API response:', { status: res.status, jobFound: !!data.job, applicantCount: data.applicants?.length, error: data.error });
                if (data.job) setJob(data.job);
                if (data.applicants) setApplicants(data.applicants);

                // Load global mail settings
                const saved = localStorage.getItem('rf_mail_settings');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    setSavedSettings(parsed);
                }
            } catch (err) {
                console.error('Failed to fetch job data:', err);
            } finally {
                setLoading(false);
            }
        };
        checkAuthAndFetch();
    }, [jobId, router]);

    const [selectedTemplate, setSelectedTemplate] = useState<'custom' | 'rejection' | 'virtual' | 'onsite'>('custom');

    // Update mail body when template changes
    useEffect(() => {
        if (selectedTemplate === 'virtual') {
            setMailSubject(savedSettings?.virtualSubject || 'Invitation to Virtual Interview');
            setMailBody(savedSettings?.virtualBody || 'Dear {{NAME}},\n\nWe are impressed with your profile, particularly regarding {{REASONS}}. We would like to invite you for a virtual interview.\n\nMeeting Details:\nLink: {{LINK}}\nTime: {{START}} - {{END}}\n\nBest regards,\n{{COMPANY}}');
            setIsInviteActive(true);
            setInviteMode('virtual');
            setInviteLink(savedSettings?.meetLink || '');
        } else if (selectedTemplate === 'onsite') {
            setMailSubject(savedSettings?.onsiteSubject || 'Invitation to On-site Interview');
            setMailBody(savedSettings?.onsiteBody || 'Dear {{NAME}},\n\nWe are impressed with your profile, particularly regarding {{REASONS}}. We would like to invite you for an on-site interview.\n\nPlease visit our office at:\nLocation: {{LOCATION}}\nTime: {{START}} - {{END}}\n\nBest regards,\n{{COMPANY}}');
            setIsInviteActive(true);
            setInviteMode('on-site');
            setInviteLocation(savedSettings?.location || '');
        } else if (selectedTemplate === 'rejection') {
            setMailSubject(savedSettings?.rejectionSubject || 'Update regarding your application for {{ROLE}}');
            setMailBody(savedSettings?.rejectionBody || 'Dear {{NAME}},\n\nThank you for applying for the {{ROLE}} position at {{COMPANY}}. Unfortunately, we will not be moving forward due to: {{REASONS}}.\n\nBest regards,\n{{COMPANY}}');
            setIsInviteActive(false);
        } else {
            setMailSubject('');
            setMailBody('');
            setIsInviteActive(false);
        }
    }, [selectedTemplate, savedSettings]);

    useEffect(() => {
        const lockScroll = () => {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
            document.body.style.paddingRight = 'var(--scrollbar-width, 0px)'; // Prevent layout shift if possible
        };

        const unlockScroll = () => {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
            document.body.style.paddingRight = '';
        };

        if (isMailOpen || isChatOpen) {
            lockScroll();
        } else {
            unlockScroll();
        }

        return () => unlockScroll();
    }, [isMailOpen, isChatOpen]);

    const handleInsertToken = (token: string) => {
        setMailBody(prev => prev + token);
    };

    const copyLink = async () => {
        const link = `${window.location.origin}/apply/${jobId}`;
        await navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const extractLinks = (summary: string) => {
        if (!summary) return [];
        
        // Strategy: Strictly from Explicit Marker (Form Entries Only)
        // Using a case-insensitive search for maximum reliability
        const marker = '--- PROVIDED CANDIDATE LINKS ---';
        const lowerSummary = summary.toLowerCase();
        const markerIdx = lowerSummary.indexOf(marker.toLowerCase());
        
        const extracted: any[] = [];
        
        if (markerIdx !== -1) {
            const linksPart = summary.substring(markerIdx + marker.length);
            const lines = linksPart.split('\n').filter(l => l.includes(':'));
            for (const l of lines) {
                const idx = l.indexOf(':');
                const label = l.substring(0, idx).trim();
                const url = l.substring(idx + 1).trim();
                if (url && url !== 'Not provided' && url.length > 3) {
                    extracted.push({ label, url });
                }
            }
        }
        
        return extracted;
    };

    const handleUpdateStatus = async (appId: string, status: 'pending' | 'accepted' | 'rejected', reasons: string[], custom: string) => {
        // Update local state immediately for snappy UI
        setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status, reasons, custom_reason: custom } : a));

        try {
            const res = await fetch(`/api/applications/${appId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, reasons, custom_reason: custom })
            });
            if (!res.ok) {
                console.error('Failed to update status in DB');
            }
        } catch (err) {
            console.error('Persistence error:', err);
        }
    };

    const filteredApplicants = applicants.filter(a => {
        if (filterStatus === 'all') return true;
        const currentStatus = a.status || 'pending';
        return currentStatus === filterStatus;
    });

    const handleSendBulkMail = async () => {
        if (selectedEmails.length === 0) return;
        setSendingMail(true);
        setMeetingConflict(null);

        // If invite is active, create meetings for each candidate and check conflicts
        if (isInviteActive && inviteTime && inviteEndTime) {
            for (const email of selectedEmails) {
                const applicant = applicants.find(a => a.email === email);
                if (!applicant) continue;

                try {
                    const res = await fetch('/api/meetings', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            application_id: applicant.id,
                            start_time: new Date(inviteTime).toISOString(),
                            end_time: new Date(inviteEndTime).toISOString(),
                            mode: inviteMode,
                            title: `Interview: ${applicant.name}`,
                            notes: `Job: ${job?.title || 'N/A'}`
                        })
                    });

                    if (res.status === 409) {
                        const data = await res.json();
                        const conflict = data.conflicts?.[0];
                        setMeetingConflict(
                            `Time conflict with "${conflict?.title}" (${new Date(conflict?.start_time).toLocaleString()} - ${new Date(conflict?.end_time).toLocaleString()}). Choose a different time.`
                        );
                        setSendingMail(false);
                        return;
                    }
                } catch (err) {
                    console.error('Meeting creation error:', err);
                }
            }
        }

        // Dispatch personalized emails via API
        const dispatchPayload = {
            emails: selectedEmails,
            subject: mailSubject
                .replace(/{{COMPANY}}/g, companyName || job?.company_name || 'Our Company')
                .replace(/{{ROLE}}/g, job?.title || 'the position'),
            bodies: selectedEmails.map(email => {
                const applicant = applicants.find(a => a.email === email);
                if (!applicant) return '';

                const reasonsText = (applicant.reasons || []).join(', ') + 
                    (applicant.custom_reason ? `. Note: ${applicant.custom_reason}` : '');

                let finalBody = mailBody
                    .replace(/{{NAME}}/g, applicant.name)
                    .replace(/{{REASONS}}/g, reasonsText || 'performance metrics')
                    .replace(/{{COMPANY}}/g, companyName || job?.company_name || 'Our Company')
                    .replace(/{{ROLE}}/g, job?.title || 'the position');

                const startFormatted = inviteTime ? new Date(inviteTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'To be confirmed';
                const endFormatted = inviteEndTime ? new Date(inviteEndTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'To be confirmed';
                const currentLink = savedSettings?.meetLink || 'Pending';
                const currentLocation = savedSettings?.location || job?.company_name || 'Office';

                finalBody = finalBody
                    .replace(/{{LINK}}/g, currentLink)
                    .replace(/{{LOCATION}}/g, currentLocation)
                    .replace(/{{START}}/g, startFormatted)
                    .replace(/{{END}}/g, endFormatted);

                if (isInviteActive && !mailBody.includes('{{START}}')) {
                    const logistics = inviteMode === 'virtual'
                        ? `\n\nINTERVIEW LOGISTICS:\nProtocol: Virtual Meet\nLink: ${currentLink}\nStart: ${startFormatted}\nEnd: ${endFormatted}`
                        : `\n\nINTERVIEW LOGISTICS:\nProtocol: On-Site\nLocation: ${currentLocation}\nStart: ${startFormatted}\nEnd: ${endFormatted}`;
                    finalBody += logistics;
                }
                return finalBody;
            })
        };

        try {
            const res = await fetch('/api/mail/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dispatchPayload)
            });
            if (!res.ok) throw new Error('Mail dispatch failed');
        } catch (err) {
            console.error('[MAIL DISPATCH ERROR]', err);
            setSendingMail(false);
            return;
        }

        setSendingMail(false);
        setMailSentSuccess(true);
        setTimeout(() => {
            setMailSentSuccess(false);
            setIsMailOpen(false);
            setSelectedEmails([]);
            setMailSubject('');
            setMailBody('');
            setMeetingConflict(null);
        }, 3000);
    };

    const toggleEmailSelect = (email: string) => {
        setSelectedEmails(prev => prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]);
    };

    const selectAllFiltered = () => {
        const emails = filteredApplicants.map(a => a.email);
        const allSelected = emails.every(e => selectedEmails.includes(e));
        if (allSelected) {
            setSelectedEmails(prev => prev.filter(e => !emails.includes(e)));
        } else {
            const newSet = new Set([...selectedEmails, ...emails]);
            setSelectedEmails(Array.from(newSet));
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-slate-300" />
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center text-slate-900 border border-t-0 border-slate-100">
                <h1 className="text-2xl font-bold mb-4 tracking-tight">Job Instance Not Found</h1>
                <Link href="/dashboard" className="px-6 py-2 bg-slate-900 text-white rounded text-xs font-bold hover:bg-slate-800 transition-all">
                    Return to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-slate-900 overflow-hidden flex flex-col font-sans">
            {/* Arctic Toolbar */}
            <nav className="relative z-50 bg-white border-b border-slate-100 px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <Link href="/dashboard" className="flex items-center gap-2 group">
                        <div className="h-8 w-auto transition-transform group-hover:scale-105">
                            <img src="/recruit-flow-logo.png" alt="Recruit Flow" className="h-full w-auto object-contain" />
                        </div>
                    </Link>
                    <div className="h-8 w-px bg-slate-100 hidden md:block" />
                    <div className="flex items-center gap-3">
                        <div className="size-10 bg-slate-50 border border-slate-100 rounded flex items-center justify-center text-slate-900">
                            <Briefcase className="size-4" />
                        </div>
                        <div>
                            <h1 className="text-sm font-bold leading-none tracking-tight text-slate-900 uppercase">{job.title}</h1>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1.5">{job.company_name}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {user?.tier !== 'enterprise' ? (
                        <div className="relative group/lock">
                            <button
                                className="h-9 px-4 bg-slate-50 border border-slate-100 text-slate-300 rounded font-bold text-[11px] flex items-center gap-2 cursor-not-allowed"
                            >
                                <Lock className="size-3.5 opacity-50" />
                                AI Chat Agent
                            </button>
                            <div className="absolute top-full left-0 mt-2 w-64 p-2.5 bg-slate-900 text-white text-[9px] font-bold rounded opacity-0 group-hover/lock:opacity-100 transition-opacity pointer-events-none text-center shadow-2xl z-[100]">
                                Enterprise Feature: Unlock the AI recruitment agent for real-time candidate advisory and deep analysis.
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsChatOpen(true)}
                            className={`h-9 px-4 rounded border-2 transition-all flex items-center gap-2 font-bold text-[11px] ${isChatOpen
                                ? 'bg-slate-900 border-slate-900 text-white shadow-xl'
                                : 'bg-white border-slate-100 text-slate-500 hover:border-slate-900 hover:text-slate-900'
                                }`}
                        >
                            <Sparkles className="size-3.5 fill-current" />
                            AI Chat Agent
                        </button>
                    )}


                    <button
                        onClick={copyLink}
                        className={`h-9 px-4 rounded border font-bold text-[11px] transition-all flex items-center gap-2 ${copied
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                            : 'bg-white border-slate-100 text-slate-500 hover:border-slate-100 hover:text-slate-900'
                            }`}
                    >
                        {copied ? <><Check className="size-3.5" /> Copied</> : <><Link2 className="size-3.5" /> Share Pipeline</>}
                    </button>

                    <div className="hidden lg:flex items-center gap-2 h-9 px-4 bg-slate-50 border border-slate-100 rounded">
                        <Users className="size-3.5 text-slate-400" />
                        <span className="text-[11px] font-semibold text-slate-700">{applicants.length} Candidates</span>
                    </div>

                    {tier === 'enterprise' ? (
                        <button
                            onClick={() => window.open(`/api/bulk-pdf?jobId=${jobId}&userId=${user?.id}`, '_blank')}
                            className="h-9 px-4 bg-white border border-slate-100 text-slate-600 rounded font-bold text-[11px] transition-all flex items-center gap-2 hover:bg-slate-900 hover:text-white hover:border-slate-900 shadow-sm active:scale-95 group"
                        >
                            <Upload className="size-3.5 rotate-180 group-hover:scale-110 transition-transform" />
                            Download All
                        </button>
                    ) : (
                        <div className="relative group/lock">
                            <button
                                className="h-9 px-4 bg-slate-50 border border-slate-100 text-slate-300 rounded font-black uppercase tracking-widest text-[9px] flex items-center gap-2 cursor-not-allowed"
                            >
                                <Lock className="size-3 opacity-50" />
                                Bulk Download
                            </button>
                            <div className="absolute top-full right-0 mt-2 w-56 p-2.5 bg-slate-900 text-white text-[9px] font-bold rounded opacity-0 group-hover/lock:opacity-100 transition-opacity pointer-events-none text-center shadow-2xl z-50">
                                Enterprise feature: Aggregate all pipeline candidates into one PDF.
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* Viewer Workspace */}
            <div className="relative z-10 flex-1 flex flex-col bg-[#fafafa]">
                {/* Candidate Hub & Mail */}
                <div className="bg-white border-b border-slate-100 px-6 py-3 flex items-center justify-between shadow-sm relative z-20">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center bg-slate-100 border border-slate-100 rounded-md p-1">
                            <button
                                onClick={() => (tier === 'pro' || tier === 'enterprise') ? setViewMode('flipbook') : null}
                                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded transition-all ${viewMode === 'flipbook'
                                    ? 'bg-white shadow-sm text-slate-900 border border-slate-100'
                                    : (tier === 'pro' || tier === 'enterprise') ? 'text-slate-500 hover:text-slate-800' : 'text-slate-300 cursor-not-allowed'}`}
                            >
                                <Sparkles className="size-3.5" />
                                {(tier === 'pro' || tier === 'enterprise') ? 'Flipbook' : 'Flipbook (Pro)'}
                            </button>
                            <button
                                onClick={() => setViewMode('pdf')}
                                className={`flex items-center gap-2 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded transition-all ${viewMode === 'pdf' ? 'bg-white shadow text-slate-900 border border-slate-100' : 'text-slate-400'}`}
                            >
                                <FileText className="size-3" />
                                {(tier === 'pro' || tier === 'enterprise') ? 'ATS Matrix' : 'PDF View'}
                            </button>
                        </div>

                        <div className="h-4 w-px bg-slate-200" />

                        <div className="flex items-center bg-slate-50 border border-slate-100 rounded-md p-1">
                            {['all', 'accepted', 'rejected', 'pending'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilterStatus(f as any)}
                                    className={`px-4 py-2 text-xs font-bold rounded transition-all ${filterStatus === f ? 'bg-white shadow-sm text-slate-900 border border-slate-100' : 'text-slate-500 hover:text-slate-800'}`}
                                >
                                    {f.charAt(0).toUpperCase() + f.slice(1)} {f !== 'all' && `(${applicants.filter(a => (a.status || 'pending') === f).length})`}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {tier === 'free' ? (
                            <div className="relative group/lock">
                                <div className="flex items-center bg-slate-50 border border-slate-100 rounded-lg px-4 py-2 cursor-not-allowed opacity-60">
                                    <Lock className="size-3.5 text-slate-300 mr-2.5" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">SEARCH LOCKED</span>
                                </div>
                                <div className="absolute top-full right-0 mt-2 w-56 p-2.5 bg-slate-900 text-white text-[9px] font-bold rounded-lg opacity-0 group-hover/lock:opacity-100 transition-opacity pointer-events-none text-center shadow-2xl z-50">
                                    Premium feature: Quickly jump to any specific candidate dossier.
                                </div>
                            </div>
                        ) : (
                            <div className="relative">
                                <div className="flex items-center bg-white border border-slate-100 rounded-lg px-4 py-2 focus-within:border-slate-900 transition-all shadow-sm group">
                                    <Search className="size-3.5 text-slate-300 group-focus-within:text-slate-900" />
                                    <input
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setShowSearchResults(true);
                                        }}
                                        onFocus={() => setShowSearchResults(true)}
                                        placeholder="SEARCH CANDIDATE..."
                                        className="bg-transparent border-none text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 outline-none w-48 placeholder:text-slate-200 ml-2.5"
                                    />
                                </div>

                                <AnimatePresence>
                                    {showSearchResults && searchQuery.length > 0 && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setShowSearchResults(false)} />
                                            <motion.div
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 5 }}
                                                transition={{ duration: 0.2 }}
                                                className="absolute top-full right-0 mt-2 bg-white border border-slate-100 rounded-md shadow-xl z-50 w-80 overflow-hidden"
                                                data-lenis-prevent
                                            >
                                                <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/50">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Registry Matches</p>
                                                </div>
                                                <div className="max-h-72 overflow-y-auto custom-scrollbar">
                                                    {applicants.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
                                                        applicants
                                                            .filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                                            .map(app => (
                                                                <button
                                                                    key={app.id}
                                                                    onClick={() => handleJumpToApplicant(app.id)}
                                                                    className="w-full px-5 py-4 hover:bg-slate-50 transition-colors flex items-center justify-between text-left"
                                                                >
                                                                    <div className="flex flex-col gap-1">
                                                                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{app.name}</span>
                                                                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">REF: {app.id.slice(0, 8).toUpperCase()}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="px-2 py-1 bg-slate-100 text-slate-900 rounded-sm text-[10px] font-black tracking-widest border border-slate-100">
                                                                            {app.ats_score}%
                                                                        </div>
                                                                        <ArrowRight className="size-3.5 text-slate-400" />
                                                                    </div>
                                                                </button>
                                                            ))
                                                    ) : (
                                                        <div className="py-12 flex flex-col items-center gap-3">
                                                            <Search className="size-6 text-slate-100" />
                                                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">No candidates found</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        {!(tier === 'pro' || tier === 'enterprise') ? (
                            <div className="relative group/lock">
                                <button
                                    className="flex items-center gap-2 bg-slate-50 border border-slate-100 text-slate-300 px-4 py-2 rounded text-[10px] font-black uppercase tracking-[0.2em] cursor-not-allowed"
                                >
                                    <Lock className="size-3.5 opacity-50" />
                                    Direct Mail Center
                                </button>
                                <div className="absolute top-full right-0 mt-2 w-56 p-2.5 bg-slate-900 text-white text-[9px] font-bold rounded opacity-0 group-hover/lock:opacity-100 transition-opacity pointer-events-none text-center shadow-2xl z-50">
                                    Premium feature: Direct Mail Center is locked for free tiers.
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsMailOpen(true)}
                                className="flex items-center gap-2 bg-white border border-slate-100 text-slate-400 px-4 py-2 rounded text-[10px] font-black uppercase tracking-[0.2em] shadow-sm hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all active:scale-95 group"
                            >
                                <Mail className="size-3.5 group-hover:scale-110 transition-transform" />
                                Direct Mail Center
                            </button>
                        )}
                    </div>
                </div>

                <main className="flex-1 flex flex-col relative bg-[#fafafa]">
                    <AnimatePresence mode="wait" initial={false}>
                        {viewMode === 'flipbook' && (tier === 'pro' || tier === 'enterprise') ? (
                            <motion.div
                                key={`flipbook-${filterStatus}`}
                                initial={{ opacity: 0, scale: 0.99 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.99 }}
                                transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
                                className="w-full h-full flex items-center justify-center p-6 lg:p-12 overflow-hidden"
                            >
                                <FlipbookViewer ref={bookRef} applicants={filteredApplicants} job={job} tier={tier} onUpdateStatus={handleUpdateStatus} />
                            </motion.div>
                        ) : (
                            <motion.div
                                key={`pdfFeed-${filterStatus}`}
                                initial={{ opacity: 0, scale: 0.99 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.99 }}
                                transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
                                className="w-full h-full p-4 lg:p-12 overflow-y-auto"
                            >
                                <div className="max-w-4xl mx-auto space-y-24 pb-40">
                                    <div className="flex flex-col items-center mb-16 space-y-4">
                                        <div className="h-px w-20 bg-slate-200" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Candidate Pipeline Feed</p>
                                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Reviewing {filteredApplicants.length} Candidates</h2>
                                    </div>

                                    {filteredApplicants.map(app => (
                                        <MatrixApplicantCard
                                            key={app.id}
                                            app={app}
                                            links={extractLinks(app.ai_summary)}
                                            tier={tier}
                                            job={job!}
                                            onUpdateStatus={handleUpdateStatus}
                                            onEmail={(email, name) => {
                                                setSelectedEmails([email]);
                                                setMailSubject(`Regarding your application for ${job?.title} at ${job?.company_name}`);
                                                setMailBody(`Hi ${name},\n\nWe are reviewing your profile and would like to discuss next steps.\n\nBest Regards,\n${job?.company_name} Recruitment Squad`);
                                                setIsMailOpen(true);
                                            }}
                                            NativePDFViewer={NativePDFViewer}
                                        />
                                    ))}

                                    {filteredApplicants.length === 0 && (
                                        <div className="py-40 text-center flex flex-col items-center gap-6">
                                            <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                                                <Users className="size-6 text-slate-200" />
                                            </div>
                                            <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em]">No dossiers in current filtered pipeline</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>

            <AnimatePresence>
                {isMailOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6" data-lenis-prevent="true">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                            onClick={() => !sendingMail && setIsMailOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                            className="relative z-10 bg-white rounded w-full max-w-4xl max-h-[85vh] min-h-[550px] shadow-2xl border border-slate-100 flex overflow-hidden"
                        >
                            {/* Left Side: Recipients */}
                            <div className="w-64 border-r border-slate-100 bg-slate-50/50 flex flex-col shrink-0 overflow-hidden">
                                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 inline-flex flex-col gap-3">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Filter By Status</h3>
                                    <div className="flex flex-col gap-1.5">
                                        <button 
                                            onClick={() => setMailFilterStatus('all')}
                                            className={`text-[10px] font-bold rounded px-3 py-2 w-full text-left flex justify-between transition-colors shadow-sm border ${mailFilterStatus === 'all' ? 'bg-slate-900 text-white border-slate-900' : 'text-slate-600 bg-white border-slate-200 hover:border-slate-300 hover:text-slate-900'}`}
                                        >
                                            <span>All Candidates</span>
                                            <span className={mailFilterStatus === 'all' ? 'text-slate-400' : 'text-slate-400'}>{applicants.length}</span>
                                        </button>
                                        <button 
                                            onClick={() => setMailFilterStatus('accepted')}
                                            className={`text-[10px] font-bold rounded px-3 py-2 w-full text-left flex justify-between transition-colors shadow-sm border ${mailFilterStatus === 'accepted' ? 'bg-slate-900 text-white border-slate-900' : 'text-slate-600 bg-white border-slate-200 hover:border-slate-300 hover:text-slate-900'}`}
                                        >
                                            <span>Accepted</span>
                                            <span className={mailFilterStatus === 'accepted' ? 'text-slate-400' : 'text-slate-400'}>{applicants.filter(a => a.status === 'accepted').length}</span>
                                        </button>
                                        <button 
                                            onClick={() => setMailFilterStatus('rejected')}
                                            className={`text-[10px] font-bold rounded px-3 py-2 w-full text-left flex justify-between transition-colors shadow-sm border ${mailFilterStatus === 'rejected' ? 'bg-slate-900 text-white border-slate-900' : 'text-slate-600 bg-white border-slate-200 hover:border-slate-300 hover:text-slate-900'}`}
                                        >
                                            <span>Rejected</span>
                                            <span className={mailFilterStatus === 'rejected' ? 'text-slate-400' : 'text-slate-400'}>{applicants.filter(a => a.status === 'rejected').length}</span>
                                        </button>
                                        <button 
                                            onClick={() => setMailFilterStatus('pending')}
                                            className={`text-[10px] font-bold rounded px-3 py-2 w-full text-left flex justify-between transition-colors shadow-sm border ${mailFilterStatus === 'pending' ? 'bg-slate-900 text-white border-slate-900' : 'text-slate-600 bg-white border-slate-200 hover:border-slate-300 hover:text-slate-900'}`}
                                        >
                                            <span>Pending</span>
                                            <span className={mailFilterStatus === 'pending' ? 'text-slate-400' : 'text-slate-400'}>{applicants.filter(a => (a.status || 'pending') === 'pending').length}</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-1.5 custom-scrollbar">
                                    {applicants.filter(a => mailFilterStatus === 'all' || (a.status || 'pending') === mailFilterStatus).length > 0 && (
                                         <button 
                                            onClick={() => {
                                                const visibleEmails = applicants.filter(a => mailFilterStatus === 'all' || (a.status || 'pending') === mailFilterStatus).map(a => a.email);
                                                const allSelected = visibleEmails.every(e => selectedEmails.includes(e));
                                                if (allSelected) {
                                                    setSelectedEmails(prev => prev.filter(e => !visibleEmails.includes(e)));
                                                } else {
                                                    setSelectedEmails(prev => Array.from(new Set([...prev, ...visibleEmails])));
                                                }
                                            }} 
                                            className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 w-full text-left pb-3 mb-2 border-b border-slate-200 transition-colors"
                                         >
                                             {applicants.filter(a => mailFilterStatus === 'all' || (a.status || 'pending') === mailFilterStatus).every(a => selectedEmails.includes(a.email)) ? 'Deselect All In View' : 'Select All In View'}
                                         </button>
                                    )}
                                    {applicants.filter(a => mailFilterStatus === 'all' || (a.status || 'pending') === mailFilterStatus).map(app => {
                                         const isSelected = selectedEmails.includes(app.email);
                                         return (
                                            <button 
                                                key={app.id}
                                                onClick={() => toggleEmailSelect(app.email)}
                                                className={`px-3 py-2 text-left rounded transition-all flex items-center justify-between group border ${isSelected ? 'bg-slate-900 border-slate-900 text-white shadow-sm' : 'bg-white border-slate-100 hover:border-slate-300 text-slate-600'}`}
                                            >
                                                <div className="flex flex-col min-w-0 pr-2">
                                                    <span className="text-[11px] font-bold truncate">{app.name}</span>
                                                    <span className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>{app.status || 'pending'}</span>
                                                </div>
                                                {isSelected && <Check className="size-3.5 shrink-0 text-emerald-400" />}
                                            </button>
                                         );
                                    })}
                                </div>
                            </div>

                            {/* Right Side: Content */}
                            <div className="flex-1 flex flex-col min-w-0 bg-white">
                                {/* Header */}
                                <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 bg-white shrink-0">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 bg-slate-50 border border-slate-100 rounded flex items-center justify-center text-slate-900 shrink-0">
                                            <Mail className="size-4" />
                                        </div>
                                        <div>
                                            <h2 className="text-sm font-bold tracking-tight text-slate-900 uppercase">Direct Mail Center</h2>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Compose Pipeline Dispatch</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => !sendingMail && setIsMailOpen(false)}
                                        className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 border border-transparent hover:border-slate-100 rounded transition-all"
                                    >
                                        <X className="size-5" />
                                    </button>
                                </div>

                                {/* To Line */}
                                <div className="px-6 py-3 border-b border-slate-100 flex items-start gap-4 bg-slate-50/30 shrink-0 max-h-24 overflow-y-auto custom-scrollbar">
                                    <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-1">Dispatch To:</span>
                                    <div className="flex-1 flex flex-wrap gap-1.5 items-center">
                                        {selectedEmails.length === 0 ? (
                                            <span className="text-[11px] font-medium text-slate-400 mt-0.5">No recipients selected</span>
                                        ) : (
                                            selectedEmails.map(email => (
                                                <div key={email} className="bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-medium px-2 py-1 rounded inline-flex items-center gap-1.5">
                                                    {email}
                                                    <button onClick={() => toggleEmailSelect(email)} className="text-slate-400 hover:text-slate-900 transition-colors">
                                                        <X className="size-2.5" />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                            {/* Template Line */}
                            <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/40 shrink-0">
                                <span className="text-[10px] uppercase tracking-widest font-black text-slate-400">Template:</span>
                                <div className="flex items-center gap-1">
                                    {[
                                        { id: 'custom', label: 'Blank', color: '' },
                                        { id: 'virtual', label: 'Virtual', color: 'emerald' },
                                        { id: 'onsite', label: 'On-Site', color: 'indigo' },
                                        { id: 'rejection', label: 'Rejection', color: 'red' }
                                    ].map(t => (
                                        <button
                                            key={t.id}
                                            onClick={() => setSelectedTemplate(t.id as any)}
                                            className={`text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-sm font-black transition-all ${selectedTemplate === t.id ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-700 hover:bg-white hover:border-slate-200 border border-transparent'}`}
                                        >
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Subject & Body */}
                            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
                                {/* Subject */}
                                <div className="px-6 pt-5 pb-3 border-b border-slate-50 shrink-0">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-300 block mb-1.5">Subject</label>
                                    <input
                                        type="text"
                                        value={mailSubject}
                                        onChange={(e) => setMailSubject(e.target.value)}
                                        placeholder="Email subject line..."
                                        className="w-full text-sm font-semibold text-slate-900 placeholder:text-slate-300 outline-none bg-transparent"
                                    />
                                </div>

                                {/* Token bar */}
                                <div className="px-6 py-2 border-b border-slate-50 flex items-center gap-2 flex-wrap shrink-0 bg-slate-50/30">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 mr-1">Insert:</span>
                                    {[
                                        { token: '{{NAME}}', label: 'Name' },
                                        { token: '{{COMPANY}}', label: 'Company' },
                                        { token: '{{ROLE}}', label: 'Role' },
                                        { token: '{{REASONS}}', label: 'Reasons' },
                                    ].map(({ token, label }) => (
                                        <button
                                            key={token}
                                            onClick={() => handleInsertToken(token)}
                                            className="text-[9px] font-black tracking-wider uppercase text-slate-400 hover:text-slate-900 bg-white border border-slate-100 hover:border-slate-300 px-2 py-1 rounded transition-all"
                                        >
                                            + {label}
                                        </button>
                                    ))}
                                </div>

                                {/* Body */}
                                <div className="px-6 py-4 flex-1 flex flex-col">
                                    <textarea
                                        value={mailBody}
                                        onChange={(e) => setMailBody(e.target.value)}
                                        placeholder="Write your message here..."
                                        className="w-full flex-1 min-h-[160px] resize-none text-[13px] text-slate-700 placeholder:text-slate-300 outline-none leading-relaxed bg-transparent custom-scrollbar"
                                    />
                                </div>

                                {/* Append Logistics Toggle */}
                                <div className="px-6 pb-5 border-t border-slate-100 pt-4 shrink-0">
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5 uppercase tracking-wider">
                                            <Calendar className="size-3.5 text-slate-400" /> Append Logistics
                                        </label>
                                        <button
                                            onClick={() => setIsInviteActive(!isInviteActive)}
                                            className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${isInviteActive ? 'bg-slate-900' : 'bg-slate-200'}`}
                                        >
                                            <div className={`absolute top-0.5 bottom-0.5 bg-white rounded-full size-4 transition-all shadow-sm ${isInviteActive ? 'right-0.5' : 'left-0.5'}`} />
                                        </button>
                                    </div>
                                    <AnimatePresence>
                                        {isInviteActive && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="bg-slate-50 rounded-sm border border-slate-100 p-4 space-y-3">
                                                    {/* Protocol */}
                                                    <div className="space-y-1.5">
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Protocol</label>
                                                        <select
                                                            value={inviteMode}
                                                            onChange={(e) => setInviteMode(e.target.value as 'virtual' | 'on-site')}
                                                            className="w-full text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-sm px-3 py-2 outline-none focus:border-slate-400 transition-all"
                                                        >
                                                            <option value="virtual">Virtual (Meet)</option>
                                                            <option value="on-site">On-Site</option>
                                                        </select>
                                                    </div>
                                                    {/* Start + End Time */}
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="space-y-1.5">
                                                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Start Time</label>
                                                            <input
                                                                type="datetime-local"
                                                                value={inviteTime}
                                                                onChange={(e) => setInviteTime(e.target.value)}
                                                                className="w-full text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-sm px-3 py-2 outline-none focus:border-slate-400 transition-all"
                                                            />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">End Time</label>
                                                            <input
                                                                type="datetime-local"
                                                                value={inviteEndTime}
                                                                onChange={(e) => setInviteEndTime(e.target.value)}
                                                                min={inviteTime}
                                                                className="w-full text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-sm px-3 py-2 outline-none focus:border-slate-400 transition-all"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-1.5 text-[10px] text-slate-400 leading-snug">
                                                        <Info className="size-3 shrink-0 mt-0.5" />
                                                        <span>Using {inviteMode === 'virtual' ? 'Meet link' : 'office location'} saved in your Dashboard settings.</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                            
                            {/* Footer */}
                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between mt-auto">
                                {mailSentSuccess ? (
                                    <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1.5 uppercase tracking-widest">
                                        <CheckCircle2 className="size-4" /> Dispatched
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                        {selectedEmails.length} recipient(s) selected
                                    </span>
                                )}
                                <button
                                    onClick={handleSendBulkMail}
                                    disabled={selectedEmails.length === 0 || (!mailSubject && selectedTemplate === 'custom') || sendingMail}
                                    className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-6 py-2.5 rounded flex items-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50 disabled:bg-slate-400 shadow-sm"
                                >
                                    {sendingMail ? <Loader2 className="size-3 animate-spin" /> : <Send className="size-3" />}
                                    Dispatch
                                </button>
                            </div>
                        </div>
                    </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* AI Intelligence Panel - Modal Style */}
            <AnimatePresence>
                {isChatOpen && (
                    <div
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-12"
                        data-lenis-prevent="true"
                    >
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl"
                            onClick={() => setIsChatOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 30, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, scale: 0.95, y: 30, filter: 'blur(10px)' }}
                            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            className="relative bg-white rounded-lg border border-slate-100 w-full max-w-5xl h-full max-h-[85vh] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden"
                            data-lenis-prevent
                        >
                            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white relative z-10 shrink-0">
                                <div className="flex items-center gap-4">
                                    <div className="size-12 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-xl shadow-slate-900/10">
                                        <Sparkles className="size-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold tracking-tight text-slate-900 leading-none">Recruiter Intelligence</h2>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2.5 flex items-center gap-2">
                                            <span className="size-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                            Professional Advisory Mode
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full text-slate-400 text-[9px] font-black uppercase tracking-widest">
                                        <ShieldCheck className="size-3" />
                                        Secure Pipeline
                                    </div>
                                    <button
                                        onClick={() => setIsChatOpen(false)}
                                        className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all"
                                    >
                                        <X className="size-6" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 overflow-hidden bg-white">
                                <AIChatPanel jobId={jobId} applicants={applicants} />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
