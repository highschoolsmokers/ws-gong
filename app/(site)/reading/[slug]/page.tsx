import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageTitle, Row, Rows, Section } from "@/app/components/ui";
import { bookMeta, coverPath, reviewed } from "@/lib/books";
import { SITE_URL } from "@/lib/site/content";
import { goodreadsHtml, reviewHtml } from "@/lib/review";
import CopyForGoodreads from "./CopyForGoodreads";

export const dynamicParams = false;
export const generateStaticParams = () =>
  reviewed.map((b) => ({ slug: b.slug }));

const find = (slug: string) => reviewed.find((b) => b.slug === slug);

export async function generateMetadata({
  params,
}: PageProps<"/reading/[slug]">): Promise<Metadata> {
  const b = find((await params).slug);
  if (!b) return {};
  return {
    title: `${b.title} by ${b.author}`,
    description: b.note ?? `W.S. Gong reviews ${b.title} by ${b.author}.`,
  };
}

export default async function Review({ params }: PageProps<"/reading/[slug]">) {
  const b = find((await params).slug);
  if (!b) notFound();
  const cover = coverPath(b);
  const url = `${SITE_URL}/reading/${b.slug}`;
  const ld = {
    "@context": "https://schema.org",
    "@type": "Review",
    url,
    author: { "@type": "Person", name: "W.S. Gong", url: SITE_URL },
    ...(b.finished !== "reading" && { datePublished: b.finished }),
    itemReviewed: {
      "@type": "Book",
      name: b.title,
      author: { "@type": "Person", name: b.author },
      ...(b.isbn && { isbn: b.isbn.replaceAll("-", "") }),
    },
    ...(b.rating && {
      reviewRating: {
        "@type": "Rating",
        ratingValue: b.rating,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };
  const elsewhere = [
    b.substack && { label: "Substack", url: b.substack },
    b.goodreads && { label: "Goodreads", url: b.goodreads },
  ].filter((x) => !!x);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
      <PageTitle>{b.title}</PageTitle>
      <Section title={b.author}>
        <div className="max-w-prose space-y-6">
          {cover && (
            <Image
              src={cover}
              alt={`Cover of ${b.title}`}
              width={400}
              height={600}
              sizes="12rem"
              className="h-auto w-48"
            />
          )}
          <p className="row-meta">{bookMeta(b)}</p>
          <div
            className="review"
            dangerouslySetInnerHTML={{ __html: reviewHtml(b.review) }}
          />
          {process.env.NODE_ENV === "development" && (
            <CopyForGoodreads html={goodreadsHtml(b.review)} />
          )}
        </div>
      </Section>
      {elsewhere.length > 0 && (
        <Section title="Also on">
          <Rows>
            {elsewhere.map((e) => (
              <Row key={e.label} href={e.url} title={e.label} />
            ))}
          </Rows>
        </Section>
      )}
      <Section title="Reading">
        <Link href="/reading" className="font-medium">
          ← All reading
        </Link>
      </Section>
    </>
  );
}
