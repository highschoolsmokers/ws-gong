import type { Metadata } from "next";
import Link from "next/link";
import { getSubstackPosts } from "@/lib/substack";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Writing and code by W.S. Gong. Fiction, AI integrations, and developer tools.",
  openGraph: {
    title: "Projects — W.S. Gong",
    description:
      "Writing and code by W.S. Gong. Fiction, AI integrations, and developer tools.",
  },
};

const codeProjects = [
  {
    href: "/projects/paperless-mcp",
    title: "Paperless MCP Server",
    description:
      "A Model Context Protocol server that connects Claude to Paperless-ngx document management. Exposes document search, tagging, and metadata operations as MCP tools.",
    stack: ["TypeScript", "MCP SDK", "Express"],
  },
  {
    href: "/projects/submission-cli",
    title: "Submission CLI",
    description:
      "A command-line tool for fiction writers. Formats manuscripts to Shunn standard, generates cover letters with Claude, and manages a submission queue.",
    stack: ["TypeScript", "Anthropic SDK", "PDFKit"],
  },
  {
    href: "/projects/writer-utilities",
    title: "Writer Utilities",
    description:
      "A growing collection of scripts and small apps for fiction writers — including a Google Docs to Scrivener converter and the submission CLI.",
    stack: ["TypeScript", "Python", "Node.js"],
  },
  {
    href: "/projects/resume-generator",
    title: "Resume Generator",
    description:
      "Interactive resume editor with profile management and PDF export.",
    stack: ["Next.js", "React", "PDFKit"],
  },
  {
    href: "/projects/die-neue-grafik",
    title: "Die Neue Grafik",
    description:
      "A study in Swiss International Typographic Style — Bauhaus, modernism, and grid-based design.",
    stack: ["Next.js", "React", "Tailwind CSS"],
  },
  {
    href: "/projects/contact-form",
    title: "Contact Form",
    description:
      "Reactive contact form with real-time typography scaling and drag-and-drop attachments.",
    stack: ["Next.js", "React", "Server Actions"],
  },
];

export default async function Projects() {
  const posts = await getSubstackPosts("highschoolsmokers");

  return (
    <div className="space-y-0">
      <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
        <h2 className="text-xl md:text-2xl font-black leading-tight">Code</h2>
        <ul className="divide-y divide-neutral-200 border-t border-neutral-200">
          {codeProjects.map((p) => (
            <li key={p.href} className="py-6">
              <Link
                href={p.href}
                className="group block hover:opacity-80 transition-opacity"
              >
                <span className="text-sm font-semibold">{p.title}</span>
                <span className="text-sm block mt-1 leading-relaxed">
                  {p.description}
                </span>
                <span className="text-xs mt-2 block text-neutral-500">
                  {p.stack.join(" · ")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
        <h2 className="text-xl md:text-2xl font-black leading-tight">
          Writing
        </h2>
        <div>
          <h3 className="text-sm font-semibold mb-4">Substack</h3>
          {posts.length === 0 ? (
            <p className="text-sm">Coming soon.</p>
          ) : (
            <ul className="divide-y divide-neutral-200 border-t border-neutral-200">
              {posts.map((post) => (
                <li key={post.id}>
                  <a
                    href={post.canonical_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="grid grid-cols-[48px_1fr] gap-x-10 py-4 hover:opacity-70 transition-opacity"
                  >
                    <span className="text-sm tabular-nums">
                      {new Date(post.post_date).getFullYear()}
                    </span>
                    <div>
                      <span className="text-sm font-semibold">
                        {post.title}
                      </span>
                      {post.subtitle && (
                        <span className="text-sm block mt-0.5">
                          {post.subtitle}
                        </span>
                      )}
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
