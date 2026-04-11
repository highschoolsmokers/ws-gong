import type { Metadata } from "next";
import {
  getOpportunities,
  getLastRun,
  getSourceStats,
} from "@/lib/residency-miner/db";
import ResidenciesList from "./ResidenciesList";

export const metadata: Metadata = {
  title: "Residencies",
  description:
    "Writer residencies, fellowships, and conferences — automatically discovered and updated weekly.",
};

// Fully cached; regenerated on demand when the mine cron calls
// revalidatePath("/residencies") after a successful run.
export const revalidate = false;

export default async function ResidenciesPage() {
  const today = new Date().toISOString().split("T")[0];

  const [opportunities, lastRun, sourceStats] = await Promise.all([
    getOpportunities({
      deadlineAfter: today,
      sort: "deadline",
      order: "asc",
    }),
    getLastRun(),
    getSourceStats(),
  ]);

  return (
    <div className="space-y-0">
      <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
        <h2 className="text-xl md:text-2xl font-black leading-tight">
          Residencies
        </h2>
        <div className="space-y-2 text-sm leading-relaxed">
          <p>
            Writer residencies, fellowships, and conferences — automatically
            discovered from{" "}
            <a
              href="https://www.pw.org/grants"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-70 transition-opacity font-semibold"
            >
              Poets &amp; Writers
            </a>
            ,{" "}
            <a
              href="https://www.macdowell.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-70 transition-opacity font-semibold"
            >
              MacDowell
            </a>
            , and other sources. Updated weekly.
          </p>
        </div>
      </section>

      <ResidenciesList
        opportunities={opportunities}
        lastRun={lastRun}
        sourceStats={sourceStats}
      />
    </div>
  );
}
