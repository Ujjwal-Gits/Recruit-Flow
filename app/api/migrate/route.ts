import { supabaseAdmin } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const statements = [
            `CREATE TABLE IF NOT EXISTS verification_codes (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                email TEXT NOT NULL,
                code TEXT NOT NULL,
                used BOOLEAN DEFAULT false,
                expires_at TIMESTAMPTZ NOT NULL,
                created_at TIMESTAMPTZ DEFAULT now()
            )`,
            `ALTER TABLE applications ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending'`,
            `ALTER TABLE applications ADD COLUMN IF NOT EXISTS reasons TEXT[] DEFAULT '{}'`,
            `ALTER TABLE applications ADD COLUMN IF NOT EXISTS custom_reason TEXT DEFAULT ''`,
            `ALTER TABLE jobs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id)`,
            `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_name TEXT DEFAULT ''`,
            `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_number TEXT DEFAULT ''`,
            `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS logo_url TEXT DEFAULT ''`,
            `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT`,
            `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_expiry TIMESTAMPTZ`
        ];

        const results = [];
        for (const sql of statements) {
            const { error } = await supabaseAdmin.rpc('run_sql', { sql_query: sql });
            if (error) {
                console.log(`Migration step failed: ${sql.substring(0, 50)}... -> ${error.message}`);
                results.push({ sql: sql.substring(0, 30), status: 'failed', error: error.message });
            } else {
                results.push({ sql: sql.substring(0, 30), status: 'success' });
            }
        }

        // step 7: Add tier column to profiles
        await supabaseAdmin.rpc('run_sql', {
            sql_query: `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'free';`
        });

        // step 8: Add status and reasons to applications
        await supabaseAdmin.rpc('run_sql', {
            sql_query: `
                ALTER TABLE applications ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
                ALTER TABLE applications ADD COLUMN IF NOT EXISTS reasons TEXT[];
                ALTER TABLE applications ADD COLUMN IF NOT EXISTS custom_reason TEXT DEFAULT '';
            `
        });

        // step 9: Create meetings table
        await supabaseAdmin.rpc('run_sql', {
            sql_query: `
                CREATE TABLE IF NOT EXISTS meetings (
                    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
                    start_time TIMESTAMPTZ NOT NULL,
                    end_time TIMESTAMPTZ NOT NULL,
                    mode TEXT DEFAULT 'virtual',
                    title TEXT DEFAULT 'Interview',
                    notes TEXT DEFAULT ''
                );
                ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
                CREATE POLICY "Allow all on meetings" ON meetings FOR ALL USING (true) WITH CHECK (true);
            `
        });

        // step 10: Robustly set enterprise demo user (from env)
        const demoEmail = process.env.PRO_EMAIL || 'demo@example.com';
        await supabaseAdmin.rpc('run_sql', {
            sql_query: `
                DO $$
                DECLARE 
                    tgt_id UUID;
                    demo_email TEXT := '${demoEmail}';
                BEGIN
                    -- Try to find the user in auth.users
                    SELECT id INTO tgt_id FROM auth.users WHERE email = demo_email LIMIT 1;
                    
                    IF tgt_id IS NOT NULL THEN
                        -- Ensure profile exists and is enterprise
                        INSERT INTO public.profiles (id, email, full_name, tier)
                        VALUES (tgt_id, demo_email, 'Demo Account', 'enterprise')
                        ON CONFLICT (id) DO UPDATE SET tier = 'enterprise';
                    END IF;
                END $$;
            `
        });

        // step 11: Add image_url to support_messages
        await supabaseAdmin.rpc('run_sql', {
            sql_query: `ALTER TABLE support_messages ADD COLUMN IF NOT EXISTS image_url TEXT;`
        });

        // ============================================================
        // STEP 12: SECURITY HARDENING — Fix ALL Supabase Advisor Issues
        // Each fix is its own isolated call so $$ delimiters don't clash
        // ============================================================
        const securityResults: { step: string; status: string; error?: string }[] = [];

        const securitySteps: { name: string; sql: string }[] = [
            // --- Fix 1: Function search_path (handle_new_user) ---
            {
                name: 'Secure handle_new_user search_path',
                sql: `DO $fn$ BEGIN
                    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') THEN
                        ALTER FUNCTION public.handle_new_user() SET search_path = public;
                    END IF;
                END $fn$;`
            },
            // --- Fix 2: Function search_path (cleanup_expired_codes) ---
            {
                name: 'Secure cleanup_expired_codes search_path',
                sql: `DO $fn$ BEGIN
                    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'cleanup_expired_codes') THEN
                        ALTER FUNCTION public.cleanup_expired_codes() SET search_path = public;
                    END IF;
                END $fn$;`
            },
            // --- Fix 3: Function search_path (update_updated_at_column) ---
            {
                name: 'Secure update_updated_at_column search_path',
                sql: `DO $fn$ BEGIN
                    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
                        ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
                    END IF;
                END $fn$;`
            },
            // --- Fix 4: Enable RLS on core tables ---
            {
                name: 'Enable RLS on profiles, jobs, applications, verification_codes',
                sql: `ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
                      ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
                      ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
                      ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;`
            },
            // --- Fix 5: Enable RLS on transactions ---
            {
                name: 'Enable RLS on transactions',
                sql: `DO $fn$ BEGIN
                    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='transactions') THEN
                        EXECUTE 'ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY';
                    END IF;
                END $fn$;`
            },
            // --- Fix 6: Enable RLS on rate_limits ---
            {
                name: 'Enable RLS on rate_limits',
                sql: `DO $fn$ BEGIN
                    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='rate_limits') THEN
                        EXECUTE 'ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY';
                    END IF;
                END $fn$;`
            },
            // --- Fix 7: Hardened policies for profiles ---
            {
                name: 'Harden profiles policies',
                sql: `DROP POLICY IF EXISTS "Allow all on profiles" ON public.profiles;
                      DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
                      DROP POLICY IF EXISTS "Profiles are self-viewable" ON public.profiles;
                      DROP POLICY IF EXISTS "Profiles are self-updatable" ON public.profiles;
                      DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
                      DROP POLICY IF EXISTS "Profiles insert own" ON public.profiles;
                      CREATE POLICY "Profiles are self-viewable" ON public.profiles FOR SELECT USING (auth.uid() = id);
                      CREATE POLICY "Profiles are self-updatable" ON public.profiles FOR UPDATE USING (auth.uid() = id);
                      CREATE POLICY "Profiles insert own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
                      CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (
                          EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('owner','manager','support'))
                      );`
            },
            // --- Fix 8: Hardened policies for jobs ---
            {
                name: 'Harden jobs policies',
                sql: `DROP POLICY IF EXISTS "Allow all on jobs" ON public.jobs;
                      DROP POLICY IF EXISTS "Jobs are public" ON public.jobs;
                      DROP POLICY IF EXISTS "Recruiters manage own jobs" ON public.jobs;
                      CREATE POLICY "Jobs are public" ON public.jobs FOR SELECT USING (true);
                      CREATE POLICY "Recruiters manage own jobs" ON public.jobs FOR ALL USING (
                          user_id = auth.uid() OR
                          EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner','manager'))
                      );`
            },
            // --- Fix 9: Hardened policies for applications ---
            {
                name: 'Harden applications policies',
                sql: `DROP POLICY IF EXISTS "Allow all on applications" ON public.applications;
                      DROP POLICY IF EXISTS "Public can apply" ON public.applications;
                      DROP POLICY IF EXISTS "Recruiters view own job apps" ON public.applications;
                      CREATE POLICY "Public can apply" ON public.applications FOR INSERT WITH CHECK (true);
                      CREATE POLICY "Recruiters view own job apps" ON public.applications FOR SELECT USING (
                          EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = applications.job_id AND j.user_id = auth.uid()) OR
                          EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner','manager','support'))
                      );`
            },
            // --- Fix 10: Hardened policies for verification_codes ---
            {
                name: 'Harden verification_codes policies',
                sql: `DROP POLICY IF EXISTS "Allow all on verification_codes" ON public.verification_codes;
                      DROP POLICY IF EXISTS "System manage verifications" ON public.verification_codes;
                      CREATE POLICY "System manage verifications" ON public.verification_codes FOR ALL USING (false) WITH CHECK (false);`
            },
            // --- Fix 11: Hardened policies for rate_limits ---
            {
                name: 'Harden rate_limits policies',
                sql: `DO $fn$ BEGIN
                    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='rate_limits') THEN
                        EXECUTE 'DROP POLICY IF EXISTS "Allow all on rate_limits" ON public.rate_limits';
                        EXECUTE 'DROP POLICY IF EXISTS "System manage rate limits" ON public.rate_limits';
                        EXECUTE 'CREATE POLICY "System manage rate limits" ON public.rate_limits FOR ALL USING (false) WITH CHECK (false)';
                    END IF;
                END $fn$;`
            },
            // --- Fix 12: Hardened policies for transactions ---
            {
                name: 'Enable RLS and Harden transactions policies',
                sql: `
                    -- 1. Enable RLS
                    ALTER TABLE IF EXISTS public.transactions ENABLE ROW LEVEL SECURITY;
                    
                    -- 2. Clean old policies
                    DROP POLICY IF EXISTS "Allow all on transactions" ON public.transactions;
                    DROP POLICY IF EXISTS "Admins manage transactions" ON public.transactions;
                    DROP POLICY IF EXISTS "transactions_select_owner" ON public.transactions;
                    DROP POLICY IF EXISTS "transactions_insert_owner" ON public.transactions;
                    
                    -- 3. Create restrictive policies (Owner only access for normal users)
                    -- If table has user_id, allow user access. Else admins only.
                    DO $fn$ BEGIN
                        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='transactions' AND column_name='user_id') THEN
                            EXECUTE 'CREATE POLICY "transactions_select_owner" ON public.transactions FOR SELECT TO authenticated USING (auth.uid() = user_id)';
                            EXECUTE 'CREATE POLICY "transactions_insert_owner" ON public.transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)';
                        END IF;
                        
                        -- Always allow sys admins
                        EXECUTE 'CREATE POLICY "Admins manage transactions" ON public.transactions FOR ALL USING (
                            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN (''owner'',''manager''))
                        )';
                    END $fn$;
                `
            },
        ];

        for (const step of securitySteps) {
            const { error } = await supabaseAdmin.rpc('run_sql', { sql_query: step.sql });
            if (error) {
                console.error(`Security step "${step.name}" failed:`, error.message);
                securityResults.push({ step: step.name, status: 'failed', error: error.message });
            } else {
                securityResults.push({ step: step.name, status: 'success' });
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: 'Enterprise migration v4.0.0 (Security Hardening) executed.',
            version: '4.0.0',
            securityResults
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
