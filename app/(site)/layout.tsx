import Nav from "./Nav";
import PageShell from "../components/PageShell";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageShell
      header={<Nav />}
      footer={
        <span className="text-[10px] tracking-[0.06em] uppercase text-neutral-400">
          © {new Date().getFullYear()} W.S. Gong
        </span>
      }
    >
      {children}
    </PageShell>
  );
}
