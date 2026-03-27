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
      <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
        <h2 className="text-xl md:text-2xl font-black leading-tight">
          Typography
        </h2>
        <div className="space-y-4 text-sm leading-relaxed">
          <p>
            Set in{" "}
            <a
              href="https://vercel.com/font"
              className="underline hover:opacity-70 transition-opacity"
              target="_blank"
              rel="noopener noreferrer"
            >
              Geist
            </a>{" "}
            by Vercel. System monospace for code.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
        <h2 className="text-xl md:text-2xl font-black leading-tight">
          Design
        </h2>
        <div className="space-y-4 text-sm leading-relaxed">
          <p>
            Informed by the Swiss International Typographic Style. Asymmetric
            grid, black-and-white palette, strong hierarchy through weight and
            scale. Responsive across breakpoints.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
        <h2 className="text-xl md:text-2xl font-black leading-tight">Stack</h2>
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

      <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
        <h2 className="text-xl md:text-2xl font-black leading-tight">Tools</h2>
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

      <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
        <h2 className="text-xl md:text-2xl font-black leading-tight">
          Source
        </h2>
        <div className="space-y-4 text-sm leading-relaxed">
          <p>
            <a
              href="https://github.com/highschoolsmokers/ws-gong"
              className="underline hover:opacity-70 transition-opacity"
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
