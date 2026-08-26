import { AsyncLocalStorage } from "node:async_hooks";

export interface PerfMetric {
  route: string;
  authMs: number;
  orgMs: number;
  dbMs: number;
  redisMs: number;
  aiMs: number;
  externalApiMs: number;
  serializationMs: number;
  renderMs: number;
  totalMs: number;
  queryCount: number;
  waterfalls: number;
}

export const perfStorage = new AsyncLocalStorage<PerfMetric>();

export async function measurePerformance<T>(
  label: string,
  fn: () => Promise<T>,
  category: "auth" | "org" | "db" | "redis" | "ai" | "api" | "serialization" | "render" | "total" = "db"
): Promise<{ result: T; durationMs: number }> {
  const start = performance.now();
  const result = await fn();
  const durationMs = Math.round(performance.now() - start);

  const store = perfStorage.getStore();
  if (store) {
    if (category === "auth") store.authMs += durationMs;
    else if (category === "org") store.orgMs += durationMs;
    else if (category === "db") {
      store.dbMs += durationMs;
      store.queryCount += 1;
    }
    else if (category === "redis") store.redisMs += durationMs;
    else if (category === "ai") store.aiMs += durationMs;
    else if (category === "api") store.externalApiMs += durationMs;
    else if (category === "serialization") store.serializationMs += durationMs;
    else if (category === "render") store.renderMs += durationMs;
    else if (category === "total") store.totalMs = durationMs;
  }

  if (process.env.NODE_ENV === "development" && !store) {
    console.log(`[PERF] ${label} completed in ${durationMs}ms`);
  } else if (process.env.NODE_ENV === "development") {
     console.log(`[PERF TRACE] ${store?.route || 'Unknown Route'} -> ${label}: ${durationMs}ms`);
  }

  return { result, durationMs };
}

export function logPerfSummary(metric: PerfMetric): void {
  // Only log if we have actual activity or it's a dev route
  if (process.env.NODE_ENV === "development") {
    console.log(`\n------------------------------------`);
    console.log(`PERFORMANCE BOTTLENECK REPORT`);
    console.log(`------------------------------------`);
    console.log(`Route: ${metric.route}`);
    console.log(`total: ${metric.totalMs}ms\n`);
    console.log(`auth: ${metric.authMs}ms`);
    console.log(`organization: ${metric.orgMs}ms`);
    console.log(`database: ${metric.dbMs}ms (${metric.queryCount} queries)`);
    console.log(`redis: ${metric.redisMs}ms`);
    console.log(`external api: ${metric.externalApiMs}ms`);
    console.log(`ai: ${metric.aiMs}ms`);
    console.log(`serialization: ${metric.serializationMs}ms`);
    console.log(`------------------------------------\n`);
  }
}

export async function withPerfProfile<T>(route: string, fn: () => Promise<T>): Promise<T> {
  const store: PerfMetric = {
    route,
    authMs: 0,
    orgMs: 0,
    dbMs: 0,
    redisMs: 0,
    aiMs: 0,
    externalApiMs: 0,
    serializationMs: 0,
    renderMs: 0,
    totalMs: 0,
    queryCount: 0,
    waterfalls: 0
  };

  return perfStorage.run(store, async () => {
    const start = performance.now();
    try {
      const result = await fn();
      store.totalMs = Math.round(performance.now() - start);
      logPerfSummary(store);
      return result;
    } catch (err) {
      store.totalMs = Math.round(performance.now() - start);
      console.error(`[PERF ERROR] ${route} failed after ${store.totalMs}ms`, err);
      throw err;
    }
  });
}
