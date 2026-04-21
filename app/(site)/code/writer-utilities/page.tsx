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
      <h1 className="swiss-display text-[2.5rem] md:text-[3.5rem] pb-12">
        Writer Utilities
      </h1>
      <section className="swiss-grid swiss-rule pt-6 pb-12">
        <h2 className="swiss-label">Overview</h2>
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

      <section className="swiss-grid swiss-rule pt-6 pb-12">
        <h2 className="swiss-label">Included</h2>
        <div className="space-y-4 text-sm leading-relaxed">
          <ul className="space-y-3">
            <li>
              <span className="font-medium">gdoc-to-scrivener</span> — A Python
              script that converts a Google Doc outline (with heading structure
              and Roman numeral sections) into a Scrivener 3 project, preserving
              the binder hierarchy and research folders.
            </li>
            <li>
              <Link href="/code/submission-cli" className="font-medium">
                submission-cli
              </Link>{" "}
              — Format manuscripts to Shunn standard, generate cover letters
              with Claude, and manage a submission queue.
            </li>
          </ul>
        </div>
      </section>

      <section className="swiss-grid swiss-rule pt-6 pb-12">
        <h2 className="swiss-label">Stack</h2>
        <div className="text-sm leading-relaxed space-y-2">
          <p>TypeScript · Python · Node.js · Google Docs API</p>
          <p>
            <a
              href="https://github.com/highschoolsmokers/writer-utilities"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium"
            >
              View on GitHub →
            </a>
          </p>
        </div>
      </section>

      <section className="swiss-grid swiss-rule pt-6 pb-12">
        <div />
        <Link href="/code" className="text-sm font-medium">
          ← All projects
        </Link>
      </section>
    </div>
  );
}
