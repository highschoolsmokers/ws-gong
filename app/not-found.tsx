import Link from "next/link";
import { Section } from "@/app/components/ui";

export default function NotFound() {
  return (
    <Section title="404">
      <p>This page does not exist.</p>
      <Link href="/">← Home</Link>
    </Section>
  );
}
