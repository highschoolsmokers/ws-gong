import { z } from "zod";

// The shape of content/site.json, written by `pnpm sync` from the
// resumes-cvs `web` build (SPEC §14). No path aliases here: the sync script
// imports this file directly under Node.
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
    // Website → Links. GitHub and Substack also have dedicated places on the
    // home page (Code, Writing), so they're required.
    links: z
      .array(z.object({ label: z.string().min(1), url: z.url() }).strict())
      .min(1)
      .refine(
        (links) =>
          ["GitHub", "Substack"].every((l) => links.some((x) => x.label === l)),
        "links needs GitHub and Substack",
      ),
  })
  .strict();

// The URL of the link with this label (the schema guarantees GitHub and Substack).
export const linkUrl = (
  links: { label: string; url: string }[],
  label: string,
) => links.find((l) => l.label === label)!.url;

// Links the home page shows in their own sections (Code, Writing and the
// footer), so its CV list skips them.
export const ELSEWHERE_ON_HOME = ["GitHub", "Substack"];
