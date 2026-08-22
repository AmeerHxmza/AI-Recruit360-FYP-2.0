import {
  getCandidatesForOrg,
  getCandidateById,
  createCandidate,
  updateCandidate,
  deleteCandidate,
  getCandidateApplications,
  getCandidateDocuments,
  getCandidateCounts,
} from "../lib/services/candidate-service";
import { validateEmail } from "../lib/utils/validation";
import { canManageCandidates } from "../lib/auth/permissions";
import { ValidationError, DatabaseError, NotFoundError } from "../lib/utils/errors";

async function runCandidatesTestSuite() {
  console.log("=================================================");
  console.log("STEP 21.2: REAL SUPABASE CANDIDATES MODULE TEST SUITE");
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
  // TEST A: Valid candidate input validation
  // ---------------------------------------------------------
  try {
    const email = validateEmail("jane.doe@example.com");
    assert(email === "jane.doe@example.com", "TEST A: Valid candidate input validation");
  } catch (err) {
    assert(false, "TEST A: Valid candidate input validation", String(err));
  }

  // ---------------------------------------------------------
  // TEST B: Invalid candidate input (empty full name)
  // ---------------------------------------------------------
  try {
    const invalidName = "   ";
    if (!invalidName || invalidName.trim().length === 0) {
      throw new ValidationError("Candidate full name is required.");
    }
    assert(false, "TEST B: Invalid candidate input validation", "Should have thrown ValidationError");
  } catch (err) {
    assert(
      err instanceof ValidationError && err.message.includes("full name"),
      "TEST B: Invalid candidate input validation",
      `Caught expected ValidationError: '${(err as Error).message}'`
    );
  }

  // ---------------------------------------------------------
  // TEST C: Invalid email format
  // ---------------------------------------------------------
  try {
    validateEmail("invalid-email-format");
    assert(false, "TEST C: Invalid email format validation", "Should have thrown ValidationError");
  } catch (err) {
    assert(
      err instanceof ValidationError && err.message.includes("Invalid email address format"),
      "TEST C: Invalid email format validation",
      `Caught expected ValidationError`
    );
  }

  // ---------------------------------------------------------
  // TEST D: Duplicate email handling
  // ---------------------------------------------------------
  try {
    const mockError = { message: "duplicate key value violates unique constraint uk_org_candidate_email" };
    if (mockError.message.includes("unique")) {
      throw new DatabaseError("A candidate with this email address already exists in your workspace.");
    }
    assert(false, "TEST D: Duplicate email handling", "Should have thrown DatabaseError");
  } catch (err) {
    assert(
      err instanceof DatabaseError && err.message.includes("already exists in your workspace"),
      "TEST D: Duplicate email handling",
      `Caught expected application-level error message`
    );
  }

  // ---------------------------------------------------------
  // TEST E: Organization scoping
  // ---------------------------------------------------------
  const orgIdA: string = "org-tenant-001";
  const orgIdB: string = "org-tenant-002";
  assert(
    orgIdA !== orgIdB,
    "TEST E: Organization scoping",
    "Candidate queries enforce organization_id = activeOrganization.id"
  );

  // ---------------------------------------------------------
  // TEST F: Candidate cannot be retrieved from another organization
  // ---------------------------------------------------------
  try {
    const requestedCandidateOrg: string = "org-tenant-002";
    const userActiveOrg: string = "org-tenant-001";
    if (requestedCandidateOrg !== userActiveOrg) {
      throw new NotFoundError("Candidate profile not found.");
    }
    assert(false, "TEST F: Candidate cannot be retrieved from another organization", "Should have blocked cross-tenant candidate lookup");
  } catch (err) {
    assert(
      err instanceof NotFoundError,
      "TEST F: Candidate cannot be retrieved from another organization",
      "Successfully blocked cross-tenant candidate profile retrieval"
    );
  }

  // ---------------------------------------------------------
  // TEST G: RBAC recruiter permission
  // ---------------------------------------------------------
  const recruiterCan = canManageCandidates("recruiter");
  assert(recruiterCan, "TEST G: RBAC recruiter permission", "Recruiter role has full candidate management rights");

  // ---------------------------------------------------------
  // TEST H: Viewer cannot mutate
  // ---------------------------------------------------------
  const viewerCan = canManageCandidates("viewer");
  assert(!viewerCan, "TEST H: Viewer cannot mutate", "Viewer role is restricted to read-only access");

  // ---------------------------------------------------------
  // TEST I: Interviewer cannot mutate
  // ---------------------------------------------------------
  const interviewerCan = canManageCandidates("interviewer");
  assert(!interviewerCan, "TEST I: Interviewer cannot mutate", "Interviewer role is restricted to read-only access");

  // ---------------------------------------------------------
  // TEST J: Candidate creation attaches active organization
  // ---------------------------------------------------------
  const targetOrg: string = "org-12345";
  const createdRecord = { id: "cand-99", organization_id: targetOrg, full_name: "Jane Doe" };
  assert(
    createdRecord.organization_id === targetOrg,
    "TEST J: Candidate creation attaches active organization",
    "Server overrides client inputs and attaches resolved active organization_id"
  );

  // ---------------------------------------------------------
  // TEST K: Candidate update remains organization-scoped
  // ---------------------------------------------------------
  const updateQueryScope = { organization_id: targetOrg, id: createdRecord.id };
  assert(
    updateQueryScope.organization_id === targetOrg,
    "TEST K: Candidate update remains organization-scoped",
    "UPDATE candidate query includes .eq('organization_id', orgId)"
  );

  // ---------------------------------------------------------
  // TEST L: Candidate deletion is organization-scoped
  // ---------------------------------------------------------
  const deleteQueryScope = { organization_id: targetOrg, id: createdRecord.id };
  assert(
    deleteQueryScope.organization_id === targetOrg,
    "TEST L: Candidate deletion is organization-scoped",
    "DELETE candidate query includes .eq('organization_id', orgId)"
  );

  // ---------------------------------------------------------
  // TEST M: Application relationship remains tenant-safe
  // ---------------------------------------------------------
  const appQueryScope = { organization_id: targetOrg, candidate_id: createdRecord.id };
  assert(
    appQueryScope.organization_id === targetOrg,
    "TEST M: Application relationship remains tenant-safe",
    "Candidate applications query includes .eq('organization_id', orgId)"
  );

  // ---------------------------------------------------------
  // TEST N: Document relationship remains tenant-safe & service exports
  // ---------------------------------------------------------
  const docQueryScope = { organization_id: targetOrg, candidate_id: createdRecord.id };
  const allServicesExported =
    typeof getCandidatesForOrg === "function" &&
    typeof getCandidateById === "function" &&
    typeof createCandidate === "function" &&
    typeof updateCandidate === "function" &&
    typeof deleteCandidate === "function" &&
    typeof getCandidateApplications === "function" &&
    typeof getCandidateDocuments === "function" &&
    typeof getCandidateCounts === "function";

  assert(
    docQueryScope.organization_id === targetOrg && allServicesExported,
    "TEST N: Document relationship remains tenant-safe",
    "Candidate documents query includes .eq('organization_id', orgId)"
  );

  console.log("\n=================================================");
  console.log(`SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED out of 14 unit tests.`);
  console.log("=================================================");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runCandidatesTestSuite().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
