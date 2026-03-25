"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/projects", label: "Projects" },
  { href: "/laboratory", label: "Laboratory" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const titles: Record<string, React.ReactNode> = {
  "/": (
    <>
      W.S.
      <br />
      Gong
    </>
  ),
  "/projects": "Projects",
  "/laboratory": "Laboratory",
  "/about": "About",
  "/contact": "Contact",
};

export default function Nav() {
  const pathname = usePathname();
  const title = titles[pathname];

  return (
    <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8 md:gap-12">
      {title ? (
        <h1 className="text-6xl md:text-7xl lg:text-[5.5rem] font-black leading-[0.95] tracking-tight">
          {title}
        </h1>
      ) : (
        <div />
      )}
      <nav className="text-xl font-black tracking-tight leading-relaxed">
        <ul>
          <li>
            <Link
              href="/"
              className={`transition-opacity ${
                pathname === "/" ? "pointer-events-none" : "hover:opacity-70"
              }`}
            >
              Narratives. Code.
            </Link>
          </li>
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`transition-opacity ${
                  pathname === link.href
                    ? "underline underline-offset-2 pointer-events-none"
                    : "hover:opacity-70"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
