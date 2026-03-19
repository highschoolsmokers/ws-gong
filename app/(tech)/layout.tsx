import PageShell from "../components/PageShell";

export default function TechLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageShell
      header={
        <span className="text-[11px] font-medium tracking-[0.08em] uppercase">
          W.S. Gong
        </span>
      }
    >
      {children}
    </PageShell>
  );
}
