import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
    Calendar, ChevronLeft, ChevronRight, MoreHorizontal, Clock, MapPin, Search, CheckCircle2, Loader2, X, Plus, Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BouncyLoader from '@/components/BouncyLoader';

interface Meeting {
    id: string;
    start_time: string;
    end_time: string;
    summary: string;
    description: string;
    location: string;
    video_link: string;
    status: string;
    attendees: string;
}

const MeetingRow = memo(({ m, statusColor }: { m: Meeting, statusColor: (s: string) => string }) => {
    return (
        <tr className="hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                        <Users className="size-3.5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900">{m.summary}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{m.id.slice(0, 8)}</p>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <Calendar className="size-3 text-slate-300" />
                    {new Date(m.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <Clock className="size-3 text-slate-300" />
                    {new Date(m.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </td>
            <td className="px-6 py-4 text-xs text-slate-500 font-medium max-w-[200px] truncate">{m.attendees || 'No attendees'}</td>
            <td className="px-6 py-4">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded border ${statusColor(m.status)}`}>{m.status}</span>
            </td>
            <td className="px-6 py-4">
                <button className="p-2 text-slate-300 hover:text-slate-900 transition-all">
                    <MoreHorizontal className="size-4" />
                </button>
            </td>
        </tr>
    );
});
MeetingRow.displayName = 'MeetingRow';

export default function CalendarSection({ user }: { user: any }) {
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [loadingMeetings, setLoadingMeetings] = useState(true);
    const [calendarSearch, setCalendarSearch] = useState('');

    useEffect(() => {
        if (user?.id) fetchMeetings(user.id);
    }, [user?.id]);

    const fetchMeetings = async (forcedId?: string) => {
        const id = forcedId || user?.id;
        if (!id) return;
        setLoadingMeetings(true);
        try {
            const res = await fetch(`/api/meetings?userId=${id}`, { cache: 'no-store' });
            const data = await res.json();
            setMeetings(data.meetings || []);
        } catch (err) { console.error('Meetings fetch err:', err); }
        finally { setLoadingMeetings(false); }
    };

    const filteredMeetings = useMemo(() => {
        return meetings.filter(m =>
            m.summary.toLowerCase().includes(calendarSearch.toLowerCase()) ||
            m.attendees.toLowerCase().includes(calendarSearch.toLowerCase())
        );
    }, [meetings, calendarSearch]);

    const statusColor = (s: string) => {
        if (s === 'confirmed') return 'bg-emerald-50 text-emerald-600 border-emerald-100';
        if (s === 'cancelled') return 'bg-red-50 text-red-600 border-red-100';
        return 'bg-amber-50 text-amber-600 border-amber-100';
    };

    if (user?.tier !== 'enterprise') {
        return (
            <div className="bg-white border border-slate-100 rounded-md p-20 text-center shadow-sm">
                <div className="size-16 bg-slate-50 rounded-md flex items-center justify-center mx-auto mb-6 text-slate-400 ring-8 ring-slate-50/50">
                    <Calendar className="size-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Enterprise Calendar Protocol</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto mb-8 font-medium">
                    Automated interview scheduling and Google Calendar sync is exclusive to Enterprise partners. Orchestrate your entire hiring timeline from one terminal.
                </p>
                <div className="flex items-center justify-center gap-4">
                    <button className="bg-slate-900 text-white px-8 py-3 rounded text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
                        Upgrade to Enterprise
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-slate-100 border border-slate-100 rounded-sm p-1">
                        <div className="flex items-center gap-2 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-sm bg-white shadow-sm text-slate-900">
                            <Calendar className="size-3" /> Interviews
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-white border border-slate-200 rounded-sm px-3 py-2 focus-within:border-slate-900 transition-all">
                        <Search className="size-3.5 text-slate-300" />
                        <input
                            value={calendarSearch}
                            onChange={(e) => setCalendarSearch(e.target.value)}
                            placeholder="Find Session..."
                            className="bg-transparent border-none text-xs font-bold text-slate-900 outline-none w-40 placeholder:text-slate-300 ml-2"
                        />
                    </div>
                    <button className="bg-slate-900 text-white px-6 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg active:scale-95">
                        <Plus className="size-3" /> New Invite
                    </button>
                </div>
            </div>

            <div className="bg-white border border-slate-100 rounded shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] overflow-hidden">
                {loadingMeetings ? (
                    <div className="flex items-center justify-center py-20">
                        <BouncyLoader />
                    </div>
                ) : filteredMeetings.length === 0 ? (
                    <div className="py-16 text-center">
                        <Calendar className="size-10 text-slate-200 mx-auto mb-4" />
                        <p className="text-sm font-bold text-slate-400">No scheduled sessions</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="border-b border-slate-100 bg-slate-50/50">
                            <tr>
                                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Meeting Summary</th>
                                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Time</th>
                                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Attendees</th>
                                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredMeetings.map(m => (
                                <MeetingRow key={m.id} m={m} statusColor={statusColor} />
                            ))}
                        </tbody>
                    </table>
                )}
                <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">
                    Secure Protocol Active
                </div>
            </div>
        </div>
    );
}
