import { supabaseAdmin } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser, unauthorizedResponse, forbiddenResponse, serverErrorResponse } from '@/lib/auth-guard';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const auth = await getAuthenticatedUser();
        if (!auth) return unauthorizedResponse();

        if (!['owner', 'support', 'admin', 'manager'].includes(auth.role)) {
            return forbiddenResponse();
        }

        // Only fetch the columns we actually use — skip large unused fields
        const { data: messagesResult, error: msgError } = await supabaseAdmin
            .from('support_messages')
            .select('id, user_id, sender_id, sender, message_text, subject, created_at')
            .in('subject', ['SUPPORT', 'CLOSED_SUPPORT'])
            .order('created_at', { ascending: false })
            .limit(200);

        if (msgError) throw msgError;

        const chatsObj: Record<string, any> = {};

        messagesResult?.forEach(m => {
            const uid = m.user_id;
            if (!uid) return;

            if (!chatsObj[uid]) {
                chatsObj[uid] = {
                    id: uid,
                    user: {
                        id: uid,
                        email: 'Unknown',
                        company_name: 'Recruiter Hub',
                        logo_url: null
                    },
                    messages: [],
                    isClosed: m.subject === 'CLOSED_SUPPORT',
                    lastMessageTime: m.created_at
                };
            }

            chatsObj[uid].messages.push({
                id: m.id,
                sender: m.sender_id === uid || m.sender === 'user' ? 'user' : 'support',
                text: m.message_text || '',
                time: m.created_at
            });

            // A ticket is open if ANY of its messages is not marked closed
            if (m.subject === 'SUPPORT') {
                chatsObj[uid].isClosed = false;
            }
        });

        const userIds = Object.keys(chatsObj);
        if (userIds.length > 0) {
            const { data: profiles } = await supabaseAdmin
                .from('profiles')
                .select('id, email, company_name, logo_url, tier')
                .in('id', userIds);
            
            profiles?.forEach(p => {
                if (chatsObj[p.id]) {
                    chatsObj[p.id].user.email = p.email;
                    chatsObj[p.id].user.company_name = p.company_name || p.email || 'Recruiter Hub';
                    chatsObj[p.id].user.logo_url = p.logo_url;
                    chatsObj[p.id].user.tier = p.tier || 'free';
                }
            });
        }

        const allChats = Object.values(chatsObj).map((c: any) => {
            c.messages.sort((a: any, b: any) => new Date(a.time).getTime() - new Date(b.time).getTime());
            return {
                ...c,
                lastMessage: c.messages[c.messages.length - 1]
            };
        }).sort((a: any, b: any) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());

        const activeChats = allChats.filter((c: any) => !c.isClosed);
        const closedChats = allChats.filter((c: any) => c.isClosed);

        const response = NextResponse.json({ chats: activeChats, closedChats });
        response.headers.set('Cache-Control', 'private, max-age=10, stale-while-revalidate=30');
        return response;
    } catch (error: any) {
        console.error('Admin support sync error:', error);
        return serverErrorResponse();
    }
}

export async function POST(req: Request) {
    try {
        const auth = await getAuthenticatedUser();
        if (!auth) return unauthorizedResponse();
        if (!['owner', 'support', 'admin', 'manager'].includes(auth.role)) return forbiddenResponse();

        const { userId, message_text, subject = 'Admin Response' } = await req.json();

        if (!userId || !message_text) {
            return NextResponse.json({ error: 'Incomplete parameters' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from('support_messages')
            .insert({
                sender_id: auth.user.id,
                receiver_id: userId,
                user_id: userId,
                message_text: String(message_text).slice(0, 5000),
                subject: subject,
                sender: 'admin'
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, message: data });
    } catch (error) {
        return serverErrorResponse();
    }
}

export async function PATCH(req: Request) {
    try {
        const auth = await getAuthenticatedUser();
        if (!auth) return unauthorizedResponse();
        if (!['owner', 'support', 'admin', 'manager'].includes(auth.role)) return forbiddenResponse();

        const { userId, action } = await req.json(); // action: 'CLOSE' or 'REOPEN'
        if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

        const isClosing = action === 'CLOSE';
        const isResolving = action === 'RESOLVE_ACTIVATION';
        
        if (isResolving) {
            // First fetch all messages to accurately handle null subjects safely
            const { data: messages } = await supabaseAdmin
                .from('support_messages')
                .select('id, subject')
                .eq('user_id', userId);

            const toUpdate = messages?.filter(m => {
                const s = m.subject?.toUpperCase();
                return s !== 'SUPPORT' && s !== 'CLOSED_SUPPORT' && s !== 'RESOLVED_ACTIVATION';
            }).map(m => m.id) || [];

            if (toUpdate.length > 0) {
                const { error } = await supabaseAdmin
                    .from('support_messages')
                    .update({ subject: 'RESOLVED_ACTIVATION' })
                    .in('id', toUpdate);
                if (error) throw error;
            }
            return NextResponse.json({ success: true });
        }

        // For handling normal support queue closure/reopen
        const targetSubjects = isClosing 
            ? ['SUPPORT', 'Admin Response'] 
            : ['CLOSED_SUPPORT', 'CLOSED_ADMIN_RESPONSE'];
        
        const newSubject = isClosing ? 'CLOSED_SUPPORT' : 'SUPPORT';

        const { error } = await supabaseAdmin
            .from('support_messages')
            .update({ subject: newSubject })
            .eq('user_id', userId)
            .in('subject', targetSubjects); 

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        return serverErrorResponse();
    }
}
