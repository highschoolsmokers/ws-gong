import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "W.S. Gong",
  description: "Author website for W.S. Gong",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} font-sans antialiased`}>
        <div className="min-h-screen flex flex-col max-w-2xl mx-auto px-6">
          <header className="py-10 flex items-baseline justify-between">
            <Link href="/" className="text-lg font-semibold tracking-tight hover:opacity-70 transition-opacity">
              W.S. Gong
            </Link>
            <nav className="flex gap-6 text-sm">
              <Link href="/writing" className="hover:opacity-70 transition-opacity">Writing</Link>
              <Link href="/about" className="hover:opacity-70 transition-opacity">About</Link>
            </nav>
          </header>
          <main className="flex-1 pb-16">
            {children}
          </main>
          <footer className="py-8 text-xs text-neutral-400 border-t border-neutral-200">
            © {new Date().getFullYear()} W.S. Gong
          </footer>
        </div>
      </body>
    </html>
  );
}
