export default function PageShell({
  header,
  children,
}: {
  header: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-5xl mx-auto px-8 md:px-12">
      <header className="pt-8 pb-12">{header}</header>
      <main className="pb-16">{children}</main>
      <footer className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
        <div />
        <div className="text-sm">
          © {new Date().getFullYear()} W.S. Gong ·{" "}
          <a href="/terms" className="hover:opacity-70 transition-opacity">
            Terms
          </a>
        </div>
      </footer>
    </div>
  );
}
