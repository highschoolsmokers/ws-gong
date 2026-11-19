import { marked } from "marked";

// Review Markdown, with `::: spoiler` … `:::` blocks, in the three places it
// goes: the site, the RSS feed, and a Goodreads copy (SPEC §4).
const SPOILER = /^:::[ \t]*spoiler[ \t]*\n([\s\S]*?)\n:::[ \t]*$/gm;
const md = (s: string) => marked.parse(s, { async: false });

export const reviewHtml = (review: string) =>
  md(
    review.replace(
      SPOILER,
      (_, body) =>
        `<details class="spoiler"><summary>Spoiler</summary>\n\n${body}\n\n</details>`,
    ),
  );

export const feedHtml = (review: string, url: string) =>
  md(review.replace(SPOILER, `*[Spoiler hidden. Read it at <${url}>.]*`));

// Goodreads takes only <b>, <i>, <a>, <blockquote>, <spoiler>, and line breaks.
const goodreadsTags = (html: string) =>
  html
    .replace(/<(\/?)strong>/g, "<$1b>")
    .replace(/<(\/?)em>/g, "<$1i>")
    .replace(/<\/p>\s*<p>/g, "\n\n")
    .replace(/<\/?p>/g, "")
    .trim();

export const goodreadsHtml = (review: string) =>
  goodreadsTags(
    md(
      review.replace(
        SPOILER,
        (_, body) => `<spoiler>${goodreadsTags(md(body))}</spoiler>`,
      ),
    ),
  );
