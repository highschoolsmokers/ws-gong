export type Book = {
  title: string;
  author: string;
  finished: `${number}-${number}-${number}` | "reading";
  note?: string;
  link?: string;
};

// Seed empty. Add entries as you finish (or start) a book.
// "reading" entries are pinned on top, in array order.
// "YYYY-MM-DD" entries are sorted reverse-chronologically by finished date.
export const books: Book[] = [];

const currentlyReading = books.filter((b) => b.finished === "reading");
const finished = books
  .filter(
    (b): b is Book & { finished: `${number}-${number}-${number}` } =>
      b.finished !== "reading",
  )
  .sort((a, b) =>
    a.finished < b.finished ? 1 : a.finished > b.finished ? -1 : 0,
  );

export const orderedBooks: Book[] = [...currentlyReading, ...finished];

export const latestBook: Book | null = orderedBooks[0] ?? null;
