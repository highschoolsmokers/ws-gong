import type { Metadata } from "next";
import { Suspense } from "react";
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

// Revalidate at most once an hour so cached pages don't show deadlines that
// have already passed. The mine cron also calls revalidatePath("/residencies")
// after a successful run, which supersedes this floor.
export const revalidate = 3600;

export default async function ResidenciesPage() {
  const [opportunities, lastRun, sourceStats] = await Promise.all([
    // Fetch everything; the client filters by today + genre so that the SSR
    // cache stays valid across days without a rebuild.
    getOpportunities({ sort: "deadline", order: "asc" }),
    getLastRun(),
    getSourceStats(),
  ]);

  return (
    <div>
      <section className="swiss-grid swiss-rule pt-6 pb-12">
        <div className="col-span-12 md:col-span-4">
          <h2 className="swiss-label">Residencies</h2>
        </div>
        <div className="col-span-12 md:col-span-8 text-sm leading-relaxed">
          <p>
            Writer residencies, fellowships, and conferences — automatically
            discovered from{" "}
            <a
              href="https://www.pw.org/grants"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium"
            >
              Poets &amp; Writers
            </a>
            ,{" "}
            <a
              href="https://www.macdowell.org"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium"
            >
              MacDowell
            </a>
            , and other sources. Updated weekly.
          </p>
        </div>
      </section>

      <Suspense>
        <ResidenciesList
          opportunities={opportunities}
          lastRun={lastRun}
          sourceStats={sourceStats}
        />
      </Suspense>
    </div>
  );
}
