"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLink = { href: string; label: string };

export default function Nav({
  slushpileEnabled,
}: {
  slushpileEnabled: boolean;
}) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const links: NavLink[] = [
    { href: "/narratives", label: "Narratives" },
    { href: "/code", label: "Code" },
    ...(slushpileEnabled
      ? [{ href: "/slushpile", label: "Slushpile" } satisfies NavLink]
      : []),
    { href: "/reading", label: "Reading" },
  ];

  const masthead = (
    <span className="swiss-display block text-[3.5rem] md:text-[5rem] lg:text-[6rem]">
      W.S.
      <br />
      Gong
    </span>
  );

  return (
    <div className="swiss-grid">
      <h1 className="col-span-12 md:col-span-8">
        {isHome ? (
          masthead
        ) : (
          <Link href="/" className="no-underline hover:!no-underline">
            {masthead}
          </Link>
        )}
      </h1>
      <nav
        aria-label="Main navigation"
        className="col-span-12 md:col-span-4 flex md:justify-end"
      >
        <ul className="flex md:flex-col flex-wrap gap-x-6 gap-y-1 text-base md:text-lg font-medium">
          {links.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <li key={link.href}>
                {isActive ? (
                  <span aria-current="page" className="pointer-events-none">
                    {link.label}
                  </span>
                ) : (
                  <Link href={link.href}>{link.label}</Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
