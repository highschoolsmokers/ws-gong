import type { Metadata } from "next";
import { getSubstackPosts, SUBSTACK_SUBDOMAIN } from "@/lib/substack";
import PageTitle from "@/app/components/PageTitle";

export const metadata: Metadata = {
  title: "Narratives",
  description:
    "Fiction, essays, and literary work by W.S. Gong. Novel in progress, selected published work, editorial work, and newsletter.",
  openGraph: {
    title: "Narratives — W.S. Gong",
    description:
      "Fiction, essays, and literary work by W.S. Gong. Novel in progress, selected published work, editorial work, and newsletter.",
  },
};

type Tag = "Fiction" | "Editing" | "Essay";

interface NarrativeEntry {
  externalHref?: string;
  title: string;
  description: string;
  tags: Tag[];
}

const inProgress: NarrativeEntry[] = [
  {
    title: "Novel in Progress",
    description:
      "A novel about runaway kids in 1980s San Francisco — street life, chosen family, and the myths kids tell themselves to survive.",
    tags: ["Fiction"],
  },
];

const selectedWork: NarrativeEntry[] = [
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

function TagPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block border border-current px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em]">
      {children}
    </span>
  );
}

function EntryList({ entries }: { entries: NarrativeEntry[] }) {
  return (
    <ul className="col-span-12 md:col-span-8 divide-y divide-neutral-200">
      {entries.map((p) => {
        const inner = (
          <>
            <span className="block text-base font-medium leading-snug">
              {p.title}
            </span>
            <span className="block mt-2 text-sm leading-relaxed">
              {p.description}
            </span>
            <span className="mt-3 flex flex-wrap items-center gap-2">
              {p.tags.map((tag) => (
                <TagPill key={tag}>{tag}</TagPill>
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
                className="block no-underline hover:!no-underline"
              >
                {inner}
              </a>
            ) : (
              <div>{inner}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default async function Narratives() {
  const posts = await getSubstackPosts(SUBSTACK_SUBDOMAIN);

  return (
    <>
      <PageTitle>Narratives</PageTitle>

      {inProgress.length > 0 && (
        <section className="swiss-grid swiss-rule pt-6 pb-16">
          <div className="col-span-12 md:col-span-4">
            <h2 className="swiss-label">In progress</h2>
          </div>
          <EntryList entries={inProgress} />
        </section>
      )}

      {selectedWork.length > 0 && (
        <section className="swiss-grid swiss-rule pt-6 pb-16">
          <div className="col-span-12 md:col-span-4">
            <h2 className="swiss-label">Selected work</h2>
          </div>
          <EntryList entries={selectedWork} />
        </section>
      )}

      {posts.length > 0 && (
        <section className="swiss-grid swiss-rule pt-6 pb-16">
          <div className="col-span-12 md:col-span-4">
            <h2 className="swiss-label">Newsletter</h2>
          </div>
          <ul className="col-span-12 md:col-span-8 divide-y divide-neutral-200">
            {posts.map((post) => (
              <li key={post.id} className="py-6">
                <a
                  href={post.canonical_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block no-underline hover:!no-underline"
                >
                  <span className="block text-base font-medium leading-snug">
                    {post.title}
                  </span>
                  {post.subtitle && (
                    <span className="block mt-2 text-sm leading-relaxed">
                      {post.subtitle}
                    </span>
                  )}
                  <span className="mt-3 flex items-baseline gap-3 text-[10px] uppercase tracking-[0.12em] text-neutral-500">
                    <span>
                      {new Date(post.post_date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                      })}
                    </span>
                    <span aria-hidden>/</span>
                    <span>Substack</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
