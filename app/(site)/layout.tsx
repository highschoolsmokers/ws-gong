import ThemeToggle from "@/app/components/ThemeToggle";
import { ext } from "@/app/components/ui";
import { orderedBooks } from "@/lib/books";
import { slushpileUrl } from "@/lib/site/env";
import { SUBSCRIBE_URL } from "@/lib/substack";
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
        <Nav
          slushpile={slushpileUrl !== null}
          reading={orderedBooks.length > 0}
        />
      </header>
      <main id="main" className="pb-24">
        {children}
      </main>
      <footer className="site-footer swiss-grid text-sm">
        <span className="col-span-12 md:col-span-4">
          © {new Date().getFullYear()} W.S. Gong
        </span>
        <ul className="col-span-12 space-y-1 md:col-span-4">
          <li>
            <a href="/colophon">Colophon</a>
          </li>
          <li>
            <a href="/terms">Terms</a>
          </li>
          <li>
            <a href={SUBSCRIBE_URL} {...ext}>
              Subscribe
            </a>
          </li>
        </ul>
        <div className="col-span-12 md:col-span-2 md:col-start-11">
          <ThemeToggle />
        </div>
      </footer>
    </div>
  );
}
