"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { EmailIcon } from "./about/SocialIcons";

const links = [
  { href: "/writing", label: "Writing" },
  { href: "/about", label: "About" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <div className="flex items-start justify-between">
      <Link
        href="/"
        className={`text-[11px] font-medium tracking-[0.08em] uppercase transition-opacity ${
          pathname === "/" ? "pointer-events-none" : "hover:opacity-50"
        }`}
      >
        W.S. Gong
      </Link>
      <nav className="flex gap-8 items-center">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`text-[11px] tracking-[0.08em] uppercase transition-opacity ${
              pathname === href
                ? "underline underline-offset-2 pointer-events-none"
                : "hover:opacity-50"
            }`}
          >
            {label}
          </Link>
        ))}
<Link
          href="/contact"
          className={`transition-opacity ${
            pathname === "/contact"
              ? "opacity-40 pointer-events-none"
              : "hover:opacity-50"
          }`}
          aria-label="Contact"
        >
          <EmailIcon />
        </Link>
      </nav>
    </div>
  );
}
