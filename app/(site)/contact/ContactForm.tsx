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
import { MAX_FILE_SIZE, MAX_FILES } from "@/lib/upload";

const initialState: FormState = { status: "idle", message: "" };

export default function ContactForm() {
  const [formKey, setFormKey] = useState(0);
  return (
    <ContactFormInner key={formKey} onReset={() => setFormKey((k) => k + 1)} />
  );
}

function ContactFormInner({ onReset }: { onReset: () => void }) {
  const [state, formAction, pending] = useActionState(
    sendMessage,
    initialState,
  );
  const [loadedAt, setLoadedAt] = useState<number>(0);
  // Wrap each File with a stable id so React can track items across reorders
  // or removals without reusing the same array index as a key.
  const [files, setFiles] = useState<{ id: string; file: File }[]>([]);
  const [dragging, setDragging] = useState(false);
  const dragCounter = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: records client-side load time for anti-spam timing
    setLoadedAt(Date.now());
  }, []);

  const addFiles = useCallback((incoming: File[]) => {
    setFiles((prev) => {
      const wrapped = incoming.map((file) => ({
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
      }));
      const combined = [...prev, ...wrapped].slice(0, MAX_FILES);
      return combined.filter(({ file }) => file.size <= MAX_FILE_SIZE);
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

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(e.target.files || []));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Inject files into FormData before submission
  const handleSubmit = (formData: FormData) => {
    for (const { file } of files) {
      formData.append("attachments", file);
    }
    formAction(formData);
  };

  if (state.status === "success") {
    return (
      <div className="swiss-grid swiss-rule pt-6">
        <div />
        <div className="space-y-4">
          <p className="text-2xl font-bold tracking-tight">{state.message}</p>
          <button onClick={onReset} className="text-sm font-medium">
            Send another message
          </button>
        </div>
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
          <span className="text-4xl font-bold tracking-tight text-white">
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
        <section className="swiss-grid swiss-rule pt-6 pb-12">
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
              <span className="text-xs text-neutral-500">
                or drag and drop (max {MAX_FILES} files, 5 MB each)
              </span>
            </div>
            {files.length > 0 && (
              <div className="space-y-1">
                {files.map(({ id, file }) => (
                  <div
                    key={id}
                    className="flex items-baseline gap-2 text-sm text-neutral-500"
                  >
                    <span>{file.name}</span>
                    <span className="text-neutral-500">
                      ({(file.size / 1024).toFixed(1)}kb)
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(id)}
                      className="text-neutral-400 hover:text-red-500 text-xs"
                      aria-label={`Remove ${file.name}`}
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
        <section className="swiss-grid swiss-rule pt-6 pb-12">
          <div />
          <div className="flex items-baseline gap-3">
            <button
              type="submit"
              disabled={pending || !loadedAt}
              className="text-xl font-medium text-neutral-400 hover:text-black hover:underline transition-colors tracking-tight disabled:opacity-40"
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
