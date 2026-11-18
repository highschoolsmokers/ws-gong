import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/app/components/icons";
import SubstackForm from "@/app/components/SubstackForm";
import { Row, Rows, Section } from "@/app/components/ui";
import { profiles, site } from "@/lib/site/content";
import { getSubstackPosts } from "@/lib/substack";

export const metadata: Metadata = {
  title: "Links",
  description: "W.S. Gong — links and profiles.",
};

// Instagram link-in-bio page (SPEC §2): the site grid without the site chrome.
// No Instagram row: visitors are arriving from there.
// The main site leads, labelled with what's there: the h1 home link alone
// didn't read as a way in.
const links = [
  { label: "ws-gong.com", url: "/", note: "writing, code, CV" },
  { label: "Fabulosa Books", url: "https://www.fabulosabooks.com/" },
  ...profiles.filter((p) => p.label !== "Instagram"),
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
        <SubstackForm />
      </Section>
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
                  {"note" in l && (
                    <span className="font-normal text-muted">{l.note}</span>
                  )}
                </span>
              }
            />
          ))}
        </Rows>
      </Section>
    </div>
  );
}
