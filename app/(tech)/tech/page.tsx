import type { Metadata } from "next";
import { GitHubIcon, LinkedInIcon } from "../../(site)/about/SocialIcons";

const description =
  "After twenty-five years in tech creating test plans, runbooks, API specs, and developer tooling, I completed an MFA in Creative Writing. Clarity is a form of respect — and with agentic workflows and docs-as-tests pipelines, quality isn't an editorial judgment: it's a test result.";

export const metadata: Metadata = {
  title: { absolute: "W.S. Gong — Technical Writer & Developer" },
  description,
  openGraph: {
    title: "W.S. Gong — Technical Writer & Developer",
    description,
    url: "https://tech.ws-gong.com",
  },
};

const socials = [
  { label: "GitHub", icon: <GitHubIcon />, url: "https://github.com/highschoolsmokers" },
  { label: "LinkedIn", icon: <LinkedInIcon />, url: "https://www.linkedin.com/in/billy-gong" },
];

export default function TechPage() {
  return (
    <div className="space-y-0">
      <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
        <h2 className="text-xl md:text-2xl font-black leading-tight">
          Technical Writer
          <br />
          &amp; AI Documentation
          <br />
          Engineer
        </h2>
        <div className="space-y-6">
          <ul className="flex gap-5 items-center">
            {socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:opacity-70 transition-opacity"
                  aria-label={s.label}
                >
                  {s.icon}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
