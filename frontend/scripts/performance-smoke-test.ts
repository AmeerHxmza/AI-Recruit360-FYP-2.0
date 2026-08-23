/**
 * AI-Recruit360 Phase 5 Performance Smoke Test Script
 * Measures latency and HTTP response status across core routes & services.
 */

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

interface TestRoute {
  name: string;
  path: string;
  targetMaxMs: number;
}

const routesToTest: TestRoute[] = [
  { name: "1. Homepage", path: "/", targetMaxMs: 500 },
  { name: "2. Login Page", path: "/login", targetMaxMs: 500 },
  { name: "3. Recruiter Dashboard", path: "/dashboard", targetMaxMs: 800 },
  { name: "4. Jobs Directory", path: "/jobs", targetMaxMs: 800 },
  { name: "5. Candidate Directory", path: "/candidates", targetMaxMs: 800 },
  { name: "6. Applications Pipeline", path: "/applications", targetMaxMs: 800 },
  { name: "7. Interviews Workspace", path: "/interviews", targetMaxMs: 800 },
  { name: "8. Evaluations Matrix", path: "/evaluations", targetMaxMs: 800 },
  { name: "9. Public Candidate Job Link", path: "/apply/senior-fullstack-ai-engineer", targetMaxMs: 500 },
  { name: "10. Python AI Service Health", path: "/api/py/health", targetMaxMs: 300 },
];

async function runPerformanceSmokeTest() {
  console.log("============================================================");
  console.log("AI-RECRUIT360 PHASE 5 PERFORMANCE SMOKE TEST");
  console.log(`Target Base URL: ${BASE_URL}`);
  console.log("============================================================\n");

  let passedCount = 0;
  let totalDuration = 0;

  for (const route of routesToTest) {
    const url = `${BASE_URL}${route.path}`;
    const start = performance.now();

    try {
      const response = await fetch(url, { method: "GET" });
      const durationMs = Math.round(performance.now() - start);
      totalDuration += durationMs;

      const isStatusOk = response.status >= 200 && response.status < 400;
      const isFastEnough = durationMs <= route.targetMaxMs;

      if (isStatusOk && isFastEnough) {
        passedCount++;
        console.log(`[PASS] ${route.name.padEnd(30)} | Latency: ${String(durationMs).padStart(4)}ms | Status: ${response.status}`);
      } else if (isStatusOk) {
        passedCount++;
        console.log(`[WARN] ${route.name.padEnd(30)} | Latency: ${String(durationMs).padStart(4)}ms (Target: <${route.targetMaxMs}ms) | Status: ${response.status}`);
      } else {
        console.log(`[FAIL] ${route.name.padEnd(30)} | Latency: ${String(durationMs).padStart(4)}ms | Status: ${response.status}`);
      }
    } catch (err: unknown) {
      const durationMs = Math.round(performance.now() - start);
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`[ERROR] ${route.name.padEnd(29)} | Latency: ${String(durationMs).padStart(4)}ms | Exception: ${msg}`);
    }
  }

  console.log("\n============================================================");
  console.log(`SUMMARY: ${passedCount}/${routesToTest.length} Routes Checked Successfully`);
  console.log(`Average Latency: ${Math.round(totalDuration / routesToTest.length)}ms`);
  console.log("============================================================");
}

runPerformanceSmokeTest();
