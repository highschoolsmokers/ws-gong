import { z } from "zod";

// The shape of content/site.json, written by `pnpm sync:resume` from the
// resumes-cvs `web` build (SPEC §14). No path aliases here: the sync script
// imports this file directly under Node.
export const siteContentSchema = z
  .object({
    statement: z.array(z.string().min(1)).min(1),
    bio: z.array(z.string().min(1)).min(1),
    published: z.array(
      z
        .object({
          kind: z.literal("Fiction"),
          title: z.string().min(1),
          venue: z.string(),
          detail: z.string(),
          year: z.string(),
          url: z.url().optional(),
        })
        .strict(),
    ),
    editing: z.array(
      z
        .object({
          title: z.string().min(1),
          org: z.string().min(1),
          dates: z.string(),
          summary: z.string(),
        })
        .strict(),
    ),
    links: z
      .object({
        linkedin: z.url(),
        github: z.url(),
      })
      .strict(),
  })
  .strict();

export type SiteContent = z.infer<typeof siteContentSchema>;
