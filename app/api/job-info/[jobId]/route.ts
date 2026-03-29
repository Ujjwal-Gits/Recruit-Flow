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
                job: {
                    title: 'Open Position',
                    company_name: 'Company',
                    description: 'Apply for this position.',
                    logo_url: null
                }
            });
        }

        // TIER LIMIT ENFORCEMENT for CV Processing
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('logo_url, tier')
            .eq('id', job.user_id)
            .single();

        const tier = profile?.tier || 'essential';
        const capacityLimit = tier === 'enterprise' ? 200 : (tier === 'pro' ? 30 : 5);

        // Fetch user's job IDs to check total applications across all jobs
        const { data: userJobs } = await supabaseAdmin.from('jobs').select('id').eq('user_id', job.user_id);
        const jobIds = userJobs?.map((j: any) => j.id) || [];
        
        let appCount = 0;
        if (jobIds.length > 0) {
            const { count } = await supabaseAdmin
                .from('applications')
                .select('*', { count: 'exact', head: true })
                .in('job_id', jobIds);
            appCount = count || 0;
        }

        const isClosed = appCount >= capacityLimit;

        return NextResponse.json({ 
            job: {
                ...job,
                logo_url: profile?.logo_url
            },
            isClosed,
            appCount,
            capacityLimit
         });
    } catch (err: any) {
        return NextResponse.json({
            job: {
                title: 'Open Position',
                company_name: 'Company',
                description: 'Apply for this position.',
                logo_url: null
            }
        });
    }
}
