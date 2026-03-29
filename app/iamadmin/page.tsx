'use client';

import dynamic from 'next/dynamic';
import BouncyLoader from '@/components/BouncyLoader';

const AdminDashboardClient = dynamic(() => import('@/components/AdminDashboardClient'), {
    ssr: false,
    loading: () => (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center">
            {/* Simple CSS-only bounce animation to avoid Framer Motion SSR errors */}
            <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 bg-slate-900 rounded-full animate-bounce shadow-lg shadow-slate-900/10"></div>
                <div className="w-6 h-1 bg-slate-900/5 rounded-[100%] blur-[1px] animate-pulse"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-2">Initializing Terminal</p>
            </div>
        </div>
    )
});

export default function AdminPage() {
    return <AdminDashboardClient />;
}
