/**
 * DashboardClient.tsx
 *
 * Implements the main user dashboard for job management, candidate CRM, and analytics.
 * Security: Authenticated users only, role-based access for managers and recruiters.
 * APIs used: Supabase (database, storage), Next.js API routes for CRUD operations.
 */
'use client';

import React, { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';

import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Briefcase, Users, PlusCircle, Sparkles, LayoutDashboard,
    X, Copy, Check, ExternalLink, Loader2, BookOpen, ArrowRight,
    Link2, Eye, LogOut, ChevronRight, ChevronLeft, Search, Filter, MoreHorizontal,
    Mail, Calendar, MapPin, Save, Info, UserCog, Phone, Building,
    Upload, ShieldCheck, Lock, Globe, CheckCircle2, MessageSquare, Send,
    Maximize2, Download, QrCode, Image as ImageIcon, AlertCircle, ArrowUpCircle,
    Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import BouncyLoader from '@/components/BouncyLoader';

const CRMSection = dynamic(() => import('./dashboard/CRMSection'), {
    loading: () => <div className="py-20 flex justify-center"><BouncyLoader /></div>
});

const CalendarSection = dynamic(() => import('./dashboard/CalendarSection'), {
    loading: () => <div className="py-20 flex justify-center"><BouncyLoader /></div>
});

const PDFDossierViewer = dynamic(() => import('./PDFDossierViewer'), {
    ssr: false,
    loading: () => <div className="py-10 flex justify-center"><BouncyLoader size="sm" /></div>
});

import { Job, Meeting, CRMCandidate } from '@/types/dashboard';

// --- Shared Custom UI Components for Forms ---
const ModernDropdown = ({ value, options, onChange, label }: { value: string, options: string[], onChange: (v: string) => void, label: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const clickAway = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', clickAway);
        return () => document.removeEventListener('mousedown', clickAway);
    }, []);

    return (
        <div className="space-y-2 relative" ref={containerRef}>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</label>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-slate-50 border border-slate-100 rounded-sm px-4 py-3 text-slate-900 text-sm font-bold flex items-center justify-between hover:bg-white hover:border-slate-900 transition-all"
            >
                {value}
                <MoreHorizontal className={`size-4 text-slate-300 transition-transform ${isOpen ? 'rotate-90 text-slate-900' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute z-[110] left-0 right-0 mt-2 bg-white border border-slate-100 rounded-sm shadow-xl overflow-hidden py-1"
                    >
                        {options.map((opt) => (
                            <button
                                key={opt}
                                type="button"
                                onClick={() => { onChange(opt); setIsOpen(false); }}
                                className={`w-full text-left px-5 py-3 text-xs font-bold transition-all ${value === opt ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                            >
                                {opt}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ModernDateTimePicker = ({ value, onChange, label, dark = false }: { value: string, onChange: (v: string) => void, label: string, dark?: boolean }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
    
    const selected = value ? new Date(value) : null;
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const days = Array.from({ length: 42 }, (_, i) => {
        const d = i - firstDay + 1;
        return d > 0 && d <= daysInMonth ? d : null;
    });

    const hour = selected ? selected.getHours() : 12;
    const minute = selected ? selected.getMinutes() : 0;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;

    const handleDateSelect = (day: number) => {
        const newDate = new Date(year, month, day, hour, minute);
        onChange(newDate.toISOString());
    };

    const handleTimeChange = (h: number, m: number) => {
        const d = selected || new Date();
        const newDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, m);
        onChange(newDate.toISOString());
    };

    useEffect(() => {
        const clickAway = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', clickAway);
        return () => document.removeEventListener('mousedown', clickAway);
    }, []);

    const formatDisplay = () => {
        if (!selected) return 'Select Date & Time';
        return selected.toLocaleString('en-US', { 
            month: 'short', day: 'numeric', year: 'numeric',
            hour: 'numeric', minute: '2-digit', hour12: true 
        });
    };

    return (
        <div className="space-y-2 relative" ref={containerRef}>
            <label className={`text-[10px] font-black uppercase tracking-widest ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</label>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full text-left flex items-center justify-between px-4 py-3 rounded-sm border transition-all ${dark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-100 text-slate-900'} hover:border-slate-900`}
            >
                <span className="text-xs font-bold">{formatDisplay()}</span>
                <Calendar className={`size-4 text-slate-300 transition-colors ${isOpen ? 'text-slate-900' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute z-[150] left-0 mt-2 bg-white border border-slate-100 rounded-sm shadow-2xl flex flex-col md:flex-row divide-x divide-slate-50 overflow-hidden"
                        style={{ width: 'max-content' }}
                    >
                        {/* Calendar Side */}
                        <div className="p-5 w-64">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                                    {new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' })}
                                </span>
                                <div className="flex gap-1">
                                    <button type="button" onClick={() => setViewDate(new Date(year, month - 1))} className="p-1 hover:bg-slate-50 rounded text-slate-400 hover:text-slate-900"><ChevronLeft className="size-3.5" /></button>
                                    <button type="button" onClick={() => setViewDate(new Date(year, month + 1))} className="p-1 hover:bg-slate-50 rounded text-slate-400 hover:text-slate-900"><ChevronRight className="size-3.5" /></button>
                                </div>
                            </div>
                            <div className="grid grid-cols-7 gap-1 mb-2">
                                {['S','M','T','W','T','F','S'].map(d => (
                                    <div key={d} className="text-center text-[8px] font-black text-slate-300 py-1">{d}</div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                                {days.map((d, i) => {
                                    if (!d) return <div key={i} />;
                                    const isSel = selected && selected.getDate() === d && selected.getMonth() === month && selected.getFullYear() === year;
                                    const isToday = new Date().getDate() === d && new Date().getMonth() === month && new Date().getFullYear() === year;
                                    return (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => handleDateSelect(d)}
                                            className={`h-7 rounded-sm text-[10px] font-bold transition-all ${isSel ? 'bg-slate-900 text-white' : isToday ? 'text-slate-900 border border-slate-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                                        >
                                            {d}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Time Side */}
                        <div className="p-5 w-40 bg-slate-50/30 flex flex-col">
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-900 mb-4 px-2">Temporal Phase</div>
                            <div className="flex-1 overflow-y-auto pr-2 space-y-2 max-h-48 scrollbar-hide">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <div className="text-[8px] font-bold text-slate-400 uppercase text-center">HH</div>
                                        <input 
                                            type="number" 
                                            min="1" max="12" 
                                            value={displayHour}
                                            onChange={(e) => {
                                                let h = parseInt(e.target.value);
                                                if (ampm === 'PM' && h < 12) h += 12;
                                                if (ampm === 'AM' && h === 12) h = 0;
                                                handleTimeChange(h, minute);
                                            }}
                                            className="w-full bg-white border border-slate-100 rounded-sm py-2 text-center text-xs font-bold outline-none focus:border-slate-900"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[8px] font-bold text-slate-400 uppercase text-center">MM</div>
                                        <input 
                                            type="number" 
                                            min="0" max="59" 
                                            step="5"
                                            value={minute}
                                            onChange={(e) => handleTimeChange(hour, parseInt(e.target.value))}
                                            className="w-full bg-white border border-slate-100 rounded-sm py-2 text-center text-xs font-bold outline-none focus:border-slate-900"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-1 pt-2">
                                    {['AM', 'PM'].map(p => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => {
                                                let h = hour % 12;
                                                if (p === 'PM') h += 12;
                                                handleTimeChange(h, minute);
                                            }}
                                            className={`flex-1 py-2 rounded-sm text-[9px] font-black transition-all ${ampm === p ? 'bg-slate-900 text-white' : 'bg-white text-slate-400 border border-slate-100'}`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="w-full mt-4 py-2 bg-slate-900 text-white rounded-sm text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};


const ProfileSection = memo(({ user }: { user: any }) => {

    const initialProfile = user?.profile || {};

    const [profile, setProfile] = useState({
        company_name: initialProfile.company_name || '',
        phone_number: initialProfile.phone_number || '',
        logo_url: initialProfile.logo_url || '',
        email: initialProfile.email || user?.email || ''
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showOTP, setShowOTP] = useState(false);
    const [otp, setOtp] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Lock scroll when OTP modal is open
    useEffect(() => {
        if (!mounted) return;
        if (showOTP) {
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
    }, [showOTP, mounted]);

    useEffect(() => {
        if (!user) return;

        const currentProfile = user.profile || {};
        if (Object.keys(currentProfile).length > 0) {
            setProfile({
                company_name: currentProfile.company_name || '',
                phone_number: currentProfile.phone_number || '',
                logo_url: currentProfile.logo_url || '',
                email: currentProfile.email || user.email || ''
            });
            return;
        }

        // Only fetch if explicitly missing
        const loadProfile = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/profile');
                const data = await res.json();
                if (data.profile) {
                    setProfile({
                        company_name: data.profile.company_name || '',
                        phone_number: data.profile.phone_number || '',
                        logo_url: data.profile.logo_url || '',
                        email: data.profile.email || user.email || ''
                    });
                }
            } catch (err) {
                console.error('Failed to sync system identity:', err);
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [user.id, user.profile]); 

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSaving(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Math.random()}.${fileExt}`;
            const { data, error } = await supabase.storage
                .from('resumes')
                .upload(`logos/${fileName}`, file);

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('resumes')
                .getPublicUrl(`logos/${fileName}`);

            setProfile(prev => ({ ...prev, logo_url: publicUrl }));
            setMessage({ type: 'success', text: 'Operational asset (logo) synchronized.' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setSaving(false);
        }
    };

    const requestOTP = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'send-otp',
                    email: profile.email
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setShowOTP(true);
            // Auto-fill OTP for test/seed accounts
            if (data.testBypass && data.code) {
                setOtp(data.code);
            }
            setMessage({ type: 'success', text: 'Terminal verification dispatched.' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setSaving(false);
        }
    };

    const handleSave = async () => {
        setVerifying(true);
        try {
            const res = await fetch('/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'verify-and-save',
                    userId: user.id,
                    otp,
                    email: profile.email,
                    companyName: profile.company_name,
                    phoneNumber: profile.phone_number,
                    logoUrl: profile.logo_url
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setShowOTP(false);
            setOtp('');
            setMessage({ type: 'success', text: 'System profiles updated successfully.' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setVerifying(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-slate-300" /></div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="bg-white border border-slate-100 rounded-md shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] overflow-hidden">
                <div className="p-10 space-y-12">
                    {message.text && (
                        <div className={`p-4 rounded border text-xs font-bold flex items-center gap-3 animate-in fade-in ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                            {message.type === 'success' ? <CheckCircle2 className="size-4" /> : <Info className="size-4" />}
                            {message.text}
                        </div>
                    )}

                    {/* Main Settings Card Content */}
                    <div className="relative">
                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                            {/* Left Column: Branding Logistics */}
                            <div className="space-y-10">
                                <div className="space-y-1">
                                    <h3 className="text-base font-bold text-slate-900">Enterprise Branding</h3>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Global settings for recruitment identity</p>
                                </div>

                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Building className="size-3" /> Company Name
                                        </label>
                                        <input
                                            value={profile.company_name}
                                            onChange={(e) => setProfile(prev => ({ ...prev, company_name: e.target.value }))}
                                            placeholder="e.g. Acme Intelligence"
                                            className="w-full bg-slate-50 border border-slate-100 rounded px-5 py-3.5 text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-slate-300 transition-all"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Phone className="size-3" /> System Contact Phone
                                        </label>
                                        <input
                                            value={profile.phone_number}
                                            onChange={(e) => setProfile(prev => ({ ...prev, phone_number: e.target.value }))}
                                            placeholder="+1 (555) 000-0000"
                                            className="w-full bg-slate-50 border border-slate-100 rounded px-5 py-3.5 text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-slate-300 transition-all"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Mail className="size-3" /> Primary Recruiter Email
                                        </label>
                                        <input
                                            value={profile.email}
                                            onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                                            className="w-full bg-slate-50 border border-slate-100 rounded px-5 py-3.5 text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-slate-300 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-2">
                                    <Lock className="size-3 text-slate-300" />
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                                        Security Protocol Active: OTP Required for modification
                                    </p>
                                </div>
                            </div>

                            {/* Right Column: Visual Asset */}
                            <div className="space-y-10">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Sparkles className="size-3" /> Corporate Identity Asset
                                </label>

                                <div className="aspect-[4/3] w-full bg-slate-50 border border-slate-100 rounded flex flex-col items-center justify-center relative overflow-hidden group transition-all hover:bg-white hover:border-slate-200">
                                    {profile.logo_url ? (
                                        <>
                                            <div className="p-8 w-full h-full">
                                                <img src={profile.logo_url} alt="Logo" className="w-full h-full object-contain" />
                                            </div>
                                            <div className="absolute inset-0 bg-slate-900/90 opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center gap-3">
                                                <Upload className="size-5 text-white" />
                                                <label className="cursor-pointer text-[9px] font-bold uppercase tracking-widest text-white">Replace Asset</label>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center gap-6 p-10 text-center">
                                            <div className="size-10 rounded border border-slate-200 bg-white flex items-center justify-center">
                                                <Upload className="size-4 text-slate-400" />
                                            </div>
                                            <label className="cursor-pointer text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1 hover:border-slate-900 transition-all">Select SVG or PNG</label>
                                        </div>
                                    )}
                                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                </div>

                                <p className="text-[10px] text-slate-400 font-medium leading-relaxed max-w-[280px]">
                                    Required Asset: Vector (SVG) or High-Res PNG (400px min). This branding will be synchronized across all public application portals.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* CTA / Action Bar */}
                    <div className="flex items-center justify-end pt-8">
                        <button
                            onClick={requestOTP}
                            disabled={saving}
                            className="px-10 py-3.5 bg-slate-900 text-white rounded text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-sm"
                        >
                            {saving ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-3" />}
                            Execute Asset Commit
                        </button>
                    </div>
                </div>
            </div>

            {/* Arctic OTP Modal - Leverages Portal for true full-screen isolation */}
            {mounted && createPortal(
                <AnimatePresence>
                    {showOTP && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-[#0f172a]/60 backdrop-blur-xl"
                                onClick={() => setShowOTP(false)}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative bg-white rounded-2xl border border-white/20 p-16 max-w-md w-full shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] text-center"
                            >
                                <div className="size-16 bg-[#f8fafc] rounded-2xl flex items-center justify-center mx-auto mb-10 text-[#0f172a]">
                                    <Lock className="size-7" />
                                </div>
                                <h3 className="text-xl font-black tracking-tight text-[#0f172a] mb-3">Terminal Verification</h3>
                                <p className="text-[13px] font-medium text-[#64748b] mb-12 leading-relaxed px-4">
                                    Authentication code dispatched to <br />
                                    <span className="text-[#0f172a] font-bold underline decoration-slate-200 underline-offset-4">{profile.email}</span>
                                </p>

                                <div className="space-y-10">
                                    <input
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder="000000"
                                        autoFocus
                                        className="w-full bg-[#f8fafc] border border-transparent rounded-2xl px-6 py-6 text-3xl font-black text-center tracking-[0.8em] outline-none focus:bg-white focus:border-slate-200 transition-all placeholder:text-[14px] placeholder:font-black placeholder:uppercase placeholder:tracking-widest placeholder:text-slate-200"
                                    />

                                    <div className="space-y-4">
                                        <button
                                            onClick={handleSave}
                                            disabled={otp.length !== 6 || verifying}
                                            className="w-full py-5 bg-[#0f172a] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-[#1e293b] transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                                        >
                                            {verifying ? <Loader2 className="size-4 animate-spin" /> : 'Execute Protocol Update'}
                                        </button>

                                        <button
                                            onClick={() => setShowOTP(false)}
                                            className="w-full py-2 text-[10px] font-black text-[#94a3b8] uppercase tracking-widest hover:text-[#0f172a] transition-colors"
                                        >
                                            Abort Request
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
});


const SupportSection = memo(({ user }: { user: any }) => {
    const isFree = user?.tier !== 'enterprise' && user?.tier !== 'pro';

    return (
        <div className="w-full animate-in fade-in duration-300">
            {isFree ? (
                <div className="bg-white border border-slate-100 rounded p-12 text-center">
                    <div className="size-14 bg-slate-50 rounded flex items-center justify-center mx-auto mb-5 border border-slate-100">
                        <Lock className="size-5 text-slate-300" />
                    </div>
                    <h4 className="text-base font-bold text-slate-900 mb-2">Support Locked</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6 max-w-xs mx-auto">Live support channels are exclusive to Pro and Enterprise partners.</p>
                    <button
                        onClick={() => window.dispatchEvent(new CustomEvent('open-support-chat', { detail: { message: `UPGRADE: ${user?.email}` } }))}
                        className="px-8 py-3 bg-slate-900 text-white rounded text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all"
                    >
                        Request Upgrade
                    </button>
                </div>
            ) : (
                <div className="bg-white border border-slate-100 rounded overflow-hidden shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] flex flex-col" style={{ height: 'calc(100vh - 280px)', minHeight: '400px' }}>
                    {/* Chat Header Bar */}
                    <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="size-8 rounded bg-slate-50 border border-slate-100 flex items-center justify-center">
                                <MessageSquare className="size-3.5 text-slate-400" />
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-slate-900">Recruit Flow Support</h3>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <div className="size-1.5 bg-emerald-500 rounded-full" />
                                    <span className="text-[9px] font-medium text-slate-400">Online</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chat Body */}
                    <SupportChatInline userId={user?.id} />
                </div>
            )}
        </div>
    );
});

/**
 * Inline version of the SupportChat for the dashboard view
 */
function SupportChatInline({ userId }: { userId: string }) {
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchMessages = useCallback(async () => {
        try {
            // Fetch ONLY support-subject messages to keep Customer Support separate from Activation popup
            const res = await fetch('/api/support/messages?subject=SUPPORT');
            if (!res.ok) {
                console.warn('[SupportChatInline] API returned', res.status);
                return;
            }
            const contentType = res.headers.get('content-type') || '';
            if (!contentType.includes('application/json')) return;

            const data = await res.json();
            if (data.messages) {
                const formatted = data.messages.map((m: any) => ({
                    id: m.id,
                    sender: (m.sender === 'user' || (m.sender_id === userId && m.sender !== 'admin')) ? 'user' : 'support',
                    text: m.message_text || '',
                    time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }));
                setMessages(formatted);
            }
        } catch (err) {
            console.error('[SupportChatInline] Sync failed:', err);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchMessages();

        // Subscribe only to SUPPORT-subject messages so activation messages don't bleed in
        const channel = supabase
            .channel(`support_inline_${userId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'support_messages',
                filter: `user_id=eq.${userId}`
            }, (payload) => {
                try {
                    const newMsg = payload.new as any;
                    // Only add SUPPORT messages to this inbox
                    if ((newMsg.subject || '').toUpperCase() !== 'SUPPORT') return;
                    setMessages(prev => {
                        if (prev.some(m => m.id === newMsg.id)) return prev;
                        return [...prev, {
                            id: newMsg.id,
                            sender: (newMsg.sender === 'user' || (newMsg.sender_id === userId && newMsg.sender !== 'admin')) ? 'user' : 'support',
                            text: newMsg.message_text || newMsg.content || '',
                            time: new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        }];
                    });
                } catch { /* ignore */ }
            })
            .subscribe();

        // Polling fallback (every 3s) for high reliability if real-time replication is disabled in Supabase dashboard
        const polling = setInterval(() => {
            fetchMessages();
        }, 3000);

        return () => {
            supabase.removeChannel(channel);
            clearInterval(polling);
        };
    }, [userId, fetchMessages]);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    const handleSend = async (e?: React.FormEvent, content?: string) => {
        if (e) e.preventDefault();
        const textToUse = content || inputText;
        if (!textToUse.trim()) return;

        // Optimistic rendering — show message instantly before server confirms
        const optimisticMsg = {
            id: `temp-${Date.now()}`,
            sender: 'user',
            text: textToUse.trim(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, optimisticMsg]);
        setInputText('');

        try {
            await fetch('/api/support/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message_text: textToUse, subject: 'SUPPORT' })
            });
            // Sync with server to get the real message ID
            fetchMessages();
        } catch (err) {
            console.error('Failed to dispatch message:', err);
        }
    };

    return (
        <div className="flex-1 flex flex-col min-h-0">
            <div 
                ref={scrollRef} 
                data-lenis-prevent
                className="flex-1 overflow-y-auto px-5 py-4 space-y-3 scroll-smooth overscroll-contain"
            >
                {isLoading && messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full gap-3 text-slate-300">
                        <Loader2 className="size-4 animate-spin" />
                        <p className="text-[10px] font-bold text-slate-400">Loading messages...</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                        <div className="size-12 bg-slate-50 rounded flex items-center justify-center border border-slate-100">
                            <MessageSquare className="size-5 text-slate-200" />
                        </div>
                        <div>
                            <p className="text-slate-900 text-sm font-bold mb-1">No messages yet</p>
                            <p className="text-slate-400 text-xs font-medium max-w-[220px]">
                                Send a message below to start a conversation with our support team.
                            </p>
                        </div>
                    </div>
                ) : messages.map((msg: any) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={msg.id} 
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className="max-w-[75%]">
                            <div className={`${
                                msg.sender === 'user' 
                                ? 'bg-slate-900 text-white rounded rounded-tr-none' 
                                : 'bg-slate-50 border border-slate-100 text-slate-900 rounded rounded-tl-none'
                            } px-3.5 py-2.5`}>
                                <p className="text-[11px] font-medium leading-relaxed">{msg.text}</p>
                            </div>
                            <div className={`flex items-center gap-1.5 mt-1 px-0.5 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                                <span className="text-[8px] font-bold uppercase tracking-wider text-slate-300">
                                    {msg.sender === 'user' ? 'You' : 'Support'}
                                </span>
                                <span className="text-[8px] font-medium text-slate-300">{msg.time}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
            
            <div className="px-4 py-3 border-t border-slate-100">
                <form onSubmit={(e) => handleSend(e)} className="flex gap-2 items-center">
                    <input 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Type your message to support..."
                        className="flex-1 bg-slate-50 border border-slate-100 rounded px-4 py-2.5 text-xs font-medium text-slate-900 outline-none focus:border-slate-300 focus:bg-white transition-all"
                    />
                    <button 
                        type="submit"
                        disabled={!inputText.trim()}
                        className="size-9 bg-slate-900 text-white rounded hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center shrink-0 disabled:opacity-40"
                    >
                        <Send className="size-3.5" />
                    </button>
                </form>
            </div>
        </div>
    );
}







export default function DashboardClient() {
    const router = useRouter();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [authLoading, setAuthLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);
    const [newJob, setNewJob] = useState({ title: '', company_name: '', description: '', workMode: 'Remote', deadline: '', links: [{ label: 'LinkedIn' }] as { label: string }[] });
    const [createdJob, setCreatedJob] = useState<Job | null>(null);
    const [user, setUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'postings' | 'communication' | 'crm' | 'calendar' | 'profile' | 'support'>('postings');
    const [jobFilter, setJobFilter] = useState<'all' | 'active' | 'completed'>('all');
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
    const [systemAlert, setSystemAlert] = useState<{ title: string; message: string; type: 'error' | 'success' | 'warn' | 'upgrade' } | null>(null);
    const [showProfileAlert, setShowProfileAlert] = useState(false);

    const isFree = user?.tier !== 'enterprise' && user?.tier !== 'pro';

    // Communication Settings State
    const [mailSettings, setMailSettings] = useState({
        rejectionSubject: 'Update regarding your application for {{ROLE}}',
        rejectionBody: 'Dear {{NAME}},\n\nThank you for applying for the {{ROLE}} position at {{COMPANY}}. Unfortunately, we will not be moving forward due to: {{REASONS}}.\n\nBest regards,\n{{COMPANY}}',
        virtualSubject: 'Invitation to Virtual Interview — {{ROLE}}',
        virtualBody: 'Dear {{NAME}},\n\nWe are impressed with your profile, particularly regarding {{REASONS}}. We would like to invite you for a virtual interview for the {{ROLE}} role at {{COMPANY}}.\n\nMeeting Details:\nLink: {{LINK}}\nTime: {{START}} - {{END}}\n\nBest regards,\n{{COMPANY}}',
        onsiteSubject: 'Invitation to On-site Interview — {{ROLE}}',
        onsiteBody: 'Dear {{NAME}},\n\nWe are impressed with your profile, particularly regarding {{REASONS}}. We would like to invite you for an on-site interview for the {{ROLE}} role at {{COMPANY}}.\n\nPlease visit our office at:\nLocation: {{LOCATION}}\nTime: {{START}} - {{END}}\n\nBest regards,\n{{COMPANY}}',
        meetLink: '',
        location: ''
    });

    const [isSavingSettings, setIsSavingSettings] = useState(false);

    const handleInsertToken = (field: keyof typeof mailSettings, token: string) => {
        setMailSettings(prev => ({
            ...prev,
            [field]: prev[field] + token
        }));
    };

    // Auth Guard — fetches profile + jobs in PARALLEL for speed
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    router.push('/login');
                    return;
                }

                // Fetch profile AND jobs in parallel — saves 2-4 seconds
                const [profileRes, jobsRes] = await Promise.allSettled([
                    fetch('/api/profile'),
                    fetch('/api/jobs')
                ]);

                let profileData: any = {};
                if (profileRes.status === 'fulfilled' && profileRes.value.ok) {
                    const { profile } = await profileRes.value.json();
                    if (profile) profileData = profile;
                }

                if (jobsRes.status === 'fulfilled' && jobsRes.value.ok) {
                    const { jobs: fetchedJobs } = await jobsRes.value.json();
                    if (fetchedJobs) setJobs(fetchedJobs);
                }
                setLoading(false);

                // Use db-provided profile data only


                const finalUser = { ...session.user, ...profileData, profile: profileData };

                if (['owner', 'manager', 'support', 'admin'].includes(profileData?.role)) {
                    router.push('/iamadmin');
                    return;
                }

                setUser(finalUser);

                // Show profile completion alert if company name or phone is missing
                const isIncomplete = !profileData?.company_name?.trim() || !profileData?.phone_number?.trim();
                if (isIncomplete) {
                    setShowProfileAlert(true);
                }
            } catch (err) {
                console.error('Auth check fatal error:', err);
            } finally {
                setAuthLoading(false);
                setLoading(false);
            }
        };
        checkAuth();
    }, [router]);

    // Lock scroll when modal is open
    useEffect(() => {
        const lockScroll = () => {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        };

        const unlockScroll = () => {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        };

        if (showCreateModal) {
            lockScroll();
        } else {
            unlockScroll();
        }

        return () => unlockScroll();
    }, [showCreateModal]);

    const saveSettings = () => {
        setIsSavingSettings(true);
        localStorage.setItem('rf_mail_settings', JSON.stringify(mailSettings));
        setTimeout(() => setIsSavingSettings(false), 800);
    };

    const fetchJobs = async (forcedId?: string) => {
        const id = forcedId || user?.id;
        if (!id) return;
        try {
            const res = await fetch('/api/jobs');
            const data = await res.json();
            if (data.jobs) setJobs(data.jobs);
        } catch (err) {
            console.error('Failed to fetch jobs:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    const createJob = async (e: React.FormEvent) => {
        e.preventDefault();
        if (creating) return;
        setCreating(true);

        try {
            const compositeDescription = JSON.stringify({
                text: newJob.description,
                workMode: newJob.workMode,
                deadline: newJob.deadline,
                links: newJob.links
            });

            const res = await fetch('/api/create-job', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newJob.title,
                    company_name: newJob.company_name,
                    description: compositeDescription,
                    userId: user?.id
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setCreatedJob(data.job);
            setJobs(prev => [data.job, ...prev]);
            setNewJob({ title: '', company_name: '', description: '', workMode: 'Remote', deadline: '', links: [{ label: 'LinkedIn' }] });

        } catch (err: any) {
            const isLimitError = err.message?.toLowerCase().includes('upgrade') || err.message?.toLowerCase().includes('limit') || err.message?.toLowerCase().includes('allows up to');
            setSystemAlert({
                title: isLimitError ? 'Capacity Limit Reached' : 'Execution Error',
                message: err.message || 'The system encountered an unexpected disruption.',
                type: isLimitError ? 'upgrade' : 'error'
            });
        } finally {
            setCreating(false);
        }
    };

    const getApplyLink = (jobId: string) => {
        if (typeof window !== 'undefined') {
            return `${window.location.origin}/apply/${jobId}`;
        }
        return `/apply/${jobId}`;
    };

    const copyLink = async (jobId: string) => {
        const link = getApplyLink(jobId);
        await navigator.clipboard.writeText(link);
        setCopied(jobId);
        setTimeout(() => setCopied(null), 2000);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    const SystemAlertModal = ({ alert, onClose }: { alert: { title: string; message: string; type: 'error' | 'success' | 'warn' | 'upgrade' }, onClose: () => void }) => {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, y: 10 }}
                    animate={{ scale: 1, y: 0 }}
                    className="bg-white rounded-sm border border-slate-100 shadow-2xl w-full max-w-sm overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-8 text-center space-y-6">
                        <div className={cn(
                            "size-14 rounded-full mx-auto flex items-center justify-center",
                            alert.type === 'upgrade' ? "bg-amber-50 text-amber-600" :
                            alert.type === 'error' ? "bg-red-50 text-red-600" :
                            "bg-slate-50 text-slate-900"
                        )}>
                            {alert.type === 'upgrade' ? <ArrowUpCircle className="size-6" /> : alert.type === 'error' ? <AlertCircle className="size-6" /> : <ShieldCheck className="size-6" />}
                        </div>
                        
                        <div>
                            <h3 className="text-base font-bold text-slate-900 mb-2">{alert.title}</h3>
                            <p className="text-xs font-medium text-slate-500 leading-relaxed px-4">{alert.message}</p>
                        </div>

                        {alert.type === 'upgrade' ? (
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => {
                                        onClose();
                                        setActiveTab('support'); // Or a pricing page if it exists
                                    }}
                                    className="w-full py-3.5 bg-slate-900 text-white rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
                                >
                                    Initialize System Upgrade
                                </button>
                                <button onClick={onClose} className="w-full py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">
                                    Continue on current tier
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={onClose}
                                className="w-full py-3.5 bg-slate-900 text-white rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
                            >
                                Acknowledge Protocol
                            </button>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        );
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
            <AnimatePresence>
                {systemAlert && (
                    <SystemAlertModal alert={systemAlert} onClose={() => setSystemAlert(null)} />
                )}
            </AnimatePresence>

            {/* Profile Completion Alert */}
            <AnimatePresence>
                {showProfileAlert && (
                    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                            onClick={() => setShowProfileAlert(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            className="relative bg-white rounded-sm border border-slate-100 shadow-2xl max-w-md w-full p-8 text-center"
                        >
                            <div className="size-14 bg-amber-50 border border-amber-100 rounded-sm flex items-center justify-center mx-auto mb-6">
                                <AlertCircle className="size-6 text-amber-500" />
                            </div>
                            <h3 className="text-base font-black text-slate-900 mb-2 uppercase tracking-tight">Complete Your Company Profile</h3>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">
                                Please fill in your <span className="text-slate-900 font-bold">Company Name</span> and <span className="text-slate-900 font-bold">Contact Number</span> before posting jobs. This information is required for candidate communications.
                            </p>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setShowProfileAlert(false)}
                                    className="flex-1 py-3 border border-slate-200 text-slate-500 text-xs font-black uppercase tracking-widest rounded-sm hover:bg-slate-50 transition-all"
                                >
                                    Later
                                </button>
                                <button
                                    onClick={() => { setShowProfileAlert(false); setActiveTab('profile'); }}
                                    className="flex-1 py-3 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-sm hover:bg-slate-800 transition-all shadow-sm"
                                >
                                    Go to Settings
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Arctic Sidebar Navigation */}
            <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-100 z-[60] hidden lg:flex flex-col">
                <div className="p-8 border-b border-slate-100 mb-6">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="h-8 w-auto transition-transform group-hover:scale-105">
                            <img src="/recruit-flow-logo.png" alt="Recruit Flow" className="h-full w-auto object-contain" />
                        </div>
                        {user?.tier && (
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm border ${
                                user.tier === 'enterprise'
                                    ? 'bg-violet-50 text-violet-600 border-violet-100'
                                    : user.tier === 'pro'
                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                    : 'bg-slate-50 text-slate-400 border-slate-100'
                            }`}>
                                {user.tier}
                            </span>
                        )}
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    <button
                        onClick={() => setActiveTab('postings')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm text-xs font-bold transition-all ${activeTab === 'postings' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
                    >
                        <LayoutDashboard className="size-4" />
                        Job Postings
                    </button>
                    <button
                        onClick={() => (user?.tier === 'enterprise' || user?.tier === 'pro') ? setActiveTab('communication') : null}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm text-xs font-bold transition-all ${activeTab === 'communication' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'} ${!(user?.tier === 'enterprise' || user?.tier === 'pro') ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                        <Mail className="size-4" />
                        Direct Mail Drafts
                        {!(user?.tier === 'enterprise' || user?.tier === 'pro') && (
                            <span className="ml-auto bg-amber-50 text-[10px] px-1.5 py-0.5 rounded-sm text-amber-600">LOCKED</span>
                        )}
                    </button>
                    <button
                        onClick={() => (user?.tier === 'enterprise' || user?.tier === 'pro') ? setActiveTab('crm') : null}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm text-xs font-bold transition-all ${activeTab === 'crm' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'} ${!(user?.tier === 'enterprise' || user?.tier === 'pro') ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >

                        <Users className="size-4" />
                        Candidate CRM
                        {user?.tier === 'enterprise' || user?.tier === 'pro' ? (
                            <span className="ml-auto bg-emerald-100 text-[10px] px-1.5 py-0.5 rounded-sm text-emerald-600">UNLOCKED</span>
                        ) : (
                            <span className="ml-auto bg-amber-50 text-[10px] px-1.5 py-0.5 rounded-sm text-amber-600">UPGRADE</span>
                        )}
                    </button>
                    <button
                        onClick={() => (user?.tier === 'enterprise' || user?.tier === 'pro') ? setActiveTab('calendar') : null}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm text-xs font-bold transition-all ${activeTab === 'calendar' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'} ${!(user?.tier === 'enterprise' || user?.tier === 'pro') ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >

                        <Calendar className="size-4" />
                        Interview Calendar
                        {user?.tier === 'enterprise' || user?.tier === 'pro' ? (
                            <span className="ml-auto bg-emerald-100 text-[10px] px-1.5 py-0.5 rounded-sm text-emerald-600">UNLOCKED</span>
                        ) : (
                            <span className="ml-auto bg-amber-50 text-[10px] px-1.5 py-0.5 rounded-sm text-amber-600">UPGRADE</span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm text-xs font-bold transition-all ${activeTab === 'profile' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
                    >
                        <UserCog className="size-4" />
                        Profile Management
                    </button>
                    <button
                        onClick={() => setActiveTab('support')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm text-xs font-bold transition-all ${activeTab === 'support' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
                    >
                        <ArrowUpCircle className="size-4" />
                        Customer Support
                        {isFree && (
                            <span className="ml-auto bg-amber-50 text-[10px] px-1.5 py-0.5 rounded-sm text-amber-600">LOCKED</span>
                        )}
                    </button>

                    {['owner', 'manager', 'support', 'admin'].includes(user?.role) && (
                        <div className="pt-4 mt-4 border-t border-slate-100">
                            <Link
                                href="/iamadmin"
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-sm text-xs font-black transition-all bg-slate-950 text-emerald-500 shadow-xl hover:bg-slate-900 group"
                            >
                                <ShieldCheck className="size-4 group-hover:scale-110 transition-transform" />
                                Agent Terminal
                            </Link>
                        </div>
                    )}
                </nav>

                <div className="p-4 border-t border-slate-50">
                    <div className="flex items-center gap-3 p-4 bg-[#f8fafc] rounded-sm mb-4 border border-slate-50">
                        <div className="size-10 bg-[#0f172a] rounded-sm flex items-center justify-center text-white text-xs font-black shadow-lg shadow-slate-900/10">
                            {user?.email?.[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-bold text-[#0f172a] truncate">{user?.email}</p>
                            <p className="text-[9px] font-black text-[#94a3b8] uppercase tracking-widest mt-0.5">
                                {['owner', 'manager', 'support'].includes(user?.role) ? 'Company Staff' : 'RECRUITER'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-50 rounded-sm text-xs font-bold transition-all"
                    >
                        <LogOut className="size-4" />
                        Log out
                    </button>
                </div>
            </aside>

            {/* Mobile Nav */}
            <nav className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-100 z-[60] flex items-center justify-between px-6">
                <img src="/recruit-flow-logo.png" alt="Recruit Flow" className="h-6 w-auto object-contain" />
                <button
                    onClick={() => { setShowCreateModal(true); setCreatedJob(null); }}
                    className="size-8 bg-slate-900 rounded-sm flex items-center justify-center text-white"
                >
                    <PlusCircle className="size-4" />
                </button>
            </nav>

            {/* Main Content */}
            <main className="lg:pl-64 pt-16 lg:pt-0">
                <div className="max-w-6xl mx-auto p-4 lg:px-12 lg:py-10">
                    <div className="flex items-end justify-between gap-6 mb-10">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6 flex-1 min-w-0"
                        >
                            <>
                                <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-300">
                                    <span onClick={() => setActiveTab('postings')} className="hover:text-slate-900 cursor-pointer transition-colors">Hub</span>
                                    <div className="h-[1px] w-8 bg-slate-100" />
                                    <span className="text-slate-900">
                                        {activeTab === 'postings' ? 'Pipelines' :
                                            activeTab === 'crm' ? 'Database' :
                                                activeTab === 'calendar' ? 'Schedule' :
                                                    activeTab === 'profile' ? 'Identity' :
                                                        activeTab === 'support' ? 'Support' : 'Communication'}
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 leading-tight">
                                        {activeTab === 'postings' && 'Job Pipelines'}
                                        {activeTab === 'crm' && 'Candidate CRM'}
                                        {activeTab === 'calendar' && 'Interview Roadmap'}
                                        {activeTab === 'profile' && 'Account Settings'}
                                        {activeTab === 'support' && 'Customer Support'}
                                        {activeTab === 'communication' && 'Mail Templates'}
                                    </h1>
                                    <p className="text-slate-500 text-sm font-medium max-w-xl leading-relaxed">
                                        {activeTab === 'postings' && 'Manage your active recruitment pipelines and access the automated candidate flipbooks.'}
                                        {activeTab === 'crm' && 'Global applicant tracking and candidate database management.'}
                                        {activeTab === 'calendar' && 'Coordinate interview logistics and track scheduling conflicts.'}
                                        {activeTab === 'profile' && 'Manage your corporate identity, contact details, and security protocols.'}
                                        {activeTab === 'support' && 'Direct communication channel for technical assistance and success management.'}
                                        {activeTab === 'communication' && 'Configure personalized draft templates and interview logistics for bulk communication.'}
                                    </p>
                                </div>
                            </>
                        </motion.div>
                        {activeTab === 'postings' && (
                            <button
                                onClick={() => { setShowCreateModal(true); setCreatedJob(null); }}
                                className="bg-slate-900 text-white text-xs font-bold h-12 px-8 rounded-sm flex items-center gap-2 hover:bg-slate-800 transition-all shadow-sm active:scale-95 whitespace-nowrap shrink-0"
                            >
                                <PlusCircle className="size-4" />
                                Create New Posting
                            </button>
                        )}
                    </div>

                    <AnimatePresence mode="wait">
                        {activeTab === 'postings' ? (
                            <motion.div
                                key="postings-content"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                {/* Stats */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    {[
                                        {
                                            label: 'Active Postings',
                                            value: jobs.filter(j => {
                                                try {
                                                    const d = JSON.parse(j.description);
                                                    return !d.deadline || new Date(d.deadline) > new Date();
                                                } catch (e) { return true; }
                                            }).length,
                                            icon: Briefcase
                                        },
                                        { label: 'Total Applications', icon: Users, value: jobs.reduce((acc, j) => acc + (j.applications?.[0]?.count || 0), 0) },
                                        { label: 'System Status', icon: Sparkles, value: 'Optimal' },
                                    ].map((stat, i) => (
                                        <div key={i} className="bg-white border border-slate-100 p-6 flex flex-col items-start shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] rounded-sm">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                            <div className="flex items-center gap-3 mt-auto w-full justify-between">
                                                <h3 className="text-3xl font-light text-slate-900">{stat.value}</h3>
                                                <stat.icon className="size-4 text-slate-300" />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Filter Controls */}
                                <div className="flex items-center gap-2 mb-6 bg-white p-1.5 border border-slate-100 rounded-sm w-fit">
                                    {(['all', 'active', 'completed'] as const).map((filter) => (
                                        <button
                                            key={filter}
                                            onClick={() => setJobFilter(filter)}
                                            className={`px-6 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all ${jobFilter === filter
                                                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                                                    : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                                                }`}
                                        >
                                            {filter}
                                        </button>
                                    ))}
                                </div>

                                {loading ? (
                                    <div className="flex items-center justify-center py-32">
                                        <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
                                    </div>
                                ) : jobs.length === 0 ? (
                                    <div className="text-center py-32 bg-white border border-slate-100 border-dashed rounded-sm">
                                        <div className="size-20 bg-slate-50 rounded-sm flex items-center justify-center mx-auto mb-6">
                                            <Briefcase className="size-8 text-slate-300" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">no post listed</h3>
                                        <p className="text-slate-500 max-w-xs mx-auto mb-8 text-sm font-medium">
                                            Post a job opportunity to start receiving AI-analyzed resumes.
                                        </p>
                                        <button
                                            onClick={() => { setShowCreateModal(true); setCreatedJob(null); }}
                                            className="px-8 py-3 bg-slate-900 text-white rounded-sm text-xs font-bold hover:bg-slate-800 transition-all inline-flex items-center gap-2"
                                        >
                                            <PlusCircle className="size-4" />
                                            Create Posting
                                        </button>
                                    </div>

                                ) : (
                                    <div className="grid grid-cols-1 gap-3">
                                        {jobs.filter(job => {
                                            let isCompleted = false;
                                            try {
                                                const d = JSON.parse(job.description);
                                                if (d.deadline) {
                                                    isCompleted = new Date(d.deadline) < new Date();
                                                }
                                            } catch (e) { }

                                            if (jobFilter === 'active') return !isCompleted;
                                            if (jobFilter === 'completed') return isCompleted;
                                            return true;
                                        }).map((job) => {
                                            let parsedTitle = job.title;
                                            let workMode = 'Remote';
                                            let isCompleted = false;
                                            try {
                                                const d = JSON.parse(job.description);
                                                workMode = d.workMode || 'Remote';
                                                if (d.deadline) {
                                                    isCompleted = new Date(d.deadline) < new Date();
                                                }
                                            } catch (e) { }
                                            return (
                                                <motion.div
                                                    key={job.id}
                                                    layout
                                                    className={`bg-white border py-4 px-6 group flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] rounded-sm transition-all ${isCompleted ? 'border-amber-100 bg-amber-50/10' : 'border-slate-100'}`}
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <h2 className={`text-base font-medium truncate ${isCompleted ? 'text-slate-500' : 'text-slate-900'}`}>{parsedTitle}</h2>
                                                            <span className="px-2 py-0.5 bg-slate-50 border border-slate-100 text-[10px] font-medium text-slate-500 rounded-sm">{workMode}</span>
                                                            {isCompleted && (
                                                                <span className="px-2 py-0.5 bg-amber-100 border border-amber-200 text-[9px] font-black text-amber-600 rounded uppercase tracking-widest">Completed</span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                                                            <span className="truncate">{job.company_name}</span>
                                                            <div className="size-1 bg-slate-200 rounded-full" />
                                                            <span>{job.applications?.[0]?.count || 0} Apps</span>
                                                            <div className="size-1 bg-slate-200 rounded-full" />
                                                            <span>{formatDate(job.created_at)}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {!isCompleted && (
                                                            <button
                                                                onClick={() => copyLink(job.id)}
                                                                className={`h-9 px-4 rounded text-xs transition-all flex items-center gap-2 ${copied === job.id
                                                                    ? 'bg-emerald-50 text-emerald-600'
                                                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                                                    }`}
                                                            >
                                                                {copied === job.id ? <><Check className="size-3" /> Copied</> : <><Link2 className="size-3" /> Copy Link</>}
                                                            </button>
                                                        )}
                                                        <Link
                                                            href={`/dashboard/job/${job.id}`}
                                                            className={`h-9 px-4 rounded text-xs flex items-center gap-2 transition-all ${isCompleted ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                                                        >
                                                            <Eye className="size-3" />
                                                            View
                                                        </Link>
                                                    </div>
                                                </motion.div>

                                            )
                                        })}
                                    </div>
                                )}
                            </motion.div>
                        ) : activeTab === 'crm' ? (
                            <motion.div
                                key="crm-content"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-8 pb-20"
                            >
                                <CRMSection user={user} mailSettings={mailSettings} />
                            </motion.div>
                        ) : activeTab === 'calendar' ? (
                            <motion.div
                                key="calendar-content"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-8 pb-20"
                            >
                                <CalendarSection user={user} />
                            </motion.div>
                        ) : activeTab === 'profile' ? (
                            <motion.div
                                key="profile-content"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-8 pb-20"
                            >
                                <ProfileSection user={user} />
                            </motion.div>
                        ) : activeTab === 'support' ? (
                            <motion.div
                                key="support-content"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-8 pb-20"
                            >
                                <SupportSection user={user} />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="mail-content"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-6 pb-20"
                            >
                                {!(user?.tier === 'enterprise' || user?.tier === 'pro') ? (
                                    <div className="py-20 text-center flex flex-col items-center gap-6 bg-white border border-slate-100 rounded-sm shadow-sm">
                                        <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 shadow-inner">
                                            <Lock className="size-6 text-slate-200" />
                                        </div>
                                        <div className="max-w-xs mx-auto">
                                            <p className="text-sm font-bold text-slate-900 mb-2">Premium Workflow Locked</p>
                                            <p className="text-xs text-slate-400 font-medium leading-relaxed">Upgrade to Pro or Enterprise to manage bulk recruitment email drafts and automated outreach protocols.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="bg-emerald-50 border border-emerald-100 rounded-sm p-5 flex items-start gap-4">
                                            <Info className="size-5 text-emerald-600 mt-1" />
                                            <div className="text-xs font-medium text-emerald-900 leading-relaxed">
                                                <p className="font-bold uppercase tracking-widest mb-2">Template Protocol Activated</p>
                                                Use <code className="bg-emerald-100 px-1 py-0.5 rounded-sm font-black">{"{{NAME}}"}</code> for candidate name, <code className="bg-emerald-100 px-1 py-0.5 rounded-sm font-black">{"{{COMPANY}}"}</code> for your company name, <code className="bg-emerald-100 px-1 py-0.5 rounded-sm font-black">{"{{ROLE}}"}</code> for the job title, <code className="bg-emerald-100 px-1 py-0.5 rounded-sm font-black">{"{{REASONS}}"}</code> for decision points, <code className="bg-emerald-100 px-1 py-0.5 rounded-sm font-black">{"{{LINK}}"}</code> for Meet link, <code className="bg-emerald-100 px-1 py-0.5 rounded-sm font-black">{"{{LOCATION}}"}</code> for office address, and <code className="bg-emerald-100 px-1 py-0.5 rounded-sm font-black">{"{{START}}"}</code> / <code className="bg-emerald-100 px-1 py-0.5 rounded-sm font-black">{"{{END}}"}</code> for times.
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                    {[
                                        { label: 'Rejection', color: 'red', fieldName: 'rejectionSubject', bodyName: 'rejectionBody' },
                                        { label: 'Virtual Meet', color: 'emerald', fieldName: 'virtualSubject', bodyName: 'virtualBody' },
                                        { label: 'On-Site', color: 'indigo', fieldName: 'onsiteSubject', bodyName: 'onsiteBody' }
                                    ].map((tpl: any, idx) => (
                                        <div key={idx} className="bg-white border border-slate-100 rounded-sm p-5 shadow-sm flex flex-col transition-all hover:shadow-md hover:border-slate-300">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className={`size-2.5 rounded-full bg-${tpl.color}-400 ring-4 ring-${tpl.color}-50`} />
                                                <span className="text-xs font-black uppercase tracking-widest text-slate-900">{tpl.label} Draft</span>
                                            </div>
                                            <div className="space-y-4 flex-1 flex flex-col">
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Subject</label>
                                                    <input
                                                        value={(mailSettings as any)[tpl.fieldName]}
                                                        onChange={(e) => setMailSettings(prev => ({ ...prev, [tpl.fieldName]: e.target.value }))}
                                                        className="w-full bg-slate-50 border border-slate-100 rounded-sm px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400 focus:bg-white transition-all font-medium placeholder:font-normal"
                                                    />
                                                </div>
                                                <div className="flex-1 flex flex-col">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Body</label>
                                                        <div className="flex flex-wrap gap-1">
                                                            <button onClick={() => handleInsertToken(tpl.bodyName, '{{NAME}}')} className="text-[8px] bg-white border border-slate-100 px-1 py-0.5 rounded font-black text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-wider shadow-sm">+ Name</button>
                                                            <button onClick={() => handleInsertToken(tpl.bodyName, '{{COMPANY}}')} className="text-[8px] bg-white border border-slate-100 px-1 py-0.5 rounded font-black text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-wider shadow-sm">+ Company</button>
                                                            <button onClick={() => handleInsertToken(tpl.bodyName, '{{ROLE}}')} className="text-[8px] bg-white border border-slate-100 px-1 py-0.5 rounded font-black text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-wider shadow-sm">+ Role</button>
                                                            <button onClick={() => handleInsertToken(tpl.bodyName, '{{REASONS}}')} className="text-[8px] bg-white border border-slate-100 px-1 py-0.5 rounded font-black text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-wider shadow-sm">+ RSN</button>
                                                            {tpl.label !== 'Rejection' && (
                                                                <>
                                                                    <button onClick={() => handleInsertToken(tpl.bodyName, '{{LINK}}')} className="text-[8px] bg-white border border-slate-100 px-1 py-0.5 rounded font-black text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-wider shadow-sm">+ Link</button>
                                                                    <button onClick={() => handleInsertToken(tpl.bodyName, '{{LOCATION}}')} className="text-[8px] bg-white border border-slate-100 px-1 py-0.5 rounded font-black text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-wider shadow-sm">+ Loc</button>
                                                                    <button onClick={() => handleInsertToken(tpl.bodyName, '{{START}}')} className="text-[8px] bg-white border border-slate-100 px-1 py-0.5 rounded font-black text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-wider shadow-sm">+ Start</button>
                                                                    <button onClick={() => handleInsertToken(tpl.bodyName, '{{END}}')} className="text-[8px] bg-white border border-slate-100 px-1 py-0.5 rounded font-black text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-wider shadow-sm">+ End</button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <textarea
                                                        rows={7}
                                                        value={(mailSettings as any)[tpl.bodyName]}
                                                        onChange={(e) => setMailSettings(prev => ({ ...prev, [tpl.bodyName]: e.target.value }))}
                                                        className="w-full flex-1 min-h-[140px] bg-slate-50 border border-slate-100 rounded-sm px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:bg-white transition-all resize-none font-medium leading-relaxed"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Interview Logistics */}
                                <div className="bg-white border border-slate-100 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] rounded-sm mt-4">
                                    <div className="flex items-center gap-2 text-xs font-medium text-slate-900 mb-5">
                                        <Calendar className="size-4 text-slate-400" />
                                        Logistics
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block flex items-center gap-2">
                                                <BookOpen className="size-3" /> Meet Link
                                            </label>
                                            <input
                                                value={mailSettings.meetLink}
                                                onChange={(e) => setMailSettings(prev => ({ ...prev, meetLink: e.target.value }))}
                                                placeholder="https://meet.google.com/..."
                                                className="w-full bg-slate-50 border border-slate-100 rounded-sm px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400 focus:bg-white transition-all font-medium"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block flex items-center gap-2">
                                                <MapPin className="size-3" /> Physical Office Address
                                            </label>
                                            <input
                                                value={mailSettings.location}
                                                onChange={(e) => setMailSettings(prev => ({ ...prev, location: e.target.value }))}
                                                placeholder="Enter full address for on-site interviews..."
                                                className="w-full bg-slate-50 border border-slate-100 rounded-sm px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400 focus:bg-white transition-all font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end mt-8">
                                    <button
                                        onClick={saveSettings}
                                        disabled={isSavingSettings}
                                        className="bg-slate-900 text-white text-xs font-black uppercase tracking-widest h-14 px-12 rounded-sm flex items-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95 disabled:bg-slate-400"
                                    >
                                        {isSavingSettings ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                                        {isSavingSettings ? 'Synchronizing Pipeline...' : 'Commit Settings to Uplink'}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* Create Job Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-10">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                            onClick={() => { setShowCreateModal(false); setCreatedJob(null); }}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white rounded-sm border border-slate-100 w-full max-w-xl shadow-2xl overflow-hidden"
                            data-lenis-prevent
                        >
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                                <h3 className="text-lg font-bold tracking-tight text-slate-900">
                                    {createdJob ? 'Post Finalized' : 'New Posting'}
                                </h3>
                                <button
                                    onClick={() => { setShowCreateModal(false); setCreatedJob(null); }}
                                    className="p-2 text-slate-400 hover:text-slate-900 transition-colors rounded hover:bg-slate-50"
                                >
                                    <X className="size-5" />
                                </button>
                            </div>

                            {createdJob ? (
                                <div className="p-10 text-center">
                                    <div className="size-16 bg-emerald-50 border border-emerald-100 rounded flex items-center justify-center mx-auto mb-6">
                                        <Check className="size-8 text-emerald-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold tracking-tight mb-2 text-slate-900">Job Successfully Posted</h3>
                                    <p className="text-slate-500 text-sm mb-10 font-medium">
                                        Candidate flow is now active. Share this link:
                                    </p>

                                    <div className="bg-slate-50 border border-slate-100 rounded p-6 mb-10 text-center group relative cursor-pointer" onClick={() => copyLink(createdJob.id)}>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Application URL</p>
                                        <p className="text-slate-900 font-bold text-sm break-all font-mono">
                                            {getApplyLink(createdJob.id)}
                                        </p>
                                        <div className="absolute inset-x-0 bottom-0 py-1 bg-slate-900 text-white text-[9px] font-black opacity-0 group-hover:opacity-100 transition-opacity">CLICK TO COPY</div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => copyLink(createdJob.id)}
                                            className="flex-1 h-12 border border-slate-100 text-slate-900 rounded text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
                                        >
                                            {copied === createdJob.id ? <><Check className="size-4" /> Copied</> : <><Copy className="size-4" /> Copy Link</>}
                                        </button>
                                        <button
                                            onClick={() => { setShowCreateModal(false); setCreatedJob(null); }}
                                            className="flex-1 h-12 bg-slate-900 text-white rounded text-xs font-bold hover:bg-slate-800 transition-all"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={createJob} className="p-8 space-y-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Position Title</label>
                                            <input
                                                required
                                                value={newJob.title}
                                                onChange={(e) => setNewJob(prev => ({ ...prev, title: e.target.value }))}
                                                placeholder="e.g. Senior MLP Engineer"
                                                className="w-full border-b border-slate-100 py-2 text-slate-900 text-sm font-medium focus:border-slate-900 outline-none transition-all placeholder:text-slate-300"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Company Dept.</label>
                                            <input
                                                required
                                                value={newJob.company_name}
                                                onChange={(e) => setNewJob(prev => ({ ...prev, company_name: e.target.value }))}
                                                placeholder="e.g. Squad A"
                                                className="w-full border-b border-slate-100 py-2 text-slate-900 text-sm font-medium focus:border-slate-900 outline-none transition-all placeholder:text-slate-300"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-8">
                                        <ModernDropdown 
                                            label="Work Mode"
                                            value={newJob.workMode}
                                            options={['Remote', 'Hybrid', 'On-site']}
                                            onChange={(v) => setNewJob(prev => ({ ...prev, workMode: v }))}
                                        />

                                        <ModernDateTimePicker 
                                            label="Application Deadline"
                                            value={newJob.deadline}
                                            onChange={(v) => setNewJob(prev => ({ ...prev, deadline: v }))}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Requested Links (Optional)</label>
                                        <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                                            {['LinkedIn', 'GitHub', 'Portfolio', 'Instagram', 'Drive'].map(link => {
                                                const isSelected = newJob.links.some(l => l.label === link);
                                                return (
                                                    <button
                                                        type="button"
                                                        key={link}
                                                        onClick={() => {
                                                            setNewJob(prev => {
                                                                const exists = prev.links.find(l => l.label === link);
                                                                return {
                                                                    ...prev,
                                                                    links: exists ? prev.links.filter(l => l.label !== link) : [...prev.links, { label: link }]
                                                                }
                                                            });
                                                        }}
                                                        className={`px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all ${isSelected ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/10' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400 hover:text-slate-900'}`}
                                                    >
                                                        {isSelected && <Check className="size-2.5 inline-block mr-1.5" />}
                                                        {link}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Context / Description</label>
                                        <textarea
                                            rows={3}
                                            value={newJob.description}
                                            onChange={(e) => setNewJob(prev => ({ ...prev, description: e.target.value }))}
                                            placeholder="Briefly describe the role for candidates..."
                                            className="w-full border-b border-slate-200 py-2 text-slate-900 text-sm font-medium focus:border-slate-900 outline-none transition-all resize-none placeholder:text-slate-300"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={creating}
                                        className="w-full h-12 bg-slate-900 text-white rounded-sm font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-800 transition-all disabled:opacity-50 shadow-lg shadow-slate-900/10"
                                    >
                                        {creating ? (
                                            <><Loader2 className="size-4 animate-spin" /> Finalizing...</>
                                        ) : (
                                            <>Post Pipeline <ChevronRight className="size-4" /></>
                                        )}
                                    </button>
                                </form>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}


