import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Historical Research Agent",
  description:
    "A Claude Code plugin for fiction writers — investigates real people, places, cultures, and events, and organizes findings into structured reference documents.",
  openGraph: {
    title: "Historical Research Agent — W.S. Gong",
    description:
      "A Claude Code plugin for fiction writers — investigates real people, places, cultures, and events, and organizes findings into structured reference documents.",
  },
};

export default function HistoricalResearchAgent() {
  return (
    <div className="space-y-0">
      <h1 className="swiss-display text-[2.5rem] md:text-[3.5rem] pb-12">
        Historical Research Agent
      </h1>
      <section className="swiss-grid swiss-rule pt-6 pb-12">
        <h2 className="swiss-label">Overview</h2>
        <div className="space-y-4 text-sm leading-relaxed">
          <p>
            A{" "}
            <a
              href="https://docs.claude.com/en/docs/claude-code"
              target="_blank"
              rel="noopener noreferrer"
              className=" font-medium"
            >
              Claude Code
            </a>{" "}
            plugin for fiction writers. Investigates periods, people, places,
            cultures, and events — surfacing the vivid, story-relevant details
            writers actually need, and flagging anachronisms in draft
            manuscripts with period-accurate alternatives.
          </p>
          <p>
            Built around a source-confidence scoring system that rates
            information reliability from primary sources (★★★★) down to popular
            belief (★), so the writer always knows how load-bearing a given fact
            is.
          </p>
        </div>
      </section>

      <section className="swiss-grid swiss-rule pt-6 pb-12">
        <h2 className="swiss-label">What it does</h2>
        <div className="space-y-4 text-sm leading-relaxed">
          <ul className="space-y-2">
            <li>
              <span className="font-medium">Historical research:</span>{" "}
              Investigates periods, people, places, cultures, and events —
              focused on story-relevant detail
            </li>
            <li>
              <span className="font-medium">Newspaper lookups:</span> Searches
              digitized newspaper archives for contemporary coverage of events
              in specific places and periods
            </li>
            <li>
              <span className="font-medium">Manuscript review:</span> Reads
              drafts and flags anachronisms by severity, with period-accurate
              replacements
            </li>
            <li>
              <span className="font-medium">Fact-checking:</span> Flags common
              misconceptions and gaps between documented history and the
              narrative
            </li>
            <li>
              <span className="font-medium">Confidence scoring:</span> Rates
              every finding from primary-source verified to popular belief
            </li>
          </ul>
        </div>
      </section>

      <section className="swiss-grid swiss-rule pt-6 pb-12">
        <h2 className="swiss-label">Research templates</h2>
        <div className="space-y-4 text-sm leading-relaxed">
          <p>
            Ships with Markdown templates for structured reference entries:{" "}
            <code>person</code>, <code>location</code>, <code>culture</code>,{" "}
            <code>event</code>, <code>timeline</code>, <code>daily-life</code>,{" "}
            <code>language-glossary</code>, <code>comparison</code>, and a
            top-level <code>research-index</code>. Point the agent at a template
            and it fills in what it can, flags what needs writer input, and
            keeps the research organized across a long project.
          </p>
        </div>
      </section>

      <section className="swiss-grid swiss-rule pt-6 pb-12">
        <h2 className="swiss-label">Stack</h2>
        <div className="text-sm leading-relaxed space-y-2">
          <p>Claude Code · Anthropic SDK · Markdown templates</p>
          <p>
            <a
              href="https://github.com/highschoolsmokers/historical-research-agent"
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
