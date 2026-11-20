import type { Metadata } from "next";
import { PageTitle, Row, Rows, Section } from "@/app/components/ui";
import { TUTORIAL_PATH, partPath } from "@/lib/tutorial";
import { findPart, tutorial } from "@/lib/tutorial-content";

export const dynamicParams = false;
export const generateStaticParams = () =>
  tutorial.parts.map((p) => ({ part: p.slug }));

export async function generateMetadata({
  params,
}: PageProps<"/fabulosa-books/[part]">): Promise<Metadata> {
  // dynamicParams is off, so the slug always names a part.
  const p = findPart((await params).part)!;
  return {
    title: `${p.title} — Fabulosa Books tutorial`,
    description: p.description,
  };
}

export default async function TutorialPart({
  params,
}: PageProps<"/fabulosa-books/[part]">) {
  const slug = (await params).part;
  const i = tutorial.parts.findIndex((p) => p.slug === slug);
  const part = tutorial.parts[i];
  const prev = tutorial.parts[i - 1];
  const next = tutorial.parts[i + 1];

  return (
    <>
      <p className="swiss-label pb-4 text-muted">Part {i + 1}</p>
      <PageTitle>{part.title}</PageTitle>
      {part.sections.map((s, n) => (
        <Section key={n} title={s.title}>
          {/* Trusted HTML from `pnpm sync:tutorial` (src/lib/tutorial.ts). */}
          <div
            className="tutorial"
            dangerouslySetInnerHTML={{ __html: s.html }}
          />
        </Section>
      ))}
      <Section title="Continue">
        <Rows>
          {next && (
            <Row
              href={partPath(next.slug)}
              title={next.title}
              meta={`Next: Part ${i + 2}`}
            />
          )}
          {prev && (
            <Row
              href={partPath(prev.slug)}
              title={prev.title}
              meta={`Previous: Part ${i}`}
            />
          )}
          <Row href={TUTORIAL_PATH} title="Contents" meta={tutorial.title} />
        </Rows>
      </Section>
    </>
  );
}
