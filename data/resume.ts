export interface Experience {
  title: string;
  company: string;
  location: string;
  start: string;
  end: string | "Present";
  bullets: string[];
}

export interface Education {
  degree: string;
  school: string;
  year: string;
}

export interface Project {
  name: string;
  description: string;
  url?: string;
}

export const experience: Experience[] = [
  {
    title: "Job Title",
    company: "Company Name",
    location: "City, State",
    start: "Jan 2023",
    end: "Present",
    bullets: [
      "Describe what you did and the impact it had.",
      "Another accomplishment or responsibility.",
    ],
  },
  {
    title: "Previous Role",
    company: "Previous Company",
    location: "City, State",
    start: "Jun 2021",
    end: "Dec 2022",
    bullets: [
      "Describe what you did and the impact it had.",
      "Another accomplishment or responsibility.",
    ],
  },
];

export const education: Education[] = [
  {
    degree: "B.S. Computer Science",
    school: "University Name",
    year: "2021",
  },
];

export const skills: string[] = [
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
];

export const projects: Project[] = [
  {
    name: "Project Name",
    description: "Brief description of what the project does.",
    url: "https://github.com/highschoolsmokers",
  },
];
