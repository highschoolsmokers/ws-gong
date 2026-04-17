"use client";

import { useEffect, useState, useCallback } from "react";

const REFRESH_MS = 4 * 60 * 1000; // refresh token every 4 minutes (TTL is 5)

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
      className="text-sm hover:opacity-70 transition-opacity"
    >
      Download PDF{fileSize ? ` (${fileSize})` : ""}
    </a>
  );
}
