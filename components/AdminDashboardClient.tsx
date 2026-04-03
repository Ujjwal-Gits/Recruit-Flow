'use client';

/**
 * AdminDashboardClient.tsx
 *
 * This file implements the main admin dashboard for the CV Book system.
 * Features include analytics, job and candidate management, QR code upload for Financial Asset Gateway Terminal, receipt review, and admin settings.
 * Security: Role-based access (owner/admin), protected by Supabase Auth. Sensitive actions require verification.
 * APIs used: Supabase (auth, storage, database), Next.js API routes for CRUD operations.
 * All admin actions are logged for audit purposes.
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    Users, Briefcase, DollarSign, ShieldCheck, Mail, Bell,
    ArrowUpCircle, UserPlus, Search, MoreVertical,
    ShieldAlert, CreditCard, Loader2, LogOut, LayoutDashboard,
    X, Check, Lock, ChevronRight, Filter, Sparkles,
    TrendingUp, FileText, Settings, Globe, MessageSquare, Trash2,
    Send,
    SendHorizontal,
    ChevronDown, Menu, Maximize2, Moon, Sun, Calendar as CalendarIcon,
    ArrowUpRight, ArrowDownRight, UserCircle, Package, Monitor, Building, History,
    PieChart as PieChartIcon, Activity, Edit2, Save, Download, ExternalLink, QrCode, Code,
    Image as ImageIcon, Upload, AlertCircle, ArrowLeft
} from 'lucide-react';
import BouncyLoader from '@/components/BouncyLoader';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface UserProfile {
    id: string;
    email: string;
    tier: string;
    role: string;
    company_name: string;
    updated_at: string;
    logo_url?: string;
    subscription_expiry?: string;
}

interface AdminStats {
    totalUsers: number;
    totalListings: number;
    revenue: any;
    nprTotal: any;
    transCount: any;
    revenueHistory?: any[];
}

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default function AdminDashboardClient() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [authLoading, setAuthLoading] = useState(true);
    const [accessVerified, setAccessVerified] = useState(false);
    const [accessDenied, setAccessDenied] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'staff' | 'history' | 'messages' | 'upgrades' | 'billing'>('overview');
    const [searchQuery, setSearchQuery] = useState('');
    const [tierFilter, setTierFilter] = useState<'all' | 'essential' | 'pro' | 'enterprise'>('all');
    const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);


    // New functional states
    const [dateFilter, setDateFilter] = useState('12/08/2026 - 12/08/2026');
    const [showNotifications, setShowNotifications] = useState(false);
    const [showDateSelector, setShowDateSelector] = useState(false);
    const [chartStartDate, setChartStartDate] = useState('2026-01-01');
    const [chartEndDate, setChartEndDate] = useState('2026-12-31');

    // Invoice States
    const [invoiceFilter, setInvoiceFilter] = useState<'ALL' | 'NPR' | 'OTHER'>('ALL');
    const [billingSearch, setBillingSearch] = useState('');
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

    // Modal state for adding staff
    const [showStaffModal, setShowStaffModal] = useState(false);
    const [newStaffEmail, setNewStaffEmail] = useState('');
    const [newStaffRole, setNewStaffRole] = useState<'owner' | 'manager' | 'support'>('manager');
    const [addingStaff, setAddingStaff] = useState(false);

    // QR Configuration States
    const [qrValue, setQrValue] = useState('RecruitFlowPayments');
    const [isEditingQR, setIsEditingQR] = useState(false);
    const [tempQRValue, setTempQRValue] = useState('RecruitFlowPayments');
    const [qrImageUrl, setQrImageUrl] = useState('');
    const [tempQrImageUrl, setTempQrImageUrl] = useState('');

    // Receipt Review States
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [selectedReceiptIndex, setSelectedReceiptIndex] = useState(0);
    const [pendingReceipts, setPendingReceipts] = useState<any[]>([]);

    // Chat System States
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [selectedUpgradeId, setSelectedUpgradeId] = useState<string | null>(null);
    const [chatMessage, setChatMessage] = useState('');
    const [upgradeMessage, setUpgradeMessage] = useState('');
    const [uploadingAdminImage, setUploadingAdminImage] = useState(false);
    const [sending, setSending] = useState(false);
    const [sendingUpgrade, setSendingUpgrade] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
    const gatewayUploadRef = useRef<HTMLInputElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const [supportChats, setSupportChats] = useState<any[]>([]);
    const [closedChats, setClosedChats] = useState<any[]>([]);
    const [supportTicketTab, setSupportTicketTab] = useState<'active' | 'closed'>('active');
    const [currentMessages, setCurrentMessages] = useState<any[]>([]);
    const [upgradeRequests, setUpgradeRequests] = useState<any[]>([]);
    const [searchQueryUpgrades, setSearchQueryUpgrades] = useState('');
    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [invoices, setInvoices] = useState<any[]>([]);

    // ── Live Action Log ──────────────────────────────────────────────────────
    const [actionLog, setActionLog] = useState<{ id: number; action: string; target: string; author: string; role: string; time: string; ts: number }[]>([]);
    const logAction = (action: string, target: string) => {
        setActionLog(prev => [{
            id: Date.now(),
            action,
            target,
            author: user?.email || 'Admin',
            role: user?.role || 'admin',
            time: new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
            ts: Date.now(),
        }, ...prev].slice(0, 100)); // keep last 100
    };

    // Activation Hub Menu States
    const [showActivationMenu, setShowActivationMenu] = useState(false);
    const [selectedActivationTier, setSelectedActivationTier] = useState<'pro' | 'enterprise' | null>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [currentMessages]);

    const fetchSupportChats = useCallback(async () => {
        try {
            const res = await fetch(`/api/support/admin/chats?t=${Date.now()}`, { cache: 'no-store' });
            if (!res.ok) return;
            const data = await res.json();
            if (data.chats) setSupportChats(data.chats);
            if (data.closedChats) setClosedChats(data.closedChats);
        } catch (err) {
            console.error('Support queue sync error:', err);
        }
    }, [user?.id]);

    const [activationDropdown, setActivationDropdown] = useState<{ id: string; type: 'pro' | 'enterprise' } | null>(null);

    const [confirmModal, setConfirmModal] = useState<{ 
        isOpen: boolean; 
        type: 'CLOSE_TICKET' | 'UPGRADE' | 'REOPEN' | 'RESOLVE_ACTIVATION';
        userId: string; 
        tier?: string; 
        duration?: number; 
        email?: string;
        chatId?: string;
    }>({
        isOpen: false, type: 'CLOSE_TICKET', userId: '', email: ''
    });
    const [systemAlert, setSystemAlert] = useState<{ title: string; message: string; type: 'error' | 'success' | 'warn' } | null>(null);

    const renderProtocolConfirmModal = () => {
        if (!confirmModal.isOpen) return null;

        const handleConfirm = () => {
            if (confirmModal.type === 'CLOSE_TICKET' && confirmModal.userId) {
                executeCloseTicket(confirmModal.userId);
            } else if (confirmModal.type === 'UPGRADE' && confirmModal.userId && confirmModal.tier) {
                const expiryDate = confirmModal.duration ? new Date(Date.now() + confirmModal.duration * 24 * 60 * 60 * 1000).toISOString() : null;
                updateUserAccount(confirmModal.userId, { newTier: confirmModal.tier, newExpiry: expiryDate, duration: confirmModal.duration });
                if (confirmModal.type === 'UPGRADE') {
                    setUpgradeRequests(prev => prev.map(r => r.user === confirmModal.email ? { ...r, status: 'approved' } : r));
                }
            } else if (confirmModal.type === 'REOPEN' && confirmModal.userId) {
                executeReopenTicket(confirmModal.userId);
            } else if (confirmModal.type === 'RESOLVE_ACTIVATION' && confirmModal.userId) {
                executeResolveActivation(confirmModal.userId);
            }
            setConfirmModal({ ...confirmModal, isOpen: false });
        };

        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
                <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-md border border-slate-100 shadow-2xl w-full max-w-sm overflow-hidden p-8 text-center">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight mb-2">Are you sure?</h3>
                    <p className="text-[13px] font-medium text-slate-500 leading-relaxed mb-8">
                        {confirmModal.type === 'CLOSE_TICKET' ? 'Archive this support session?' : 
                         confirmModal.type === 'REOPEN' ? 'Reopen this support protocol?' :
                         confirmModal.type === 'RESOLVE_ACTIVATION' ? 'Remove this activation session from the hub?' : 
                         `Upgrade user to ${confirmModal.tier === 'pro' ? 'Pro' : 'Enterprise'} (${confirmModal.duration ? confirmModal.duration + ' days' : 'Lifetime'})?`}
                    </p>
                    <div className="flex gap-3">
                        <button onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
                            Cancel
                        </button>
                        <button onClick={handleConfirm} className="flex-1 py-3 bg-slate-900 text-white rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
                            Confirm
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        );
    };

    const executeCloseTicket = async (chatId: string) => {
        // Optimistic UI
        setSupportChats(prev => prev.filter(c => c.id !== chatId));
        const chat = supportChats.find(c => c.id === chatId);
        if (chat) setClosedChats(prev => [{ ...chat, isClosed: true }, ...prev]);
        setSelectedChatId(null);
        logAction('Support Ticket Closed', `Ticket #${chatId.slice(0, 8)} archived`);
        try {
            await fetch('/api/support/admin/chats', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: chatId, action: 'CLOSE' })
            });
            fetchSupportChats();
        } catch (err) {
            console.error('Failed to close ticket:', err);
        }
    };

    const executeReopenTicket = async (chatId: string) => {
        // Optimistic UI
        setClosedChats(prev => prev.filter(c => c.id !== chatId));
        const chat = closedChats.find(c => c.id === chatId);
        if (chat) setSupportChats(prev => [{ ...chat, isClosed: false }, ...prev]);
        setSupportTicketTab('active');
        setSelectedChatId(chatId);
        logAction('Support Ticket Reopened', `Ticket #${chatId.slice(0, 8)} reactivated`);
        try {
            await fetch('/api/support/admin/chats', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: chatId, action: 'REOPEN' })
            });
            fetchSupportChats();
        } catch (err) {
            console.error('Failed to reopen ticket:', err);
        }
    };

    const executeResolveActivation = async (userId: string) => {
        // Optimistic UI
        setUpgradeRequests(prev => prev.filter(r => r.id !== userId));
        setSelectedUpgradeId(null);
        const req = upgradeRequests.find(r => r.id === userId);
        logAction('Activation Resolved', `Request from ${req?.user || userId} closed`);
        try {
            await fetch('/api/support/admin/chats', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, action: 'RESOLVE_ACTIVATION' })
            });
            fetchUpgrades();
        } catch (err) {
            console.error('Failed to resolve activation:', err);
        }
    };

    const closeTicket = (chatId: string) => {
        setConfirmModal({ isOpen: true, type: 'CLOSE_TICKET', userId: chatId });
    };

    const reopenTicket = (chatId: string) => {
        setConfirmModal({ isOpen: true, type: 'REOPEN', userId: chatId });
    };

    const fetchUpgrades = useCallback(async () => {
        try {
            const res = await fetch(`/api/support/admin/upgrades?t=${Date.now()}`, { cache: 'no-store' });
            const data = await res.json();
            if (data.upgrades) setUpgradeRequests(data.upgrades);
        } catch (err) {
            console.error('Upgrades sync error:', err);
        }
    }, []);

    useEffect(() => {
        if (!user?.id) return;

        // Initial fetch
        fetchSupportChats();
        fetchUpgrades();

        // Real-time subscription for "Social Media" live feel
        const channel = supabase
            .channel('admin_all_messages')
            .on('postgres_changes', { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'support_messages' 
            }, () => {
                // Refresh both hubs on any new message
                fetchSupportChats();
                fetchUpgrades();
            })
            .subscribe();

        // Fallback polling (every 3s instead of 10s) for high reliability if real-time is disabled 
        const interval = setInterval(() => {
            fetchSupportChats();
            fetchUpgrades();
        }, 3000);

        return () => {
            supabase.removeChannel(channel);
            clearInterval(interval);
        };
    }, [user?.id, fetchSupportChats, fetchUpgrades]);

    // Update current messages when a chat is selected or when chats are updated
    useEffect(() => {
        if (selectedChatId) {
            const list = supportTicketTab === 'active' ? supportChats : closedChats;
            const chat = list.find(c => c.id === selectedChatId);
            if (chat) {
                setCurrentMessages(chat.messages || []);
            }
        }
    }, [selectedChatId, supportChats, closedChats, supportTicketTab]);

    const [upgradeFilter, setUpgradeFilter] = useState<'ALL' | 'ARCTIC' | 'ENTERPRISE'>('ALL');

    const filteredUpgradeRequests = useMemo(() => {
        return upgradeRequests.filter(req => {
            const matchesSearch = !searchQueryUpgrades || 
                req.user?.toLowerCase().includes(searchQueryUpgrades.toLowerCase()) ||
                req.name?.toLowerCase().includes(searchQueryUpgrades.toLowerCase());

            if (!matchesSearch) return false;

            if (upgradeFilter === 'ARCTIC') return req.plan.toLowerCase().includes('arctic');
            if (upgradeFilter === 'ENTERPRISE') return req.plan.toLowerCase().includes('enterprise');
            return true;
        });
    }, [upgradeRequests, upgradeFilter, searchQueryUpgrades]);

    const filteredRevenueData = useMemo(() => {
        const startMonth = chartStartDate.slice(0, 7);
        const endMonth = chartEndDate.slice(0, 7);

        // Build chart data from local invoices (only non-cancelled)
        const monthMap: Record<string, { month: string; usd: number; npr: number }> = {};
        invoices
            .filter(i => i.status !== 'Cancelled' && i.date)
            .forEach(i => {
                const month = i.date.slice(0, 7); // 'YYYY-MM'
                if (month < startMonth || month > endMonth) return;
                if (!monthMap[month]) monthMap[month] = { month, usd: 0, npr: 0 };
                if (i.currency === 'NPR') monthMap[month].npr += i.amount || 0;
                else monthMap[month].usd += i.amount || 0;
            });

        // Also include any API revenue history
        revenueData
            .filter(d => d.month >= startMonth && d.month <= endMonth)
            .forEach(d => {
                if (!monthMap[d.month]) monthMap[d.month] = { month: d.month, usd: 0, npr: 0 };
                monthMap[d.month].usd += d.usd || 0;
                monthMap[d.month].npr += d.npr || 0;
            });

        return Object.values(monthMap).sort((a, b) => a.month.localeCompare(b.month));
    }, [chartStartDate, chartEndDate, revenueData, invoices]);
    const [openSubMenu, setOpenSubMenu] = useState<{ id: string; type: 'pro' | 'enterprise' } | null>(null);
    
    const filteredInvoices = useMemo(() => {
        let list = invoices;
        if (invoiceFilter === 'NPR') list = list.filter(i => i.currency === 'NPR');
        else if (invoiceFilter === 'OTHER') list = list.filter(i => i.currency !== 'NPR');

        if (billingSearch) {
            const s = billingSearch.toLowerCase();
            list = list.filter(i =>
                i.id.toLowerCase().includes(s) ||
                i.purchaser.toLowerCase().includes(s)
            );
        }
        return list;
    }, [invoiceFilter, billingSearch, invoices]);

    const filteredUsers = useMemo(() => {
        return allUsers.filter(u => {
            const matchesSearch = !searchQuery || 
                u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.id?.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesTier = tierFilter === 'all' || 
                (tierFilter === 'essential' && (u.tier === 'essential' || u.tier === 'free')) ||
                (tierFilter === 'pro' && u.tier === 'pro') ||
                (tierFilter === 'enterprise' && u.tier === 'enterprise');
                
            return matchesSearch && matchesTier;
        });
    }, [allUsers, searchQuery, tierFilter]);


    const staffUsers = useMemo(() => {
        return allUsers.filter(u => ['owner', 'manager', 'support', 'admin'].includes(u.role));
    }, [allUsers]);

    const supportDrafts = [
        { label: 'RECEIVED', text: "Hello {{yourname}}, we have received your support request. An agent is currently reviewing your inquiry." },
        { label: 'INVESTIGATING', text: "Our technical team is currently investigating the issue. Thank you for your patience." },
        { label: 'RESOLVED', text: "This issue has now been resolved. Please verify on your end." }
    ];

    const activationDrafts = [
        { label: 'INITIALIZE', text: "Terminal check complete. Please transfer the amount to the provided gateway terminal. In the remarks section, please write: Recruit{{yourname}}" },
        { label: 'REVIEW', text: "Protocol synchronized. Your request is received. Checking transaction logs now." },
        { label: 'ACTIVATED', text: "Workspace activation initialized. System reboot required: Please log out and back in to sync terminal changes." }
    ];

    const applyDraft = (draft: string, fullName: string, type: 'chat' | 'upgrade') => {
        const firstName = fullName.split(' ')[0];
        const processed = draft.replace('{{yourname}}', firstName);
        if (type === 'chat') setChatMessage(processed);
        else setUpgradeMessage(processed);
    };

    const handleSendGatewayImage = async (type: 'chat' | 'upgrade') => {
        let fullName = 'User';
        let targetId = '';
        
        if (type === 'chat' && selectedChatId) {
            const list = supportTicketTab === 'active' ? supportChats : closedChats;
            const chat = list.find(c => c.id === selectedChatId);
            fullName = chat?.name || chat?.user?.company_name || chat?.user?.email || 'User';
            targetId = selectedChatId;
        } else if (type === 'upgrade' && selectedUpgradeId) {
            const req = upgradeRequests.find(r => r.id === selectedUpgradeId);
            fullName = req?.name || req?.user || 'User';
            targetId = req?.user_id;
        }

        if (!targetId) return;

        const firstName = fullName.split(' ')[0];
        const text = `Terminal check complete. Please transfer the amount using this secure QR code gateway. In the remarks section, please write: Recruit${firstName}`;
        const finalImageUrl = qrImageUrl || `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrValue}`;
        
        const newMessage = {
            id: Date.now().toString(),
            sender: 'support',
            text: text,
            time: 'Just now',
            image_url: finalImageUrl
        };

        if (type === 'chat') {
            setCurrentMessages(prev => [...prev, newMessage]);
            await supabase.from('support_messages').insert({
                user_id: targetId,
                sender_id: user?.id,
                receiver_id: targetId,
                sender: 'support',
                content: text,
                message_text: text,
                image_url: finalImageUrl,
                subject: 'GENERAL'
            });
        } else if (type === 'upgrade') {
            await supabase.from('support_messages').insert({
                user_id: targetId,
                sender_id: user?.id,
                receiver_id: targetId,
                sender: 'support',
                content: text,
                message_text: text,
                image_url: finalImageUrl,
                subject: 'ACTIVATION'
            });
        }
    };

    const handleGatewayImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || user?.role !== 'owner') return;

        setUploadingAdminImage(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `gateway-qr-${Date.now()}.${fileExt}`;
            const filePath = `gateway-assets/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('support-attachments')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('support-attachments')
                .getPublicUrl(filePath);

            setTempQrImageUrl(publicUrl);
        } catch (error) {
            console.error('Gateway Upload Error:', error);
            setSystemAlert({ title: 'Upload Error', message: 'The system failed to upload the image asset.', type: 'error' });
        } finally {
            setUploadingAdminImage(false);
        }
    };

    useEffect(() => {
        const checkAdminAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    setAccessDenied(true);
                    setAuthLoading(false);
                    router.push('/login');
                    return;
                }

                const res = await fetch('/api/iamadmin');
                const data = await res.json();

                if (res.status === 401 || res.status === 403 || data.error || !data.role || !['owner', 'manager', 'support', 'admin'].includes(data.role)) {
                    setAccessDenied(true);
                    setAuthLoading(false);
                    router.push('/dashboard');
                    return;
                }

                // ONLY set accessVerified=true after server confirms admin role
                setUser({ ...session.user, role: data.role });
                setStats(data.stats);
                setAllUsers(data.users || []);
                setSupportChats(data.chats || []);
                setUpgradeRequests(data.upgrades || []);
                setRevenueData(data.stats?.revenueHistory || []);
                
                // If not owner, change default tab to users since overview is restricted
                if (data.role !== 'owner') {
                    setActiveTab('users');
                }
                
                setAccessVerified(true);
            } catch (err) {
                console.error('Admin auth check fatal error:', err);
                setAccessDenied(true);
                router.push('/dashboard');
            } finally {
                setAuthLoading(false);
                setLoading(false);
            }
        };
        checkAdminAuth();
    }, [router]);

    // STRICT SECURITY GATE: Show nothing if access is denied
    if (accessDenied) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
                <Lock className="size-8 text-slate-300 mb-4" />
                <h1 className="text-lg font-bold text-slate-900 mb-1">Access Denied</h1>
                <p className="text-sm text-slate-500">You do not have permission to access this resource.</p>
            </div>
        );
    }

    // STRICT SECURITY GATE: Show ONLY a loader until auth is fully verified
    if (authLoading || !accessVerified) return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center">
            <BouncyLoader />
        </div>
    );

    const mockPieData = [
        { name: 'Enterprise', value: 400 },
        { name: 'Pro', value: 300 },
        { name: 'Starter', value: 300 },
    ];

    const mockHistory = [
        { id: 1, action: 'Granted Access', target: 'Pro Tier upgrade authorized', author: 'System Admin', time: '10 mins ago' },
        { id: 2, action: 'Added Staff', target: 'New Manager onboarded', author: 'System Admin', time: '1 hour ago' },
        { id: 3, action: 'Support Reply', target: 'Resolved ticket #1024', author: 'Support Agent', time: '2 hours ago' },
        { id: 4, action: 'Revoked Access', target: 'Removed inactive staff member', author: 'System Admin', time: '1 day ago' },
    ];
    const COLORS = ['#3b82f6', '#8b5cf6', '#10b981'];

    const fetchAdminData = async () => {
        try {
            const res = await fetch('/api/iamadmin');
            const data = await res.json();
            if (!data.error) {
                setStats(data.stats);
                setAllUsers(data.users || []);
            }
        } catch (err) {
            console.error('Failed to refresh admin data:', err);
        }
    };
    const calculateDaysLeft = (expiry?: string) => {
        if (!expiry) return null;
        const diff = new Date(expiry).getTime() - new Date().getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days > 0 ? days : 0;
    };

    const setSubscription = (userId: string, tier: string, durationDays: number | null) => {
        const user = allUsers.find(u => u.id === userId);
        setConfirmModal({
            isOpen: true,
            type: 'UPGRADE',
            userId,
            tier,
            duration: durationDays || undefined, // Pass undefined for lifetime
            email: user?.email || 'Unknown User'
        });
    };

    const updateUserAccount = async (targetId: string, updates: any) => {
        setUpdatingUserId(targetId);
        try {
            const res = await fetch('/api/iamadmin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    targetUserId: targetId,
                    action: 'update-user',
                    ...updates
                })
            });
            const data = await res.json();
            if (data.success) {
                fetchAdminData();

                // Auto-generate invoice when a tier upgrade is performed
                if (updates.newTier && (updates.newTier === 'pro' || updates.newTier === 'enterprise')) {
                    const targetUser = allUsers.find(u => u.id === targetId);
                    const tierPrices: Record<string, { npr: number; usd: number; label: string }> = {
                        pro: { npr: 499, usd: 6.99, label: 'Arctic Pro' },
                        enterprise: { npr: 799, usd: 9.99, label: 'Enterprise' },
                    };
                    const priceInfo = tierPrices[updates.newTier];
                    const newInvoice = {
                        id: `INV-${Date.now().toString(36).toUpperCase()}`,
                        plan: priceInfo.label,
                        purchaser: targetUser?.email || targetId,
                        company: targetUser?.company_name || '—',
                        currency: 'NPR',
                        amount: priceInfo.npr,
                        status: 'Succeeded',
                        date: new Date().toISOString(),
                        activatedBy: user?.email || 'Admin',
                        duration: updates.duration ? `${updates.duration} days` : 'Lifetime',
                    };
                    setInvoices(prev => [newInvoice, ...prev]);
                    logAction('Tier Upgrade', `${targetUser?.email || targetId} → ${priceInfo.label} (${updates.duration ? updates.duration + ' days' : 'Lifetime'})`);
                } else if (updates.newTier) {
                    const targetUser = allUsers.find(u => u.id === targetId);
                    logAction('Tier Change', `${targetUser?.email || targetId} → ${updates.newTier}`);
                } else if (updates.newRole) {
                    const targetUser = allUsers.find(u => u.id === targetId);
                    logAction('Role Updated', `${targetUser?.email || targetId} → ${updates.newRole}`);
                }
            }
        } catch (err) {
            console.error('Update Error:', err);
        } finally {
            setUpdatingUserId(null);
        }
    };

    const handleAddStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newStaffEmail || !newStaffRole) return;
        setAddingStaff(true);
        try {
            // Find user by email in current list to get ID (in a real app, you might need a separate API call if they are not loaded)
            const targetUser = allUsers.find(u => u.email === newStaffEmail);
            if (targetUser) {
                await updateUserAccount(targetUser.id, { newRole: newStaffRole });
                logAction('Staff Added', `${newStaffEmail} promoted to ${newStaffRole}`);
                setShowStaffModal(false);
                setNewStaffEmail('');
            } else {
                setSystemAlert({ title: 'Identity Mismatch', message: 'User must first register an account before they can be promoted to internal staff.', type: 'error' });
            }
        } catch (err) {
            console.error('Error adding staff', err);
        } finally {
            setAddingStaff(false);
        }
    }
    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };
    const renderSystemAlertModal = (alert: { title: string; message: string; type: 'error' | 'success' | 'warn' }, onClose: () => void) => {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md" onClick={onClose} >
                <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-lg border border-slate-100 shadow-2xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()} >
                    <div className="p-10 text-center space-y-6">
                        <div className={cn("size-16 rounded-lg mx-auto flex items-center justify-center shadow-inner", alert.type === 'error' ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-900" )}>
                            {alert.type === 'error' ? <AlertCircle className="size-8" /> : (
                                <svg className="size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
                            )}
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">{alert.title}</h3>
                            <p className="text-[13px] font-medium text-slate-500 leading-relaxed px-2">{alert.message}</p>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="w-full py-4 bg-[#0a0f1d] text-white rounded text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95" 
                        >
                            Acknowledge Protocol
                        </button>
                    </div>
                    <div className="h-1 bg-slate-100" />
                </motion.div>
            </motion.div>
        );
    };

    return (
        <div className="flex min-h-screen bg-white font-sans text-slate-900">
            <AnimatePresence>
                {renderProtocolConfirmModal()}
            </AnimatePresence>
            <AnimatePresence>
                {systemAlert && renderSystemAlertModal(systemAlert, () => setSystemAlert(null))}
            </AnimatePresence>
            {/* Sidebar matches exact DashboardClient style */}
            <aside 
                data-lenis-prevent
                className="w-64 bg-white border-r border-slate-100 flex flex-col h-screen fixed left-0 top-0 overflow-y-auto custom-scrollbar"
            >
                <div className="p-8 pb-4">
                    <Link href="/">
                        <img
                            src="/recruit-flow-logo.png"
                            alt="Logo"
                            className="h-6 w-auto mb-8 cursor-pointer hover:opacity-70 transition-opacity"
                        />
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    { [
{ id: 'overview', label: 'Command Hub', icon: LayoutDashboard, restricted: user?.role !== 'owner' && user?.role !== 'admin' },
{ id: 'users', label: 'User Entities', icon: Users },
{ id: 'staff', label: 'Staff Terminal', icon: ShieldAlert, restricted: user?.role === 'support' },
{ id: 'history', label: 'Action History', icon: History, restricted: user?.role !== 'owner' && user?.role !== 'admin' },
                        { id: 'messages', label: 'Support Queue', icon: MessageSquare },
                        { id: 'upgrades', label: 'Activation Hub', icon: ArrowUpCircle },
                        { id: 'billing', label: 'Fiscal Assets', icon: CreditCard, restricted: user?.role === 'support' },
                    ].map((item) => (
                        !item.restricted && (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id as any)}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded text-sm font-medium transition-all group ${activeTab === item.id
                                        ? 'bg-slate-900 text-white shadow-lg'
                                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                    }`}
                            >
                                <item.icon className="size-4" />
                                {item.label}
                                {item.id === 'users' && (
                                    <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded ${activeTab === item.id ? 'bg-white/10 text-white' : 'bg-amber-100 text-amber-600'}`}>NEW</span>
                                )}
                            </button>
                        )
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <div className="bg-slate-50 rounded-md p-4 flex items-center gap-3 relative group">
                        <div className="size-10 rounded bg-slate-900 flex items-center justify-center text-white font-semibold text-sm">
                            {user?.email?.[0] || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">{user?.email}</p>
                            <p className="text-xs text-slate-500">{user?.role}</p>
                        </div>

                        <div className="absolute right-4 bottom-14 hidden group-hover:block transition-all">
                            <div className="bg-white border border-slate-100 shadow-xl rounded w-48 overflow-hidden mb-2">
                                <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                    <Settings className="size-4" /> Settings
                                </button>
                                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-slate-100">
                                    <LogOut className="size-4" /> Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 ml-64 h-screen overflow-hidden bg-slate-50 relative flex flex-col">
                <div 
                    data-lenis-prevent
                    className="flex-1 overflow-y-auto custom-scrollbar overscroll-contain"
                >
                    <div className="max-w-6xl mx-auto p-6 pt-10">
                    {loading ? (
                        <div className="flex justify-center items-center py-40">
                            <BouncyLoader />
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            {activeTab === 'overview' && (
                                <motion.div
                                    key="overview"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-6"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Overview</h1>
                                            <p className="text-sm text-slate-500 mt-1 max-w-xl">
                                                Active pipelines and system health metrics.
                                            </p>
                                        </div>

                                        {/* Top Navigation / Notifications Area */}
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <button
                                                    onClick={() => setShowDateSelector(!showDateSelector)}
                                                    className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-white border border-slate-100 px-3 py-2 rounded-md shadow-sm hover:bg-slate-50 transition-colors"
                                                >
                                                    <CalendarIcon className="size-4" />
                                                    {dateFilter}
                                                </button>

                                                {showDateSelector && (
                                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 rounded shadow-xl overflow-hidden z-20">
                                                        {['Today', 'This Week', 'This Month', '12/08/2026 - 12/08/2026'].map(dt => (
                                                            <button
                                                                key={dt}
                                                                onClick={() => { setDateFilter(dt); setShowDateSelector(false); }}
                                                                className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 border-b border-slate-50 last:border-0"
                                                            >
                                                                {dt}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-3 bg-white border border-slate-100 p-1.5 rounded-md shadow-sm relative">
                                                <button
                                                    onClick={() => setActiveTab('messages')}
                                                    className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded transition-all relative"
                                                >
                                                    <Mail className="size-4" />
                                                    <span className="absolute top-1.5 right-1.5 size-1.5 bg-red-500 rounded-full ring-2 ring-white"></span>
                                                </button>

                                                <button
                                                    onClick={() => setShowNotifications(!showNotifications)}
                                                    className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded transition-all relative"
                                                >
                                                    <Bell className="size-4" />
                                                    <span className="absolute top-1.5 right-1.5 size-1.5 bg-blue-500 rounded-full ring-2 ring-white"></span>
                                                </button>

                                                {showNotifications && (
                                                    <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-100 rounded shadow-xl overflow-hidden z-20">
                                                        <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Notifications</span>
                                                            <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600"><X className="size-3" /></button>
                                                        </div>
                                                        <div className="max-h-60 overflow-y-auto">
                                                            {actionLog.slice(0, 3).map((log, i) => (
                                                                <div key={i} className="p-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer">
                                                                    <p className="text-xs font-bold text-slate-900">{log.action}</p>
                                                                    <p className="text-[10px] font-medium text-slate-500 mt-0.5">{log.target}</p>
                                                                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">{log.time}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="p-2 bg-slate-50 text-center">
                                                            <button
                                                                onClick={() => { setActiveTab('history'); setShowNotifications(false); }}
                                                                className="text-[10px] font-black uppercase tracking-widest text-[#0f172a] hover:underline"
                                                            >
                                                                View Full History
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Minimal Cards matching main dashboard style */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                        <div className="bg-white p-6 rounded-md border border-slate-100 shadow-sm relative overflow-hidden">
                                            <div className="flex items-center justify-between mb-4">
                                                <p className="text-sm font-medium text-slate-500">Total Users</p>
                                                <div className="p-2 bg-blue-50 rounded">
                                                    <Users className="size-4 text-blue-600" />
                                                </div>
                                            </div>
                                            <div className="flex items-end gap-3">
                                                <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{stats?.totalUsers || 0}</h3>
                                            </div>
                                        </div>

                                        <div className="bg-white p-6 rounded-md border border-slate-100 shadow-sm relative overflow-hidden group">
                                            <div className="flex items-center justify-between mb-4">
                                                <p className="text-sm font-medium text-slate-500">NPR Collection</p>
                                                <div className="p-2 bg-emerald-50 rounded group-hover:scale-110 transition-transform">
                                                    <CreditCard className="size-4 text-emerald-600" />
                                                </div>
                                            </div>
                                            <div className="flex items-ends gap-3">
                                                <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
                                                    NPR {invoices
                                                        .filter(i => i.status !== 'Cancelled' && i.currency === 'NPR')
                                                        .reduce((sum, i) => sum + (i.amount || 0), 0)
                                                        .toLocaleString()}
                                                </h3>
                                            </div>
                                        </div>

                                        <div className="bg-white p-6 rounded-md border border-slate-100 shadow-sm">
                                            <div className="flex items-center justify-between mb-4">
                                                <p className="text-sm font-medium text-slate-500">Net Revenue</p>
                                                <div className="p-2 bg-purple-50 rounded">
                                                    <Sparkles className="size-4 text-purple-600" />
                                                </div>
                                            </div>
                                            <div className="flex items-end gap-3">
                                                {stats?.revenue === 'RESTRICTED' ? (
                                                     <h3 className="text-3xl font-bold text-slate-200 tracking-tight leading-none">***</h3>
                                                ) : (
                                                     <h3 className="text-3xl font-bold text-slate-900 tracking-tight leading-none">
                                                         ${invoices
                                                             .filter(i => i.status !== 'Cancelled' && i.currency === 'USD')
                                                             .reduce((sum, i) => sum + (i.amount || 0), 0)
                                                             .toFixed(2)}
                                                     </h3>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-md border border-slate-100 shadow-sm">
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="flex-1 text-center">
                                                <p className="text-[11px] font-bold tracking-tight uppercase text-slate-400 mb-1">System Health</p>
                                                <h2 className="text-xl font-bold text-emerald-600 tracking-tight flex items-center justify-center gap-2">
                                                    <span className="size-2 bg-emerald-500 rounded-full animate-pulse" /> Optimal
                                                </h2>
                                            </div>
                                            <div className="h-8 w-px bg-slate-100" />
                                            <div className="flex-1 text-center">
                                                <p className="text-[11px] font-bold tracking-tight uppercase text-slate-400 mb-1">Admin Nodes</p>
                                                <h2 className="text-xl font-bold text-slate-900 tracking-tight">{staffUsers.length} Active</h2>
                                            </div>
                                            <div className="h-8 w-px bg-slate-100" />
                                            <div className="flex-1 text-center">
                                                <p className="text-[11px] font-bold tracking-tight uppercase text-slate-400 mb-1">Pending Actions</p>
                                                <h2 className="text-xl font-bold text-slate-900 tracking-tight">{upgradeRequests.length + pendingReceipts.length} Total</h2>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                                            <div className="lg:col-span-2 bg-white border border-slate-100 rounded-md p-6 shadow-sm">
                                                <div className="flex items-center justify-between mb-6">
                                                    <h3 className="text-xs font-bold text-slate-500 flex items-center gap-2 uppercase tracking-wide">
                                                        <Activity className="size-3.5 text-slate-400" /> Income Analytics
                                                    </h3>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="size-2 rounded-full bg-[#3b82f6]" />
                                                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">USD</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="size-2 rounded-full bg-[#ef4444]" />
                                                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">NPR</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <label className="text-[8px] font-black uppercase tracking-widest text-slate-300">From</label>
                                                        <input
                                                            type="date"
                                                            value={chartStartDate}
                                                            onChange={(e) => setChartStartDate(e.target.value)}
                                                            className="bg-white border border-slate-100 rounded px-2 py-1 text-[10px] font-bold text-slate-700 outline-none focus:border-[#0f172a]"
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <label className="text-[8px] font-black uppercase tracking-widest text-slate-300">To</label>
                                                        <input
                                                            type="date"
                                                            value={chartEndDate}
                                                            onChange={(e) => setChartEndDate(e.target.value)}
                                                            className="bg-white border border-slate-100 rounded px-2 py-1 text-[10px] font-bold text-slate-700 outline-none focus:border-[#0f172a]"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex-1 w-full min-w-0" style={{ minHeight: '300px' }}>
                                                 <div className="h-64 relative">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <LineChart data={filteredRevenueData}>
                                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                            <XAxis 
                                                                dataKey="name" 
                                                                axisLine={false} 
                                                                tickLine={false} 
                                                                tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}} 
                                                                dy={10}
                                                            />
                                                            <YAxis 
                                                                yAxisId="left"
                                                                axisLine={false} 
                                                                tickLine={false} 
                                                                tick={{fontSize: 10, fontWeight: 700, fill: '#3b82f6'}} 
                                                            />
                                                            <YAxis 
                                                                yAxisId="right"
                                                                orientation="right"
                                                                axisLine={false} 
                                                                tickLine={false} 
                                                                tick={{fontSize: 10, fontWeight: 700, fill: '#ef4444'}} 
                                                            />
                                                            <RechartsTooltip 
                                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                                                            />
                                                            <Line yAxisId="left" type="monotone" dataKey="usd" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                                                            <Line yAxisId="right" type="monotone" dataKey="npr" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                                                        </LineChart>
                                                    </ResponsiveContainer>
                                                    {filteredRevenueData.length === 0 && (
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No transaction records found</p>
                                                        </div>
                                                    )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="h-72 bg-white border border-slate-100 rounded-md p-6 shadow-sm flex flex-col">
                                                <h3 className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-2 uppercase tracking-wide">
                                                    <PieChartIcon className="size-3.5 text-slate-400" /> User Tiers
                                                </h3>
                                                  <div className="flex-1 w-full min-w-0 flex items-center justify-center translate-y-2" style={{ minHeight: '220px' }}>
                                                      <ResponsiveContainer width="100%" height="100%">
                                                         <PieChart>
                                                             <Pie
                                                                 data={mockPieData}
                                                                 cx="50%"
                                                                 cy="50%"
                                                                 innerRadius={60}
                                                                 outerRadius={80}
                                                                 paddingAngle={5}
                                                                 dataKey="value"
                                                             >
                                                                 {mockPieData.map((entry, index) => (
                                                                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                                 ))}
                                                             </Pie>
                                                             <RechartsTooltip contentStyle={{ borderRadius: '4px', border: '1px solid #e2e8f0' }} />
                                                         </PieChart>
                                                     </ResponsiveContainer>
                                                 </div>
                                                <div className="flex justify-center gap-4 mt-2">
                                                    {mockPieData.map((entry, index) => (
                                                        <div key={entry.name} className="flex items-center gap-1.5">
                                                            <div className="size-2 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{entry.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'users' && (
                                <motion.div
                                    key="users"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-5"
                                >
                                    <div>
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#94a3b8] mb-1.5">
                                            <span>HUB</span>
                                            <span className="w-6 h-px bg-[#e2e8f0]"></span>
                                            <span className="text-[#0f172a]">ENTITIES</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <h1 className="text-2xl font-black text-[#0f172a] tracking-tight">User Index</h1>

                                            <div className="flex items-center gap-4">
                                                <div className="flex bg-slate-100 p-0.5 rounded shadow-inner">
                                                    {(['all', 'essential', 'pro', 'enterprise'] as const).map((t) => (
                                                        <button
                                                            key={t}
                                                            onClick={() => setTierFilter(t)}
                                                            className={`px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-widest transition-all ${tierFilter === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                                        >
                                                            {t}
                                                        </button>
                                                    ))}
                                                </div>
                                                <div className="flex items-center bg-white border border-slate-100 rounded px-3 py-2 text-[#0f172a] w-64 shadow-sm">
                                                    <Search className="size-3.5 text-slate-300" />
                                                    <input
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                        placeholder="Search entities..."
                                                        className="bg-transparent border-none text-xs font-bold text-slate-900 outline-none w-full placeholder:text-slate-300 ml-2"
                                                    />
                                                </div>
                                            </div>

                                        </div>
                                    </div>

                                    <div className="bg-white border border-slate-100/60 rounded-sm shadow-sm">
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-50 border-b border-slate-100">
                                                <tr>
                                                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">User Identity</th>
                                                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Organization</th>
                                                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Subscription</th>
                                                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Expiry</th>
                                                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {filteredUsers.length > 0 ? filteredUsers.map(u => (
                                                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <p className="text-sm font-bold text-slate-900">{u.email || 'No Email'}</p>
                                                            <p className="text-xs text-slate-400 font-medium">ID: {u.id?.substring(0, 8) || 'N/A'}</p>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {['owner', 'manager', 'support'].includes(u.role) ? (
                                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><ShieldCheck className="size-3" /> System Admin HQ</span>
                                                            ) : u.logo_url ? (
                                                                <img src={u.logo_url} alt="Logo" className="h-6 w-auto object-contain brightness-0 opacity-50" />
                                                            ) : (
                                                                <span className="text-[10px] font-bold text-slate-400">{u.company_name || 'N/A'}</span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border inline-flex items-center gap-1.5 ${u.tier === 'enterprise' ? 'bg-slate-900 text-white border-slate-900' :
                                                                    u.tier === 'pro' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                                        'bg-slate-50 text-slate-500 border-slate-100'
                                                                }`}>
                                                                {u.tier === 'free' ? 'essential' : u.tier}
                                                            </span>

                                                        </td>
                                                         <td className="px-6 py-4">
                                                             {u.tier !== 'essential' ? (
                                                                 <div className="flex items-center gap-2">
                                                                     <span className={`text-[10px] font-bold border px-2 py-0.5 rounded ${u.subscription_expiry ? 'text-slate-500 border-slate-100 bg-slate-50' : 'text-amber-600 border-amber-100 bg-amber-50'}`}>
                                                                         {u.subscription_expiry ? `${calculateDaysLeft(u.subscription_expiry)} Days Left` : 'LIFETIME'}
                                                                     </span>
                                                                     <div className={`size-1.5 rounded-full animate-pulse ${u.subscription_expiry ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500'}`} />
                                                                 </div>
                                                             ) : (
                                                                 <span className="text-[10px] font-bold text-slate-300 uppercase italic">N/A</span>
                                                             )}
                                                         </td>
                                                         <td className="px-6 py-4 text-right">
                                                             <div className="flex items-center justify-end gap-2">
                                                                  {updatingUserId === u.id ? (
                                                                     <Loader2 className="size-4 animate-spin text-slate-400" />
                                                                 ) : (
                                                                     <div className="flex items-center justify-end gap-2">
                                                                             <div className="relative">
                                                                                 <button 
                                                                                     onClick={() => setOpenSubMenu(openSubMenu?.id === u.id && openSubMenu.type === 'pro' ? null : { id: u.id, type: 'pro' })}
                                                                                     className={`px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-widest transition-all border ${openSubMenu?.id === u.id && openSubMenu.type === 'pro' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-600 border-slate-100 hover:border-slate-400'}`}
                                                                                 >
                                                                                     Set Pro
                                                                                 </button>
                                                                                 {openSubMenu?.id === u.id && openSubMenu.type === 'pro' && (
                                                                                     <div className="absolute right-0 top-full mt-1 bg-white border border-slate-100 shadow-xl rounded-md overflow-hidden z-[100] divide-y divide-slate-50 min-w-[140px] animate-in fade-in slide-in-from-top-1">
                                                                                         <button onClick={() => setSubscription(u.id, 'pro', 30)} className="w-full px-4 py-2.5 text-[10px] font-bold uppercase text-left hover:bg-slate-50 text-slate-900 flex items-center justify-between gap-3">
                                                                                             <span>Monthly</span>
                                                                                             <span className="text-[9px] text-slate-400 font-medium whitespace-nowrap">30 Days</span>
                                                                                         </button>
                                                                                         <button onClick={() => setSubscription(u.id, 'pro', 365)} className="w-full px-4 py-2.5 text-[10px] font-bold uppercase text-left hover:bg-slate-50 text-slate-900 flex items-center justify-between gap-3">
                                                                                             <span>Annual</span>
                                                                                             <span className="text-[9px] text-slate-400 font-medium whitespace-nowrap">365 Days</span>
                                                                                         </button>
                                                                                         <button onClick={() => setSubscription(u.id, 'pro', null)} className="w-full px-4 py-2.5 text-[10px] font-bold uppercase text-left hover:bg-slate-50 text-slate-900 flex items-center justify-between gap-3">
                                                                                             <span>Lifetime</span>
                                                                                             <span className="text-[9px] text-slate-400 font-medium whitespace-nowrap">∞ Days</span>
                                                                                         </button>
                                                                                     </div>
                                                                                 )}
                                                                             </div>
                                                                             <div className="relative">
                                                                                 <button 
                                                                                     onClick={() => setOpenSubMenu(openSubMenu?.id === u.id && openSubMenu.type === 'enterprise' ? null : { id: u.id, type: 'enterprise' })}
                                                                                     className={`px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-widest transition-all border ${openSubMenu?.id === u.id && openSubMenu.type === 'enterprise' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-900 border-slate-100 hover:border-slate-900 shadow-sm'}`}
                                                                                 >
                                                                                     Set Enterprise
                                                                                 </button>
                                                                                 {openSubMenu?.id === u.id && openSubMenu.type === 'enterprise' && (
                                                                                     <div className="absolute right-0 top-full mt-1 bg-white border border-slate-100 shadow-xl rounded-md overflow-hidden z-[100] divide-y divide-slate-50 min-w-[140px] animate-in fade-in slide-in-from-top-1">
                                                                                         <button onClick={() => setSubscription(u.id, 'enterprise', 30)} className="w-full px-4 py-2.5 text-[10px] font-bold uppercase text-left hover:bg-slate-50 text-slate-900 flex items-center justify-between gap-3">
                                                                                             <span>Monthly</span>
                                                                                             <span className="text-[9px] text-slate-400 font-medium whitespace-nowrap">30 Days</span>
                                                                                         </button>
                                                                                         <button onClick={() => setSubscription(u.id, 'enterprise', 365)} className="w-full px-4 py-2.5 text-[10px] font-bold uppercase text-left hover:bg-slate-50 text-slate-900 flex items-center justify-between gap-3">
                                                                                             <span>Annual</span>
                                                                                             <span className="text-[9px] text-slate-400 font-medium whitespace-nowrap">365 Days</span>
                                                                                         </button>
                                                                                         <button onClick={() => setSubscription(u.id, 'enterprise', null)} className="w-full px-4 py-2.5 text-[10px] font-bold uppercase text-left hover:bg-slate-50 text-slate-900 flex items-center justify-between gap-3">
                                                                                             <span>Lifetime</span>
                                                                                             <span className="text-[9px] text-slate-400 font-medium whitespace-nowrap">∞ Days</span>
                                                                                         </button>
                                                                                     </div>
                                                                                 )}
                                                                             </div>
                                                                              <div className="relative group/revoke">
                                                                                  <button 
                                                                                      onClick={() => {
                                                                                          setConfirmModal({
                                                                                              isOpen: true,
                                                                                              type: 'UPGRADE',
                                                                                              userId: u.id,
                                                                                              tier: 'essential',
                                                                                              duration: 0,
                                                                                              email: u.email
                                                                                          });
                                                                                      }}
                                                                                      className="size-8 flex items-center justify-center hover:bg-red-50 text-slate-200 hover:text-red-500 rounded-full transition-all border border-transparent hover:border-red-100 shadow-sm hover:shadow-md"
                                                                                      title="Revoke Protocol Access"
                                                                                  >
                                                                                      <X className="size-3.5" />
                                                                                  </button>
                                                                              </div>
                                                                        </div>
                                                                     )}
                                                                 </div>
                                                              </td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan={5} className="py-16 text-center">
                                                            <p className="text-sm font-bold text-slate-400">No entities found</p>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'staff' && (
                                <motion.div
                                    key="staff"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-5"
                                >
                                    <div className="flex flex-col gap-5">
                                        <div className="flex items-center justify-between bg-white p-6 rounded-md border border-slate-100 shadow-sm">
                                            <div>
                                                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Staff Terminal</h1>
                                                <p className="text-sm text-slate-500 mt-1">Manage and provision administrative access levels.</p>
                                            </div>
                                            <button
                                                onClick={() => setShowStaffModal(true)}
                                                className="px-6 py-2.5 bg-slate-900 text-white rounded text-xs font-bold hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2"
                                            >
                                                <UserPlus className="size-4" /> Initialize Member
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-white border border-slate-100/60 rounded-sm shadow-sm">
                                        <table className="w-full text-left">
                                            <thead className="bg-[#fafafa] border-b border-slate-100">
                                                <tr>
                                                    <th className="px-5 py-3 text-[11px] font-bold uppercase text-slate-400">Member</th>
                                                    <th className="px-5 py-3 text-[11px] font-bold uppercase text-slate-400">Role</th>
                                                    <th className="px-5 py-3 text-[11px] font-bold uppercase text-slate-400">Clearance</th>
                                                    <th className="px-5 py-3 text-[11px] font-bold uppercase text-slate-400 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {staffUsers.map(u => (
                                                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-4">
                                                                <div className="size-8 rounded bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs uppercase border border-slate-100">
                                                                    {u.email?.charAt(0) || 'U'}
                                                                </div>
                                                                <p className="text-sm font-bold text-slate-900">{u.email || 'Unknown'}</p>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 ${u.role === 'owner' ? 'bg-slate-900 text-white' :
                                                                    u.role === 'manager' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                                                        'bg-amber-50 text-amber-600 border border-amber-100'
                                                                }`}>
                                                                {u.role}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col gap-1">
                                                                {(u.role === 'owner' || u.role === 'manager') && <span className="text-[10px] text-slate-400 font-bold uppercase">Full Database Edit</span>}
                                                                <span className="text-[10px] text-slate-400 font-bold uppercase">User & Support Access</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button
                                                                disabled={u.id === user?.id}
                                                                onClick={() => updateUserAccount(u.id, { newRole: 'recruiter' })}
                                                                className="px-4 py-1.5 bg-white text-red-600 rounded text-xs font-bold border border-slate-100 hover:border-red-200 hover:bg-red-50 transition-all shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
                                                            >
                                                                Revoke Access
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'history' && (
                                <motion.div
                                    key="history"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-5"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Action History</h1>
                                            <p className="text-sm text-slate-500 mt-1 max-w-xl">Live audit log of all administrative actions in this session.</p>
                                        </div>
                                        {actionLog.length > 0 && (
                                            <button
                                                onClick={() => setActionLog([])}
                                                className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors px-3 py-2 border border-slate-100 rounded-sm hover:border-red-100 hover:bg-red-50"
                                            >
                                                Clear Log
                                            </button>
                                        )}
                                    </div>

                                    <div className="bg-white border border-slate-100 rounded-md shadow-sm overflow-hidden">
                                        {actionLog.length === 0 ? (
                                            <div className="py-20 text-center">
                                                <div className="size-12 bg-slate-50 rounded-sm flex items-center justify-center mx-auto mb-4">
                                                    <History className="size-5 text-slate-200" />
                                                </div>
                                                <p className="text-sm font-bold text-slate-400">No actions recorded yet</p>
                                                <p className="text-xs text-slate-300 font-medium mt-1">Actions will appear here as you use the admin panel</p>
                                            </div>
                                        ) : (
                                            <table className="w-full text-left">
                                                <thead className="bg-[#fafafa] border-b border-slate-100">
                                                    <tr>
                                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Timestamp</th>
                                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Operation</th>
                                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Details</th>
                                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Initiator</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50">
                                                    {actionLog.map(log => (
                                                        <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                                            <td className="px-6 py-4">
                                                                <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">{log.time}</span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="text-[11px] font-bold text-slate-900 px-3 py-1 bg-white border border-slate-100 rounded-lg shadow-sm whitespace-nowrap">{log.action}</span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <p className="text-sm font-medium text-slate-600 leading-normal">{log.target}</p>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="size-8 rounded-lg bg-slate-900 flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0">
                                                                        {log.author?.charAt(0)?.toUpperCase() || 'A'}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-bold text-slate-900 leading-none">{log.author}</p>
                                                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5">{log.role}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            {actionLog.length} action{actionLog.length !== 1 ? 's' : ''} logged this session
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'messages' && (
                                <motion.div
                                    key="messages"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-6"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Support Hub Terminal</h1>
                                            <p className="text-sm text-slate-500 mt-1 max-w-xl">Communicate directly with users and resolve issues.</p>
                                        </div>
                                        <div className="flex bg-slate-100 p-0.5 rounded-lg">
                                            {(['Active', 'Closed'] as const).map((tab) => (
                                                <button
                                                    key={tab}
                                                    onClick={() => {
                                                        setSupportTicketTab(tab.toLowerCase() as any);
                                                        setSelectedChatId(null);
                                                    }}
                                                    className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${supportTicketTab === tab.toLowerCase() ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                                >
                                                    {tab}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* Chat Sidebar */}
                                        <div className="lg:col-span-1 space-y-2">
                                            <div className="bg-white border border-slate-100 rounded-md p-4 shadow-sm">
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-300 pointer-events-none" />
                                                    <input
                                                        type="text"
                                                        placeholder="Search conversations..."
                                                        className="w-full bg-slate-50 border border-slate-100 rounded-lg pl-9 pr-4 py-2 text-xs font-semibold outline-none focus:border-slate-900 transition-all placeholder:text-slate-400"
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div 
                                                data-lenis-prevent
                                                className="flex-1 overflow-y-auto custom-scrollbar focus:outline-none min-h-[500px]"
                                            >
                                                {(supportTicketTab === 'active' ? supportChats : closedChats).length === 0 ? (
                                                    <div className="p-8 text-center text-slate-300">
                                                        <Search className="size-8 mx-auto mb-3 opacity-20" />
                                                        <p className="text-[10px] font-black uppercase tracking-widest">No {supportTicketTab} uplinks</p>
                                                    </div>
                                                ) : (supportTicketTab === 'active' ? supportChats : closedChats).map(chat => (
                                                    <button
                                                        key={chat.id}
                                                        onClick={() => setSelectedChatId(chat.id)}
                                                        className={`w-full p-4 text-left bg-white border rounded transition-all group relative overflow-hidden ${selectedChatId === chat.id 
                                                            ? 'border-slate-900 ring-1 ring-slate-900/5 shadow-md' 
                                                            : 'border-slate-100 opacity-70 hover:opacity-100'}`}
                                                    >
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`size-2 rounded-full ${supportTicketTab === 'active' ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                                                                <span className="text-[10px] font-semibold text-slate-400">
                                                                    {new Date(chat.lastMessage?.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            </div>
                                                            <span className="text-[10px] font-bold text-slate-900/40 uppercase tracking-tighter">Support Uplink</span>
                                                        </div>
                                                        <h4 className="text-sm font-bold text-slate-900 truncate">
                                                            {chat.user.logo_url && <img src={chat.user.logo_url} className="size-4 rounded-sm inline mr-2" />}
                                                            {chat.user.company_name || chat.user.email}
                                                        </h4>
                                                        <p className="text-[11px] font-medium text-slate-500 truncate mt-1">{chat.lastMessage?.text || 'Ready for message initialization'}</p>
                                                        {selectedChatId === chat.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-900" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Chat Area */}
                                        <div className="lg:col-span-2">
                                            {(() => {
                                                const activeList = supportTicketTab === 'active' ? supportChats : closedChats;
                                                const activeChat = activeList.find(c => c.id === selectedChatId);
                                                if (!selectedChatId || !activeChat) return (
                                                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-slate-50/50 border border-slate-100 rounded-md h-[calc(100vh-200px)] min-h-[550px]">
                                                        <div className="size-16 rounded-md bg-white shadow-sm flex items-center justify-center mb-4 border border-slate-100">
                                                            <MessageSquare className="size-8 text-slate-200" />
                                                        </div>
                                                        <h3 className="text-sm font-bold text-slate-900">Support Hub Terminal</h3>
                                                        <p className="text-xs text-slate-500 mt-2">Select a channel from the sidebar to initialize communication protocols.</p>
                                                    </div>
                                                );

                                                return (
                                                    <div 
                                                        data-lenis-prevent
                                                        className="bg-white border border-slate-100 rounded-sm shadow-sm overflow-hidden flex flex-col h-[calc(100vh-200px)] min-h-[550px] overscroll-contain"
                                                    >
                                                        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                                            <div className="flex items-center gap-4">
                                                                <div className="size-10 rounded-lg bg-slate-900 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-slate-900/10 overflow-hidden">
                                                                    {activeChat.user.logo_url ? (
                                                                        <img src={activeChat.user.logo_url} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        activeChat.user.company_name?.charAt(0) || activeChat.user.email?.charAt(0) || 'U'
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <h3 className="text-base font-bold text-slate-900 leading-none mb-1">
                                                                        {activeChat.user.company_name || activeChat.user.email}
                                                                    </h3>
                                                                    <p className="text-xs text-slate-400 font-medium">Support Channel Detail</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {supportTicketTab === 'active' ? (
                                                                    <button 
                                                                        onClick={() => closeTicket(selectedChatId)}
                                                                        className="px-4 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-95"
                                                                    >
                                                                        Close Ticket
                                                                    </button>
                                                                ) : (
                                                                    <button 
                                                                        onClick={() => reopenTicket(selectedChatId)}
                                                                        className="px-4 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm active:scale-95"
                                                                    >
                                                                        Reopen Ticket
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div 
                                                            data-lenis-prevent
                                                            className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar overscroll-contain focus:outline-none bg-[#fdfdfd]"
                                                        >
                                                             {currentMessages.map(msg => (
                                                                 <div key={msg.id} className={`flex ${msg.sender === 'support' ? 'justify-end' : 'justify-start'}`}>
                                                                    <div className={`max-w-[85%] ${msg.sender === 'support' ? 'bg-slate-900 shadow-sm text-white' : 'bg-white border border-slate-100 text-slate-900 shadow-sm'} px-4 py-3 rounded-sm relative group transition-all`}>
                                                                         {msg.image_url && (
                                                                            <div 
                                                                                onClick={() => setSelectedImageUrl(msg.image_url)}
                                                                                className="mb-3 rounded-sm overflow-hidden bg-white border border-slate-100 cursor-zoom-in relative w-fit mx-auto"
                                                                            >
                                                                                <img 
                                                                                    src={msg.image_url} 
                                                                                    alt="Gateway Terminal Asset" 
                                                                                    className="max-w-full h-auto max-h-[350px] object-contain block mx-auto" 
                                                                                />
                                                                                <div className="absolute inset-0 bg-slate-900/0 hover:bg-slate-900/5 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                                                                                    <Maximize2 className="size-4 text-slate-900/40" />
                                                                                </div>
                                                                            </div>
                                                                         )}
                                                                         <p className="text-sm font-medium leading-relaxed text-inherit opacity-95 antialiased whitespace-pre-wrap">{msg.text}</p>
                                                                         <div className="flex items-center gap-2 mt-2 opacity-60">
                                                                            <span className="text-[9px] font-black uppercase tracking-widest leading-none">
                                                                                {msg.sender === 'support' ? 'HQ SUPPORT' : 'RECRUITER'} 
                                                                                <span className="mx-2 opacity-20">|</span> 
                                                                                {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                            </span>
                                                                         </div>
                                                                    </div>
                                                                </div>
                                                             ))}
                                                            <div ref={chatEndRef} />
                                                        </div>
                                                        <form 
                                                            onSubmit={async (e) => {
                                                                e.preventDefault();
                                                                if (!chatMessage.trim() || !selectedChatId || sending) return;
                                                                const msgText = chatMessage;
                                                                setChatMessage('');
                                                                setSending(true);
                                                                
                                                                const tempId = `tmp_${Date.now()}`;
                                                                setCurrentMessages(prev => [...prev, { id: tempId, sender: 'support', text: msgText, time: new Date().toISOString() }]);

                                                                try {
                                                                    await fetch('/api/support/admin/chats', {
                                                                        method: 'POST',
                                                                        headers: { 'Content-Type': 'application/json' },
                                                                        body: JSON.stringify({
                                                                            userId: selectedChatId,
                                                                            message_text: msgText,
                                                                            subject: 'SUPPORT'
                                                                        })
                                                                    });
                                                                } catch (err) {
                                                                    console.error('Failed to send message:', err);
                                                                } finally {
                                                                    setSending(false);
                                                                }
                                                            }}
                                                            className="p-4 bg-white border-t border-slate-50"
                                                        >
                                                            <div className="flex flex-col gap-3">
                                                                 <div className="flex flex-wrap gap-2">
                                                                    {supportDrafts.map((draft, idx) => (
                                                                        <button
                                                                            key={idx}
                                                                            type="button"
                                                                            onClick={() => {
                                                                                const list = supportTicketTab === 'active' ? supportChats : closedChats;
                                                                                const chat = list.find(c => c.id === selectedChatId);
                                                                                applyDraft(draft.text, chat?.user?.company_name || chat?.user?.email || 'User', 'chat');
                                                                            }}
                                                                            className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded text-[9px] font-black uppercase tracking-wider text-slate-500 hover:bg-slate-900 hover:border-slate-900 hover:text-white transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
                                                                        >
                                                                            {draft.label}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                                <div className="flex gap-3">
                                                                    <div className="flex-1 relative">
                                                                        <input
                                                                            type="text"
                                                                            value={chatMessage}
                                                                            onChange={(e) => setChatMessage(e.target.value)}
                                                                            placeholder="Type your message..."
                                                                            className="w-full bg-slate-50 border border-slate-100 rounded-md pl-4 pr-12 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-900 focus:bg-white transition-all placeholder:text-slate-400"
                                                                        />
                                                                         <button
                                                                              type="button"
                                                                              onClick={(e) => { e.stopPropagation(); handleSendGatewayImage('chat'); }}
                                                                              title="Send Gateway Terminal"
                                                                              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-900 transition-colors z-10"
                                                                         >
                                                                              <QrCode className="size-4" />
                                                                         </button>
                                                                    </div>
                                                                    <button
                                                                        type="submit"
                                                                        disabled={!chatMessage.trim() || sending}
                                                                        className="size-10 flex items-center justify-center bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-all shadow-md active:scale-95 flex-shrink-0 disabled:opacity-50"
                                                                        title="Send"
                                                                    >
                                                                        {sending ? <BouncyLoader size="sm" /> : <SendHorizontal className="size-4" />}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </form>
                                                    </div>
                                                )
                                            })()}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'upgrades' && (
                                <motion.div
                                    key="upgrades"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-6"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Activation Hub</h1>
                                            <p className="text-sm text-slate-500 mt-1 max-w-xl">Verify and process workspace upgrade requests.</p>
                                        </div>
                                        <div className="flex bg-slate-100 p-0.5 rounded-lg">
                                            {(['All', 'Arctic', 'Enterprise'] as const).map((f) => (
                                                <button
                                                    key={f}
                                                    onClick={() => setUpgradeFilter(f.toUpperCase() as any)}
                                                    className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${upgradeFilter === f.toUpperCase() ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                                >
                                                    {f}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* Request List */}
                                        <div className="lg:col-span-1 space-y-2">
                                            <div className="bg-white border border-slate-100 rounded-md p-4 shadow-sm">
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-300 pointer-events-none" />
                                                    <input
                                                        type="text"
                                                        value={searchQueryUpgrades}
                                                        onChange={(e) => setSearchQueryUpgrades(e.target.value)}
                                                        placeholder="Search requests..."
                                                        className="w-full bg-slate-50 border border-slate-100 rounded-md pl-9 pr-4 py-2 text-xs font-semibold outline-none focus:border-slate-900 transition-all placeholder:text-slate-400"
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div className="flex-1 overflow-y-auto custom-scrollbar focus:outline-none min-h-[500px]">
                                                {filteredUpgradeRequests.length === 0 ? (
                                                    <div className="p-8 text-center text-slate-300">
                                                        <Search className="size-8 mx-auto mb-3 opacity-20" />
                                                        <p className="text-[10px] font-black uppercase tracking-widest">No pending protocols</p>
                                                    </div>
                                                ) : (
                                                    filteredUpgradeRequests.map((req) => (
                                                        <button
                                                            key={req.id}
                                                            onClick={() => setSelectedUpgradeId(req.id)}
                                                            className={`w-full p-4 text-left bg-white border rounded transition-all group relative overflow-hidden ${selectedUpgradeId === req.id 
                                                                ? 'border-slate-900 ring-1 ring-slate-900/5 shadow-md' 
                                                                : 'border-slate-100 opacity-70 hover:opacity-100 hover:border-slate-100'}`}
                                                        >
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    <div className={`size-2 rounded-full ${req.status === 'pending' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                                                                    <span className="text-[10px] font-semibold text-slate-400">
                                                                        {req.time ? new Date(req.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'now'}
                                                                    </span>
                                                                </div>
                                                                <span className="text-[10px] font-bold text-slate-900/40 uppercase tracking-tighter">Activation Uplink</span>
                                                            </div>
                                                            <h4 className="text-sm font-bold text-slate-900 truncate">{req.name || req.user || 'Unknown'}</h4>
                                                            <p className="text-[11px] font-medium text-slate-500 truncate mt-1">{req.message || 'Protocol initialization requested'}</p>
                                                            {selectedUpgradeId === req.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-900" />}
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        </div>

                                        {/* Details Panel */}
                                        <div className="lg:col-span-2">
                                            {(() => {
                                                const req = upgradeRequests.find(r => r.id === selectedUpgradeId);
                                                
                                                if (!req) return (
                                                    <div className="h-full bg-white border border-slate-100 border-dashed rounded-md flex flex-col items-center justify-center p-12 text-center opacity-40">
                                                        <ArrowUpCircle className="size-10 mb-4 text-slate-300" />
                                                        <h3 className="text-sm font-bold text-slate-900">Awaiting Selection</h3>
                                                        <p className="text-xs text-slate-500 mt-2">Select a request from the sidebar to initialize activation protocols.</p>
                                                    </div>
                                                );

                                                return (
                                                    <div 
                                                        data-lenis-prevent
                                                        className="bg-white border border-slate-100 rounded-sm shadow-sm overflow-hidden flex flex-col h-[calc(100vh-200px)] min-h-[550px] overscroll-contain"
                                                    >
                                                        {/* Panel Header */}
                                                        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                                            <div className="flex items-center gap-4">
                                                                <div className="size-10 rounded-lg bg-slate-900 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-slate-900/10 uppercase">
                                                                    {req.name?.charAt(0) || req.user?.charAt(0) || 'U'}
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <h3 className="text-base font-bold text-slate-900 leading-none">
                                                                            {req.name || req.user}
                                                                        </h3>
                                                                        <button 
                                                                            onClick={() => setConfirmModal({ isOpen: true, type: 'RESOLVE_ACTIVATION', userId: req.id, email: req.user })}
                                                                            className="size-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm group"
                                                                            title="Resolve Activation Logic"
                                                                        >
                                                                            <Check className="size-3" />
                                                                        </button>
                                                                    </div>
                                                                    <p className="text-xs text-slate-400 font-medium">Uplink established • {req.status}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <div className="relative">
                                                                    <button
                                                                        onClick={() => setActivationDropdown(activationDropdown?.type === 'pro' ? null : { id: req.id, type: 'pro' })}
                                                                        className="px-4 py-2 bg-blue-50 text-blue-700 rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all border border-blue-100 flex items-center gap-2"
                                                                    >
                                                                        Set Pro <ChevronDown className="size-3" />
                                                                    </button>
                                                                    {activationDropdown?.type === 'pro' && (
                                                                        <div className="absolute top-full left-0 mt-1 bg-white border border-slate-100 shadow-xl rounded-md overflow-hidden z-50 min-w-[120px] divide-y divide-slate-50">
                                                                            <button onClick={() => { setSubscription(allUsers.find(u => u.email === req.user)?.id || '', 'pro', 30); setActivationDropdown(null); }} className="w-full px-4 py-2.5 text-[10px] font-bold text-left hover:bg-slate-50 text-slate-900 uppercase">Monthly</button>
                                                                            <button onClick={() => { setSubscription(allUsers.find(u => u.email === req.user)?.id || '', 'pro', 365); setActivationDropdown(null); }} className="w-full px-4 py-2.5 text-[10px] font-bold text-left hover:bg-slate-50 text-slate-900 uppercase">Annual</button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="relative">
                                                                    <button
                                                                        onClick={() => setActivationDropdown(activationDropdown?.type === 'enterprise' ? null : { id: req.id, type: 'enterprise' })}
                                                                        className="px-4 py-2 bg-slate-900 text-white rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md flex items-center gap-2"
                                                                    >
                                                                        Set Enterprise <ChevronDown className="size-3" />
                                                                    </button>
                                                                    {activationDropdown?.type === 'enterprise' && (
                                                                        <div className="absolute top-full right-0 mt-1 bg-white border border-slate-100 shadow-xl rounded-md overflow-hidden z-50 min-w-[120px] divide-y divide-slate-50">
                                                                            <button onClick={() => { setSubscription(allUsers.find(u => u.email === req.user)?.id || '', 'enterprise', 30); setActivationDropdown(null); }} className="w-full px-4 py-2.5 text-[10px] font-bold text-left hover:bg-slate-50 text-slate-900 uppercase">Monthly</button>
                                                                            <button onClick={() => { setSubscription(allUsers.find(u => u.email === req.user)?.id || '', 'enterprise', 365); setActivationDropdown(null); }} className="w-full px-4 py-2.5 text-[10px] font-bold text-left hover:bg-slate-50 text-slate-900 uppercase">Annual</button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Panel Body */}
                                                        <div className="flex-1 overflow-y-auto p-6 bg-[#fdfdfd] space-y-4 custom-scrollbar overscroll-contain">
                                                            {req.messages.map(msg => (
                                                                <div key={msg.id} className={`flex ${msg.sender === 'support' ? 'justify-end' : 'justify-start'}`}>
                                                                    <div className={`max-w-[85%] ${msg.sender === 'support' ? 'bg-slate-900 shadow-sm text-white' : 'bg-white border border-slate-100 text-slate-900 shadow-sm'} px-4 py-3 rounded-sm relative group transition-all`}>
                                                                        {msg.image_url && (
                                                                            <div 
                                                                                onClick={() => setSelectedImageUrl(msg.image_url)}
                                                                                className="mb-3 rounded-sm overflow-hidden bg-white border border-slate-100 cursor-zoom-in relative w-fit mx-auto"
                                                                            >
                                                                                <img 
                                                                                    src={msg.image_url} 
                                                                                    alt="Attachment" 
                                                                                    className="max-w-full h-auto max-h-[300px] object-contain block mx-auto" 
                                                                                />
                                                                            </div>
                                                                        )}
                                                                        <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                                                        <div className="flex items-center gap-2 mt-2 opacity-60">
                                                                            <span className="text-[9px] font-black uppercase tracking-widest leading-none">
                                                                                {msg.sender === 'support' ? 'HQ SUPPORT' : 'RECRUITER'} 
                                                                                <span className="mx-2 opacity-20">|</span> 
                                                                                {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            <div ref={chatEndRef} />
                                                        </div>

                                                        <div className="px-5 py-3 border-t border-slate-50 overflow-x-auto bg-white">
                                                            <div className="flex items-center gap-2 whitespace-nowrap">
                                                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mr-2">Terminal Drafts:</p>
                                                                {activationDrafts.map((draft, idx) => (
                                                                    <button
                                                                        key={idx}
                                                                        onClick={() => applyDraft(draft.text, req.name || req.user?.split('@')[0] || 'User', 'upgrade')}
                                                                        className="px-2 py-1 bg-slate-50 border border-slate-100 rounded text-[9px] font-bold uppercase tracking-wider text-slate-500 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                                                                    >
                                                                        {draft.label}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Quick Chat Input */}
                                                        <form 
                                                            onSubmit={async (e) => {
                                                                e.preventDefault();
                                                                if (!upgradeMessage.trim() || !selectedUpgradeId || sendingUpgrade) return;
                                                                const msgText = upgradeMessage;
                                                                setUpgradeMessage('');
                                                                setSendingUpgrade(true);
                                                                
                                                                setUpgradeRequests(prev => prev.map(r => r.id === req.id ? {
                                                                    ...r,
                                                                    messages: [...r.messages, { id: `tmp_${Date.now()}`, sender: 'support', text: msgText, time: new Date().toISOString() }]
                                                                } : r));

                                                                if (req.user_id) {
                                                                    try {
                                                                        await fetch('/api/support/admin/chats', {
                                                                            method: 'POST',
                                                                            headers: { 'Content-Type': 'application/json' },
                                                                            body: JSON.stringify({
                                                                                userId: req.user_id,
                                                                                message_text: msgText,
                                                                                subject: 'ACTIVATION'
                                                                            })
                                                                        });
                                                                    } catch (err) {
                                                                        console.error('Failed to send upgrade response:', err);
                                                                    } finally {
                                                                        setSendingUpgrade(false);
                                                                    }
                                                                }
                                                            }}
                                                            className="p-5 bg-white border-t border-slate-100"
                                                        >
                                                            <div className="flex gap-3">
                                                                <div className="flex-1 relative">
                                                                    <input
                                                                        type="text"
                                                                        value={upgradeMessage}
                                                                        onChange={(e) => setUpgradeMessage(e.target.value)}
                                                                        placeholder="Type a message to the user..."
                                                                        className="w-full bg-slate-50 border border-slate-100 rounded-md pl-4 pr-12 py-2.5 text-sm text-slate-900 outline-none focus:bg-white focus:border-slate-900 transition-all placeholder:text-slate-400"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => { e.stopPropagation(); handleSendGatewayImage('upgrade'); }}
                                                                        title="Send Gateway Terminal"
                                                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-900 transition-colors"
                                                                    >
                                                                        <QrCode className="size-4" />
                                                                    </button>
                                                                </div>
                                                                <button
                                                                    type="submit"
                                                                    disabled={!upgradeMessage.trim() || sendingUpgrade}
                                                                    className="size-10 flex items-center justify-center bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-all shadow-md active:scale-95 flex-shrink-0 disabled:opacity-50"
                                                                >
                                                                    {sendingUpgrade ? <BouncyLoader size="sm" /> : <SendHorizontal className="size-4" />}
                                                                </button>
                                                            </div>
                                                        </form>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'billing' && (
                                <motion.div
                                    key="billing"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-5"
                                >
                                    <div>
                                        <div>
                                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Fiscal Assets</h1>
                                            <p className="text-sm text-slate-500 mt-1 max-w-xl">Overview of system transactional records and subscription payments.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                                        {/* Left Side: Invoices Registry */}
                                        <div className="lg:col-span-7 bg-white border border-slate-100 rounded-md shadow-sm overflow-hidden flex flex-col h-[620px]">
                                            <div className="p-4 border-b border-slate-50 flex flex-col gap-4 bg-slate-50/30">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-xs font-bold text-slate-500 flex items-center gap-2">
                                                        <FileText className="size-4" /> Invoices Registry
                                                    </h3>
                                                    <div className="flex gap-1 bg-white p-1 rounded border border-slate-100 shadow-sm">
                                                        {(['All', 'NPR', 'Other'] as const).map(f => (
                                                            <button
                                                                key={f}
                                                                onClick={() => setInvoiceFilter(f.toUpperCase() as any)}
                                                                className={`px-3 py-1 text-xs font-semibold rounded transition-all ${invoiceFilter === f.toUpperCase() ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}
                                                            >
                                                                {f}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        placeholder="Search by invoice ID or purchaser..."
                                                        value={billingSearch}
                                                        onChange={(e) => setBillingSearch(e.target.value)}
                                                        className="w-full bg-white border border-slate-100 rounded-lg px-9 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900 transition-all"
                                                    />
                                                </div>
                                            </div>

                                            <div
                                                className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar overscroll-contain relative focus:outline-none"
                                                tabIndex={0}
                                                onMouseEnter={(e) => e.currentTarget.focus()}
                                                onWheel={(e) => e.stopPropagation()}
                                            >
                                                {filteredInvoices.length > 0 ? (
                                                    <div className="divide-y divide-slate-50">
                                                        {filteredInvoices.map((inv) => (
                                                            <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 hover:bg-slate-50/50 -mx-4 px-4 transition-colors group">
                                                                <div className="flex items-center gap-4">
                                                                    <div className={`size-8 rounded flex items-center justify-center border font-black text-[10px] ${inv.status === 'Succeeded' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : inv.status === 'Cancelled' ? 'bg-red-50 border-red-100 text-red-400 line-through' : 'bg-amber-50 border-amber-100 text-amber-600'}`}>
                                                                        {inv.currency === 'USD' ? '$' : 'Rs.'}
                                                                    </div>
                                                                    <div>
                                                                        <div className="flex items-center gap-2">
                                                                            <p className="text-sm font-bold text-slate-900 tracking-tight truncate max-w-[120px]">{inv.id}</p>
                                                                            <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-bold">{inv.plan?.split(' ')?.[0] || 'Plan'}</span>
                                                                        </div>
                                                                        <p className="text-xs text-slate-500 truncate max-w-[200px]">{inv.purchaser}</p>
                                                                        {inv.company && inv.company !== '—' && (
                                                                            <p className="text-[10px] text-slate-400 font-medium truncate max-w-[200px]">{inv.company}</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-3 mt-2 sm:mt-0">
                                                                    <div className="text-right">
                                                                        <p className="text-sm font-bold text-slate-900 leading-none mb-1">{inv.currency} {inv.amount?.toLocaleString()}</p>
                                                                        <p className={`text-[10px] font-bold ${inv.status === 'Succeeded' ? 'text-emerald-600' : 'text-amber-600'}`}>{inv.status}</p>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => setSelectedInvoice(inv)}
                                                                        className="p-1.5 text-slate-300 hover:text-slate-900 border border-transparent hover:border-slate-100 rounded transition-all"
                                                                        title="View details"
                                                                    >
                                                                        <ExternalLink className="size-3.5" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setInvoices(prev => prev.map(i => i.id === inv.id ? { ...i, status: 'Cancelled' } : i))}
                                                                        className="p-1.5 text-slate-200 hover:text-red-500 border border-transparent hover:border-red-100 hover:bg-red-50 rounded transition-all"
                                                                        title="Cancel invoice"
                                                                    >
                                                                        <X className="size-3.5" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="h-full flex flex-col items-center justify-center opacity-40">
                                                        <Search className="size-8 mb-4 text-slate-300" />
                                                        <p className="text-xs font-bold text-slate-400">No Records Found</p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                                                <span className="text-[10px] font-bold text-slate-400">{filteredInvoices.length} Active Records Loaded</span>
                                                <button className="text-[10px] font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1.5">
                                                    Load Full Registry <ChevronDown className="size-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Right Side: Gateway Terminal */}
                                        <div className="lg:col-span-5 space-y-5">
                                            <div className="bg-white border border-slate-100/60 rounded-sm p-5 shadow-sm overflow-hidden flex flex-col relative">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="text-xs font-bold text-slate-500 flex items-center gap-2">
                                                        <ShieldCheck className="size-4" /> Gateway Terminal
                                                    </h3>
                                                    {user?.role === 'owner' && (
                                                        <button
                                                            onClick={() => {
                                                                setIsEditingQR(!isEditingQR);
                                                                setTempQRValue(qrValue);
                                                                setTempQrImageUrl(qrImageUrl);
                                                            }}
                                                            className={`p-1.5 rounded transition-all border ${isEditingQR ? 'bg-red-50 border-red-100 text-red-600' : 'text-slate-400 hover:text-[#0f172a] hover:bg-slate-50 border-transparent'}`}
                                                        >
                                                            {isEditingQR ? <X className="size-3.5" /> : <Edit2 className="size-3.5" />}
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#fafafa] border border-slate-50 rounded-sm">
                                                    {!isEditingQR ? (
                                                        <>
                                                            <div className="size-32 bg-white border border-slate-100 p-4 rounded-sm shadow-sm mb-6 flex items-center justify-center relative group">
                                                                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '8px 8px' }} />
                                                                <div
                                                                    className="w-full h-full bg-contain bg-center bg-no-repeat opacity-90 relative z-10"
                                                                    style={{ backgroundImage: `url('${qrImageUrl || `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrValue}`}')` }}
                                                                />
                                                                <div className="absolute inset-0 bg-slate-900/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                    <QrCode className="size-6 text-slate-400" />
                                                                </div>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <h4 className="text-xs font-bold text-slate-900">Protocol Gateway</h4>
                                                                <p className="text-[10px] font-medium text-slate-500">Secure Fiscal Channel</p>
                                                            </div>

                                                            <div className="mt-6 w-full pt-6 border-t border-slate-100 flex items-center justify-center gap-4">
                                                                <div className="text-left">
                                                                    <p className="text-[10px] font-bold text-slate-300 mb-0.5">STATUS</p>
                                                                    <p className="text-xs font-bold text-emerald-600 flex items-center gap-1.5"><span className="size-1.5 bg-emerald-500 rounded-full animate-pulse" /> Active</p>
                                                                </div>
                                                                <div className="h-6 w-px bg-slate-100" />
                                                                <div className="text-left">
                                                                    <p className="text-[10px] font-bold text-slate-300 mb-0.5">RECORDS</p>
                                                                    <p className="text-xs font-bold text-slate-900">{invoices.length}</p>
                                                                </div>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="w-full space-y-4 text-left">
                                                            <div className="space-y-1.5">
                                                                <label className="block text-xs font-bold text-slate-500">Dynamic QR Payload</label>
                                                                <div className="relative">
                                                                    <Code className="absolute left-3 top-1/2 -translate-y-1/2 size-3 text-slate-400" />
                                                                    <input
                                                                        type="text"
                                                                        value={tempQRValue}
                                                                        onChange={(e) => setTempQRValue(e.target.value)}
                                                                        disabled={!!tempQrImageUrl}
                                                                        className="w-full bg-white border border-slate-100 rounded-sm pl-8 pr-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-[#0f172a] disabled:opacity-50 disabled:bg-slate-50"
                                                                        placeholder="e.g. Payment ID or URL"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="relative flex items-center py-2">
                                                                <div className="flex-grow border-t border-slate-100" />
                                                                <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-400">OR OVERRIDE WITH IMAGE</span>
                                                                <div className="flex-grow border-t border-slate-100" />
                                                            </div>

                                                            <div className="space-y-1.5">
                                                                 <div className="flex gap-2">
                                                                    <div className="relative flex-1">
                                                                        <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-3 text-slate-400" />
                                                                        <input
                                                                            type="text"
                                                                            value={tempQrImageUrl}
                                                                            onChange={(e) => setTempQrImageUrl(e.target.value)}
                                                                            className="w-full bg-white border border-slate-100 rounded-sm pl-8 pr-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-[#0f172a]"
                                                                            placeholder="https://example.com/qr.png"
                                                                        />
                                                                    </div>
                                                                    <button
                                                                        onClick={() => gatewayUploadRef.current?.click()}
                                                                        className="px-3 bg-white border border-slate-100 rounded-sm hover:bg-slate-50 transition-colors"
                                                                        title="Upload image"
                                                                    >
                                                                        {uploadingAdminImage ? <Loader2 className="size-3 animate-spin text-slate-400" /> : <Upload className="size-3 text-slate-400" />}
                                                                    </button>
                                                                    <input
                                                                        type="file"
                                                                        ref={gatewayUploadRef}
                                                                        className="hidden"
                                                                        accept="image/*"
                                                                        onChange={handleGatewayImageUpload}
                                                                    />
                                                                </div>
                                                                <p className="text-[8px] font-medium text-slate-400 italic">Leave empty to use automatic generator or upload an image.</p>
                                                            </div>

                                                            <button
                                                                onClick={() => {
                                                                    setQrValue(tempQRValue);
                                                                    setQrImageUrl(tempQrImageUrl);
                                                                    setIsEditingQR(false);
                                                                }}
                                                                className="w-full py-3 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-all shadow-lg"
                                                            >
                                                                <Save className="size-4" /> Save Configuration
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => setShowReceiptModal(true)}
                                                className="w-full py-4 bg-[#0f172a] text-white rounded-sm text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all flex justify-center items-center gap-3 shadow-xl shadow-blue-900/20 active:scale-[0.98] group"
                                            >
                                                VERIFICATION QUEUE
                                                <span className="px-2 py-0.5 bg-red-500 text-white rounded-sm text-[8px] font-black shadow-inner">
                                                    {pendingReceipts.length}
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    )}
                </div>
              </div>
            </main>

            {/* Image Preview Modal */}
            <AnimatePresence>
                {selectedImageUrl && (
                    <div 
                        className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-12 cursor-zoom-out"
                        onClick={() => setSelectedImageUrl(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative max-w-5xl w-full bg-white rounded-md overflow-hidden shadow-2xl flex flex-col md:flex-row"
                        >
                            <div className="flex-1 bg-white p-8 md:p-16 flex items-center justify-center relative min-h-[400px]">
                                <img 
                                    src={selectedImageUrl} 
                                    alt="Full Size QR" 
                                    className="max-w-full max-h-[70vh] object-contain shadow-sm"
                                />
                                <button 
                                    onClick={() => setSelectedImageUrl(null)}
                                    className="absolute top-6 right-6 p-3 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-all shadow-xl active:scale-95 group"
                                >
                                    <X className="size-5 group-hover:rotate-90 transition-transform duration-300" />
                                </button>
                            </div>
                            <div className="w-full md:w-80 bg-slate-50 p-8 border-l border-slate-100 flex flex-col justify-between">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="size-12 bg-slate-900 rounded-md flex items-center justify-center text-white shadow-lg">
                                            <QrCode className="size-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900">Gateway Terminal</h3>
                                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5">Secure Scan Ready</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="p-4 bg-white border border-slate-100 rounded-lg shadow-sm">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Protocol Details</p>
                                            <p className="text-sm font-medium text-slate-900 leading-relaxed">
                                                This terminal facilitates secure fiscal transactions. Please ensure you are scanning within a verified network.
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 p-3 bg-blue-50/50 border border-blue-100 rounded-md text-blue-700">
                                            <ShieldCheck className="size-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">Verified Fiscal Channel</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => window.open(selectedImageUrl, '_blank')}
                                    className="w-full py-4 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-all shadow-xl flex items-center justify-center gap-2 mt-8 active:scale-[0.98]"
                                >
                                    <Download className="size-4" /> Open Original Image
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Add Staff Modal */}
            {showStaffModal && (
                <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-sm shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] border border-slate-100 w-full max-w-xl overflow-hidden relative"
                    >
                        <button onClick={() => setShowStaffModal(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded transition-colors">
                            <X className="size-4" />
                        </button>

                        <div className="p-6 border-b border-slate-100">
                            <h2 className="text-lg font-black text-slate-900 tracking-tight">Add Staff Member</h2>
                            <p className="text-xs text-slate-500 font-medium mt-1">Designate an existing user account to internal staff.</p>
                        </div>

                        <form onSubmit={handleAddStaff} className="p-6 space-y-5">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-[#94a3b8] mb-2">User Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={newStaffEmail}
                                    onChange={e => setNewStaffEmail(e.target.value)}
                                    placeholder="e.g. agent@example.com"
                                    className="w-full bg-white border border-slate-100 rounded px-3 py-2 text-sm font-bold text-slate-900 focus:border-[#0f172a] outline-none"
                                />
                                <p className="text-[10px] text-slate-400 mt-1">User must already have an account registered.</p>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-[#94a3b8] mb-2">Access Role</label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {user?.role === 'owner' && (
                                        <button
                                            type="button"
                                            onClick={() => setNewStaffRole('owner')}
                                            className={`p-3 border rounded text-left transition-all ${newStaffRole === 'owner' ? 'border-[#0f172a] bg-slate-50 ring-1 ring-[#0f172a]' : 'border-slate-100 hover:border-slate-300'}`}
                                        >
                                            <p className="text-xs font-black text-slate-900 uppercase tracking-tight mb-1 flex items-center gap-1"><ShieldCheck className="size-3 text-emerald-500" /> Superadmin</p>
                                            <p className="text-[9px] text-slate-500 font-bold leading-tight">Total control. Can add other admins.</p>
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setNewStaffRole('manager')}
                                        className={`p-3 border rounded text-left transition-all ${newStaffRole === 'manager' ? 'border-[#0f172a] bg-slate-50 ring-1 ring-[#0f172a]' : 'border-slate-100 hover:border-slate-300'}`}
                                    >
                                        <p className="text-xs font-black text-slate-900 uppercase tracking-tight mb-1">Manager</p>
                                        <p className="text-[9px] text-slate-500 font-bold leading-tight">Can edit user tiers, listings, and global DB.</p>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNewStaffRole('support')}
                                        className={`p-3 border rounded text-left transition-all ${newStaffRole === 'support' ? 'border-[#0f172a] bg-slate-50 ring-1 ring-[#0f172a]' : 'border-slate-100 hover:border-slate-300'}`}
                                    >
                                        <p className="text-xs font-black text-slate-900 uppercase tracking-tight mb-1">Support</p>
                                        <p className="text-[9px] text-slate-500 font-bold leading-tight">View users and handle support queue messaging.</p>
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={addingStaff}
                                className="w-full py-3 bg-[#0f172a] hover:bg-slate-800 text-white rounded text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
                            >
                                {addingStaff ? <Loader2 className="size-4 animate-spin" /> : 'Grant Regional Access'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Invoice Viewer Modal */}
            {selectedInvoice && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded shadow-2xl overflow-hidden relative max-w-md w-full"
                    >
                        <button onClick={() => setSelectedInvoice(null)} className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded transition-colors z-10">
                            <X className="size-5" />
                        </button>

                        <div id="invoice-printable" className="p-10 pb-8">
                            {/* Invoice Header */}
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <img src="/recruit-flow-logo.png" alt="Recruit Flow Logo" className="h-7 w-auto mb-3" />
                                    <h1 className="text-2xl font-black text-[#0f172a] tracking-tight uppercase leading-none">Invoice</h1>
                                    <p className="text-[10px] font-bold text-slate-500 mt-1">{selectedInvoice.id}</p>
                                </div>
                                <div className="text-right space-y-1">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Date Issued</p>
                                    <p className="text-xs font-bold text-slate-900">
                                        {selectedInvoice.date
                                            ? new Date(selectedInvoice.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                                            : '—'}
                                    </p>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-2">Status</p>
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${selectedInvoice.status === 'Succeeded' ? 'text-emerald-500' : 'text-amber-500'}`}>{selectedInvoice.status}</p>
                                </div>
                            </div>

                            {/* Billing Parties */}
                            <div className="grid grid-cols-2 gap-8 mb-6 border-y border-slate-100 py-6">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Billed To</p>
                                    <h3 className="text-sm font-bold text-slate-900 mb-0.5">{selectedInvoice.purchaser}</h3>
                                    {selectedInvoice.company && selectedInvoice.company !== '—' && (
                                        <p className="text-xs font-bold text-slate-700 mb-0.5">{selectedInvoice.company}</p>
                                    )}
                                    <p className="text-xs text-slate-500 leading-tight font-medium">Customer Account</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Paid To</p>
                                    <h3 className="text-sm font-black text-slate-900 mb-1">Recruit Flow</h3>
                                    <p className="text-xs text-slate-500 leading-tight font-medium">Itahari, Sunsari, Nepal</p>
                                    {selectedInvoice.activatedBy && (
                                        <p className="text-[10px] text-slate-400 mt-1">Activated by: {selectedInvoice.activatedBy}</p>
                                    )}
                                </div>
                            </div>

                            {/* Line Items */}
                            <table className="w-full text-left mb-6">
                                <thead className="border-b-2 border-slate-900">
                                    <tr>
                                        <th className="py-2 text-[9px] font-black uppercase tracking-widest text-[#0f172a]">Item Description</th>
                                        <th className="py-2 text-[9px] font-black uppercase tracking-widest text-[#0f172a] text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-slate-50">
                                        <td className="py-4">
                                            <p className="text-xs font-bold text-slate-900">{selectedInvoice.plan} — Platform Subscription</p>
                                            <p className="text-[10px] text-slate-500 mt-0.5">
                                                Access Grant{selectedInvoice.duration ? ` · ${selectedInvoice.duration}` : ' · Lifetime'}
                                            </p>
                                        </td>
                                        <td className="py-4 text-right">
                                            <p className="text-xs font-black text-slate-900">{selectedInvoice.currency} {selectedInvoice.amount?.toLocaleString()}</p>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* Totals */}
                            <div className="flex justify-end">
                                <div className="w-44 space-y-2">
                                    <div className="flex justify-between items-center text-[10px] font-medium text-slate-500">
                                        <span>Subtotal</span>
                                        <span>{selectedInvoice.currency} {selectedInvoice.amount?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-t border-slate-900 pt-2">
                                        <span className="text-[10px] font-black text-[#0f172a] uppercase tracking-widest">Total Paid</span>
                                        <span className="text-sm font-black text-[#0f172a]">{selectedInvoice.currency} {selectedInvoice.amount?.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-100 pt-6">
                                Thank you for your business · work@ujjwalrupakheti.com.np
                            </div>
                        </div>

                        {/* Modal Actions */}
                        <div className="bg-slate-50 p-5 flex items-center justify-between gap-3 border-t border-slate-100">
                            <button
                                onClick={() => {
                                    setInvoices(prev => prev.map(i => i.id === selectedInvoice.id ? { ...i, status: 'Cancelled' } : i));
                                    setSelectedInvoice(null);
                                }}
                                className="px-4 py-2.5 text-red-500 rounded text-xs font-black uppercase tracking-widest border border-red-100 hover:bg-red-50 transition-all"
                            >
                                Cancel Invoice
                            </button>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setSelectedInvoice(null)}
                                    className="px-5 py-2.5 bg-white text-slate-700 rounded text-xs font-black uppercase tracking-widest border border-slate-100 hover:bg-slate-100 transition-all"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => {
                                        const originalTitle = document.title;
                                        const username = selectedInvoice.purchaser.split('@')[0];
                                        document.title = `${selectedInvoice.id}-${username}`;
                                        window.print();
                                        setTimeout(() => { document.title = originalTitle; }, 500);
                                    }}
                                    className="px-5 py-2.5 bg-[#0f172a] text-white rounded text-xs font-black uppercase tracking-widest border border-transparent hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2"
                                >
                                    <FileText className="size-4" /> Save / Print
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
            {/* Receipt Review Modal */}
            <AnimatePresence>
                {showReceiptModal && (
                    <div className="fixed inset-0 bg-[#0f172a]/40 backdrop-blur-md z-50 flex items-center justify-center p-4 lg:p-8">
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 40 }}
                            className="bg-white rounded-sm shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] overflow-hidden relative max-w-5xl w-full h-full max-h-[700px] flex flex-col border border-slate-100"
                        >
                            {/* Arctic Header Strategy */}
                            <div className="h-14 border-b border-slate-100 flex items-center justify-between px-6 bg-white shrink-0">
                                <div className="flex items-center gap-4">
                                    <div className="size-8 bg-slate-50 border border-slate-100 rounded-sm flex items-center justify-center text-slate-900">
                                        <ShieldCheck className="size-4" />
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest leading-none">Receipt Registry</h3>
                                        <div className="w-px h-3 bg-slate-200" />
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">Fiscal Terminal</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowReceiptModal(false)} className="size-8 flex items-center justify-center text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-sm transition-all">
                                    <X className="size-4" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row min-h-0 bg-[#fafafa]">
                                {pendingReceipts.length > 0 ? (
                                    <>
                                        {/* Left Side: Navigation Sidebar (Registry Style) */}
                                        <div className="w-full lg:w-72 border-r border-slate-100 flex flex-col shrink-0 bg-white">
                                            <div className="p-4 border-b border-slate-50 bg-[#fafafa]">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Queue Index ({pendingReceipts.length})</p>
                                            </div>
                                            <div 
                                                className="flex-1 overflow-y-auto custom-scrollbar overscroll-contain focus:outline-none"
                                                tabIndex={0}
                                                onMouseEnter={(e) => e.currentTarget.focus()}
                                                onWheel={(e) => e.stopPropagation()}
                                            >
                                                {pendingReceipts.map((receipt, idx) => (
                                                    <button
                                                        key={receipt.id}
                                                        onClick={() => setSelectedReceiptIndex(idx)}
                                                        className={`w-full p-5 text-left border-b border-slate-50 transition-all relative ${selectedReceiptIndex === idx ? 'bg-slate-50' : 'hover:bg-slate-50/50'}`}
                                                    >
                                                        {selectedReceiptIndex === idx && <div className="absolute inset-y-0 left-0 w-1 bg-[#0f172a]" />}
                                                        <div className="flex justify-between items-start mb-1.5">
                                                            <p className="text-[10px] font-black text-slate-900 tracking-tighter uppercase">ID: {receipt.id}</p>
                                                            <span className="text-[7px] font-black text-slate-300 uppercase tracking-widest">{receipt.date}</span>
                                                        </div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight truncate mb-2">{receipt.user}</p>
                                                        <div className="flex items-center justify-between">
                                                            <span className="px-1.5 py-0.5 bg-white border border-slate-100 rounded-sm text-[8px] font-black text-emerald-600 uppercase tracking-widest">{receipt.plan?.split(' ')?.[0] || 'Plan'}</span>
                                                            <span className="text-[9px] font-black text-slate-900 tracking-tighter uppercase">{receipt.amount}</span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Middle: Professional Evidence Viewer */}
                                        <div className="flex-1 p-12 flex flex-col bg-[#fafafa] relative overflow-hidden">
                                            <div className="flex-1 bg-white rounded-sm border border-slate-100 shadow-sm relative overflow-hidden flex items-center justify-center p-8 group">
                                                {/* Grid background for technical feel */}
                                                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

                                                <img
                                                    src={pendingReceipts[selectedReceiptIndex]?.receipt_url || ''}
                                                    alt="Asset Evidence"
                                                    className="max-h-full max-w-full object-contain relative z-10"
                                                />

                                                <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-white via-white/95 to-transparent z-20">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Asset Hash</p>
                                                            <p className="text-[11px] font-mono font-bold text-slate-900 uppercase">{pendingReceipts[selectedReceiptIndex]?.txn_id || 'N/A'}</p>
                                                        </div>
                                                        <button className="px-5 py-2.5 bg-slate-900 text-white rounded-sm text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-blue-900/10 active:scale-95">
                                                            <Maximize2 className="size-3" /> Digital Zoom
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Side: Protocol Actions */}
                                        <div className="w-full lg:w-[320px] bg-white border-l border-slate-100 flex flex-col shrink-0">
                                            <div 
                                                className="p-6 flex-1 space-y-6 overflow-y-auto custom-scrollbar overscroll-contain focus:outline-none"
                                                tabIndex={0}
                                                onMouseEnter={(e) => e.currentTarget.focus()}
                                                onWheel={(e) => e.stopPropagation()}
                                            >
                                                <div className="space-y-4">
                                                    <section>
                                                        <label className="text-[10px] font-bold uppercase text-slate-400 block mb-2">Requesting User</label>
                                                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg">
                                                            <p className="text-sm font-bold text-slate-900 break-all">{pendingReceipts[selectedReceiptIndex]?.user || 'Unknown'}</p>
                                                            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                                                                <div className="size-2 bg-emerald-500 rounded-full" />
                                                                <p className="text-[10px] font-bold text-slate-500 uppercase">Identity Verified</p>
                                                            </div>
                                                        </div>
                                                    </section>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <section>
                                                            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-2">Transaction Value</label>
                                                            <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg">
                                                                <p className="text-sm font-bold text-slate-900">{pendingReceipts[selectedReceiptIndex]?.amount || '0.00'}</p>
                                                            </div>
                                                        </section>
                                                        <section>
                                                            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-2">Requested Plan</label>
                                                            <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg">
                                                                <p className="text-sm font-bold text-emerald-600">{pendingReceipts[selectedReceiptIndex]?.plan?.split(' ')?.[0] || 'Plan'}</p>
                                                            </div>
                                                        </section>
                                                    </div>

                                                    <section>
                                                        <label className="text-[10px] font-bold uppercase text-slate-400 block mb-2">Internal Transaction Hash</label>
                                                        <div className="p-4 bg-slate-900 rounded-lg flex items-center justify-between">
                                                            <p className="text-xs font-mono font-bold text-white break-all">{pendingReceipts[selectedReceiptIndex]?.txn_id || 'N/A'}</p>
                                                            <div className="size-2 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                                                        </div>
                                                    </section>
                                                </div>

                                                <div className="space-y-3 pt-2">
                                                    <button
                                                        onClick={() => {
                                                            const newQueue = pendingReceipts.filter((_, i) => i !== selectedReceiptIndex);
                                                            setPendingReceipts(newQueue);
                                                            setSelectedReceiptIndex(0);
                                                        }}
                                                        className="w-full py-4 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-all shadow-xl flex items-center justify-center gap-2"
                                                    >
                                                        <Check className="size-4" /> Authorize Upgrade
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const newQueue = pendingReceipts.filter((_, i) => i !== selectedReceiptIndex);
                                                            setPendingReceipts(newQueue);
                                                            setSelectedReceiptIndex(0);
                                                        }}
                                                        className="w-full py-4 bg-white border border-red-100 text-red-500 rounded-lg text-sm font-bold hover:bg-red-50 hover:border-red-200 transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <X className="size-4" /> Reject Request
                                                    </button>
                                                </div>

                                                <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 border-l-4 border-l-amber-400">
                                                    <div className="flex gap-3">
                                                        <ShieldAlert className="size-4 text-amber-500 shrink-0" />
                                                        <p className="text-xs font-semibold text-amber-700 leading-relaxed">
                                                            Manual verification required. Cross-reference Reference ID with Global portal.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-full py-40 text-center flex flex-col items-center justify-center bg-white">
                                        <div className="p-8 bg-emerald-50 rounded-full mb-8 border border-emerald-100">
                                            <Check className="size-16 text-emerald-500" />
                                        </div>
                                        <h4 className="text-3xl font-bold text-slate-900 tracking-tight">Queue Cleared</h4>
                                        <p className="text-base text-slate-500 mt-4 max-w-sm">All registry entries have been successfully processed.</p>
                                        <button
                                            onClick={() => setShowReceiptModal(false)}
                                            className="mt-12 px-12 py-4 bg-slate-900 text-white rounded-md text-sm font-bold hover:bg-slate-800 transition-all shadow-xl"
                                        >
                                            Return to Hub
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
