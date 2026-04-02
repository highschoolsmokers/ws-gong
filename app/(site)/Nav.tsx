"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/narratives-code", label: "Narratives. Code." },
  { href: "/about", label: "About" },
];

const titles: Record<string, React.ReactNode> = {
  "/": (
    <>
      W.S.
      <br />
      Gong
    </>
  ),
  "/narratives-code": (
    <>
      Narratives.
      <br />
      Code.
    </>
  ),
  "/narratives-code/paperless-mcp": "Paperless MCP",
  "/narratives-code/submission-cli": "Submission CLI",
  "/narratives-code/writer-utilities": "Writer Utilities",
  "/narratives-code/resume-generator": "Resume Generator",
  "/narratives-code/die-neue-grafik": "Die Neue Grafik",
  "/narratives-code/contact-form": "Contact Form",
  "/about": "About",
  "/contact": "Contact",
  "/links": "Links",
  "/colophon": "Colophon",
  "/terms": "Terms",
};

export default function Nav() {
  const pathname = usePathname();
  const title =
    titles[pathname] ??
    Object.entries(titles).find(
      ([k]) => k !== "/" && pathname.startsWith(k),
    )?.[1];

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
        {pathname !== "/" && (
          <Link
            href="/"
            className="transition-opacity hover:opacity-70"
          >
            <span className="text-xl font-black tracking-tight">
              W.S. Gong
            </span>
          </Link>
        )}
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
