import type { Metadata } from "next";
import { BookRow, PostRow, StoryRow } from "@/app/components/rows";
import SubstackForm from "@/app/components/SubstackForm";
import { JsonLd, Row, Rows, Section, ext } from "@/app/components/ui";
import { projects } from "@/lib/projects";
import { orderedBooks } from "@/lib/books";
import { site, SITE_URL, TAGLINE } from "@/lib/site/content";
import { ELSEWHERE_ON_HOME, linkUrl, PDFS } from "@/lib/site/schema";
import { getSubstackPosts } from "@/lib/substack";
import Image from "next/image";
import Link from "next/link";
import ContactForm from "./ContactForm";
import portrait from "@/app/portrait.png";

export const metadata: Metadata = {
  title: { absolute: `W.S. Gong — ${TAGLINE}` },
  description: site.statement.join(" "),
};

const projectsLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Code Projects by W.S. Gong",
  itemListElement: projects.map((p, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "CreativeWork",
      name: p.title,
      description: p.description,
      url: new URL(p.href, SITE_URL).href,
      keywords: p.stack,
    },
  })),
};

export default async function Home() {
  const posts = await getSubstackPosts(5);
  const books = orderedBooks.slice(0, 5);
  let n = 0; // sections number themselves, so an omitted one leaves no gap

  return (
    <>
      <JsonLd data={projectsLd} />

      <Section id="about" index={0} title="About">
        {/* The portrait sits above the bio, centered on the content's own
            columns: 3–10 of 12 on phones, 2–7 of 8 on tablets, 3–6 of 8 on
            desktop, so every edge lands on a line of the page grid. */}
        <div className="grid grid-cols-12 gap-y-4 gap-x-[var(--gutter)] md:grid-cols-8">
          <Image
            src={portrait}
            alt="Illustrated portrait of W.S. Gong"
            sizes="(min-width: 768px) 22rem, 75vw"
            className="col-span-8 col-start-3 h-auto w-full md:col-span-6 md:col-start-2 lg:col-span-4 lg:col-start-3"
            // In the first viewport on most screens and the page's LCP element.
            loading="eager"
            fetchPriority="high"
          />
          <p className="col-span-12 max-w-prose md:col-span-8">{site.bio[0]}</p>
        </div>
      </Section>

      <Section id="writing" index={++n} title="Writing">
        <div className="space-y-14">
          <Rows title="Fiction">
            {site.published.map((s) => (
              <StoryRow key={s.title} s={s} />
            ))}
          </Rows>
          {posts.length > 0 && (
            <Rows title="Substack">
              {posts.map((p) => (
                <PostRow key={p.id} p={p} />
              ))}
            </Rows>
          )}
          <SubstackForm />
        </div>
      </Section>

      {books.length > 0 && (
        <Section id="reading" index={++n} title="Reading">
          <Rows>
            {books.map((b) => (
              <BookRow key={b.slug} b={b} />
            ))}
          </Rows>
          <Link href="/reading" className="block font-medium">
            All reading and reviews →
          </Link>
        </Section>
      )}

      <Section id="code" index={++n} title="Code">
        <Rows>
          {projects.map((p) => (
            <Row
              key={p.href}
              href={p.href}
              title={p.title}
              meta={p.stack.join(" / ")}
            >
              {p.description}
            </Row>
          ))}
        </Rows>
        <a
          href={linkUrl(site.links, "GitHub")}
          className="block font-medium"
          {...ext}
        >
          More on GitHub →
        </a>
      </Section>

      <Section id="cv" index={++n} title="CV">
        <Rows>
          <Row href={`/${PDFS.cv}`} title="CV (PDF)" />
          <Row href={`/${PDFS.resume}`} title="Résumé (PDF)" />
          {/* Every master link except those with a place of their own here:
              GitHub (under Code) and Substack (Writing, footer). */}
          {site.links
            .filter((p) => !ELSEWHERE_ON_HOME.includes(p.label))
            .map((p) => (
              <Row key={p.label} href={p.url} title={p.label} />
            ))}
        </Rows>
      </Section>

      <Section id="contact" index={++n} title="Contact">
        <ContactForm />
      </Section>
    </>
  );
}
