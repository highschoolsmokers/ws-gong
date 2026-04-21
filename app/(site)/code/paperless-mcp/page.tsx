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
      <h1 className="swiss-display text-[2.5rem] md:text-[3.5rem] pb-12">
        Paperless MCP Server
      </h1>
      <section className="swiss-grid swiss-rule pt-6 pb-12">
        <h2 className="swiss-label">Overview</h2>
        <div className="space-y-4 text-sm leading-relaxed">
          <p>
            A stateless{" "}
            <a
              href="https://modelcontextprotocol.io"
              target="_blank"
              rel="noopener noreferrer"
              className=" font-medium"
            >
              Model Context Protocol
            </a>{" "}
            server that gives Claude direct access to a{" "}
            <a
              href="https://docs.paperless-ngx.com"
              target="_blank"
              rel="noopener noreferrer"
              className=" font-medium"
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

      <section className="swiss-grid swiss-rule pt-6 pb-12">
        <h2 className="swiss-label">Architecture</h2>
        <div className="space-y-4 text-sm leading-relaxed">
          <ul className="space-y-2">
            <li>
              <span className="font-medium">Transport:</span>{" "}
              StreamableHTTPServerTransport — stateless, one transport per
              request
            </li>
            <li>
              <span className="font-medium">Tools:</span> Document search and
              retrieval, tag CRUD, metadata and correspondent queries
            </li>
            <li>
              <span className="font-medium">Client:</span> Typed wrapper around
              the Paperless-ngx REST API with token authentication
            </li>
            <li>
              <span className="font-medium">Deployment:</span> Designed to run
              alongside Paperless-ngx in Docker Compose
            </li>
          </ul>
        </div>
      </section>

      <section className="swiss-grid swiss-rule pt-6 pb-12">
        <h2 className="swiss-label">Stack</h2>
        <div className="text-sm leading-relaxed space-y-2">
          <p>TypeScript · MCP SDK · Express 5 · Paperless-ngx API</p>
          <p>
            <a
              href="https://github.com/highschoolsmokers/paperless-mcp"
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
