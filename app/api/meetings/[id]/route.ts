import { supabaseAdmin } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser, unauthorizedResponse, serverErrorResponse } from '@/lib/auth-guard';

// PATCH - Update meeting status
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await getAuthenticatedUser();
        if (!auth) return unauthorizedResponse();

        const { id } = await params;
        const { status } = await req.json();

        if (!['pending', 'accepted', 'rejected'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from('meetings')
            .update({ status })
            .eq('id', id);

        if (error) return serverErrorResponse();

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return serverErrorResponse();
    }
}

// DELETE a meeting — only if it belongs to the authenticated user
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await getAuthenticatedUser();
        if (!auth) return unauthorizedResponse();

        const { id } = await params;

        // Verify the meeting belongs to the authenticated user's applications
        const { data: meeting } = await supabaseAdmin
            .from('meetings')
            .select('id, applications!inner(id, jobs!inner(user_id))')
            .eq('id', id)
            .single();

        if (!meeting) {
            return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
        }

        // Check ownership through the chain: meeting -> application -> job -> user
        const jobUserId = (meeting as any).applications?.jobs?.user_id;
        if (jobUserId !== auth.user.id) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        const { error } = await supabaseAdmin
            .from('meetings')
            .delete()
            .eq('id', id);

        if (error) {
            return serverErrorResponse();
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Meeting delete error:', error);
        return serverErrorResponse();
    }
}
