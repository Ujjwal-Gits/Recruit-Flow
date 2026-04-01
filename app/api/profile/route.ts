import { supabaseAdmin } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser, unauthorizedResponse, serverErrorResponse } from '@/lib/auth-guard';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const auth = await getAuthenticatedUser();
        if (!auth) return unauthorizedResponse();

        // The profile is now automatically fetched and cached by getAuthenticatedUser()
        return NextResponse.json({ profile: auth.profile || null });
    } catch (error: any) {
        return serverErrorResponse();
    }
}

export async function POST(req: Request) {
    try {
        const auth = await getAuthenticatedUser();
        if (!auth) return unauthorizedResponse();

        const { action, email, companyName, phoneNumber, logoUrl, otp } = await req.json();
        const userId = auth.user.id;

        // ── 1. Strict IP Rate Limiting ──
        const { getClientIP, checkRateLimit } = await import('@/lib/auth-utils');
        const ip = getClientIP(req);
        const rateCheck = await checkRateLimit(ip, 'api/profile');
        if (!rateCheck.allowed) {
            return NextResponse.json(
                { error: `Too many requests. Retry after ${rateCheck.retryAfter}s.` },
                { status: 429 }
            );
        }

        if (action === 'send-otp') {
            // ── Test account bypass — skip OTP for seed demo accounts ──
            // Check both the submitted email AND the authenticated user's actual email
            const testEmails = [
                process.env.ADMIN_EMAIL,
                process.env.SUPPORT_EMAIL,
                process.env.PRO_EMAIL,
                process.env.FREE_EMAIL,
            ].filter(Boolean).map(e => e!.toLowerCase().trim());

            const submittedEmail = email.toLowerCase().trim();
            const authEmail = auth.user.email.toLowerCase().trim();
            const isTestAccount = testEmails.includes(submittedEmail) || testEmails.includes(authEmail);

            if (isTestAccount) {
                // Return a fixed bypass code — no email sent
                return NextResponse.json({ success: true, message: 'OTP sent to email.', testBypass: true, code: '000000' });
            }

            const { generateOTP } = await import('@/lib/auth-utils');
            const code = generateOTP();
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

            // Invalidate old codes for this user immediately
            await supabaseAdmin.from('verification_codes').delete().eq('email', email);

            const { error } = await supabaseAdmin
                .from('verification_codes')
                .insert({
                    email,
                    code,
                    expires_at: expiresAt,
                    attempts: 0
                });

            if (error) return serverErrorResponse();

            const { sendOTPEmail } = await import('@/lib/email');
            await sendOTPEmail({ to: email, code, purpose: 'profile-verification' });

            return NextResponse.json({ success: true, message: 'OTP sent to email.' });
        }

        if (action === 'verify-and-save') {
            // ── Test account bypass — accept '000000' without DB lookup ──
            const testEmails = [
                process.env.ADMIN_EMAIL,
                process.env.SUPPORT_EMAIL,
                process.env.PRO_EMAIL,
                process.env.FREE_EMAIL,
            ].filter(Boolean).map(e => e!.toLowerCase().trim());

            const submittedEmail = email.toLowerCase().trim();
            const authEmail = auth.user.email.toLowerCase().trim();
            const isTestAccount = testEmails.includes(submittedEmail) || testEmails.includes(authEmail);

            if (!isTestAccount) {
                // ── 2. Precise OTP Verification with Attempt Counting ──
                const { data: codeRecord, error: fetchError } = await supabaseAdmin
                    .from('verification_codes')
                    .select('*')
                    .eq('email', email)
                    .is('used', false)
                    .single();

                if (fetchError || !codeRecord) {
                    return NextResponse.json({ error: 'No active verification session found.' }, { status: 404 });
                }

                // check expiry
                if (new Date(codeRecord.expires_at) < new Date()) {
                    await supabaseAdmin.from('verification_codes').delete().eq('id', codeRecord.id);
                    return NextResponse.json({ error: 'Verification code has expired.' }, { status: 410 });
                }

                // verify code
                if (codeRecord.code !== otp) {
                    const newAttempts = (codeRecord.attempts || 0) + 1;

                    if (newAttempts >= 5) {
                        await supabaseAdmin.from('verification_codes').delete().eq('id', codeRecord.id);
                        return NextResponse.json({ error: 'Too many incorrect attempts. Code invalidated.' }, { status: 403 });
                    }

                    await supabaseAdmin.from('verification_codes').update({ attempts: newAttempts }).eq('id', codeRecord.id);
                    return NextResponse.json({ error: `Invalid code. ${5 - newAttempts} attempts remaining.` }, { status: 401 });
                }

                // Mark OTP as used
                await supabaseAdmin.from('verification_codes').update({ used: true }).eq('id', codeRecord.id);
            }

            // Update Auth if email changed
            const { data: existingProfile } = await supabaseAdmin.from('profiles').select('email').eq('id', userId).single();

            if (existingProfile && existingProfile.email !== email) {
                const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, { email });
                if (authError) return serverErrorResponse();
            }

            // Update Profile
            const { error: updateError } = await supabaseAdmin
                .from('profiles')
                .upsert({
                    id: userId,
                    email,
                    company_name: companyName,
                    phone_number: phoneNumber,
                    logo_url: logoUrl,
                    updated_at: new Date().toISOString()
                });

            if (updateError) return serverErrorResponse();

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error: any) {
        console.error('[PROFILE-POST-ERROR]', error);
        return serverErrorResponse();
    }
}
