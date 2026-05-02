import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Swiss Design Workbench",
  description:
    "A working studio for design in the Swiss International Typographic Style — grid, type, and objectivity applied to web and print.",
  openGraph: {
    title: "Swiss Design Workbench — W.S. Gong",
    description:
      "A working studio for design in the Swiss International Typographic Style — grid, type, and objectivity applied to web and print.",
  },
};

export default function SwissDesignWorkbench() {
  return (
    <div className="space-y-0">
      <h1 className="swiss-display text-[2.5rem] md:text-[3.5rem] pb-12">
        Swiss Design Workbench
      </h1>
      <section className="swiss-grid swiss-rule pt-6 pb-12">
        <h2 className="swiss-label">Overview</h2>
        <div className="space-y-4 text-sm leading-relaxed">
          <p>
            A working studio for design in the Swiss tradition — the
            International Typographic Style and Neue Grafik — applied to web
            interfaces and static graphics. Every piece reads from a single
            token system and a shared baseline reset. No bespoke colors, no
            local type scales, no ornament.
          </p>
          <p>
            Vanilla HTML and CSS with hand-authored SVG for the graphics. Vite
            for the dev server. The grid is the foundation; typography carries
            hierarchy; asymmetric balance sits on a rigorous column structure.
          </p>
        </div>
      </section>

      <section className="swiss-grid swiss-rule pt-6 pb-12">
        <h2 className="swiss-label">Structure</h2>
        <div className="space-y-4 text-sm leading-relaxed">
          <ul className="space-y-2">
            <li>
              <span className="font-medium">tokens.css</span> — the source of
              truth for grid, type, color, and spacing. Imported by every piece;
              never restated locally.
            </li>
            <li>
              <span className="font-medium">base.css</span> — reset and baseline
              typography, built on the tokens.
            </li>
            <li>
              <span className="font-medium">overlays.css</span> — togglable
              12-column grid and 8-pixel baseline overlays for construction and
              debug.
            </li>
            <li>
              <span className="font-medium">web/</span> — interactive web
              pieces, one folder per piece, each with a{" "}
              <code className="text-xs">notes.md</code> documenting grid
              construction and rationale before any markup.
            </li>
            <li>
              <span className="font-medium">graphics/</span> — static graphics
              authored as hand-written SVG.
            </li>
            <li>
              <span className="font-medium">studies/</span> — short exercises
              and type specimens.
            </li>
          </ul>
        </div>
      </section>

      <section className="swiss-grid swiss-rule pt-6 pb-12">
        <h2 className="swiss-label">Overlays</h2>
        <div className="space-y-4 text-sm leading-relaxed">
          <p>
            Any page that includes <code className="text-xs">overlays.css</code>{" "}
            exposes two construction guides:
          </p>
          <ul className="space-y-2">
            <li>
              <span className="font-medium">G</span> — toggle the 12-column grid
              overlay.
            </li>
            <li>
              <span className="font-medium">B</span> — toggle the 8-pixel
              baseline overlay.
            </li>
          </ul>
          <p>
            A fixed toggle in the bottom-right mirrors the shortcuts for touch.
          </p>
        </div>
      </section>

      <section className="swiss-grid swiss-rule pt-6 pb-12">
        <h2 className="swiss-label">Principles</h2>
        <div className="space-y-4 text-sm leading-relaxed">
          <p>
            Clarity over ornament. Objectivity over expression. One token
            system, one baseline, one grid. Every piece is legible without the
            notes — and the notes exist anyway, because the construction should
            be as honest as the output.
          </p>
        </div>
      </section>

      <section className="swiss-grid swiss-rule pt-6 pb-12">
        <h2 className="swiss-label">Stack</h2>
        <div className="text-sm leading-relaxed space-y-2">
          <p>Vanilla HTML · CSS · Hand-authored SVG · Vite</p>
          <p>
            <a
              href="https://github.com/highschoolsmokers/swiss-design-workbench"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium"
            >
              View on GitHub →
            </a>
          </p>
          <p>
            <a
              href="https://workbench.ws-gong.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium"
            >
              Visit the workbench →
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
