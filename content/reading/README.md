# Reading log

One file per book, named `<slug>.md` (kebab-case, e.g. `pachinko.md`). The
slug is the review's URL: `/reading/pachinko`. This README is skipped.

```markdown
---
title: Pachinko
author: Min Jin Lee
finished: 2026-10-01 # or: reading
rating: 4 # optional, 1–5, shown as "4/5"
isbn: 978-1455563920 # optional; `pnpm covers` fetches the cover
note: One line for the home page and the index. # optional
link: https://… # optional; where the title links when there is no review
substack: https://… # optional; the Substack copy of the review
goodreads: https://… # optional; the Goodreads copy of the review
---

The review, in Markdown. A book with no body gets no page of its own.

::: spoiler
Hidden behind a "Spoiler" toggle on the site, left out of the RSS feed, and
wrapped in <spoiler> in the Goodreads copy.
:::
```

Covers: after adding an `isbn`, run `pnpm covers`. It saves the Open Library
cover to `public/covers/<slug>.jpg` (commit it); books without one show none.

Goodreads: in `pnpm dev`, each review page has a "Copy for Goodreads" button
that copies the review in the HTML Goodreads accepts. Paste it there, then
add the Goodreads URL as `goodreads:` here.
