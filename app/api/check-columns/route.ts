import { supabaseAdmin } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from('applications')
            .select('*')
            .limit(1);
        
        if (error) throw error;

        const columns = data.length > 0 ? Object.keys(data[0]) : [];
        return NextResponse.json({ columns });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
