import { getSubstackPosts } from "@/lib/substack";

export async function GET() {
  const posts = await getSubstackPosts("highschoolsmokers");
  const siteUrl = "https://ws-gong.com";

  const items = posts
    .map(
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
    </item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>W.S. Gong</title>
    <link>${siteUrl}</link>
    <description>Writing by W.S. Gong</description>
    <language>en-us</language>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
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
