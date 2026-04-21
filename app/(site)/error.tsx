"use client";

import Link from "next/link";
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="swiss-grid swiss-rule pt-6 pb-12">
      <h2 className="swiss-label">Error</h2>
      <div className="space-y-4 text-sm leading-relaxed">
        <p>Something went wrong loading this page.</p>
        <div className="flex gap-4">
          <button onClick={reset} className="font-medium">
            Try again
          </button>
          <Link href="/" className="font-medium">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
