import { Row } from "@/app/components/ui";
import { bookHref, bookMeta, type Book } from "@/lib/books";
import type { site } from "@/lib/site/content";
import type { SubstackPost } from "@/lib/substack";

// Rows shared by the home page, /links, and /reading. Server only: books read
// the file system.

const month = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

export const PostRow = ({ p, via = "" }: { p: SubstackPost; via?: string }) => (
  <Row href={p.canonical_url} title={p.title} meta={via + month(p.post_date)}>
    {p.subtitle}
  </Row>
);

export const StoryRow = ({ s }: { s: (typeof site)["published"][number] }) => (
  <Row
    href={s.url}
    title={s.title}
    meta={[s.venue, s.detail].filter(Boolean).join(" · ")}
  />
);

export const BookRow = ({ b }: { b: Book }) => (
  <Row href={bookHref(b)} title={b.title} meta={bookMeta(b)}>
    {b.note ? `${b.author}. ${b.note}` : b.author}
  </Row>
);
