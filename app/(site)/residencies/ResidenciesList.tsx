"use client";

import { useMemo, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Opportunity, MineRunLog } from "@/lib/residency-miner/types";

type RunLog = MineRunLog;

interface SourceStats {
  active: number;
  inactive: number;
}

type GenreFilter =
  | ""
  | "fiction"
  | "nonfiction"
  | "poetry"
  | "screenwriting"
  | "multi"
  | "other";

const GENRE_OPTIONS: { value: GenreFilter; label: string }[] = [
  { value: "", label: "All genres" },
  { value: "fiction", label: "Fiction" },
  { value: "nonfiction", label: "Nonfiction" },
  { value: "poetry", label: "Poetry" },
  { value: "screenwriting", label: "Screenwriting" },
  { value: "multi", label: "Multi-genre" },
  { value: "other", label: "Other" },
];

interface Props {
  opportunities: Opportunity[];
  lastRun: RunLog | null;
  sourceStats: SourceStats;
}

function nextMondayUtc(): Date {
  const now = new Date();
  const day = now.getUTCDay();
  // Monday = 1; days until next Monday (0 → 1, 1 → 7 for today, etc.)
  const daysUntilMonday = (1 - day + 7) % 7 || 7;
  const next = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  next.setUTCDate(next.getUTCDate() + daysUntilMonday);
  next.setUTCHours(9, 0, 0, 0);
  return next;
}

export default function ResidenciesList({
  opportunities,
  lastRun,
  sourceStats,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const genreFilter = (searchParams.get("genre") as GenreFilter) || "";
  const setGenreFilter = useCallback(
    (value: GenreFilter) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("genre", value);
      } else {
        params.delete("genre");
      }
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return opportunities.filter((o) => {
      if (o.deadline !== "rolling" && o.deadline < today) return false;
      if (genreFilter && !o.genre.includes(genreFilter)) return false;
      return true;
    });
  }, [opportunities, genreFilter]);

  function formatDeadline(d: string): string {
    if (d === "rolling") return "Rolling";
    // Parse as UTC so the user's timezone can't shift the rendered day.
    const date = new Date(d + "T00:00:00Z");
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  }

  return (
    <>
      {/* Filters */}
      <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-6">
        <div />
        <div className="flex flex-wrap gap-3">
          <select
            aria-label="Filter by genre"
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value as GenreFilter)}
            className="text-sm border border-neutral-400 rounded px-2 py-1.5 bg-transparent focus:border-black transition-colors"
          >
            {GENRE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <span className="text-xs text-neutral-600 self-center">
            {filtered.length} results
          </span>
        </div>
      </section>

      {/* Results */}
      <section className="border-t border-black pt-4 pb-10">
        {filtered.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 py-8">
            <div />
            <p className="text-sm text-neutral-500">
              No opportunities found. Try adjusting your filters, or check back
              after the next weekly scan.
            </p>
          </div>
        )}

        <div className="divide-y divide-neutral-200">
          {filtered.map((opp) => {
            const isExpanded = expandedId === opp.id;

            return (
              <div key={opp.id} className="py-4">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-3 md:gap-12">
                  {/* Left column: deadline + location */}
                  <div className="text-xs space-y-0.5">
                    <div className="font-semibold">
                      {formatDeadline(opp.deadline)}
                    </div>
                    <div className="text-neutral-600">{opp.location}</div>
                  </div>

                  {/* Right column: main content */}
                  <div className="space-y-1.5">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : opp.id)}
                      className="text-left hover:opacity-70 transition-opacity"
                    >
                      <span className="text-sm font-semibold">{opp.name}</span>
                      <span className="text-sm text-neutral-500">
                        {" "}
                        — {opp.org}
                      </span>
                    </button>

                    {/* Tags row */}
                    <div className="flex flex-wrap gap-1.5">
                      {opp.genre.map((g) => (
                        <span
                          key={g}
                          className="text-xs border border-neutral-400 rounded px-1.5 py-0.5"
                        >
                          {g}
                        </span>
                      ))}
                      {opp.stipend !== null && (
                        <span className="text-xs border border-neutral-400 rounded px-1.5 py-0.5">
                          ${opp.stipend.toLocaleString()}
                          {opp.stipendMax !== null &&
                            opp.stipendMax !== opp.stipend &&
                            `–$${opp.stipendMax.toLocaleString()}`}
                        </span>
                      )}
                      <span className="text-xs border border-neutral-400 rounded px-1.5 py-0.5">
                        {opp.duration}
                      </span>
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="pt-2 space-y-2 text-sm leading-relaxed">
                        <p>{opp.description}</p>
                        {opp.eligibility !== "Open" && (
                          <p className="text-neutral-500">
                            Eligibility: {opp.eligibility}
                          </p>
                        )}
                        <a
                          href={opp.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block font-semibold hover:opacity-70 transition-opacity"
                        >
                          Apply →
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Last run footer */}
      <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-6 pb-4">
        <div />
        <div className="text-xs text-neutral-600 space-y-0.5">
          {lastRun && (
            <p>
              Last scan:{" "}
              {new Date(lastRun.timestamp).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
              {" · "}
              {lastRun.sourcesFetched} fetched · {lastRun.newFound} extracted
              {lastRun.errors && lastRun.errors.length > 0
                ? ` · ${lastRun.errors.length} errors`
                : ""}
            </p>
          )}
          <p>
            Sources: {sourceStats.active} active
            {sourceStats.inactive > 0
              ? ` · ${sourceStats.inactive} deactivated`
              : ""}
          </p>
          <p>
            Next scan:{" "}
            {nextMondayUtc().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}{" "}
            at 9:00 UTC
          </p>
        </div>
      </section>
    </>
  );
}
