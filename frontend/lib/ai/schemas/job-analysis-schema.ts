import { z } from "zod";

export const SkillImportanceEnum = z.enum(["critical", "important", "nice_to_have"]);
export type SkillImportance = z.infer<typeof SkillImportanceEnum>;

export const JobSkillSchema = z.object({
  name: z.string().min(1, "Skill name cannot be empty"),
  importance: SkillImportanceEnum,
});
export type JobSkill = z.infer<typeof JobSkillSchema>;

export const ExperienceRequirementSchema = z.object({
  minimum_years: z.number().nullable(),
  preferred_years: z.number().nullable(),
});
export type ExperienceRequirement = z.infer<typeof ExperienceRequirementSchema>;

export const EducationRequirementSchema = z.object({
  required: z.boolean(),
  degrees: z.array(z.string()),
});
export type EducationRequirement = z.infer<typeof EducationRequirementSchema>;

export const JobAnalysisSchema = z.object({
  job_title: z.string().min(1, "Job title cannot be empty"),
  skills: z.array(JobSkillSchema),
  experience: ExperienceRequirementSchema,
  education: EducationRequirementSchema,
  responsibilities: z.array(z.string()),
  semantic_requirements: z.array(z.string()),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type JobAnalysis = z.infer<typeof JobAnalysisSchema>;
