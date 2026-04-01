'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import BouncyLoader from '@/components/BouncyLoader';

const ADMIN_ROLES = ['owner', 'manager', 'support', 'admin'];

export default function PublicNavbar() {
    const pathname = usePathname();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [roleLoading, setRoleLoading] = useState(true);

    useEffect(() => {
        const fetchRole = async (userId: string) => {
            try {
                const { data } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', userId)
                    .single();
                setUserRole(data?.role ?? null);
            } catch {
                setUserRole(null);
            } finally {
                setRoleLoading(false);
            }
        };

        supabase.auth.getSession().then(({ data: { session } }) => {
            setIsLoggedIn(!!session);
            if (session?.user?.id) {
                fetchRole(session.user.id);
            } else {
                setRoleLoading(false);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsLoggedIn(!!session);
            if (session?.user?.id) {
                fetchRole(session.user.id);
            } else {
                setUserRole(null);
                setRoleLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const isAdmin = ADMIN_ROLES.includes(userRole || '');
    const dashboardHref = isAdmin ? '/iamadmin' : '/dashboard';

    const navLinks = [
        { href: '/about', label: 'About Us' },
        { href: '/pricing', label: 'Pricing' },
        { href: '/contact', label: 'Contact Us' },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-center">
            <div className="w-full max-w-[1200px] px-6 md:px-8 flex items-center justify-between relative">
                <Link href="/" className="h-10 w-auto">
                    <img src="/recruit-flow-logo.png" alt="Recruit Flow" className="h-full w-auto object-contain" />
                </Link>

                <div className="hidden md:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
                    {navLinks.map(({ href, label }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`text-xs font-semibold tracking-tight transition-colors ${
                                pathname === href
                                    ? 'text-slate-900 font-bold'
                                    : 'text-slate-500 hover:text-slate-900'
                            }`}
                        >
                            {label}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    {isLoggedIn ? (
                        <>
                            <Link
                                href={dashboardHref}
                                className="bg-slate-900 text-white text-xs font-bold tracking-tight px-5 py-2.5 rounded hover:bg-slate-800 transition-all shadow-md active:scale-95 flex items-center gap-2 min-w-[120px] justify-center"
                            >
                                {roleLoading ? (
                                    <BouncyLoader size="sm" />
                                ) : isAdmin ? (
                                    <>
                                        <ShieldCheck className="size-4 text-emerald-400" />
                                        AGENT
                                    </>
                                ) : (
                                    <>
                                        <LayoutDashboard className="size-4 text-slate-400" />
                                        Dashboard
                                    </>
                                )}
                            </Link>
                            <button
                                onClick={async () => {
                                    await supabase.auth.signOut();
                                    setIsLoggedIn(false);
                                    setUserRole(null);
                                }}
                                className="text-slate-500 text-xs font-bold tracking-tight px-4 py-2.5 hover:bg-red-50 hover:text-red-600 rounded transition-all"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="text-slate-900 text-xs font-bold tracking-tight px-4 py-2 hover:bg-slate-50 rounded transition-all"
                            >
                                Log in
                            </Link>
                            <Link
                                href="/register"
                                className="bg-slate-900 text-white text-xs font-bold tracking-tight px-5 py-2.5 rounded hover:bg-slate-800 transition-all shadow-md active:scale-95"
                            >
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
