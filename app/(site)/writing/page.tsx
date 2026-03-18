import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Writing — W.S. Gong",
  description: "Published work by W.S. Gong",
};

interface Publication {
  title: string;
  venue: string;
  year: number;
  url: string;
}

const publications: Publication[] = [
  {
    title: "Example Essay Title",
    venue: "Publication Name",
    year: 2024,
    url: "#",
  },
  {
    title: "Another Piece",
    venue: "Another Publication",
    year: 2023,
    url: "#",
  },
  {
    title: "Short Story Title",
    venue: "Literary Magazine",
    year: 2023,
    url: "#",
  },
];

export default function Writing() {
  return (
    <ul className="divide-y divide-neutral-100">
      {publications.map((pub) => (
        <li key={pub.url + pub.title}>
          <a
            href={pub.url}
            target="_blank"
            rel="noopener noreferrer"
            className="grid grid-cols-[48px_1fr] gap-x-10 py-4 hover:opacity-50 transition-opacity"
          >
            <span className="text-[11px] text-neutral-400 pt-px tabular-nums">{pub.year}</span>
            <div>
              <span className="text-sm">{pub.title}</span>
              <span className="text-[11px] text-neutral-400 block mt-0.5">{pub.venue}</span>
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
}
