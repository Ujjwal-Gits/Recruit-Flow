'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, ShieldCheck, LogOut, ChevronDown, User, Menu, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const ADMIN_ROLES = ['owner', 'manager', 'support', 'admin'];

export default function PublicNavbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [sessionLoading, setSessionLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [roleLoading, setRoleLoading] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchRole = async () => {
            setRoleLoading(true);
            try {
                // Use our own API instead of querying Supabase directly —
                // avoids RLS 500 errors when the anon key lacks SELECT on profiles
                const res = await fetch('/api/profile', { cache: 'no-store' });
                if (res.ok) {
                    const { profile } = await res.json();
                    setUserRole(profile?.role ?? null);
                } else {
                    setUserRole(null);
                }
            } catch {
                setUserRole(null);
            } finally {
                setRoleLoading(false);
            }
        };

        supabase.auth.getSession().then(({ data: { session } }) => {
            setIsLoggedIn(!!session);
            if (session?.user?.id) fetchRole();
            if (session?.user?.email) setUserEmail(session.user.email);
            setSessionLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsLoggedIn(!!session);
            if (session?.user?.id) fetchRole();
            if (session?.user?.email) setUserEmail(session.user.email);
            else { setUserRole(null); setUserEmail(null); setRoleLoading(false); }
            setSessionLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const isAdmin = ADMIN_ROLES.includes(userRole || '');
    const dashboardHref = isAdmin ? '/iamadmin' : '/dashboard';

    const navLinks = [
        { href: '/features', label: 'Features' },
        { href: '/how-it-works', label: 'How It Works' },
        { href: '/pricing', label: 'Pricing' },
        { href: '/blog', label: 'Blog' },
    ];

    const handleLogout = async () => {
        setDropdownOpen(false);
        await supabase.auth.signOut();
        setIsLoggedIn(false);
        setUserRole(null);
        setUserEmail(null);
        router.push('/');
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-center">
            <div className="w-full max-w-[1200px] px-5 md:px-8 flex items-center justify-between relative">
                <Link href="/" className="h-9 w-auto">
                    <img src="/recruit-flow-logo.png" alt="Recruit Flow" className="h-full w-auto object-contain" />
                </Link>

                {/* Desktop nav links */}
                <div className="hidden md:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
                    {navLinks.map(({ href, label }) => (
                        <Link key={href} href={href} prefetch={true}
                            className={`text-xs font-semibold tracking-tight transition-colors ${pathname === href ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'}`}>
                            {label}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    {/* Auth area */}
                    {sessionLoading ? (
                        <div className="h-8 w-8 bg-slate-100 rounded-full animate-pulse" />
                    ) : isLoggedIn ? (
                        <div className="relative" ref={dropdownRef}>
                            <button onClick={() => setDropdownOpen(o => !o)}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                                <div className="size-7 rounded-full bg-slate-900 flex items-center justify-center text-white shrink-0">
                                    {roleLoading ? <span className="size-3 rounded-full bg-white/20 animate-pulse" />
                                        : isAdmin ? <ShieldCheck className="size-3.5 text-emerald-400" />
                                        : <User className="size-3.5" />}
                                </div>
                                <ChevronDown className={`size-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {dropdownOpen && (
                                <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-100 rounded-sm shadow-xl overflow-hidden z-50">
                                    <div className="px-4 py-3 border-b border-slate-50">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{isAdmin ? 'Staff Account' : 'Recruiter'}</p>
                                        <p className="text-xs font-bold text-slate-900 truncate">{userEmail}</p>
                                    </div>
                                    <Link href={dashboardHref} onClick={() => setDropdownOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                                        {isAdmin ? <ShieldCheck className="size-4 text-emerald-500" /> : <LayoutDashboard className="size-4 text-slate-400" />}
                                        {isAdmin ? 'Admin Panel' : 'Dashboard'}
                                    </Link>
                                    <button onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors border-t border-slate-50">
                                        <LogOut className="size-4" /> Log out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="hidden md:flex items-center gap-3">
                            <Link href="/login" className="text-slate-900 text-xs font-bold tracking-tight px-4 py-2 hover:bg-slate-50 rounded transition-all">Log in</Link>
                            <Link href="/register" className="bg-slate-900 text-white text-xs font-bold tracking-tight px-5 py-2.5 rounded hover:bg-slate-800 transition-all shadow-md active:scale-95">Sign Up</Link>
                        </div>
                    )}

                    {/* Mobile burger */}
                    <button onClick={() => setMobileOpen(o => !o)}
                        className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded transition-all">
                        {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-slate-100 shadow-lg z-40 px-5 py-4 space-y-1">
                    {navLinks.map(({ href, label }) => (
                        <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                            className={`block px-3 py-3 rounded-sm text-sm font-semibold transition-colors ${pathname === href ? 'bg-slate-50 text-slate-900 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                            {label}
                        </Link>
                    ))}
                    {!isLoggedIn && !sessionLoading && (
                        <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                            <Link href="/login" onClick={() => setMobileOpen(false)}
                                className="block px-3 py-3 rounded-sm text-sm font-bold text-slate-900 hover:bg-slate-50 transition-colors">Log in</Link>
                            <Link href="/register" onClick={() => setMobileOpen(false)}
                                className="block px-3 py-3 rounded-sm text-sm font-bold bg-slate-900 text-white text-center hover:bg-slate-800 transition-colors">Sign Up</Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
}
