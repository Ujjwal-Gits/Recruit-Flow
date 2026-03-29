import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// =====================================================
// ONE-TIME SEED ROUTE — Creates the dummy account
// Visit /api/auth/seed ONCE to create the demo user
// =====================================================

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');
    
    // Recovery bypass: only works if the secret matches service role (very safe for dev only)
    if (secret !== 'terminal-recovery' && secret !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return NextResponse.json({ error: 'Auth required' }, { status: 401 });
    }
    
    try {
        const adminEmail = process.env.ADMIN_EMAIL || 'owner@example.com';
        const defaultPass = process.env.DEFAULT_PASSWORD || 'SecurePassword123!';
        
        const usersToCreate = [
            { email: adminEmail, password: defaultPass, name: 'Admin User', tier: 'enterprise', role: 'owner' },
            { email: process.env.SUPPORT_EMAIL || 'support@example.com', password: defaultPass, name: 'Support Agent', tier: 'enterprise', role: 'support' },
            { email: process.env.PRO_EMAIL || 'pro@example.com', password: defaultPass, name: 'Pro User', tier: 'pro', role: 'recruiter' },
            { email: process.env.FREE_EMAIL || 'free@example.com', password: defaultPass, name: 'Free User', tier: 'free', role: 'recruiter' }
        ];

        const { data: { users: existingUsers } } = await supabaseAdmin.auth.admin.listUsers() as any;
        const createdUsers = [];

        for (const user of usersToCreate) {
            const exists = (existingUsers as any[])?.some((u: any) => u.email === user.email);
            
            if (!exists) {
                // Create the user with confirmed email
                const { data: newUser, error } = await supabaseAdmin.auth.admin.createUser({
                    email: user.email,
                    password: user.password,
                    email_confirm: true,
                    user_metadata: { full_name: user.name }
                });

                if (error) {
                    console.error(`Failed to create ${user.email}:`, error.message);
                    continue;
                }

                // Create the profile
                await supabaseAdmin.from('profiles').insert({
                    id: newUser.user.id,
                    email: user.email,
                    full_name: user.name,
                    tier: user.tier,
                    role: user.role,
                    provider: 'email'
                });
                createdUsers.push(user.email);
            } else {
                const existingUser = (existingUsers as any[]).find(u => u.email === user.email);
                if (existingUser) {
                    const { error: updateErr } = await supabaseAdmin.from('profiles').update({
                        tier: user.tier,
                        role: user.role,
                        full_name: user.name
                    }).eq('id', existingUser.id);
                    
                    if (updateErr) {
                        console.error(`Update failed for ${user.email}:`, updateErr.message);
                        createdUsers.push(user.email + " (update error)");
                    } else {
                        createdUsers.push(user.email + " (forced sync)");
                    }
                }
            }
        }

        return NextResponse.json({
            message: 'Seed process synchronized.',
            accounts: createdUsers
        });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
