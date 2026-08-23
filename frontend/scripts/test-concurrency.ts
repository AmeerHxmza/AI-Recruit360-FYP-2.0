import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hkybdnbrrdjkrotwftrn.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runConcurrencyTest() {
  console.log("=================================================");
  console.log("AI-Recruit360 — High-Concurrency & Latency Load Test");
  console.log("=================================================");

  try {
    // 1. Fetch any active job position
    const { data: jobs, error } = await supabase
      .from("jobs")
      .select("id, organization_id, title")
      .limit(1);

    if (error || !jobs || jobs.length === 0) {
      console.error("No active job position found for concurrency test:", error?.message);
      process.exit(1);
    }

    const job = jobs[0];

    console.log(`Target Position: ${job.title} (${job.id})`);
    console.log("Launching 10 Concurrent Candidate Applications...");

    const startTime = Date.now();
    const concurrentRequests = 10;
    const promises = [];

    for (let i = 1; i <= concurrentRequests; i++) {
      const email = `loadtest_cand_${Date.now()}_${i}_${Math.random().toString(36).substring(7)}@example.com`;
      const phone = `+92 300 ${Math.floor(1000000 + Math.random() * 9000000)}`;

      const startSingle = Date.now();
      const p = (async () => {
        // Create candidate
        const { data: cand, error: cErr } = await supabase
          .from("candidates")
          .insert({
            organization_id: job.organization_id,
            full_name: `Concurrent Candidate ${i}`,
            email,
            phone,
            location: "Islamabad, Pakistan"
          })
          .select("id")
          .single();

        if (cErr || !cand) throw new Error(cErr?.message || "Candidate creation failed");

        // Create application
        const { data: app, error: aErr } = await supabase
          .from("applications")
          .insert({
            organization_id: job.organization_id,
            job_id: job.id,
            candidate_id: cand.id,
            status: "applied"
          })
          .select("id")
          .single();

        if (aErr || !app) throw new Error(aErr?.message || "Application creation failed");
        return app.id;
      })().then((app_id) => {
        const duration = Date.now() - startSingle;
        return { success: true, duration, app_id };
      }).catch((err) => {
        const duration = Date.now() - startSingle;
        return { success: false, duration, error: err.message };
      });

      promises.push(p);
    }

    const results = await Promise.all(promises);
    const totalDuration = Date.now() - startTime;

    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);
    const durations = results.map((r) => r.duration).sort((a, b) => a - b);

    const p50 = durations[Math.floor(durations.length * 0.5)];
    const p95 = durations[Math.floor(durations.length * 0.95)];
    const p99 = durations[durations.length - 1];

    console.log("\n---------------- TEST RESULTS ----------------");
    console.log(`Total Concurrent Requests: ${concurrentRequests}`);
    console.log(`Successful Applications:   ${successful.length}`);
    console.log(`Failed / Blocked:          ${failed.length}`);
    console.log(`Total Wall-Clock Time:     ${totalDuration} ms`);
    console.log(`P50 Latency:               ${p50} ms`);
    console.log(`P95 Latency:               ${p95} ms`);
    console.log(`P99 Latency:               ${p99} ms`);
    console.log("=================================================");

  } catch (err) {
    console.error("Concurrency test error:", err);
  }
}

runConcurrencyTest();
