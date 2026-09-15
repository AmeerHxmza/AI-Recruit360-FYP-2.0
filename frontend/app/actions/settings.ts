"use server";
import { revalidatePath } from "next/cache";
import { getOrganizationContext } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function loadSettingsAction() {
  const c = await getOrganizationContext();
  if (!c) throw new Error("Sign in to access settings.");
  return {
    name: c.profile.full_name,
    title: c.profile.job_title || "",
    email: c.user.email || "",
    organization: c.organization.name,
    canEditOrganization: ["owner", "admin"].includes(c.role),
  };
}

export async function saveSettingsAction(input: {
  name: string;
  title: string;
  organization: string;
}) {
  try {
    const c = await getOrganizationContext();
    if (!c) throw new Error("Sign in to save settings.");
    if (
      !input.name.trim() ||
      input.name.length > 100 ||
      input.title.length > 100 ||
      !input.organization.trim() ||
      input.organization.length > 100
    )
      throw new Error("Names must contain 1–100 characters.");
    if (
      input.organization.trim() !== c.organization.name &&
      !["owner", "admin"].includes(c.role)
    )
      throw new Error("Only an owner or admin can rename this workspace.");
    const db = await createClient();
    const { error } = await db
      .from("profiles")
      .upsert({
        id: c.user.id,
        full_name: input.name.trim(),
        job_title: input.title.trim(),
      });
    if (error)
      throw new Error("Your profile could not be saved. Please retry.");
    if (input.organization.trim() !== c.organization.name) {
      const { error: orgError } = await db
        .from("organizations")
        .update({ name: input.organization.trim() })
        .eq("id", c.organization.id);
      if (orgError)
        throw new Error(
          "Profile saved, but workspace name could not be updated. Please retry.",
        );
    }
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Could not save settings.",
    };
  }
}
