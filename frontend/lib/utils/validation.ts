import { ValidationError } from "./errors";

export function validateOrganizationInput(name: string, slug: string) {
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    throw new ValidationError(
      "Organization name is required and cannot be empty.",
    );
  }

  if (name.trim().length > 100) {
    throw new ValidationError(
      "Organization name cannot exceed 100 characters.",
    );
  }

  if (!slug || typeof slug !== "string" || slug.trim().length === 0) {
    throw new ValidationError("Organization URL slug is required.");
  }

  const cleanSlug = slug.trim().toLowerCase();
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!slugRegex.test(cleanSlug)) {
    throw new ValidationError(
      "Organization slug can only contain lowercase letters, numbers, and hyphens (e.g. neural-scale).",
    );
  }

  if (cleanSlug.length < 3 || cleanSlug.length > 50) {
    throw new ValidationError(
      "Organization slug must be between 3 and 50 characters.",
    );
  }

  return { name: name.trim(), slug: cleanSlug };
}

export function validateEmail(email: string): string {
  if (!email || typeof email !== "string" || email.trim().length === 0) {
    throw new ValidationError("Email address is required.");
  }

  const cleanEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    throw new ValidationError("Invalid email address format.");
  }

  return cleanEmail;
}

export function validateJobInput(input: {
  title: string;
  department: string;
  location: string;
  employment_type: string;
}) {
  if (!input.title || input.title.trim().length === 0) {
    throw new ValidationError("Job title is required.");
  }

  if (!input.department || input.department.trim().length === 0) {
    throw new ValidationError("Department is required.");
  }

  if (!input.location || input.location.trim().length === 0) {
    throw new ValidationError("Job location is required.");
  }

  const validEmploymentTypes = [
    "full_time",
    "part_time",
    "contract",
    "internship",
  ];
  if (!validEmploymentTypes.includes(input.employment_type)) {
    throw new ValidationError("Invalid employment type.");
  }
}
