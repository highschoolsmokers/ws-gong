"use client";

import { useSearchParams } from "next/navigation";

export default function ContactHeader() {
  const params = useSearchParams();
  const from = params.get("from");
  const href =
    from === "tech" ? "https://tech.ws-gong.com" : "https://ws-gong.com";

  return (
    <a
      href={href}
      className="text-[11px] font-medium tracking-[0.08em] uppercase hover:opacity-50 transition-opacity"
    >
      W.S. Gong
    </a>
  );
}
