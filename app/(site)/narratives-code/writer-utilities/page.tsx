import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Writer Utilities",
  description:
    "A collection of scripts, AI agents, and small apps for fiction writers.",
  openGraph: {
    title: "Writer Utilities — W.S. Gong",
    description:
      "A collection of scripts, AI agents, and small apps for fiction writers.",
  },
};

export default function WriterUtilities() {
  return (
    <div className="space-y-0">
      <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
        <h2 className="text-xl md:text-2xl font-black leading-tight">
          Overview
        </h2>
        <div className="space-y-4 text-sm leading-relaxed">
          <p>
            A monorepo for the small tools that accumulate around a writing
            practice — format converters, submission pipelines, and eventually
            AI agents that assist with research and revision.
          </p>
          <p>
            Organized into three categories: <strong>scripts</strong> for
            one-shot conversions, <strong>apps</strong> for interactive tools,
            and <strong>agents</strong> for AI-assisted workflows (in progress).
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
        <h2 className="text-xl md:text-2xl font-black leading-tight">
          Included
        </h2>
        <div className="space-y-4 text-sm leading-relaxed">
          <ul className="space-y-3">
            <li>
              <span className="font-semibold">gdoc-to-scrivener</span> — A
              Python script that converts a Google Doc outline (with heading
              structure and Roman numeral sections) into a Scrivener 3 project,
              preserving the binder hierarchy and research folders.
            </li>
            <li>
              <Link
                href="/narratives-code/submission-cli"
                className="font-semibold hover:opacity-70 transition-opacity"
              >
                submission-cli
              </Link>{" "}
              — Format manuscripts to Shunn standard, generate cover letters
              with Claude, and manage a submission queue.
            </li>
          </ul>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
        <h2 className="text-xl md:text-2xl font-black leading-tight">Stack</h2>
        <div className="text-sm leading-relaxed space-y-2">
          <p>TypeScript · Python · Node.js · Google Docs API</p>
          <p>
            <a
              href="https://github.com/highschoolsmokers/writer-utilities"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold hover:opacity-70 transition-opacity"
            >
              View on GitHub →
            </a>
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
        <div />
        <Link
          href="/narratives-code"
          className="text-sm font-semibold hover:opacity-70 transition-opacity"
        >
          ← All projects
        </Link>
      </section>
    </div>
  );
}
