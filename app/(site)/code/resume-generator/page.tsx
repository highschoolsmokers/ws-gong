import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import PageTitle from "@/app/components/PageTitle";

const ProfileEditor = dynamic(() => import("../ProfileEditor"));

export const metadata: Metadata = {
  title: "Resume Generator",
  description: "Interactive resume editor with PDF generation.",
};

export default function ResumeGeneratorPage() {
  return (
    <>
      <PageTitle>Resume Generator</PageTitle>
      <section className="swiss-grid swiss-rule pt-6 pb-12">
        <Link href="/code" className="text-sm">
          ← All projects
        </Link>
        <div />
      </section>
      <ProfileEditor />
    </>
  );
}
