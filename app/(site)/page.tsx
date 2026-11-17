import type { Metadata } from "next";
import { Row, Rows, Section, ext } from "@/app/components/ui";
import { projects } from "@/lib/projects";
import { orderedBooks } from "@/lib/books";
import { profiles, site, SITE_URL } from "@/lib/site/content";
import { PDFS } from "@/lib/site/resume";
import { getSubstackPosts, SUBSCRIBE_URL } from "@/lib/substack";
import Image from "next/image";
import ContactForm from "./ContactForm";
import portrait from "./portrait.png";

export const metadata: Metadata = {
  title: { absolute: "W.S. Gong — Stories & Systems" },
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectsLd) }}
      />

      <section aria-label="Statement" className="statement swiss-grid">
        <p className="col-span-12 md:col-span-10">
          {site.statement.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </p>
      </section>

      <Section id="about" index={0} title="About">
        {/* The portrait spans the text block's width, directly above the bio. */}
        <div className="max-w-prose space-y-4">
          <Image
            src={portrait}
            alt="Illustrated portrait of W.S. Gong"
            sizes="(min-width: 768px) 40vw, 100vw"
            className="h-auto w-full"
            // In the first viewport on most screens and the page's LCP element.
            loading="eager"
            fetchPriority="high"
          />
          <p>{site.bio[0]}</p>
        </div>
      </Section>

      <Section id="writing" index={++n} title="Writing">
        <div className="space-y-14">
          <Rows title="Fiction">
            {site.published.map((p) => (
              <Row
                key={p.title}
                href={p.url}
                title={p.title}
                meta={[p.venue, p.detail].filter(Boolean).join(" · ")}
              />
            ))}
          </Rows>
          {posts.length > 0 && (
            <Rows title="Substack">
              {posts.map((p) => (
                <Row
                  key={p.id}
                  href={p.canonical_url}
                  title={p.title}
                  meta={new Date(p.post_date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                  })}
                >
                  {p.subtitle}
                </Row>
              ))}
            </Rows>
          )}
          <a href={SUBSCRIBE_URL} className="block font-medium" {...ext}>
            Subscribe on Substack →
          </a>
        </div>
      </Section>

      <Section id="work" index={++n} title="Work">
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
      </Section>

      {books.length > 0 && (
        <Section id="reading" index={++n} title="Reading">
          <Rows>
            {books.map((b) => (
              <Row
                key={b.title + b.author}
                href={b.link}
                title={b.title}
                meta={b.finished === "reading" ? "Reading" : b.finished}
              >
                {b.note ? `${b.author}. ${b.note}` : b.author}
              </Row>
            ))}
          </Rows>
        </Section>
      )}

      <Section id="resume" index={++n} title="Résumé">
        <Rows>
          <Row href={`/${PDFS.resume}`} title="Résumé (PDF)" />
          <Row href={`/${PDFS.cv}`} title="CV (PDF)" />
          {profiles.map((p) => (
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
