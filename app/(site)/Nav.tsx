"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/resume", label: "Resume" },
  { href: "/contact", label: "Contact" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8 md:gap-12">
      <h1 className="text-6xl md:text-7xl lg:text-[5.5rem] font-black leading-[0.95] tracking-tight">
        W.S.
        <br />
        Gong
      </h1>
      <nav className="text-xl font-black tracking-tight leading-tight">
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
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`transition-opacity hover:opacity-70`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
