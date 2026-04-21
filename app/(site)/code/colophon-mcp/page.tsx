import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Colophon",
  description:
    "A book search engine and MCP server. Search across Open Library and Google Books from Claude Code or a web browser.",
  openGraph: {
    title: "Colophon — W.S. Gong",
    description:
      "A book search engine and MCP server. Search across Open Library and Google Books from Claude Code or a web browser.",
  },
};

export default function ColophonMcp() {
  return (
    <div className="space-y-0">
      <h1 className="swiss-display text-[2.5rem] md:text-[3.5rem] pb-12">
        Colophon
      </h1>
      <section className="swiss-grid swiss-rule pt-6 pb-12">
        <h2 className="swiss-label">Overview</h2>
        <div className="space-y-4 text-sm leading-relaxed">
          <p>
            A book search engine and{" "}
            <a
              href="https://modelcontextprotocol.io"
              target="_blank"
              rel="noopener noreferrer"
              className=" font-medium"
            >
              Model Context Protocol
            </a>{" "}
            server built from a single codebase with two entry points. Search
            across Open Library and Google Books, compare prices on AbeBooks and
            eBay, check library lending availability, and find ebooks — from
            Claude Code or a web browser.
          </p>
          <p>
            The MCP server exposes tools for book search, author lookup,
            retailer pricing, and library/ebook availability over stdio
            transport. The web app serves the same functionality through a
            browser UI with smart search, author pages, book detail views,
            reading lists, and dark mode. Both entry points share the same core
            search and aggregation logic.
          </p>
        </div>
      </section>

      <section className="swiss-grid swiss-rule pt-6 pb-12">
        <h2 className="swiss-label">Dual Interface</h2>
        <div className="space-y-4 text-sm leading-relaxed">
          <ul className="space-y-2">
            <li>
              <span className="font-medium">MCP Server:</span> Runs over stdio
              transport for use with Claude Code. Exposes tools for book search,
              author bibliography, retailer pricing, library lending status, and
              ebook availability.
            </li>
            <li>
              <span className="font-medium">Web App:</span> Express-based
              browser UI with smart search (auto-detects ISBN, author, or
              title), author pages with bios and bibliographies, book detail
              pages with edition comparison, price comparison across retailers,
              and a local reading list.
            </li>
            <li>
              <span className="font-medium">Docker:</span> Two Dockerfiles — one
              for the web UI, one for the MCP server. The MCP container runs
              with <code className="text-xs">docker run -i</code> for stdio
              transport and plugs directly into Claude Code config.
            </li>
          </ul>
        </div>
      </section>

      <section className="swiss-grid swiss-rule pt-6 pb-12">
        <h2 className="swiss-label">Features</h2>
        <div className="space-y-4 text-sm leading-relaxed">
          <ul className="space-y-2">
            <li>
              <span className="font-medium">Price comparison:</span> AbeBooks
              new/used prices, links to Amazon, Bookshop.org, BookFinder, eBay,
              ThriftBooks
            </li>
            <li>
              <span className="font-medium">Library and ebook lookup:</span>{" "}
              Open Library/Internet Archive lending status, Google Play Books
              search
            </li>
            <li>
              <span className="font-medium">Author pages:</span> Photo, bio from
              Wikipedia, dates, bibliography with cover thumbnails
            </li>
            <li>
              <span className="font-medium">Performance:</span> Circuit breaker
              for failing upstream services, in-memory TTL cache, fuzzy dedup
              across sources, gzip compression
            </li>
            <li>
              <span className="font-medium">PWA:</span> Installable, caches
              cover images offline via service worker
            </li>
          </ul>
        </div>
      </section>

      <section className="swiss-grid swiss-rule pt-6 pb-12">
        <h2 className="swiss-label">Stack</h2>
        <div className="text-sm leading-relaxed space-y-2">
          <p>TypeScript · MCP SDK · Express 5 · Zod · Pino · Vitest · Docker</p>
          <p>
            <a
              href="https://github.com/highschoolsmokers/colophon-mcp"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium"
            >
              View on GitHub →
            </a>
          </p>
        </div>
      </section>

      <section className="swiss-grid swiss-rule pt-6 pb-12">
        <div />
        <Link href="/code" className="text-sm font-medium">
          ← All projects
        </Link>
      </section>
    </div>
  );
}
