import Link from "next/link";

export default function NotFound() {
  return (
    <section className="swiss-grid swiss-rule pt-6 pb-12">
      <h2 className="swiss-label">404</h2>
      <div className="space-y-4 text-sm">
        <p>This page does not exist.</p>
        <Link href="/" className="inline-block">
          ← Home
        </Link>
      </div>
    </section>
  );
}
