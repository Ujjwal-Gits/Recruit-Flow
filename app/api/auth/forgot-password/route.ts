import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import {
    checkRateLimit, sanitizeEmail, validateEmail,
    generateOTP, getClientIP, securityHeaders
} from '@/lib/auth-utils';

export async function POST(request: Request) {
    const headers = securityHeaders();

    try {
        const ip = getClientIP(request);
        const rateCheck = await checkRateLimit(ip, 'auth/forgot');
        if (!rateCheck.allowed) {
            return NextResponse.json(
                { error: `Too many requests. Retry after ${rateCheck.retryAfter}s.` },
                { status: 429, headers: { ...headers, 'Retry-After': String(rateCheck.retryAfter) } }
            );
        }

        const body = await request.json();
        const email = sanitizeEmail(body.email || '');

        if (!validateEmail(email)) {
            return NextResponse.json({ error: 'Invalid email address.' }, { status: 400, headers });
        }

        // Check if user exists via profiles table — fast direct lookup
        const { data: userByEmail } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('email', email)
            .single();
        const userExists = !!userByEmail;

        if (userExists) {
            // User exists — generate OTP
            const otp = generateOTP();
            const expiresAt = new Date(Date.now() + 120 * 1000).toISOString();

            // Clear old codes
            await supabaseAdmin
                .from('verification_codes')
                .delete()
                .eq('email', email);

            await supabaseAdmin
                .from('verification_codes')
                .insert({
                    email,
                    code: otp,
                    expires_at: expiresAt,
                    used: false,
                    attempts: 0
                });

            // Send via email utility
            const { sendOTPEmail } = await import('@/lib/email');
            await sendOTPEmail({ to: email, code: otp, purpose: 'password-reset' });
        }

        // ALWAYS return success to prevent email enumeration
        return NextResponse.json({
            message: 'If an account exists with this email, a reset code has been sent.',
            expiresIn: 120
        }, { status: 200, headers });

    } catch (err: any) {
        console.error('[FORGOT PASSWORD ERROR]', err);
        return NextResponse.json(
            { error: 'Internal server error.' },
            { status: 500, headers }
        );
    }
}
