import PageShell from "../components/PageShell";
import Nav from "./Nav";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageShell header={<Nav />}>{children}</PageShell>;
}
