import type { Metadata } from "next";
import {
  featuredProjects,
  listedProjects,
  projects,
} from "@/lib/code/projects";
import { orderedBooks } from "@/lib/reading/books";
import { site } from "@/lib/site/content";
import { RESUME_PATH } from "@/lib/site/resume";
import {
  getSubstackPosts,
  SUBSTACK_BASE_URL,
  SUBSTACK_SUBDOMAIN,
} from "@/lib/substack";
import ContactForm from "./_home/ContactForm";
import { Row, RowList, Section, SubHead } from "./_home/ui";

const description = site.statement.join(" ");

export const metadata: Metadata = {
  title: "W.S. Gong — Stories & Systems",
  description,
  openGraph: { title: "W.S. Gong — Stories & Systems", description },
};

const RECENT_POSTS = 5;
const RECENT_BOOKS = 5;

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
      url: p.href.startsWith("http")
        ? p.href
        : `https://www.ws-gong.com${p.href}`,
      author: { "@type": "Person", name: "W.S. Gong" },
      keywords: [...p.stack, ...p.tags],
    },
  })),
};

function monthYear(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });
}

function ProjectRows({ list }: { list: typeof projects }) {
  return (
    <RowList>
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
    </RowList>
  );
}

export default async function Home() {
  const posts = (await getSubstackPosts(SUBSTACK_SUBDOMAIN)).slice(
    0,
    RECENT_POSTS,
  );
  const books = orderedBooks.slice(0, RECENT_BOOKS);

  // Sections number themselves, so an empty one (no books yet) leaves no gap.
  let n = 0;
  const next = () => ++n;

  return (
    <div>
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

      <Section id="work" index={next()} title="Work">
        <div className="space-y-14">
          {featuredProjects.length > 0 && (
            <div>
              <SubHead>Featured</SubHead>
              <ProjectRows list={featuredProjects} />
            </div>
          )}
          {listedProjects.length > 0 && (
            <div>
              <SubHead>Index</SubHead>
              <ProjectRows list={listedProjects} />
            </div>
          )}
        </div>
      </Section>

      <Section id="writing" index={next()} title="Writing">
        <div className="space-y-14">
          {site.published.length > 0 && (
            <div>
              <SubHead>Fiction</SubHead>
              <RowList>
                {site.published.map((p) => (
                  <Row
                    key={p.title}
                    href={p.url}
                    title={p.title}
                    meta={[p.venue, p.detail].filter(Boolean).join(" · ")}
                  />
                ))}
              </RowList>
            </div>
          )}
          {site.editing.length > 0 && (
            <div>
              <SubHead>Editing</SubHead>
              <RowList>
                {site.editing.map((e) => (
                  <Row
                    key={`${e.org}-${e.title}`}
                    title={`${e.title}, ${e.org}`}
                    meta={e.dates}
                  >
                    {e.summary}
                  </Row>
                ))}
              </RowList>
            </div>
          )}
          {posts.length > 0 && (
            <div>
              <SubHead>Newsletter</SubHead>
              <RowList>
                {posts.map((post) => (
                  <Row
                    key={post.id}
                    href={post.canonical_url}
                    title={post.title}
                    meta={monthYear(post.post_date)}
                  >
                    {post.subtitle}
                  </Row>
                ))}
              </RowList>
              <p className="mt-6 text-sm">
                <a
                  href={`${SUBSTACK_BASE_URL}/subscribe`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium"
                >
                  Subscribe on Substack →
                </a>
              </p>
            </div>
          )}
        </div>
      </Section>

      {books.length > 0 && (
        <Section id="reading" index={next()} title="Reading">
          <RowList>
            {books.map((b) => (
              <Row
                key={`${b.title}::${b.author}`}
                href={b.link}
                title={b.title}
                meta={b.finished === "reading" ? "Reading" : b.finished}
              >
                {b.note ? `${b.author}. ${b.note}` : b.author}
              </Row>
            ))}
          </RowList>
        </Section>
      )}

      <Section id="resume" index={next()} title="Résumé">
        <RowList>
          <Row href={RESUME_PATH} title="Résumé (PDF)" />
          <Row href={site.links.linkedin} title="LinkedIn" />
          <Row href={site.links.github} title="GitHub" />
        </RowList>
      </Section>

      <Section
        id="contact"
        index={next()}
        title="Contact"
        after={<ContactForm />}
      >
        <p className="text-base leading-relaxed">
          For readings, panels, workshops, or any other inquiries, get in touch.
        </p>
      </Section>
    </div>
  );
}
