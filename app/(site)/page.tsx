import Image from "next/image";
import { getSubstackPosts } from "@/lib/substack";

export default async function Home() {
  const posts = await getSubstackPosts("highschoolsmokers", 1);
  const latest = posts[0] ?? null;

  return (
    <div className="space-y-0">
      <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
        <div />
        <div className="space-y-4 text-sm leading-relaxed">
          <p>
            Fiction editor at{" "}
            <a
              href="https://therumpus.net"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-70 transition-opacity"
            >
              The Rumpus
            </a>
            . Technical writer with twenty-five years in software. Building
            tools at the intersection of language models and the writing craft.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
        <div />
        <figure className="space-y-5">
          <Image
            src="/images/giacometti_palace_4am.jpg"
            alt="Alberto Giacometti, The Palace at 4 a.m., 1932"
            width={813}
            height={600}
            className="w-full h-auto"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIBAAAgIBBAMBAAAAAAAAAAAAAQIDBAAFBhESITFBUf/EABQBAQAAAAAAAAAAAAAAAAAAAAX/xAAZEQACAwEAAAAAAAAAAAAAAAABAgADERL/2gAMAwEAAhEDEEQA/wCzTd6WaijJp8Mc0kceZYpmKqjeSVIBJxjGSKhLCOzuf//Z"
            priority
          />
          <figcaption className="text-sm leading-relaxed">
            Alberto Giacometti
            <br />
            <em>The Palace at 4 a.m.</em>
            <br />
            1932
          </figcaption>
        </figure>
      </section>

      {latest && (
        <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
          <h2 className="text-xl md:text-2xl font-black leading-tight">
            Latest
          </h2>
          <a
            href={latest.canonical_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block hover:opacity-70 transition-opacity"
          >
            <span className="text-sm font-semibold">{latest.title}</span>
            {latest.subtitle && (
              <span className="text-sm block mt-0.5">{latest.subtitle}</span>
            )}
            <span className="text-xs block mt-2 text-neutral-500">
              {new Date(latest.post_date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              {" · Substack"}
            </span>
          </a>
        </section>
      )}
    </div>
  );
}
