"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface Attachment {
  name: string;
  size: number;
}

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

function emptyForm(): FormData {
  return { name: "", email: "", subject: "", message: "" };
}

export default function ContactForm() {
  const [form, setForm] = useState<FormData>(emptyForm());
  const [honeypot, setHoneypot] = useState("");
  const [csrfToken, setCsrfToken] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState("");
  const dragCounter = useRef(0);
  const searchParams = useSearchParams();

  // Fetch CSRF token on mount
  useEffect(() => {
    fetch("/api/laboratory/csrf")
      .then((r) => r.json())
      .then((d) => setCsrfToken(d.token))
      .catch(() => {});
  }, []);

  // Context-aware: pre-fill subject from URL param
  useEffect(() => {
    const from = searchParams.get("from");
    if (from) {
      setForm((f) => ({
        ...f,
        subject:
          f.subject ||
          `Re: ${from.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}`,
      }));
    }
  }, [searchParams]);

  // Typography that reacts: scale title based on message length
  const titleStyle = (() => {
    const len = form.message.length;
    const weight = Math.max(400, 900 - Math.min(len, 500));
    const spacing = Math.min(len * 0.005, 3);
    return {
      fontWeight: weight,
      letterSpacing: `${spacing}px`,
      transition: "font-weight 0.5s ease, letter-spacing 0.5s ease",
    };
  })();

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

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    setAttachments((prev) => [
      ...prev,
      ...files.map((f) => ({ name: f.name, size: f.size })),
    ]);
  }, []);

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validate = (): boolean => {
    const e: Partial<FormData> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.email.trim()) e.email = "Required";
    else if (!/^[\w.-]+@[\w.-]+\.\w+$/.test(form.email))
      e.email = "Invalid email";
    if (!form.subject.trim()) e.subject = "Required";
    if (!form.message.trim()) e.message = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const clearError = (field: keyof FormData) => {
    setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const handleSend = () => {
    // Honeypot: if filled, silently "succeed" but do nothing
    if (honeypot) {
      setStatus("Message sent (demo)");
      setTimeout(() => setStatus(""), 3000);
      return;
    }
    if (!validate()) return;
    // TODO: when backend is wired, send csrfToken with the request
    // await fetch("/api/contact", { method: "POST", headers: { "x-csrf-token": csrfToken }, body: ... })
    setStatus("Message sent (demo)");
    setErrors({});
    setTimeout(() => setStatus(""), 3000);
  };

  const update = (field: keyof FormData, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  return (
    <div
      className="min-h-screen bg-black text-white capitalize"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drop overlay */}
      {dragging && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center border-4 border-dashed border-white">
          <span className="text-4xl font-black tracking-tight">
            Drop to Attach
          </span>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-8 py-12 md:px-12 md:py-16">
        {/* Header */}
        <header className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8 md:gap-12 mb-16">
          <h1
            className="text-5xl md:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight"
            style={titleStyle}
          >
            Contact
          </h1>
          <div>
            <Link
              href="/laboratory"
              className="flex items-center gap-2.5 hover:opacity-70 transition-opacity"
            >
              <div className="w-5 h-5 bg-white" />
              <span className="text-xl font-black tracking-tight">
                Laboratory
              </span>
            </Link>
          </div>
        </header>

        {/* Form */}
        <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-white pt-8 pb-10">
          <h2 className="text-xl md:text-2xl font-black leading-tight">
            Inquiry
          </h2>
          <div className="space-y-6">
            {/* Honeypot — hidden from real users, bots will fill it */}
            <input
              type="text"
              name="website_url"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              className="absolute opacity-0 h-0 w-0 overflow-hidden pointer-events-none"
              aria-hidden="true"
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  className={`border-b bg-transparent px-0 py-2 text-sm outline-none placeholder:text-neutral-600 focus:border-white transition-colors w-full ${errors.name ? "border-red-400" : "border-neutral-700"}`}
                  placeholder="Name"
                  value={form.name}
                  onChange={(e) => {
                    update("name", e.target.value);
                    clearError("name");
                  }}
                />
                {errors.name && (
                  <span className="text-xs text-red-400 mt-1 block normal-case">
                    {errors.name}
                  </span>
                )}
              </div>
              <div>
                <input
                  className={`border-b bg-transparent px-0 py-2 text-sm outline-none placeholder:text-neutral-600 focus:border-white transition-colors w-full ${errors.email ? "border-red-400" : "border-neutral-700"}`}
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => {
                    update("email", e.target.value);
                    clearError("email");
                  }}
                />
                {errors.email && (
                  <span className="text-xs text-red-400 mt-1 block normal-case">
                    {errors.email}
                  </span>
                )}
              </div>
            </div>
            <div>
              <input
                className={`border-b bg-transparent px-0 py-2 text-sm outline-none placeholder:text-neutral-600 focus:border-white transition-colors w-full ${errors.subject ? "border-red-400" : "border-neutral-700"}`}
                placeholder="Subject"
                value={form.subject}
                onChange={(e) => {
                  update("subject", e.target.value);
                  clearError("subject");
                }}
              />
              {errors.subject && (
                <span className="text-xs text-red-400 mt-1 block normal-case">
                  {errors.subject}
                </span>
              )}
            </div>
            <div>
              <textarea
                className={`border-b bg-transparent px-0 py-2 text-sm outline-none placeholder:text-neutral-600 focus:border-white transition-colors resize-y min-h-32 w-full ${errors.message ? "border-red-400" : "border-neutral-700"}`}
                placeholder="Message"
                value={form.message}
                onChange={(e) => {
                  update("message", e.target.value);
                  clearError("message");
                }}
              />
              {errors.message && (
                <span className="text-xs text-red-400 mt-1 block normal-case">
                  {errors.message}
                </span>
              )}
            </div>
            {attachments.length > 0 && (
              <div className="space-y-1">
                {attachments.map((a, i) => (
                  <div
                    key={i}
                    className="flex items-baseline gap-2 text-sm text-neutral-500"
                  >
                    <span>{a.name}</span>
                    <span className="text-neutral-400">
                      ({(a.size / 1024).toFixed(1)}kb)
                    </span>
                    <button
                      onClick={() => removeAttachment(i)}
                      className="text-neutral-300 hover:text-red-500 text-xs"
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
        <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-white pt-8 pb-10">
          <div />
          <div className="flex flex-wrap items-baseline gap-0 text-xl tracking-tight">
            <button
              onClick={handleSend}
              className="font-semibold text-neutral-400 hover:text-white hover:underline transition-colors"
            >
              Send
            </button>
            {status && (
              <span className="text-xs text-neutral-400 ml-3">{status}</span>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
