import type { Metadata } from "next";
import { BookRow } from "@/app/components/rows";
import { PageTitle, Rows, Section } from "@/app/components/ui";
import { orderedBooks, type Book } from "@/lib/books";

export const metadata: Metadata = {
  title: "Reading",
  description: "What W.S. Gong is reading, with reviews.",
};

const row = (b: Book) => <BookRow key={b.slug} b={b} />;

export default function Reading() {
  const now = orderedBooks.filter((b) => b.finished === "reading");
  const done = orderedBooks.filter((b) => b.finished !== "reading");
  return (
    <>
      <PageTitle>Reading</PageTitle>
      {now.length > 0 && (
        <Section title="Currently reading">
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
