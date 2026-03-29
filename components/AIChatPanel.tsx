/**
 * AIChatPanel.tsx
 *
 * Provides AI-powered chat for recruiter-candidate analysis and feedback.
 * Security: Authenticated users only, role-based access for recruiters.
 * APIs used: Next.js API route /api/chat-recruiter for AI chat, Supabase for applicant data.
 */
'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Terminal, User, Sparkles, ShieldAlert, Cpu } from 'lucide-react';
import BouncyLoader from '@/components/BouncyLoader';

interface Message {
    role: 'user' | 'assistant' | 'system_init';
    content: string;
}

interface AIChatPanelProps {
    jobId: string;
    applicants: any[];
}

export default function AIChatPanel({ jobId, applicants }: AIChatPanelProps) {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'system_init', content: "INTELLIGENCE UPLINK ESTABLISHED. Ready to analyze applicant telemetry. Awaiting command." }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        try {
            const response = await fetch('/api/chat-recruiter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jobId,
                    message: userMessage,
                    applicants: applicants.map(a => ({
                        name: a.name,
                        summary: a.ai_summary,
                        score: a.ats_score,
                    })),
                    history: messages.slice(-5)
                }),
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error);

            setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        } catch (error: any) {
            setMessages(prev => [...prev, { role: 'assistant', content: `CRITICAL FAILURE: ${error.message}` }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white font-sans rounded-none border-l border-slate-100">
            {/* Arctic Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-50">
                <div className="flex items-center gap-4">
                    <div className="size-10 bg-slate-900 rounded flex items-center justify-center text-white shadow-xl shadow-slate-900/10">
                        <Sparkles className="size-4" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-slate-900 tracking-tight uppercase flex items-center gap-2">
                            Intelligence <span className="text-slate-400 font-medium">Assistant</span>
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                            </span>
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">Context Uplink Active</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Canvas */}
            <div 
                ref={scrollRef} 
                className="flex-1 overflow-y-auto p-6 space-y-8 bg-[#fdfdfb]/50"
            >
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex gap-4 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`size-8 rounded flex items-center justify-center flex-shrink-0 mt-1 border ${
                                msg.role === 'assistant' || msg.role === 'system_init'
                                ? 'bg-white border-slate-100 text-slate-900 shadow-sm' 
                                : 'bg-slate-900 border-slate-900 text-white'
                            }`}>
                                {msg.role === 'assistant' || msg.role === 'system_init' ? <Sparkles className="size-3.5" /> : <User className="size-3.5" />}
                            </div>
                            <div className={`p-4 rounded text-[13px] leading-relaxed relative ${
                                msg.role === 'assistant' || msg.role === 'system_init'
                                ? 'bg-white border border-slate-100 text-slate-600 font-medium shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)]'
                                : 'bg-slate-900 text-white font-bold shadow-xl shadow-slate-900/5'
                            }`}>
                                {msg.content}
                                {(msg.role === 'assistant' || msg.role === 'system_init') && (
                                    <div className="absolute -left-1.5 top-4 size-3 bg-white border-l border-b border-slate-100 rotate-45" />
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                
                {loading && (
                    <div className="flex justify-start">
                        <div className="flex gap-4 max-w-[85%]">
                            <div className="size-8 rounded bg-white border border-slate-100 text-slate-400 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                                <Sparkles className="size-3.5" />
                            </div>
                            <div className="bg-white border border-slate-50 p-4 rounded flex items-center gap-3 shadow-sm">
                                <BouncyLoader size="sm" />
                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">Analyzing Archive...</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Station */}
            <form onSubmit={sendMessage} className="p-6 bg-white border-t border-slate-50">
                <div className="relative flex items-center group">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Interrogate candidate data..."
                        className="w-full bg-slate-50 border border-slate-100 rounded px-6 py-4 pr-16 focus:bg-white focus:border-slate-900 focus:ring-0 text-slate-900 text-sm outline-none transition-all placeholder:text-slate-300 font-bold"
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="absolute right-2.5 bg-slate-900 text-white p-2.5 rounded-md flex items-center justify-center hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-20 disabled:pointer-events-none shadow-lg shadow-slate-900/10"
                    >
                        <Send className="size-4" />
                    </button>
                </div>
                <div className="flex items-center justify-between mt-5 px-1">
                    <div className="flex items-center gap-2">
                        <div className="size-1 bg-emerald-500 rounded-full" />
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            Neural Match Active
                        </p>
                    </div>
                    <div className="flex items-center gap-1.5 opacity-30">
                        <ShieldAlert className="size-3 text-slate-900" />
                        <span className="text-[8px] font-black text-slate-900 uppercase tracking-[1px]">Protected Session</span>
                    </div>
                </div>
            </form>
        </div>
    );
}
