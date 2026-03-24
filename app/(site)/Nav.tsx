"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const siteLinks = [
  { href: "/about", label: "About" },
  { href: "/writing", label: "Writing" },
  { href: "/contact", label: "Contact" },
];

const techLinks = [
  { href: "/resume", label: "Resume" },
  { href: "/portfolio", label: "Portfolio" },
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
  "/tech": (
    <>
      Technical
      <br />
      Writer,
      <br />
      AI Documentation
      <br />
      Engineer
    </>
  ),
  "/tech/resume": "Resume",
  "/tech/portfolio": "Portfolio",
};

function NavLink({
  href,
  className,
  children,
  useAnchor,
}: {
  href: string;
  className: string;
  children: React.ReactNode;
  useAnchor: boolean;
}) {
  if (useAnchor) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export default function Nav() {
  const pathname = usePathname();
  const isTechHost =
    typeof window !== "undefined" &&
    window.location.hostname.startsWith("tech.");
  const isTech = isTechHost || pathname.startsWith("/tech");
  const links = isTech ? techLinks : siteLinks;

  // On tech subdomain, usePathname() returns the visible URL (e.g. "/")
  // not the rewritten path ("/tech"), so map for title lookup
  const techPathname = isTechHost ? `/tech${pathname}` : pathname;
  const title = titles[techPathname] ?? titles[pathname];

  const isActive = (href: string) => {
    if (isTechHost) return pathname === href;
    if (isTech) return pathname === `/tech${href}` || pathname === href;
    return pathname === href;
  };

  const homeHref = "/";
  const isHome = isTechHost
    ? pathname === "/"
    : isTech
      ? pathname === "/tech"
      : pathname === "/";

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
            <NavLink
              href={homeHref}
              useAnchor={isTechHost}
              className={`transition-opacity ${
                isHome ? "pointer-events-none" : "hover:opacity-70"
              }`}
            >
              W.S. Gong
            </NavLink>
          </li>
          {links.map((link) => {
            const linkHref =
              isTech && !isTechHost ? `/tech${link.href}` : link.href;
            return (
              <li key={link.href}>
                <NavLink
                  href={linkHref}
                  useAnchor={isTechHost}
                  className={`transition-opacity ${
                    isActive(link.href)
                      ? "underline underline-offset-2 pointer-events-none"
                      : "hover:opacity-70"
                  }`}
                >
                  {link.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
