import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
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
    index: true,
    follow: true,
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

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "W.S. Gong",
  url: "https://ws-gong.com",
  jobTitle: "Fiction Editor & Technical Writer",
  worksFor: {
    "@type": "Organization",
    name: "The Rumpus",
    url: "https://therumpus.net",
  },
  sameAs: [
    "https://github.com/highschoolsmokers",
    "https://www.linkedin.com/in/billy-gong",
    "https://substack.com/@highschoolsmokers",
    "https://www.instagram.com/born.deleuze",
  ],
  knowsAbout: [
    "Fiction Writing",
    "Technical Writing",
    "AI Tooling",
    "Model Context Protocol",
    "Developer Documentation",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${geistSans.variable} font-sans antialiased`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `document.addEventListener('contextmenu',e=>e.preventDefault());document.addEventListener('dragstart',e=>e.preventDefault());`,
          }}
        />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
