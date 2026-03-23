"use client";

import { HomeIcon } from "../(site)/about/SocialIcons";

export default function ContactHeader() {
  const isTech =
    typeof window !== "undefined" &&
    window.location.hostname.startsWith("tech.");
  const homeHref = isTech ? "https://tech.ws-gong.com" : "https://ws-gong.com";

  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2.5">
        <div className="w-5 h-5 bg-black" />
        <span className="text-xl font-black tracking-tight">W.S. Gong</span>
      </span>
      <nav>
        <a
          href={homeHref}
          className="hover:opacity-70 transition-opacity"
          aria-label="Home"
        >
          <HomeIcon />
        </a>
      </nav>
    </div>
  );
}
