"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { EmailIcon } from "../(site)/about/SocialIcons";

export default function TechNav() {
  const pathname = usePathname();

  return (
    <div className="flex items-center justify-between">
      <Link
        href="/tech"
        className={`flex items-center gap-2.5 transition-opacity ${
          pathname === "/tech" ? "pointer-events-none" : "hover:opacity-70"
        }`}
      >
        <div className="w-5 h-5 bg-black" />
        <span className="text-xl font-black tracking-tight">W.S. Gong</span>
      </Link>
      <nav className="flex gap-8 items-center">
        <Link
          href="/resume"
          className={`text-sm font-semibold transition-opacity ${
            pathname === "/resume"
              ? "underline underline-offset-2 pointer-events-none"
              : "hover:opacity-70"
          }`}
        >
          Resume
        </Link>
        <Link
          href="/contact"
          className={`transition-opacity ${
            pathname === "/contact"
              ? "opacity-40 pointer-events-none"
              : "hover:opacity-70"
          }`}
          aria-label="Contact"
        >
          <EmailIcon />
        </Link>
      </nav>
    </div>
  );
}
