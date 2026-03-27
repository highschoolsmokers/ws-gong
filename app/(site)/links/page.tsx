import type { Metadata } from "next";
import {
  SubstackIcon,
  InstagramIcon,
  GitHubIcon,
  LinkedInIcon,
} from "../about/SocialIcons";

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
    description: "Fiction editor",
    url: "https://therumpus.net",
  },
  {
    label: "Fabulosa Books",
    description: "Independent publisher",
    url: "https://www.fabulosabooks.com/",
    icon: <BookIcon />,
  },
  {
    label: "Substack",
    description: "Fiction and essays",
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
        <h2 className="text-2xl font-black tracking-tight">W.S. Gong</h2>
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
              {link.description && (
                <span className="text-xs font-normal text-neutral-500">
                  {link.description}
                </span>
              )}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
