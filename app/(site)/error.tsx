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
    <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
      <h2 className="text-xl md:text-2xl font-black leading-tight">Error</h2>
      <div className="space-y-4 text-sm leading-relaxed">
        <p>Something went wrong loading this page.</p>
        <div className="flex gap-4">
          <button
            onClick={reset}
            className="font-semibold hover:opacity-70 transition-opacity"
          >
            Try again
          </button>
          <Link
            href="/"
            className="font-semibold hover:opacity-70 transition-opacity"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
