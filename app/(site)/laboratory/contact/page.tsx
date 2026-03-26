import type { Metadata } from "next";
import { Suspense } from "react";
import ContactForm from "../ContactForm";

export const metadata: Metadata = {
  title: "Contact — Laboratory",
  description: "Get in touch.",
  robots: { index: false },
};

export default function LabContactPage() {
  return (
    <>
      <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
        <h2 className="text-xl md:text-2xl font-black leading-tight">
          Contact Form
        </h2>
        <div />
      </section>
      <Suspense>
        <ContactForm />
      </Suspense>
    </>
  );
}
