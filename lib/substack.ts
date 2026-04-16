export interface SubstackPost {
  id: number;
  title: string;
  subtitle: string | null;
  slug: string;
  post_date: string;
  canonical_url: string;
  audience: string;
}

export async function getSubstackPosts(
  subdomain: string,
  limit = 10,
): Promise<SubstackPost[]> {
  try {
    const res = await fetch(
      `https://${subdomain}.substack.com/api/v1/posts?limit=${limit}`,
      { next: { revalidate: 3600 }, signal: AbortSignal.timeout(5000) },
    );
    if (!res.ok) {
      console.error(`Substack API error: ${res.status} ${res.statusText}`);
      return [];
    }
    return (await res.json()) as SubstackPost[];
  } catch (err) {
    console.error("Substack fetch failed:", err);
    return [];
  }
}
