import type { Metadata } from "next";
import Link from "next/link";
import PageTitle from "@/app/components/PageTitle";
import {
  featuredProjects,
  listedProjects,
  projects,
  type Project,
} from "@/lib/code/projects";

export const metadata: Metadata = {
  title: "Code",
  description:
    "Portfolio by W.S. Gong — AI engineering, MCP servers, developer tools, and full-stack web applications.",
  openGraph: {
    title: "Code — W.S. Gong",
    description:
      "Portfolio by W.S. Gong — AI engineering, MCP servers, developer tools, and full-stack web applications.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Code Projects by W.S. Gong",
  itemListElement: projects.map((p, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "CreativeWork",
      name: p.title,
      description: p.description,
      url: p.href.startsWith("http")
        ? p.href
        : `https://www.ws-gong.com${p.href}`,
      author: { "@type": "Person", name: "W.S. Gong" },
      keywords: [...p.stack, ...p.tags],
    },
  })),
};

function isExternal(href: string): boolean {
  return href.startsWith("http");
}

function FeaturedCard({ project }: { project: Project }) {
  const ext = isExternal(project.href);
  return (
    <article className="space-y-4">
      <h3 className="text-xl font-medium leading-snug">
        <Link
          href={project.href}
          {...(ext && { target: "_blank", rel: "noopener noreferrer" })}
        >
          {project.title}
          {ext && (
            <span aria-hidden className="ml-1 text-neutral-500">
              ↗
            </span>
          )}
        </Link>
      </h3>
      <p className="text-sm leading-relaxed">{project.description}</p>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[10px] uppercase tracking-[0.12em] text-neutral-500">
        <span>{project.stack.join(" / ")}</span>
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="inline-block border border-current px-2 py-0.5 font-medium"
          >
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}

function ListedProject({ project }: { project: Project }) {
  const ext = isExternal(project.href);
  return (
    <li className="py-6">
      <Link
        href={project.href}
        {...(ext && { target: "_blank", rel: "noopener noreferrer" })}
        className="block no-underline hover:!no-underline"
      >
        <span className="block text-base font-medium leading-snug">
          {project.title}
          {ext && (
            <span aria-hidden className="ml-1 text-neutral-500">
              ↗
            </span>
          )}
        </span>
        <span className="block mt-2 text-sm leading-relaxed">
          {project.description}
        </span>
        <span className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[10px] uppercase tracking-[0.12em] text-neutral-500">
          <span>{project.stack.join(" / ")}</span>
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="inline-block border border-current px-2 py-0.5 font-medium"
            >
              {tag}
            </span>
          ))}
        </span>
      </Link>
    </li>
  );
}

export default function Code() {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageTitle>Code</PageTitle>

      {featuredProjects.length > 0 && (
        <section className="swiss-grid swiss-rule pt-6 pb-12">
          <div className="col-span-12 md:col-span-4">
            <span className="swiss-label">Featured</span>
          </div>
          <div className="col-span-12 md:col-span-8 space-y-12 divide-y divide-neutral-200 [&>article:not(:first-child)]:pt-12">
            {featuredProjects.map((p) => (
              <FeaturedCard key={p.href} project={p} />
            ))}
          </div>
        </section>
      )}

      {listedProjects.length > 0 && (
        <section className="swiss-grid swiss-rule pt-6 pb-12">
          <div className="col-span-12 md:col-span-4">
            <span className="swiss-label">Index</span>
          </div>
          <ul className="col-span-12 md:col-span-8 divide-y divide-neutral-200 border-t border-neutral-200">
            {listedProjects.map((p) => (
              <ListedProject key={p.href} project={p} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
