"use client";

import { useEffect, useState } from "react";

export default function ResumeLink({ token }: { token: string }) {
  const [show, setShow] = useState(false);
  const [fileSize, setFileSize] = useState<string | null>(null);

  useEffect(() => {
    setShow(true);
    fetch(`/api/resume?token=${token}`, { method: "HEAD" })
      .then((res) => {
        const len = res.headers.get("content-length");
        if (len) {
          const kb = Math.round(parseInt(len, 10) / 1024);
          setFileSize(`${kb} KB`);
        }
      })
      .catch(() => {});
  }, [token]);

  if (!show) return null;

  return (
    <a
      href={`/api/resume?token=${token}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm hover:opacity-50 transition-opacity"
    >
      Download PDF{fileSize ? ` (${fileSize})` : ""}
    </a>
  );
}
