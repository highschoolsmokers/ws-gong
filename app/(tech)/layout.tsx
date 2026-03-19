import PageShell from "../components/PageShell";
import TechNav from "./TechNav";

export default function TechLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageShell header={<TechNav />}>
      {children}
    </PageShell>
  );
}
