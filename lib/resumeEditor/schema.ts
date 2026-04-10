import { z } from "zod";

const contactEntrySchema = z.object({
  label: z.string(),
  url: z.string(),
  type: z.enum(["web", "email", "linkedin"]),
});

const educationEntrySchema = z.object({
  dates: z.string(),
  institution: z.string(),
  degree: z.string(),
  details: z.string().nullable().optional(),
});

const experienceEntrySchema = z.object({
  company: z.string(),
  dates: z.string(),
  title: z.string(),
  description: z.string(),
  location: z.string().nullable().optional(),
});

const earlierExperienceEntrySchema = z.object({
  company: z.string(),
  title: z.string(),
  dates: z.string(),
});

const skillCategorySchema = z.object({
  heading: z.string(),
  items: z.string(),
});

const profileSchema = z.object({
  name: z.object({ first: z.string(), last: z.string() }),
  title: z.string().default(""),
  contact: z.array(contactEntrySchema).default([]),
  about: z.array(z.string()).default([]),
  education: z.array(educationEntrySchema).default([]),
  professional_development: z.array(z.string()).default([]),
  skills: z.string().default(""),
  skill_categories: z.array(skillCategorySchema).default([]),
  experience: z.array(experienceEntrySchema).default([]),
  earlier_experience: z.array(earlierExperienceEntrySchema).default([]),
});

export type ContactEntry = z.infer<typeof contactEntrySchema>;
export type EducationEntry = z.infer<typeof educationEntrySchema>;
export type ExperienceEntry = z.infer<typeof experienceEntrySchema>;
export type EarlierExperienceEntry = z.infer<
  typeof earlierExperienceEntrySchema
>;
export type SkillCategory = z.infer<typeof skillCategorySchema>;
export type Profile = z.infer<typeof profileSchema>;

export function validateProfile(data: unknown): Profile {
  return profileSchema.parse(data);
}

export function emptyProfile(): Profile {
  return {
    name: { first: "", last: "" },
    title: "",
    contact: [],
    about: [],
    education: [],
    professional_development: [],
    skills: "",
    skill_categories: [],
    experience: [],
    earlier_experience: [],
  };
}
