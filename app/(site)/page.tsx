import type { Metadata } from "next";
import { getSubstackPosts, SUBSTACK_SUBDOMAIN } from "@/lib/substack";
import { latestProject } from "@/lib/code/projects";
import { latestBook } from "@/lib/reading/books";

export const metadata: Metadata = {
  title: "W.S. Gong — Stories & Systems",
  description:
    "Fiction editor at The Rumpus. Technical writer with twenty-five years in software. Building tools at the intersection of language models and the craft of writing.",
  openGraph: {
    title: "W.S. Gong — Stories & Systems",
    description:
      "Fiction editor at The Rumpus. Technical writer with twenty-five years in software. Building tools at the intersection of language models and the craft of writing.",
  },
};

export default async function Home() {
  const posts = await getSubstackPosts(SUBSTACK_SUBDOMAIN, 1);
  const latestNarrative = posts[0] ?? null;

  return (
    <div>
      <section className="swiss-grid swiss-rule pt-6 pb-16">
        <div className="col-span-12 md:col-span-4">
          <span className="swiss-label">Statement</span>
        </div>
        <div className="col-span-12 md:col-span-8">
          <p className="text-base leading-relaxed max-w-prose">
            Fiction editor at{" "}
            <a
              href="https://therumpus.net"
              target="_blank"
              rel="noopener noreferrer"
            >
              The Rumpus
            </a>
            .<br />
            Technical writer with twenty-five years in software.
            <br />
            Building tools at the intersection of language models and the craft
            of writing.
          </p>
        </div>
      </section>

      {latestNarrative && (
        <section className="swiss-grid swiss-rule pt-6 pb-16">
          <div className="col-span-12 md:col-span-4">
            <span className="swiss-label">Latest narrative</span>
          </div>
          <a
            href={latestNarrative.canonical_url}
            target="_blank"
            rel="noopener noreferrer"
            className="col-span-12 md:col-span-8 block no-underline hover:!no-underline"
          >
            <span className="block text-lg font-medium leading-tight">
              {latestNarrative.title}
            </span>
            {latestNarrative.subtitle && (
              <span className="block mt-2 text-sm leading-relaxed">
                {latestNarrative.subtitle}
              </span>
            )}
            <span className="mt-4 flex items-baseline gap-3 text-xs uppercase tracking-[0.12em] text-neutral-500">
              <span>
                {new Date(latestNarrative.post_date).toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  },
                )}
              </span>
              <span aria-hidden>/</span>
              <span>Substack</span>
            </span>
          </a>
        </section>
      )}

      {latestProject && (
        <section className="swiss-grid swiss-rule pt-6 pb-16">
          <div className="col-span-12 md:col-span-4">
            <span className="swiss-label">Latest code</span>
          </div>
          <a
            href={latestProject.href}
            {...(latestProject.href.startsWith("http")
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            className="col-span-12 md:col-span-8 block no-underline hover:!no-underline"
          >
            <span className="block text-lg font-medium leading-tight">
              {latestProject.title}
            </span>
            <span className="block mt-2 text-sm leading-relaxed">
              {latestProject.description}
            </span>
            <span className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs uppercase tracking-[0.12em] text-neutral-500">
              <span>{latestProject.stack.join(" / ")}</span>
            </span>
          </a>
        </section>
      )}

      {latestBook && (
        <section className="swiss-grid swiss-rule pt-6 pb-16">
          <div className="col-span-12 md:col-span-4">
            <span className="swiss-label">Latest reading</span>
          </div>
          <div className="col-span-12 md:col-span-8">
            {latestBook.link ? (
              <a
                href={latestBook.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block no-underline hover:!no-underline"
              >
                <ReadingEntry book={latestBook} />
              </a>
            ) : (
              <ReadingEntry book={latestBook} />
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function ReadingEntry({
  book,
}: {
  book: { title: string; author: string; finished: string; note?: string };
}) {
  return (
    <>
      <span className="block text-lg font-medium leading-tight">
        {book.title}
      </span>
      <span className="block mt-1 text-sm leading-relaxed">{book.author}</span>
      {book.note && (
        <span className="block mt-2 text-sm leading-relaxed">{book.note}</span>
      )}
      <span className="mt-4 flex items-baseline gap-3 text-xs uppercase tracking-[0.12em] text-neutral-500">
        <span>{book.finished === "reading" ? "Reading" : book.finished}</span>
      </span>
    </>
  );
}
