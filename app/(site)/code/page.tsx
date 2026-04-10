import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Code",
  description:
    "Code and design projects by W.S. Gong. AI integrations, developer tools, and web design.",
  openGraph: {
    title: "Code — W.S. Gong",
    description:
      "Code and design projects by W.S. Gong. AI integrations, developer tools, and web design.",
  },
};

type Tag = "AI" | "Writing" | "MCP" | "Design" | "Web";

const docEngineeringProjects: {
  href: string;
  title: string;
  description: string;
  stack: string[];
  tags: Tag[];
}[] = [
  {
    href: "/fabulosa-books/",
    title: "The Fabulosa Books Scheduler: Multi-Agent Orchestration",
    description:
      "A tutorial walking through a multi-agent system that coordinates book scheduling across inventory, calendar, and notification services.",
    stack: ["Python", "Anthropic SDK", "LangGraph"],
    tags: ["AI"],
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
    href: "/code/colophon-mcp",
    title: "Colophon",
    description:
      "A book search engine and MCP server. Searches across Open Library and Google Books, compares prices, checks library availability, and finds ebooks — from Claude Code or a web browser. Dockerized for both entry points.",
    stack: ["TypeScript", "MCP SDK", "Express"],
    tags: ["AI", "MCP", "Web"],
  },
  {
    href: "/code/paperless-mcp",
    title: "Paperless MCP Server",
    description:
      "A Model Context Protocol server that connects Claude to Paperless-ngx document management. Exposes document search, tagging, and metadata operations as MCP tools.",
    stack: ["TypeScript", "MCP SDK", "Express"],
    tags: ["AI", "MCP"],
  },
  {
    href: "/code/submission-cli",
    title: "Submission CLI",
    description:
      "A command-line tool for fiction writers. Formats manuscripts to Shunn standard, generates cover letters with Claude, and manages a submission queue.",
    stack: ["TypeScript", "Anthropic SDK", "PDFKit"],
    tags: ["AI", "Writing"],
  },
  {
    href: "/code/writer-utilities",
    title: "Writer Utilities",
    description:
      "A growing collection of scripts and small apps for fiction writers — including a Google Docs to Scrivener converter and the submission CLI.",
    stack: ["TypeScript", "Python", "Node.js"],
    tags: ["Writing"],
  },
  {
    href: "/code/resume-generator",
    title: "Resume Generator",
    description:
      "Interactive resume editor with profile management and PDF export.",
    stack: ["Next.js", "React", "PDFKit"],
    tags: ["Web"],
  },
  {
    href: "/code/die-neue-grafik",
    title: "Die Neue Grafik",
    description:
      "A study in Swiss International Typographic Style — Bauhaus, modernism, and grid-based design.",
    stack: ["Next.js", "React", "Tailwind CSS"],
    tags: ["Design"],
  },
  {
    href: "/code/contact-form",
    title: "Contact Form",
    description:
      "Reactive contact form with real-time typography scaling and drag-and-drop attachments.",
    stack: ["Next.js", "React", "Server Actions"],
    tags: ["Web", "Design"],
  },
];

const allProjects = [...docEngineeringProjects, ...codeProjects];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Code Projects by W.S. Gong",
  itemListElement: allProjects.map((p, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "CreativeWork",
      name: p.title,
      description: p.description,
      url: `https://ws-gong.com${p.href}`,
      author: { "@type": "Person", name: "W.S. Gong" },
      keywords: [...p.stack, ...p.tags],
    },
  })),
};

export default function Code() {
  return (
    <div className="space-y-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
        <h2 className="text-xl md:text-2xl font-black leading-tight">
          Documentation Engineering
        </h2>
        <ul className="divide-y divide-neutral-200 border-t border-neutral-200">
          {docEngineeringProjects.map((p) => (
            <li key={p.href} className="py-6">
              <Link
                href={p.href}
                className="group block hover:opacity-70 transition-opacity"
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
                      className="inline-block border border-neutral-400 rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
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

      <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
        <h2 className="text-xl md:text-2xl font-black leading-tight">Code</h2>
        <ul className="divide-y divide-neutral-200 border-t border-neutral-200">
          {codeProjects.map((p) => (
            <li key={p.href} className="py-6">
              <Link
                href={p.href}
                className="group block hover:opacity-70 transition-opacity"
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
                      className="inline-block border border-neutral-400 rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
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
