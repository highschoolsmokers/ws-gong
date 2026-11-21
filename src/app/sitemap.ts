import type { MetadataRoute } from "next";
import { orderedBooks, reviewed } from "@/lib/books";
import { SITE_URL } from "@/lib/site/content";
import { tutorialPaths } from "@/lib/tutorial-content";

// One timestamp per build: per-request dates teach crawlers to ignore lastmod.
const lastModified = new Date();
const paths = [
  "",
  "/colophon",
  "/terms",
  ...(orderedBooks.length ? ["/reading"] : []),
  ...reviewed.map((b) => `/reading/${b.slug}`),
  ...tutorialPaths,
];

export default function sitemap(): MetadataRoute.Sitemap {
  return paths.map((p) => ({
    url: `${SITE_URL}${p}`,
    lastModified,
  }));
}
