import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import ContactForm from "../ContactForm";
import PageTitle from "@/app/components/PageTitle";

export const metadata: Metadata = {
  title: "Contact Form",
  description:
    "Reactive contact form with real-time typography scaling and drag-and-drop attachments.",
};

export default function LabContactPage() {
  return (
    <>
      <PageTitle>Contact Form</PageTitle>
      <section className="swiss-grid swiss-rule pt-6 pb-12">
        <Link href="/code" className="text-sm">
          ← All projects
        </Link>
        <div />
      </section>
      <Suspense>
        <ContactForm />
      </Suspense>
    </>
  );
}
