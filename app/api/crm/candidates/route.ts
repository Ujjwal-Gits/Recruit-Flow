import { supabaseAdmin } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser, unauthorizedResponse, serverErrorResponse, forbiddenResponse } from '@/lib/auth-guard';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const auth = await getAuthenticatedUser();
        if (!auth) return unauthorizedResponse();

        const userId = auth.user.id;

        if (auth.tier !== 'pro' && auth.tier !== 'enterprise') {
            return forbiddenResponse('Upgrade to Pro or Enterprise required to access CRM features.');
        }

        // Fetch applications across jobs owned by this authenticated user
        const { data: applications, error } = await supabaseAdmin
            .from('applications')
            .select(`
                id,
                candidate_name,
                email,
                resume_url,
                ai_summary,
                ats_score,
                status,
                reasons,
                custom_reason,
                created_at,
                job_id,
                jobs!inner (
                    id,
                    title,
                    company_name,
                    user_id
                )
            `)
            .eq('jobs.user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('CRM fetch error:', error);
            return serverErrorResponse();
        }

        const candidates = (applications || []).map((app: any) => ({
            id: app.id,
            name: app.candidate_name,
            email: app.email,
            resume_url: app.resume_url,
            ats_score: app.ats_score,
            status: app.status || 'pending',
            reasons: app.reasons || [],
            custom_reason: app.custom_reason || '',
            created_at: app.created_at,
            job_id: app.job_id,
            job_title: app.jobs?.title || 'Unknown',
            company_name: app.jobs?.company_name || 'Unknown',
        }));

        const response = NextResponse.json({ candidates });
        response.headers.set('Cache-Control', 'private, max-age=15, stale-while-revalidate=60');
        return response;
    } catch (error: any) {
        console.error('CRM API error:', error);
        return serverErrorResponse();
    }
}
