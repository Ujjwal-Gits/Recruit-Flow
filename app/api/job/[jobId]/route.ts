import { supabaseAdmin } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser, unauthorizedResponse, forbiddenResponse, serverErrorResponse } from '@/lib/auth-guard';

export const dynamic = 'force-dynamic';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ jobId: string }> }
) {
    try {
        const auth = await getAuthenticatedUser();
        if (!auth) return unauthorizedResponse();

        const { jobId } = await params;

        // Verify the job belongs to the authenticated user
        const { data: job, error: jobError } = await supabaseAdmin
            .from('jobs')
            .select('*')
            .eq('id', jobId)
            .eq('user_id', auth.user.id)
            .single();

        if (jobError || !job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        const { data: rawApplicants, error: appError } = await supabaseAdmin
            .from('applications')
            .select('id, candidate_name, email, resume_url, ai_summary, ats_score, status, reasons, custom_reason')
            .eq('job_id', jobId)
            .order('ats_score', { ascending: false });

        if (appError) {
            console.error('Applicants fetch error:', appError.message, appError.details);
        }

        const applicants = (rawApplicants || []).map((app: any) => ({
            ...app,
            name: app.candidate_name
        }));

        const response = NextResponse.json({ job, applicants });
        response.headers.set('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
        return response;
    } catch (error: any) {
        console.error('API error:', error);
        return serverErrorResponse();
    }
}
