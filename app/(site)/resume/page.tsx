import type { Metadata } from "next";
import PageTitle from "@/app/components/PageTitle";
import { RESUME_PATH } from "@/lib/site/resume";

const description =
  "Résumé of W.S. Gong: developer documentation, AI tooling, editing.";

export const metadata: Metadata = {
  title: "Resume",
  description,
  openGraph: { title: "Resume — W.S. Gong", description },
};

export default function Resume() {
  return (
    <>
      <PageTitle>Resume</PageTitle>

      <section className="swiss-grid swiss-rule pt-6 pb-16">
        <div className="col-span-12 md:col-span-4">
          <h2 className="swiss-label">PDF</h2>
        </div>
        <div className="col-span-12 md:col-span-8 space-y-6">
          <p className="text-sm">
            <a
              href={RESUME_PATH}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium"
            >
              Download PDF
            </a>
          </p>
          <object
            data={RESUME_PATH}
            type="application/pdf"
            aria-label="Resume (PDF)"
            className="hidden md:block w-full h-[80vh] border border-neutral-200"
          >
            <p className="text-sm">
              This browser can&apos;t show the PDF here.{" "}
              <a href={RESUME_PATH}>Open the PDF</a>.
            </p>
          </object>
        </div>
      </section>
    </>
  );
}
