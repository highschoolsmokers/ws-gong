import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import ContactForm from "../ContactForm";

export const metadata: Metadata = {
  title: "Contact Form",
  description:
    "Reactive contact form with real-time typography scaling and drag-and-drop attachments.",
  robots: { index: false },
};

export default function LabContactPage() {
  return (
    <>
      <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
        <h2 className="text-xl md:text-2xl font-black leading-tight">
          Contact Form
        </h2>
        <Link
          href="/projects"
          className="text-sm hover:opacity-70 transition-opacity"
        >
          ← All projects
        </Link>
      </section>
      <Suspense>
        <ContactForm />
      </Suspense>
    </>
  );
}
