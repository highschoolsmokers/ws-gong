import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import PageTitle from "@/app/components/PageTitle";
import {
  SubstackIcon,
  InstagramIcon,
  GitHubIcon,
  LinkedInIcon,
} from "./SocialIcons";
import ResumeLink from "../resume/ResumeLink";

const description =
  "W.S. Gong is a fiction editor at The Rumpus and a technical writer focused on AI tooling and developer documentation. Twenty-five years in software. At work on a novel about runaway kids in 1980s San Francisco.";

export const metadata: Metadata = {
  title: "About",
  description,
  openGraph: {
    title: "About — W.S. Gong",
    description,
  },
};

const linkClass = "font-medium";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="swiss-grid swiss-rule pt-6 pb-16">
      <div className="col-span-12 md:col-span-4">
        <h2 className="swiss-label">{title}</h2>
      </div>
      <div className="col-span-12 md:col-span-8">{children}</div>
    </section>
  );
}

function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

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
  {
    label: "Substack",
    icon: <SubstackIcon />,
    url: "https://substack.com/@highschoolsmokers",
  },
  {
    label: "Instagram",
    icon: <InstagramIcon />,
    url: "https://www.instagram.com/born.deleuze",
  },
];

export default function About() {
  return (
    <div className="space-y-0">
      <PageTitle>About</PageTitle>
      <Section title="Bio">
        <div className="space-y-4 text-sm leading-relaxed">
          <p>
            W.S. Gong is a fiction editor at{" "}
            <Ext href="https://therumpus.net">The Rumpus</Ext> whose work
            appears in <Ext href="https://www.14hills.net">14 Hills</Ext>. He is
            an alumnus of{" "}
            <Ext href="https://www.middlebury.edu/bread-loaf-conferences">
              Bread Loaf
            </Ext>
            , <Ext href="https://sewaneewriters.org">Sewanee</Ext>,{" "}
            <Ext href="https://tinhouse.com/writers-workshop">Tin House</Ext>,
            and <Ext href="https://www.kenyonreview.org/workshops">Kenyon</Ext>,
            and a resident of the{" "}
            <Ext href="https://vcca.com">Virginia Center for Creative Arts</Ext>
            . He is at work on a novel about runaway kids in 1980s San
            Francisco.
          </p>
          <p>
            A technical writer and agentic developer with twenty-five years in
            software, he builds open-source tools at the intersection of
            language models and the writing craft: MCP servers for{" "}
            <Link
              href="/code/paperless-mcp"
              className={`${linkClass} font-medium`}
            >
              document management
            </Link>
            ,{" "}
            <Link
              href="/code/colophon-mcp"
              className={`${linkClass} font-medium`}
            >
              book discovery
            </Link>
            , and{" "}
            <Link
              href="/code/lit-verity-mcp"
              className={`${linkClass} font-medium`}
            >
              citation-grounding in literary criticism
            </Link>
            ; Claude Code plugins for{" "}
            <Link
              href="/code/historical-research-agent"
              className={`${linkClass} font-medium`}
            >
              historical
            </Link>{" "}
            and{" "}
            <Link
              href="/code/lit-research-plugin"
              className={`${linkClass} font-medium`}
            >
              literary
            </Link>{" "}
            research and for{" "}
            <Link
              href="/code/submission-watcher-agent"
              className={`${linkClass} font-medium`}
            >
              tracking magazine submission windows
            </Link>
            ; and a{" "}
            <Link
              href="/code/submission-cli"
              className={`${linkClass} font-medium`}
            >
              CLI
            </Link>{" "}
            that uses Claude to streamline fiction submissions.
          </p>
        </div>
      </Section>

      <Section title="Resume">
        <ResumeLink />
      </Section>

      <Section title="Links">
        <div className="text-sm space-y-4">
          <p>
            For readings, panels, workshops, or any other inquiries —{" "}
            <Link href="/contact" className={`${linkClass} font-medium`}>
              get in touch
            </Link>
            . Fiction and essays on{" "}
            <Ext href="https://highschoolsmokers.substack.com/subscribe">
              Substack
            </Ext>
            , occasionally.
          </p>
          <ul className="flex gap-5 items-start">
            {socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block ${linkClass}`}
                  aria-label={s.label}
                >
                  {s.icon}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Section>
    </div>
  );
}
