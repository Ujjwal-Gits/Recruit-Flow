'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Image as ImageIcon, ZoomIn, Copy, Check } from 'lucide-react';
import BouncyLoader from '@/components/BouncyLoader';
import { supabase } from '@/lib/supabase';
import { usePathname } from 'next/navigation';

interface Message {
    id: string;
    sender: 'user' | 'support';
    text: string;
    image_url?: string;
    time: string;
}

const ADMIN_ROLES = ['owner', 'manager', 'support', 'admin'];

export default function SupportChat() {
    const pathname = usePathname();
    const [userProfile, setUserProfile] = useState<{ tier: string; role: string; id: string } | null>(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [hasBeenTriggered, setHasBeenTriggered] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const channelRef = useRef<any>(null);
    const pollRef = useRef<any>(null);
    const [sending, setSending] = useState(false);
    const [qrLightbox, setQrLightbox] = useState<{ url: string; reference: string } | null>(null);
    const [copied, setCopied] = useState(false);

    // Close chat and release body lock when navigating to admin/dashboard pages
    useEffect(() => {
        if (pathname?.startsWith('/iamadmin') || pathname?.startsWith('/dashboard')) {
            setIsOpen(false);
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        }
    }, [pathname]);

    // ── 1. Fetch user profile (role + tier) ──────────────────────────────────
    useEffect(() => {
        let cancelled = false;
        const init = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session?.user) {
                    if (!cancelled) setLoadingProfile(false);
                    return;
                }

                const res = await fetch('/api/profile', { cache: 'no-store' });
                if (!res.ok) {
                    if (!cancelled) setLoadingProfile(false);
                    return;
                }
                const { profile } = await res.json();
                if (!cancelled) {
                    setUserProfile({
                        id: session.user.id,
                        role: profile?.role || 'recruiter',
                        tier: profile?.tier || 'free'
                    });
                    // Pre-load message history for premium users
                    if (profile && !ADMIN_ROLES.includes(profile.role || '')) {
                        fetchMessages(session.user.id);
                        setupSubscription(session.user.id);
                    }
                }
            } catch (err) {
                // silently swallow — user just won't see chat
            } finally {
                if (!cancelled) setLoadingProfile(false);
            }
        };
        init();
        return () => { cancelled = true; };
    }, []);

    // ── 2. Fetch message history (ACTIVATION only) ────────────────────────────
    const fetchMessages = async (userId: string) => {
        try {
            // This popup is ONLY for Activation/Upgrade flow—never Customer Support messages
            const { data, error } = await supabase
                .from('support_messages')
                .select('*')
                .eq('user_id', userId)
                .eq('subject', 'ACTIVATION')
                .order('created_at', { ascending: true });

            if (error || !data) return;

            setMessages(data.map(m => ({
                id: m.id,
                sender: (m.sender === 'user' || m.sender_id === userId) ? 'user' : 'support',
                text: m.message_text || m.content || '',
                image_url: m.image_url,
                time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            })));
        } catch {
            // ignore
        }
    };

    // ── 3. Real-time subscription (ACTIVATION only) ───────────────────────────
    const setupSubscription = (userId: string) => {
        if (channelRef.current) {
            supabase.removeChannel(channelRef.current);
        }

        const channel = supabase
            .channel(`activation_popup_${userId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'support_messages',
                filter: `user_id=eq.${userId}`
            }, (payload) => {
                try {
                    const m = payload.new as any;
                    // Only show ACTIVATION messages in this popup widget
                    if ((m.subject || '').toUpperCase() !== 'ACTIVATION') return;
                    setMessages(prev => {
                        if (prev.some(p => p.id === m.id)) return prev;
                        return [...prev, {
                            id: m.id,
                            sender: (m.sender === 'user' || m.sender_id === userId) ? 'user' : 'support',
                            text: m.message_text || m.content || '',
                            image_url: m.image_url,
                            time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        }];
                    });
                } catch {
                    // ignore parse errors
                }
            })
            .subscribe();

        channelRef.current = channel;

        // Clean up previous poll if any
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = setInterval(() => {
            fetchMessages(userId);
        }, 3000);
    };

    // Cleanup subscription on unmount
    useEffect(() => {
        return () => {
            if (channelRef.current) supabase.removeChannel(channelRef.current);
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, []);

    // ── 4. Listen for "Contact Here" / "Initialize Upgrade" / "Secure Access" ──
    useEffect(() => {
        const handleOpenChat = async (e: Event) => {
            const detail = (e as CustomEvent).detail as { message?: string } | undefined;
            const message = detail?.message;

            setHasBeenTriggered(true);
            setIsOpen(true);

            if (!message) return;

            // Optimistic UI — show immediately
            const tempId = `tmp_${Date.now()}`;
            setMessages(prev => {
                if (prev.some(m => m.text === message)) return prev;
                return [...prev, { id: tempId, sender: 'user', text: message, time: 'Just now' }];
            });

            try {
                const res = await fetch('/api/support/messages', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    // These come from the Upgrade flow → ACTIVATION hub
                    body: JSON.stringify({ message_text: message, subject: 'ACTIVATION' })
                });
                if (!res.ok) {
                    const text = await res.text();
                    console.error('[SupportChat] Send error:', text.slice(0, 200));
                }
            } catch (err) {
                console.error('[SupportChat] Send failed:', err);
            }
        };

        window.addEventListener('open-support-chat', handleOpenChat);
        return () => window.removeEventListener('open-support-chat', handleOpenChat);
    }, []);

    // ── 5. Auto-scroll & Body Lock ──────────────────────────────────────────
    useEffect(() => {
        if (!isOpen) return;
        
        // Locking document scroll when modal is open to prevent background scrolling
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        
        // Immediate scroll to bottom
        const timer = setTimeout(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
        }, 30);

        return () => {
            document.body.style.overflow = originalOverflow;
            document.documentElement.style.overflow = '';
            clearTimeout(timer);
        };
    }, [isOpen]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // ── 6. Send support message (from the chat input) ────────────────────────
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const text = inputText.trim();
        if (!text) return;
        setInputText('');

        const tempId = `tmp_${Date.now()}`;
        setMessages(prev => [...prev, { id: tempId, sender: 'user', text, time: 'Just now' }]);
        setSending(true);

        try {
            const res = await fetch('/api/support/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Messages from the activation popup → ACTIVATION hub
                body: JSON.stringify({ message_text: text, subject: 'ACTIVATION' })
            });
            if (!res.ok) {
                const txt = await res.text();
                console.error('[SupportChat] Send error:', txt.slice(0, 200));
            }
        } catch (err) {
            console.error('[SupportChat] Send failed:', err);
        } finally {
            setSending(false);
        }
    };

    // ── 7. Image upload ───────────────────────────────────────────────────────
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingImage(true);
        try {
            const ext = file.name.split('.').pop();
            const path = `chat_images/${Date.now()}.${ext}`;
            const { error: uploadError } = await supabase.storage.from('support-attachments').upload(path, file);
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('support-attachments').getPublicUrl(path);

            const tempId = `tmp_${Date.now()}`;
            setMessages(prev => [...prev, { id: tempId, sender: 'user', text: 'Sent an attachment.', image_url: publicUrl, time: 'Just now' }]);

            const res = await fetch('/api/support/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message_text: 'Sent an attachment.', image_url: publicUrl, subject: 'ACTIVATION' })
            });
            if (!res.ok) console.error('[SupportChat] Upload send error');
        } catch (err) {
            console.error('[SupportChat] Image upload failed:', err);
        } finally {
            setUploadingImage(false);
        }
    };

    // ── 8. Visibility logic ───────────────────────────────────────────────────
    // Extract payment reference from message text (e.g. "remarks section, please write: RecruitXxx")
    const extractReference = (text: string): string => {
        const match = text.match(/(?:write|reference|ref)[:\s]+([A-Za-z0-9]+)/i);
        return match?.[1] || '';
    };

    const handleCopyRef = (ref: string) => {
        navigator.clipboard.writeText(ref);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    // Still loading → render nothing so there's no flash
    if (loadingProfile) return null;

    // Never show on admin/dashboard pages — they have their own support UI
    if (pathname?.startsWith('/iamadmin') || pathname?.startsWith('/dashboard')) return null;

    // Admins / owners / staff → never show support chat
    if (userProfile && ADMIN_ROLES.includes(userProfile.role)) return null;

    // Not yet triggered → hidden (invisible until Contact Here / Initialize Upgrade clicked)
    if (!hasBeenTriggered && !isOpen) return null;

    // ── 9. Render ─────────────────────────────────────────────────────────────
    return (
        <div className="fixed bottom-6 right-6 z-[9999] font-sans">
            {/* QR Lightbox */}
            <AnimatePresence>
                {qrLightbox && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[10000] flex items-center justify-center p-6"
                        onClick={() => setQrLightbox(null)}
                    >
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                            onClick={e => e.stopPropagation()}
                            className="relative bg-white rounded-lg shadow-2xl p-6 max-w-xs w-full text-center"
                        >
                            <button
                                onClick={() => setQrLightbox(null)}
                                className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-all"
                            >
                                <X className="size-4" />
                            </button>

                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-4">Payment Gateway</p>

                            <div className="rounded-lg overflow-hidden border border-slate-100 mb-5">
                                <img src={qrLightbox.url} alt="Payment QR Code" className="w-full h-auto" />
                            </div>

                            {qrLightbox.reference && (
                                <div className="bg-slate-50 border border-slate-100 rounded-sm px-4 py-3 mb-4">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Remarks / Reference</p>
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-sm font-black text-slate-900 tracking-wide">{qrLightbox.reference}</span>
                                        <button
                                            onClick={() => handleCopyRef(qrLightbox.reference)}
                                            className="p-1.5 rounded text-slate-400 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 transition-all shrink-0"
                                        >
                                            {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                                Scan the QR code to complete your payment. Include the reference in the remarks field.
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            <AnimatePresence mode="wait">
                {isOpen ? (
                    <motion.div
                        key="chat-window"
                        data-lenis-prevent
                        initial={{ opacity: 0, scale: 0.95, y: 20, filter: 'blur(8px)' }}
                        animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 0.95, y: 20, filter: 'blur(8px)' }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-lg shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-slate-200 w-[340px] h-[500px] flex flex-col overflow-hidden overscroll-contain"
                    >
                        {/* Header */}
                        <div className="p-4 pl-5 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="size-8 rounded bg-slate-900 flex items-center justify-center text-white">
                                        <MessageSquare className="size-4" />
                                    </div>
                                    <div className="absolute -bottom-0.5 -right-0.5 size-3.5 bg-white rounded-full flex items-center justify-center shadow-sm">
                                        <div className="size-2 bg-emerald-500 rounded-full animate-pulse" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-[13px] font-black text-slate-900 tracking-tight leading-none mb-0.5">Support Hub</h3>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Active Now</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-900 rounded-lg transition-all"
                            >
                                <X className="size-4" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div 
                            ref={scrollRef} 
                            data-lenis-prevent
                            className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#fafafa] overscroll-contain"
                        >
                            {messages.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                                    <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                                        <MessageSquare className="size-4 text-slate-400" />
                                    </div>
                                    <p className="text-[11px] font-bold text-slate-400">No messages yet</p>
                                    <p className="text-[9px] text-slate-300 font-medium mt-1">Send a message to get started</p>
                                </div>
                            )}
                            {messages.map(msg => {
                                const ref = msg.image_url ? extractReference(msg.text) : '';
                                return (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={msg.id}
                                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[85%] ${
                                            msg.sender === 'user'
                                                ? 'bg-slate-900 text-white rounded rounded-tr-none'
                                                : 'bg-white border border-slate-200 text-slate-700 rounded rounded-tl-none'
                                        } px-4 py-3 shadow-sm`}>
                                            {msg.image_url && (
                                                <button
                                                    onClick={() => setQrLightbox({ url: msg.image_url!, reference: ref })}
                                                    className="mb-3 rounded-lg overflow-hidden border border-slate-200 block w-full relative group"
                                                >
                                                    <img src={msg.image_url} alt="Payment QR" className="w-full h-auto object-cover max-h-48" />
                                                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-all flex items-center justify-center">
                                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-1.5 shadow-lg">
                                                            <ZoomIn className="size-3.5 text-slate-700" />
                                                        </div>
                                                    </div>
                                                </button>
                                            )}
                                            <p className="text-[12px] font-medium leading-relaxed">{msg.text}</p>
                                            <div className={`flex items-center gap-2 mt-2 pt-1.5 border-t ${msg.sender === 'user' ? 'border-white/10' : 'border-slate-50'}`}>
                                                <span className={`text-[8px] font-black uppercase tracking-widest ${msg.sender === 'user' ? 'text-white/30' : 'text-slate-300'}`}>
                                                    {msg.time}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100">
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploadingImage}
                                    className="p-2.5 rounded border border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-40 transition-all shrink-0"
                                >
                                    {uploadingImage ? <BouncyLoader size="sm" /> : <ImageIcon className="size-3.5" />}
                                </button>
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={e => setInputText(e.target.value)}
                                    placeholder="Message..."
                                    className="flex-1 bg-slate-50 border border-slate-200 rounded px-4 py-2.5 text-[12px] font-medium text-slate-900 outline-none focus:bg-white focus:border-slate-900 transition-all placeholder:text-slate-300"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputText.trim() || uploadingImage || sending}
                                    className="p-2.5 bg-slate-900 text-white rounded hover:bg-slate-800 disabled:opacity-20 transition-all active:scale-95 shrink-0 min-w-[40px] flex items-center justify-center"
                                >
                                    {sending ? <BouncyLoader size="sm" /> : <Send className="size-3.5" />}
                                </button>
                            </div>
                            <p className="text-[8px] text-center text-slate-300 font-bold uppercase tracking-widest mt-2">
                                Secure Connection
                            </p>
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </form>
                    </motion.div>
                ) : (
                    /* Icon-only minimized button — no text label */
                    <motion.button
                        key="chat-icon"
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        whileHover={{ scale: 1.08, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsOpen(true)}
                        className="size-12 rounded-full bg-slate-900 shadow-xl flex items-center justify-center text-white relative"
                    >
                        <MessageSquare className="size-5" />
                        <div className="absolute top-1 right-1 size-2.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse" />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}
