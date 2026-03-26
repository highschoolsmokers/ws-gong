import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Laboratory",
  description: "Experiments in design and code.",
  robots: { index: false },
};

const projects = [
  { href: "/laboratory/resume-generator", label: "Resume Generator" },
  { href: "/laboratory/die-neue-grafik", label: "Die Neue Grafik" },
  { href: "/laboratory/contact", label: "Contact Form" },
];

export default function LaboratoryIndex() {
  return (
    <div className="min-h-screen bg-[#F2EDE4] text-black">
      <div className="max-w-5xl mx-auto px-8 py-12 md:px-12 md:py-16">
        <header className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8 md:gap-12 mb-12">
          <h1 className="text-6xl md:text-7xl lg:text-[5.5rem] font-black leading-[0.95] tracking-tight">
            Laboratory
          </h1>
          <div className="flex flex-col gap-6">
            <Link
              href="/"
              className="flex items-center gap-2.5 hover:opacity-70 transition-opacity"
            >
              <div className="w-5 h-5 bg-black" />
              <span className="text-xl font-black tracking-tight">
                Narratives. Code.
              </span>
            </Link>
            <ul className="text-sm font-semibold leading-loose">
              {projects.map((p) => (
                <li key={p.href}>
                  <Link
                    href={p.href}
                    className="hover:opacity-70 transition-opacity"
                  >
                    {p.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </header>
      </div>
    </div>
  );
}
