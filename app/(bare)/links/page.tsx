import type { Metadata } from "next";
import Link from "next/link";
import {
  SubstackIcon,
  InstagramIcon,
  GitHubIcon,
  LinkedInIcon,
} from "../../(site)/about/SocialIcons";

function RumpusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M6 3C5.45 3 5 3.45 5 4v16c0 .55.45 1 1 1h1c.55 0 1-.45 1-1V15h3.5l3.5 5.4c.3.45.8.6 1.25.6h1.1c.75 0 1.15-.85.65-1.4L14.2 14.2C16.35 13.3 18 11.35 18 9c0-3.31-2.69-6-6-6H6zm2 3h4c1.66 0 3 1.34 3 3s-1.34 3-3 3H8V6z" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}

export const metadata: Metadata = {
  title: "Links",
  description: "W.S. Gong — links and profiles.",
  openGraph: {
    title: "Links — W.S. Gong",
    description: "W.S. Gong — links and profiles.",
  },
};

const links = [
  {
    label: "The Rumpus",
    url: "https://therumpus.net",
    icon: <RumpusIcon />,
  },
  {
    label: "Fabulosa Books",
    url: "https://www.fabulosabooks.com/",
    icon: <BookIcon />,
  },
  {
    label: "Substack",
    url: "https://highschoolsmokers.substack.com",
    icon: <SubstackIcon />,
  },
  {
    label: "GitHub",
    url: "https://github.com/highschoolsmokers",
    icon: <GitHubIcon />,
  },
  {
    label: "LinkedIn",
    url: "https://www.linkedin.com/in/billy-gong",
    icon: <LinkedInIcon />,
  },
  {
    label: "Instagram",
    url: "https://www.instagram.com/born.deleuze",
    icon: <InstagramIcon />,
  },
];

export default function Links() {
  return (
    <div className="max-w-md mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <Link
          href="/"
          className="text-2xl font-black tracking-tight hover:opacity-70 transition-opacity"
        >
          W.S. Gong
        </Link>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Narratives. Code.
        </p>
      </div>

      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 border border-black px-4 py-3 text-sm font-semibold hover:opacity-70 transition-opacity"
            >
              {link.icon && (
                <span className="w-5 h-5 flex-shrink-0">{link.icon}</span>
              )}
              <span className="flex-1">{link.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
