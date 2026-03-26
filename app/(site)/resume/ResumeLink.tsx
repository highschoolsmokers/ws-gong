"use client";

import { useEffect, useState } from "react";

export default function ResumeLink({ token }: { token: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
  }, []);

  if (!show) return null;

  return (
    <a
      href={`/api/resume?token=${token}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm hover:opacity-50 transition-opacity"
    >
      Download Resume
    </a>
  );
}
