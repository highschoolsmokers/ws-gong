import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const description =
  "W.S. Gong — writer, editor, and technical writer based in San Francisco. Fiction editor at The Rumpus. Twenty-five years in software and documentation.";

export const metadata: Metadata = {
  title: {
    default: "W.S. Gong",
    template: "%s — W.S. Gong",
  },
  description,
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
  alternates: {
    types: {
      "application/rss+xml": "/feed",
    },
  },
  openGraph: {
    siteName: "W.S. Gong",
    url: "https://ws-gong.com",
    type: "website",
    title: "W.S. Gong",
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} font-sans antialiased`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `document.addEventListener('contextmenu',e=>e.preventDefault());document.addEventListener('dragstart',e=>e.preventDefault());`,
          }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
