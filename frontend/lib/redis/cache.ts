import Redis from "ioredis";
import { measurePerformance } from "@/lib/performance/logger";

const getRedisUrl = () => {
  if (process.env.REDIS_URL) return process.env.REDIS_URL;
  return "redis://localhost:6379";
};

const redis = new Redis(getRedisUrl(), {
  maxRetriesPerRequest: 1,
  retryStrategy(times) {
    if (times > 3) return null; // stop retrying
    return Math.min(times * 50, 2000);
  },
});

export async function getCachedData<T>(key: string, fetcher: () => Promise<T>, ttlSeconds: number = 60): Promise<T> {
  const { result } = await measurePerformance(`redis-cache:${key}`, async () => {
    try {
      const cached = await redis.get(key);
      if (cached) {
        const { result: parsed } = await measurePerformance(`redis-parse:${key}`, async () => {
          return JSON.parse(cached) as T;
        }, "serialization");
        return parsed;
      }
    } catch (error) {
      console.warn("Redis get error:", error);
    }

    const data = await fetcher();

    try {
      const { result: serialized } = await measurePerformance(`redis-serialize:${key}`, async () => {
        return JSON.stringify(data);
      }, "serialization");
      await redis.setex(key, ttlSeconds, serialized);
    } catch (error) {
      console.warn("Redis set error:", error);
    }

    return data;
  }, "redis");
  return result;
}

export async function invalidateCachePrefix(prefix: string) {
  try {
    const keys = await redis.keys(`${prefix}*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.warn("Redis invalidate error:", error);
  }
}

export default redis;
