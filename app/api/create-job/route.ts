import { supabaseAdmin } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser, unauthorizedResponse, serverErrorResponse } from '@/lib/auth-guard';

export async function POST(req: Request) {
    try {
        const auth = await getAuthenticatedUser();
        if (!auth) return unauthorizedResponse();

        const { title, company_name, description } = await req.json();

        if (!title || !company_name) {
            return NextResponse.json({ error: 'Job title and company name are required' }, { status: 400 });
        }

        // Strict Tier Limits
        const { count, error: countError } = await supabaseAdmin
            .from('jobs')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', auth.user.id);
            
        const limit = auth.tier === 'enterprise' ? 10 : (auth.tier === 'pro' ? 4 : 1);
        
        if (count !== null && count >= limit) {
             return NextResponse.json({ error: `Upgrade required. Your ${auth.tier.toUpperCase()} tier allows up to ${limit} active job postings.` }, { status: 403 });
        }


        const { data, error } = await supabaseAdmin
            .from('jobs')
            .insert({
                title: String(title).slice(0, 255),
                company_name: String(company_name).slice(0, 255),
                description: String(description || '').slice(0, 5000),
                user_id: auth.user.id  // Use verified session user, not request body
            })
            .select()
            .single();

        if (error) {
            console.error('Job creation error:', error);
            return serverErrorResponse();
        }

        return NextResponse.json({ success: true, job: data });
    } catch (error: any) {
        console.error('API error:', error);
        return serverErrorResponse();
    }
}

// triggered hmr refresh
