import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Die Neue Grafik",
  description: "Swiss International Typographic Style — design history.",
  robots: { index: false },
};

export default function DieNeueGrafik() {
  return (
    <div className="bg-[#EDAB00] text-black -mx-8 md:-mx-12 px-8 md:px-12 -mb-16 py-12 md:py-16">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/narratives-code"
          className="text-sm font-semibold hover:opacity-70 transition-opacity"
        >
          ← All projects
        </Link>
        <header className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8 md:gap-12 mb-12 mt-6">
          <h1 className="text-6xl md:text-7xl lg:text-[5.5rem] font-black leading-[0.95] tracking-tight">
            Die
            <br />
            Neue
            <br />
            Grafik
            <br />
            Design
          </h1>
          <ul className="text-sm font-semibold leading-loose">
            <li>The Bauhaus</li>
            <li>Swiss Modernism</li>
            <li>Swiss Graphic Design</li>
            <li>The International Typographic Style</li>
            <li>Russian Constructivism</li>
            <li>Typography</li>
            <li>Illustration</li>
          </ul>
        </header>

        <div className="space-y-0">
          <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
            <h2 className="text-xl md:text-2xl font-black leading-tight">
              The Bauhaus 1919&thinsp;-&thinsp;1933
            </h2>
            <div className="text-sm leading-relaxed space-y-4">
              <p>
                Bauhaus, was a school in Germany that combined crafts and the
                fine arts, and was famous for the approach to design that it
                published and taught. It operated from 1919 to 1933. At that
                time the German term Bauhaus, literally &ldquo;house of
                construction&rdquo; stood for &ldquo;School of Building&rdquo;.
                The Bauhaus school was founded by Walter Gropius in Weimar. In
                spite of its name, and the fact that its founder was an
                architect, the Bauhaus did not have an architecture department
                during the first years of its existence. Nonetheless it was
                founded with the idea of creating a &lsquo;total&rsquo; work of
                art in which all arts, including architecture would eventually
                be brought together.
              </p>
              <p>
                The Bauhaus style became one of the most influential currents in
                Modernist architecture and modern design. The Bauhaus had a
                profound influence upon subsequent developments in art,
                architecture, graphic design, interior design, industrial
                design, and typography.
              </p>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
            <h2 className="text-xl md:text-2xl font-black leading-tight">
              The International
              <br />
              Typographic
              <br />
              Style&thinsp;/
              <br />
              The Swiss
              <br />
              Style
            </h2>
            <div className="text-sm leading-relaxed space-y-4">
              <p>
                The International Typographic Style, also known as the Swiss
                Style, is a graphic design style developed in Switzerland in the
                1950s that emphasizes cleanliness, readability and objectivity.
                Hallmarks of the style are asymmetric layouts, use of a grid,
                sans-serif typefaces like Akzidenz Grotesk, and flush left,
                ragged right text. The style is also associated with a
                preference for photography in place of illustrations or
                drawings. Many of the early International Typographic Style
                works featured typography as a primary design element in
                addition to its use in text, and it is for this that the style
                is named.
              </p>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
            <h2 className="text-xl md:text-2xl font-black leading-tight">
              Swiss Graphic Design&thinsp;/
              <br />
              Modernism
            </h2>
            <div className="text-sm leading-relaxed space-y-4">
              <p>
                Swiss graphic design and &ldquo;the Swiss Style&rdquo; are
                crucial elements in the history of modernism. During the 1920s
                and &rsquo;30s, skills traditionally associated with Swiss
                industry, particularly pharmaceuticals and mechanical
                engineering, were matched by those of the country&rsquo;s
                graphic designers, who produced their advertising and technical
                literature. These pioneering graphic artists saw design as part
                of industrial production and searched for anonymous, objective
                visual communication. They chose photographic images rather than
                illustration, and typefaces that were industrial-looking rather
                than those designed for books.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
