import { z } from "zod";

// The Fabulosa Books tutorial: text and code from the fabulosa-books repo,
// pulled into content/fabulosa-books.json by `pnpm sync:tutorial` (SPEC §15).
// The site renders it with its own layout and styles.

const section = z.object({
  title: z.string().min(1),
  // Trusted HTML from the sync: paragraphs, lists, tables, step labels, and
  // code blocks with highlighting already applied.
  html: z.string().min(1),
});

export const tutorialSchema = z.object({
  // The fabulosa-books commit the content came from.
  source: z.string().regex(/^[0-9a-f]{40}$/),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  parts: z
    .array(
      z.object({
        slug: z.string().regex(/^part\d+$/),
        title: z.string().min(1),
        description: z.string().min(1),
        sections: z.array(section).min(1),
      }),
    )
    .min(1),
});

export type Tutorial = z.infer<typeof tutorialSchema>;
export type TutorialPart = Tutorial["parts"][number];

export const TUTORIAL_PATH = "/fabulosa-books";
export const partPath = (slug: string) => `${TUTORIAL_PATH}/${slug}`;
