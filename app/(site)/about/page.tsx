import type { Metadata } from "next";
import { SubstackIcon, InstagramIcon } from "./SocialIcons";

export const metadata: Metadata = {
  title: "About — W.S. Gong",
  description: "About W.S. Gong",
};

const socials = [
  { label: "Substack", icon: <SubstackIcon />, url: "https://substack.com/@highschoolsmokers" },
  { label: "Instagram", icon: <InstagramIcon />, url: "https://www.instagram.com/born.deleuze" },
];

export default function About() {
  return (
    <div className="space-y-16">
      <section className="grid grid-cols-[120px_1fr] gap-x-12">
        <span className="text-[10px] tracking-[0.12em] uppercase pt-px">Statement</span>
        <div className="space-y-4 text-sm leading-relaxed text-neutral-700">
          <p>
            [Artist statement placeholder. Write a few sentences about your work,
            interests, and what drives your writing here.]
          </p>
          <p>
            [Continue with background, influences, or themes you return to in your work.]
          </p>
        </div>
      </section>

      <section className="grid grid-cols-[120px_1fr] gap-x-12">
        <span className="text-[10px] tracking-[0.12em] uppercase pt-px">Find Me</span>
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
      </section>
    </div>
  );
}
