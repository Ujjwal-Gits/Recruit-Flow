'use client';

import dynamic from 'next/dynamic';
import BouncyLoader from '@/components/BouncyLoader';

const AdminDashboardClient = dynamic(() => import('@/components/AdminDashboardClient'), {
    ssr: false,
    loading: () => (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <BouncyLoader />
        </div>
    )
});

export default function AdminPage() {
    return <AdminDashboardClient />;
}
