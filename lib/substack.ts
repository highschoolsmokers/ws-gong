import { z } from "zod";

export const SUBSTACK_BASE_URL = "https://highschoolsmokers.substack.com";
export const SUBSCRIBE_URL = `${SUBSTACK_BASE_URL}/subscribe`;

const postSchema = z.object({
  id: z.number(),
  title: z.string(),
  subtitle: z.string().nullable(),
  post_date: z.string(),
  canonical_url: z.string(),
});

export type SubstackPost = z.infer<typeof postSchema>;

// Substack posts, newest first; [] on any failure so the section just hides.
// A non-OK response throws inside the try so Next's data cache retries next
// request instead of caching an empty list for the hour.
export async function getSubstackPosts(limit = 10): Promise<SubstackPost[]> {
  try {
    const res = await fetch(
      `${SUBSTACK_BASE_URL}/api/v1/posts?limit=${limit}`,
      {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(5000),
      },
    );
    if (!res.ok) throw new Error(`Substack API ${res.status}`);
    // The API wraps the list: { posts: [...], nextCursor }.
    const { posts } = z
      .object({ posts: z.array(z.unknown()) })
      .parse(await res.json());
    return posts.flatMap((p) => postSchema.safeParse(p).data ?? []);
  } catch (err) {
    console.error("Substack fetch failed:", err);
    return [];
  }
}
