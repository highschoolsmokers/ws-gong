import { getSubstackPosts } from "@/lib/substack";

const siteUrl = "https://www.ws-gong.com";

const projectItems = [
  {
    title: "The Fabulosa Books Scheduler: Multi-Agent Orchestration",
    link: `${siteUrl}/fabulosa-books/`,
    description:
      "A tutorial walking through a multi-agent system that coordinates book scheduling across inventory, calendar, and notification services.",
  },
  {
    title: "Paperless MCP Server",
    link: `${siteUrl}/code/paperless-mcp`,
    description:
      "A Model Context Protocol server that connects Claude to Paperless-ngx document management.",
  },
  {
    title: "Submission CLI",
    link: `${siteUrl}/code/submission-cli`,
    description:
      "A command-line tool for fiction writers. Formats manuscripts, generates cover letters with Claude, and manages submissions.",
  },
  {
    title: "Writer Utilities",
    link: `${siteUrl}/code/writer-utilities`,
    description:
      "Scripts and small apps for fiction writers — including a Google Docs to Scrivener converter.",
  },
  {
    title: "Contact Form",
    link: `${siteUrl}/code/contact-form`,
    description:
      "Reactive contact form with real-time typography scaling and drag-and-drop attachments.",
  },
];

export async function GET() {
  const posts = await getSubstackPosts("highschoolsmokers");

  const postItems = posts.map(
    (post) => `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${post.canonical_url}</link>
      <guid isPermaLink="true">${post.canonical_url}</guid>
      <pubDate>${new Date(post.post_date).toUTCString()}</pubDate>${
        post.subtitle
          ? `
      <description><![CDATA[${post.subtitle}]]></description>`
          : ""
      }
      <category>Newsletter</category>
    </item>`,
  );

  const projectXml = projectItems.map(
    (p) => `    <item>
      <title><![CDATA[${p.title}]]></title>
      <link>${p.link}</link>
      <guid isPermaLink="true">${p.link}</guid>
      <description><![CDATA[${p.description}]]></description>
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
