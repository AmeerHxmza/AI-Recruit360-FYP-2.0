/**
 * Lightweight performance measurement utility.
 */

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
