import type { Metadata } from "next";
import { GitHubIcon, LinkedInIcon } from "../../(site)/about/SocialIcons";

export const metadata: Metadata = {
  title: "W.S. Gong — Tech",
};

const socials = [
  { label: "GitHub", icon: <GitHubIcon />, url: "https://github.com/highschoolsmokers" },
  { label: "LinkedIn", icon: <LinkedInIcon />, url: "https://www.linkedin.com/in/billy-gong" },
];

export default function TechPage() {
  return (
    <div className="pt-16">
      <a
        href="/resume.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm underline underline-offset-4 hover:opacity-70 transition-opacity"
      >
        Resume (PDF)
      </a>

      <section className="mt-8">
        <ul className="flex gap-5">
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
