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
    <div className="space-y-6">
      <p className="text-sm font-medium text-neutral-500">Technical Writer &amp; AI Documentation Engineer</p>
      <p className="text-sm leading-relaxed text-neutral-700 max-w-xl">
        After twenty-five years in tech creating test plans, runbooks, API specs, and developer
        tooling, I completed an MFA in Creative Writing. The through-line? Clarity is a form
        of respect. Great technical documentation respects the reader. Built on agentic
        workflows and docs-as-tests pipelines, it can also enforce that respect. Quality
        isn&apos;t an editorial judgment: it&apos;s a test result.
      </p>
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
    </div>
  );
}
