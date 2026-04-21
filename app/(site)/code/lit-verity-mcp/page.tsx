import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Lit Verity",
  description:
    "An MCP server that grounds AI literary criticism in verifiable sources — preventing hallucinated citations, fabricated quotations, and distorted arguments.",
  openGraph: {
    title: "Lit Verity — W.S. Gong",
    description:
      "An MCP server that grounds AI literary criticism in verifiable sources — preventing hallucinated citations, fabricated quotations, and distorted arguments.",
  },
};

export default function LitVerityMcp() {
  return (
    <div className="space-y-0">
      <h1 className="swiss-display text-[2.5rem] md:text-[3.5rem] pb-12">
        Lit Verity
      </h1>
      <section className="swiss-grid swiss-rule pt-6 pb-12">
        <h2 className="swiss-label">Overview</h2>
        <div className="space-y-4 text-sm leading-relaxed">
          <p>
            An{" "}
            <a
              href="https://modelcontextprotocol.io"
              target="_blank"
              rel="noopener noreferrer"
              className=" font-medium"
            >
              MCP server
            </a>{" "}
            that interposes a truth model between an AI agent and its output
            when working in academic literary criticism. Every citation,
            quotation, argument characterization, and theoretical relationship
            passes through verification tools backed by a curated corpus, a
            claims database, and external bibliographic APIs.
          </p>
          <p>
            Large language models working in literary criticism routinely
            fabricate citations, misquote texts, distort arguments, and
            misattribute ideas — errors that sound authoritative but are
            difficult to catch. Lit Verity forces every claim through a
            confidence-tagged verification pipeline: <code>VERIFIED</code>,{" "}
            <code>PLAUSIBLE</code>, <code>UNVERIFIED</code>,{" "}
            <code>INFERENCE</code>, or <code>FLAGGED</code>.
          </p>
        </div>
      </section>

      <section className="swiss-grid swiss-rule pt-6 pb-12">
        <h2 className="swiss-label">Tools exposed</h2>
        <div className="space-y-4 text-sm leading-relaxed">
          <ul className="space-y-2">
            <li>
              <span className="font-medium">lit_search_texts</span> — Semantic,
              exact keyword, and hybrid search over an indexed corpus with
              Voyage AI embeddings
            </li>
            <li>
              <span className="font-medium">lit_lookup_claims</span> — Query a
              structured database of what theorists actually argued, with source
              passages
            </li>
            <li>
              <span className="font-medium">lit_query_graph</span> — Traverse a
              relationship graph of theoretical positions (critiques, extends,
              responds to, misreads)
            </li>
            <li>
              <span className="font-medium">lit_verify_citation</span> —
              Parallel lookups against CrossRef, Semantic Scholar, and OpenAlex
            </li>
            <li>
              <span className="font-medium">lit_verify_output</span> —
              Post-generation audit of the agent&apos;s own output with graded
              confidence scoring
            </li>
            <li>
              <span className="font-medium">lit_ingest_pdf</span> &amp;{" "}
              <span className="font-medium">lit_procure_source</span> — Ingest
              PDFs with OCR; find, download, and ingest missing sources on
              demand
            </li>
            <li>
              <span className="font-medium">lit_export_bibliography</span> —
              Formatted works-cited output in MLA, Chicago, or APA from verified
              citations only
            </li>
          </ul>
        </div>
      </section>

      <section className="swiss-grid swiss-rule pt-6 pb-12">
        <h2 className="swiss-label">Architecture</h2>
        <div className="space-y-4 text-sm leading-relaxed">
          <ul className="space-y-2">
            <li>
              <span className="font-medium">Storage:</span> Neon Postgres with
              pgvector for text chunk embeddings
            </li>
            <li>
              <span className="font-medium">Schema:</span> canonical_texts,
              text_chunks, claims, claim_relations, citations, source_files,
              verification_log, procurement_queue, annotations
            </li>
            <li>
              <span className="font-medium">Transport:</span> Works with any
              MCP-capable client — Claude Code, claude.ai, or custom Anthropic
              SDK applications
            </li>
            <li>
              <span className="font-medium">Paired with:</span> Literary
              Research Plugin for MCP-aware confidence tagging and guided
              research templates
            </li>
          </ul>
        </div>
      </section>

      <section className="swiss-grid swiss-rule pt-6 pb-12">
        <h2 className="swiss-label">Stack</h2>
        <div className="text-sm leading-relaxed space-y-2">
          <p>TypeScript · MCP SDK · Neon · pgvector · Voyage AI · Zod</p>
          <p>
            <a
              href="https://github.com/highschoolsmokers/lit-verity-mcp"
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
