import type { Metadata } from "next";
import { GitHubIcon, LinkedInIcon } from "../../(site)/about/SocialIcons";
import ResumeLink from "./ResumeLink";

export const metadata: Metadata = {
  title: "W.S. Gong — Tech",
};

const socials = [
  { label: "GitHub", icon: <GitHubIcon />, url: "https://github.com/highschoolsmokers" },
  { label: "LinkedIn", icon: <LinkedInIcon />, url: "https://www.linkedin.com/in/billy-gong" },
];

export default function TechPage() {
  return (
    <div className="space-y-12">
      <section className="grid grid-cols-[120px_1fr] gap-x-12 items-start">
        <span className="text-[10px] tracking-[0.12em] uppercase pt-px">Resume</span>
        <ResumeLink />
      </section>

      <section className="grid grid-cols-[120px_1fr] gap-x-12 items-start">
        <span className="text-[10px] tracking-[0.12em] uppercase pt-px">Links</span>
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
