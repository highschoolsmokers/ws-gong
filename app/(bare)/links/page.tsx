import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/app/components/icons";
import { Row, Rows, Section } from "@/app/components/ui";
import { profiles, site } from "@/lib/site/content";
import { getSubstackPosts } from "@/lib/substack";

export const metadata: Metadata = {
  title: "Links",
  description: "W.S. Gong — links and profiles.",
};

// Instagram link-in-bio page (SPEC §2): the site grid without the site chrome.
const links = [
  { label: "Fabulosa Books", url: "https://www.fabulosabooks.com/" },
  ...profiles,
];

export default async function Links() {
  // The newest of each, from the same sources as the home page: visitors from
  // Instagram usually want whatever is new.
  const [post] = await getSubstackPosts(1);
  const story = site.published[0];
  return (
    <div className="swiss-container pb-24">
      <h1 className="site-header swiss-display text-3xl">
        <Link href="/">W.S. Gong</Link>
      </h1>
      {(post || story) && (
        <Section title="Latest">
          <Rows>
            {post && (
              <Row
                href={post.canonical_url}
                title={post.title}
                meta={`Substack · ${new Date(post.post_date).toLocaleDateString(
                  "en-US",
                  { year: "numeric", month: "long" },
                )}`}
              >
                {post.subtitle}
              </Row>
            )}
            {story && (
              <Row
                href={story.url}
                title={story.title}
                meta={[story.venue, story.detail].filter(Boolean).join(" · ")}
              />
            )}
          </Rows>
        </Section>
      )}
      <Section title="Links">
        <Rows>
          {links.map((l) => (
            <Row
              key={l.label}
              href={l.url}
              title={
                <span className="inline-flex items-center gap-3">
                  <Icon name={l.label} />
                  {l.label}
                </span>
              }
            />
          ))}
        </Rows>
      </Section>
    </div>
  );
}
