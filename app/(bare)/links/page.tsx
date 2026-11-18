import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import portrait from "@/app/(site)/portrait.png";
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
      {/* The portrait matches the Instagram profile picture, so visitors know
          they're in the right place. Square, not a circle (§6.1 bans curved corners), on grid columns, with the name beside it. */}
      <div className="site-header swiss-grid items-end">
        <Image
          src={portrait}
          alt="Illustrated portrait of W.S. Gong"
          sizes="(min-width: 768px) 10rem, 25vw"
          className="col-span-4 aspect-square h-auto w-full object-cover object-top md:col-span-2"
          priority
        />
        <h1 className="col-span-8 swiss-display text-3xl md:col-span-10">
          <Link href="/">W.S. Gong</Link>
        </h1>
      </div>
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
