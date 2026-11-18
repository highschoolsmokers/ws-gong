import Link from "next/link";
import { PageTitle, Section } from "@/app/components/ui";
import Chrome from "./(site)/Chrome";

// Unmatched routes render at the root, so they borrow the site chrome and grid.
export default function NotFound() {
  return (
    <Chrome notFound>
      <PageTitle>Not found</PageTitle>
      <Section title="404">
        <p>This page does not exist.</p>
        <Link href="/">← Home</Link>
      </Section>
    </Chrome>
  );
}
