export default function TechLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto px-6">
      <main className="flex-1 py-16">
        {children}
      </main>
    </div>
  );
}
