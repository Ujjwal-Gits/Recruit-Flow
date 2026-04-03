import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(req: Request) {
    try {
        const { name, email, subject, message } = await req.json();

        if (!name?.trim() || !email?.trim() || !message?.trim()) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const subjectLabels: Record<string, string> = {
            general: 'General Inquiry',
            sales: 'Sales & Pricing',
            support: 'Technical Support',
            partnership: 'Partnership',
            feedback: 'Feedback',
        };

        const subjectLabel = subjectLabels[subject] || 'Contact Form';

        await sendEmail({
            to: 'ujr.work@gmail.com',
            subject: `[RecruitFlow Contact] ${subjectLabel} — ${name}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <h2 style="color: #0f172a; margin-bottom: 4px;">New Contact Form Submission</h2>
                    <p style="color: #64748b; font-size: 13px; margin-bottom: 24px;">${subjectLabel}</p>

                    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                        <tr>
                            <td style="padding: 8px 0; color: #64748b; font-weight: 600; width: 100px;">Name</td>
                            <td style="padding: 8px 0; color: #0f172a;">${name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Email</td>
                            <td style="padding: 8px 0; color: #0f172a;"><a href="mailto:${email}" style="color: #0f172a;">${email}</a></td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Subject</td>
                            <td style="padding: 8px 0; color: #0f172a;">${subjectLabel}</td>
                        </tr>
                    </table>

                    <div style="margin-top: 20px; padding: 16px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #0f172a;">
                        <p style="color: #64748b; font-size: 12px; font-weight: 600; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em;">Message</p>
                        <p style="color: #0f172a; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
                    </div>

                    <p style="color: #94a3b8; font-size: 11px; margin-top: 24px;">Sent via RecruitFlow Contact Form</p>
                </div>
            `,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[CONTACT FORM ERROR]', error);
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
}
