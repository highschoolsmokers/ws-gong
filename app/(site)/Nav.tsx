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
      <div className="flex flex-col gap-6">
        <Link
          href="/"
          className={`flex items-center gap-2.5 transition-opacity ${
            pathname === "/" ? "pointer-events-none" : "hover:opacity-70"
          }`}
        >
          <div className="w-5 h-5 bg-black" />
          <span className="text-xl font-black tracking-tight">Narratives. Code.</span>
        </Link>
        <ul className="text-sm font-semibold leading-loose">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`transition-opacity ${
                  pathname === link.href
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
