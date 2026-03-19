import type { Metadata } from "next";
import { getSubstackPosts } from "@/lib/substack";

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Fiction by W.S. Gong. Work appears in 14 Hills and Sewanee Review.",
  openGraph: {
    title: "Writing — W.S. Gong",
    description:
      "Fiction by W.S. Gong. Work appears in 14 Hills and Sewanee Review.",
  },
};

interface Publication {
  title: string;
  venue: string;
  year: number;
  url: string;
}

// Fill in title and url before uncommenting
const publications: Publication[] = [
  {
    title: "[Title]",
    venue: "Sewanee Review",
    year: 2024,
    url: "#",
  },
  {
    title: "[Title]",
    venue: "14 Hills",
    year: 2024,
    url: "#",
  },
];

export default async function Writing() {
  const posts = await getSubstackPosts("highschoolsmokers");

  return (
    <div className="space-y-16">
      {/* Uncomment and fill in title/url for each entry when ready
      <ul className="divide-y divide-neutral-100 border-t border-neutral-100">
        {publications.map((pub) => (
          <li key={pub.url + pub.title}>
            <a
              href={pub.url}
              target="_blank"
              rel="noopener noreferrer"
              className="grid grid-cols-[48px_1fr] gap-x-10 py-4 hover:opacity-50 transition-opacity"
            >
              <span className="text-[11px] text-neutral-300 pt-px tabular-nums">
                {pub.year}
              </span>
              <div>
                <span className="text-sm">{pub.title}</span>
                <span className="text-[11px] text-neutral-400 block mt-0.5">
                  {pub.venue}
                </span>
              </div>
            </a>
          </li>
        ))}
      </ul>
      */}

      {posts.length > 0 && (
        <section>
          <h2 className="text-[10px] tracking-[0.12em] uppercase mb-4">
            Substack
          </h2>
          <ul className="divide-y divide-neutral-100 border-t border-neutral-100">
            {posts.map((post) => (
              <li key={post.id}>
                <a
                  href={post.canonical_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid grid-cols-[48px_1fr] gap-x-10 py-4 hover:opacity-50 transition-opacity"
                >
                  <span className="text-[11px] text-neutral-300 pt-px tabular-nums">
                    {new Date(post.post_date).getFullYear()}
                  </span>
                  <div>
                    <span className="text-sm">{post.title}</span>
                    {post.subtitle && (
                      <span className="text-[11px] text-neutral-400 block mt-0.5">
                        {post.subtitle}
                      </span>
                    )}
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
