export default function PageShell({
  header,
  children,
  footer,
}: {
  header: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8">
      <header className="border-t border-black pt-5 pb-10">{header}</header>
      <main className="pb-24">{children}</main>
      {footer && (
        <footer className="border-t border-neutral-200 py-6">{footer}</footer>
      )}
    </div>
  );
}
