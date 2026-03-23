"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/about", label: "About" },
  { href: "/writing", label: "Writing" },
  { href: "/contact", label: "Contact" },
];

const titles: Record<string, React.ReactNode> = {
  "/": (
    <>
      Writer/
      <br />
      Editor,
      <br />
      Educator.
    </>
  ),
  "/about": "About",
  "/writing": "Writing",
  "/contact": "Contact",
  "/tech": "Tech",
  "/tech/resume": "Resume",
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
      <nav className="flex flex-col items-start">
        <Link
          href="/"
          className={`flex items-center gap-2.5 transition-opacity mb-4 ${
            pathname === "/" ? "pointer-events-none" : "hover:opacity-70"
          }`}
        >
          <div className="w-5 h-5 bg-black" />
          <span className="text-xl font-black tracking-tight">W.S. Gong</span>
        </Link>
        <ul className="text-sm font-semibold leading-loose">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`transition-opacity ${
                  pathname === href
                    ? "underline underline-offset-2 pointer-events-none"
                    : "hover:opacity-70"
                }`}
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
