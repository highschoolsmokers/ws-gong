import Link from "next/link";
import { EmailIcon } from "./about/SocialIcons";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto px-6">
      <header className="py-10 flex items-baseline justify-between">
        <Link href="/" className="text-lg font-semibold tracking-tight hover:opacity-70 transition-opacity">
          W.S. Gong
        </Link>
        <nav className="flex gap-6 text-sm items-center">
          <Link href="/writing" className="hover:opacity-70 transition-opacity">Writing</Link>
          <Link href="/about" className="hover:opacity-70 transition-opacity">About</Link>
          <Link href="/contact" className="hover:opacity-50 transition-opacity" aria-label="Contact">
            <EmailIcon />
          </Link>
        </nav>
      </header>
      <main className="flex-1 pb-16">
        {children}
      </main>
      <footer className="py-8 text-xs text-neutral-400 border-t border-neutral-200">
        © {new Date().getFullYear()} W.S. Gong
      </footer>
    </div>
  );
}
