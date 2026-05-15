import { getSubstackPosts, SUBSTACK_SUBDOMAIN } from "@/lib/substack";

const siteUrl = "https://www.ws-gong.com";

// Embedded text in CDATA can't contain the literal sequence "]]>". Split and
// reopen so the terminator never appears inside the section.
function cdata(text: string): string {
  return `<![CDATA[${text.replaceAll("]]>", "]]]]><![CDATA[>")}]]>`;
}

export async function GET() {
  const posts = await getSubstackPosts(SUBSTACK_SUBDOMAIN);

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

  const items = postItems.join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>W.S. Gong</title>
    <link>${siteUrl}</link>
    <description>Writing by W.S. Gong — fiction, essays, and notes from the editorial desk.</description>
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
