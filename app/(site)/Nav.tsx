"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const siteLinks = [
  { href: "/about", label: "About" },
  { href: "/writing", label: "Writing" },
  { href: "/contact", label: "Contact" },
];

const techLinks = [
  { href: "/resume", label: "Resume", techPrefixed: true },
  { href: "/portfolio", label: "Portfolio", techPrefixed: true },
  { href: "/contact", label: "Contact", techPrefixed: false },
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
  "/tech": (
    <>
      Technical
      <br />
      Writer &amp;
      <br />
      AI Documentation
      <br />
      Engineer
    </>
  ),
  "/tech/resume": "Resume",
  "/tech/portfolio": "Portfolio",
};

export default function Nav() {
  const pathname = usePathname();
  const isTech = pathname.startsWith("/tech");
  const links = isTech ? techLinks : siteLinks;
  const title = titles[pathname];

  // On tech subdomain, links use paths without /tech prefix (middleware rewrites)
  // but pathname includes /tech, so we need to match accordingly
  const isActive = (href: string) => {
    if (isTech) return pathname === `/tech${href}` || pathname === href;
    return pathname === href;
  };

  const isTechHost =
    typeof window !== "undefined" &&
    window.location.hostname.startsWith("tech.");
  const homeHref = isTechHost ? "/" : isTech ? "/tech" : "/";
  const isHome = isTech ? pathname === "/tech" : pathname === "/";

  return (
    <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8 md:gap-12">
      {title ? (
        <h1 className="text-6xl md:text-7xl lg:text-[5.5rem] font-black leading-[0.95] tracking-tight">
          {title}
        </h1>
      ) : (
        <div />
      )}
      <nav className="text-xl font-black tracking-tight leading-tight">
        <ul>
          <li>
            <Link
              href={homeHref}
              className={`transition-opacity ${
                isHome ? "pointer-events-none" : "hover:opacity-70"
              }`}
            >
              W.S. Gong
            </Link>
          </li>
          {links.map((link) => {
            const techPrefixed = "techPrefixed" in link ? link.techPrefixed : false;
            const linkHref = isTech && !isTechHost && techPrefixed ? `/tech${link.href}` : link.href;
            return (
            <li key={link.href}>
              <Link
                href={linkHref}
                className={`transition-opacity ${
                  isActive(link.href)
                    ? "underline underline-offset-2 pointer-events-none"
                    : "hover:opacity-70"
                }`}
              >
                {link.label}
              </Link>
            </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
