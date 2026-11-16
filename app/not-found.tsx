import Link from "next/link";
import { Section } from "@/app/components/ui";
import SiteLayout from "./(site)/layout";

// Unmatched routes render at the root, so they borrow the site chrome and grid.
export default function NotFound() {
  return (
    <SiteLayout>
      <Section title="404">
        <p>This page does not exist.</p>
        <Link href="/">← Home</Link>
      </Section>
    </SiteLayout>
  );
}
