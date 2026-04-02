import ThemeToggle from "./ThemeToggle";

export default function PageShell({
  header,
  children,
}: {
  header: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-5xl mx-auto px-8 md:px-12">
      <a href="#main" className="skip-to-content">
        Skip to content
      </a>
      <header className="pt-8 pb-12">{header}</header>
      <main id="main" className="pb-16">
        {children}
      </main>
      <footer className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
        <div />
        <div className="space-y-3">
          <div className="text-sm">
            <a
              href="https://highschoolsmokers.substack.com/subscribe"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold hover:opacity-70 transition-opacity"
            >
              Subscribe to the newsletter →
            </a>
          </div>
          <div className="text-sm flex items-center gap-1">
            <span>
              © {new Date().getFullYear()} W.S. Gong ·{" "}
              <a href="/terms" className="hover:opacity-70 transition-opacity">
                Terms
              </a>{" "}
              ·{" "}
              <a
                href="/colophon"
                className="hover:opacity-70 transition-opacity"
              >
                Colophon
              </a>
              {" · "}
            </span>
            <ThemeToggle />
          </div>
        </div>
      </footer>
    </div>
  );
}
