import type { Metadata } from "next";
import SubstackForm from "@/app/components/SubstackForm";
import { JsonLd, Row, Rows, Section, ext } from "@/app/components/ui";
import { projects } from "@/lib/projects";
import { bookHref, bookMeta, orderedBooks } from "@/lib/books";
import { profiles, site, SITE_URL } from "@/lib/site/content";
import { ELSEWHERE_ON_HOME, linkUrl } from "@/lib/site/content-schema";
import { PDFS } from "@/lib/site/resume";
import { getSubstackPosts } from "@/lib/substack";
import Image from "next/image";
import Link from "next/link";
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
      <JsonLd data={projectsLd} />

      <Section id="about" index={0} title="About">
        {/* The portrait sits above the bio, on the content column's 8 columns:
            4 of them on desktop, 6 on phones. */}
        <div className="grid grid-cols-8 gap-y-4 gap-x-[var(--gutter)]">
          <Image
            src={portrait}
            alt="Illustrated portrait of W.S. Gong"
            sizes="(min-width: 768px) 22rem, 75vw"
            className="col-span-6 h-auto w-full md:col-span-4"
            // In the first viewport on most screens and the page's LCP element.
            loading="eager"
            fetchPriority="high"
          />
          <p className="col-span-8 max-w-prose">{site.bio[0]}</p>
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
          <SubstackForm />
        </div>
      </Section>

      {books.length > 0 && (
        <Section id="reading" index={++n} title="Reading">
          <Rows>
            {books.map((b) => (
              <Row
                key={b.slug}
                href={bookHref(b)}
                title={b.title}
                meta={bookMeta(b)}
              >
                {b.note ? `${b.author}. ${b.note}` : b.author}
              </Row>
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
          {profiles
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
