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
    <Suspense>
      <ContactForm />
    </Suspense>
  );
}
