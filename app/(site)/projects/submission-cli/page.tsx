import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Submission CLI",
  description:
    "A command-line tool for fiction writers. Formats manuscripts, generates cover letters with Claude, and manages submissions.",
  openGraph: {
    title: "Submission CLI — W.S. Gong",
    description:
      "A command-line tool for fiction writers. Formats manuscripts, generates cover letters with Claude, and manages submissions.",
  },
};

export default function SubmissionCli() {
  return (
    <div className="space-y-0">
      <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
        <h2 className="text-xl md:text-2xl font-black leading-tight">
          Overview
        </h2>
        <div className="space-y-4 text-sm leading-relaxed">
          <p>
            A command-line pipeline for submitting fiction to literary
            magazines. Point it at a manuscript file and a target publication,
            and it handles the rest: parsing the text from .txt, .rtf, or .docx,
            formatting to{" "}
            <a
              href="https://www.shunn.net/format/story/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-70 transition-opacity font-semibold"
            >
              Shunn standard
            </a>
            , generating a tailored cover letter through the Anthropic API, and
            tracking the submission in a local queue.
          </p>
          <p>
            Born from the tedium of formatting the same story differently for
            every magazine. The cover letter generator uses Claude to draft
            something appropriate to the publication — not a generic template,
            but a letter that references the author&apos;s bio and the
            magazine&apos;s editorial sensibility.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
        <h2 className="text-xl md:text-2xl font-black leading-tight">
          How it works
        </h2>
        <div className="space-y-4 text-sm leading-relaxed">
          <ul className="space-y-2">
            <li>
              <span className="font-semibold">Manuscript parsing:</span>{" "}
              Extracts text, title, and word count from .txt, .rtf, and .docx
              files via Mammoth
            </li>
            <li>
              <span className="font-semibold">Shunn formatting:</span>{" "}
              Generates a properly formatted PDF with contact block, headers,
              word count, and standard manuscript typography
            </li>
            <li>
              <span className="font-semibold">Cover letters:</span> Claude
              drafts a publication-specific letter from your author profile and
              the manuscript metadata
            </li>
            <li>
              <span className="font-semibold">Queue management:</span> Tracks
              submissions by status — draft, sent, accepted, rejected — with
              scan and list commands
            </li>
            <li>
              <span className="font-semibold">Author config:</span> Interactive
              setup stores your legal name, pen name, address, and bio for reuse
              across submissions
            </li>
          </ul>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
        <h2 className="text-xl md:text-2xl font-black leading-tight">Stack</h2>
        <div className="text-sm leading-relaxed space-y-2">
          <p>TypeScript · Anthropic SDK · PDFKit · Mammoth · Node.js</p>
          <p>
            <a
              href="https://github.com/highschoolsmokers/submission-cli"
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
          href="/projects"
          className="text-sm font-semibold hover:opacity-70 transition-opacity"
        >
          ← All projects
        </Link>
      </section>
    </div>
  );
}
