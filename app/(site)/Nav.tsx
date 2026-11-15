"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLink = { href: string; label: string };

// The home page is the site: nav entries are anchors into its sections.
// Slushpile, a separate app, keeps its own path when mounted.
export default function Nav({
  slushpileEnabled,
  readingEnabled,
}: {
  slushpileEnabled: boolean;
  readingEnabled: boolean;
}) {
  const isHome = usePathname() === "/";

  const links: NavLink[] = [
    { href: "/#work", label: "Work" },
    { href: "/#writing", label: "Writing" },
    ...(readingEnabled ? [{ href: "/#reading", label: "Reading" }] : []),
    { href: "/#resume", label: "Résumé" },
    { href: "/#contact", label: "Contact" },
    ...(slushpileEnabled ? [{ href: "/slushpile", label: "Slushpile" }] : []),
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
      {isHome ? (
        <h1 className="col-span-12 md:col-span-7">{masthead}</h1>
      ) : (
        <p className="col-span-12 md:col-span-7">
          <Link
            href="/"
            className="no-underline hover:!no-underline"
            aria-label="W.S. Gong, home"
          >
            {masthead}
          </Link>
        </p>
      )}
      <nav
        aria-label="Main navigation"
        className="col-span-12 md:col-span-5 flex md:justify-end"
      >
        <ul className="site-nav">
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
