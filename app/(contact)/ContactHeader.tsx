"use client";

import { useSearchParams } from "next/navigation";

function getOrigin(fromParam: string | null): "tech" | null {
  if (fromParam === "tech") return "tech";
  if (typeof document !== "undefined" && document.referrer.includes("tech.ws-gong.com"))
    return "tech";
  return null;
}

export default function ContactHeader() {
  const params = useSearchParams();
  const origin = getOrigin(params.get("from"));

  const homeHref = origin === "tech" ? "https://tech.ws-gong.com" : "https://ws-gong.com";
  const homeLabel = origin === "tech" ? "Tech" : "Home";

  return (
    <div className="flex items-start justify-between">
      <span className="text-[11px] font-medium tracking-[0.08em] uppercase">
        W.S. Gong
      </span>
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
