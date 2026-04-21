"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/narratives", label: "Narratives" },
  { href: "/code", label: "Code" },
  { href: "/residencies", label: "Residencies" },
  { href: "/about", label: "About" },
];

export default function Nav() {
  const pathname = usePathname();
  const isHome = pathname === "/";

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
        {isHome ? masthead : <Link href="/">{masthead}</Link>}
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
