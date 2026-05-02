"use client";

import { useEffect, useState, useCallback } from "react";

// Token TTL is 2 minutes (lib/resumeToken.ts); refresh well inside that
// window so a slow click after the next interval still hits a live token.
const REFRESH_MS = 90 * 1000;

export default function ResumeLink() {
  const [token, setToken] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [error, setError] = useState(false);

  const fetchToken = useCallback(async () => {
    try {
      const res = await fetch("/api/resume/token");
      if (!res.ok) throw new Error();
      const { token: t } = await res.json();
      setToken(t);
      setError(false);

      const head = await fetch(`/api/resume?token=${t}`, { method: "HEAD" });
      if (head.ok) {
        const len = head.headers.get("content-length");
        if (len) setFileSize(`${Math.round(parseInt(len, 10) / 1024)} KB`);
      }
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    fetchToken();
    const id = setInterval(fetchToken, REFRESH_MS);
    return () => clearInterval(id);
  }, [fetchToken]);

  if (error) {
    return (
      <button
        onClick={fetchToken}
        className="text-sm text-neutral-500 hover:text-black transition-colors"
      >
        Resume unavailable — click to retry
      </button>
    );
  }

  if (!token) {
    return <span className="text-sm text-neutral-400">Loading…</span>;
  }

  return (
    <a
      href={`/api/resume?token=${token}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm"
    >
      Download PDF{fileSize ? ` (${fileSize})` : ""}
    </a>
  );
}
