import type { Metadata } from "next";
import Link from "next/link";
import PageTitle from "@/app/components/PageTitle";
import { site } from "@/lib/site/content";
import { SUBSTACK_BASE_URL } from "@/lib/substack";
import {
  SubstackIcon,
  InstagramIcon,
  GitHubIcon,
  LinkedInIcon,
} from "./SocialIcons";

// Bio text comes from resumes-cvs via content/site.json (SPEC §23).
const description = site.bio[0];

export const metadata: Metadata = {
  title: "About",
  description,
  openGraph: { title: "About — W.S. Gong", description },
};

const socials = [
  { label: "GitHub", icon: <GitHubIcon />, url: site.links.github },
  { label: "LinkedIn", icon: <LinkedInIcon />, url: site.links.linkedin },
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
    <div>
      <PageTitle>About</PageTitle>

      <section className="home-section">
        <div className="swiss-grid">
          <div className="col-span-12 md:col-span-4">
            <h2 className="swiss-label">Bio</h2>
          </div>
          <div className="col-span-12 md:col-span-8 space-y-4 text-base leading-relaxed max-w-prose">
            {site.bio.map((para) => (
              <p key={para}>{para}</p>
            ))}
            <p>
              Projects, writing, and the résumé are{" "}
              <Link href="/" className="font-medium">
                on the home page
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="swiss-grid">
          <div className="col-span-12 md:col-span-4">
            <h2 className="swiss-label">Links</h2>
          </div>
          <div className="col-span-12 md:col-span-8 space-y-4 text-sm">
            <p>
              For readings, panels, workshops, or any other inquiries,{" "}
              <Link href="/#contact" className="font-medium">
                get in touch
              </Link>
              . Fiction and essays on{" "}
              <a
                href={`${SUBSTACK_BASE_URL}/subscribe`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Substack
              </a>
              , occasionally.
            </p>
            <ul className="flex gap-5 items-start">
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block font-medium"
                    aria-label={s.label}
                  >
                    {s.icon}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
