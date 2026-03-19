import { Suspense } from "react";
import ContactHeader from "./ContactHeader";
import PageShell from "../components/PageShell";

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageShell
      header={
        <Suspense
          fallback={
            <span className="text-[11px] font-medium tracking-[0.08em] uppercase">
              W.S. Gong
            </span>
          }
        >
          <ContactHeader />
        </Suspense>
      }
    >
      {children}
    </PageShell>
  );
}
