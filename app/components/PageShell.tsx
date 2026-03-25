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
    </div>
  );
}
