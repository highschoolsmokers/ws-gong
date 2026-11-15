import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/app/components/icons";
import { PageTitle, Section, ext } from "@/app/components/ui";
import { profiles, site } from "@/lib/site/content";
import { SUBSTACK_BASE_URL } from "@/lib/substack";

const description = site.bio[0];
export const metadata: Metadata = {
  title: "About",
  description,
  openGraph: { title: "About — W.S. Gong", description },
};

export default function About() {
  return (
    <>
      <PageTitle>About</PageTitle>
      <Section title="Bio">
        <div className="max-w-prose space-y-4 text-base">
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
      </Section>
      <Section title="Links">
        <p>
          For readings, panels, workshops, or any other inquiries,{" "}
          <Link href="/#contact" className="font-medium">
            get in touch
          </Link>
          . Fiction and essays on{" "}
          <a href={`${SUBSTACK_BASE_URL}/subscribe`} {...ext}>
            Substack
          </a>
          , occasionally.
        </p>
        <ul className="flex gap-5">
          {profiles.map((p) => (
            <li key={p.label}>
              <a href={p.url} aria-label={p.label} className="block" {...ext}>
                <Icon name={p.label} />
              </a>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
