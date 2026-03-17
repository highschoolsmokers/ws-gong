"use client";

import { useEffect, useState } from "react";

export default function ResumeLink() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
  }, []);

  if (!show) return null;

  return (
    <a
      href="/api/resume"
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm underline underline-offset-4 hover:opacity-70 transition-opacity"
    >
      Resume (PDF)
    </a>
  );
}
