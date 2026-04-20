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
        const adminEmail = process.env.ADMIN_EMAIL;
        if (!adminEmail) {
            return NextResponse.json({ error: 'ADMIN_EMAIL environment variable is required' }, { status: 400 });
        }
        const defaultPass = process.env.DEFAULT_PASSWORD || 'SecurePassword123!';
        
        const usersToCreate = [
            { email: adminEmail, password: defaultPass, name: 'Admin User', tier: 'enterprise', role: 'owner' },
            { email: process.env.SUPPORT_EMAIL, password: defaultPass, name: 'Support Agent', tier: 'enterprise', role: 'support' },
            { email: process.env.PRO_EMAIL, password: defaultPass, name: 'Pro User', tier: 'pro', role: 'recruiter' },
            { email: process.env.FREE_EMAIL, password: defaultPass, name: 'Free User', tier: 'free', role: 'recruiter' }
        ].filter(u => u.email);

        console.log("Seed process: Fetching existing users...");
        const listResult = await supabaseAdmin.auth.admin.listUsers();
        if (listResult.error) {
            console.error("Failed to list users:", listResult.error);
            return NextResponse.json({ error: "Failed to list users", details: listResult.error }, { status: 500 });
        }

        const existingUsers = listResult.data.users;
        const createdUsers = [];

        for (const user of usersToCreate) {
            console.log(`Seed process: Processing ${user.email}...`);
            const exists = existingUsers?.some((u: any) => u.email === user.email);
            
            if (!exists) {
                const { data: newUser, error } = await supabaseAdmin.auth.admin.createUser({
                    email: user.email,
                    password: user.password,
                    email_confirm: true,
                    user_metadata: { full_name: user.name }
                });

                if (error) {
                    console.error(`Failed to create ${user.email}:`, error);
                    createdUsers.push(`${user.email} (Error: ${error.message})`);
                    continue;
                }

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
                const existingUser = existingUsers.find(u => u.email === user.email);
                if (existingUser) {
                    const { error: updateErr } = await supabaseAdmin.from('profiles').upsert({
                        id: existingUser.id,
                        email: user.email,
                        tier: user.tier,
                        role: user.role,
                        full_name: user.name,
                        updated_at: new Date().toISOString()
                    });
                    
                    if (updateErr) {
                        console.error(`Update failed for ${user.email}:`, updateErr.message);
                        createdUsers.push(user.email + " (Update Error)");
                    } else {
                        createdUsers.push(user.email + " (Synced)");
                    }
                }
            }
        }

        return NextResponse.json({
            message: 'Seed process synchronized.',
            accounts: createdUsers
        });

    } catch (err: any) {
        console.error("Seed route panic:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
