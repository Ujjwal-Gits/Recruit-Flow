import { supabaseAdmin } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser, unauthorizedResponse, serverErrorResponse } from '@/lib/auth-guard';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const auth = await getAuthenticatedUser();
        if (!auth) return unauthorizedResponse();

        const userId = auth.user.id;
        const url = new URL(req.url);
        const subjectFilter = url.searchParams.get('subject'); // 'SUPPORT' or 'ACTIVATION' or null (all)

        let query = supabaseAdmin
            .from('support_messages')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: true });

        // Filter by subject if specified — this separates Customer Support from Activation popup
        if (subjectFilter) {
            query = query.eq('subject', subjectFilter.toUpperCase());
        }

        const { data: messages, error } = await query;

        if (error) throw error;

        return NextResponse.json({ messages: messages || [] });
    } catch (error: any) {
        return serverErrorResponse();
    }
}

export async function POST(req: Request) {
    try {
        const auth = await getAuthenticatedUser();
        if (!auth) return unauthorizedResponse();

        const { message_text, subject, image_url } = await req.json();

        if (!message_text || typeof message_text !== 'string' || message_text.trim().length === 0) {
            return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from('support_messages')
            .insert({
                sender_id: auth.user.id,
                receiver_id: null,
                user_id: auth.user.id,
                message_text: String(message_text).slice(0, 5000),
                subject: subject || 'SUPPORT',
                image_url: image_url || null,
                sender: 'user'
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, message: data });
    } catch (error: any) {
        return serverErrorResponse();
    }
}
