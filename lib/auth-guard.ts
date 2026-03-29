import { NextResponse } from 'next/server';
import { createRouteClient } from './supabase-server';
import { supabaseAdmin } from './supabase-admin';

// Standard security headers applied to all protected API responses
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

export function invalidateUserCache(userId: string) {
    // No-op: Global cache removed for security
}

export async function getAuthenticatedUser(): Promise<AuthResult | null> {
    try {
        const supabase = await createRouteClient();
        
        // Use getSession() instead of getUser() — this reads from cookies locally
        // and does NOT make a network call to the Supabase Auth server.
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session?.user || !session.user.email) {
            return null;
        }

        const user = session.user;

        // Fetch profile — only select the columns we actually need
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('id, email, role, tier, company_name, phone_number, logo_url, updated_at')
            .eq('id', user.id)
            .single();

        const result: AuthResult = {
            user: { id: user.id, email: user.email },
            role: profile?.role || 'recruiter',
            tier: profile?.tier || 'free',
            profile: profile
        };

        return result;
    } catch {
        return null;
    }
}

/**
 * Returns a 401 response. Call this when auth fails.
 */
export function unauthorizedResponse(message = 'Authentication required.') {
    return NextResponse.json(
        { error: message },
        { status: 401, headers: SECURITY_HEADERS }
    );
}

/**
 * Returns a 403 response. Call this when a user lacks permission.
 */
export function forbiddenResponse(message = 'You do not have permission to perform this action.') {
    return NextResponse.json(
        { error: message },
        { status: 403, headers: SECURITY_HEADERS }
    );
}

/**
 * Returns a generic 500 response. NEVER expose raw error messages.
 */
export function serverErrorResponse() {
    return NextResponse.json(
        { error: 'Internal server error.' },
        { status: 500, headers: SECURITY_HEADERS }
    );
}

// triggered hmr refresh
