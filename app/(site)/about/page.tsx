import type { Metadata } from "next";
import Link from "next/link";
import {
  SubstackIcon,
  InstagramIcon,
  GitHubIcon,
  LinkedInIcon,
} from "./SocialIcons";
import ResumeLink from "../resume/ResumeLink";
import { generateToken } from "@/lib/resumeToken";

export const dynamic = "force-dynamic";

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
  const token = generateToken();

  return (
    <div className="space-y-0">
      <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
        <h2 className="text-xl md:text-2xl font-black leading-tight">Bio</h2>
        <div className="space-y-4 text-sm leading-relaxed">
          <p>
            W.S. Gong is a fiction editor at{" "}
            <a
              href="https://therumpus.net"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-70 transition-opacity"
            >
              The Rumpus
            </a>{" "}
            whose work appears in{" "}
            <a
              href="https://www.14hills.net"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-70 transition-opacity"
            >
              14 Hills
            </a>
            . He is an alumnus of{" "}
            <a
              href="https://www.middlebury.edu/bread-loaf-conferences"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-70 transition-opacity"
            >
              Bread Loaf
            </a>
            ,{" "}
            <a
              href="https://sewaneewriters.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-70 transition-opacity"
            >
              Sewanee
            </a>
            ,{" "}
            <a
              href="https://tinhouse.com/writers-workshop"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-70 transition-opacity"
            >
              Tin House
            </a>
            , and{" "}
            <a
              href="https://www.kenyonreview.org/workshops"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-70 transition-opacity"
            >
              Kenyon
            </a>
            , and a resident of the{" "}
            <a
              href="https://vcca.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-70 transition-opacity"
            >
              Virginia Center for Creative Arts
            </a>
            . He is at work on a novel about runaway kids in 1980s San
            Francisco.
          </p>
          <p>
            By day, he is a technical writer with twenty-five years in software
            — most recently focused on AI tooling, developer documentation, and
            the Model Context Protocol. He builds tools at the intersection of
            language models and the writing craft, including an{" "}
            <Link
              href="/projects/paperless-mcp"
              className="hover:opacity-70 transition-opacity font-semibold"
            >
              MCP server
            </Link>{" "}
            for document management and a{" "}
            <Link
              href="/projects/submission-cli"
              className="hover:opacity-70 transition-opacity font-semibold"
            >
              CLI
            </Link>{" "}
            that uses Claude to streamline fiction submissions.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
        <h2 className="text-xl md:text-2xl font-black leading-tight">Resume</h2>
        <ResumeLink token={token} />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
        <h2 className="text-xl md:text-2xl font-black leading-tight">
          Newsletter
        </h2>
        <div className="text-sm space-y-3">
          <p>Fiction and essays, occasionally.</p>
          <a
            href="https://highschoolsmokers.substack.com/subscribe"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block font-semibold hover:opacity-70 transition-opacity"
          >
            Subscribe on Substack →
          </a>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
        <h2 className="text-xl md:text-2xl font-black leading-tight">Links</h2>
        <ul className="flex gap-5 items-start">
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
      </section>

      <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
        <h2 className="text-xl md:text-2xl font-black leading-tight">
          Contact
        </h2>
        <div className="text-sm space-y-3">
          <p>For inquiries about writing, editing, or technical work.</p>
          <Link
            href="/contact"
            className="inline-block font-semibold hover:opacity-70 transition-opacity"
          >
            Get in touch →
          </Link>
        </div>
      </section>
    </div>
  );
}
