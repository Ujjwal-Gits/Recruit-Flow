import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { createPortal } from 'react-dom';
import {
    Calendar, ChevronLeft, ChevronRight, Clock, MapPin, Search, Loader2,
    X, Plus, Video, Building2, User, Mail, FileText, CheckCircle2,
    AlertCircle, Circle, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BouncyLoader from '@/components/BouncyLoader';

interface Meeting {
    id: string;
    title: string;
    start_time: string;
    end_time: string;
    mode: 'virtual' | 'on-site';
    notes: string;
    status: string;           // 'pending' | 'accepted' | 'rejected'
    candidate_name: string;
    candidate_email: string;
    application_id: string | null;
}

// ── Status helpers ──────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    accepted: {
        label: 'Accepted',
        color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        icon: <CheckCircle2 className="size-3.5 text-emerald-500" />,
    },
    rejected: {
        label: 'Rejected',
        color: 'bg-red-50 text-red-600 border-red-100',
        icon: <AlertCircle className="size-3.5 text-red-500" />,
    },
    pending: {
        label: 'Pending',
        color: 'bg-amber-50 text-amber-600 border-amber-100',
        icon: <Circle className="size-3.5 text-amber-400" />,
    },
};

const statusCfg = (s: string) => STATUS_CONFIG[s] || STATUS_CONFIG.pending;

const fmt = (iso: string, opts: Intl.DateTimeFormatOptions) =>
    new Date(iso).toLocaleString([], opts);

// ── Meeting Detail Card ─────────────────────────────────────────────────────
function MeetingDetailCard({
    meeting,
    onClose,
    onStatusChange,
    onDelete,
}: {
    meeting: Meeting;
    onClose: () => void;
    onStatusChange: (id: string, status: string) => void;
    onDelete: (id: string) => void;
}) {
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const cfg = statusCfg(meeting.status);

    const handleStatus = async (newStatus: string) => {
        setUpdatingStatus(true);
        await onStatusChange(meeting.id, newStatus);
        setUpdatingStatus(false);
    };

    const handleDelete = async () => {
        if (!confirm('Delete this meeting?')) return;
        setDeleting(true);
        await onDelete(meeting.id);
        setDeleting(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                onClick={onClose}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 16 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="relative bg-white rounded-sm border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className={`size-9 rounded-sm flex items-center justify-center ${meeting.mode === 'virtual' ? 'bg-indigo-50' : 'bg-amber-50'}`}>
                            {meeting.mode === 'virtual'
                                ? <Video className="size-4 text-indigo-500" />
                                : <Building2 className="size-4 text-amber-500" />
                            }
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900 leading-tight">{meeting.title}</h3>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
                                {meeting.mode === 'virtual' ? 'Virtual Interview' : 'On-Site Interview'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded transition-all shrink-0">
                        <X className="size-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4">
                    {/* Candidate */}
                    <div className="flex items-start gap-3">
                        <User className="size-3.5 text-slate-300 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Candidate</p>
                            <p className="text-sm font-bold text-slate-900">{meeting.candidate_name || '—'}</p>
                            {meeting.candidate_email && (
                                <p className="text-xs text-slate-400 font-medium">{meeting.candidate_email}</p>
                            )}
                        </div>
                    </div>

                    {/* Date & Time */}
                    <div className="flex items-start gap-3">
                        <Clock className="size-3.5 text-slate-300 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Schedule</p>
                            <p className="text-sm font-bold text-slate-900">
                                {fmt(meeting.start_time, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                            <p className="text-xs text-slate-500 font-medium">
                                {fmt(meeting.start_time, { hour: '2-digit', minute: '2-digit' })}
                                {' – '}
                                {fmt(meeting.end_time, { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>

                    {/* Notes */}
                    {meeting.notes && (
                        <div className="flex items-start gap-3">
                            <FileText className="size-3.5 text-slate-300 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Notes</p>
                                <p className="text-xs text-slate-600 font-medium leading-relaxed">{meeting.notes}</p>
                            </div>
                        </div>
                    )}

                    {/* Status */}
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 shrink-0">{cfg.icon}</div>
                        <div className="flex-1">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Status</p>
                            <div className="flex items-center gap-2 flex-wrap">
                                {['pending', 'accepted', 'rejected'].map(s => (
                                    <button
                                        key={s}
                                        disabled={updatingStatus}
                                        onClick={() => handleStatus(s)}
                                        className={`px-3 py-1.5 rounded-sm border text-[9px] font-black uppercase tracking-widest transition-all ${
                                            meeting.status === s
                                                ? statusCfg(s).color + ' shadow-sm'
                                                : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
                                        }`}
                                    >
                                        {updatingStatus && meeting.status !== s ? '...' : s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                    >
                        {deleting ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
                        Delete
                    </button>
                    <button onClick={onClose} className="px-5 py-2 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-sm hover:bg-slate-800 transition-all">
                        Close
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

// ── New Invite Modal ────────────────────────────────────────────────────────
function NewInviteModal({
    onClose,
    onCreated,
}: {
    onClose: () => void;
    onCreated: (m: Meeting) => void;
}) {
    const [form, setForm] = useState({
        title: '',
        candidate_name: '',
        candidate_email: '',
        mode: 'virtual' as 'virtual' | 'on-site',
        start_time: '',
        end_time: '',
        notes: '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title || !form.start_time || !form.end_time) {
            setError('Title, start time and end time are required.');
            return;
        }
        setSaving(true);
        setError('');
        try {
            const res = await fetch('/api/meetings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: form.title,
                    start_time: new Date(form.start_time).toISOString(),
                    end_time: new Date(form.end_time).toISOString(),
                    mode: form.mode,
                    notes: form.notes,
                    // manual meetings have no application_id
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                if (res.status === 409) {
                    setError('Time conflict with an existing meeting. Choose a different slot.');
                } else {
                    setError(data.error || 'Failed to create meeting.');
                }
                return;
            }
            // Merge in the manually entered candidate info since API doesn't store it
            onCreated({
                ...data.meeting,
                candidate_name: form.candidate_name || 'Manual Entry',
                candidate_email: form.candidate_email,
                status: data.meeting.status || 'pending',
            });
            onClose();
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const inputCls = "w-full bg-slate-50 border border-slate-100 rounded-sm px-3 py-2.5 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-slate-400 transition-all placeholder:text-slate-300";

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                onClick={onClose}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 16 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="relative bg-white rounded-sm border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-black text-slate-900">New Interview Invite</h3>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5">Manual meeting log</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded transition-all">
                        <X className="size-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                    {error && (
                        <div className="px-3 py-2.5 bg-red-50 border border-red-100 rounded-sm text-xs font-bold text-red-600">{error}</div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Meeting Title *</label>
                        <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Frontend Engineer Interview" className={inputCls} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Candidate Name</label>
                            <input value={form.candidate_name} onChange={e => set('candidate_name', e.target.value)} placeholder="Full name" className={inputCls} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Candidate Email</label>
                            <input type="email" value={form.candidate_email} onChange={e => set('candidate_email', e.target.value)} placeholder="email@example.com" className={inputCls} />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Protocol</label>
                        <select value={form.mode} onChange={e => set('mode', e.target.value)} className={inputCls}>
                            <option value="virtual">Virtual (Meet)</option>
                            <option value="on-site">On-Site</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Start Time *</label>
                            <input type="datetime-local" value={form.start_time} onChange={e => set('start_time', e.target.value)} className={inputCls} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">End Time *</label>
                            <input type="datetime-local" value={form.end_time} min={form.start_time} onChange={e => set('end_time', e.target.value)} className={inputCls} />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Notes</label>
                        <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} placeholder="Any additional context..." className={inputCls + ' resize-none'} />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 border border-slate-200 text-slate-500 text-[9px] font-black uppercase tracking-widest rounded-sm hover:bg-slate-50 transition-all">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving} className="px-6 py-2.5 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-sm hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center gap-2">
                            {saving ? <Loader2 className="size-3 animate-spin" /> : <Plus className="size-3" />}
                            {saving ? 'Creating...' : 'Create Meeting'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

// ── Main CalendarSection ────────────────────────────────────────────────────
export default function CalendarSection({ user }: { user: any }) {
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [loadingMeetings, setLoadingMeetings] = useState(true);
    const [calendarSearch, setCalendarSearch] = useState('');
    const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
    const [showNewInvite, setShowNewInvite] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        if (user?.id) fetchMeetings();
    }, [user?.id]);

    const fetchMeetings = async () => {
        setLoadingMeetings(true);
        try {
            const res = await fetch('/api/meetings', { cache: 'no-store' });
            const data = await res.json();
            setMeetings(data.meetings || []);
        } catch (err) { console.error('Meetings fetch err:', err); }
        finally { setLoadingMeetings(false); }
    };

    const handleStatusChange = async (id: string, status: string) => {
        // Optimistic update
        setMeetings(prev => prev.map(m => m.id === id ? { ...m, status } : m));
        if (selectedMeeting?.id === id) setSelectedMeeting(prev => prev ? { ...prev, status } : prev);
        // Persist — meetings [id] PATCH (add if not exists, or use existing)
        try {
            await fetch(`/api/meetings/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
        } catch { /* optimistic already applied */ }
    };

    const handleDelete = async (id: string) => {
        try {
            await fetch(`/api/meetings/${id}`, { method: 'DELETE' });
            setMeetings(prev => prev.filter(m => m.id !== id));
        } catch (err) { console.error('Delete error:', err); }
    };

    const filteredMeetings = useMemo(() => {
        const q = calendarSearch.toLowerCase();
        return meetings.filter(m =>
            m.title?.toLowerCase().includes(q) ||
            m.candidate_name?.toLowerCase().includes(q) ||
            m.candidate_email?.toLowerCase().includes(q)
        );
    }, [meetings, calendarSearch]);

    if (user?.tier !== 'enterprise' && user?.tier !== 'pro') {
        return (
            <div className="bg-white border border-slate-100 rounded-md p-20 text-center shadow-sm">
                <div className="size-16 bg-slate-50 rounded-md flex items-center justify-center mx-auto mb-6 text-slate-400 ring-8 ring-slate-50/50">
                    <Calendar className="size-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Interview Calendar</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto mb-8 font-medium">
                    Interview scheduling is available on Pro and Enterprise plans.
                </p>
                <button className="bg-slate-900 text-white px-8 py-3 rounded text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
                    Upgrade Plan
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center bg-slate-100 border border-slate-100 rounded-sm p-1">
                    <div className="flex items-center gap-2 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-sm bg-white shadow-sm text-slate-900">
                        <Calendar className="size-3" /> Interviews
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-white border border-slate-200 rounded-sm px-3 py-2 focus-within:border-slate-900 transition-all flex-1 min-w-0">
                        <Search className="size-3.5 text-slate-300 shrink-0" />
                        <input
                            value={calendarSearch}
                            onChange={e => setCalendarSearch(e.target.value)}
                            placeholder="Find Session..."
                            className="bg-transparent border-none text-xs font-bold text-slate-900 outline-none w-full min-w-0 placeholder:text-slate-300 ml-2"
                        />
                    </div>
                    <button
                        onClick={() => setShowNewInvite(true)}
                        className="bg-slate-900 text-white px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg active:scale-95 shrink-0"
                    >
                        <Plus className="size-3" /> New Invite
                    </button>
                </div>
            </div>

            {/* Table — horizontally scrollable on mobile */}
            <div className="bg-white border border-slate-100 rounded shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] overflow-hidden">
                <div className="overflow-x-auto">
                {loadingMeetings ? (
                    <div className="flex items-center justify-center py-20"><BouncyLoader /></div>
                ) : filteredMeetings.length === 0 ? (
                    <div className="py-16 text-center">
                        <Calendar className="size-10 text-slate-200 mx-auto mb-4" />
                        <p className="text-sm font-bold text-slate-400">No scheduled sessions</p>
                        <p className="text-xs text-slate-300 font-medium mt-1">Click "New Invite" to log a meeting manually</p>
                    </div>
                ) : (
                    <table className="w-full text-left min-w-[600px]">
                        <thead className="border-b border-slate-100 bg-slate-50/50">
                            <tr>
                                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Meeting</th>
                                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Candidate</th>
                                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Time</th>
                                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Mode</th>
                                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredMeetings.map(m => {
                                const cfg = statusCfg(m.status);
                                return (
                                    <tr key={m.id} onClick={() => setSelectedMeeting(m)}
                                        className="hover:bg-slate-50/60 transition-colors cursor-pointer">
                                        <td className="px-4 py-4">
                                            <p className="text-sm font-bold text-slate-900">{m.title}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">{m.id.slice(0, 8)}</p>
                                        </td>
                                        <td className="px-4 py-4">
                                            <p className="text-xs font-bold text-slate-700">{m.candidate_name || '—'}</p>
                                            {m.candidate_email && <p className="text-[10px] text-slate-400 font-medium">{m.candidate_email}</p>}
                                        </td>
                                        <td className="px-4 py-4 text-xs font-bold text-slate-600 whitespace-nowrap">
                                            {fmt(m.start_time, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="px-4 py-4 text-xs font-bold text-slate-600 whitespace-nowrap">
                                            {fmt(m.start_time, { hour: '2-digit', minute: '2-digit' })}
                                            {' – '}
                                            {fmt(m.end_time, { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-sm border ${m.mode === 'virtual' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                                {m.mode === 'virtual' ? <Video className="size-2.5" /> : <Building2 className="size-2.5" />}
                                                {m.mode === 'virtual' ? 'Virtual' : 'On-Site'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm border ${cfg.color}`}>
                                                {cfg.icon}
                                                {cfg.label}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
                </div>
                <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {filteredMeetings.length} session{filteredMeetings.length !== 1 ? 's' : ''} logged
                </div>
            </div>

            {/* Modals */}
            {mounted && createPortal(
                <AnimatePresence>
                    {selectedMeeting && (
                        <MeetingDetailCard
                            key="detail"
                            meeting={selectedMeeting}
                            onClose={() => setSelectedMeeting(null)}
                            onStatusChange={handleStatusChange}
                            onDelete={handleDelete}
                        />
                    )}
                    {showNewInvite && (
                        <NewInviteModal
                            key="new"
                            onClose={() => setShowNewInvite(false)}
                            onCreated={m => setMeetings(prev => [m, ...prev])}
                        />
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}
