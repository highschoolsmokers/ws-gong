export type Book = {
  title: string;
  author: string;
  finished: `${number}-${number}-${number}` | "reading";
  note?: string;
  link?: string;
};

// Add entries as you start or finish a book.
export const books: Book[] = [];

// Currently reading first (in array order), then finished, newest first.
export const orderBooks = (list: Book[]) =>
  [...list].sort((a, b) => key(b).localeCompare(key(a)));
const key = (b: Book) => (b.finished === "reading" ? "9" : b.finished);

export const orderedBooks = orderBooks(books);
