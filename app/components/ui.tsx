import type { ReactNode } from "react";

// The site's only layout primitives: page title, labelled section, list rows.

export const ext = { target: "_blank", rel: "noopener noreferrer" } as const;

export function PageTitle({ children }: { children: ReactNode }) {
  return (
    <h1 className="swiss-display pb-10 text-[2.5rem] md:text-[3.5rem]">
      {children}
    </h1>
  );
}

export function Section({
  id,
  index,
  title,
  children,
}: {
  id?: string;
  index?: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={id && `${id}-title`}
      className="section swiss-grid"
    >
      <h2
        id={id && `${id}-title`}
        className="swiss-label col-span-12 md:col-span-4"
      >
        {index !== undefined && (
          <span className="section-index" aria-hidden>
            {String(index).padStart(2, "0")}
          </span>
        )}
        {title}
      </h2>
      <div className="col-span-12 space-y-4 text-sm leading-relaxed md:col-span-8">
        {children}
      </div>
    </section>
  );
}

export function Rows({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <div>
      {title && <h3 className="sub-head">{title}</h3>}
      <ul className="row-list">{children}</ul>
    </div>
  );
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
          <span aria-hidden className="ml-[0.35em] font-normal text-muted">
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
        <a href={href} className="row" {...(external && ext)}>
          {body}
        </a>
      ) : (
        <div className="row">{body}</div>
      )}
    </li>
  );
}
