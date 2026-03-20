"use client";

import { HomeIcon } from "../(site)/about/SocialIcons";

export default function ContactHeader() {
  const isTech =
    typeof window !== "undefined" &&
    window.location.hostname.startsWith("tech.");
  const homeHref = isTech ? "https://tech.ws-gong.com" : "https://ws-gong.com";

  return (
    <div className="flex items-start justify-between">
      <span className="text-[11px] font-medium tracking-[0.08em] uppercase">
        W.S. Gong
      </span>
      <nav>
        <a
          href={homeHref}
          className="hover:opacity-50 transition-opacity"
          aria-label="Home"
        >
          <HomeIcon />
        </a>
      </nav>
    </div>
  );
}
