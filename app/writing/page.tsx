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
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-10">Writing</h1>
      <ul className="space-y-6">
        {publications.map((pub) => (
          <li key={pub.url + pub.title} className="group">
            <a
              href={pub.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block hover:opacity-70 transition-opacity"
            >
              <span className="font-medium">{pub.title}</span>
              <span className="text-neutral-400 mx-2">—</span>
              <span className="text-neutral-600 text-sm">{pub.venue}</span>
              <span className="text-neutral-400 text-sm ml-2">({pub.year})</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
