import { SUBSTACK_BASE_URL } from "@/lib/substack";
import ThemeToggle from "./ThemeToggle";

const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/colophon", label: "Colophon" },
  { href: "/terms", label: "Terms" },
  { href: "/links", label: "Links" },
];

export default function PageShell({
  header,
  children,
}: {
  header: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="swiss-container">
      <a href="#main" className="skip-to-content">
        Skip to content
      </a>
      <header className="site-header">{header}</header>
      <main id="main" className="pb-24">
        {children}
      </main>
      <footer className="site-footer swiss-grid">
        <div className="col-span-12 md:col-span-4 text-sm">
          © {new Date().getFullYear()} W.S. Gong
        </div>
        <div className="col-span-12 md:col-span-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          {footerLinks.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
          <a
            href={`${SUBSTACK_BASE_URL}/subscribe`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Subscribe
          </a>
          <span className="md:ml-auto">
            <ThemeToggle />
          </span>
        </div>
      </footer>
    </div>
  );
}
