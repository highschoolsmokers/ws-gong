"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { orderedBooks } from "@/lib/reading/books";

// The home page is the site: nav entries are anchors into its sections.
const links = [
  ["/#work", "Work"],
  ["/#writing", "Writing"],
  ...(orderedBooks.length ? [["/#reading", "Reading"]] : []),
  ["/#resume", "Résumé"],
  ["/#contact", "Contact"],
];

export default function Nav({ slushpile }: { slushpile: boolean }) {
  const masthead = (
    <span className="masthead swiss-display block">
      W.S.
      <br />
      Gong
    </span>
  );
  return (
    <div className="swiss-grid items-end">
      {usePathname() === "/" ? (
        <h1 className="col-span-12 md:col-span-7">{masthead}</h1>
      ) : (
        <Link
          href="/"
          aria-label="W.S. Gong, home"
          className="col-span-12 hover:!no-underline md:col-span-7"
        >
          {masthead}
        </Link>
      )}
      <nav
        aria-label="Main navigation"
        className="col-span-12 flex md:col-span-5 md:justify-end"
      >
        <ul className="site-nav">
          {[...links, ...(slushpile ? [["/slushpile", "Slushpile"]] : [])].map(
            ([href, label]) => (
              <li key={href}>
                <Link href={href}>{label}</Link>
              </li>
            ),
          )}
        </ul>
      </nav>
    </div>
  );
}
