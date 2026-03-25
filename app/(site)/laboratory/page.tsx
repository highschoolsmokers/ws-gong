import type { Metadata } from "next";
import ProfileEditor from "./ProfileEditor";

export const metadata: Metadata = {
  title: "Laboratory",
  description: "Resume editor and PDF generator.",
  robots: { index: false },
};

export default function LaboratoryPage() {
  return <ProfileEditor />;
}
