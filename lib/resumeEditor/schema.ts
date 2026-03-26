export interface ContactEntry {
  label: string;
  url: string;
  type: "web" | "email" | "linkedin";
}

export interface EducationEntry {
  dates: string;
  institution: string;
  degree: string;
  details?: string | null;
}

export interface ExperienceEntry {
  company: string;
  dates: string;
  title: string;
  description: string;
  location?: string | null;
}

export interface EarlierExperienceEntry {
  company: string;
  title: string;
  dates: string;
}

export interface SkillCategory {
  heading: string;
  items: string;
}

export interface Profile {
  name: { first: string; last: string };
  title: string;
  contact: ContactEntry[];
  about: string[];
  education: EducationEntry[];
  professional_development: string[];
  skills: string;
  skill_categories: SkillCategory[];
  experience: ExperienceEntry[];
  earlier_experience: EarlierExperienceEntry[];
}

export function validateProfile(data: unknown): Profile {
  const d = data as Record<string, unknown>;
  if (!d || typeof d !== "object") throw new Error("Profile must be an object");
  if (!d.name || typeof d.name !== "object") throw new Error("Missing name");

  return {
    name: d.name as Profile["name"],
    title: (d.title as string) || "",
    contact: (d.contact as ContactEntry[]) || [],
    about: (d.about as string[]) || [],
    education: (d.education as EducationEntry[]) || [],
    professional_development: (d.professional_development as string[]) || [],
    skills: (d.skills as string) || "",
    skill_categories: (d.skill_categories as SkillCategory[]) || [],
    experience: (d.experience as ExperienceEntry[]) || [],
    earlier_experience:
      (d.earlier_experience as EarlierExperienceEntry[]) || [],
  };
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
