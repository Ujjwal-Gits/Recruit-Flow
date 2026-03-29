import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser client using @supabase/ssr — stores session in cookies
// so that middleware and API routes can verify the session server-side.
// This is a DROP-IN replacement for the old createClient() call.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
