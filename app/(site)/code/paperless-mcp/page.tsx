import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Paperless MCP Server",
  description:
    "A Model Context Protocol server connecting Claude to Paperless-ngx document management.",
  openGraph: {
    title: "Paperless MCP Server — W.S. Gong",
    description:
      "A Model Context Protocol server connecting Claude to Paperless-ngx document management.",
  },
};

export default function PaperlessMcp() {
  return (
    <div className="space-y-0">
      <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight pb-8">
        Paperless MCP Server
      </h1>
      <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
        <h2 className="text-xl md:text-2xl font-black leading-tight">
          Overview
        </h2>
        <div className="space-y-4 text-sm leading-relaxed">
          <p>
            A stateless{" "}
            <a
              href="https://modelcontextprotocol.io"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-70 transition-opacity font-semibold"
            >
              Model Context Protocol
            </a>{" "}
            server that gives Claude direct access to a{" "}
            <a
              href="https://docs.paperless-ngx.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-70 transition-opacity font-semibold"
            >
              Paperless-ngx
            </a>{" "}
            instance. Instead of switching between a chat window and a document
            management UI, you ask Claude to find, tag, or inspect your
            documents and it does so through MCP tool calls.
          </p>
          <p>
            The server exposes three tool groups — document operations, tag
            management, and metadata queries — over a single HTTP endpoint. Each
            request spins up a fresh MCP transport and tears it down on close,
            keeping the server entirely stateless.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
        <h2 className="text-xl md:text-2xl font-black leading-tight">
          Architecture
        </h2>
        <div className="space-y-4 text-sm leading-relaxed">
          <ul className="space-y-2">
            <li>
              <span className="font-semibold">Transport:</span>{" "}
              StreamableHTTPServerTransport — stateless, one transport per
              request
            </li>
            <li>
              <span className="font-semibold">Tools:</span> Document search and
              retrieval, tag CRUD, metadata and correspondent queries
            </li>
            <li>
              <span className="font-semibold">Client:</span> Typed wrapper
              around the Paperless-ngx REST API with token authentication
            </li>
            <li>
              <span className="font-semibold">Deployment:</span> Designed to run
              alongside Paperless-ngx in Docker Compose
            </li>
          </ul>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
        <h2 className="text-xl md:text-2xl font-black leading-tight">Stack</h2>
        <div className="text-sm leading-relaxed space-y-2">
          <p>TypeScript · MCP SDK · Express 5 · Paperless-ngx API</p>
          <p>
            <a
              href="https://github.com/highschoolsmokers/paperless-mcp"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold hover:opacity-70 transition-opacity"
            >
              View on GitHub →
            </a>
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
        <div />
        <Link
          href="/code"
          className="text-sm font-semibold hover:opacity-70 transition-opacity"
        >
          ← All projects
        </Link>
      </section>
    </div>
  );
}
