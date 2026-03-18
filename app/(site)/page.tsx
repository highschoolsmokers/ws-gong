import Image from "next/image";

export default function Home() {
  return (
    <div>
      <Image
        src="/header-glasses.svg"
        alt="W.S. Gong"
        width={400}
        height={120}
        priority
      />
    </div>
  );
}
