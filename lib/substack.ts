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
  const res = await fetch(
    `https://${subdomain}.substack.com/api/v1/posts?limit=${limit}`,
    { next: { revalidate: 3600 } },
  );
  if (!res.ok) {
    console.error(`Substack API error: ${res.status} ${res.statusText}`);
    return [];
  }
  const data = await res.json();
  return data as SubstackPost[];
}
