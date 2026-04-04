import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Fix Safari/iOS ITP logout: explicit SameSite + Secure + maxAge
// Do NOT set a custom cookie name — it breaks Supabase OAuth PKCE flow
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions: {
        sameSite: 'lax',
        secure: false, // must be false in dev (localhost is not HTTPS); Supabase handles this in prod
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
    },
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
    }
});
