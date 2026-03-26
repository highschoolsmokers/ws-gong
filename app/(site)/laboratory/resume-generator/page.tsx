import type { Metadata } from "next";
import ProfileEditor from "../ProfileEditor";

export const metadata: Metadata = {
  title: "Resume Generator",
  description: "Interactive resume editor with PDF generation.",
  robots: { index: false },
};

export default function ResumeGeneratorPage() {
  return <ProfileEditor />;
}
