/**
 * FlipbookViewer.tsx
 *
 * Renders resume flipbooks for candidate review, supports PDF rendering and navigation.
 * Security: Authenticated users only, no file uploads.
 * APIs used: PDF.js for rendering, Supabase for fetching resume URLs.
 */
'use client';

import React, { useEffect, useRef, useState, forwardRef, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowLeft, ArrowRight, Star, Users, Brain, ShieldCheck, Briefcase, Zap, ChevronRight, FileText, CheckCircle2, Mail, Link2, Linkedin, Github, Globe, ExternalLink, Upload } from 'lucide-react';
import { getPdfjs } from '@/lib/pdf-init';

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

interface Job {
    id: string;
    title: string;
    company_name: string;
    description: string;
}

const ResumePage = memo(({ url }: { url: string }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let cancelled = false;
        let renderTask: any = null;

        async function renderPdf() {
            try {
                const pdfjsLib = await getPdfjs();

                // Let PDF.js handle the downloading and byte-streaming natively for max stability
                const pdf = await pdfjsLib.getDocument({
                    url,
                    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
                    cMapPacked: true,
                }).promise;

                const page = await pdf.getPage(1);

                if (cancelled) return;

                // Render at a much higher resolution internally (2.5x) for crisp typography
                // The CSS 'w-full h-full' will visually scale it down to fit perfectly
                const viewport = page.getViewport({ scale: 2.5 });
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
                if (!cancelled) {
                    setError(true);
                    setLoading(false);
                }
            }
        }

        renderPdf();
        return () => {
            cancelled = true;
            renderTask?.cancel?.();
        };
    }, [url]);

    return (
        <div className="bg-white h-full flex flex-col items-center justify-center p-0 border-l border-slate-50 relative overflow-hidden">
            {loading && !error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10 gap-2 pointer-events-none">
                    <Loader2 className="animate-spin text-slate-300 w-5 h-5" />
                    <span className="text-[9px] text-slate-300 font-bold uppercase tracking-[0.25em]">Loading Resume</span>
                </div>
            )}
            {error && (
                <div className="text-center p-8 flex flex-col items-center gap-4">
                    <p className="font-bold text-xs uppercase tracking-widest text-slate-300">Unable to Render</p>
                    <a href={url} target="_blank" rel="noopener noreferrer"
                        className="text-slate-900 text-[10px] font-bold border border-slate-100 px-4 py-2 hover:bg-slate-50 transition-all rounded">
                        Open PDF ↗
                    </a>
                </div>
            )}
            <canvas
                ref={canvasRef}
                className={`w-full h-full object-contain object-top transition-opacity duration-300 ${loading || error ? 'opacity-0' : 'opacity-100'}`}
                style={{ display: error ? 'none' : 'block' }}
            />
            <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/[0.03] to-transparent pointer-events-none" />
        </div>
    );
});

ResumePage.displayName = 'ResumePage';


const InfoPage = memo(({ applicant, tier, onUpdateStatus }: { applicant: Applicant, tier: 'free' | 'pro' | 'enterprise', onUpdateStatus?: (id: string, s: 'pending' | 'accepted' | 'rejected', r: string[], c: string) => void }) => {
    const [status, setStatus] = useState<'pending' | 'accepting' | 'rejecting' | 'accepted' | 'rejected'>(applicant.status || 'pending');
    const [selectedReasons, setSelectedReasons] = useState<string[]>(applicant.reasons || []);
    const [customReason, setCustomReason] = useState(applicant.custom_reason || "");

    const NativeBlocker = ({ children, className }: { children: React.ReactNode, className?: string }) => {
        const ref = useRef<HTMLDivElement>(null);
        useEffect(() => {
            const el = ref.current;
            if (!el) return;
            const stop = (e: Event) => e.stopPropagation();
            el.addEventListener('mousedown', stop, { capture: true });
            el.addEventListener('pointerdown', stop, { capture: true });
            el.addEventListener('touchstart', stop, { capture: true });
            el.addEventListener('mousemove', stop, { capture: true });
            el.addEventListener('touchmove', stop, { capture: true });
            // We do NOT stop 'click' propagation here, because React's synthetic event 
            // system needs the click to bubble to the root. If we stop it here in the 
            // capture phase, onClick handlers on buttons will never fire.
            return () => {
                el.removeEventListener('mousedown', stop, { capture: true });
                el.removeEventListener('pointerdown', stop, { capture: true });
                el.removeEventListener('touchstart', stop, { capture: true });
                el.removeEventListener('mousemove', stop, { capture: true });
                el.removeEventListener('touchmove', stop, { capture: true });
            };
        }, []);
        return <div ref={ref} className={className}>{children}</div>;
    };

    const parseLinks = (text?: string) => {
        if (!text) return { textWithoutLinks: '', extractedLinks: [] };
        
        // Strategy: Strictly from Explicit Marker (Form Entries Only)
        // Using a case-insensitive search for maximum reliability
        const marker = '--- PROVIDED CANDIDATE LINKS ---';
        const lowerText = text.toLowerCase();
        const markerIdx = lowerText.indexOf(marker.toLowerCase());
        
        const extractedLinks: any[] = [];
        let textWithoutLinks = text;

        if (markerIdx !== -1) {
            textWithoutLinks = text.substring(0, markerIdx).trim();
            const linksPart = text.substring(markerIdx + marker.length);
            const lines = linksPart.split('\n').filter(l => l.includes(':'));
            for (const l of lines) {
                const splitIdx = l.indexOf(':');
                const label = l.substring(0, splitIdx).trim();
                const url = l.substring(splitIdx + 1).trim();
                if (url && url !== 'Not provided' && url.length > 3) {
                    extractedLinks.push({ label, url });
                }
            }
        }

        return { textWithoutLinks, extractedLinks };
    };

    const { textWithoutLinks, extractedLinks } = parseLinks(applicant.ai_summary);

    const bullets = textWithoutLinks
        .split('\n')
        .map(s => s.replace(/^[•\-\*]\s*/, '').trim())
        .filter(s => s.length > 10);

    if (bullets.length === 0) {
        bullets.push(textWithoutLinks || "No intelligence context provided.");
    }

    const toggleReason = (reason: string) => {
        setSelectedReasons(prev => prev.includes(reason) ? prev.filter(r => r !== reason) : [...prev, reason]);
    };

    const confirmAction = () => {
        let finalStatus: 'accepted' | 'rejected' | 'pending' = 'pending';
        if (status === 'accepting') finalStatus = 'accepted';
        if (status === 'rejecting') finalStatus = 'rejected';
        setStatus(finalStatus);
        if (onUpdateStatus) onUpdateStatus(applicant.id, finalStatus, selectedReasons, customReason);
    };

    const resetAction = () => {
        setStatus('pending');
        setSelectedReasons([]);
        setCustomReason("");
        if (onUpdateStatus) onUpdateStatus(applicant.id, 'pending', [], "");
    };

    const getPrimaryAcceptClass = () => {
        if (status === 'accepted') return 'bg-emerald-500 border-emerald-500 text-white flex items-center justify-center gap-2 hover:bg-emerald-600';
        return 'bg-slate-900 border-slate-900 text-white hover:bg-slate-800';
    };

    const getPrimaryRejectClass = () => {
        if (status === 'rejected') return 'border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-600';
        return 'border-slate-100 text-slate-500 hover:border-slate-900 hover:text-slate-900';
    };

    return (
        <div className="bg-white h-full p-16 flex flex-col border-r border-slate-50 relative">
            <div className="flex-1 flex flex-col">
                <div className="mb-6 flex items-start justify-between gap-4 border-b border-slate-100 pb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight leading-none mb-1.5 uppercase">{applicant.name}</h2>
                        <div className="flex flex-col gap-1.5 mt-2">
                            <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5">
                                <Mail className="size-3" /> {applicant.email}
                            </p>
                            {extractedLinks.length > 0 && (
                                <NativeBlocker className="flex flex-wrap items-center gap-2 mt-4">
                                    {extractedLinks.map((link, idx) => {
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
                                </NativeBlocker>
                            )}
                        </div>
                    </div>
                    <div className="text-right shrink-0">
                        <p className="text-[7px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">ATS Match</p>
                        <p className="text-4xl font-black text-slate-900 leading-none">{applicant.ats_score}%</p>
                    </div>
                </div>

                <div className="mb-8 flex-1">
                    <p className="text-[9px] font-black text-slate-900 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                        <Brain className="size-3 text-emerald-500" /> Intelligence Overview
                    </p>
                    <ul className="space-y-3">
                        {!(tier === 'pro' || tier === 'enterprise') ? (
                            <div className="py-2 animate-in fade-in duration-500">
                                <p className="text-[11px] font-medium text-slate-500 leading-relaxed italic">
                                    Ai Overview is not Available for Free Tier users. Want to Upgrade your plan? <a href="/#pricing" className="text-slate-900 font-bold underline underline-offset-4 decoration-slate-900/20 hover:decoration-slate-900 transition-all">See Plans...</a>
                                </p>
                            </div>
                        ) : (
                            textWithoutLinks.split('\n').filter(Boolean).map((para, idx) => (
                                <li key={idx} className="text-xs font-semibold text-slate-600 leading-relaxed pl-4 relative">
                                    <span className="absolute left-0 top-1.5 size-1 bg-slate-900 rounded-sm" />
                                    {para.replace(/^[•\-\*]\s*/, '').trim()}
                                </li>
                            ))
                        )}
                    </ul>

                </div>
            </div>

            <NativeBlocker className="mt-auto">
                {(status === 'pending' || status === 'accepted' || status === 'rejected') ? (
                    <div className="flex gap-4">
                        <button onClick={() => { setSelectedReasons([]); setCustomReason(""); setStatus('accepting'); }} className={`flex-1 border font-black uppercase tracking-[0.2em] text-[10px] py-4 rounded transition-colors ${getPrimaryAcceptClass()}`}>
                            {status === 'accepted' ? <><CheckCircle2 className="size-4" /> Accepted</> : 'Accept'}
                        </button>
                        <button onClick={() => { setSelectedReasons([]); setCustomReason(""); setStatus('rejecting'); }} className={`flex-1 border font-black uppercase tracking-[0.2em] text-[10px] py-4 rounded transition-colors ${getPrimaryRejectClass()}`}>
                            {status === 'rejected' ? 'Rejected' : 'Reject'}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{status === 'accepting' ? 'Success Indicators' : 'Rejection Reasons'}</p>
                            <button onClick={resetAction} className="text-[9px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900">Cancel</button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {(status === 'accepting'
                                ? ['Strong Skills', 'Relevant Exp', 'Role Match', 'Great Portfolio', 'Quick Starter', 'Culture Match']
                                : ['Skills Mismatch', 'Low Experience', 'Role Filled', 'Location Diff', 'Exp Mismatch', 'Other Path']
                            ).map(reason => {
                                const isSel = selectedReasons.includes(reason);
                                return (
                                    <button key={reason} onClick={() => toggleReason(reason)} className={`text-left px-3 py-2 text-[9px] font-bold border rounded transition-colors uppercase tracking-widest ${isSel ? (status === 'accepting' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-red-50 border-red-500 text-red-700') : 'text-slate-500 border-slate-100 hover:border-slate-900 hover:text-slate-900'}`}>
                                        {reason}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="pt-2 space-y-3">
                            <input value={customReason} onChange={(e) => setCustomReason(e.target.value)} placeholder="Other Detail" className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded text-xs font-medium text-slate-900 outline-none focus:border-slate-900 transition-colors" />
                            <button onClick={confirmAction} className={`w-full py-3 rounded text-[10px] font-black uppercase tracking-[0.2em] text-white transition-colors ${status === 'accepting' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}`}>
                                Confirm {status === 'accepting' ? 'Acceptance' : 'Rejection'}
                            </button>
                        </div>
                    </div>
                )}
            </NativeBlocker>

            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center text-slate-200 text-[9px] font-black tracking-[0.5em] uppercase">
                <span>Ref: RF-{applicant.id.slice(0, 6)}</span>
            </div>
            {/* Spine Shadow */}
            <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-black/[0.04] to-transparent pointer-events-none" />
        </div>
    );
});

InfoPage.displayName = 'InfoPage';

const PageWrapper = forwardRef<HTMLDivElement, { children: React.ReactNode }>(
    ({ children }, ref) => (
        <div ref={ref} className="page shadow-none">
            {children}
        </div>
    )
);
PageWrapper.displayName = 'PageWrapper';

const CoverPage = forwardRef<HTMLDivElement, { job: any, isBack?: boolean, onFlip?: () => void }>(({ job, isBack, onFlip }, ref) => (
    <div ref={ref} className="page h-full flex flex-col items-center justify-center p-20 relative overflow-hidden text-slate-900 border border-slate-50">
        <div className="absolute inset-0 bg-[#f5f5f5]" />

        {!isBack ? (
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="text-center relative z-10 flex flex-col items-center w-full h-full justify-between"
            >
                <div className="flex flex-col items-center pt-10">
                    <div className="h-20 w-auto mt-24 mb-8">
                        <img src="/recruit-flow-logo.png" alt="Recruit Flow" className="h-full w-auto object-contain" />
                    </div>

                    <div className="w-20 h-1 bg-slate-900 mb-10" />
                    <h1 className="text-5xl font-bold tracking-tighter mb-6 text-slate-900 max-w-sm uppercase leading-[0.9]">
                        {job?.title || 'Executive Search'}
                    </h1>
                    <div className="px-8 py-3 bg-white/40 border border-slate-100/30 rounded shadow-sm mb-8">
                        <p className="text-slate-500 font-black tracking-[0.4em] uppercase text-[12px]">
                            RECRUIT FLOW FLIP BOOK
                        </p>
                    </div>

                    <div className="mt-16 opacity-40">
                        <p className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-400 flex items-center gap-3">
                            CLICK RIGHT EDGE TO BEGIN <ArrowRight className="size-3" />
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-4">
                    <div className="flex flex-col items-center gap-1.5 opacity-30 uppercase tracking-[0.6em] text-[10px] font-black">
                        <span>Restricted Personnel Archive</span>
                        <span>Level III Clearance</span>
                    </div>
                    <div className="h-1 w-32 bg-slate-200 rounded-full mt-4" />
                </div>
            </motion.div>
        ) : (
            <div className="text-center relative z-10 flex flex-col items-center justify-center h-full">
                <p className="text-[12px] font-black uppercase tracking-[0.6em] text-slate-900">End of Session</p>
            </div>
        )}
        {/* Shadow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/[0.02] via-transparent to-white/10 pointer-events-none" />
    </div >
));
CoverPage.displayName = 'CoverPage';

const InsideCover = forwardRef<HTMLDivElement, { children?: React.ReactNode, direction?: 'left' | 'right' }>(({ children, direction }, ref) => (
    <div ref={ref} className={`page bg-white h-full p-20 flex flex-col items-center justify-center relative ${direction === 'left' ? 'border-r border-slate-100' : 'border-l border-slate-100'}`}>
        <div className="absolute inset-0 bg-[#f5f5f5] opacity-60 pointer-events-none" />
        {direction === 'left' && <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black/[0.05] to-transparent pointer-events-none" />}
        {direction === 'right' && <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black/[0.05] to-transparent pointer-events-none" />}

        {children || (
            <div className="flex flex-col items-center text-center">
                <p className="text-[12px] uppercase tracking-[0.2em] font-medium text-slate-400">
                    Thank you for choosing Recruit Flow
                </p>
            </div>
        )}
    </div>
));
InsideCover.displayName = 'InsideCover';

const FlipbookViewer = forwardRef<any, { applicants: Applicant[]; job: any, tier: 'free' | 'pro' | 'enterprise', onUpdateStatus?: (id: string, s: 'pending' | 'accepted' | 'rejected', r: string[], c: string) => void }>(({ applicants, job, tier, onUpdateStatus }, ref) => {
    const bookRef = useRef<any>(null);
    const [HTMLFlipBookComp, setHTMLFlipBookComp] = useState<any>(null);
    const [currentPage, setCurrentPage] = useState(0);

    React.useImperativeHandle(ref, () => ({
        jumpToApplicant: (index: number) => {
            if (bookRef.current) {
                // Page 0: Cover
                // Page 1: App 0 Info
                // Page 2: App 0 Resume
                // Page (2i + 1): App i Info
                bookRef.current.pageFlip().flip(2 * index + 1);
            }
        }
    }));

    const onFlip = (e: any) => {
        setCurrentPage(e.data);
    };

    useEffect(() => {
        import('react-pageflip').then((mod) => {
            setHTMLFlipBookComp(() => mod.default);
        });
    }, []);

    if (!applicants || applicants.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-12 animate-in fade-in duration-500">
                <div className="size-20 bg-slate-50 border border-slate-100 rounded flex items-center justify-center mb-8">
                    <Users className="size-8 text-slate-200" />
                </div>
                <h2 className="text-sm font-black text-slate-900 tracking-[0.3em] uppercase">No Candidates Found</h2>
            </div>
        );
    }

    if (!HTMLFlipBookComp) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-6">
                    <Loader2 className="size-12 animate-spin text-slate-200" />
                    <span className="text-slate-300 font-black uppercase tracking-[0.4em] text-[10px]">Processing Dossier Matrix...</span>
                </div>
            </div>
        );
    }

    const FlipBook = HTMLFlipBookComp;

    // Width of one page is 650px.
    // Page 0 (Cover) is on the right side of the spread.
    // Centering the right side means shifting -325px.
    const containerTransform = currentPage === 0 ? 'translateX(-325px)' : 'translateX(0px)';

    return (
        <div className="relative h-full w-full flex flex-col justify-center items-center">
            <style jsx global>{`
                .flip-book, .stf__parent, .stf__wrapper, .stf__block {
                    background-color: transparent !important;
                    box-shadow: none !important;
                }
                .stf__block.stf__left {
                    border-right: none !important;
                }
                .page {
                    box-shadow: none !important;
                }
            `}</style>

            <motion.div
                className="relative w-full h-full max-w-[1500px] flex items-center justify-center"
                initial={false}
                animate={{
                    transform: containerTransform
                }}
                transition={{
                    duration: 1.2,
                    ease: [0.22, 1, 0.36, 1]
                }}
            >
                <div
                    className="absolute -bottom-20 left-1/2 -translate-x-1/2 h-20 bg-black/[0.1] blur-[100px] rounded-[50%] transition-all duration-[1500ms] ease-[0.22,1,0.36,1]"
                    style={{
                        width: currentPage === 0 ? '45%' : '90%',
                        transform: currentPage === 0 ? 'translateX(325px) translateX(-50%)' : 'translateX(-50%)'
                    }}
                />

                {/* @ts-ignore */}
                <FlipBook
                    width={650}
                    height={850}
                    size="fixed"
                    minWidth={300}
                    maxWidth={1500}
                    minHeight={400}
                    maxHeight={2000}
                    showCover={true}
                    useMouseEvents={true}
                    className="flip-book overflow-visible"
                    ref={bookRef}
                    flippingTime={1000}
                    usePortrait={false}
                    startZIndex={0}
                    autoSize={true}
                    maxShadowOpacity={0.3}
                    showPageCorners={false}
                    onFlip={onFlip}
                >
                    <CoverPage job={job} onFlip={() => bookRef.current?.pageFlip()?.flip(1)} />

                    {/* Page 1 (Left) and Page 2 (Right) Start Immediately after Cover flip */}
                    {/* The goal is to have Info on Left and Resume on Right in the SAME spread. */}
                    {applicants.map((applicant) => [
                        <PageWrapper key={`${applicant.id}-info`}>
                            <InfoPage applicant={applicant} tier={tier} onUpdateStatus={onUpdateStatus} />
                        </PageWrapper>,
                        <PageWrapper key={`${applicant.id}-resume`}>
                            <ResumePage url={applicant.resume_url} />
                        </PageWrapper>
                    ]).flat()}

                    {/* Final Spread logic */}
                    {/* If we have N applicants, pages are 1 to 2N. */}
                    {/* We need a back cover. If 2N is even, the next page (2N+1) is LEFT. */}
                    <InsideCover direction="left" />
                    <CoverPage job={job} isBack={true} />
                </FlipBook>
            </motion.div>
        </div>
    );
});

FlipbookViewer.displayName = 'FlipbookViewer';
export default FlipbookViewer;
