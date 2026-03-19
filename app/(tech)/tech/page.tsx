import type { Metadata } from "next";
import { GitHubIcon, LinkedInIcon } from "../../(site)/about/SocialIcons";

const description =
  "Spec-to-prose pipelines, agentic workflows, and docs-as-tests systems that close the loop between live APIs and the documentation that describes them.";

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
      <p className="text-sm text-neutral-500">Technical Writer &amp; AI Documentation Engineer</p>
      <p className="text-base leading-relaxed text-neutral-700 max-w-xl">
        Every API is a graph with edges that change. Documentation is a map of that graph
        drawn at a moment in time — accurate when written, brittle by definition, maintained
        by memory instead of mechanism. Without infrastructure to track the delta, it decays.
        Closing that loop is the work: spec-to-prose pipelines that generate documentation
        from source, agentic workflows that exercise the live API and validate response
        schemas, and docs-as-tests systems that fail loudly when the territory moves and the
        map has yet to follow.
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
