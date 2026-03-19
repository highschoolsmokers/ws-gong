"use client";

import { useSearchParams } from "next/navigation";

export default function ContactHeader() {
  const params = useSearchParams();
  const from = params.get("from");
  const homeHref =
    from === "tech" ? "https://tech.ws-gong.com" : "https://ws-gong.com";
  const homeLabel = from === "tech" ? "Tech" : "Home";

  return (
    <div className="flex items-start justify-between">
      <a
        href={homeHref}
        className="text-[11px] font-medium tracking-[0.08em] uppercase hover:opacity-50 transition-opacity"
      >
        W.S. Gong
      </a>
      <nav>
        <a
          href={homeHref}
          className="text-[11px] tracking-[0.08em] uppercase hover:opacity-50 transition-opacity"
        >
          {homeLabel}
        </a>
      </nav>
    </div>
  );
}
