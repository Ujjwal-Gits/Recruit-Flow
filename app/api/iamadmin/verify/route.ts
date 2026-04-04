import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-guard';

export const dynamic = 'force-dynamic';

/**
 * Lightweight endpoint — just verifies admin role, no heavy data fetching.
 * Used on page load to quickly show the nav before the full data loads.
 */
export async function GET() {
    try {
        const auth = await getAuthenticatedUser();
        if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        if (!['owner', 'manager', 'support', 'admin'].includes(auth.role || '')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        return NextResponse.json({
            role: auth.role,
            email: auth.user.email,
            id: auth.user.id,
        });
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
