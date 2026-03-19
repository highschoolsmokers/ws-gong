"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { EmailIcon } from "../(site)/about/SocialIcons";

export default function TechNav() {
  const pathname = usePathname();

  return (
    <div className="flex items-start justify-between">
      <Link
        href="/tech"
        className={`text-[11px] font-medium tracking-[0.08em] uppercase transition-opacity ${
          pathname === "/tech" ? "pointer-events-none" : "hover:opacity-50"
        }`}
      >
        W.S. Gong
      </Link>
      <nav className="flex gap-8 items-center">
        <Link
          href="/resume"
          className={`text-[11px] tracking-[0.08em] uppercase transition-opacity ${
            pathname === "/resume"
              ? "underline underline-offset-2 pointer-events-none"
              : "hover:opacity-50"
          }`}
        >
          Resume
        </Link>
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
