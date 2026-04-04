import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase-server';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/dashboard';

    if (code) {
        try {
            const supabase = await createRouteClient();
            const { error } = await supabase.auth.exchangeCodeForSession(code);

            if (!error) {
                return NextResponse.redirect(`${origin}${next}`);
            }
            console.error('[OAuth callback error]', error.message);
        } catch (err) {
            console.error('[OAuth callback exception]', err);
        }
    }

    return NextResponse.redirect(`${origin}/login?error=OAuth+failed`);
}
