import type { ReactNode } from "react";

// Layout primitives for the one-page home: a numbered section (label left,
// content right) and a list row. Every home section uses these two.

export function Section({
  id,
  index,
  title,
  children,
  after,
}: {
  id: string;
  index: number;
  title: string;
  children: ReactNode;
  /** Full-width content below the label/content row (e.g. the contact form). */
  after?: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="home-section">
      <div className="swiss-grid">
        <div className="col-span-12 md:col-span-4">
          <h2 id={`${id}-title`} className="swiss-label">
            <span className="section-index" aria-hidden>
              {String(index).padStart(2, "0")}
            </span>
            {title}
          </h2>
        </div>
        <div className="col-span-12 md:col-span-8">{children}</div>
      </div>
      {after && <div className="mt-12">{after}</div>}
    </section>
  );
}

export function SubHead({ children }: { children: ReactNode }) {
  return <h3 className="sub-head">{children}</h3>;
}

export function RowList({ children }: { children: ReactNode }) {
  return <ul className="row-list">{children}</ul>;
}

export function Row({
  href,
  title,
  meta,
  children,
}: {
  href?: string;
  title: ReactNode;
  meta?: ReactNode;
  children?: ReactNode;
}) {
  const external = href?.startsWith("http");
  const body = (
    <>
      <span className="row-title">
        {title}
        {external && (
          <span aria-hidden className="row-arrow">
            ↗
          </span>
        )}
      </span>
      {children && <span className="row-body">{children}</span>}
      {meta && <span className="row-meta">{meta}</span>}
    </>
  );
  return (
    <li>
      {href ? (
        <a
          href={href}
          className="row"
          {...(external && { target: "_blank", rel: "noopener noreferrer" })}
        >
          {body}
        </a>
      ) : (
        <div className="row">{body}</div>
      )}
    </li>
  );
}
