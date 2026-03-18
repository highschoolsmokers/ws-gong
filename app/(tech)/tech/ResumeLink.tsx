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
      className="text-[10px] tracking-[0.08em] uppercase border border-black px-3 py-1 hover:bg-black hover:text-white transition-colors inline-block"
    >
      Download Resume
    </a>
  );
}
