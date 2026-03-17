import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — W.S. Gong",
  description: "About W.S. Gong",
};

const socials = [
  { label: "Twitter / X", url: "https://twitter.com/" },
  { label: "Instagram", url: "https://instagram.com/" },
  { label: "Substack", url: "https://substack.com/" },
  { label: "Email", url: "mailto:hello@example.com" },
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
        <ul className="space-y-2">
          {socials.map((s) => (
            <li key={s.label}>
              <a
                href={s.url}
                target={s.url.startsWith("mailto") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className="text-sm underline underline-offset-4 hover:opacity-70 transition-opacity"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
