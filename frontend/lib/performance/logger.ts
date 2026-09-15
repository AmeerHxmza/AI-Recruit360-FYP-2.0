/**
 * Lightweight performance measurement utility.
 */

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

export async function measurePerformance<T>(
  label: string,
  fn: () => Promise<T>,
  _category: string = "db",
): Promise<{ result: T; durationMs: number }> {
  void label;
  void _category;
  const start = performance.now();
  const result = await fn();
  const durationMs = Math.round(performance.now() - start);
  return { result, durationMs };
}

export async function withPerfProfile<T>(
  _route: string,
  fn: () => Promise<T>,
): Promise<T> {
  return await fn();
}

export function logPerfSummary(_metric: PerfMetric): void {
  void _metric;
}
