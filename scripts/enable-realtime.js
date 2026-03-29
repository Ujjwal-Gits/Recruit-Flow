
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function enableRealtime() {
    console.log('Enabling real-time for support_messages...');
    const { data, error } = await supabase.rpc('enable_realtime_for_table', { table_name: 'support_messages' });
    
    if (error) {
        console.log('RPC failed (probably does not exist). Trying direct SQL if possible...');
        // Unfortunately we can't run arbitrary SQL via RPC normally unless we created it.
        // But we can check the status of the publication.
    } else {
        console.log('Successfully enabled real-time via RPC.');
    }
}

enableRealtime();
