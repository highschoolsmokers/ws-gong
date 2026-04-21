import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Literary Research Plugin",
  description:
    "A Claude Code plugin for writers and scholars — finds real published works, extracts verified quotes with citations, and builds structured reference material around themes and craft techniques.",
  openGraph: {
    title: "Literary Research Plugin — W.S. Gong",
    description:
      "A Claude Code plugin for writers and scholars — finds real published works, extracts verified quotes with citations, and builds structured reference material around themes and craft techniques.",
  },
};

export default function LitResearchPlugin() {
  return (
    <div className="space-y-0">
      <h1 className="swiss-display text-[2.5rem] md:text-[3.5rem] pb-12">
        Literary Research Plugin
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
            plugin for writers and literary scholars. Finds real published works
            relevant to a topic or craft question, extracts verified quotations
            with precise citations, and builds annotated reading lists. Every
            quote is tagged with a confidence marker so you always know what
            you&apos;re working with.
          </p>
          <p>
            Works standalone with manual archive verification, or connects to{" "}
            <Link href="/code/lit-verity-mcp" className=" font-medium">
              Lit Verity
            </Link>{" "}
            for machine-verified source grounding with an indexed corpus and
            claims database.
          </p>
        </div>
      </section>

      <section className="swiss-grid swiss-rule pt-6 pb-12">
        <h2 className="swiss-label">What it does</h2>
        <div className="space-y-4 text-sm leading-relaxed">
          <ul className="space-y-2">
            <li>
              <span className="font-medium">Source discovery:</span> Finds
              novels, stories, poems, essays, and criticism relevant to a topic,
              theme, or craft question
            </li>
            <li>
              <span className="font-medium">Quotation research:</span> Extracts
              real quotes with precise citations and confidence markers —{" "}
              <code>[verified — original accessed]</code> through{" "}
              <code>[unverified]</code>
            </li>
            <li>
              <span className="font-medium">Thematic analysis:</span> Traces how
              different authors handle the same theme, side by side
            </li>
            <li>
              <span className="font-medium">Craft study:</span> Analyzes how
              published writers execute specific techniques, grounded in actual
              passages, with genre-specific vocabulary
            </li>
            <li>
              <span className="font-medium">Revision companion:</span> Takes a
              draft passage and finds published models that handle the same
              craft problem
            </li>
            <li>
              <span className="font-medium">Translation-aware research:</span>{" "}
              Compares translations of the same passage, names translators in
              every citation, recommends specific editions
            </li>
            <li>
              <span className="font-medium">Intertextuality mapping:</span> Maps
              epigraphs, allusions, structural borrowings, and rewritings
              between works
            </li>
            <li>
              <span className="font-medium">Reading path construction:</span>{" "}
              Sequences works pedagogically with alternate routes and time
              estimates
            </li>
          </ul>
        </div>
      </section>

      <section className="swiss-grid swiss-rule pt-6 pb-12">
        <h2 className="swiss-label">What it refuses to do</h2>
        <div className="space-y-4 text-sm leading-relaxed">
          <p>
            Fabricate quotes. Invent sources. Present paraphrases as exact
            quotations. Cite works that don&apos;t exist. Use web search as
            verification — quotes are verified against original texts in digital
            archives and libraries, and every quote carries a confidence tag so
            the writer can see exactly what was verified and how.
          </p>
        </div>
      </section>

      <section className="swiss-grid swiss-rule pt-6 pb-12">
        <h2 className="swiss-label">Stack</h2>
        <div className="text-sm leading-relaxed space-y-2">
          <p>Claude Code · Anthropic SDK · MCP (optional)</p>
          <p>
            <a
              href="https://github.com/highschoolsmokers/lit-research-plugin"
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
