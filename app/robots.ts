import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site/content";

// Crawlers that gather AI training data, which the Terms forbid. Search and
// user-fetch agents from the same companies (OAI-SearchBot, ChatGPT-User,
// Claude-SearchBot, Claude-User, Googlebot, Applebot) stay allowed.
const AI_TRAINING_BOTS = [
  "GPTBot", // OpenAI
  "ClaudeBot", // Anthropic
  "anthropic-ai", // Anthropic (older token)
  "Google-Extended", // Google AI training opt-out
  "Applebot-Extended", // Apple AI training opt-out
  "meta-externalagent", // Meta
  "CCBot", // Common Crawl, a common training corpus
  "Bytespider", // ByteDance
  "cohere-training-data-crawler", // Cohere
  "Diffbot", // dataset builder
  "Omgilibot", // data reseller
  "Timpibot", // dataset builder
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: AI_TRAINING_BOTS, disallow: "/" },
      { userAgent: "*", allow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
