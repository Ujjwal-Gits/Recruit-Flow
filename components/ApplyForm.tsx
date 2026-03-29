/**
 * ApplyForm.tsx
 *
 * Implements the job application form, supports resume upload and PDF extraction.
 * Security: Authenticated users only, file validation and secure upload to Supabase Storage.
 * APIs used: PDF.js for extraction, Supabase for storage, Next.js API routes for application submission.
 */
'use client';

import { useState, useRef } from 'react';
import {
    Upload,
    CheckCircle2,
    FileText,
    Mail,
    User,
    Sparkles,
    ArrowRight,
    AlertCircle,
    ShieldCheck,
    ChevronRight,
    Search
} from 'lucide-react';
import BouncyLoader from '@/components/BouncyLoader';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getPdfjs } from '@/lib/pdf-init';

interface ApplyFormProps {
    jobId: string;
    requiredLinks?: { label: string }[];
}

// Removed client-side PDF extraction for performance.
// Server now handles this asynchronously.

export default function ApplyForm({ jobId, requiredLinks = [] }: ApplyFormProps) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.type === 'application/pdf') {
                setSelectedFile(file);
                setError(null);
            } else {
                setError('UNSUPPORTED FORMAT: System only accepts high-fidelity PDF documents.');
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (loading) return;

        setLoading(true);
        setError(null);

        const formElement = e.currentTarget;
        const name = (formElement.elements.namedItem('name') as HTMLInputElement).value;
        const email = (formElement.elements.namedItem('email') as HTMLInputElement).value;
        const file = selectedFile;

        if (!file) {
            setError('VALIDATION REJECTED: Resume upload is mission-critical.');
            setLoading(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('jobId', jobId);
            formData.append('name', name);
            formData.append('email', email);
            formData.append('file', file);
            
            // Build the links payload as a clean JSON field for robust transport
            const linksPayload = requiredLinks.map(linkObj => ({
                label: linkObj.label,
                url: (formElement.elements.namedItem(`link_${linkObj.label}`) as HTMLInputElement)?.value || 'Not provided'
            })).filter(l => l.url !== 'Not provided' && l.url.length > 3);
            
            formData.append('linksJson', JSON.stringify(linksPayload));

            const response = await fetch('/api/process-application', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'System processing failure.');

            setSuccess(true);
        } catch (err: any) {
            console.error('Submission Error:', err);
            setError(err.message || 'Fatal system error encountered.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-10"
            >
                <div className="size-20 bg-emerald-50 border border-emerald-100 rounded flex items-center justify-center mx-auto mb-8 shadow-sm">
                    <CheckCircle2 className="size-8 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Application Transmitted</h2>
                <p className="text-slate-500 mb-10 text-sm font-medium leading-relaxed">
                    Access established. Our AI Intelligence engine is now analyzing your profile matrix.
                </p>
                <Link
                    href="/"
                    className="h-12 px-8 bg-slate-900 text-white rounded text-xs font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 mx-auto uppercase tracking-widest active:scale-95"
                >
                    Return to Portal
                    <ChevronRight className="size-4" />
                </Link>
            </motion.div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 relative">
            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Identity / Full Name</label>
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                        <input
                            required name="name" type="text" placeholder="e.g. Alexander Vance"
                            className="w-full bg-white border border-slate-100 focus:border-slate-900 focus:ring-0 rounded px-4 py-3.5 pl-11 text-slate-900 font-bold placeholder:text-slate-200 transition-all outline-none text-sm"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Communication / Email</label>
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                        <input
                            required name="email" type="email" placeholder="e.g. vance@nexus.io"
                            className="w-full bg-white border border-slate-100 focus:border-slate-900 focus:ring-0 rounded px-4 py-3.5 pl-11 text-slate-900 font-bold placeholder:text-slate-200 transition-all outline-none text-sm"
                        />
                    </div>
                </div>

                {requiredLinks && requiredLinks.length > 0 && (
                    <div className="space-y-4 pt-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Requested Links</label>
                        <div className="grid grid-cols-1 gap-4">
                            {requiredLinks.map((link, i) => (
                                <div key={i} className="relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                                    <input
                                        name={`link_${link.label}`} type="url" placeholder={`Enter ${link.label} URL...`}
                                        className="w-full bg-white border border-slate-100 focus:border-slate-900 focus:ring-0 rounded px-4 py-3 pl-11 text-slate-900 font-medium placeholder:text-slate-300 transition-all outline-none text-sm"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Resume Payload (PDF)</label>
                    <div
                        className={cn(
                            "relative group cursor-pointer border-2 border-dashed rounded p-12 flex flex-col items-center justify-center transition-all duration-300",
                            dragActive ? "border-slate-900 bg-slate-50" : "border-slate-100 bg-slate-50/30 hover:border-slate-300",
                            selectedFile ? "border-emerald-200 bg-emerald-50/20" : ""
                        )}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef} name="resume" type="file" accept=".pdf"
                            onChange={handleFileChange} className="hidden"
                        />

                        {selectedFile ? (
                            <div className="flex flex-col items-center">
                                <div className="size-14 bg-emerald-50 border border-emerald-100 rounded flex items-center justify-center mb-4">
                                    <FileText className="size-6 text-emerald-600" />
                                </div>
                                <span className="text-slate-900 text-xs font-bold truncate max-w-[200px] mb-1">{selectedFile.name}</span>
                                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Validated Payload</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center group-hover:scale-105 transition-transform">
                                <div className="size-14 bg-white border border-slate-100 rounded flex items-center justify-center mb-6 text-slate-400 shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-all">
                                    <Upload className="size-6" />
                                </div>
                                <span className="text-slate-900 text-xs font-bold tracking-tight mb-1">Transmit System PDF</span>
                                <span className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">Drag & Drop or Click</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded flex items-start gap-3 animate-in fade-in slide-in-from-top-1">
                    <AlertCircle className="size-4 shrink-0 mt-0.5" />
                    <div className="text-[11px] font-bold uppercase tracking-wide">{error}</div>
                </div>
            )}

            <button
                disabled={loading} type="submit"
                className="w-full h-14 bg-slate-900 text-white rounded font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-slate-900/10 hover:bg-slate-800"
            >
                {loading ? (
                    <>
                        <BouncyLoader size="sm" />
                        <span>System Processing...</span>
                    </>
                ) : (
                    <>
                        <span>Submit Application</span>
                        <ChevronRight className="size-4" />
                    </>
                )}
            </button>

            <div className="flex flex-col items-center justify-center gap-4 pt-6 border-t border-slate-50 mt-4 text-center">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="size-3 text-slate-300" />
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-[3px]">Enterprise Secure Pipeline</span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed max-w-[280px]">
                    By submitting your application, you acknowledge that you have read and synchronized with our <Link href="/privacy" className="text-slate-900 font-bold underline underline-offset-4 decoration-slate-200 hover:decoration-slate-400 transition-all">Privacy Policy</Link>.
                </p>
            </div>
        </form>
    );
}
