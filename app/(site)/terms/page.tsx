import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms of use and DMCA policy for ws-gong.com.",
  openGraph: {
    title: "Terms of Use — W.S. Gong",
    description: "Terms of use and DMCA policy for ws-gong.com.",
  },
};

export default function Terms() {
  return (
    <>
      <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
        <h1 className="text-xl md:text-2xl font-black leading-tight">
          Terms of Use
        </h1>
        <div className="space-y-4 text-sm leading-relaxed">
          <p>
            All content on this website — including text, images, code, and
            design — is the intellectual property of W.S. Gong unless otherwise
            noted. Unauthorized reproduction, distribution, scraping, or use of
            this content for AI/ML training is strictly prohibited.
          </p>
          <p>
            You may view this site for personal, non-commercial purposes. You
            may not copy, redistribute, republish, or create derivative works
            from any content without explicit written permission.
          </p>
          <p>
            Automated access, scraping, crawling, or data extraction of any kind
            is prohibited. This site actively blocks bots and unauthorized
            automated access.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
        <h2 className="text-xl md:text-2xl font-black leading-tight">
          DMCA Policy
        </h2>
        <div className="space-y-4 text-sm leading-relaxed">
          <p>
            W.S. Gong respects the intellectual property rights of others and
            expects users of this site to do the same. If you believe that
            content on this site infringes your copyright, please send a DMCA
            takedown notice to the contact email below with the following
            information:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Identification of the copyrighted work you claim has been
              infringed.
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
              A statement, under penalty of perjury, that the information in
              your notice is accurate and that you are the copyright owner or
              authorized to act on the owner&apos;s behalf.
            </li>
            <li>Your physical or electronic signature.</li>
          </ul>
          <p>
            Send DMCA notices to:{" "}
            <span className="font-semibold">ws [at] ws-gong.com</span>
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
        <h2 className="text-xl md:text-2xl font-black leading-tight">
          AI / ML Training
        </h2>
        <div className="space-y-4 text-sm leading-relaxed">
          <p>
            Use of any content from this site for training artificial
            intelligence or machine learning models is expressly prohibited
            without prior written consent. This prohibition applies to all
            content including but not limited to text, images, and code.
          </p>
        </div>
      </section>
    </>
  );
}
