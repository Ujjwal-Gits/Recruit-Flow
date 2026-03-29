import { supabaseAdmin } from './supabase-admin';

// =====================================================
// RATE LIMITER — Server-side IP-based rate limiting
// =====================================================

interface RateLimitConfig {
    maxRequests: number;       // Max requests allowed in the window
    windowSeconds: number;     // Time window in seconds
}

const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
    'auth/login': { maxRequests: 5, windowSeconds: 300 },   // 5 attempts per 5 min
    'auth/register': { maxRequests: 3, windowSeconds: 600 },   // 3 attempts per 10 min
    'auth/verify-otp': { maxRequests: 5, windowSeconds: 300 },   // 5 attempts per 5 min (Strict)
    'api/profile': { maxRequests: 5, windowSeconds: 300 },     // 5 profile updates per 5 min (Strict)
    'auth/forgot': { maxRequests: 2, windowSeconds: 600 },   // 2 per 10 min
    'auth/reset': { maxRequests: 2, windowSeconds: 600 },    // 2 per 10 min
    'auth/resend-otp': { maxRequests: 2, windowSeconds: 300 },   // 2 per 5 min
    'api/process-application': { maxRequests: 5, windowSeconds: 3600 }, // 5 apps per hour per IP
    'api/chat-recruiter': { maxRequests: 30, windowSeconds: 3600 },  // 30 AI chats per hour per IP
    'default': { maxRequests: 30, windowSeconds: 60 },    // General fallback
};

const rateLimitCache = new Map<string, { count: number; resetTime: number }>();

export async function checkRateLimit(
    ip: string,
    endpoint: string
): Promise<{ allowed: boolean; retryAfter?: number }> {
    const config = RATE_LIMIT_CONFIGS[endpoint] || RATE_LIMIT_CONFIGS['default'];
    const key = `${ip}:${endpoint}`;
    const now = Date.now();
    
    let record = rateLimitCache.get(key);
    
    // Cleanup old keys occasionally to prevent memory leaks if many unique IPs
    if (Math.random() < 0.01) {
        for (const [k, v] of rateLimitCache.entries()) {
            if (now > v.resetTime) rateLimitCache.delete(k);
        }
    }
    
    if (!record || now > record.resetTime) {
        rateLimitCache.set(key, { count: 1, resetTime: now + config.windowSeconds * 1000 });
        return { allowed: true };
    }
    
    if (record.count >= config.maxRequests) {
        return { allowed: false, retryAfter: Math.ceil((record.resetTime - now) / 1000) };
    }
    
    record.count += 1;
    return { allowed: true };
}

// =====================================================
// OTP GENERATOR — Cryptographically random 5-digit PIN
// =====================================================

export function generateOTP(): string {
    // Use crypto for secure random number generation
    const array = new Uint32Array(1);
    require('crypto').getRandomValues(array);
    const pin = (array[0] % 900000) + 100000; // Ensures 6 digits (100000-999999)
    return pin.toString();
}

// =====================================================
// INPUT SANITIZATION — Prevent injection attacks
// =====================================================

export function sanitizeEmail(email: string): string {
    return email.trim().toLowerCase().slice(0, 255);
}

export function validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email) && email.length <= 255;
}

export function validatePassword(password: string): { valid: boolean; message: string } {
    if (password.length < 8) return { valid: false, message: 'Password must be at least 8 characters.' };
    if (password.length > 72) return { valid: false, message: 'Password must not exceed 72 characters.' };
    return { valid: true, message: '' };
}

export function validateName(name: string): boolean {
    return name.trim().length >= 2 && name.trim().length <= 100;
}

// =====================================================
// IP EXTRACTION — Get client IP from request headers
// =====================================================

export function getClientIP(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) return forwarded.split(',')[0].trim();
    const realIP = request.headers.get('x-real-ip');
    if (realIP) return realIP;
    return '127.0.0.1';
}

// =====================================================
// SECURITY HEADERS — Standard security response headers
// =====================================================

export function securityHeaders(): Record<string, string> {
    return {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
    };
}
