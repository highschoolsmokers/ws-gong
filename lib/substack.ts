import { z } from "zod";

const substackPostSchema = z.object({
  id: z.number(),
  title: z.string(),
  subtitle: z.string().nullable(),
  slug: z.string(),
  post_date: z.string(),
  canonical_url: z.string(),
  audience: z.string(),
});

export type SubstackPost = z.infer<typeof substackPostSchema>;

const ALLOWED_SUBDOMAIN = /^[a-z0-9][a-z0-9-]{0,62}$/;

export async function getSubstackPosts(
  subdomain: string,
  limit = 10,
): Promise<SubstackPost[]> {
  if (!ALLOWED_SUBDOMAIN.test(subdomain)) {
    console.error(`Substack: rejected subdomain ${subdomain}`);
    return [];
  }

  try {
    const res = await fetch(
      `https://${subdomain}.substack.com/api/v1/posts?limit=${limit}`,
      { next: { revalidate: 3600 }, signal: AbortSignal.timeout(5000) },
    );
    // Throw on non-OK so the Next data cache treats this as a failed fetch
    // and retries on the next request, instead of caching [] for a full
    // hour and silently hiding the newsletter section across the site.
    if (!res.ok) {
      throw new Error(`Substack API ${res.status} ${res.statusText}`);
    }
    const json = await res.json();
    if (!Array.isArray(json)) {
      throw new Error("Substack API: expected array response");
    }
    const out: SubstackPost[] = [];
    for (const item of json) {
      const parsed = substackPostSchema.safeParse(item);
      if (parsed.success) out.push(parsed.data);
    }
    return out;
  } catch (err) {
    console.error("Substack fetch failed:", err);
    return [];
  }
}
