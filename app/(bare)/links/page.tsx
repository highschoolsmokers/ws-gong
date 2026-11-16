import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/app/components/icons";
import { Row, Rows, Section } from "@/app/components/ui";
import { profiles } from "@/lib/site/content";

export const metadata: Metadata = {
  title: "Links",
  description: "W.S. Gong — links and profiles.",
};

// Instagram link-in-bio page (SPEC §2): the site grid without the site chrome.
const links = [
  { label: "Fabulosa Books", url: "https://www.fabulosabooks.com/" },
  ...profiles,
];

export default function Links() {
  return (
    <div className="swiss-container pb-24">
      <h1 className="site-header swiss-display text-3xl">
        <Link href="/">W.S. Gong</Link>
      </h1>
      <Section title="Links">
        <Rows>
          {links.map((l) => (
            <Row
              key={l.label}
              href={l.url}
              title={
                <span className="inline-flex items-center gap-3">
                  <Icon name={l.label} />
                  {l.label}
                </span>
              }
            />
          ))}
        </Rows>
      </Section>
    </div>
  );
}
