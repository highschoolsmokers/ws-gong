import type { Metadata } from "next";

const description =
  "After twenty-five years in tech creating test plans, runbooks, API specs, and developer tooling, I completed an MFA in Creative Writing. Clarity is a form of respect — and with agentic workflows and docs-as-tests pipelines, quality isn't an editorial judgment: it's a test result.";

export const metadata: Metadata = {
  title: { absolute: "W.S. Gong — Technical Writer & Developer" },
  description,
  openGraph: {
    title: "W.S. Gong — Technical Writer & Developer",
    description,
    url: "https://tech.ws-gong.com",
  },
};

export default function TechPage() {
  return <div />;
}
