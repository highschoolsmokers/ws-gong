import type { Metadata } from "next";
import Link from "next/link";
import PageTitle from "@/app/components/PageTitle";

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

type Tag = "AI" | "Writing" | "MCP" | "Design" | "Web" | "Tutorial";

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
        href: "/code/lit-verity-mcp",
        title: "Lit Verity",
        description:
          "MCP server that grounds academic literary criticism in verifiable sources. Cross-checks claims against an indexed corpus to prevent hallucinated citations, fabricated quotations, and distorted arguments.",
        stack: ["TypeScript", "MCP SDK", "Neon", "pgvector"],
        tags: ["AI", "MCP", "Writing"],
      },
      {
        href: "/code/historical-research-agent",
        title: "Historical Research Agent",
        description:
          "Claude Code plugin: autonomous historical research agent for fiction writers. Surfaces people, cultures, places, and events from newspaper archives and primary sources, with confidence scoring.",
        stack: ["Claude Code", "Anthropic SDK"],
        tags: ["AI", "Writing"],
      },
      {
        href: "/code/lit-research-plugin",
        title: "Literary Research Plugin",
        description:
          "Claude Code plugin: literary research agent that retrieves verified quotations from archives, cross-checks citations, and performs craft and theory analysis for scholars working with primary texts.",
        stack: ["Claude Code", "Anthropic SDK"],
        tags: ["AI", "Writing"],
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
        href: "/code/submission-watcher-agent",
        title: "Submission Watcher Agent",
        description:
          "Claude Code plugin and Vercel cron that monitors literary magazine submission windows on Submittable and emails alerts when they open. Built for writers who miss brief open-call periods.",
        stack: ["JavaScript", "Vercel Cron", "Upstash Redis", "Resend"],
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
        href: "/code/contact-form",
        title: "Contact Form",
        description:
          "Reactive contact form with real-time typography scaling, drag-and-drop file attachments, and honeypot spam prevention.",
        stack: ["Next.js", "React", "Server Actions"],
        tags: ["Web", "Design"],
      },
      {
        href: "https://workbench.ws-gong.com",
        title: "Swiss Design Workbench",
        description:
          "A working studio for design in the Swiss tradition — grid, type, and objectivity applied to web and print. Every piece reads from a single token system; vanilla HTML and hand-authored SVG with togglable grid and baseline overlays.",
        stack: ["Vanilla HTML/CSS", "Vite", "SVG"],
        tags: ["Design", "Web"],
      },
      {
        href: "/fabulosa-books/",
        title: "Fabulosa Books — Next.js on Vercel Tutorial",
        description:
          "A step-by-step tutorial for building and deploying Next.js applications on Vercel — an employee scheduler for a bookstore, with Neon Postgres, authentication, and server actions.",
        stack: ["Next.js", "Vercel", "Neon", "TypeScript"],
        tags: ["Tutorial", "Web"],
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
      url: p.href.startsWith("http")
        ? p.href
        : `https://www.ws-gong.com${p.href}`,
      author: { "@type": "Person", name: "W.S. Gong" },
      keywords: [...p.stack, ...p.tags],
    },
  })),
};

export default function Code() {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageTitle>Code</PageTitle>
      {categories.map((category, idx) => (
        <section
          key={category.title}
          className="swiss-grid swiss-rule pt-6 pb-12"
        >
          <div className="col-span-12 md:col-span-4 space-y-2">
            <span className="swiss-label block">
              {String(idx + 1).padStart(2, "0")} / {category.title}
            </span>
            <p className="text-xs text-neutral-500 leading-relaxed">
              {category.subtitle}
            </p>
          </div>
          <ul className="col-span-12 md:col-span-8 divide-y divide-neutral-200 border-t border-neutral-200">
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
                    className="block no-underline hover:no-underline"
                  >
                    <span className="block text-base font-medium leading-snug">
                      {p.title}
                      {isExternal && (
                        <span
                          aria-hidden="true"
                          className="ml-1 text-neutral-500"
                        >
                          ↗
                        </span>
                      )}
                    </span>
                    <span className="block mt-2 text-sm leading-relaxed">
                      {p.description}
                    </span>
                    <span className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[10px] uppercase tracking-[0.12em] text-neutral-500">
                      <span>{p.stack.join(" / ")}</span>
                      {p.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-block border border-current px-2 py-0.5 font-medium"
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
