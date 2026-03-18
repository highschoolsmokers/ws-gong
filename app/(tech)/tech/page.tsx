import type { Metadata } from "next";
import Link from "next/link";
import { GitHubIcon, LinkedInIcon } from "../../(site)/about/SocialIcons";
import ResumeLink from "./ResumeLink";
import { generateToken } from "@/lib/resumeToken";
import { experience, education, skills, projects } from "@/data/resume";

export const metadata: Metadata = {
  title: "W.S. Gong — Tech",
};

const socials = [
  {
    label: "GitHub",
    icon: <GitHubIcon />,
    url: "https://github.com/highschoolsmokers",
  },
  {
    label: "LinkedIn",
    icon: <LinkedInIcon />,
    url: "https://www.linkedin.com/in/billy-gong",
  },
];

export default function TechPage() {
  const token = generateToken();
  return (
    <div className="space-y-16">
      <section className="flex gap-4 items-center">
        <ResumeLink token={token} />
        <Link
          href="https://ws-gong.com/contact?from=tech"
          className="text-[10px] tracking-[0.08em] uppercase border border-black px-3 py-1 hover:bg-black hover:text-white transition-colors inline-block"
        >
          Contact
        </Link>
      </section>

      <section className="grid grid-cols-[120px_1fr] gap-x-12">
        <span className="text-[10px] tracking-[0.12em] uppercase pt-px">
          Experience
        </span>
        <ul className="space-y-8">
          {experience.map((job) => (
            <li key={job.company + job.title}>
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-sm font-medium">{job.title}</span>
                <span className="text-[11px] text-neutral-400 tabular-nums">
                  {job.start} — {job.end}
                </span>
              </div>
              <div className="text-[11px] text-neutral-500 mb-2">
                {job.company}, {job.location}
              </div>
              <ul className="space-y-1">
                {job.bullets.map((b, i) => (
                  <li key={i} className="text-sm text-neutral-700 flex gap-2">
                    <span className="text-neutral-300 select-none">—</span>
                    {b}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid grid-cols-[120px_1fr] gap-x-12">
        <span className="text-[10px] tracking-[0.12em] uppercase pt-px">
          Education
        </span>
        <ul className="space-y-2">
          {education.map((ed) => (
            <li key={ed.school}>
              <span className="text-sm font-medium">{ed.degree}</span>
              <span className="text-[11px] text-neutral-500 block">
                {ed.school}, {ed.year}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid grid-cols-[120px_1fr] gap-x-12">
        <span className="text-[10px] tracking-[0.12em] uppercase pt-px">
          Skills
        </span>
        <p className="text-sm text-neutral-700">{skills.join(", ")}</p>
      </section>

      <section className="grid grid-cols-[120px_1fr] gap-x-12">
        <span className="text-[10px] tracking-[0.12em] uppercase pt-px">
          Projects
        </span>
        <ul className="space-y-4">
          {projects.map((p) => (
            <li key={p.name}>
              {p.url ? (
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium hover:opacity-50 transition-opacity"
                >
                  {p.name}
                </a>
              ) : (
                <span className="text-sm font-medium">{p.name}</span>
              )}
              <span className="text-[11px] text-neutral-500 block mt-0.5">
                {p.description}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <ul className="flex gap-5 items-center">
          {socials.map((s) => (
            <li key={s.label}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:opacity-50 transition-opacity"
                aria-label={s.label}
              >
                {s.icon}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
