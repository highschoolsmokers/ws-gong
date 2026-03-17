import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "W.S. Gong — Tech",
};

export default function TechPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-2">W.S. Gong</h1>
      <p className="text-neutral-500 text-sm mb-10">Software & Technology</p>
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
