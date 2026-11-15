"use client";

import Link from "next/link";
import { Section } from "@/app/components/ui";

// Server errors reach Sentry via instrumentation.ts (onRequestError).
export default function SiteError({ reset }: { reset: () => void }) {
  return (
    <Section title="Error">
      <p>Something went wrong loading this page.</p>
      <p className="flex gap-4 font-medium">
        <button onClick={reset}>Try again</button>
        <Link href="/">Home</Link>
      </p>
    </Section>
  );
}
