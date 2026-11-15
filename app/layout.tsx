import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { profiles, site } from "@/lib/site/content";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const description = `W.S. Gong, San Francisco. ${site.statement.join(" ")}`;

export const metadata: Metadata = {
  metadataBase: new URL("https://www.ws-gong.com"),
  title: { default: "W.S. Gong", template: "%s — W.S. Gong" },
  description,
  icons: { apple: "/apple-touch-icon.png" },
  alternates: { types: { "application/rss+xml": "/feed" } },
  openGraph: {
    siteName: "W.S. Gong",
    url: "/",
    type: "website",
    title: "W.S. Gong",
    description,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "W.S. Gong",
  url: "https://www.ws-gong.com",
  jobTitle: "Developer and Technical Writer",
  sameAs: profiles.map((p) => p.url),
  knowsAbout: [
    "Fiction Writing",
    "Technical Writing",
    "AI Tooling",
    "Model Context Protocol",
    "Developer Documentation",
  ],
};

// The inline script applies a stored theme before first paint (no flash);
// ThemeToggle owns it afterwards.
const themeScript = `try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${geist.variable} font-sans antialiased`}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
