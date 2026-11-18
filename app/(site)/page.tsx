import type { Metadata } from "next";
import { JsonLd, Row, Rows, Section, ext } from "@/app/components/ui";
import { projects } from "@/lib/projects";
import { bookHref, bookMeta, orderedBooks } from "@/lib/books";
import { profiles, site, SITE_URL } from "@/lib/site/content";
import { PDFS } from "@/lib/site/resume";
import { getSubstackPosts, SUBSCRIBE_URL } from "@/lib/substack";
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
          {site.now && (
            <div className="pt-6">
              <h3 className="sub-head">Now</h3>
              <p>{site.now}</p>
            </div>
          )}
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
          {/* Substack refuses sign-ups from other servers, so the address goes
              to its subscribe page, which prefills it; the reader confirms there. */}
          <form
            action={SUBSCRIBE_URL}
            method="get"
            {...ext}
            aria-label="Subscribe on Substack"
            className="space-y-4"
          >
            <h3 className="sub-head">Newsletter</h3>
            <div className="grid grid-cols-8 items-baseline gap-[var(--gutter)]">
              <input
                name="email"
                type="email"
                required
                aria-label="Email"
                placeholder="Email"
                autoComplete="email"
                className="field col-span-5 md:col-span-6"
              />
              <button
                type="submit"
                className="col-span-3 justify-self-start border border-foreground px-(--gutter) py-[calc(var(--gutter)/4)] font-medium transition-colors hover:bg-foreground hover:text-background md:col-span-2"
              >
                Subscribe
              </button>
            </div>
            <p className="text-xs text-muted">
              Opens Substack to confirm. Free; unsubscribe anytime.
            </p>
          </form>
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
      </Section>

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
