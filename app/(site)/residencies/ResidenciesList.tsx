"use client";

import { useState, useEffect } from "react";

interface Opportunity {
  id: string;
  name: string;
  org: string;
  url: string;
  deadline: string;
  genre: string[];
  duration: string;
  stipend: number | null;
  location: string;
  eligibility: string;
  description: string;
  firstSeen: string;
  lastUpdated: string;
  status: string;
  sourceUrl: string;
}

interface RunLog {
  timestamp: string;
  sourcesFetched: number;
  newFound: number;
  updated: number;
}

type StatusFilter =
  | ""
  | "new"
  | "reviewed"
  | "bookmarked"
  | "applied"
  | "skipped";
type GenreFilter =
  | ""
  | "fiction"
  | "nonfiction"
  | "poetry"
  | "screenwriting"
  | "multi"
  | "other";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "new", label: "New" },
  { value: "reviewed", label: "Reviewed" },
  { value: "bookmarked", label: "Bookmarked" },
  { value: "applied", label: "Applied" },
  { value: "skipped", label: "Skipped" },
];

const GENRE_OPTIONS: { value: GenreFilter; label: string }[] = [
  { value: "", label: "All genres" },
  { value: "fiction", label: "Fiction" },
  { value: "nonfiction", label: "Nonfiction" },
  { value: "poetry", label: "Poetry" },
  { value: "screenwriting", label: "Screenwriting" },
  { value: "multi", label: "Multi-genre" },
  { value: "other", label: "Other" },
];

const STATUS_PATCH_OPTIONS = [
  "new",
  "reviewed",
  "bookmarked",
  "applied",
  "skipped",
];

export default function ResidenciesList() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [lastRun, setLastRun] = useState<RunLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [genreFilter, setGenreFilter] = useState<GenreFilter>("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (genreFilter) params.set("genre", genreFilter);
      params.set("deadlineAfter", today);

      const res = await fetch(`/api/opportunities?${params}`);
      if (!cancelled && res.ok) {
        const data = await res.json();
        setOpportunities(data.opportunities ?? []);
        setLastRun(data.lastRun ?? null);
      }
      if (!cancelled) setLoading(false);
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [statusFilter, genreFilter, today]);

  async function handleStatusChange(id: string, newStatus: string) {
    await fetch("/api/opportunities", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });

    setOpportunities((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)),
    );
  }

  function formatDeadline(d: string): string {
    if (d === "rolling") return "Rolling";
    const date = new Date(d + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <>
      {/* Filters */}
      <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-6">
        <div />
        <div className="flex flex-wrap gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="text-sm border border-neutral-400 rounded px-2 py-1.5 bg-transparent focus:border-black transition-colors"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select
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
          <span className="text-xs text-neutral-500 self-center">
            {loading ? "Loading..." : `${opportunities.length} results`}
          </span>
        </div>
      </section>

      {/* Results */}
      <section className="border-t border-black pt-4 pb-10">
        {!loading && opportunities.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 py-8">
            <div />
            <p className="text-sm text-neutral-500">
              No opportunities found. Try adjusting your filters, or check back
              after the next weekly scan.
            </p>
          </div>
        )}

        <div className="divide-y divide-neutral-200">
          {opportunities.map((opp) => {
            const isExpanded = expandedId === opp.id;

            return (
              <div key={opp.id} className="py-4">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-3 md:gap-12">
                  {/* Left column: deadline + location */}
                  <div className="text-xs space-y-0.5">
                    <div className="font-semibold">
                      {formatDeadline(opp.deadline)}
                    </div>
                    <div className="text-neutral-500">{opp.location}</div>
                  </div>

                  {/* Right column: main content */}
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-4">
                      <button
                        onClick={() =>
                          setExpandedId(isExpanded ? null : opp.id)
                        }
                        className="text-left hover:opacity-70 transition-opacity"
                      >
                        <span className="text-sm font-semibold">
                          {opp.name}
                        </span>
                        <span className="text-sm text-neutral-500">
                          {" "}
                          — {opp.org}
                        </span>
                      </button>

                      <select
                        value={opp.status}
                        onChange={(e) =>
                          handleStatusChange(opp.id, e.target.value)
                        }
                        className="text-xs border border-neutral-400 rounded px-1.5 py-0.5 bg-transparent shrink-0"
                      >
                        {STATUS_PATCH_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

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
      {lastRun && (
        <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-6 pb-4">
          <div />
          <p className="text-xs text-neutral-500">
            Last scan:{" "}
            {new Date(lastRun.timestamp).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
            {" · "}
            {lastRun.sourcesFetched} sources · {lastRun.newFound} new
          </p>
        </section>
      )}
    </>
  );
}
