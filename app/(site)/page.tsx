import Image from "next/image";

export default function Home() {
  return (
    <div className="space-y-12">
      <p className="text-sm text-neutral-500">
        Writing, Editing, and Education Professional
      </p>
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
          Alberto Giacometti<br />
          <em>The Palace at 4 a.m.</em><br />
          1932
        </figcaption>
      </figure>
    </div>
  );
}
