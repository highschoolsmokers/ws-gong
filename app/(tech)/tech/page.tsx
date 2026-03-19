import type { Metadata } from "next";
import Link from "next/link";
import { GitHubIcon, LinkedInIcon } from "../../(site)/about/SocialIcons";

const description =
  "Twenty-five years in tech writing test plans, runbooks, API specs, and developer tooling. Now building documentation systems backed by agentic workflows and docs-as-tests pipelines.";

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
      <p className="text-sm leading-relaxed text-neutral-700 max-w-xl">
        Twenty-five years in tech — writing test plans, runbooks, API specs, and developer
        tooling. Then an MFA. Clarity is a form of respect. Most technical documentation
        treats the reader like an inconvenience. Now building documentation systems backed
        by agentic workflows and docs-as-tests pipelines — accuracy isn&apos;t an editorial
        judgment, it&apos;s a test result.
      </p>
      <div className="flex gap-5 items-center">
        <Link
          href="/resume"
          className="text-[10px] tracking-[0.08em] uppercase border border-black px-3 py-1 hover:bg-black hover:text-white transition-colors"
        >
          Resume
        </Link>
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
    </div>
  );
}
