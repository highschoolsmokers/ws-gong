import Image from "next/image";

export default function Home() {
  return (
    <div className="pt-16">
      <Image
        src="/header_no_glasses.svg"
        alt="W.S. Gong"
        width={400}
        height={120}
        priority
        className="mb-4 border border-black"
      />
    </div>
  );
}
