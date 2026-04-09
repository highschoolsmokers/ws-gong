import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = "https://ws-gong.com";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/monitoring"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
