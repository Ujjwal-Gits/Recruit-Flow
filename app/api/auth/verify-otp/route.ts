import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { createRouteClient } from '@/lib/supabase-server';
import {
    checkRateLimit, sanitizeEmail,
    getClientIP, securityHeaders
} from '@/lib/auth-utils';

export async function POST(request: Request) {
    const headers = securityHeaders();

    try {
        const ip = getClientIP(request);
        const rateCheck = await checkRateLimit(ip, 'auth/verify-otp');
        if (!rateCheck.allowed) {
            return NextResponse.json(
                { error: `Too many attempts. Retry after ${rateCheck.retryAfter}s.` },
                { status: 429, headers: { ...headers, 'Retry-After': String(rateCheck.retryAfter) } }
            );
        }

        const body = await request.json();
        const { email: rawEmail, code, name, password } = body;
        const email = sanitizeEmail(rawEmail || '');

        if (!code || code.length !== 6) {
            return NextResponse.json({ error: 'Invalid verification code.' }, { status: 400, headers });
        }

        // 1. Precise OTP Verification with Attempt Counting
        const { data: codeRecord, error: fetchError } = await supabaseAdmin
            .from('verification_codes')
            .select('*')
            .eq('email', email)
            .is('used', false)
            .single();

        if (fetchError || !codeRecord) {
            return NextResponse.json({ error: 'No active verification session found.' }, { status: 404, headers });
        }

        // check expiry
        if (new Date(codeRecord.expires_at) < new Date()) {
            await supabaseAdmin.from('verification_codes').delete().eq('id', codeRecord.id);
            return NextResponse.json({ error: 'Verification code has expired.' }, { status: 410, headers });
        }

        // verify code
        if (codeRecord.code !== code) {
            const newAttempts = (codeRecord.attempts || 0) + 1;

            if (newAttempts >= 5) {
                await supabaseAdmin.from('verification_codes').delete().eq('id', codeRecord.id);
                return NextResponse.json({ error: 'Too many incorrect attempts. Code invalidated.' }, { status: 403, headers });
            }

            await supabaseAdmin.from('verification_codes').update({ attempts: newAttempts }).eq('id', codeRecord.id);
            return NextResponse.json({ error: `Invalid code. ${5 - newAttempts} attempts remaining.` }, { status: 401, headers });
        }

        // 2. Create standard user in Auth FIRST
        const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: name }
        });

        if (createError) {
            // Don't consume OTP if user creation failed — let them retry
            return NextResponse.json({ error: 'Registration failed.' }, { status: 500, headers });
        }

        // Mark as used AFTER successful user creation to prevent OTP being wasted on failure
        await supabaseAdmin.from('verification_codes').update({ used: true }).eq('id', codeRecord.id);

        const userId = authData.user.id;

        // 3. Create profile
        await supabaseAdmin
            .from('profiles')
            .insert({
                id: userId,
                email,
                role: 'recruiter',
                tier: 'essential'
            });

        // 4. LOG THE USER IN (Set secure cookies)
        const supabase = await createRouteClient();
        const { data: sessionData } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        // 5. Cleanup
        await supabaseAdmin.from('verification_codes').delete().eq('id', codeRecord.id);

        return NextResponse.json({
            message: 'Account verified and logged in.',
            session: sessionData.session
        }, { status: 201, headers });

    } catch (err: any) {
        console.error('[VERIFY-OTP ERROR]', err);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500, headers });
    }
}
