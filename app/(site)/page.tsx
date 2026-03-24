import Image from "next/image";

export default function Home() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <p className="text-sm text-neutral-500">
          Narratives,
          <br />
          Code.
        </p>
        <p className="text-sm leading-relaxed text-neutral-700">
          W.S. Gong is a writer, editor, and technical writer based in San
          Francisco. Fiction Editor at{" "}
          <a
            href="http://therumpus.net"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-50 transition-opacity"
          >
            The Rumpus
          </a>
          . Twenty-five years in software and documentation.
        </p>
      </div>
      <figure className="space-y-5">
        <Image
          src="/images/giacometti_palace_4am.jpg"
          alt="Alberto Giacometti, The Palace at 4 a.m., 1932"
          width={813}
          height={600}
          className="w-full h-auto"
          priority
        />
        <figcaption className="text-[10px] tracking-[0.06em] text-neutral-400 leading-relaxed">
          Alberto Giacometti
          <br />
          <em>The Palace at 4 a.m.</em>
          <br />
          1932
        </figcaption>
      </figure>
    </div>
  );
}
