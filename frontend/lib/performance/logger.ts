export interface PerfMetric {
  route: string;
  authMs: number;
  dbMs: number;
  renderMs: number;
  totalMs: number;
  queryCount?: number;
}

export async function measurePerformance<T>(
  label: string,
  fn: () => Promise<T>
): Promise<{ result: T; durationMs: number }> {
  const start = performance.now();
  const result = await fn();
  const durationMs = Math.round(performance.now() - start);

  if (process.env.NODE_ENV === "development") {
    console.log(`[PERF] ${label} completed in ${durationMs}ms`);
  }

  return { result, durationMs };
}

export function logPerfSummary(metric: PerfMetric): void {
  if (process.env.NODE_ENV === "development") {
    console.log(
      `[PERF LOG] Route: ${metric.route} | Auth: ${metric.authMs}ms | DB: ${metric.dbMs}ms | Render: ${metric.renderMs}ms | Total: ${metric.totalMs}ms | Queries: ${metric.queryCount ?? "N/A"}`
    );
  }
}
