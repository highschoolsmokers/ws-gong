import Image from "next/image";

export default function Home() {
  return (
    <div className="pt-16">
      <Image
        src="/header.png"
        alt="W.S. Gong"
        width={400}
        height={120}
        priority
        className="mb-4"
      />
      <p className="text-neutral-600 text-lg leading-relaxed">
        Writer. Based in [City].
      </p>
    </div>
  );
}
