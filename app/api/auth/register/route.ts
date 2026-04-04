import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import {
    checkRateLimit, generateOTP, sanitizeEmail,
    validateEmail, validatePassword, validateName,
    getClientIP, securityHeaders
} from '@/lib/auth-utils';

export async function POST(request: Request) {
    const headers = securityHeaders();

    try {
        const ip = getClientIP(request);
        const rateCheck = await checkRateLimit(ip, 'auth/register');
        if (!rateCheck.allowed) {
            return NextResponse.json(
                { error: `Too many requests. Retry after ${rateCheck.retryAfter}s.` },
                { status: 429, headers: { ...headers, 'Retry-After': String(rateCheck.retryAfter) } }
            );
        }

        const body = await request.json();
        const { name, email: rawEmail, password, confirmPassword } = body;

        // ── Input Validation ──
        const email = sanitizeEmail(rawEmail || '');

        if (!validateName(name)) {
            return NextResponse.json({ error: 'Name must be 2-100 characters.' }, { status: 400, headers });
        }
        if (!validateEmail(email)) {
            return NextResponse.json({ error: 'Invalid email address.' }, { status: 400, headers });
        }
        const pwCheck = validatePassword(password);
        if (!pwCheck.valid) {
            return NextResponse.json({ error: pwCheck.message }, { status: 400, headers });
        }
        if (password !== confirmPassword) {
            return NextResponse.json({ error: 'Passwords do not match.' }, { status: 400, headers });
        }

        // ── Check if user already exists — direct lookup, not listUsers() ──
        const { data: existingProfile } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('email', email)
            .single();
        if (existingProfile) {
            return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409, headers });
        }

        // ── Generate & Store OTP (5 digits, 120s expiry) ──
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 120 * 1000).toISOString();

        // Invalidate any previous OTPs for this email
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

        // ── Send OTP via email ──
        const { sendOTPEmail } = await import('@/lib/email');
        await sendOTPEmail({ to: email, code: otp, purpose: 'registration' });

        return NextResponse.json({
            message: 'Verification code sent. Check your email.',
            email,
            name,
            expiresIn: 120
        }, { status: 200, headers });

    } catch (err: any) {
        console.error('[REGISTER ERROR]', err);
        return NextResponse.json(
            { error: 'Internal server error.' },
            { status: 500, headers }
        );
    }
}
