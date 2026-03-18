import type { Metadata } from "next";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact — W.S. Gong",
};

export default function Contact() {
  return <ContactForm />;
}
