import type { Metadata } from "next";
import { Row, Rows, Section, ext } from "@/app/components/ui";
import {
  featuredProjects,
  listedProjects,
  projects,
} from "@/lib/code/projects";
import { orderedBooks } from "@/lib/reading/books";
import { site } from "@/lib/site/content";
import { RESUME_PATH } from "@/lib/site/resume";
import { getSubstackPosts, SUBSTACK_BASE_URL } from "@/lib/substack";
import ContactForm from "./ContactForm";

const title = "W.S. Gong — Stories & Systems";
const description = site.statement.join(" ");
export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description },
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
      url: new URL(p.href, "https://www.ws-gong.com").href,
      keywords: p.stack,
    },
  })),
};

const ProjectRows = ({
  title,
  list,
}: {
  title: string;
  list: typeof projects;
}) =>
  list.length > 0 && (
    <Rows title={title}>
      {list.map((p) => (
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
  );

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

      <Section id="work" index={++n} title="Work">
        <div className="space-y-14">
          <ProjectRows title="Featured" list={featuredProjects} />
          <ProjectRows title="Index" list={listedProjects} />
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
          <Rows title="Editing">
            {site.editing.map((e) => (
              <Row key={e.org} title={`${e.title}, ${e.org}`} meta={e.dates}>
                {e.summary}
              </Row>
            ))}
          </Rows>
          {posts.length > 0 && (
            <Rows title="Newsletter">
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
          <a
            href={`${SUBSTACK_BASE_URL}/subscribe`}
            className="block font-medium"
            {...ext}
          >
            Subscribe on Substack →
          </a>
        </div>
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
          <Row href={RESUME_PATH} title="Résumé (PDF)" />
          <Row href={site.links.linkedin} title="LinkedIn" />
          <Row href={site.links.github} title="GitHub" />
        </Rows>
      </Section>

      <Section id="contact" index={++n} title="Contact">
        <p className="text-base">
          For readings, panels, workshops, or any other inquiries, get in touch.
        </p>
        <ContactForm />
      </Section>
    </>
  );
}
