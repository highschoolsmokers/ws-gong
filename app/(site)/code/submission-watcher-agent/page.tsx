import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Submission Watcher Agent",
  description:
    "A Claude Code plugin and Vercel cron that monitors literary magazine submission windows and emails alerts the moment they open.",
  openGraph: {
    title: "Submission Watcher Agent — W.S. Gong",
    description:
      "A Claude Code plugin and Vercel cron that monitors literary magazine submission windows and emails alerts the moment they open.",
  },
};

export default function SubmissionWatcherAgent() {
  return (
    <div className="space-y-0">
      <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight pb-8">
        Submission Watcher Agent
      </h1>
      <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
        <h2 className="text-xl md:text-2xl font-black leading-tight">
          Overview
        </h2>
        <div className="space-y-4 text-sm leading-relaxed">
          <p>
            Monitors literary magazine submission windows and emails the moment
            they open. Some of the best magazines have brief, unpredictable
            reading periods — miss the window by a day and you wait six months.
            This agent watches the Submittable pages on a twice-daily cron and
            fires a single notification per open window.
          </p>
          <p>
            Distributed as a{" "}
            <a
              href="https://docs.claude.com/en/docs/claude-code"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-70 transition-opacity font-semibold"
            >
              Claude Code
            </a>{" "}
            plugin that includes a setup agent — it walks the user through
            deployment to Vercel, environment variable configuration, and adding
            new magazine watchers.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
        <h2 className="text-xl md:text-2xl font-black leading-tight">
          How it works
        </h2>
        <div className="space-y-4 text-sm leading-relaxed">
          <ul className="space-y-2">
            <li>
              <span className="font-semibold">Watchers:</span> Each magazine is
              a module that exports a <code>run()</code> function returning{" "}
              <code>{"{ agent, open, checkedAt }"}</code>
            </li>
            <li>
              <span className="font-semibold">Parser:</span> Fetches the target
              Submittable page and filters out workshops, conferences, and teen
              programs to isolate magazine submission links
            </li>
            <li>
              <span className="font-semibold">Dedupe:</span> State stored in
              Upstash Redis so each opening triggers exactly one email, even
              across concurrent cron invocations
            </li>
            <li>
              <span className="font-semibold">Alerts:</span> Email sent via
              Resend with a branded sender address
            </li>
            <li>
              <span className="font-semibold">Schedule:</span> Vercel cron at 9
              AM and 5 PM; endpoint is CRON_SECRET protected
            </li>
            <li>
              <span className="font-semibold">Status API:</span>{" "}
              <code>GET /api/status</code> returns last check result and
              notification state per watcher
            </li>
          </ul>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
        <h2 className="text-xl md:text-2xl font-black leading-tight">
          Adding a watcher
        </h2>
        <div className="space-y-4 text-sm leading-relaxed">
          <p>
            Create a directory, implement <code>run()</code>, register it in{" "}
            <code>api/cron.mjs</code>. Deploy. The setup agent automates all of
            this, including initial Vercel deploy and env var scaffolding.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
        <h2 className="text-xl md:text-2xl font-black leading-tight">Stack</h2>
        <div className="text-sm leading-relaxed space-y-2">
          <p>JavaScript · Claude Code · Vercel Cron · Upstash Redis · Resend</p>
          <p>
            <a
              href="https://github.com/highschoolsmokers/submission-watcher-agent"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold hover:opacity-70 transition-opacity"
            >
              View on GitHub →
            </a>
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
        <div />
        <Link
          href="/code"
          className="text-sm font-semibold hover:opacity-70 transition-opacity"
        >
          ← All projects
        </Link>
      </section>
    </div>
  );
}
