import Image from "next/image";

export default function Home() {
  return (
    <div className="space-y-0">
      <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
        <div />
        <figure className="space-y-5">
          <Image
            src="/images/giacometti_palace_4am.jpg"
            alt="Alberto Giacometti, The Palace at 4 a.m., 1932"
            width={813}
            height={600}
            className="w-full h-auto"
            priority
          />
          <figcaption className="text-sm leading-relaxed">
            Alberto Giacometti
            <br />
            <em>The Palace at 4 a.m.</em>
            <br />
            1932
          </figcaption>
        </figure>
      </section>
    </div>
  );
}
