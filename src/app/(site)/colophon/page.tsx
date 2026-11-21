import type { Metadata } from "next";
import { NewTab, PageTitle, Section, ext } from "@/app/components/ui";
import { stack, tools } from "@/lib/colophon";
import { site } from "@/lib/site/content";
import { linkBase } from "@/lib/site/schema";

// This repo, under the master's GitHub link.
const source = `${linkBase(site.links, "GitHub")}/ws-gong`;

export const metadata: Metadata = {
  title: "Colophon",
  description: "Typography, design, and technology behind ws-gong.com.",
};

const list = (items: string[]) => (
  <ul className="space-y-1">
    {items.map((i) => (
      <li key={i}>{i}</li>
    ))}
  </ul>
);

export default function Colophon() {
  return (
    <>
      <PageTitle>Colophon</PageTitle>
      <Section title="Typography">
        <p>
          Set in{" "}
          <a href="https://vercel.com/font" className="underline" {...ext}>
            Geist
            <NewTab />
          </a>{" "}
          by Vercel, served from this site. Three weights: bold for display,
          medium for titles and labels, regular for text.
        </p>
      </Section>
      <Section title="Design">
        <p>
          The Swiss International Typographic Style, after Josef
          Müller-Brockmann&rsquo;s <em>Grid Systems in Graphic Design</em> and
          Emil Ruder&rsquo;s <em>Typographie</em>. One twelve-column grid,
          everything flush left on a column line, labels left and content right.
          Black, white, one gray, and red for errors only; hierarchy comes from
          scale and position, not ornament. Light and dark, following your
          system or the switch in the footer. Automated tests check the grid on
          every page at desktop and phone widths.
        </p>
      </Section>
      <Section title="Content">
        {list([
          "Biography and fiction credits — synced from the master résumé",
          "Substack — latest posts from the Substack API, also in the RSS feed",
          "Reading — one Markdown file per book; covers from Open Library",
          "Fabulosa Books tutorial — synced from its own repo, highlighted at sync",
          "Résumé and CV — PDFs in Vercel Blob storage",
        ])}
      </Section>
      <Section title="Stack">{list(stack.map((e) => e.label))}</Section>
      <Section title="Tools">{list(tools.map((e) => e.label))}</Section>
      <Section title="Source">
        <a href={source} className="underline" {...ext}>
          {source.replace(/^https:\/\//, "")}
          <NewTab />
        </a>
      </Section>
    </>
  );
}
