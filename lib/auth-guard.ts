import { NextResponse } from 'next/server';
import { createRouteClient } from './supabase-server';
import { supabaseAdmin } from './supabase-admin';
import { cookies } from 'next/headers';

// Standard security headers we attach to every API response.
// These tell browsers not to sniff content types, not to embed us in iframes, etc.
const SECURITY_HEADERS: Record<string, string> = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
};

// This is what e.
// We include the profile so routes don't have to fetch it again.
export interface AuthResult {
    user: { id: string; email: string };
    role: string;
    tier: string;
    profile: any;
}

// Two in-memory caches that live for the lifetime of the server process.
// authResultCache: keyed by userId, stores the full auth result for 60 seconds.
// profileCache: keyed by userId, stores the profile row for 60 seconds.
// This means after the first request, subsequent requests within 60s skip
// both the Supabase Auth server call AND the database profile query entirely.
const authResultCache = new Map<string, { result: AuthResult; expiresAt: number }>();
const profileCache    = new Map<string, { data: any; expiresAt: number }>();
const AUTH_TTL    = 60_000; // 60 seconds — JWT is still valid during this window
const PROFILE_TTL = 60_000; // 60 seconds — profile data doesn't change that often

// Runs occasionally (5% of requests) to remove expired entries.
// We don't run it every time becauul.
function cleanup() {
w = Date.now();
    for (const [k, v] of authResultCache.entries()) if (now > v.expiresAt) authResultCache.delete(k);
    for (const [k, v] of profileCache.entries())    if (now > v.expiresAt) profileCache.delete(k);
}

// Call this whenever a user's profile changes (tier upgrade, role change, etc.)
// so the next request gets fresh data instead of stale cached data.
export function invalidateUserCache(userId: string) {
    profileCache.delete(userId);
    authResultCache.delete(userId);
}

// Re access token directly from cookies without making any network call.
// We use this to get the userId for cache lookup before deciding whether to
// hit the Supabase Auth server. If the token is expired, we skip the cache.
function decodeJwtPayload(token: string): { sub?: string; email?: string; exp?: number } | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        // The middle part of a JWT is the payload, base64url encoded
parts[1], 'base64url').toString('utf8');
        return JSON.parse(payload);
    } catch {
        return null;
    }
}

// Looks through all cookies to find the Supabase session token.
// Supabase SSR stores the session as a JSON array [access_token, refresh_token]
// in a cookie named sb-<project-ref>-auth-token.
async function getAccessTokenFromCookies(): Promise<string | null> {
    try {
        const cookieStore = await cookies();
        const all = cookieStore.getAll();

        for (const c
            if (c.name.includes('-auth-token') || c.name === 'sb-access-token') {
                try {
                    const parsed = JSON.parse(c.value);
                    // Supabase stores it as [access_token, refresh_token]
                    if (Array.isArray(parsed) && typeof parsed[0] === 'string') return parsed[0];
                    if (typeof parsed === 'string' && parsed.startsWith('eyJ')) return parsed;
                } catch {
                    // Sometimes it's just a plaien
                    if (c.value.startsWith('eyJ')) return c.value;
                }
            }
        }
        return null;
    } catch {
        return null;
    }
}

// Fetches the user's profile from the database, with a 60-second cache.
// We use the admin client here so RLS doesn't block us — this is server-side only.
async function getCachedProfile(userId: string) {
    const cached = profileCache.get(userId);
    if (cached && Date.now() < cached.expiresAt) return cached.data;

    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id, email, role, tier, company_name, phone_number, logo_url, updated_at')
        .eq('id', userId)
        .single();

    profileCache.set(userId, { data: profile, expiresAt: Date.now() + PROFILE_TTL });
    if (Math.random() < 0.05) cleanup(); // occasional cleanup
    return profile;
}

// The main function every API route calls to verify the request is authenticated.
// Flow:
//   1. Read JWT from cookies (zero network calls)
//   2. Decode it locally to get userId and check expiry
//   3. Check the in-memory cache — if hit, return immediately (zero network calls)
//   4. On cache miss, verify with Supabase Auth server (one network call)
//   5. Fetch profile from DB (cached after first hit)
//   6. Cache the full result for next time
export async function getAuthenticatedUser(): Promise<AuthResult | null> {
    try {
        // Step 1: read the token from cookies — no network needed
        const token = await getAccess();

        if (token) {
            const payload = decodeJwtPayload(token);
            const userId = payload?.sub;

            // If the token is expired, clear the cache and fall through to re-auth
            if (payload?.exp && payload.exp * 1000 < Date.now()) {
                if (userId) authResultCache.delete(userId);
            } else if (userId) {
                // Cache hit — return immediately without any network calls
                const cached = authResultCache.get(userId);
                if (cached && Date.now() < cached.expiresAt) return cached.result;

                // Profile is cached but auth result isn't — rebuild from profile cache
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

ow path)
        const supabase = await createRouteClient();
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user || !user.email) return null;

        // Fetch profile (cached after first hit)
        const profile = await getCachedProfile(user.id);

        const result: AuthResult = {
            user: { id: user.id, email: user.email },
            role: profile?.role || 'recruiter',
            tier: profile?.tier || 'free',
401, headers: SECURITY_HEADERS });
}

export function forbiddenResponse(message = 'You do not have permission to perform this action.') {
    return NextResponse.json({ error: message }, { status: 403, headers: SECURITY_HEADERS });
}

export function serverErrorResponse() {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500, headers: SECURITY_HEADERS });
}


        // Cache the result so the next request within 60s is instant
        if (token) {
            authResultCache.set(user.id, { result, expiresAt: Date.now() + AUTH_TTL });
            if (Math.random() < 0.05) cleanup();
        }

        return result;
    } catch {
        return null;
    }
}

// Shorthand response helpers so routes don't have to repeat this boilerplate.
export function unauthorizedResponse(message = 'Authentication required.') {
    return NextResponse.json({ error: message }, { status:             profile,
        };
