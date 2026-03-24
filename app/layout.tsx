import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import PageShell from "./components/PageShell";
import Nav from "./(site)/Nav";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const description =
  "W.S. Gong is a fiction editor at The Rumpus whose work appears in 14 Hills and Sewanee Review. At work on a novel about runaway kids in 1980s San Francisco.";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const host = headersList.get("host") ?? "";
  const isTechHost = host.startsWith("tech.");

  return (
    <html lang="en">
      <body className={`${geistSans.variable} font-sans antialiased`}>
        <PageShell header={<Nav isTechHost={isTechHost} />}>
          {children}
        </PageShell>
      </body>
    </html>
  );
}
