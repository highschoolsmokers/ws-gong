import type { Metadata } from "next";
import ContactForm from "./ContactForm";

const description = "Get in touch with W.S. Gong.";

export const metadata: Metadata = {
  title: "Contact",
  description,
  openGraph: {
    title: "Contact — W.S. Gong",
    description,
  },
};

export default function Contact() {
  return (
    <ContactForm />
  );
}
