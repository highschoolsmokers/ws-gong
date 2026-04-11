import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Code",
  description:
    "Portfolio by W.S. Gong — AI engineering, MCP servers, developer tools, and full-stack web applications.",
  openGraph: {
    title: "Code — W.S. Gong",
    description:
      "Portfolio by W.S. Gong — AI engineering, MCP servers, developer tools, and full-stack web applications.",
  },
};

type Tag = "AI" | "Writing" | "MCP" | "Design" | "Web";

type Project = {
  href: string;
  title: string;
  description: string;
  stack: string[];
  tags: Tag[];
};

type Category = {
  title: string;
  subtitle: string;
  projects: Project[];
};

const categories: Category[] = [
  {
    title: "AI Engineering",
    subtitle: "MCP servers, multi-agent orchestration, and LLM-powered tools",
    projects: [
      {
        href: "/code/colophon-mcp",
        title: "Colophon",
        description:
          "Dual-interface book search engine — an MCP server for Claude Code and a standalone Express web app. Aggregates Open Library, Google Books, and price comparison sources. Dockerized for both entry points.",
        stack: ["TypeScript", "MCP SDK", "Express", "Docker"],
        tags: ["AI", "MCP", "Web"],
      },
      {
        href: "/code/paperless-mcp",
        title: "Paperless MCP Server",
        description:
          "Stateless MCP server connecting Claude to Paperless-ngx document management. Exposes document search, tagging, and metadata operations as tools with typed API wrappers.",
        stack: ["TypeScript", "MCP SDK", "Express"],
        tags: ["AI", "MCP"],
      },
      {
        href: "https://github.com/highschoolsmokers/lit-verity-mcp",
        title: "Lit Verity",
        description:
          "MCP server that grounds academic literary criticism in verifiable sources. Cross-checks claims against an archive to prevent hallucinated citations, fabricated quotations, and distorted arguments.",
        stack: ["TypeScript", "MCP SDK", "Zod"],
        tags: ["AI", "MCP", "Writing"],
      },
      {
        href: "https://github.com/highschoolsmokers/historical-research-agent",
        title: "Historical Research Agent",
        description:
          "Claude Code plugin: autonomous historical research agent for fiction writers. Surfaces people, cultures, places, and events from newspaper archives and primary sources.",
        stack: ["Claude Code", "Anthropic SDK"],
        tags: ["AI", "Writing"],
      },
      {
        href: "https://github.com/highschoolsmokers/lit-research-plugin",
        title: "Literary Research Plugin",
        description:
          "Claude Code plugin: literary research agent that retrieves verified quotations from archives, cross-checks citations, and performs craft and theory analysis for scholars working with primary texts.",
        stack: ["Claude Code", "Anthropic SDK"],
        tags: ["AI", "Writing"],
      },
      {
        href: "/fabulosa-books/",
        title: "Multi-Agent Orchestration Tutorial",
        description:
          "A technical walkthrough of a multi-agent system that coordinates book scheduling across inventory, calendar, and notification services.",
        stack: ["Python", "Anthropic SDK", "LangGraph"],
        tags: ["AI"],
      },
    ],
  },
  {
    title: "Developer Tools",
    subtitle: "CLI applications, automation scripts, and monorepo tooling",
    projects: [
      {
        href: "/code/submission-cli",
        title: "Submission CLI",
        description:
          "Command-line tool that formats manuscripts to Shunn standard, generates cover letters via the Anthropic API, and manages a submission queue with persistent state.",
        stack: ["TypeScript", "Anthropic SDK", "PDFKit", "Node.js"],
        tags: ["AI", "Writing"],
      },
      {
        href: "https://github.com/highschoolsmokers/submission-watcher-agent",
        title: "Submission Watcher Agent",
        description:
          "Claude Code plugin that monitors literary magazine submission windows and emails alerts when they open. Built for writers who miss brief open-call periods.",
        stack: ["JavaScript", "Claude Code", "SMTP"],
        tags: ["AI", "Writing"],
      },
      {
        href: "/code/writer-utilities",
        title: "Writer Utilities",
        description:
          "Polyglot monorepo of scripts and small apps — including a Google Docs to Scrivener converter and CLI tools for manuscript management.",
        stack: ["TypeScript", "Python", "Google Docs API"],
        tags: ["Writing"],
      },
    ],
  },
  {
    title: "Web & Design",
    subtitle: "Full-stack React applications and design engineering",
    projects: [
      {
        href: "https://github.com/highschoolsmokers/ws-gong",
        title: "ws-gong.com",
        description:
          "This portfolio site. Next.js 16 App Router, Tailwind, Neon Postgres, and a cron-driven AI pipeline — weekly source discovery via Claude's web search tool plus throttled residency extraction on Vercel Functions.",
        stack: ["Next.js", "TypeScript", "Neon", "Anthropic SDK"],
        tags: ["Web", "AI"],
      },
      {
        href: "/code/resume-generator",
        title: "Resume Generator",
        description:
          "Interactive resume editor with multi-profile management, live preview, and server-side PDF generation.",
        stack: ["Next.js", "React", "PDFKit"],
        tags: ["Web"],
      },
      {
        href: "/code/contact-form",
        title: "Contact Form",
        description:
          "Reactive contact form with real-time typography scaling, drag-and-drop file attachments, and honeypot spam prevention.",
        stack: ["Next.js", "React", "Server Actions"],
        tags: ["Web", "Design"],
      },
      {
        href: "/code/die-neue-grafik",
        title: "Die Neue Grafik",
        description:
          "A design study of Swiss International Typographic Style — Bauhaus grid systems, modernist typography, and responsive layout.",
        stack: ["Next.js", "Tailwind CSS"],
        tags: ["Design"],
      },
    ],
  },
];

const allProjects = categories.flatMap((c) => c.projects);

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
      url: p.href.startsWith("http") ? p.href : `https://ws-gong.com${p.href}`,
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
      {categories.map((category) => (
        <section
          key={category.title}
          className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10"
        >
          <div>
            <h2 className="text-xl md:text-2xl font-black leading-tight">
              {category.title}
            </h2>
            <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
              {category.subtitle}
            </p>
          </div>
          <ul className="divide-y divide-neutral-200 border-t border-neutral-200">
            {category.projects.map((p) => {
              const isExternal = p.href.startsWith("http");
              return (
                <li key={p.href} className="py-6">
                  <Link
                    href={p.href}
                    {...(isExternal && {
                      target: "_blank",
                      rel: "noopener noreferrer",
                    })}
                    className="group block hover:opacity-70 transition-opacity"
                  >
                    <span className="text-sm font-semibold">
                      {p.title}
                      {isExternal && (
                        <span
                          aria-hidden="true"
                          className="ml-1 text-neutral-400"
                        >
                          ↗
                        </span>
                      )}
                    </span>
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
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
