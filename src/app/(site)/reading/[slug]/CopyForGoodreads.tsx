"use client";

import { useState } from "react";

// Development only: the review in the HTML Goodreads accepts, for pasting there.
export default function CopyForGoodreads({ html }: { html: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="font-medium text-muted hover:text-foreground"
      onClick={async () => {
        await navigator.clipboard.writeText(html);
        setCopied(true);
      }}
    >
      {copied ? "Copied" : "Copy for Goodreads"} (dev only)
    </button>
  );
}
