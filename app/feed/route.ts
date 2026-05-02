import { getSubstackPosts } from "@/lib/substack";

const siteUrl = "https://www.ws-gong.com";

// Embedded text in CDATA can't contain the literal sequence "]]>". Split and
// reopen so the terminator never appears inside the section.
function cdata(text: string): string {
  return `<![CDATA[${text.replaceAll("]]>", "]]]]><![CDATA[>")}]]>`;
}

// Stable per-item dates so RSS readers (Feedly, Reeder) sort and dedupe project
// items predictably instead of treating them as freshly-published every fetch.
// Update when the underlying project page meaningfully changes.
const projectItems: {
  title: string;
  link: string;
  description: string;
  date: string;
}[] = [
  {
    title: "The Fabulosa Books Scheduler: Multi-Agent Orchestration",
    link: `${siteUrl}/fabulosa-books/`,
    description:
      "A tutorial walking through a multi-agent system that coordinates book scheduling across inventory, calendar, and notification services.",
    date: "2026-03-15",
  },
  {
    title: "Paperless MCP Server",
    link: `${siteUrl}/code/paperless-mcp`,
    description:
      "A Model Context Protocol server that connects Claude to Paperless-ngx document management.",
    date: "2026-03-15",
  },
  {
    title: "Submission CLI",
    link: `${siteUrl}/code/submission-cli`,
    description:
      "A command-line tool for fiction writers. Formats manuscripts, generates cover letters with Claude, and manages submissions.",
    date: "2026-03-15",
  },
  {
    title: "Writer Utilities",
    link: `${siteUrl}/code/writer-utilities`,
    description:
      "Scripts and small apps for fiction writers — including a Google Docs to Scrivener converter.",
    date: "2026-03-15",
  },
  {
    title: "Contact Form",
    link: `${siteUrl}/code/contact-form`,
    description:
      "Reactive contact form with real-time typography scaling and drag-and-drop attachments.",
    date: "2026-03-15",
  },
];

export async function GET() {
  const posts = await getSubstackPosts("highschoolsmokers");

  const postItems = posts.map(
    (post) => `    <item>
      <title>${cdata(post.title)}</title>
      <link>${post.canonical_url}</link>
      <guid isPermaLink="true">${post.canonical_url}</guid>
      <pubDate>${new Date(post.post_date).toUTCString()}</pubDate>${
        post.subtitle
          ? `
      <description>${cdata(post.subtitle)}</description>`
          : ""
      }
      <category>Newsletter</category>
    </item>`,
  );

  const projectXml = projectItems.map(
    (p) => `    <item>
      <title>${cdata(p.title)}</title>
      <link>${p.link}</link>
      <guid isPermaLink="true">${p.link}</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <description>${cdata(p.description)}</description>
      <category>Project</category>
    </item>`,
  );

  const items = [...postItems, ...projectXml].join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>W.S. Gong</title>
    <link>${siteUrl}</link>
    <description>Writing and code by W.S. Gong — fiction, AI integrations, and developer tools.</description>
    <language>en-us</language>
    <atom:link href="${siteUrl}/feed" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
