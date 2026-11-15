import type { MetadataRoute } from "next";

// One timestamp per build: per-request dates teach crawlers to ignore lastmod.
const lastModified = new Date();
const paths = [
  "",
  "/about",
  "/colophon",
  "/links",
  "/terms",
  "/fabulosa-books/",
].concat([1, 2, 3, 4, 5, 6, 7].map((n) => `/fabulosa-books/part${n}.html`));

export default function sitemap(): MetadataRoute.Sitemap {
  return paths.map((p) => ({
    url: `https://www.ws-gong.com${p}`,
    lastModified,
  }));
}
