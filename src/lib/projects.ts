// Shown in this order on the home page.
export const projects = [
  {
    href: "https://github.com/highschoolsmokers/second-reader",
    title: "Second Reader",
    description:
      "MCP server that grounds academic literary criticism in verifiable sources. Cross-checks claims against an indexed corpus to prevent hallucinated citations, fabricated quotations, and distorted arguments.",
    stack: ["TypeScript", "MCP SDK", "Neon", "pgvector"],
  },
  {
    href: "https://github.com/highschoolsmokers/historical-research-agent",
    title: "Historical Research Agent",
    description:
      "Claude Code plugin: autonomous historical research agent for fiction writers. Surfaces people, cultures, places, and events from newspaper archives and primary sources, with confidence scoring.",
    stack: ["Claude Code", "Anthropic SDK"],
  },
  {
    href: "https://github.com/highschoolsmokers/submission-cli",
    title: "Submission CLI",
    description:
      "Command-line tool that formats manuscripts to Shunn standard, generates cover letters via the Anthropic API, and manages a submission queue with persistent state.",
    stack: ["TypeScript", "Anthropic SDK", "PDFKit", "Node.js"],
  },
  {
    href: "https://github.com/highschoolsmokers/paperless-mcp",
    title: "Paperless MCP Server",
    description:
      "Stateless MCP server connecting Claude to Paperless-ngx document management. Exposes document search, tagging, and metadata operations as tools with typed API wrappers.",
    stack: ["TypeScript", "MCP SDK", "Express"],
  },
  {
    href: "https://github.com/highschoolsmokers/lit-research-plugin",
    title: "Literary Research Plugin",
    description:
      "Claude Code plugin: literary research agent that retrieves verified quotations from archives, cross-checks citations, and performs craft and theory analysis for scholars working with primary texts.",
    stack: ["Claude Code", "Anthropic SDK"],
  },
  {
    href: "https://github.com/highschoolsmokers/submission-watcher-agent",
    title: "Submission Watcher Agent",
    description:
      "Claude Code plugin and Vercel cron that monitors literary magazine submission windows on Submittable and emails alerts when they open. Built for writers who miss brief open-call periods.",
    stack: ["JavaScript", "Vercel Cron", "Upstash Redis", "Resend"],
  },
  {
    href: "https://github.com/highschoolsmokers/ws-gong",
    title: "ws-gong.com",
    description:
      "This portfolio site. Next.js 16 App Router, Tailwind, server components, RSS feed, and a Swiss-typography design system. Sentry, Vercel Analytics, Playwright across three browsers.",
    stack: ["Next.js", "TypeScript", "Tailwind"],
  },
  {
    href: "/fabulosa-books",
    title: "Fabulosa Books — Scheduling Agent Tutorial",
    description:
      "An eight-part tutorial: a bookstore scheduling agent on Next.js 16 and AI SDK 7, with the store's rules in code, a fairness subagent, human approval before every save, and tests that drive the agent with a scripted model.",
    stack: ["Next.js", "AI SDK", "Neon", "TypeScript"],
  },
];
