import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
});

// Cache keys
export const CACHE_KEYS = {
  USER_PROFILE: (userId: string) => `user:profile:${userId}`,
  USER_STATS: (userId: string) => `user:stats:${userId}`,
  TRENDING_TOPICS: 'trending:topics',
  FEED_POSTS: (userId: string, page: number) => `feed:${userId}:${page}`,
  NOTIFICATIONS: (userId: string) => `notifications:${userId}`,
  WEEKLY_STREAK: (userId: string) => `streak:weekly:${userId}`,
  RANKING: (type: string) => `ranking:${type}`,
  SEARCH_RESULTS: (query: string, filters: string) => `search:${query}:${filters}`,
} as const;

// Cache TTL (Time To Live) in seconds
export const CACHE_TTL = {
  USER_PROFILE: 300, // 5 minutes
  USER_STATS: 600, // 10 minutes
  TRENDING_TOPICS: 1800, // 30 minutes
  FEED_POSTS: 180, // 3 minutes
  NOTIFICATIONS: 60, // 1 minute
  WEEKLY_STREAK: 3600, // 1 hour
  RANKING: 1800, // 30 minutes
  SEARCH_RESULTS: 900, // 15 minutes
} as const;

// Rate limiting keys
export const RATE_LIMIT_KEYS = {
  API_GENERAL: (ip: string) => `rate_limit:api:${ip}`,
  LOGIN_ATTEMPTS: (ip: string) => `rate_limit:login:${ip}`,
  POST_CREATION: (userId: string) => `rate_limit:post:${userId}`,
  COMMENT_CREATION: (userId: string) => `rate_limit:comment:${userId}`,
  UPLOAD_FILES: (userId: string) => `rate_limit:upload:${userId}`,
  SEARCH_QUERIES: (userId: string) => `rate_limit:search:${userId}`,
} as const;

// Rate limiting configurations
export const RATE_LIMITS = {
  API_GENERAL: { requests: 100, window: 60 }, // 100 requests per minute
  LOGIN_ATTEMPTS: { requests: 5, window: 300 }, // 5 attempts per 5 minutes
  POST_CREATION: { requests: 10, window: 3600 }, // 10 posts per hour
  COMMENT_CREATION: { requests: 50, window: 3600 }, // 50 comments per hour
  UPLOAD_FILES: { requests: 20, window: 3600 }, // 20 uploads per hour
  SEARCH_QUERIES: { requests: 100, window: 3600 }, // 100 searches per hour
} as const;

// Redis utility functions
export class RedisService {
  static async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  }

  static async set(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await redis.setex(key, ttl, serialized);
      } else {
        await redis.set(key, serialized);
      }
      return true;
    } catch (error) {
      console.error('Redis SET error:', error);
      return false;
    }
  }

  static async del(key: string): Promise<boolean> {
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      console.error('Redis DEL error:', error);
      return false;
    }
  }

  static async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis EXISTS error:', error);
      return false;
    }
  }

  // Rate limiting
  static async checkRateLimit(key: string, limit: number, window: number): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    try {
      const current = await redis.incr(key);
      
      if (current === 1) {
        await redis.expire(key, window);
      }
      
      const ttl = await redis.ttl(key);
      const resetTime = Date.now() + (ttl * 1000);
      
      return {
        allowed: current <= limit,
        remaining: Math.max(0, limit - current),
        resetTime
      };
    } catch (error) {
      console.error('Redis rate limit error:', error);
      return { allowed: true, remaining: limit, resetTime: Date.now() + (window * 1000) };
    }
  }

  // Pub/Sub for real-time features
  static async publish(channel: string, message: any): Promise<boolean> {
    try {
      await redis.publish(channel, JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Redis PUBLISH error:', error);
      return false;
    }
  }

  static subscribe(channel: string, callback: (message: any) => void): void {
    const subscriber = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
    });

    subscriber.subscribe(channel);
    subscriber.on('message', (receivedChannel, message) => {
      if (receivedChannel === channel) {
        try {
          const parsedMessage = JSON.parse(message);
          callback(parsedMessage);
        } catch (error) {
          console.error('Redis message parsing error:', error);
        }
      }
    });
  }

  // Sorted sets for rankings
  static async addToRanking(key: string, member: string, score: number): Promise<boolean> {
    try {
      await redis.zadd(key, score, member);
      return true;
    } catch (error) {
      console.error('Redis ZADD error:', error);
      return false;
    }
  }

  static async getRanking(key: string, start: number = 0, end: number = -1, withScores: boolean = true): Promise<any[]> {
    try {
      if (withScores) {
        return await redis.zrevrange(key, start, end, 'WITHSCORES');
      } else {
        return await redis.zrevrange(key, start, end);
      }
    } catch (error) {
      console.error('Redis ZREVRANGE error:', error);
      return [];
    }
  }

  static async getUserRank(key: string, member: string): Promise<number | null> {
    try {
      const rank = await redis.zrevrank(key, member);
      return rank !== null ? rank + 1 : null; // Convert to 1-based ranking
    } catch (error) {
      console.error('Redis ZREVRANK error:', error);
      return null;
    }
  }
}

// Real-time channels
export const CHANNELS = {
  NOTIFICATIONS: (userId: string) => `notifications:${userId}`,
  FEED_UPDATES: (userId: string) => `feed:${userId}`,
  CHAT_MESSAGES: (chatId: string) => `chat:${chatId}`,
  LIVE_EVENTS: 'events:live',
  SYSTEM_ANNOUNCEMENTS: 'system:announcements',
} as const;

export default redis;