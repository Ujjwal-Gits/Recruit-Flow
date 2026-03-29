import { Resend } from 'resend';
import nodemailer from 'nodemailer';

// --- Strategy Selection ---
const EMAIL_STRATEGY = process.env.EMAIL_STRATEGY || (process.env.RESEND_API_KEY ? 'resend' : 'smtp');

// --- Resend Initialization ---
const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

// --- SMTP/Gmail Initialization ---
const transporter = process.env.SMTP_HOST && process.env.SMTP_USER 
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS, // For Gmail, use an "App Password"
        },
    })
    : null;

const FROM_EMAIL = process.env.EMAIL_FROM || 'RecruitFlow <onboarding@resend.dev>';

interface SendOTPOptions {
    to: string;
    code: string;
    purpose: 'registration' | 'password-reset' | 'profile-verification';
}

/**
 * Sends an OTP code to the user's email.
 * Supports Resend, SMTP (Gmail), and Console logging.
 */
export async function sendOTPEmail({ to, code, purpose }: SendOTPOptions): Promise<boolean> {
    const subjects: Record<string, string> = {
        'registration': 'Your RecruitFlow Verification Code',
        'password-reset': 'RecruitFlow Password Reset Code',
        'profile-verification': 'RecruitFlow Profile Verification Code',
    };

    const getHtml = (p: string, c: string) => {
        const title = subjects[p];
        const subtext = p === 'registration' ? 'Intelligent Recruitment Platform' : p === 'password-reset' ? 'Password Reset Request' : 'Profile Update Verification';
        const instruction = p === 'registration' ? 'Your verification code is:' : p === 'password-reset' ? 'Your password reset code is:' : 'Your verification code is:';
        const expiry = p === 'profile-verification' ? '10 minutes' : '2 minutes';

        return `
            <div style="font-family: 'Inter', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #ffffff; border: 1px solid #f1f5f9; border-radius: 16px;">
                <div style="text-align: center; margin-bottom: 32px;">
                    <h1 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0;">RecruitFlow</h1>
                    <p style="font-size: 13px; color: #64748b; margin-top: 4px;">${subtext}</p>
                </div>
                <div style="background: #f8fafc; border-radius: 12px; padding: 32px; text-align: center; border: 1px solid #e2e8f0;">
                    <p style="font-size: 14px; color: #475569; margin: 0 0 20px 0;">${instruction}</p>
                    <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0f172a; font-family: monospace; padding: 16px; background: #ffffff; border-radius: 8px; border: 2px dashed #cbd5e1;">
                        ${c}
                    </div>
                    <p style="font-size: 12px; color: #94a3b8; margin-top: 20px;">This code expires in <strong>${expiry}</strong>. Do not share it with anyone.</p>
                </div>
                <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 24px;">If you did not request this code, you can safely ignore this email.</p>
            </div>
        `;
    };

    const htmlContent = getHtml(purpose, code);
    const subjectContent = subjects[purpose];

    // Always log to server console for development
    console.log(`\n[OTP-SERVER] Delivering via ${EMAIL_STRATEGY.toUpperCase()} to ${to}: ${code} (${purpose})\n`);

    // --- Strategy: Resend ---
    if (EMAIL_STRATEGY === 'resend' && resend) {
        try {
            const { error } = await resend.emails.send({
                from: FROM_EMAIL,
                to: [to],
                subject: subjectContent,
                html: htmlContent,
            });
            if (error) { console.error('[RESEND ERROR]', error); return false; }
            return true;
        } catch (err) { console.error('[RESEND FATAL]', err); return false; }
    }

    // --- Strategy: SMTP (Gmail/Brevo/etc) ---
    if (EMAIL_STRATEGY === 'smtp' && transporter) {
        try {
            await transporter.sendMail({
                from: FROM_EMAIL,
                to: to,
                subject: subjectContent,
                html: htmlContent,
            });
            return true;
        } catch (err) { console.error('[SMTP ERROR]', err); return false; }
    }
    console.warn(`[EMAIL] No active strategy (${EMAIL_STRATEGY}) or missing credentials — OTP pinned to console.`);
    return true;
}

/**
 * Sends a general purpose email.
 */
export async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }): Promise<boolean> {
    console.log(`\n[EMAIL-SERVER] Delivering via ${EMAIL_STRATEGY.toUpperCase()} to ${to}: ${subject}\n`);

    if (EMAIL_STRATEGY === 'resend' && resend) {
        try {
            const { error } = await resend.emails.send({
                from: FROM_EMAIL,
                to: [to],
                subject,
                html,
            });
            if (error) { console.error('[RESEND ERROR]', error); return false; }
            return true;
        } catch (err) { console.error('[RESEND FATAL]', err); return false; }
    }

    if (EMAIL_STRATEGY === 'smtp' && transporter) {
        try {
            await transporter.sendMail({
                from: FROM_EMAIL,
                to,
                subject,
                html,
            });
            return true;
        } catch (err) { console.error('[SMTP ERROR]', err); return false; }
    }

    console.warn(`[EMAIL] No active strategy (${EMAIL_STRATEGY}) — Fallback to console.`);
    return true;
}
