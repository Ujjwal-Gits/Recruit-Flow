import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Creates a Supabase client for use in API Route Handlers (App Router).
 * Reads the user's session from cookies — this is how we know WHO is calling the API.
 * 
 * This uses the ANON KEY (not service role), so RLS policies apply.
 * For admin operations that bypass RLS, continue using supabaseAdmin from supabase-admin.ts
 */
export async function createRouteClient() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // Ignore — setAll can fail in read-only contexts (middleware)
                    }
                },
            },
        }
    );
}
