import type { Metadata } from "next";
import Image from "next/image";
import { getSubstackPosts } from "@/lib/substack";

export const metadata: Metadata = {
  title: "W.S. Gong — Stories & Systems",
  description:
    "Fiction editor at The Rumpus. Technical writer with twenty-five years in software. Building tools at the intersection of language models and the craft of writing.",
  openGraph: {
    title: "W.S. Gong — Stories & Systems",
    description:
      "Fiction editor at The Rumpus. Technical writer with twenty-five years in software. Building tools at the intersection of language models and the craft of writing.",
  },
};

export default async function Home() {
  const posts = await getSubstackPosts("highschoolsmokers", 1);
  const latest = posts[0] ?? null;

  return (
    <div>
      <section className="swiss-grid swiss-rule pt-6 pb-16">
        <div className="col-span-12 md:col-span-4">
          <span className="swiss-label">Statement</span>
        </div>
        <div className="col-span-12 md:col-span-8">
          <p className="text-base leading-relaxed max-w-prose">
            Fiction editor at{" "}
            <a
              href="https://therumpus.net"
              target="_blank"
              rel="noopener noreferrer"
            >
              The Rumpus
            </a>
            .<br />
            Technical writer with twenty-five years in software.
            <br />
            Building tools at the intersection of language models and the craft
            of writing.
          </p>
        </div>
      </section>

      <section className="swiss-grid swiss-rule pt-6 pb-16">
        <div className="col-span-12 md:col-span-4">
          <span className="swiss-label">Plate 01</span>
        </div>
        <figure className="col-span-12 md:col-span-8 space-y-4">
          <Image
            src="/images/giacometti_palace_4am.jpg"
            alt="Alberto Giacometti, The Palace at 4 a.m., 1932"
            width={813}
            height={600}
            className="w-full h-auto border border-black"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIBAAAgIBBAMBAAAAAAAAAAAAAQIDBAAFBhESITFBUf/EABQBAQAAAAAAAAAAAAAAAAAAAAX/xAAZEQACAwEAAAAAAAAAAAAAAAABAgADERL/2gAMAwEAAhEDEEQA/wCzTd6WaijJp8Mc0kceZYpmKqjeSVIBJxjGSKhLCOzuf//Z"
            priority
          />
          <figcaption className="grid grid-cols-12 gap-x-6 text-sm">
            <span className="col-span-4 swiss-label">Figure</span>
            <span className="col-span-8">
              Alberto Giacometti, <em>The Palace at 4 a.m.</em>, 1932
            </span>
          </figcaption>
        </figure>
      </section>

      {latest && (
        <section className="swiss-grid swiss-rule pt-6 pb-16">
          <div className="col-span-12 md:col-span-4">
            <span className="swiss-label">Latest</span>
          </div>
          <a
            href={latest.canonical_url}
            target="_blank"
            rel="noopener noreferrer"
            className="col-span-12 md:col-span-8 block no-underline hover:!no-underline"
          >
            <span className="block text-lg font-medium leading-tight">
              {latest.title}
            </span>
            {latest.subtitle && (
              <span className="block mt-2 text-sm leading-relaxed">
                {latest.subtitle}
              </span>
            )}
            <span className="mt-4 flex items-baseline gap-3 text-xs uppercase tracking-[0.12em] text-neutral-500">
              <span>
                {new Date(latest.post_date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <span aria-hidden>/</span>
              <span>Substack</span>
            </span>
          </a>
        </section>
      )}
    </div>
  );
}
