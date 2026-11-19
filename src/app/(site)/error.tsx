"use client";

import Link from "next/link";
import { Section } from "@/app/components/ui";

// Server errors reach Sentry via instrumentation.ts (onRequestError).
export default function SiteError({ reset }: { reset: () => void }) {
  return (
    <Section title="Error">
      <p>Something went wrong loading this page.</p>
      <ul className="space-y-1 font-medium">
        <li>
          <button onClick={reset}>Try again</button>
        </li>
        <li>
          <Link href="/">Home</Link>
        </li>
      </ul>
    </Section>
  );
}
