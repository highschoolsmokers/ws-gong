import { Suspense } from "react";
import ContactHeader from "./ContactHeader";

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-3xl mx-auto px-8">
      <header className="border-t border-black pt-5 pb-10">
        <Suspense
          fallback={
            <span className="text-[11px] font-medium tracking-[0.08em] uppercase">
              W.S. Gong
            </span>
          }
        >
          <ContactHeader />
        </Suspense>
      </header>
      <main className="pb-24">{children}</main>
    </div>
  );
}
