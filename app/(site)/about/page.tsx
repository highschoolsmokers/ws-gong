import type { Metadata } from "next";
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
  "W.S. Gong is a fiction editor at The Rumpus and alumnus of Bread Loaf, Sewanee, Tin House, and Kenyon. At work on a novel about runaway kids in 1980s San Francisco.";

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
    <div className="space-y-12">
      <section className="grid grid-cols-[120px_1fr] gap-x-12">
        <span className="text-[10px] tracking-[0.12em] uppercase pt-px">
          Bio
        </span>
        <div className="space-y-4 text-sm leading-relaxed text-neutral-700">
          <p>
            W.S. Gong is a fiction editor at{" "}
            <a
              href="https://therumpus.net"
              target="_blank"
              rel="noopener noreferrer"
              className="italic hover:opacity-50 transition-opacity"
            >
              The Rumpus
            </a>{" "}
            whose work appears in{" "}
            <a
              href="https://www.14hills.net"
              target="_blank"
              rel="noopener noreferrer"
              className="italic hover:opacity-50 transition-opacity"
            >
              14 Hills
            </a>
            . He is an alumnus of{" "}
            <a
              href="https://www.middlebury.edu/bread-loaf-conferences"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-50 transition-opacity"
            >
              Bread Loaf
            </a>
            ,{" "}
            <a
              href="https://sewaneewriters.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-50 transition-opacity"
            >
              Sewanee
            </a>
            ,{" "}
            <a
              href="https://tinhouse.com/writers-workshop"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-50 transition-opacity"
            >
              Tin House
            </a>
            , and{" "}
            <a
              href="https://www.kenyonreview.org/workshops"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-50 transition-opacity"
            >
              Kenyon
            </a>
            , and a resident of the{" "}
            <a
              href="https://vcca.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-50 transition-opacity"
            >
              Virginia Center for Creative Arts
            </a>
            . He is at work on a novel about runaway kids in 1980s San
            Francisco.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-[120px_1fr] gap-x-12">
        <span className="text-[10px] tracking-[0.12em] uppercase pt-px">
          Published
        </span>
        <a
          href="https://www.14hills.net/copy-of-29"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm italic hover:opacity-50 transition-opacity"
        >
          14 Hills
        </a>
      </section>

      <section className="grid grid-cols-[120px_1fr] gap-x-12">
        <span className="text-[10px] tracking-[0.12em] uppercase pt-px">
          Resume
        </span>
        <ResumeLink token={token} />
      </section>

      <section className="grid grid-cols-[120px_1fr] gap-x-12">
        <span className="text-[10px] tracking-[0.12em] uppercase pt-px">
          Links
        </span>
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
