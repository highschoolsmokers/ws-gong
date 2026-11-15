"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type DragEvent,
} from "react";
import { MAX_FILE_SIZE, MAX_FILES } from "@/lib/upload";
import { sendMessage, type FormState } from "./actions";

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
  const [loadedAt, setLoadedAt] = useState(0);
  const [files, setFiles] = useState<{ id: string; file: File }[]>([]);
  const [dragging, setDragging] = useState(false);
  const depth = useRef(0); // dragenter/leave fire per child element
  const picker = useRef<HTMLInputElement>(null);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- client load time for the anti-spam timer
  useEffect(() => setLoadedAt(Date.now()), []);

  // Copy the FileList now: the picker is cleared before the updater runs.
  const add = (list: FileList | null) => {
    const incoming = Array.from(list ?? []);
    setFiles((prev) =>
      [
        ...prev,
        ...incoming.map((file) => ({
          id: crypto.randomUUID(),
          file,
        })),
      ]
        .filter(({ file }) => file.size <= MAX_FILE_SIZE)
        .slice(0, MAX_FILES),
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
        <p className="text-2xl font-bold tracking-tight">{state.message}</p>
        <button onClick={onReset} className="font-medium">
          Send another message
        </button>
      </div>
    );

  return (
    <form
      action={(data) => {
        files.forEach(({ file }) => data.append("attachments", file));
        action(data);
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
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center border-4 border-dashed border-background bg-foreground/90 text-4xl font-bold text-background">
          Drop to Attach
        </div>
      )}
      <input
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 opacity-0"
      />
      <input type="hidden" name="_t" value={loadedAt} />
      <div className="grid grid-cols-2 gap-4">
        <input
          name="name"
          required
          aria-label="Name"
          placeholder="Name"
          className="field"
        />
        <input
          name="email"
          type="email"
          required
          aria-label="Email"
          placeholder="Email"
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
          or drag and drop (max {MAX_FILES} files, 5 MB each)
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
      <div className="flex items-baseline gap-3">
        <button
          type="submit"
          disabled={pending || !loadedAt}
          className="text-xl font-medium tracking-tight hover:underline disabled:opacity-40"
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
