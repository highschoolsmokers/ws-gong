"use client";

import { useActionState, useEffect, useState } from "react";
import { sendMessage, type FormState } from "./actions";

const initialState: FormState = { status: "idle", message: "" };

export default function ContactForm() {
  const [state, formAction, pending] = useActionState(
    sendMessage,
    initialState,
  );
  const [loadedAt, setLoadedAt] = useState<number>(0);

  useEffect(() => {
    setLoadedAt(Date.now());
  }, []);

  if (state.status === "success") {
    return <p className="text-sm text-neutral-600">{state.message}</p>;
  }

  return (
    <form action={formAction} className="space-y-6">
      {/* Honeypot — invisible to humans, bots fill it */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0 }}
        aria-hidden="true"
      />
      {/* Timestamp for timing check */}
      <input type="hidden" name="_t" value={loadedAt} />

      <div className="grid grid-cols-[96px_1fr] gap-x-12 items-start">
        <label
          htmlFor="name"
          className="text-[10px] tracking-[0.12em] uppercase pt-2.5"
        >
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="w-full border-b border-neutral-300 py-2 text-sm bg-transparent focus:outline-none focus:border-black transition-colors"
        />
      </div>

      <div className="grid grid-cols-[96px_1fr] gap-x-12 items-start">
        <label
          htmlFor="email"
          className="text-[10px] tracking-[0.12em] uppercase pt-2.5"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full border-b border-neutral-300 py-2 text-sm bg-transparent focus:outline-none focus:border-black transition-colors"
        />
      </div>

      <div className="grid grid-cols-[96px_1fr] gap-x-12 items-start">
        <label
          htmlFor="message"
          className="text-[10px] tracking-[0.12em] uppercase pt-2.5"
        >
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          className="w-full border-b border-neutral-300 py-2 text-sm bg-transparent focus:outline-none focus:border-black transition-colors resize-none"
        />
      </div>

      {state.status === "error" && (
        <p className="text-xs text-red-500">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending || !loadedAt}
        className="text-[11px] tracking-[0.08em] uppercase border border-black px-5 py-2 hover:bg-black hover:text-white transition-colors disabled:opacity-40"
      >
        {pending ? "Sending…" : "Send"}
      </button>
    </form>
  );
}
