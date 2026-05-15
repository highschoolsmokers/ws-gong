import { slushpileUrl } from "@/lib/site/env";
import PageShell from "../components/PageShell";
import Nav from "./Nav";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageShell header={<Nav slushpileEnabled={slushpileUrl !== null} />}>
      {children}
    </PageShell>
  );
}
