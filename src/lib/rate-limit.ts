import { NextRequest } from 'next/server';

// Simple in-memory rate limiting for development
// In production, you should use Redis or a proper rate limiting service

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

function getRateLimitKey(request: NextRequest, userId: string, action: string): string {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  return `${action}:${userId}:${ip}`;
}

function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    // First request or window expired
    const resetTime = now + windowMs;
    rateLimitStore.set(key, { count: 1, resetTime });
    return {
      success: true,
      remaining: maxRequests - 1,
      resetTime
    };
  }

  if (entry.count >= maxRequests) {
    // Rate limit exceeded
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime
    };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(key, entry);

  return {
    success: true,
    remaining: maxRequests - entry.count,
    resetTime: entry.resetTime
  };
}

// Rate limit for creating posts: 10 posts per hour
export function rateLimitPost(request: NextRequest, userId: string) {
  const key = getRateLimitKey(request, userId, 'post');
  return checkRateLimit(key, 10, 60 * 60 * 1000); // 10 requests per hour
}

// Rate limit for reactions: 100 reactions per hour
export function rateLimitReaction(request: NextRequest, userId: string) {
  const key = getRateLimitKey(request, userId, 'reaction');
  return checkRateLimit(key, 100, 60 * 60 * 1000); // 100 requests per hour
}

// Rate limit for comments: 50 comments per hour
export function rateLimitComment(request: NextRequest, userId: string) {
  const key = getRateLimitKey(request, userId, 'comment');
  return checkRateLimit(key, 50, 60 * 60 * 1000); // 50 requests per hour
}

// Rate limit for saves: 200 saves per hour
export function rateLimitSave(request: NextRequest, userId: string) {
  const key = getRateLimitKey(request, userId, 'save');
  return checkRateLimit(key, 200, 60 * 60 * 1000); // 200 requests per hour
}

// Rate limit for settings updates: 20 updates per hour
export function rateLimitSettings(request: NextRequest, userId: string) {
  const key = getRateLimitKey(request, userId, 'settings');
  return checkRateLimit(key, 20, 60 * 60 * 1000); // 20 requests per hour
}

// Rate limit for authentication endpoints by IP
function getAuthRateLimitKey(request: NextRequest, action: string): string {
  const ip = request.ip || request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  return `auth:${action}:${ip}`;
}

// Rate limit for login attempts: 5 attempts per 15 minutes
export function rateLimitLogin(request: NextRequest) {
  const key = getAuthRateLimitKey(request, 'login');
  return checkRateLimit(key, 5, 15 * 60 * 1000); // 5 requests per 15 minutes
}

// Rate limit for registration: 3 attempts per 15 minutes
export function rateLimitRegister(request: NextRequest) {
  const key = getAuthRateLimitKey(request, 'register');
  return checkRateLimit(key, 3, 15 * 60 * 1000); // 3 requests per 15 minutes
}

// Rate limit for forgot password: 3 attempts per 15 minutes
export function rateLimitForgotPassword(request: NextRequest) {
  const key = getAuthRateLimitKey(request, 'forgot-password');
  return checkRateLimit(key, 3, 15 * 60 * 1000); // 3 requests per 15 minutes
}

// Rate limit for reset password: 5 attempts per 15 minutes
export function rateLimitResetPassword(request: NextRequest) {
  const key = getAuthRateLimitKey(request, 'reset-password');
  return checkRateLimit(key, 5, 15 * 60 * 1000); // 5 requests per 15 minutes
}