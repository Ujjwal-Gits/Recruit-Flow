import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import {
    checkRateLimit, sanitizeEmail, validatePassword,
    getClientIP, securityHeaders
} from '@/lib/auth-utils';

export async function POST(request: Request) {
    const headers = securityHeaders();

    try {
        const ip = getClientIP(request);
        const rateCheck = await checkRateLimit(ip, 'auth/reset');
        if (!rateCheck.allowed) {
            return NextResponse.json(
                { error: `Too many attempts. Retry after ${rateCheck.retryAfter}s.` },
                { status: 429, headers: { ...headers, 'Retry-After': String(rateCheck.retryAfter) } }
            );
        }

        const body = await request.json();
        const { email: rawEmail, code, newPassword, confirmPassword } = body;
        const email = sanitizeEmail(rawEmail || '');

        if (!code || code.length !== 6) {
            return NextResponse.json({ error: 'Invalid reset code.' }, { status: 400, headers });
        }

        const pwCheck = validatePassword(newPassword);
        if (!pwCheck.valid) {
            return NextResponse.json({ error: pwCheck.message }, { status: 400, headers });
        }

        if (newPassword !== confirmPassword) {
            return NextResponse.json({ error: 'Passwords do not match.' }, { status: 400, headers });
        }

        // ── Verify OTP ──
        const { data: otpRecord, error: otpError } = await supabaseAdmin
            .from('verification_codes')
            .select('*')
            .eq('email', email)
            .eq('code', code)
            .eq('used', false)
            .single();

        if (otpError || !otpRecord) {
            return NextResponse.json({ error: 'Invalid or expired code.' }, { status: 401, headers });
        }

        if (new Date(otpRecord.expires_at) < new Date()) {
            await supabaseAdmin.from('verification_codes').delete().eq('id', otpRecord.id);
            return NextResponse.json({ error: 'Code has expired. Request a new one.' }, { status: 410, headers });
        }

        if (otpRecord.attempts >= 5) {
            await supabaseAdmin.from('verification_codes').delete().eq('id', otpRecord.id);
            return NextResponse.json({ error: 'Too many invalid attempts.' }, { status: 429, headers });
        }

        // Find user via profiles table — avoids fetching all users with listUsers()
        const { data: profileRecord } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('email', email)
            .single();

        if (!profileRecord) {
            return NextResponse.json({ error: 'Account not found.' }, { status: 404, headers });
        }

        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            profileRecord.id,
            { password: newPassword }
        );

        if (updateError) {
            return NextResponse.json({ error: 'Failed to reset password.' }, { status: 500, headers });
        }

        // Cleanup OTP
        await supabaseAdmin.from('verification_codes').delete().eq('id', otpRecord.id);

        return NextResponse.json({
            message: 'Password reset successfully. You can now log in.'
        }, { status: 200, headers });

    } catch (err: any) {
        console.error('[RESET PASSWORD ERROR]', err);
        return NextResponse.json(
            { error: 'Internal server error.' },
            { status: 500, headers }
        );
    }
}
