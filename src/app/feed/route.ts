import { reviewed } from "@/lib/books";
import { feedHtml } from "@/lib/review";
import { FEED_DESCRIPTION, SITE_URL } from "@/lib/site/content";
import { getSubstackPosts } from "@/lib/substack";
// "]]>" can't appear inside CDATA; split it across two sections.
const cdata = (s: string) =>
  `<![CDATA[${s.replaceAll("]]>", "]]]]><![CDATA[>")}]]>`;

type Item = {
  title: string;
  url: string;
  date?: Date;
  description?: string;
  category: string;
};

export async function GET() {
  const posts: Item[] = (await getSubstackPosts()).map((p) => ({
    title: p.title,
    url: p.canonical_url,
    date: new Date(p.post_date),
    description: p.subtitle ?? undefined,
    category: "Substack",
  }));
  // Reviews carry their full text, spoilers left out.
  const reviews: Item[] = reviewed.map((b) => {
    const url = `${SITE_URL}/reading/${b.slug}`;
    return {
      title: `Review: ${b.title} by ${b.author}`,
      url,
      date: b.finished === "reading" ? undefined : new Date(b.finished),
      description: feedHtml(b.review, url),
      category: "Review",
    };
  });
  const items = [...posts, ...reviews]
    .sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0))
    .map(
      (i) =>
        `<item><title>${cdata(i.title)}</title><link>${i.url}</link><guid isPermaLink="true">${i.url}</guid>${i.date ? `<pubDate>${i.date.toUTCString()}</pubDate>` : ""}${i.description ? `<description>${cdata(i.description)}</description>` : ""}<category>${i.category}</category></item>`,
    );
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>W.S. Gong</title><link>${SITE_URL}</link><description>${FEED_DESCRIPTION}</description><language>en-us</language><atom:link href="${SITE_URL}/feed" rel="self" type="application/rss+xml"/>
${items.join("\n")}
</channel></rss>`;
  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
