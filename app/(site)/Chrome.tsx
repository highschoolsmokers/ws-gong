import ThemeToggle from "@/app/components/ThemeToggle";
import { ext, NewTab } from "@/app/components/ui";
import { orderedBooks } from "@/lib/books";
import { site } from "@/lib/site/content";
import { slushpileUrl } from "@/lib/site/env";
import { findLink } from "@/lib/site/schema";
import { SUBSCRIBE_URL } from "@/lib/substack";
import Nav from "./Nav";

const instagram = findLink(site.links, "Instagram");

// The site chrome: masthead, nav, footer. The layout wraps every page in it;
// the root 404 uses it directly and says so, since it renders outside the
// route tree the nav reads.
export default function Chrome({
  children,
  notFound = false,
}: {
  children: React.ReactNode;
  notFound?: boolean;
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
          notFound={notFound}
        />
      </header>
      <main id="main" className="pb-24">
        {children}
      </main>
      <footer className="site-footer swiss-grid text-sm">
        <span className="col-span-12 md:col-span-4">
          © {new Date().getFullYear()} W.S. Gong
        </span>
        <ul className="col-span-12 space-y-2 md:col-span-4">
          <li>
            <a href="/colophon">Colophon</a>
          </li>
          <li>
            <a href="/terms">Terms</a>
          </li>
          <li>
            <a href={SUBSCRIBE_URL} {...ext}>
              Substack
              <NewTab />
            </a>
          </li>
          {instagram && (
            <li>
              <a href={instagram.url} {...ext}>
                Instagram
                <NewTab />
              </a>
            </li>
          )}
        </ul>
        <div className="col-span-12 md:col-span-2 md:col-start-11">
          <ThemeToggle />
        </div>
      </footer>
    </div>
  );
}
