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
          title: z.string().min(1),
          venue: z.string(),
          detail: z.string(),
          url: z.url().optional(),
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
