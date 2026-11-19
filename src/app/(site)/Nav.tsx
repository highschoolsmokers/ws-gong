"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";

// The home page is the site: nav entries are anchors into its sections.
// Optional sections pass their flag in from the server layout, which can read
// content files; this client component can't.
export default function Nav({
  slushpile,
  reading,
  notFound,
}: {
  slushpile: boolean;
  reading: boolean;
  notFound: boolean;
}) {
  const links = [
    ["/#about", "About"],
    ["/#writing", "Writing"],
    ...(reading ? [["/#reading", "Reading"]] : []),
    ["/#code", "Code"],
    ["/#cv", "CV"],
    ["/#contact", "Contact"],
    ...(slushpile ? [["/slushpile", "Slushpile"]] : []),
  ];
  const masthead = (
    <span className="masthead swiss-display block">
      W.S.
      <br />
      Gong
    </span>
  );
  return (
    <div className="swiss-grid items-end">
      {/* The masthead is the h1 on the home page. Decided by route segment,
          not URL: on Vercel, regenerating "/" rendered with another pathname,
          so the server sent a link, the browser an h1 (React error #418). */}
      {useSelectedLayoutSegment() === null && !notFound ? (
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
        className="col-span-12 md:col-span-2 md:col-start-11"
      >
        <ul className="site-nav">
          {links.map(([href, label]) => (
            <li key={href}>
              <Link href={href}>{label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
