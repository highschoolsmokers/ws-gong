import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site/content";

// One timestamp per build: per-request dates teach crawlers to ignore lastmod.
const lastModified = new Date();
const paths = ["", "/colophon", "/terms", "/fabulosa-books/"].concat(
  [1, 2, 3, 4, 5, 6, 7].map((n) => `/fabulosa-books/part${n}.html`),
);

export default function sitemap(): MetadataRoute.Sitemap {
  return paths.map((p) => ({
    url: `${SITE_URL}${p}`,
    lastModified,
  }));
}
