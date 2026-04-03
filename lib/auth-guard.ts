import { NextResponse } from 'next/server';
import { createRouteClient } from './supabase-server';
import { supabaseAdmin } from './supabase-admin';

const SECURITY_HEADERS: Record<string, string> = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
};

export interface AuthResult {
    user: { id: string; email: string };
    role: string;
    tier: string;
    profile: any;
}

// ── In-memory caches (server process lifetime) ─────────────────────────────
// auth cache: JWT sub → user id+email (60s TTL — JWT is still valid)
// profile cache: user id → profile row (30s TTL)
const authCache = new Map<string, { userId: string; email: string; expiresAt: number }>();
const profileCache = new Map<string, { data: any; expiresAt: number }>();
const AUTH_TTL = 60_000;
const PROFILE_TTL = 30_000;

function cleanup() {
    const now = Date.now();
    for (const [k, v] of authCache.entries()) if (now > v.expiresAt) authCache.delete(k);
    for (const [k, v] of profileCache.entries()) if (now > v.expiresAt) profileCache.delete(k);
}

export function invalidateUserCache(userId: string) {
    profileCache.delete(userId);
    // also evict any auth cache entries for this user
    for (const [k, v] of authCache.entries()) {
        if (v.userId === userId) authCache.delete(k);
    }
}

async function getCachedProfile(userId: string) {
    const cached = profileCache.get(userId);
    if (cached && Date.now() < cached.expiresAt) return cached.data;

    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id, email, role, tier, company_name, phone_number, logo_url, updated_at')
        .eq('id', userId)
        .single();

    profileCache.set(userId, { data: profile, expiresAt: Date.now() + PROFILE_TTL });
    if (Math.random() < 0.05) cleanup();
    return profile;
}

export async function getAuthenticatedUser(): Promise<AuthResult | null> {
    try {
        const supabase = await createRouteClient();

        // getUser() verifies the JWT with Supabase Auth server — cache the result
        // so parallel/rapid API calls in the same server process skip the round-trip
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user || !user.email) return null;

        const profile = await getCachedProfile(user.id);

        return {
            user: { id: user.id, email: user.email },
            role: profile?.role || 'recruiter',
            tier: profile?.tier || 'free',
            profile: profile,
        };
    } catch {
        return null;
    }
}

export function unauthorizedResponse(message = 'Authentication required.') {
    return NextResponse.json({ error: message }, { status: 401, headers: SECURITY_HEADERS });
}

export function forbiddenResponse(message = 'You do not have permission to perform this action.') {
    return NextResponse.json({ error: message }, { status: 403, headers: SECURITY_HEADERS });
}

export function serverErrorResponse() {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500, headers: SECURITY_HEADERS });
}
