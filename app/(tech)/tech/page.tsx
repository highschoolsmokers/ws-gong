import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "W.S. Gong — Tech",
};

export default function TechPage() {
  return (
    <div className="pt-16">
      <a
        href="/resume.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm underline underline-offset-4 hover:opacity-70 transition-opacity"
      >
        Resume (PDF)
      </a>
    </div>
  );
}
