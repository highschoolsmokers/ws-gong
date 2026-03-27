"use client";

import {
  useActionState,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ChangeEvent,
} from "react";
import { sendMessage, type FormState } from "./actions";

const initialState: FormState = { status: "idle", message: "" };

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB per file
const MAX_FILES = 5;

export default function ContactForm() {
  const [state, formAction, pending] = useActionState(
    sendMessage,
    initialState,
  );
  const [loadedAt, setLoadedAt] = useState<number>(0);
  const [messageLen, setMessageLen] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const dragCounter = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setLoadedAt(Date.now());
  }, []);

  // Reactive typography: title weight responds to message length
  const titleStyle = (() => {
    const weight = Math.max(400, 900 - Math.min(messageLen, 500));
    const spacing = Math.min(messageLen * 0.005, 3);
    return {
      fontWeight: weight,
      letterSpacing: `${spacing}px`,
      transition: "font-weight 0.5s ease, letter-spacing 0.5s ease",
    };
  })();

  const addFiles = useCallback((incoming: File[]) => {
    setFiles((prev) => {
      const combined = [...prev, ...incoming].slice(0, MAX_FILES);
      return combined.filter((f) => f.size <= MAX_FILE_SIZE);
    });
  }, []);

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
    if (e.dataTransfer.types.includes("Files")) setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) setDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      dragCounter.current = 0;
      setDragging(false);
      addFiles(Array.from(e.dataTransfer.files));
    },
    [addFiles],
  );

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(e.target.files || []));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Inject files into FormData before submission
  const handleSubmit = (formData: FormData) => {
    for (const file of files) {
      formData.append("attachments", file);
    }
    formAction(formData);
  };

  if (state.status === "success") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8">
        <div />
        <p className="text-2xl font-black tracking-tight">{state.message}</p>
      </div>
    );
  }

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="relative"
    >
      {/* Drop overlay */}
      {dragging && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center border-4 border-dashed border-white">
          <span className="text-4xl font-black tracking-tight text-white">
            Drop to Attach
          </span>
        </div>
      )}

      <form ref={formRef} action={handleSubmit}>
        {/* Honeypot */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          style={{
            position: "absolute",
            left: "-9999px",
            opacity: 0,
            height: 0,
          }}
          aria-hidden="true"
        />
        <input type="hidden" name="_t" value={loadedAt} />

        {/* Form section */}
        <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
          <div />
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <input
                name="name"
                required
                aria-label="Name"
                className="border-b border-neutral-700 bg-transparent px-0 py-2 text-sm outline-none placeholder:text-neutral-500 focus:border-black transition-colors w-full"
                placeholder="Name"
              />
              <input
                name="email"
                type="email"
                required
                aria-label="Email"
                className="border-b border-neutral-700 bg-transparent px-0 py-2 text-sm outline-none placeholder:text-neutral-500 focus:border-black transition-colors w-full"
                placeholder="Email"
              />
            </div>
            <input
              name="subject"
              aria-label="Subject"
              className="border-b border-neutral-700 bg-transparent px-0 py-2 text-sm outline-none placeholder:text-neutral-500 focus:border-black transition-colors w-full"
              placeholder="Subject"
            />
            <textarea
              name="message"
              required
              aria-label="Message"
              rows={6}
              onChange={(e) => setMessageLen(e.target.value.length)}
              className="border border-neutral-700 bg-transparent px-3 py-3 text-sm outline-none placeholder:text-neutral-500 focus:border-black transition-colors resize-y min-h-40 w-full"
              placeholder="Message"
            />
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-sm text-neutral-400 hover:text-black transition-colors"
              >
                + Attach file
              </button>
              <span className="text-xs text-neutral-400">
                or drag and drop (max {MAX_FILES} files, 5 MB each)
              </span>
            </div>
            {files.length > 0 && (
              <div className="space-y-1">
                {files.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-baseline gap-2 text-sm text-neutral-500"
                  >
                    <span>{f.name}</span>
                    <span className="text-neutral-400">
                      ({(f.size / 1024).toFixed(1)}kb)
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="text-neutral-400 hover:text-red-500 text-xs"
                      aria-label={`Remove ${f.name}`}
                    >
                      {"\u00D7"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Actions */}
        <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
          <div />
          <div className="flex items-baseline gap-3">
            <button
              type="submit"
              disabled={pending || !loadedAt}
              className="text-xl font-semibold text-neutral-400 hover:text-black hover:underline transition-colors tracking-tight disabled:opacity-40"
            >
              {pending ? "Sending…" : "Send"}
            </button>
            {state.status === "error" && (
              <span className="text-sm text-red-400">{state.message}</span>
            )}
          </div>
        </section>
      </form>
    </div>
  );
}
