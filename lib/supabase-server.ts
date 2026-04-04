import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createRouteClient() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookieOptions: {
                sameSite: 'lax',
                secure: false,
                maxAge: 60 * 60 * 24 * 7,
                path: '/',
            },
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
                        // Ignore — setAll can fail in read-only contexts
                    }
                },
            },
        }
    );
}
