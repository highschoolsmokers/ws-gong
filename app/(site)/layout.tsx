import Nav from "./Nav";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-5xl mx-auto px-8 md:px-12">
      <header className="pt-8 pb-12">
        <Nav />
      </header>
      <main className="pb-24">{children}</main>
      <footer className="border-t border-neutral-200 py-6">
        <span className="text-[10px] tracking-[0.06em] uppercase text-neutral-400">
          © {new Date().getFullYear()} W.S. Gong
        </span>
      </footer>
    </div>
  );
}
