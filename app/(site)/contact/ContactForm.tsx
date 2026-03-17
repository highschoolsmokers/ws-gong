"use client";

import { useActionState } from "react";
import { sendMessage, type FormState } from "./actions";

const initialState: FormState = { status: "idle", message: "" };

export default function ContactForm() {
  const [state, formAction, pending] = useActionState(sendMessage, initialState);

  if (state.status === "success") {
    return (
      <p className="text-sm text-neutral-600">{state.message}</p>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="name" className="block text-sm mb-1 text-neutral-600">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="w-full border border-neutral-200 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-neutral-400"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm mb-1 text-neutral-600">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full border border-neutral-200 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-neutral-400"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm mb-1 text-neutral-600">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          className="w-full border border-neutral-200 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-neutral-400 resize-none"
        />
      </div>

      {state.status === "error" && (
        <p className="text-sm text-red-500">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="text-sm px-4 py-2 bg-neutral-900 text-white rounded hover:bg-neutral-700 transition-colors disabled:opacity-40"
      >
        {pending ? "Sending…" : "Send"}
      </button>
    </form>
  );
}
