import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { getAuthenticatedUser, unauthorizedResponse } from '@/lib/auth-guard';

export async function POST(req: Request) {
    try {
        const auth = await getAuthenticatedUser();
        if (!auth) return unauthorizedResponse();

        const { emails, subject, bodies } = await req.json();

        if (!emails || !Array.isArray(emails) || emails.length === 0) {
            return NextResponse.json({ error: 'No recipients provided' }, { status: 400 });
        }

        const results = [];
        for (let i = 0; i < emails.length; i++) {
            const email = emails[i];
            const html = bodies[i].replace(/\n/g, '<br/>');
            
            const success = await sendEmail({
                to: email,
                subject: subject,
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                        ${html}
                    </div>
                `
            });
            results.push({ email, success });
        }

        return NextResponse.json({ success: true, results });
    } catch (error: any) {
        console.error('[BULK MAIL API ERROR]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
