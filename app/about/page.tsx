import type { Metadata } from "next";
import { SubstackIcon, InstagramIcon, EmailIcon } from "./SocialIcons";

export const metadata: Metadata = {
  title: "About — W.S. Gong",
  description: "About W.S. Gong",
};

const socials = [
  { label: "Substack", icon: <SubstackIcon />, url: "https://substack.com/" },
  { label: "Instagram", icon: <InstagramIcon />, url: "https://instagram.com/" },
  { label: "Email", icon: <EmailIcon />, url: "mailto:hello@example.com" },
];

export default function About() {
  return (
    <div>
      <section className="mb-12">
        <h2 className="text-xs uppercase tracking-widest text-neutral-400 mb-4">Statement</h2>
        <div className="prose prose-neutral max-w-none text-neutral-700 leading-relaxed space-y-4">
          <p>
            [Artist statement placeholder. Write a few sentences about your work,
            interests, and what drives your writing here.]
          </p>
          <p>
            [Continue with background, influences, or themes you return to in your work.]
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-xs uppercase tracking-widest text-neutral-400 mb-4">Find Me</h2>
        <ul className="flex gap-5">
          {socials.map((s) => (
            <li key={s.label}>
              <a
                href={s.url}
                target={s.url.startsWith("mailto") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className="block hover:opacity-50 transition-opacity"
                aria-label={s.label}
              >
                {s.icon}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
