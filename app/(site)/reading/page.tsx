import type { Metadata } from "next";
import { PageTitle, Row, Rows, Section } from "@/app/components/ui";
import { bookHref, bookMeta, orderedBooks, type Book } from "@/lib/books";

export const metadata: Metadata = {
  title: "Reading",
  description: "What W.S. Gong is reading, with reviews.",
};

const row = (b: Book) => (
  <Row key={b.slug} href={bookHref(b)} title={b.title} meta={bookMeta(b)}>
    {b.note ? `${b.author}. ${b.note}` : b.author}
  </Row>
);

export default function Reading() {
  const now = orderedBooks.filter((b) => b.finished === "reading");
  const done = orderedBooks.filter((b) => b.finished !== "reading");
  return (
    <>
      <PageTitle>Reading</PageTitle>
      {now.length > 0 && (
        <Section title="Now">
          <Rows>{now.map(row)}</Rows>
        </Section>
      )}
      {done.length > 0 && (
        <Section title="Finished">
          <Rows>{done.map(row)}</Rows>
        </Section>
      )}
    </>
  );
}
