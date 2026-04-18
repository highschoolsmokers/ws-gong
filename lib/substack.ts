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
    if (!res.ok) {
      console.error(`Substack API error: ${res.status} ${res.statusText}`);
      return [];
    }
    const json = await res.json();
    if (!Array.isArray(json)) {
      console.error("Substack API: expected array response");
      return [];
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
