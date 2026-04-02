import type { Metadata } from "next";
import Link from "next/link";
import { getSubstackPosts } from "@/lib/substack";

export const metadata: Metadata = {
  title: "Narratives. Code.",
  description:
    "Writing and code by W.S. Gong. Fiction, AI integrations, and developer tools.",
  openGraph: {
    title: "Narratives. Code. — W.S. Gong",
    description:
      "Writing and code by W.S. Gong. Fiction, AI integrations, and developer tools.",
  },
};

type Tag = "AI" | "Writing" | "MCP" | "Design" | "Web" | "Fiction" | "Editing";

interface Project {
  href?: string;
  externalHref?: string;
  title: string;
  description: string;
  detail?: string;
  tags: Tag[];
}

const writingProjects: Project[] = [
  {
    title: "Novel in Progress",
    description:
      "A novel about runaway kids in 1980s San Francisco — street life, chosen family, and the myths kids tell themselves to survive.",
    tags: ["Fiction"],
  },
  {
    externalHref: "https://www.14hills.net",
    title: "14 Hills",
    description:
      "Published fiction in the literary magazine of San Francisco State University's Creative Writing Department.",
    tags: ["Fiction"],
  },
  {
    externalHref: "https://therumpus.net",
    title: "The Rumpus",
    description:
      "Fiction editor. Reading submissions, shaping stories, and championing emerging voices.",
    tags: ["Editing"],
  },
];

const codeProjects: {
  href: string;
  title: string;
  description: string;
  stack: string[];
  tags: Tag[];
}[] = [
  {
    href: "/narratives-code/paperless-mcp",
    title: "Paperless MCP Server",
    description:
      "A Model Context Protocol server that connects Claude to Paperless-ngx document management. Exposes document search, tagging, and metadata operations as MCP tools.",
    stack: ["TypeScript", "MCP SDK", "Express"],
    tags: ["AI", "MCP"],
  },
  {
    href: "/narratives-code/submission-cli",
    title: "Submission CLI",
    description:
      "A command-line tool for fiction writers. Formats manuscripts to Shunn standard, generates cover letters with Claude, and manages a submission queue.",
    stack: ["TypeScript", "Anthropic SDK", "PDFKit"],
    tags: ["AI", "Writing"],
  },
  {
    href: "/narratives-code/writer-utilities",
    title: "Writer Utilities",
    description:
      "A growing collection of scripts and small apps for fiction writers — including a Google Docs to Scrivener converter and the submission CLI.",
    stack: ["TypeScript", "Python", "Node.js"],
    tags: ["Writing"],
  },
  {
    href: "/narratives-code/resume-generator",
    title: "Resume Generator",
    description:
      "Interactive resume editor with profile management and PDF export.",
    stack: ["Next.js", "React", "PDFKit"],
    tags: ["Web"],
  },
  {
    href: "/narratives-code/die-neue-grafik",
    title: "Die Neue Grafik",
    description:
      "A study in Swiss International Typographic Style — Bauhaus, modernism, and grid-based design.",
    stack: ["Next.js", "React", "Tailwind CSS"],
    tags: ["Design"],
  },
  {
    href: "/narratives-code/contact-form",
    title: "Contact Form",
    description:
      "Reactive contact form with real-time typography scaling and drag-and-drop attachments.",
    stack: ["Next.js", "React", "Server Actions"],
    tags: ["Web", "Design"],
  },
];

export default async function NarrativesCode() {
  const posts = await getSubstackPosts("highschoolsmokers");

  return (
    <div className="space-y-0">
      <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
        <h2 className="text-xl md:text-2xl font-black leading-tight">
          Narratives
        </h2>
        <ul className="divide-y divide-neutral-200 border-t border-neutral-200">
          {writingProjects.map((p) => {
            const inner = (
              <>
                <span className="text-sm font-semibold">{p.title}</span>
                <span className="text-sm block mt-1 leading-relaxed">
                  {p.description}
                </span>
                <span className="text-xs mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-neutral-500">
                  {p.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block border border-neutral-400 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                    >
                      {tag}
                    </span>
                  ))}
                </span>
              </>
            );
            return (
              <li key={p.title} className="py-6">
                {p.externalHref ? (
                  <a
                    href={p.externalHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block hover:opacity-80 transition-opacity"
                  >
                    {inner}
                  </a>
                ) : p.href ? (
                  <Link
                    href={p.href}
                    className="block hover:opacity-80 transition-opacity"
                  >
                    {inner}
                  </Link>
                ) : (
                  <div>{inner}</div>
                )}
              </li>
            );
          })}
          {posts.map((post) => (
            <li key={post.id} className="py-6">
              <a
                href={post.canonical_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:opacity-80 transition-opacity"
              >
                <span className="text-sm font-semibold">{post.title}</span>
                {post.subtitle && (
                  <span className="text-sm block mt-1 leading-relaxed">
                    {post.subtitle}
                  </span>
                )}
                <span className="text-xs mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-neutral-500">
                  <span>
                    {new Date(post.post_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                    })}
                    {" · Substack"}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

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
                <span className="text-xs mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-neutral-500">
                  <span>{p.stack.join(" · ")}</span>
                  {p.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block border border-neutral-400 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                    >
                      {tag}
                    </span>
                  ))}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
