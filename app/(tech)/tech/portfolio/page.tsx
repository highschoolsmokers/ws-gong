import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Technical writing and documentation portfolio for W.S. Gong.",
  openGraph: {
    title: "Portfolio — W.S. Gong",
    description:
      "Technical writing and documentation portfolio for W.S. Gong.",
  },
};

const projects = [
  {
    year: "2025",
    title: "Agentic QA & Docs-as-Tests",
    description:
      "Python-based agentic QA workflows where AI agents autonomously exercise API endpoints, validate response schemas, and flag discrepancies between live behavior and documented contracts.",
  },
  {
    year: "2025",
    title: "Spec-to-Docs Pipelines",
    description:
      "End-to-end documentation pipelines ingesting OpenAPI/Swagger specs, JSON Schema, and Postman collections to produce API references, developer guides, and quickstart tutorials.",
  },
  {
    year: "2024",
    title: "MCP Integration & Multi-Agent Systems",
    description:
      "Production-grade AI agents using the Anthropic SDK, LangChain, and LangGraph with MCP server integrations for Gmail, Calendar, and Drive.",
  },
  {
    year: "2024",
    title: "Developer Documentation, Slack Platform",
    description:
      "API references, integration guides, SDK documentation, and platform tutorials for the Slack developer ecosystem.",
  },
];

export default function Portfolio() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
      <h2 className="text-xl md:text-2xl font-black leading-tight">
        Projects
      </h2>
      <ul className="divide-y divide-neutral-200 border-t border-neutral-200">
        {projects.map((project) => (
          <li key={project.title} className="py-4">
            <div className="grid grid-cols-[48px_1fr] gap-x-10">
              <span className="text-sm tabular-nums">
                {project.year}
              </span>
              <div>
                <span className="text-sm font-semibold">{project.title}</span>
                <span className="text-sm block mt-0.5">
                  {project.description}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
