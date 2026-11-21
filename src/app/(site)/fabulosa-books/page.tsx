import type { Metadata } from "next";
import {
  NewTab,
  PageTitle,
  Row,
  Rows,
  Section,
  ext,
} from "@/app/components/ui";
import { site } from "@/lib/site/content";
import { linkBase } from "@/lib/site/schema";
import { partPath } from "@/lib/tutorial";
import { tutorial } from "@/lib/tutorial-content";

// The tutorial and its reference app live in this repo on GitHub.
const repo = `${linkBase(site.links, "GitHub")}/fabulosa-books`;

export const metadata: Metadata = {
  title: tutorial.title,
  description: tutorial.subtitle,
};

export default function TutorialContents() {
  return (
    <>
      <PageTitle>{tutorial.title}</PageTitle>
      <Section title="About">
        <p className="max-w-prose">{tutorial.subtitle}</p>
        <p className="max-w-prose">
          Every code block comes from the finished app in the{" "}
          <a href={repo} className="underline" {...ext}>
            fabulosa-books repository
            <NewTab />
          </a>
          , where a test fails if the tutorial and the code disagree.
        </p>
      </Section>
      <Section title="Contents">
        <Rows>
          {tutorial.parts.map((p, i) => (
            <Row
              key={p.slug}
              href={partPath(p.slug)}
              title={p.title}
              meta={`Part ${i + 1}`}
            >
              {p.description}
            </Row>
          ))}
        </Rows>
      </Section>
    </>
  );
}
