import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import ContactForm from "../ContactForm";

export const metadata: Metadata = {
  title: "Contact Form",
  description:
    "Reactive contact form with real-time typography scaling and drag-and-drop attachments.",
};

export default function LabContactPage() {
  return (
    <>
      <section className="swiss-grid swiss-rule pt-6 pb-12">
        <h2 className="swiss-label">Contact Form</h2>
        <Link href="/code" className="text-sm">
          ← All projects
        </Link>
      </section>
      <Suspense>
        <ContactForm />
      </Suspense>
    </>
  );
}
