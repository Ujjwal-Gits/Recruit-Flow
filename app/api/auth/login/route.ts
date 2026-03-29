import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase-server';
import {
    checkRateLimit, sanitizeEmail, validateEmail,
    validatePassword, getClientIP, securityHeaders
} from '@/lib/auth-utils';

export async function POST(request: Request) {
    const headers = securityHeaders();

    try {
        const ip = getClientIP(request);
        const rateCheck = await checkRateLimit(ip, 'auth/login');
        if (!rateCheck.allowed) {
            return NextResponse.json(
                { error: `Too many login attempts. Retry after ${rateCheck.retryAfter}s.` },
                { status: 429, headers: { ...headers, 'Retry-After': String(rateCheck.retryAfter) } }
            );
        }

        const body = await request.json();
        const { email: rawEmail, password } = body;
        const email = sanitizeEmail(rawEmail || '');

        if (!validateEmail(email)) {
            return NextResponse.json({ error: 'Invalid email address.' }, { status: 400, headers });
        }
        const pwCheck = validatePassword(password);
        if (!pwCheck.valid) {
            return NextResponse.json({ error: pwCheck.message }, { status: 400, headers });
        }

        // Use the ROUTE client (server-side) to set secure cookies
        const supabase = await createRouteClient();

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            return NextResponse.json(
                { error: 'Invalid email or password.' },
                { status: 401, headers }
            );
        }

        // Return the session so the frontend can update its local state too
        return NextResponse.json({
            message: 'Login successful.',
            session: data.session
        }, { status: 200, headers });

    } catch (err: any) {
        console.error('[LOGIN ERROR]', err);
        return NextResponse.json(
            { error: 'Internal server error.' },
            { status: 500, headers }
        );
    }
}
