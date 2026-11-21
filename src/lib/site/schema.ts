import { z } from "zod";

// Links the home page shows in a place of their own, so the CV list skips
// them: GitHub and Fabulosa Books under Code, Substack under Writing and in
// the footer, Instagram in the footer. The schema requires GitHub and
// Substack; the other two show in their places when the master has them.
const REQUIRED_LINKS = ["GitHub", "Substack"];
export const ELSEWHERE_ON_HOME = [
  ...REQUIRED_LINKS,
  "Fabulosa Books",
  "Instagram",
];

// What the résumé master feeds the site (SPEC §14): the shape of
// content/site.json and where the PDFs live. No path aliases: the sync
// script and next.config.ts import this file directly.
export const siteContentSchema = z
  .object({
    statement: z.array(z.string().min(1)).min(1),
    bio: z.array(z.string().min(1)).min(1),
    published: z.array(
      z
        .object({
          title: z.string().min(1),
          venue: z.string(),
          detail: z.string(),
          url: z.url().optional(),
        })
        .strict(),
    ),
    // Every link the site shows, in display order, from the master's
    // Website → Links.
    links: z
      .array(z.object({ label: z.string().min(1), url: z.url() }).strict())
      .min(1)
      .refine(
        (links) =>
          REQUIRED_LINKS.every((l) => links.some((x) => x.label === l)),
        "links needs GitHub and Substack",
      ),
  })
  .strict();

type Link = { label: string; url: string };

// The link with this label, if the master has it.
export const findLink = (links: Link[], label: string) =>
  links.find((l) => l.label === label);

// The URL of a link the schema guarantees (REQUIRED_LINKS).
export const linkUrl = (links: Link[], label: string) =>
  findLink(links, label)!.url;
// The same URL with no trailing slash, to build paths under.
export const linkBase = (links: Link[], label: string) =>
  linkUrl(links, label).replace(/\/$/, "");

// The PDFs live in public blob storage, not git (SPEC §13), each served at
// its own path through a rewrite.
const BLOB = "https://apie6diz2oc6rfb7.public.blob.vercel-storage.com";
export const PDFS = {
  resume: "wsgong_tech_writer_resume.pdf",
  cv: "wsgong_cv.pdf",
};
export const blobUrl = (name: string) => `${BLOB}/${name}`;
