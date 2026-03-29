import { supabaseAdmin } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser, unauthorizedResponse, serverErrorResponse } from '@/lib/auth-guard';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const auth = await getAuthenticatedUser();
        if (!auth) return unauthorizedResponse();

        const userId = auth.user.id;

        const { data: jobs, error } = await supabaseAdmin
            .from('jobs')
            .select(`*, applications(count)`)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Fetch jobs error:', error);
            return serverErrorResponse();
        }

        const response = NextResponse.json({ jobs: jobs || [] });
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
        return response;

    } catch (error: any) {
        console.error('API error:', error);
        return serverErrorResponse();
    }
}

// triggered hmr refresh
