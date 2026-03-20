import ContactHeader from "./ContactHeader";
import PageShell from "../components/PageShell";

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageShell header={<ContactHeader />}>
      {children}
    </PageShell>
  );
}
