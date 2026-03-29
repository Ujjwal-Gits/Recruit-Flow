import { supabaseAdmin } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';

export async function GET() {
    // Test with sql_query parameter
    const { data: testData, error: testError } = await supabaseAdmin.rpc('run_sql', {
        sql_query: "SELECT 1 as result;"
    });
        
    return NextResponse.json({ testData, testError });
}
