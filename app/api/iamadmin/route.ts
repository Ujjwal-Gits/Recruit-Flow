import { supabaseAdmin } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser, unauthorizedResponse, forbiddenResponse, serverErrorResponse, invalidateUserCache } from '@/lib/auth-guard';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const auth = await getAuthenticatedUser();
        // 1. Check if user is logged in
        if (!auth) return unauthorizedResponse();

        // 2. SELF-PROMOTION FOR DEVELOPMENT (dummy account + specified admin identities)
        // This ensures the user can actually get into the dashboard for testing.
        // =====================================================
        // ADMIN AUTHORIZATION CHECK
        // =====================================================
        if (!['owner', 'manager', 'support', 'admin'].includes(auth.role || '')) {
            return forbiddenResponse('Admin access required.');
        }

        // 4. Fetch all data in PARALLEL — single biggest perf win
        const role = auth.role;
        
        const [usersCount, listingsCount, transResult, messagesResult, usersResult] = await Promise.all([
            supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
            supabaseAdmin.from('jobs').select('*', { count: 'exact', head: true }),
            role === 'owner' 
                ? supabaseAdmin.from('transactions').select('id, amount, created_at, currency, status, plan, purchaser, company, activated_by, duration')
                : Promise.resolve({ data: null }),
            supabaseAdmin.from('support_messages')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100),
            supabaseAdmin.from('profiles')
                .select('id, email, full_name, tier, role, company_name, updated_at, subscription_expiry')
                .order('updated_at', { ascending: false })
                .limit(role === 'owner' ? 100 : 20),
        ]);

        const totalUsers = usersCount.count || 0;
        const totalListings = listingsCount.count || 0;

        let revenue = 0;
        let nprTotal = 0;
        let transCount = 0;
        let revenueHistory: any[] = [];
        
        if (role === 'owner' && transResult.data) {
            const trans = transResult.data;
            // Only count non-cancelled transactions
            const activeTrans = trans.filter((t: any) => t.status !== 'Cancelled');
            revenue = activeTrans.reduce((sum: number, t: any) => sum + (t.currency !== 'NPR' ? Number(t.amount) : 0), 0);
            nprTotal = activeTrans.reduce((sum: number, t: any) => sum + (t.currency === 'NPR' ? Number(t.amount) : 0), 0);
            transCount = activeTrans.length;

            const historyObj: Record<string, { npr: number; usd: number; name: string }> = {};
            activeTrans.forEach((t: any) => {
                const date = new Date(t.created_at);
                const month = date.toLocaleString('default', { month: 'short' });
                const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
                if (!historyObj[monthKey]) {
                    historyObj[monthKey] = { name: month, npr: 0, usd: 0 };
                }
                if (t.currency === 'NPR') historyObj[monthKey].npr += Number(t.amount);
                else historyObj[monthKey].usd += Number(t.amount);
            });
            
            revenueHistory = Object.entries(historyObj)
                .map(([month, data]) => ({ month, ...data }))
                .sort((a, b) => a.month.localeCompare(b.month));
        }

        // 5. Process Support Messages — strictly separate Support vs Activation
        const rawMessages = messagesResult.data;
        const chatsObj: Record<string, any> = {};
        const upgradesObj: Record<string, any> = {};

        rawMessages?.forEach(m => {
            const text = (m.message_text || m.content || '').toLowerCase();
            const subject = (m.subject || '').toUpperCase();
            
            const isActivation = subject === 'ACTIVATION' || 
                                 (subject !== 'SUPPORT' && subject !== 'CLOSED_SUPPORT' && (
                                     text.includes('activation') || 
                                     text.includes('upgrade') ||
                                     text.includes('arctic') ||
                                     text.includes('enterprise')
                                 ));
            
            const targetObj = isActivation ? upgradesObj : chatsObj;
            const uid = m.user_id;

            if (!uid) return;
            if (!targetObj[uid]) {
                // Manual fallback since we removed the relational query
                const profileMatch = usersResult.data?.find((u: any) => u.id === uid) || { full_name: 'User', email: 'Unknown' };
                targetObj[uid] = {
                    id: uid,
                    user_id: uid,
                    user: profileMatch.email,
                    name: profileMatch.full_name,
                    plan: text.includes('arctic') ? 'Arctic Pro' : (text.includes('enterprise') ? 'Enterprise' : 'Pro'),
                    lastMessage: {
                        text: m.message_text || m.content || '',
                        time: m.created_at
                    },
                    time: m.created_at,
                    status: 'pending',
                    unread: 0,
                    messages: []
                };
            }
            targetObj[uid].messages.push({
                id: m.id,
                sender: m.sender_id === uid || m.sender === 'user' ? 'user' : 'support',
                text: m.message_text || m.content || '',
                time: m.created_at,
                image_url: m.image_url,
                subject: m.subject
            });

            // Mark entire thread as closed if it's in the chatsObj and has closed messages
            if (!isActivation) {
                if (!targetObj[uid].isClosed) targetObj[uid].isClosed = (m.subject === 'CLOSED_SUPPORT');
                if (m.subject === 'SUPPORT') targetObj[uid].isClosed = false; // Any active message reopens the thread
            }
        });

        const upgradeRequests = Object.values(upgradesObj).sort((a: any, b: any) => 
            new Date(b.time).getTime() - new Date(a.time).getTime()
        );

        const allSupportChats = Object.values(chatsObj).sort((a: any, b: any) => 
            new Date(b.time).getTime() - new Date(a.time).getTime()
        );

        const activeSupportChats = allSupportChats.filter((c: any) => !c.isClosed);
        const closedSupportChats = allSupportChats.filter((c: any) => c.isClosed);

        // 7. Users already fetched in parallel above
        const users = usersResult.data;

        // 8. Filter based on Role Access
        if (role === 'support') {
            return NextResponse.json({
                error: null,
                role: role,
                stats: { totalUsers: 'RESTRICTED', totalListings: 'RESTRICTED', revenue: 'RESTRICTED', nprTotal: 'RESTRICTED', transCount: 'RESTRICTED', revenueHistory: [] },
                users: [],
                chats: activeSupportChats,
                closedChats: closedSupportChats,
                upgrades: upgradeRequests
            });
        }

        return NextResponse.json({
            error: null,
            role: role,
            stats: {
                totalUsers: totalUsers || 0,
                totalListings: totalListings || 0,
                revenue: role === 'owner' ? revenue : 'RESTRICTED',
                nprTotal: role === 'owner' ? nprTotal : 'RESTRICTED',
                transCount: role === 'owner' ? transCount : 'RESTRICTED',
                revenueHistory
            },
            users: users || [],
            chats: activeSupportChats,
            closedChats: closedSupportChats,
            upgrades: upgradeRequests,
            invoices: role === 'owner' ? (transResult.data || []).map((t: any) => ({
                id: t.id,
                plan: t.plan || 'Subscription',
                purchaser: t.purchaser || '',
                company: t.company || '—',
                currency: t.currency || 'NPR',
                amount: Number(t.amount) || 0,
                status: t.status || 'Succeeded',
                date: t.created_at,
                activatedBy: t.activated_by || '',
                duration: t.duration || 'Lifetime',
            })) : [],
        });

    } catch (error: any) {
        console.error('Admin API error:', error);
        return serverErrorResponse();
    }
}

export async function POST(req: Request) {
    try {
        const auth = await getAuthenticatedUser();
        if (!auth || !['owner', 'manager', 'support', 'admin'].includes(auth.role || '')) {
            return forbiddenResponse();
        }

        const { action, targetUserId, newTier, newRole, newExpiry, invoice, invoiceId } = await req.json();
        const adminRole = auth.role;

        if (action === 'update-user') {
            if (newRole && adminRole !== 'owner') {
                return forbiddenResponse('Only owners can manage staff roles.');
            }

            const updateData: any = {};
            if (newTier) updateData.tier = newTier;
            if (newRole) updateData.role = newRole;
            if (newExpiry !== undefined) updateData.subscription_expiry = newExpiry;

            const { error } = await supabaseAdmin
                .from('profiles')
                .update(updateData)
                .eq('id', targetUserId);

            if (error) return serverErrorResponse();
            invalidateUserCache(targetUserId);
            return NextResponse.json({ success: true, message: 'User updated successfully.' });
        }

        if (action === 'create-invoice' && invoice) {
            // Try full insert first; fall back to minimal if columns don't exist
            const { error } = await supabaseAdmin.from('transactions').insert({
                id: invoice.id,
                amount: invoice.amount,
                currency: invoice.currency,
                status: invoice.status,
                plan: invoice.plan,
                purchaser: invoice.purchaser,
                company: invoice.company,
                activated_by: invoice.activatedBy,
                duration: invoice.duration,
                created_at: invoice.date,
            });
            if (error) {
                // Fallback: only insert columns that definitely exist
                await supabaseAdmin.from('transactions').insert({
                    amount: invoice.amount,
                    currency: invoice.currency,
                });
            }
            return NextResponse.json({ success: true });
        }

        if (action === 'cancel-invoice' && invoiceId) {
            await supabaseAdmin.from('transactions').update({ status: 'Cancelled' }).eq('id', invoiceId);
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error: any) {
        return serverErrorResponse();
    }
}
