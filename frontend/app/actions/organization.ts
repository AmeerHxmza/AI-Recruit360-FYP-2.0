"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getCurrentUser, getCurrentMembership, getOrganizationContext } from "@/lib/auth/session";
import { createOrganization, Organization } from "@/lib/services/organization-service";
import { getDashboardDataForOrg, DashboardData } from "@/lib/services/dashboard-service";
import { AppError } from "@/lib/utils/errors";

export interface CreateOrganizationActionResult {
  success: boolean;
  error?: string;
  organization?: Organization;
}

export async function createOrganizationAction(
  name: string,
  slug: string
): Promise<CreateOrganizationActionResult> {
  try {
    // 1. Verify user authentication
    await getCurrentUser();

    // 2. Invoke service to validate input & call canonical database RPC: public.create_organization(_name, _slug)
    const org = await createOrganization(name, slug);

    // 3. Set newly created org as preferred cookie
    try {
      const cookieStore = await cookies();
      cookieStore.set("air360_org_id", org.id, {
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 365,
      });
    } catch {
      // ignore cookie write error if context unsuited
    }

    // 4. Revalidate path cache for dashboard & layout
    revalidatePath("/", "layout");
    revalidatePath("/dashboard");

    return {
      success: true,
      organization: org,
    };
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return {
        success: false,
        error: err.message,
      };
    }

    if (err instanceof Error) {
      if (err.message.includes("unique") || err.message.includes("slug")) {
        return {
          success: false,
          error: "An organization with this URL slug already exists. Please choose a different slug.",
        };
      }
      return {
        success: false,
        error: err.message || "An unexpected error occurred while creating your organization.",
      };
    }

    return {
      success: false,
      error: "Failed to create organization workspace. Please try again.",
    };
  }
}

export async function switchOrganizationAction(
  orgId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await getCurrentUser();
    const membership = await getCurrentMembership(orgId);

    if (!membership) {
      return {
        success: false,
        error: "Access denied. You are not a member of this organization.",
      };
    }

    const cookieStore = await cookies();
    cookieStore.set("air360_org_id", orgId, {
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
    });

    revalidatePath("/", "layout");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Failed to switch organization workspace." };
  }
}

export async function getDashboardDataAction(): Promise<{
  success: boolean;
  data?: DashboardData;
  error?: string;
}> {
  try {
    const ctx = await getOrganizationContext();
    if (!ctx) {
      return { success: false, error: "No active organization workspace." };
    }

    const data = await getDashboardDataForOrg(ctx.organization.id);
    return { success: true, data };
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Failed to load dashboard metrics." };
  }
}
