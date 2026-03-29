import { supabaseAdmin } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser, unauthorizedResponse, forbiddenResponse, serverErrorResponse } from '@/lib/auth-guard';

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await getAuthenticatedUser();
        if (!auth) return unauthorizedResponse();

        const { id } = await params;
        const body = await req.json();
        const { status, reasons, custom_reason } = body;

        // Validate status value
        const allowedStatuses = ['pending', 'accepted', 'rejected', 'shortlisted'];
        if (status && !allowedStatuses.includes(status)) {
            return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
        }

        // Verify the application belongs to a job owned by the authenticated user
        const { data: application } = await supabaseAdmin
            .from('applications')
            .select('id, jobs!inner(user_id)')
            .eq('id', id)
            .eq('jobs.user_id', auth.user.id)
            .single();

        if (!application) {
            return NextResponse.json({ error: 'Application not found' }, { status: 404 });
        }

        const { data, error } = await supabaseAdmin
            .from('applications')
            .update({
                status,
                reasons,
                custom_reason
            })
            .eq('id', id)
            .select();

        if (error) {
            console.error('Update error:', error);
            return serverErrorResponse();
        }

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('PATCH API error:', error);
        return serverErrorResponse();
    }
}
