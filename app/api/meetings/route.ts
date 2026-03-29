import { supabaseAdmin } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser, unauthorizedResponse, serverErrorResponse, forbiddenResponse } from '@/lib/auth-guard';

export const dynamic = 'force-dynamic';

// GET all meetings for the authenticated user
export async function GET() {
    try {
        const auth = await getAuthenticatedUser();
        if (!auth) return unauthorizedResponse();

        const userId = auth.user.id;

        if (auth.tier !== 'pro' && auth.tier !== 'enterprise') {
            return forbiddenResponse('Upgrade to Pro or Enterprise required to access interview scheduling.');
        }

        // Get all application IDs belonging to this user's jobs
        const { data: userApps, error: appsError } = await supabaseAdmin
            .from('applications')
            .select('id, jobs!inner(user_id)')
            .eq('jobs.user_id', userId);

        if (appsError) {
            console.error('Error fetching user apps for meetings:', appsError);
            return NextResponse.json({ meetings: [] });
        }

        const appIds = (userApps || []).map(a => a.id);

        if (appIds.length === 0) {
            return NextResponse.json({ meetings: [] });
        }

        const { data: meetings, error } = await supabaseAdmin
            .from('meetings')
            .select(`
                *,
                applications (
                    candidate_name,
                    email
                )
            `)
            .in('application_id', appIds)
            .order('start_time', { ascending: true });

        if (error) {
            console.error('Meetings fetch error:', error);
            return NextResponse.json({ meetings: [] });
        }

        const formatted = (meetings || []).map((m: any) => ({
            ...m,
            candidate_name: m.applications?.candidate_name || 'Unknown',
            candidate_email: m.applications?.email || '',
        }));

        return NextResponse.json({ meetings: formatted });
    } catch (error: any) {
        console.error('Meetings API error:', error);
        return serverErrorResponse();
    }
}

// POST - Create a new meeting (with conflict check)
export async function POST(req: Request) {
    try {
        const auth = await getAuthenticatedUser();
        if (!auth) return unauthorizedResponse();

        if (auth.tier !== 'pro' && auth.tier !== 'enterprise') {
            return forbiddenResponse('Upgrade to Pro or Enterprise required to create meetings.');
        }

        const body = await req.json();
        const { application_id, start_time, end_time, mode, title, notes } = body;

        if (!start_time || !end_time) {
            return NextResponse.json({ error: 'Start and end time are required' }, { status: 400 });
        }

        // If application_id is provided, verify it belongs to the authenticated user
        if (application_id) {
            const { data: app } = await supabaseAdmin
                .from('applications')
                .select('id, jobs!inner(user_id)')
                .eq('id', application_id)
                .eq('jobs.user_id', auth.user.id)
                .single();

            if (!app) {
                return NextResponse.json({ error: 'Application not found' }, { status: 404 });
            }
        }

        // Check for conflicts
        const { data: conflicts, error: conflictError } = await supabaseAdmin
            .from('meetings')
            .select('id, start_time, end_time, title')
            .or(`and(start_time.lt.${end_time},end_time.gt.${start_time})`);

        if (conflictError) {
            console.error('Conflict check error:', conflictError);
        }

        if (conflicts && conflicts.length > 0) {
            return NextResponse.json({
                error: 'Time conflict detected',
                conflicts: conflicts.map(c => ({
                    id: c.id,
                    title: c.title,
                    start_time: c.start_time,
                    end_time: c.end_time
                }))
            }, { status: 409 });
        }

        const { data, error } = await supabaseAdmin
            .from('meetings')
            .insert({
                application_id: application_id || null,
                start_time,
                end_time,
                mode: mode || 'virtual',
                title: title || 'Interview',
                notes: notes || ''
            })
            .select()
            .single();

        if (error) {
            console.error('Meeting create error:', error);
            return serverErrorResponse();
        }

        return NextResponse.json({ meeting: data });
    } catch (error: any) {
        console.error('Meeting POST error:', error);
        return serverErrorResponse();
    }
}
