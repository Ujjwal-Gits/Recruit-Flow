'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, ShieldCheck } from 'lucide-react';
import BouncyLoader from '@/components/BouncyLoader';

const MAX_HISTORY = 30;

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface Candidate {
    id: string;
    ref: string;
    name: string;
    score: number;
}

interface AIChatPanelProps {
    jobId: string;
    applicants: any[];
    onCandidateNavigate?: (applicantId: string) => void;
    onClose?: () => void;
}

// Parse AI reply — convert [CANDIDATE_LINK ref="..." name="..."] to inline text links
function parseReply(
    text: string,
    candidates: Candidate[],
    onCandidateClick: (id: string) => void
): React.ReactNode[] {
    const cleaned = text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
    const parts: React.ReactNode[] = [];
    const regex = /\[CANDIDATE_LINK ref="([^"]+)" name="([^"]+)"\]/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(cleaned)) !== null) {
        if (match.index > lastIndex) parts.push(cleaned.slice(lastIndex, match.index));

        const ref = match[1];
        const name = match[2];
        const candidate = candidates.find(c => c.ref === ref);

        parts.push(
            <button
                key={`link-${match.index}`}
                onClick={() => candidate && onCandidateClick(candidate.id)}
                className="font-bold text-slate-900 underline underline-offset-2 decoration-slate-300 hover:decoration-slate-900 transition-all cursor-pointer"
            >
                {name}
            </button>
        );

        lastIndex = regex.lastIndex;
    }

    if (lastIndex < cleaned.length) parts.push(cleaned.slice(lastIndex));
    return parts;
}

const SUGGESTED_PROMPTS = [
    'Who is the top candidate?',
    'Compare the top 3 candidates',
    'Who has the highest Match Fidelity?',
    'Which candidates should I interview?',
];

export default function AIChatPanel({ jobId, applicants, onCandidateNavigate, onClose }: AIChatPanelProps) {
    const storageKey = `rf_chat_${jobId}`;

    const [messages, setMessages] = useState<Message[]>(() => {
        // Load persisted history on mount
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) return JSON.parse(saved) as Message[];
        } catch { /* ignore */ }
        return [];
    });

    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Persist messages to localStorage whenever they change, capped at MAX_HISTORY
    useEffect(() => {
        try {
            const trimmed = messages.slice(-MAX_HISTORY);
            localStorage.setItem(storageKey, JSON.stringify(trimmed));
        } catch { /* ignore */ }
    }, [messages, storageKey]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    const handleCandidateClick = (candidateId: string) => {
        // Close the chat first so the user can see the navigation result
        onClose?.();
        // Small delay so the close animation starts before navigation
        setTimeout(() => {
            if (onCandidateNavigate) {
                onCandidateNavigate(candidateId);
            } else {
                const applicant = applicants.find(a => a.id === candidateId);
                if (applicant?.resume_url) window.open(applicant.resume_url, '_blank');
            }
        }, 150);
    };

    const sendMessage = async (text?: string) => {
        const userMessage = (text || input).trim();
        if (!userMessage || loading) return;

        setInput('');
        setError(null);

        const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
        setMessages(newMessages);
        setLoading(true);

        try {
            const response = await fetch('/api/chat-recruiter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jobId,
                    message: userMessage,
                    applicants: applicants.map(a => ({
                        id: a.id,
                        name: a.name,
                        summary: a.ai_summary,
                        score: a.ats_score,
                    })),
                    history: newMessages.slice(-6),
                }),
            });

            const data = await response.json();

            if (response.status === 429) {
                setError(data.error);
                setMessages(messages); // roll back
                setLoading(false);
                return;
            }

            if (data.error) throw new Error(data.error);

            if (data.candidates) setCandidates(data.candidates);

            const updated: Message[] = [...newMessages, { role: 'assistant', content: data.reply }];
            // Trim to MAX_HISTORY
            setMessages(updated.slice(-MAX_HISTORY));
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const msgCount = messages.filter(m => m.role === 'user').length;
    const hasMessages = messages.length > 0;

    return (
        <div className="flex flex-col h-full bg-white">

            {/* Messages / Welcome */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto">
                {!hasMessages ? (
                    <div className="flex flex-col items-center justify-center h-full px-8 py-12 text-center">
                        <div className="mb-8">
                            <img src="/recruit-flow-logo.png" alt="Recruit Flow" className="h-10 w-auto object-contain mx-auto mb-6 opacity-80" />
                            <h2 className="text-xl font-black text-slate-900 tracking-tight mb-2">Recruit Flow Intelligence</h2>
                            <p className="text-sm text-slate-400 font-medium max-w-xs mx-auto leading-relaxed">
                                AI-powered candidate analysis for this job. Ask anything about your applicant pool.
                            </p>
                        </div>

                        <div className="w-full max-w-sm space-y-2 mb-8">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-3">Suggested queries</p>
                            {SUGGESTED_PROMPTS.map((prompt, i) => (
                                <button
                                    key={i}
                                    onClick={() => sendMessage(prompt)}
                                    className="w-full text-left px-4 py-3 bg-slate-50 border border-slate-100 rounded-sm text-xs font-medium text-slate-600 hover:bg-white hover:border-slate-300 hover:text-slate-900 transition-all"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-slate-300">
                            <div className="flex items-center gap-1.5">
                                <span className="size-1.5 bg-emerald-400 rounded-full" />
                                {applicants.length} candidates loaded
                            </div>
                            <div className="w-px h-3 bg-slate-100" />
                            <div className="flex items-center gap-1.5">
                                <ShieldCheck className="size-3" />
                                Secure session
                            </div>
                            <div className="w-px h-3 bg-slate-100" />
                            <span>30 msg / day · 30 msg history</span>
                        </div>
                    </div>
                ) : (
                    <div className="p-6 space-y-6">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role !== 'user' && (
                                    <div className="size-7 rounded-sm bg-slate-900 flex items-center justify-center shrink-0 mt-0.5">
                                        <img src="/recruit-flow-logo.png" alt="" className="size-4 object-contain invert" />
                                    </div>
                                )}
                                <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-first' : ''}`}>
                                    {msg.role !== 'user' && (
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-1.5 ml-0.5">RF Intelligence</p>
                                    )}
                                    <div className={`px-4 py-3 rounded-sm text-[13px] leading-relaxed ${
                                        msg.role === 'user'
                                            ? 'bg-slate-900 text-white font-medium'
                                            : 'bg-slate-50 border border-slate-100 text-slate-700 font-medium'
                                    }`}>
                                        {msg.role === 'assistant'
                                            ? parseReply(msg.content, candidates, handleCandidateClick)
                                            : msg.content
                                        }
                                    </div>
                                </div>
                                {msg.role === 'user' && (
                                    <div className="size-7 rounded-sm bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-black text-slate-500">
                                        YOU
                                    </div>
                                )}
                            </div>
                        ))}

                        {loading && (
                            <div className="flex gap-3 justify-start">
                                <div className="size-7 rounded-sm bg-slate-900 flex items-center justify-center shrink-0">
                                    <img src="/recruit-flow-logo.png" alt="" className="size-4 object-contain invert" />
                                </div>
                                <div className="bg-slate-50 border border-slate-100 px-4 py-3 rounded-sm flex items-center gap-3">
                                    <BouncyLoader size="sm" />
                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Analyzing...</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Error banner */}
            {error && (
                <div className="mx-6 mb-2 px-4 py-2.5 bg-red-50 border border-red-100 rounded-sm text-xs font-bold text-red-600 flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 ml-3 text-base leading-none">&times;</button>
                </div>
            )}

            {/* Input */}
            <div className="px-6 pb-6 pt-3 border-t border-slate-50 bg-white">
                <form
                    onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                    className="flex items-center gap-2"
                >
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about your candidates..."
                        className="flex-1 bg-slate-50 border border-slate-100 rounded-sm px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-slate-400 transition-all placeholder:text-slate-300"
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="size-11 bg-slate-900 text-white rounded-sm flex items-center justify-center hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-30 shrink-0"
                    >
                        <Send className="size-4" />
                    </button>
                </form>
                <div className="flex items-center justify-between mt-3 px-0.5">
                    <div className="flex items-center gap-1.5">
                        <span className="size-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Neural Match Active</span>
                    </div>
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{30 - msgCount} / 30 remaining</span>
                </div>
            </div>
        </div>
    );
}
