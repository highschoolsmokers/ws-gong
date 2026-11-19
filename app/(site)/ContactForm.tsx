"use client";

import {
  startTransition,
  useActionState,
  useRef,
  useState,
  type DragEvent,
} from "react";
import {
  MAX_FILES,
  MAX_LENGTH,
  MAX_TOTAL_BYTES,
  splitAttachments,
} from "@/lib/upload";
import { issueFormToken, sendMessage, type FormState } from "./actions";

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
  const depth = useRef(0); // dragenter/leave fire per child element
  const picker = useRef<HTMLInputElement>(null);
  // The anti-spam token is fetched on first focus, not on page load, so a
  // plain visit costs no server call; the server times from its issue.
  const token = useRef<Promise<string> | null>(null);
  const startTimer = () => {
    token.current ??= issueFormToken().catch(() => "");
  };

  // Copy the FileList now: the picker's value is cleared right after this call.
  const add = (list: FileList | null) => {
    const { kept, refused } = splitAttachments(
      Array.from(list ?? []),
      files.map((f) => f.file),
    );
    setFiles([
      ...files,
      ...kept.map((file) => ({ id: crypto.randomUUID(), file })),
    ]);
    setNote(
      refused.length
        ? `Not attached (type, count, or size limit): ${refused.join(", ")}`
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
        {/* Focus moves here: the form it replaces held focus. */}
        <p
          ref={(el) => el?.focus()}
          tabIndex={-1}
          role="status"
          className="font-medium"
        >
          {state.message}
        </p>
        <button onClick={onReset} className="font-medium">
          Send another message
        </button>
      </div>
    );

  return (
    <form
      // onSubmit rather than a form action: React resets the fields after an
      // action, which would wipe the message on any error.
      onFocus={startTimer}
      onSubmit={async (e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        files.forEach(({ file }) => data.append("attachments", file));
        startTimer();
        data.set("_token", await token.current!);
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
        <div className="pointer-events-none fixed inset-0 z-50 m-0 flex items-center bg-foreground/90 text-4xl font-medium text-background">
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
        className="honeypot"
      />
      <div className="grid grid-cols-2 gap-[var(--gutter)]">
        <label>
          <span className="field-label">Name</span>
          <input
            name="name"
            required
            autoComplete="name"
            maxLength={MAX_LENGTH.name}
            className="field"
          />
        </label>
        <label>
          <span className="field-label">Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="field"
          />
        </label>
      </div>
      <label className="block">
        <span className="field-label">Subject (optional)</span>
        <input
          name="subject"
          maxLength={MAX_LENGTH.subject}
          className="field"
        />
      </label>
      <label className="block">
        <span className="field-label">Message</span>
        <textarea
          name="message"
          required
          maxLength={MAX_LENGTH.message}
          rows={6}
          className="field min-h-40 resize-y"
        />
      </label>
      <div className="space-y-1 text-muted">
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
        <span className="block text-xs">
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
            className="px-2 hover:text-error"
          >
            ×
          </button>
        </p>
      ))}
      {/* Always rendered, so screen readers announce the note when it fills. */}
      <p role="status" className="text-xs text-muted empty:mb-0">
        {note}
      </p>
      <div className="space-y-2">
        <button
          type="submit"
          disabled={pending}
          className="border border-foreground px-(--gutter) py-[calc(var(--gutter)/4)] text-xl font-medium tracking-tight transition-colors hover:bg-foreground hover:text-background disabled:pointer-events-none disabled:opacity-40"
        >
          {pending ? "Sending…" : "Send"}
        </button>
        <p role="alert" className="text-error">
          {state.status === "error" ? state.message : ""}
        </p>
      </div>
    </form>
  );
}
