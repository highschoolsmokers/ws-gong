import type { Metadata } from "next";
import { GitHubIcon, LinkedInIcon } from "../../(site)/about/SocialIcons";
import ResumeLink from "./ResumeLink";
import { generateToken } from "@/lib/resumeToken";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "W.S. Gong — Tech",
};

const socials = [
  {
    label: "GitHub",
    icon: <GitHubIcon />,
    url: "https://github.com/highschoolsmokers",
  },
  {
    label: "LinkedIn",
    icon: <LinkedInIcon />,
    url: "https://www.linkedin.com/in/billy-gong",
  },
];

export default function TechPage() {
  const token = generateToken();
  return (
    <div className="space-y-12">
      <ResumeLink token={token} />

      <ul className="flex gap-5 items-center">
        {socials.map((s) => (
          <li key={s.label}>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block hover:opacity-50 transition-opacity"
              aria-label={s.label}
            >
              {s.icon}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
