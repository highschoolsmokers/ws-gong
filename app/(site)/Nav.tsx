"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/narratives", label: "Narratives" },
  { href: "/code", label: "Code" },
  { href: "/about", label: "About" },
];

export default function Nav() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const masthead = (
    <span className="text-6xl md:text-7xl lg:text-[5.5rem] font-black leading-[0.95] tracking-tight">
      W.S.
      <br />
      Gong
    </span>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8 md:gap-12">
      <h1>
        {isHome ? (
          masthead
        ) : (
          <Link href="/" className="transition-opacity hover:opacity-70">
            {masthead}
          </Link>
        )}
      </h1>
      <div className="flex flex-col justify-end">
        <span className="flex items-center gap-2 text-xl md:text-2xl font-black leading-snug mb-1">
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="currentColor"
            aria-hidden="true"
          >
            <rect width="18" height="18" />
          </svg>
          Stories &amp; Systems
        </span>
        <ul className="text-xl md:text-2xl font-black leading-snug">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`transition-opacity ${
                  pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(link.href))
                    ? "pointer-events-none"
                    : "hover:opacity-70"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
