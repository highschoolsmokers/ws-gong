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
      className="text-[11px] tracking-[0.08em] uppercase border border-black px-5 py-2 hover:bg-black hover:text-white transition-colors inline-block"
    >
      Download PDF
    </a>
  );
}
