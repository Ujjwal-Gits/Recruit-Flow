import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser, unauthorizedResponse, serverErrorResponse } from '@/lib/auth-guard';
import { supabaseAdmin } from '@/lib/supabase-admin';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// ── In-memory rate limiter (per user) ──
const userRateLimits = new Map<string, { minuteCount: number; minuteReset: number; dayCount: number; dayReset: number }>();

function checkUserRateLimit(userId: string): { allowed: boolean; reason?: string } {
    const now = Date.now();
    const MINUTE = 60 * 1000;
    const DAY = 24 * 60 * 60 * 1000;

    let record = userRateLimits.get(userId);
    if (!record) {
        record = { minuteCount: 0, minuteReset: now + MINUTE, dayCount: 0, dayReset: now + DAY };
        userRateLimits.set(userId, record);
    }

    // Reset windows if expired
    if (now > record.minuteReset) { record.minuteCount = 0; record.minuteReset = now + MINUTE; }
    if (now > record.dayReset) { record.dayCount = 0; record.dayReset = now + DAY; }

    if (record.minuteCount >= 5) return { allowed: false, reason: 'Rate limit: 5 messages per minute. Please wait.' };
    if (record.dayCount >= 30) return { allowed: false, reason: 'Daily limit reached: 30 messages per day.' };

    record.minuteCount++;
    record.dayCount++;
    return { allowed: true };
}

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const auth = await getAuthenticatedUser();
        if (!auth) return unauthorizedResponse();

        // ── Rate limiting ──
        const rateCheck = checkUserRateLimit(auth.user.id);
        if (!rateCheck.allowed) {
            return NextResponse.json({ error: rateCheck.reason }, { status: 429 });
        }

        const { jobId, message, applicants, history } = await req.json();

        if (!message || !applicants) {
            return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
        }

        // Security: Verify the user owns the jobId context
        if (jobId) {
            const { data: job } = await supabaseAdmin
                .from('jobs')
                .select('id')
                .eq('id', jobId)
                .eq('user_id', auth.user.id)
                .single();

            if (!job) {
                return NextResponse.json({ error: 'Access denied to this job context.' }, { status: 403 });
            }
        }

        // Build candidate list with stable IDs for linking
        const candidateList = applicants.map((a: any, i: number) => ({
            id: a.id || `idx-${i}`,
            ref: `RF-${String(a.name || '').substring(0, 3).toUpperCase()}${i}`,
            name: a.name || 'Unknown',
            score: a.score || 0,
            summary: a.summary || 'N/A',
        }));

        const systemInstruction = `
You are "Recruit Flow Intelligence", an elite Executive Recruitment AI assistant.
Job ID Context: ${jobId || 'Unknown'}

CANDIDATE POOL:
${candidateList.map(c => `
[CANDIDATE ref="${c.ref}" id="${c.id}"]
Name: ${c.name}
Match Fidelity: ${c.score}/100
Summary: ${c.summary}
[/CANDIDATE]`).join('\n')}

STRICT DIRECTIVES:
1. SCOPE: Only answer questions about the candidate pool and recruitment for this job. Refuse all other topics.
2. When mentioning a candidate, ALWAYS use this exact format: [CANDIDATE_LINK ref="RF-XXX" name="Full Name"]
   Example: [CANDIDATE_LINK ref="RF-UJJ0" name="Ujjwal Rupakheti"]
3. Never use markdown bold (**text**) or asterisks. Use plain text only.
4. Be concise, analytical, and data-driven. No pleasantries.
5. Always compare top 2-3 candidates unless asked for one.
6. Refer to scores as "Match Fidelity".
`;

        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction,
            generationConfig: { temperature: 0.2 }
        });

        let validHistory = (history || [])
            .filter((h: any) => h.role !== 'system_init')
            .map((h: any) => ({
                role: h.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: String(h.content) }],
            }));

        if (validHistory.length > 0 && validHistory[0].role === 'model') {
            validHistory.shift();
        }

        const chat = model.startChat({ history: validHistory });
        const result = await chat.sendMessage(message);
        const reply = result.response.text();

        return NextResponse.json({
            reply: reply.trim(),
            candidates: candidateList, // send back for frontend link resolution
        });
    } catch (error: any) {
        console.error('Intelligence Engine Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
