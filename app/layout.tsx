import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const description =
  "W.S. Gong — writer, editor, and technical writer based in San Francisco. Fiction editor at The Rumpus. Twenty-five years in software and documentation.";

export const metadata: Metadata = {
  title: {
    default: "W.S. Gong",
    template: "%s — W.S. Gong",
  },
  description,
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
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
