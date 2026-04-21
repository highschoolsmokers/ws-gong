import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";

const ProfileEditor = dynamic(() => import("../ProfileEditor"));

export const metadata: Metadata = {
  title: "Resume Generator",
  description: "Interactive resume editor with PDF generation.",
};

export default function ResumeGeneratorPage() {
  return (
    <>
      <section className="swiss-grid swiss-rule pt-6 pb-12">
        <h2 className="swiss-label">Resume Generator</h2>
        <Link href="/code" className="text-sm">
          ← All projects
        </Link>
      </section>
      <ProfileEditor />
    </>
  );
}
