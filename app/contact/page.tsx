import type { Metadata } from "next";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact — W.S. Gong",
};

export default function Contact() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-10">Contact</h1>
      <ContactForm />
    </div>
  );
}
