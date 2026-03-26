import type { Metadata } from "next";
import { getSubstackPosts } from "@/lib/substack";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Fiction by W.S. Gong. Work appears in 14 Hills and Sewanee Review.",
  openGraph: {
    title: "Projects — W.S. Gong",
    description:
      "Fiction by W.S. Gong. Work appears in 14 Hills and Sewanee Review.",
  },
};

export default async function Projects() {
  const posts = await getSubstackPosts("highschoolsmokers");

  if (posts.length === 0) {
    return <p className="text-sm">Coming soon.</p>;
  }

  return (
    <div className="space-y-0">
      <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
        <h2 className="text-xl md:text-2xl font-black leading-tight">
          Writing
        </h2>
        <div>
          <h3 className="text-sm font-semibold mb-4">Substack</h3>
          <ul className="divide-y divide-neutral-200 border-t border-neutral-200">
            {posts.map((post) => (
              <li key={post.id}>
                <a
                  href={post.canonical_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid grid-cols-[48px_1fr] gap-x-10 py-4 hover:opacity-70 transition-opacity"
                >
                  <span className="text-sm tabular-nums">
                    {new Date(post.post_date).getFullYear()}
                  </span>
                  <div>
                    <span className="text-sm font-semibold">{post.title}</span>
                    {post.subtitle && (
                      <span className="text-sm block mt-0.5">
                        {post.subtitle}
                      </span>
                    )}
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
        <h2 className="text-xl md:text-2xl font-black leading-tight">Code</h2>
        <div>
          <h3 className="text-sm font-semibold mb-4">Repositories</h3>
        </div>
      </section>
    </div>
  );
}
