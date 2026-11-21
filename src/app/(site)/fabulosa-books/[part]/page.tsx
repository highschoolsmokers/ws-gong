import type { Metadata } from "next";
import { PageTitle, Row, Rows, Section } from "@/app/components/ui";
import { TUTORIAL_PATH, partPath } from "@/lib/tutorial";
import { tutorial } from "@/lib/tutorial-content";

export const dynamicParams = false;
// dynamicParams is off, so the slug always names a part.
const at = (slug: string) => tutorial.parts.findIndex((p) => p.slug === slug);
export const generateStaticParams = () =>
  tutorial.parts.map((p) => ({ part: p.slug }));

export async function generateMetadata({
  params,
}: PageProps<"/fabulosa-books/[part]">): Promise<Metadata> {
  const p = tutorial.parts[at((await params).part)];
  return {
    title: `${p.title} — Fabulosa Books tutorial`,
    description: p.description,
  };
}

export default async function TutorialPart({
  params,
}: PageProps<"/fabulosa-books/[part]">) {
  const i = at((await params).part);
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
