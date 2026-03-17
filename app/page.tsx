import Link from "next/link";

export default function Home() {
  return (
    <div className="pt-16">
      <h1 className="text-4xl font-semibold tracking-tight mb-4">W.S. Gong</h1>
      <p className="text-neutral-600 text-lg leading-relaxed mb-10">
        Writer. Based in [City].
      </p>
      <div className="flex gap-6 text-sm">
        <Link href="/writing" className="underline underline-offset-4 hover:opacity-70 transition-opacity">
          Writing
        </Link>
        <Link href="/about" className="underline underline-offset-4 hover:opacity-70 transition-opacity">
          About
        </Link>
      </div>
    </div>
  );
}
