import type { Metadata } from "next";
import { PageTitle, Section, ext } from "@/app/components/ui";

export const metadata: Metadata = {
  title: "Colophon",
  description: "Typography, tools, and technology behind ws-gong.com.",
};

const list = (items: string[]) => (
  <ul className="space-y-1">
    {items.map((i) => (
      <li key={i}>{i}</li>
    ))}
  </ul>
);

export default function Colophon() {
  return (
    <>
      <PageTitle>Colophon</PageTitle>
      <Section title="Typography">
        <p>
          Set in{" "}
          <a href="https://vercel.com/font" className="underline" {...ext}>
            Geist
          </a>{" "}
          by Vercel. System monospace for code.
        </p>
      </Section>
      <Section title="Design">
        <p>
          Informed by the Swiss International Typographic Style. Asymmetric
          grid, black-and-white palette with red for errors only, strong
          hierarchy through weight and scale. Responsive across breakpoints.
        </p>
      </Section>
      <Section title="Stack">
        {list([
          "Next.js 16",
          "React 19",
          "Tailwind CSS 4",
          "TypeScript",
          "Vercel",
        ])}
      </Section>
      <Section title="Tools">
        {list([
          "Nodemailer — contact form delivery",
          "Playwright — end-to-end testing",
          "Sentry — error monitoring",
          "Vercel Analytics — visitor insights",
        ])}
      </Section>
      <Section title="Source">
        <a
          href="https://github.com/highschoolsmokers/ws-gong"
          className="underline"
          {...ext}
        >
          github.com/highschoolsmokers/ws-gong
        </a>
      </Section>
    </>
  );
}
