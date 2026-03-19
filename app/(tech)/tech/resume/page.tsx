import type { Metadata } from "next";
import ResumeLink from "../ResumeLink";
import { generateToken } from "@/lib/resumeToken";

export const dynamic = "force-dynamic";

type Role = { period: string; title: string; org: string; bullets: string[] };
type Degree = { year: string; degree: string; institution: string; notes?: string[] };

export const metadata: Metadata = {
  title: { absolute: "Resume — W.S. Gong" },
  description: "Technical writing and engineering resume for W.S. Gong.",
  robots: { index: false },
};

const current: Role[] = [
  {
    period: "2022 – Present",
    title: "Technical Writer & Developer, AI Documentation",
    org: "Independent · Contract · San Francisco, CA",
    bullets: [
      "Spec-to-Docs Pipelines — Builds end-to-end documentation pipelines that ingest OpenAPI/Swagger specs, JSON Schema, and Postman collections and produce accurate API references, developer guides, and quickstart tutorials; deploys to production via Vercel with CI/CD.",
      "Agentic QA & Docs-as-Tests — Designs agentic QA workflows in Python where AI agents autonomously exercise API endpoints, construct adversarial payloads, and validate response schemas; applies docs-as-tests methodology to flag discrepancies between live behavior and documented contracts and keep code samples continuously verified.",
      "Agent Development — Builds production-grade AI agents using the Anthropic SDK, LangChain, and LangGraph; designs tool-use loops, manages multi-agent state, and integrates MCP servers (Gmail, Calendar, Drive) into agentic pipelines.",
      "Prompt Engineering & Safety — Fluent across the Claude model family; deep experience with chain-of-thought, few-shot, and XML-structured prompting; working knowledge of Constitutional AI, prompt injection defense, context windows, and hallucination risk.",
    ],
  },
  {
    period: "2024 – Present",
    title: "Fiction Editor",
    org: "The Rumpus · Part-time · Remote",
    bullets: [
      "Manages the end-to-end editorial workflow for a high-volume independent literary publication under Editor-in-Chief Roxane Gay — submission intake, triage, structural editing, copyediting, and production handoff — applying consistent quality criteria across hundreds of submissions per cycle.",
    ],
  },
  {
    period: "2022 – Present",
    title: "Bookseller",
    org: "Fabulosa Books · Part-time · San Francisco, CA",
    bullets: [
      "Built agentic workflows to automate special order sourcing, event scheduling, and promotional outreach for an independent bookselling business carrying new, rare, and vintage titles.",
    ],
  },
];

const history: Role[] = [
  {
    period: "2020 – 2024",
    title: "MFA Teaching Fellow",
    org: "San Francisco State University · San Francisco, CA",
    bullets: [
      "Directed a 12-member editorial team through biannual production of Transfer Literary Magazine, managing hundreds of submissions per cycle across the full editorial and production pipeline.",
      "Designed and delivered undergraduate writing courses for 20–45 students per class, with emphasis on precision, clarity, and audience-aware prose.",
    ],
  },
  {
    period: "2017 – 2020",
    title: "Technical Lead Manager / Staff Engineer",
    org: "Slack Technologies · San Francisco, CA",
    bullets: [
      "Produced API references, integration guides, SDK documentation, and platform tutorials that contributed to the Slack developer documentation ecosystem and were adopted by external developers as a primary implementation reference.",
      "Designed and ran weekly coding workshops covering Slack platform development, Node.js, and QA tooling; served as official onboarding for engineers from non-traditional backgrounds; attendees independently shipped on the platform.",
      "Led testing strategy across 8 concurrent feature teams (Hack/HHVM, React/Redux, Electron, WebSockets); drove frontend coverage to 90%; scaled QA capacity 3x across SF, Vancouver, and Pune.",
      "Directed 4 senior/staff engineers; promoted 3 to senior-level; designed a technical interviewing framework and rubric adopted company-wide.",
    ],
  },
  {
    period: "2015 – 2017",
    title: "Senior QA Specialist",
    org: "Appthority (acquired by Symantec) · San Francisco, CA",
    bullets: [
      "Engineered end-to-end testing infrastructure for a mobile app risk management platform; authored API specs, test plan documentation, and internal architecture records that transferred through the Symantec acquisition.",
    ],
  },
  {
    period: "2012 – 2015",
    title: "Senior QA Engineer",
    org: "GoPro · San Mateo, CA",
    bullets: [
      "Architected a Ruby-based REST API testing framework with OAuth integration; wrote and delivered performance testing curriculum to 30+ developers; produced runbooks that reduced integrated environment load testing by 70%.",
    ],
  },
  {
    period: "2006 – 2012",
    title: "QA Engineer & Manager",
    org: "KIT digital · Coincident.tv · Adobe Systems · San Francisco Bay Area",
    bullets: [
      "QA engineering and management across video streaming and creative software; produced test plans, release notes, and architecture documentation; managed quality for clients including ESPN and Clear Channel.",
    ],
  },
  {
    period: "1997 – 2006",
    title: "QA Engineer / Sales Engineer",
    org: "Keepmedia · FutureTrade Technologies · Pixel Translations · Bay Area / Los Angeles",
    bullets: [
      "QA and sales engineering across digital media, fintech, and software; established a documentation practice — runbooks, API specs, user guides — that ran alongside every technical role.",
    ],
  },
];

const skills = [
  { label: "Writing", value: "API docs, developer guides, runbooks, release notes, UX copy, style guides" },
  { label: "AI / ML", value: "Anthropic SDK, LangChain / LangGraph, MCP integration, multi-agent systems" },
  { label: "Dev", value: "Python, Node.js, Git / GitHub, Vercel, REST, OpenAPI / Swagger, JSON Schema, CI/CD" },
  { label: "Doc Tools", value: "Markdown, Confluence, Notion, Vale, Docs-as-Code, Postman" },
  { label: "Editing", value: "Structural, developmental, copyediting; AI-assisted manuscript evaluation and feedback" },
  { label: "Domains", value: "Developer platforms, AI / LLM tooling, SaaS, fintech, security, creative industries" },
];

const education: Degree[] = [
  {
    year: "2024",
    degree: "MFA, Creative Writing",
    institution: "San Francisco State University",
    notes: [
      "Fiction · Published in Sewanee Review and Fourteen Hills",
      "Bread Loaf · Sewanee Writers' Conference · Tin House · Kenyon Review",
      "Writer in Residence, Ruth Asawa School of the Arts (SFUSD)",
    ],
  },
  { year: "1995", degree: "BA, English & Philosophy", institution: "University of California, Santa Barbara" },
  { year: "2020", degree: "Certificate in Professional Editing", institution: "UC Berkeley Extension" },
];

function RoleList({ roles }: { roles: Role[] }) {
  return (
    <div className="space-y-8">
      {roles.map((role) => (
        <div key={role.period + role.title}>
          <p className="text-[10px] text-neutral-400 tabular-nums mb-1">{role.period}</p>
          <p className="text-sm font-medium">{role.title}</p>
          <p className="text-[11px] text-neutral-400 mt-0.5 mb-3">{role.org}</p>
          <ul className="space-y-2">
            {role.bullets.map((b, i) => (
              <li key={i} className="text-sm leading-relaxed text-neutral-600">
                – {b}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default function ResumePage() {
  const token = generateToken();
  return (
    <div className="space-y-16">
      <section className="grid grid-cols-[120px_1fr] gap-x-12">
        <span className="text-[10px] tracking-[0.12em] uppercase pt-px">Current</span>
        <RoleList roles={current} />
      </section>

      <section className="grid grid-cols-[120px_1fr] gap-x-12">
        <span className="text-[10px] tracking-[0.12em] uppercase pt-px">History</span>
        <RoleList roles={history} />
      </section>

      <section className="grid grid-cols-[120px_1fr] gap-x-12">
        <span className="text-[10px] tracking-[0.12em] uppercase pt-px">Skills</span>
        <dl className="divide-y divide-neutral-100 border-t border-neutral-100">
          {skills.map((s) => (
            <div key={s.label} className="flex gap-6 py-2.5">
              <dt className="text-[11px] font-medium w-20 shrink-0 pt-px">{s.label}</dt>
              <dd className="text-sm text-neutral-700">{s.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="grid grid-cols-[120px_1fr] gap-x-12">
        <span className="text-[10px] tracking-[0.12em] uppercase pt-px">Education</span>
        <div className="space-y-6">
          {education.map((e) => (
            <div key={e.year + e.degree}>
              <p className="text-[10px] text-neutral-400 tabular-nums mb-1">{e.year}</p>
              <p className="text-sm font-medium">{e.degree}</p>
              <p className="text-[11px] text-neutral-400 mt-0.5">{e.institution}</p>
              {e.notes && e.notes.length > 0 && (
                <ul className="mt-2 space-y-0.5">
                  {e.notes.map((n, i) => (
                    <li key={i} className="text-[11px] text-neutral-500 italic">{n}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      <ResumeLink token={token} />
    </div>
  );
}
