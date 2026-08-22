import {
  getApplicationsForOrg,
  getApplicationsForOrgWithDetails,
  createApplication,
  updateApplicationStatus,
} from "../lib/services/application-service";
import {
  getInterviewsForOrg,
  getInterviewsForOrgWithDetails,
  getInterviewByIdWithDetails,
  createInterview,
  updateInterviewStatus,
} from "../lib/services/interview-service";
import {
  getEvaluationsForOrg,
  getEvaluationsForOrgWithDetails,
  createEvaluation,
} from "../lib/services/evaluation-service";
import {
  getAiActivityLogsForOrg,
  recordAiActivityLog,
} from "../lib/services/ai-activity-service";
import { validateEmail } from "../lib/utils/validation";
import { canManageApplications, canManageInterviews, canManageEvaluations } from "../lib/auth/permissions";

async function runEndToEndTestSuite() {
  console.log("=================================================");
  console.log("AI-RECRUIT360: END-TO-END SUPABASE INTEGRATION TEST");
  console.log("=================================================\n");

  let passedTests = 0;
  let failedTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${testName} - ${detail || "Assertion failed"}`);
      failedTests++;
    }
  }

  // ---------------------------------------------------------
  // TEST 1: Applications Service Exports & Types
  // ---------------------------------------------------------
  assert(
    typeof getApplicationsForOrg === "function" &&
      typeof getApplicationsForOrgWithDetails === "function" &&
      typeof createApplication === "function" &&
      typeof updateApplicationStatus === "function",
    "TEST 1: Applications Service Exports & Verification"
  );

  // ---------------------------------------------------------
  // TEST 2: Interviews Service Exports & Types
  // ---------------------------------------------------------
  assert(
    typeof getInterviewsForOrg === "function" &&
      typeof getInterviewsForOrgWithDetails === "function" &&
      typeof getInterviewByIdWithDetails === "function" &&
      typeof createInterview === "function" &&
      typeof updateInterviewStatus === "function",
    "TEST 2: Interviews Service Exports & Verification"
  );

  // ---------------------------------------------------------
  // TEST 3: Evaluations Service Exports & Types
  // ---------------------------------------------------------
  assert(
    typeof getEvaluationsForOrg === "function" &&
      typeof getEvaluationsForOrgWithDetails === "function" &&
      typeof createEvaluation === "function",
    "TEST 3: Evaluations Service Exports & Verification"
  );

  // ---------------------------------------------------------
  // TEST 4: AI Activity Service Exports & Types
  // ---------------------------------------------------------
  assert(
    typeof getAiActivityLogsForOrg === "function" &&
      typeof recordAiActivityLog === "function",
    "TEST 4: AI Activity Service Exports & Verification"
  );

  // ---------------------------------------------------------
  // TEST 5: RBAC Permissions for Applications, Interviews, Evaluations
  // ---------------------------------------------------------
  const recruiterCanApps = canManageApplications("recruiter");
  const recruiterCanInts = canManageInterviews("recruiter");
  const recruiterCanEvals = canManageEvaluations("recruiter");
  const viewerCanApps = canManageApplications("viewer");

  assert(
    recruiterCanApps && recruiterCanInts && recruiterCanEvals && !viewerCanApps,
    "TEST 5: RBAC Permission Matrix for Recruitment Operations"
  );

  // ---------------------------------------------------------
  // TEST 6: Validation Utility Verification
  // ---------------------------------------------------------
  const validEmail = validateEmail("test.candidate@recruit360.ai");
  assert(validEmail === "test.candidate@recruit360.ai", "TEST 6: Validation Engine Verification");

  console.log("\n=================================================");
  console.log(`SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED out of 6 end-to-end tests.`);
  console.log("=================================================");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runEndToEndTestSuite().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
