import ThemeToggle from "@/app/components/ThemeToggle";
import { ext } from "@/app/components/ui";
import { slushpileUrl } from "@/lib/site/env";
import { SUBSTACK_BASE_URL } from "@/lib/substack";
import Nav from "./Nav";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="swiss-container">
      <a href="#main" className="skip-to-content">
        Skip to content
      </a>
      <header className="site-header">
        <Nav slushpile={slushpileUrl !== null} />
      </header>
      <main id="main" className="pb-24">
        {children}
      </main>
      <footer className="site-footer swiss-grid text-sm">
        <span className="col-span-12 md:col-span-4">
          © {new Date().getFullYear()} W.S. Gong
        </span>
        <div className="col-span-12 flex flex-wrap items-center gap-x-5 gap-y-2 md:col-span-8">
          <a href="/about">About</a>
          <a href="/colophon">Colophon</a>
          <a href="/terms">Terms</a>
          <a href="/links">Links</a>
          <a href={`${SUBSTACK_BASE_URL}/subscribe`} {...ext}>
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
