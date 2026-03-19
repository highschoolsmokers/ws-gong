import Image from "next/image";

export default function Home() {
  return (
    <figure className="space-y-3">
      <Image
        src="/images/alberto featured_giacomettie_palaceat4am.svg"
        alt="Alberto Giacometti, The Palace at 4 a.m., 1932"
        width={487}
        height={426}
        priority
      />
      <figcaption className="text-[10px] tracking-[0.06em] text-neutral-400 leading-relaxed">
        Alberto Giacometti<br />
        <em>The Palace at 4 a.m.</em><br />
        1932
      </figcaption>
    </figure>
  );
}
