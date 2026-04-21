import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Colophon",
  description: "Typography, tools, and technology behind ws-gong.com.",
  openGraph: {
    title: "Colophon — W.S. Gong",
    description: "Typography, tools, and technology behind ws-gong.com.",
  },
};

export default function Colophon() {
  return (
    <>
      <section className="swiss-grid swiss-rule pt-6 pb-12">
        <h1 className="swiss-label">Colophon</h1>
        <div />
      </section>

      <section className="swiss-grid swiss-rule pt-6 pb-12">
        <h2 className="swiss-label">Typography</h2>
        <div className="space-y-4 text-sm leading-relaxed">
          <p>
            Set in{" "}
            <a
              href="https://vercel.com/font"
              className="underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Geist
            </a>{" "}
            by Vercel. System monospace for code.
          </p>
        </div>
      </section>

      <section className="swiss-grid swiss-rule pt-6 pb-12">
        <h2 className="swiss-label">Design</h2>
        <div className="space-y-4 text-sm leading-relaxed">
          <p>
            Informed by the Swiss International Typographic Style. Asymmetric
            grid, black-and-white palette, strong hierarchy through weight and
            scale. Responsive across breakpoints.
          </p>
        </div>
      </section>

      <section className="swiss-grid swiss-rule pt-6 pb-12">
        <h2 className="swiss-label">Stack</h2>
        <div className="space-y-4 text-sm leading-relaxed">
          <ul className="space-y-1">
            <li>Next.js 16</li>
            <li>React 19</li>
            <li>Tailwind CSS 4</li>
            <li>TypeScript</li>
            <li>Vercel</li>
          </ul>
        </div>
      </section>

      <section className="swiss-grid swiss-rule pt-6 pb-12">
        <h2 className="swiss-label">Tools</h2>
        <div className="space-y-4 text-sm leading-relaxed">
          <ul className="space-y-1">
            <li>Nodemailer — contact form delivery</li>
            <li>PDFKit — resume generation</li>
            <li>Playwright — end-to-end testing</li>
            <li>Sentry — error monitoring</li>
            <li>Vercel Analytics — visitor insights</li>
          </ul>
        </div>
      </section>

      <section className="swiss-grid swiss-rule pt-6 pb-12">
        <h2 className="swiss-label">Source</h2>
        <div className="space-y-4 text-sm leading-relaxed">
          <p>
            <a
              href="https://github.com/highschoolsmokers/ws-gong"
              className="underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              github.com/highschoolsmokers/ws-gong
            </a>
          </p>
        </div>
      </section>
    </>
  );
}
