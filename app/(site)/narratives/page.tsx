import type { Metadata } from "next";
import { getSubstackPosts } from "@/lib/substack";

export const metadata: Metadata = {
  title: "Narratives",
  description:
    "Fiction, essays, and literary work by W.S. Gong. Novel in progress, published stories, and editorial work.",
  openGraph: {
    title: "Narratives — W.S. Gong",
    description:
      "Fiction, essays, and literary work by W.S. Gong. Novel in progress, published stories, and editorial work.",
  },
};

type Tag = "Fiction" | "Editing" | "Essay";

interface Project {
  externalHref?: string;
  title: string;
  description: string;
  tags: Tag[];
}

const writingProjects: Project[] = [
  {
    title: "Novel in Progress",
    description:
      "A novel about runaway kids in 1980s San Francisco — street life, chosen family, and the myths kids tell themselves to survive.",
    tags: ["Fiction"],
  },
  {
    externalHref: "https://www.14hills.net",
    title: "14 Hills",
    description:
      "Published fiction in the literary magazine of San Francisco State University's Creative Writing Department.",
    tags: ["Fiction"],
  },
  {
    externalHref: "https://therumpus.net",
    title: "The Rumpus",
    description:
      "Fiction editor. Reading submissions, shaping stories, and championing emerging voices.",
    tags: ["Editing"],
  },
];

export default async function Narratives() {
  const posts = await getSubstackPosts("highschoolsmokers");

  return (
    <div className="space-y-0">
      <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
        <h2 className="text-xl md:text-2xl font-black leading-tight">
          Narratives
        </h2>
        <ul className="divide-y divide-neutral-200 border-t border-neutral-200">
          {writingProjects.map((p) => {
            const inner = (
              <>
                <span className="text-sm font-semibold">{p.title}</span>
                <span className="text-sm block mt-1 leading-relaxed">
                  {p.description}
                </span>
                <span className="text-xs mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-neutral-500">
                  {p.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block border border-neutral-400 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                    >
                      {tag}
                    </span>
                  ))}
                </span>
              </>
            );
            return (
              <li key={p.title} className="py-6">
                {p.externalHref ? (
                  <a
                    href={p.externalHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block hover:opacity-80 transition-opacity"
                  >
                    {inner}
                  </a>
                ) : (
                  <div>{inner}</div>
                )}
              </li>
            );
          })}
          {posts.map((post) => (
            <li key={post.id} className="py-6">
              <a
                href={post.canonical_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:opacity-80 transition-opacity"
              >
                <span className="text-sm font-semibold">{post.title}</span>
                {post.subtitle && (
                  <span className="text-sm block mt-1 leading-relaxed">
                    {post.subtitle}
                  </span>
                )}
                <span className="text-xs mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-neutral-500">
                  <span>
                    {new Date(post.post_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                    })}
                    {" · Substack"}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
