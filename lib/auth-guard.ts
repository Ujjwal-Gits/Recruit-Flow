import { NextResponse } from 'next/server';
import { createRouteClient } from './supabase-server';
import { supabaseAdmin } from './supabase-admin';
import { cookies } from 'next/headers';

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

// ── Server-side in-memory caches ──────────────────────────────────────────
// userId → full AuthResult (60s TTL) — survives across requests in same process
const authResultCache = new Map<string, { result: AuthResult; expiresAt: number }>();
const profileCache    = new Map<string, { data: any; expiresAt: number }>();
const AUTH_TTL    = 60_000;
const PROFILE_TTL = 60_000;

function cleanup() {
    const now = Date.now();
    for (const [k, v] of authResultCache.entries()) if (now > v.expiresAt) authResultCache.delete(k);
    for (const [k, v] of profileCache.entries())    if (now > v.expiresAt) profileCache.delete(k);
}

export function invalidateUserCache(userId: string) {
    profileCache.delete(userId);
    authResultCache.delete(userId);
}

// Decode JWT payload without any network call — just base64
// We use this ONLY to get the user ID for cache lookup.
// The actual verification still happens via supabase.auth.getUser() on cache miss.
function decodeJwtPayload(token: string): { sub?: string; email?: string; exp?: number } | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const payload = Buffer.from(parts[1], 'base64url').toString('utf8');
        return JSON.parse(payload);
    } catch {
        return null;
    }
}

// Read the raw JWT access token from cookies — zero network calls
async function getAccessTokenFromCookies(): Promise<string | null> {
    try {
        const cookieStore = await cookies();
        const all = cookieStore.getAll();

        for (const c of all) {
            // Supabase default cookie name: sb-<project-ref>-auth-token
            if (c.name.includes('-auth-token') || c.name === 'sb-access-token') {
                try {
                    const parsed = JSON.parse(c.value);
                    if (Array.isArray(parsed) && typeof parsed[0] === 'string') return parsed[0];
                    if (typeof parsed === 'string' && parsed.startsWith('eyJ')) return parsed;
                } catch {
                    if (c.value.startsWith('eyJ')) return c.value;
                }
            }
        }
        return null;
    } catch {
        return null;
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
        // ── Step 1: Read JWT from cookies (zero network calls) ──
        const token = await getAccessTokenFromCookies();

        if (token) {
            const payload = decodeJwtPayload(token);
            const userId = payload?.sub;

            // ── Step 2: Check if JWT is expired locally ──
            if (payload?.exp && payload.exp * 1000 < Date.now()) {
                // Token expired — clear cache and fall through to re-auth
                if (userId) authResultCache.delete(userId);
            } else if (userId) {
                // ── Step 3: Cache hit by userId — return immediately, zero network ──
                const cached = authResultCache.get(userId);
                if (cached && Date.now() < cached.expiresAt) return cached.result;

                // ── Step 4: Profile cached but auth result not — rebuild from profile cache ──
                const profileCached = profileCache.get(userId);
                if (profileCached && Date.now() < profileCached.expiresAt) {
                    const profile = profileCached.data;
                    const email = payload?.email || profile?.email || '';
                    if (email) {
                        const result: AuthResult = {
                            user: { id: userId, email },
                            role: profile?.role || 'recruiter',
                            tier: profile?.tier || 'free',
                            profile,
                        };
                        authResultCache.set(userId, { result, expiresAt: Date.now() + AUTH_TTL });
                        return result;
                    }
                }
            }
        }

        // ── Step 5: Cache miss — verify with Supabase Auth server (one network call) ──
        const supabase = await createRouteClient();
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user || !user.email) return null;

        // ── Step 6: Fetch profile (cached after first hit) ──
        const profile = await getCachedProfile(user.id);

        const result: AuthResult = {
            user: { id: user.id, email: user.email },
            role: profile?.role || 'recruiter',
            tier: profile?.tier || 'free',
            profile,
        };

        // ── Step 7: Cache by userId ──
        authResultCache.set(user.id, { result, expiresAt: Date.now() + AUTH_TTL });
        if (Math.random() < 0.05) cleanup();

        return result;
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
