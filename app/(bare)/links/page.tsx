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
    <div className="swiss-container py-12">
      <Link href="/" className="swiss-display mb-12 block text-3xl">
        W.S. Gong
      </Link>
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
