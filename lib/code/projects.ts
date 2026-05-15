export type Tag = "AI" | "Writing" | "MCP" | "Design" | "Web" | "Tutorial";

export type Project = {
  href: string;
  title: string;
  description: string;
  stack: string[];
  tags: Tag[];
  featured: boolean;
  addedAt: `${number}-${number}-${number}`;
};

export const projects: Project[] = [
  {
    href: "https://github.com/highschoolsmokers/colophon-mcp",
    title: "Colophon",
    description:
      "Dual-interface book search engine — an MCP server for Claude Code and a standalone Express web app. Aggregates Open Library, Google Books, and price comparison sources. Dockerized for both entry points.",
    stack: ["TypeScript", "MCP SDK", "Express", "Docker"],
    tags: ["AI", "MCP", "Web"],
    featured: true,
    addedAt: "2026-04-01",
  },
  {
    href: "https://github.com/highschoolsmokers/paperless-mcp",
    title: "Paperless MCP Server",
    description:
      "Stateless MCP server connecting Claude to Paperless-ngx document management. Exposes document search, tagging, and metadata operations as tools with typed API wrappers.",
    stack: ["TypeScript", "MCP SDK", "Express"],
    tags: ["AI", "MCP"],
    featured: false,
    addedAt: "2026-03-01",
  },
  {
    href: "https://github.com/highschoolsmokers/lit-verity-mcp",
    title: "Lit Verity",
    description:
      "MCP server that grounds academic literary criticism in verifiable sources. Cross-checks claims against an indexed corpus to prevent hallucinated citations, fabricated quotations, and distorted arguments.",
    stack: ["TypeScript", "MCP SDK", "Neon", "pgvector"],
    tags: ["AI", "MCP", "Writing"],
    featured: false,
    addedAt: "2026-02-01",
  },
  {
    href: "https://github.com/highschoolsmokers/historical-research-agent",
    title: "Historical Research Agent",
    description:
      "Claude Code plugin: autonomous historical research agent for fiction writers. Surfaces people, cultures, places, and events from newspaper archives and primary sources, with confidence scoring.",
    stack: ["Claude Code", "Anthropic SDK"],
    tags: ["AI", "Writing"],
    featured: true,
    addedAt: "2026-01-01",
  },
  {
    href: "https://github.com/highschoolsmokers/lit-research-plugin",
    title: "Literary Research Plugin",
    description:
      "Claude Code plugin: literary research agent that retrieves verified quotations from archives, cross-checks citations, and performs craft and theory analysis for scholars working with primary texts.",
    stack: ["Claude Code", "Anthropic SDK"],
    tags: ["AI", "Writing"],
    featured: false,
    addedAt: "2025-12-01",
  },
  {
    href: "https://github.com/highschoolsmokers/submission-cli",
    title: "Submission CLI",
    description:
      "Command-line tool that formats manuscripts to Shunn standard, generates cover letters via the Anthropic API, and manages a submission queue with persistent state.",
    stack: ["TypeScript", "Anthropic SDK", "PDFKit", "Node.js"],
    tags: ["AI", "Writing"],
    featured: true,
    addedAt: "2025-11-01",
  },
  {
    href: "https://github.com/highschoolsmokers/submission-watcher-agent",
    title: "Submission Watcher Agent",
    description:
      "Claude Code plugin and Vercel cron that monitors literary magazine submission windows on Submittable and emails alerts when they open. Built for writers who miss brief open-call periods.",
    stack: ["JavaScript", "Vercel Cron", "Upstash Redis", "Resend"],
    tags: ["AI", "Writing"],
    featured: false,
    addedAt: "2025-10-01",
  },
  {
    href: "https://github.com/highschoolsmokers/writer-utilities",
    title: "Writer Utilities",
    description:
      "Polyglot monorepo of scripts and small apps — including a Google Docs to Scrivener converter and CLI tools for manuscript management.",
    stack: ["TypeScript", "Python", "Google Docs API"],
    tags: ["Writing"],
    featured: false,
    addedAt: "2025-09-01",
  },
  {
    href: "https://github.com/highschoolsmokers/ws-gong",
    title: "ws-gong.com",
    description:
      "This portfolio site. Next.js 16 App Router, Tailwind, server components, RSS feed, and a Swiss-typography design system. Sentry, Vercel Analytics, Playwright across three browsers.",
    stack: ["Next.js", "TypeScript", "Tailwind"],
    tags: ["Web", "Design"],
    featured: false,
    addedAt: "2025-08-01",
  },
  {
    href: "https://github.com/highschoolsmokers/swiss-design-workbench",
    title: "Swiss Design Workbench",
    description:
      "A working studio for design in the Swiss tradition — grid, type, and objectivity applied to web and print. Every piece reads from a single token system; vanilla HTML and hand-authored SVG with togglable grid and baseline overlays.",
    stack: ["Vanilla HTML/CSS", "Vite", "SVG"],
    tags: ["Design", "Web"],
    featured: false,
    addedAt: "2025-07-01",
  },
  {
    href: "/fabulosa-books/",
    title: "Fabulosa Books — Next.js on Vercel Tutorial",
    description:
      "A step-by-step tutorial for building and deploying Next.js applications on Vercel — an employee scheduler for a bookstore, with Neon Postgres, authentication, and server actions.",
    stack: ["Next.js", "Vercel", "Neon", "TypeScript"],
    tags: ["Tutorial", "Web"],
    featured: false,
    addedAt: "2025-06-01",
  },
];

export const featuredProjects = projects.filter((p) => p.featured);
export const listedProjects = projects.filter((p) => !p.featured);

export const latestProject = [...projects].sort((a, b) =>
  a.addedAt < b.addedAt ? 1 : a.addedAt > b.addedAt ? -1 : 0,
)[0];
