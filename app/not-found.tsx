import Link from "next/link";

export default function NotFound() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
      <h2 className="text-xl md:text-2xl font-black leading-tight">404</h2>
      <div className="space-y-4 text-sm">
        <p>This page does not exist.</p>
        <Link
          href="/"
          className="inline-block hover:opacity-70 transition-opacity"
        >
          ← Home
        </Link>
      </div>
    </section>
  );
}
