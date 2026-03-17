export default function TechLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto px-6">
      <header className="py-10 flex items-baseline justify-between">
        <span className="text-lg font-semibold tracking-tight">W.S. Gong</span>
        <nav className="flex gap-6 text-sm" />
      </header>
      <main className="flex-1 pb-16">
        {children}
      </main>
    </div>
  );
}
