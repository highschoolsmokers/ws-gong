import type { Metadata } from "next";
import PageTitle from "@/app/components/PageTitle";
import { orderedBooks } from "@/lib/reading/books";

export const metadata: Metadata = {
  title: "Reading",
  description:
    "What W.S. Gong is reading. A reverse-chronological log with brief notes.",
  openGraph: {
    title: "Reading — W.S. Gong",
    description:
      "What W.S. Gong is reading. A reverse-chronological log with brief notes.",
  },
};

export default function Reading() {
  const reading = orderedBooks.filter((b) => b.finished === "reading");
  const finished = orderedBooks.filter((b) => b.finished !== "reading");

  return (
    <>
      <PageTitle>Reading</PageTitle>

      {reading.length > 0 && (
        <section className="swiss-grid swiss-rule pt-6 pb-16">
          <div className="col-span-12 md:col-span-4">
            <h2 className="swiss-label">Currently reading</h2>
          </div>
          <ul className="col-span-12 md:col-span-8 divide-y divide-neutral-200">
            {reading.map((b) => (
              <BookEntry key={`${b.title}::${b.author}`} book={b} />
            ))}
          </ul>
        </section>
      )}

      {finished.length > 0 && (
        <section className="swiss-grid swiss-rule pt-6 pb-16">
          <div className="col-span-12 md:col-span-4">
            <h2 className="swiss-label">Finished</h2>
          </div>
          <ul className="col-span-12 md:col-span-8 divide-y divide-neutral-200">
            {finished.map((b) => (
              <BookEntry key={`${b.title}::${b.author}`} book={b} />
            ))}
          </ul>
        </section>
      )}

      {reading.length === 0 && finished.length === 0 && (
        <section className="swiss-grid swiss-rule pt-6 pb-16">
          <div className="col-span-12 md:col-span-4" />
          <p className="col-span-12 md:col-span-8 text-sm leading-relaxed">
            Empty for the moment.
          </p>
        </section>
      )}
    </>
  );
}

function BookEntry({
  book,
}: {
  book: {
    title: string;
    author: string;
    finished: string;
    note?: string;
    link?: string;
  };
}) {
  const inner = (
    <>
      <span className="block text-base font-medium leading-snug">
        {book.title}
      </span>
      <span className="block mt-1 text-sm leading-relaxed">{book.author}</span>
      {book.note && (
        <span className="block mt-2 text-sm leading-relaxed">{book.note}</span>
      )}
      <span className="mt-3 flex items-baseline gap-3 text-[10px] uppercase tracking-[0.12em] text-neutral-500">
        <span>{book.finished === "reading" ? "Reading" : book.finished}</span>
      </span>
    </>
  );
  return (
    <li className="py-6">
      {book.link ? (
        <a
          href={book.link}
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
}
