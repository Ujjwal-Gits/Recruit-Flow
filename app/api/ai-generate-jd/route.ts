import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser, unauthorizedResponse, forbiddenResponse, serverErrorResponse } from '@/lib/auth-guard';

export const dynamic = 'force-dynamic';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
    try {
        const auth = await getAuthenticatedUser();
        if (!auth) return unauthorizedResponse();

        if (auth.tier !== 'pro' && auth.tier !== 'enterprise') {
            return forbiddenResponse('Pro or Enterprise subscription required.');
        }

        const { title, company_name, workMode, jobType, education, experience } = await req.json();

        if (!title?.trim()) {
            return NextResponse.json({ error: 'Job title is required' }, { status: 400 });
        }

        const experienceText = experience?.length ? experience.join(' or ') : 'open to all levels';

        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            generationConfig: { temperature: 0.75 }
        });

        const prompt = `Write a complete, professional job description for the role below. It should look like a real LinkedIn job post — detailed, well-structured, human-written. Not too corporate, not too casual.

Role: ${title}
Company: ${company_name || 'our company'}
Job Type: ${jobType || 'Full-time'}
Work Mode: ${workMode || 'Remote'}
Min. Education: ${education || 'Bachelor'}
Experience Required: ${experienceText} — STRICTLY use only this experience level. Do not mention more years.

Format the output EXACTLY like this. Use plain text section headers (no asterisks, no markdown):

About the Role
[2-3 sentences describing what this role is and why it matters]

What You'll Do
• [responsibility 1]
• [responsibility 2]
• [responsibility 3]
• [responsibility 4]
• [responsibility 5]

What We're Looking For
• [requirement 1 — must match experience: ${experienceText}]
• [requirement 2]
• [requirement 3]
• [requirement 4]

Nice to Have
• [bonus skill 1]
• [bonus skill 2]
• [bonus skill 3]

What We Offer
• [benefit 1]
• [benefit 2]
• [benefit 3]

IMPORTANT: Do NOT use any asterisks or markdown formatting. Section headers should be plain text on their own line. Write naturally, like a real hiring manager. No buzzwords.`;

        const result = await model.generateContent(prompt);
        const description = result.response.text().trim();

        return NextResponse.json({ description });
    } catch (error: any) {
        console.error('AI JD generation error:', error);
        return serverErrorResponse();
    }
}
