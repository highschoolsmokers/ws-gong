import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { JOB_TITLE, KNOWS_ABOUT, SITE_URL, site } from "@/lib/site/content";
import { JsonLd } from "@/app/components/ui";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const description = `W.S. Gong, San Francisco. ${site.statement.join(" ")}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "W.S. Gong", template: "%s — W.S. Gong" },
  description,
  // app/favicon.ico is the fallback (Safari); the SVG adds a dark-scheme variant.
  icons: {
    icon: { url: "/icon.svg", type: "image/svg+xml" },
    apple: "/apple-touch-icon.png",
  },
  alternates: { types: { "application/rss+xml": "/feed" } },
  openGraph: { siteName: "W.S. Gong", type: "website" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "W.S. Gong",
  url: SITE_URL,
  jobTitle: JOB_TITLE,
  sameAs: site.links.map((l) => l.url),
  knowsAbout: KNOWS_ABOUT,
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
        <JsonLd data={jsonLd} />
      </head>
      <body className={`${geist.variable} font-sans antialiased`}>
        {children}
        {/* Vercel serves these scripts; elsewhere they would 404. */}
        {process.env.VERCEL && (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        )}
      </body>
    </html>
  );
}
