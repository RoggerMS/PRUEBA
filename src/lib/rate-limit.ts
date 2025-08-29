import { NextRequest, NextResponse } from 'next/server';
import { RedisService, RATE_LIMIT_KEYS, RATE_LIMITS } from './redis';

export interface RateLimitConfig {
  requests: number;
  window: number; // in seconds
  message?: string;
}

export type RateLimitType = keyof typeof RATE_LIMITS;

// Get client IP address
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return request.ip || 'unknown';
}

// Rate limit middleware
export async function rateLimit(
  request: NextRequest,
  type: RateLimitType,
  identifier?: string
): Promise<{ success: boolean; response?: NextResponse }> {
  try {
    const config = RATE_LIMITS[type];
    const ip = getClientIP(request);
    const key = getKeyForType(type, identifier || ip);
    
    const result = await RedisService.checkRateLimit(
      key,
      config.requests,
      config.window
    );
    
    if (!result.allowed) {
      const response = NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `Too many requests. Try again in ${Math.ceil((result.resetTime - Date.now()) / 1000)} seconds.`,
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
        },
        { status: 429 }
      );
      
      // Add rate limit headers
      response.headers.set('X-RateLimit-Limit', config.requests.toString());
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
      response.headers.set('X-RateLimit-Reset', result.resetTime.toString());
      response.headers.set('Retry-After', Math.ceil((result.resetTime - Date.now()) / 1000).toString());
      
      return { success: false, response };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Rate limit error:', error);
    // Allow request if Redis is down
    return { success: true };
  }
}

// Get the appropriate Redis key for the rate limit type
function getKeyForType(type: RateLimitType, identifier: string): string {
  switch (type) {
    case 'API_GENERAL':
      return RATE_LIMIT_KEYS.API_GENERAL(identifier);
    case 'LOGIN_ATTEMPTS':
      return RATE_LIMIT_KEYS.LOGIN_ATTEMPTS(identifier);
    case 'POST_CREATION':
      return RATE_LIMIT_KEYS.POST_CREATION(identifier);
    case 'COMMENT_CREATION':
      return RATE_LIMIT_KEYS.COMMENT_CREATION(identifier);
    case 'UPLOAD_FILES':
      return RATE_LIMIT_KEYS.UPLOAD_FILES(identifier);
    case 'SEARCH_QUERIES':
      return RATE_LIMIT_KEYS.SEARCH_QUERIES(identifier);
    default:
      return RATE_LIMIT_KEYS.API_GENERAL(identifier);
  }
}

// Higher-order function to wrap API routes with rate limiting
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  type: RateLimitType,
  getIdentifier?: (request: NextRequest) => string
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const identifier = getIdentifier ? getIdentifier(request) : undefined;
    const rateLimitResult = await rateLimit(request, type, identifier);
    
    if (!rateLimitResult.success && rateLimitResult.response) {
      return rateLimitResult.response;
    }
    
    return handler(request);
  };
}

// Specific rate limit functions for common use cases
export const rateLimitAPI = (request: NextRequest) => 
  rateLimit(request, 'API_GENERAL');

export const rateLimitLogin = (request: NextRequest) => 
  rateLimit(request, 'LOGIN_ATTEMPTS');

export const rateLimitPost = (request: NextRequest, userId: string) => 
  rateLimit(request, 'POST_CREATION', userId);

export const rateLimitComment = (request: NextRequest, userId: string) => 
  rateLimit(request, 'COMMENT_CREATION', userId);

export const rateLimitUpload = (request: NextRequest, userId: string) => 
  rateLimit(request, 'UPLOAD_FILES', userId);

export const rateLimitSearch = (request: NextRequest, userId: string) => 
  rateLimit(request, 'SEARCH_QUERIES', userId);