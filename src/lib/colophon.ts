import pkg from "../../package.json" with { type: "json" };

// The colophon's stack and tools, tied to package.json so they can't drift:
// versions are read from it, and lib/colophon.test.ts fails when a listed
// package is gone or a runtime dependency isn't credited.

const versions: Record<string, string> = {
  ...pkg.dependencies,
  ...pkg.devDependencies,
};

// "^16.4.6" → "16"
export const major = (name: string) =>
  versions[name]?.replace(/^[^\d]*/, "").split(".")[0];

export const stack: { label: string; packages: string[] }[] = [
  { label: `Next.js ${major("next")} (App Router)`, packages: ["next"] },
  { label: `React ${major("react")}`, packages: ["react", "react-dom"] },
  { label: "TypeScript", packages: ["typescript"] },
  { label: `Tailwind CSS ${major("tailwindcss")}`, packages: ["tailwindcss"] },
  {
    label: `Node.js ${pkg.engines.node.replace(/^[^\d]*/, "")} on Vercel`,
    packages: [],
  },
];

export const tools: { label: string; packages: string[] }[] = [
  { label: "Nodemailer — contact form delivery", packages: ["nodemailer"] },
  { label: "Zod — content and form validation", packages: ["zod"] },
  { label: "marked — book reviews from Markdown", packages: ["marked"] },
  {
    label: "highlight.js — code highlighting in the Fabulosa tutorial",
    packages: ["highlight.js"],
  },
  {
    label: "Playwright — end-to-end and layout tests",
    packages: ["@playwright/test"],
  },
  { label: "Sentry — server error monitoring", packages: ["@sentry/nextjs"] },
  {
    label: "Vercel Analytics and Speed Insights — visits and performance",
    packages: ["@vercel/analytics", "@vercel/speed-insights"],
  },
];
