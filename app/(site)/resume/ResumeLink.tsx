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
      className="text-sm font-black border border-black px-5 py-2 hover:bg-black hover:text-white transition-colors inline-block"
    >
      Download Resume
    </a>
  );
}
