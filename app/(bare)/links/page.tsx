import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/app/components/icons";
import { ext } from "@/app/components/ui";
import { profiles } from "@/lib/site/content";

const description = "W.S. Gong — links and profiles.";
export const metadata: Metadata = {
  title: "Links",
  description,
  openGraph: { title: "Links — W.S. Gong", description },
};

const links = [
  { label: "The Rumpus", url: "https://therumpus.net" },
  { label: "Fabulosa Books", url: "https://www.fabulosabooks.com/" },
  ...profiles,
];

export default function Links() {
  return (
    <div className="mx-auto max-w-md space-y-10 px-6 py-12">
      <div className="space-y-3">
        <Link href="/" className="swiss-display block text-3xl no-underline">
          W.S. Gong
        </Link>
        <p className="swiss-label">Writing / Work</p>
      </div>
      <ul className="divide-y divide-current border-y border-current">
        {links.map((l) => (
          <li key={l.label}>
            <a
              href={l.url}
              className="flex items-center gap-4 py-4 text-sm font-medium no-underline"
              {...ext}
            >
              <span className="size-5 shrink-0">
                <Icon name={l.label} />
              </span>
              <span className="flex-1">{l.label}</span>
              <span aria-hidden className="text-xs">
                →
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
