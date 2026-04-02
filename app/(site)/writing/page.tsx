import type { Metadata } from "next";
import { getSubstackPosts } from "@/lib/substack";

const description =
  "Published fiction, essays, and newsletter writing by W.S. Gong.";

export const metadata: Metadata = {
  title: "Writing",
  description,
  openGraph: {
    title: "Writing — W.S. Gong",
    description,
  },
};

const publications = [
  {
    title: "14 Hills",
    url: "https://www.14hills.net",
    description:
      "The literary magazine of San Francisco State University's Creative Writing Department.",
  },
];

const residencies = [
  {
    name: "Bread Loaf Writers' Conference",
    url: "https://www.middlebury.edu/bread-loaf-conferences",
  },
  {
    name: "Sewanee Writers' Conference",
    url: "https://sewaneewriters.org",
  },
  {
    name: "Tin House Writers' Workshop",
    url: "https://tinhouse.com/writers-workshop",
  },
  {
    name: "Kenyon Review Writers' Workshop",
    url: "https://www.kenyonreview.org/workshops",
  },
  {
    name: "Virginia Center for Creative Arts",
    url: "https://vcca.com",
  },
];

export default async function Writing() {
  const posts = await getSubstackPosts("highschoolsmokers");

  return (
    <div className="space-y-0">
      <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
        <h2 className="text-xl md:text-2xl font-black leading-tight">
          Publications
        </h2>
        <ul className="divide-y divide-neutral-200 border-t border-neutral-200">
          {publications.map((pub) => (
            <li key={pub.title} className="py-4">
              <a
                href={pub.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:opacity-70 transition-opacity"
              >
                <span className="text-sm font-semibold">{pub.title}</span>
                <span className="text-sm block mt-0.5">{pub.description}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
        <h2 className="text-xl md:text-2xl font-black leading-tight">
          Current Work
        </h2>
        <div className="space-y-4 text-sm leading-relaxed">
          <p>
            At work on a novel about runaway kids in 1980s San Francisco.
            Fiction editor at{" "}
            <a
              href="https://therumpus.net"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-70 transition-opacity"
            >
              The Rumpus
            </a>
            .
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
        <h2 className="text-xl md:text-2xl font-black leading-tight">
          Conferences &amp; Residencies
        </h2>
        <ul className="divide-y divide-neutral-200 border-t border-neutral-200">
          {residencies.map((r) => (
            <li key={r.name} className="py-4">
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold hover:opacity-70 transition-opacity"
              >
                {r.name}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
        <h2 className="text-xl md:text-2xl font-black leading-tight">
          Newsletter
        </h2>
        <div>
          <p className="text-sm mb-4">Fiction and essays, occasionally.</p>
          {posts.length > 0 && (
            <ul className="divide-y divide-neutral-200 border-t border-neutral-200">
              {posts.map((post) => (
                <li key={post.id}>
                  <a
                    href={post.canonical_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block py-4 hover:opacity-70 transition-opacity"
                  >
                    <span className="text-sm font-semibold">{post.title}</span>
                    {post.subtitle && (
                      <span className="text-sm block mt-0.5">
                        {post.subtitle}
                      </span>
                    )}
                    <span className="text-xs block mt-1 text-neutral-500">
                      {new Date(post.post_date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
          <a
            href="https://highschoolsmokers.substack.com/subscribe"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 text-sm font-semibold hover:opacity-70 transition-opacity"
          >
            Subscribe on Substack →
          </a>
        </div>
      </section>
    </div>
  );
}
