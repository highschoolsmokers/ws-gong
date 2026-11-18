import { ext } from "@/app/components/ui";
import { SUBSCRIBE_URL } from "@/lib/substack";

// The home page's Writing section and /links. No script: a plain GET form.
export default function SubstackForm() {
  return (
    // Substack refuses sign-ups from other servers, so the address goes to its
    // subscribe page, which prefills it; the reader confirms there.
    <form
      action={SUBSCRIBE_URL}
      method="get"
      {...ext}
      aria-label="Subscribe on Substack"
      className="space-y-4"
    >
      <div className="grid grid-cols-8 items-baseline gap-[var(--gutter)]">
        <input
          name="email"
          type="email"
          required
          aria-label="Email"
          placeholder="Email"
          autoComplete="email"
          className="field col-span-4 md:col-span-5"
        />
        <button
          type="submit"
          className="col-span-4 justify-self-start border border-foreground px-(--gutter) py-[calc(var(--gutter)/4)] font-medium transition-colors hover:bg-foreground hover:text-background md:col-span-3"
        >
          Subscribe
        </button>
      </div>
      <p className="text-xs text-muted">
        Opens Substack to confirm. Free; unsubscribe anytime.
      </p>
    </form>
  );
}
