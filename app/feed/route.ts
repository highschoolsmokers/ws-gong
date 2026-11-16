import { SITE_URL as site } from "@/lib/site/content";
import { getSubstackPosts } from "@/lib/substack";
// "]]>" can't appear inside CDATA; split it across two sections.
const cdata = (s: string) =>
  `<![CDATA[${s.replaceAll("]]>", "]]]]><![CDATA[>")}]]>`;

export async function GET() {
  const items = (await getSubstackPosts()).map(
    (p) =>
      `<item><title>${cdata(p.title)}</title><link>${p.canonical_url}</link><guid isPermaLink="true">${p.canonical_url}</guid><pubDate>${new Date(p.post_date).toUTCString()}</pubDate>${p.subtitle ? `<description>${cdata(p.subtitle)}</description>` : ""}<category>Newsletter</category></item>`,
  );
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>W.S. Gong</title><link>${site}</link><description>Writing by W.S. Gong — fiction, essays, and notes from the editorial desk.</description><language>en-us</language><atom:link href="${site}/feed" rel="self" type="application/rss+xml"/>
${items.join("\n")}
</channel></rss>`;
  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
