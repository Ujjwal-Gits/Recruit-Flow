import { supabaseAdmin } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ jobId: string }> }
) {
    try {
        const { jobId } = await params;

        const { data: job, error } = await supabaseAdmin
            .from('jobs')
            .select('title, company_name, description, user_id, created_at')
            .eq('id', jobId)
            .single();

        if (error || !job) {
            return NextResponse.json({
                job: { title: 'Open Position', company_name: 'Company', description: '', logo_url: null },
                isClosed: false
            });
        }

        // Fetch profile and application count in parallel
        const [profileResult, countResult] = await Promise.all([
            supabaseAdmin.from('profiles').select('logo_url, tier').eq('id', job.user_id).single(),
            supabaseAdmin.from('applications').select('*', { count: 'exact', head: true }).eq('job_id', jobId),
        ]);

        const tier = profileResult.data?.tier || 'essential';
        const capacityLimit = tier === 'enterprise' ? 200 : (tier === 'pro' ? 30 : 5);
        const appCount = countResult.count || 0;

        const response = NextResponse.json({
            job: {
                title: job.title,
                company_name: job.company_name,
                description: job.description,
                created_at: job.created_at,
                logo_url: profileResult.data?.logo_url || null,
            },
            isClosed: appCount >= capacityLimit,
            appCount,
            capacityLimit,
        });

        response.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
        return response;
    } catch {
        return NextResponse.json({
            job: { title: 'Open Position', company_name: 'Company', description: '', logo_url: null },
            isClosed: false
        });
    }
}
