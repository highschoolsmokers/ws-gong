"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
  type DragEvent,
} from "react";
import {
  MAX_FILES,
  MAX_TOTAL_BYTES,
  isBlockedAttachmentName,
} from "@/lib/upload";
import { sendMessage, type FormState } from "./actions";

const MB = 1024 * 1024;

// Remounting on "Send another" resets the action state and the fields.
export default function ContactForm() {
  const [key, setKey] = useState(0);
  return <Form key={key} onReset={() => setKey(key + 1)} />;
}

function Form({ onReset }: { onReset: () => void }) {
  const [state, action, pending] = useActionState(sendMessage, {
    status: "idle",
    message: "",
  } as FormState);
  const [files, setFiles] = useState<{ id: string; file: File }[]>([]);
  const [note, setNote] = useState("");
  const [dragging, setDragging] = useState(false);
  const startedAt = useRef(0);
  const depth = useRef(0); // dragenter/leave fire per child element
  const picker = useRef<HTMLInputElement>(null);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  // Copy the FileList now: the picker is cleared before the updater runs.
  const add = (list: FileList | null) => {
    const kept = [...files];
    const skipped: string[] = [];
    for (const file of Array.from(list ?? [])) {
      const total = kept.reduce((n, f) => n + f.file.size, 0) + file.size;
      if (
        isBlockedAttachmentName(file.name) ||
        kept.length >= MAX_FILES ||
        total > MAX_TOTAL_BYTES
      )
        skipped.push(file.name);
      else kept.push({ id: crypto.randomUUID(), file });
    }
    setFiles(kept);
    setNote(
      skipped.length
        ? `Not attached (type, count, or size limit): ${skipped.join(", ")}`
        : "",
    );
  };
  const drag = (delta: number) => (e: DragEvent) => {
    e.preventDefault();
    depth.current += delta;
    setDragging(depth.current > 0 && e.dataTransfer.types.includes("Files"));
  };

  if (state.status === "success")
    return (
      <div className="space-y-4">
        <p className="text-2xl font-medium tracking-tight">{state.message}</p>
        <button onClick={onReset} className="font-medium">
          Send another message
        </button>
      </div>
    );

  return (
    <form
      // onSubmit rather than a form action: React resets the fields after an
      // action, which would wipe the message on any error.
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        files.forEach(({ file }) => data.append("attachments", file));
        data.set("_elapsed", String(Date.now() - startedAt.current));
        startTransition(() => action(data));
      }}
      onDragEnter={drag(1)}
      onDragLeave={drag(-1)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        drag(-depth.current)(e);
        add(e.dataTransfer.files);
      }}
      className="space-y-6 pt-4"
    >
      {dragging && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center border border-background bg-foreground/90 text-4xl font-medium text-background">
          <div className="swiss-container w-full">Drop to attach</div>
        </div>
      )}
      {/* Bot trap. The name and the ignore attributes keep browser autofill and password managers out of it. */}
      <input
        name="contact_hp"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        data-1p-ignore=""
        data-lpignore="true"
        data-form-type="other"
        className="absolute -left-[9999px] h-0 opacity-0"
      />
      <div className="grid grid-cols-2 gap-[var(--gutter)]">
        <input
          name="name"
          required
          aria-label="Name"
          placeholder="Name"
          autoComplete="name"
          className="field"
        />
        <input
          name="email"
          type="email"
          required
          aria-label="Email"
          placeholder="Email"
          autoComplete="email"
          className="field"
        />
      </div>
      <input
        name="subject"
        aria-label="Subject"
        placeholder="Subject"
        className="field"
      />
      <textarea
        name="message"
        required
        aria-label="Message"
        placeholder="Message"
        rows={6}
        className="field min-h-40 resize-y border border-muted p-3"
      />
      <div className="flex items-center gap-4 text-muted">
        <input
          ref={picker}
          type="file"
          multiple
          hidden
          onChange={(e) => (add(e.target.files), (e.target.value = ""))}
        />
        <button
          type="button"
          onClick={() => picker.current?.click()}
          className="hover:text-foreground"
        >
          + Attach file
        </button>
        <span className="text-xs">
          or drag and drop (up to {MAX_FILES} files, {MAX_TOTAL_BYTES / MB} MB
          total)
        </span>
      </div>
      {files.map(({ id, file }) => (
        <p key={id} className="text-muted">
          {file.name} ({(file.size / 1024).toFixed(1)}kb){" "}
          <button
            type="button"
            onClick={() => setFiles(files.filter((f) => f.id !== id))}
            aria-label={`Remove ${file.name}`}
            className="hover:text-red-600"
          >
            ×
          </button>
        </p>
      ))}
      {note && <p className="text-xs text-muted">{note}</p>}
      <div className="flex items-baseline gap-3">
        <button
          type="submit"
          disabled={pending}
          className="border border-foreground px-5 py-2 text-xl font-medium tracking-tight transition-colors hover:bg-foreground hover:text-background disabled:pointer-events-none disabled:opacity-40"
        >
          {pending ? "Sending…" : "Send"}
        </button>
        {state.status === "error" && (
          <span className="text-red-600">{state.message}</span>
        )}
      </div>
    </form>
  );
}
