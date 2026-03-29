import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ═══════════════════════════════════════════════════════════════
// ROUTE CLASSIFICATION — Define what's public vs protected
// ═══════════════════════════════════════════════════════════════

const PUBLIC_ROUTES = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/apply',       // public job application pages
];

const PUBLIC_API_ROUTES = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/verify-otp',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/auth/callback',         // Add this: allows OAuth flow to complete
    '/api/process-application',   // public: candidate submits resume
    '/api/job-info',              // public: job details for apply page
    '/api/migrate',               // Temporary: Allow running migration script
];

// Routes that should NEVER be accessible in production
const BLOCKED_ROUTES = [
    '/api/debug-user',
    '/api/check-columns',
];

// Routes gated behind admin-only access (owner/manager/support)
const ADMIN_GATED_ROUTES = [
    '/api/auth/seed',
    '/iamadmin',
    '/api/iamadmin',
    '/api/support/admin',
];

function normalizePath(pathname: string): string {
    // Remove trailing slash if it exists (except for the root '/')
    return pathname.length > 1 && pathname.endsWith('/') 
        ? pathname.slice(0, -1) 
        : pathname;
}

function isPublicRoute(pathname: string): boolean {
    const p = normalizePath(pathname);
    if (PUBLIC_ROUTES.includes(p)) return true;
    if (p.startsWith('/apply/')) return true;
    return false;
}

function isPublicAPIRoute(pathname: string): boolean {
    const p = normalizePath(pathname);
    if (PUBLIC_API_ROUTES.includes(p)) return true;
    if (p.startsWith('/api/job-info/')) return true;
    return false;
}

function isBlockedRoute(pathname: string): boolean {
    const p = normalizePath(pathname);
    return BLOCKED_ROUTES.some(r => p.startsWith(r));
}

function isAdminGatedRoute(pathname: string): boolean {
    const p = normalizePath(pathname);
    return ADMIN_GATED_ROUTES.some(r => p.startsWith(r));
}

function isStaticAsset(pathname: string): boolean {
    return (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon') ||
        pathname.includes('.') // files like .ico, .png, .css, .js
    );
}

// ═══════════════════════════════════════════════════════════════
// MIDDLEWARE
// ═══════════════════════════════════════════════════════════════

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Skip static assets entirely
    if (isStaticAsset(pathname)) {
        return NextResponse.next();
    }

    // 2. BLOCK dangerous debug routes — return 404 as if they don't exist
    if (isBlockedRoute(pathname)) {
        return NextResponse.json(
            { error: 'Not Found' },
            { status: 404 }
        );
    }

    // 3. Allow public pages and API routes through without auth
    if (isPublicRoute(pathname) || isPublicAPIRoute(pathname)) {
        return NextResponse.next();
    }

    // 4. Create Supabase server client to verify session from cookies
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    // Update request cookies (for downstream handlers)
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    // Update response cookies (sent back to browser)
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Use getSession() instead of getUser() in middleware to avoid a synchronous network request 
    // to the Supabase Auth server on EVERY SINGLE page load and API call.
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;

    // 5. Admin-gated routes: require admin role
    if (isAdminGatedRoute(pathname)) {
        if (!user) {
            // Not logged in: Redirect page to login, or 401 for API
            if (pathname.startsWith('/api/')) {
                return NextResponse.json({ error: 'Not Found' }, { status: 404 });
            }
            return NextResponse.redirect(new URL('/login', request.url));
        }

        // Check admin role — use service role to avoid RLS restrictions
        const adminClient = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { persistSession: false } }
        );
        const { data: profile } = await adminClient
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const isAuthorized = profile && ['owner', 'manager', 'support', 'admin'].includes(profile.role);
        
        if (!isAuthorized) {
            // Not an admin: 404 for API, redirect page to /dashboard
            if (pathname.startsWith('/api/')) {
                return NextResponse.json({ error: 'Not Found' }, { status: 404 });
            }
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }

        // Add CACHE-CONTROL headers to prevent Next.js/Browser from caching the admin response
        const res = NextResponse.next();
        res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.headers.set('Pragma', 'no-cache');
        res.headers.set('Expires', '0');
        return res;
    }

    // 6. Protected page routes (/dashboard, /iamadmin) — redirect to login
    //    NOTE: Role-based redirect (recruiter vs admin) is handled CLIENT-SIDE
    //    in DashboardClient.tsx and AdminDashboardClient.tsx to avoid expensive
    //    DB queries in middleware on every single page load.
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/iamadmin')) {
        if (!user) {
            const loginUrl = new URL('/login', request.url);
            return NextResponse.redirect(loginUrl);
        }
        return supabaseResponse;
    }

    // 7. Protected API routes — return 401 JSON
    if (pathname.startsWith('/api/')) {
        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required.' },
                {
                    status: 401,
                    headers: {
                        'X-Content-Type-Options': 'nosniff',
                        'X-Frame-Options': 'DENY',
                    }
                }
            );
        }
        return supabaseResponse;
    }

    // 8. Everything else — pass through
    return supabaseResponse;
}

// Only run middleware on these paths (skip static files at the config level)
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization)
         * - favicon.ico (favicon)
         * - public folder assets
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
