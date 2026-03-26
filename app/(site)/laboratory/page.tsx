import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Laboratory",
  description: "Experiments in design and code.",
  robots: { index: false },
};

const projects = [
  {
    href: "/laboratory/resume-generator",
    label: "Resume Generator",
    description:
      "Interactive resume editor with profile management and PDF export.",
  },
  {
    href: "/laboratory/die-neue-grafik",
    label: "Die Neue Grafik",
    description:
      "A study in Swiss International Typographic Style — Bauhaus, modernism, and grid-based design.",
  },
  {
    href: "/laboratory/contact",
    label: "Contact Form",
    description:
      "Reactive contact form with real-time typography scaling and drag-and-drop attachments.",
  },
];

export default function LaboratoryIndex() {
  return (
    <div className="space-y-0">
      {projects.map((p) => (
        <section
          key={p.href}
          className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10"
        >
          <h2 className="text-xl md:text-2xl font-black leading-tight">
            <Link href={p.href} className="hover:opacity-70 transition-opacity">
              {p.label}
            </Link>
          </h2>
          <p className="text-sm leading-relaxed">{p.description}</p>
        </section>
      ))}
    </div>
  );
}
