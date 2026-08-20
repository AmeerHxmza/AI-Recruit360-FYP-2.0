import { OrganizationRole } from "@/types/database.types";

export type PermissionAction =
  | "org:manage"
  | "members:manage"
  | "members:view"
  | "jobs:create"
  | "jobs:update"
  | "jobs:view"
  | "candidates:manage"
  | "candidates:view"
  | "applications:manage"
  | "applications:view"
  | "documents:upload"
  | "documents:delete"
  | "documents:view"
  | "interviews:manage"
  | "interviews:view"
  | "evaluations:manage"
  | "evaluations:view"
  | "audit:view";

const ROLE_PERMISSIONS: Record<OrganizationRole, PermissionAction[]> = {
  owner: [
    "org:manage",
    "members:manage",
    "members:view",
    "jobs:create",
    "jobs:update",
    "jobs:view",
    "candidates:manage",
    "candidates:view",
    "applications:manage",
    "applications:view",
    "documents:upload",
    "documents:delete",
    "documents:view",
    "interviews:manage",
    "interviews:view",
    "evaluations:manage",
    "evaluations:view",
    "audit:view",
  ],
  admin: [
    "org:manage",
    "members:manage",
    "members:view",
    "jobs:create",
    "jobs:update",
    "jobs:view",
    "candidates:manage",
    "candidates:view",
    "applications:manage",
    "applications:view",
    "documents:upload",
    "documents:delete",
    "documents:view",
    "interviews:manage",
    "interviews:view",
    "evaluations:manage",
    "evaluations:view",
    "audit:view",
  ],
  recruiter: [
    "members:view",
    "jobs:create",
    "jobs:update",
    "jobs:view",
    "candidates:manage",
    "candidates:view",
    "applications:manage",
    "applications:view",
    "documents:upload",
    "documents:delete",
    "documents:view",
    "interviews:manage",
    "interviews:view",
    "evaluations:manage",
    "evaluations:view",
  ],
  interviewer: [
    "members:view",
    "jobs:view",
    "candidates:view",
    "applications:view",
    "documents:view",
    "interviews:manage",
    "interviews:view",
    "evaluations:manage",
    "evaluations:view",
  ],
  viewer: [
    "members:view",
    "jobs:view",
    "candidates:view",
    "applications:view",
    "documents:view",
    "interviews:view",
    "evaluations:view",
  ],
};

export function hasPermission(role: OrganizationRole | null | undefined, action: PermissionAction): boolean {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role];
  return permissions ? permissions.includes(action) : false;
}

export function canManageOrganization(role: OrganizationRole | null | undefined): boolean {
  return hasPermission(role, "org:manage");
}

export function canManageMembers(role: OrganizationRole | null | undefined): boolean {
  return hasPermission(role, "members:manage");
}

export function canManageJobs(role: OrganizationRole | null | undefined): boolean {
  return hasPermission(role, "jobs:create");
}

export function canManageCandidates(role: OrganizationRole | null | undefined): boolean {
  return hasPermission(role, "candidates:manage");
}

export function canManageApplications(role: OrganizationRole | null | undefined): boolean {
  return hasPermission(role, "applications:manage");
}

export function canManageDocuments(role: OrganizationRole | null | undefined): boolean {
  return hasPermission(role, "documents:upload");
}

export function canManageInterviews(role: OrganizationRole | null | undefined): boolean {
  return hasPermission(role, "interviews:manage");
}

export function canManageEvaluations(role: OrganizationRole | null | undefined): boolean {
  return hasPermission(role, "evaluations:manage");
}

export function canViewSecurityAudit(role: OrganizationRole | null | undefined): boolean {
  return hasPermission(role, "audit:view");
}
