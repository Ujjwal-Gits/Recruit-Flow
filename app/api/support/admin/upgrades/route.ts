import { supabaseAdmin } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser, unauthorizedResponse, forbiddenResponse, serverErrorResponse } from '@/lib/auth-guard';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const auth = await getAuthenticatedUser();
        if (!auth) return unauthorizedResponse();

        if (!['owner', 'manager', 'admin', 'support'].includes(auth.role)) {
            return forbiddenResponse();
        }

        const { data: messagesResult, error: msgError } = await supabaseAdmin
            .from('support_messages')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(500);

        if (msgError) throw msgError;

        // Group by user_id
        const userThreads: Record<string, any> = {};

        messagesResult?.forEach(m => {
            const uid = m.user_id;
            if (!uid) return;

            if (!userThreads[uid]) {
                userThreads[uid] = {
                    id: uid,
                    user_id: uid,
                    user: 'user@example.com', // Placeholder until joined
                    name: 'User',
                    messages: [],
                    isActivationNeeded: false,
                    latestPlan: 'Pro'
                };
            }

            const text = (m.message_text || m.content || '').toLowerCase();
            const rawSubject = (m.subject || '').toUpperCase();
            
            const isActivation = rawSubject === 'ACTIVATION' || 
                                 (rawSubject !== 'SUPPORT' && rawSubject !== 'CLOSED_SUPPORT' && rawSubject !== 'RESOLVED_ACTIVATION' && (
                                     text.includes('activation') || 
                                     text.includes('upgrade') ||
                                     text.includes('arctic') ||
                                     text.includes('enterprise')
                                 ));
            
            if (isActivation) {
                userThreads[uid].isActivationNeeded = true;
                if (text.includes('enterprise')) userThreads[uid].latestPlan = 'Enterprise';
                else if (text.includes('pro')) userThreads[uid].latestPlan = 'Arctic Pro';
            }

            // ONLY push activation messages to the Activation Hub, exclude all support/closed/resolved messages
            if (rawSubject !== 'SUPPORT' && rawSubject !== 'CLOSED_SUPPORT' && rawSubject !== 'RESOLVED_ACTIVATION') {
                userThreads[uid].messages.push({
                    id: m.id,
                    sender: m.sender_id === uid || m.sender === 'user' ? 'user' : 'support',
                    text: m.message_text || m.content || '',
                    time: m.created_at,
                    image_url: m.image_url,
                    subject: m.subject || 'GENERAL'
                });
            }
        });

        // Safe Join: Fetch profiles for all distinct user IDs
        const userIds = Object.keys(userThreads);
        if (userIds.length > 0) {
            const { data: profiles } = await supabaseAdmin
                .from('profiles')
                .select('id, email, full_name, company_name, tier')
                .in('id', userIds);
            
            profiles?.forEach(p => {
                if (userThreads[p.id]) {
                    userThreads[p.id].user = p.email;
                    userThreads[p.id].name = p.full_name || p.email || 'User';
                    userThreads[p.id].tier = p.tier || 'free';
                }
            });
        }

        const upgradeRequests = Object.values(userThreads)
            .filter((u: any) => u.isActivationNeeded) // ONLY show if they actually requested activation
            .map((u: any) => {
                const latestActivationMsg = u.messages.find((m: any) => 
                    String(m.subject).toLowerCase() === 'activation' || 
                    m.text.toLowerCase().includes('upgrade') || 
                    m.text.toLowerCase().includes('activation')
                );

                // A request is pending if they explicitly have an activation flag set
                const isPending = u.isActivationNeeded;

                return {
                    ...u,
                    status: isPending ? 'pending' : 'approved',
                    plan: u.latestPlan,
                    message: latestActivationMsg?.text || u.messages[0]?.text || 'Protocol Upgrade Request',
                    time: u.messages[0]?.time
                };
            })
            .sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime());

        upgradeRequests.forEach(req => {
            req.messages.sort((a: any, b: any) => new Date(a.time).getTime() - new Date(b.time).getTime());
        });

        return NextResponse.json({ upgrades: upgradeRequests });
    } catch (error: any) {
        console.error('Admin upgrades safe-sync error:', error);
        return serverErrorResponse();
    }
}
