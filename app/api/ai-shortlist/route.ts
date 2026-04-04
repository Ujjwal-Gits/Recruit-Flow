import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser, unauthorizedResponse, forbiddenResponse, serverErrorResponse } from '@/lib/auth-guard';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// GET — check if shortlist already exists for this job
export async function GET(req: Request) {
    try {
        const auth = await getAuthenticatedUser();
        if (!auth) return unauthorizedResponse();
        if (auth.tier !== 'enterprise') return forbiddenResponse('Enterprise required.');

        const { searchParams } = new URL(req.url);
        const jobId = searchParams.get('jobId');
        if (!jobId) return NextResponse.json({ error: 'jobId required' }, { status: 400 });

        const { data: job } = await supabaseAdmin
            .from('jobs')
            .select('ai_shortlist, title')
            .eq('id', jobId)
            .eq('user_id', auth.user.id)
            .single();

        if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

        return NextResponse.json({
            exists: !!job.ai_shortlist,
            shortlist: job.ai_shortlist || null,
            title: job.title,
        });
    } catch {
        return serverErrorResponse();
    }
}

export async function POST(req: Request) {
    try {
        const auth = await getAuthenticatedUser();
        if (!auth) return unauthorizedResponse();
        if (auth.tier !== 'enterprise') return forbiddenResponse('Enterprise subscription required for AI shortlisting.');

        const { jobId, applicants } = await req.json();
        if (!jobId || !applicants?.length) {
            return NextResponse.json({ error: 'Job ID and applicants are required' }, { status: 400 });
        }

        const { data: job } = await supabaseAdmin
            .from('jobs')
            .select('title, description, ai_shortlist')
            .eq('id', jobId)
            .eq('user_id', auth.user.id)
            .single();

        if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

        // Already used — return cached result
        if (job.ai_shortlist) {
            return NextResponse.json({ ...job.ai_shortlist, cached: true });
        }

        let jobDesc = job.description;
        try { jobDesc = JSON.parse(job.description).text || job.description; } catch {}

        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            generationConfig: { temperature: 0.2 }
        });

        const candidateList = applicants.map((a: any, i: number) =>
            `[${i + 1}] ID: ${a.id} | Name: ${a.name} | ATS Score: ${a.ats_score}/100\nSummary: ${(a.ai_summary || '').slice(0, 400)}`
        ).join('\n\n');

        const prompt = `You are an expert recruitment AI. Analyze these candidates for the role below and provide a ranked shortlist of exactly the top 5.

JOB: ${job.title}
DESCRIPTION: ${jobDesc.slice(0, 800)}

CANDIDATES:
${candidateList}

Return a JSON object with this exact structure:
{
  "shortlist": [
    {
      "id": "candidate_id",
      "rank": 1,
      "name": "candidate name",
      "score": 85,
      "verdict": "One sentence why this candidate is the best fit",
      "strengths": ["strength 1", "strength 2"],
      "gap": "One key gap or concern"
    }
  ],
  "summary": "2-3 sentence overall analysis of the candidate pool",
  "recommendation": "Name of the single best candidate and why in one sentence"
}

Rank EXACTLY the top 5 candidates only. Be specific and data-driven. Return ONLY valid JSON.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return NextResponse.json({ error: 'AI analysis failed' }, { status: 500 });

        const analysis = JSON.parse(jsonMatch[0]);

        // Save to DB — one time only
        await supabaseAdmin
            .from('jobs')
            .update({ ai_shortlist: analysis })
            .eq('id', jobId);

        return NextResponse.json({ ...analysis, cached: false });
    } catch (error: any) {
        console.error('AI shortlist error:', error);
        return serverErrorResponse();
    }
}
