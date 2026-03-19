import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "W.S. Gong",
    template: "%s — W.S. Gong",
  },
  description:
    "W.S. Gong is a fiction editor at The Rumpus whose work appears in 14 Hills and Sewanee Review. At work on a novel about runaway kids in 1980s San Francisco.",
  openGraph: {
    siteName: "W.S. Gong",
    url: "https://ws-gong.com",
    type: "website",
    title: "W.S. Gong",
    description:
      "W.S. Gong is a fiction editor at The Rumpus whose work appears in 14 Hills and Sewanee Review. At work on a novel about runaway kids in 1980s San Francisco.",
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
