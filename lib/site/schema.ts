import { z } from "zod";

// Links the home page shows in their own sections (Code, Writing and the
// footer), so the schema requires them and the CV list skips them.
export const ELSEWHERE_ON_HOME = ["GitHub", "Substack"];

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
          ELSEWHERE_ON_HOME.every((l) => links.some((x) => x.label === l)),
        "links needs GitHub and Substack",
      ),
  })
  .strict();

// The URL of the link with this label (the schema guarantees GitHub and Substack).
export const linkUrl = (
  links: { label: string; url: string }[],
  label: string,
) => links.find((l) => l.label === label)!.url;

// The PDFs live in public blob storage, not git (SPEC §13), each served at
// its own path through a rewrite.
const BLOB = "https://apie6diz2oc6rfb7.public.blob.vercel-storage.com";
export const PDFS = {
  resume: "wsgong_tech_writer_resume.pdf",
  cv: "wsgong_cv.pdf",
};
export const blobUrl = (name: string) => `${BLOB}/${name}`;
