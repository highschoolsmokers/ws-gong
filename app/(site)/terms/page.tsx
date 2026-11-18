import type { Metadata } from "next";
import { PageTitle, Section } from "@/app/components/ui";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms of use, privacy, and DMCA policy for ws-gong.com.",
};

export default function Terms() {
  return (
    <>
      <PageTitle>Terms of Use</PageTitle>
      <Section title="Overview">
        <p>
          All content on this website — including text, images, code, and design
          — is the intellectual property of W.S. Gong unless otherwise noted.
          You may view it for personal, non-commercial purposes. You may not
          copy, redistribute, republish, or create derivative works from it
          without explicit written permission, except as allowed below.
        </p>
        <p>Last updated November 17, 2026.</p>
      </Section>

      <Section title="What You May Do">
        <ul className="space-y-1">
          <li>Link to any page.</li>
          <li>
            Quote short excerpts for review or commentary, with attribution and
            a link back.
          </li>
          <li>Follow the RSS feed in a feed reader.</li>
          <li>
            Use the code samples in the Fabulosa Books tutorial in your own
            projects; that is what they are for.
          </li>
        </ul>
        <p>
          Search engines may index the site. Any other automated access — bulk
          scraping, crawling to build datasets, or data extraction — is
          prohibited.
        </p>
      </Section>

      <Section title="Privacy">
        <ul className="space-y-1">
          <li>
            <span className="font-medium">Contact form.</span> Your name, email
            address, message, and any attachments are sent to me by email. The
            site does not store them.
          </li>
          <li>
            <span className="font-medium">Substack.</span> The subscribe form
            passes your email address to Substack, which handles the
            subscription under its own privacy policy. Substack links leave this
            site.
          </li>
          <li>
            <span className="font-medium">Analytics.</span> Vercel Analytics and
            Speed Insights count visits and measure page speed without cookies
            and without identifying you.
          </li>
          <li>
            <span className="font-medium">Error monitoring.</span> Server errors
            are reported to Sentry with the request details needed to fix them.
          </li>
          <li>
            <span className="font-medium">No cookies.</span> Your light or dark
            theme choice is saved in your own browser and never sent anywhere.
          </li>
        </ul>
      </Section>

      <Section title="Third-Party Content">
        <p>
          Book covers come from Open Library and belong to their publishers and
          artists. Excerpts and titles quoted in reviews belong to their
          authors.
        </p>
      </Section>

      <Section title="DMCA Policy">
        <p>
          W.S. Gong respects the intellectual property rights of others and
          expects users of this site to do the same. If you believe that content
          on this site infringes your copyright, please send a DMCA takedown
          notice to the contact email below with the following information:
        </p>
        <ul className="space-y-1">
          <li>
            Identification of the copyrighted work you claim has been infringed.
          </li>
          <li>
            Identification of the material on this site that you claim is
            infringing, with sufficient detail to locate it.
          </li>
          <li>Your contact information (name, address, email, phone).</li>
          <li>
            A statement that you have a good-faith belief that use of the
            material is not authorized by the copyright owner.
          </li>
          <li>
            A statement, under penalty of perjury, that the information in your
            notice is accurate and that you are the copyright owner or
            authorized to act on the owner&apos;s behalf.
          </li>
          <li>Your physical or electronic signature.</li>
        </ul>
        <p>
          Send DMCA notices to:{" "}
          <span className="font-medium">ws [at] ws-gong.com</span>
        </p>
      </Section>

      <Section title="AI / ML Training">
        <p>
          Use of any content from this site for training artificial intelligence
          or machine learning models is expressly prohibited without prior
          written consent. This prohibition applies to all content including but
          not limited to text, images, and code.
        </p>
      </Section>
    </>
  );
}
