import Link from "next/link";
import { EmailIcon } from "./about/SocialIcons";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-3xl mx-auto px-8">
      <header className="border-t border-black pt-5 pb-10 flex items-start justify-between">
        <Link
          href="/"
          className="text-[11px] font-medium tracking-[0.08em] uppercase hover:opacity-50 transition-opacity"
        >
          W.S. Gong
        </Link>
        <nav className="flex gap-8 items-center">
          <Link
            href="/writing"
            className="text-[11px] tracking-[0.08em] uppercase hover:opacity-50 transition-opacity"
          >
            Writing
          </Link>
          <Link
            href="/about"
            className="text-[11px] tracking-[0.08em] uppercase hover:opacity-50 transition-opacity"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="hover:opacity-50 transition-opacity"
            aria-label="Contact"
          >
            <EmailIcon />
          </Link>
        </nav>
      </header>
      <main className="pb-24">{children}</main>
      <footer className="border-t border-neutral-200 py-6">
        <span className="text-[10px] tracking-[0.06em] uppercase text-neutral-400">
          © {new Date().getFullYear()} W.S. Gong
        </span>
      </footer>
    </div>
  );
}
