import ThemeToggle from "./ThemeToggle";

export default function PageShell({
  header,
  children,
}: {
  header: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="swiss-container">
      <a href="#main" className="skip-to-content">
        Skip to content
      </a>
      <header className="pt-8 pb-16">{header}</header>
      <main id="main" className="pb-24">
        {children}
      </main>
      <footer className="swiss-grid swiss-rule pt-6 pb-10">
        <div className="col-span-12 md:col-span-4">
          <span className="swiss-label">Colophon</span>
        </div>
        <div className="col-span-12 md:col-span-8 space-y-4">
          <div className="text-sm">
            <a
              href="https://highschoolsmokers.substack.com/subscribe"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium"
            >
              Subscribe to the newsletter →
            </a>
          </div>
          <div className="text-sm flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>© {new Date().getFullYear()} W.S. Gong</span>
            <span aria-hidden>·</span>
            <a href="/terms">Terms</a>
            <span aria-hidden>·</span>
            <a href="/colophon">Colophon</a>
            <span aria-hidden>·</span>
            <ThemeToggle />
          </div>
        </div>
      </footer>
    </div>
  );
}
