"use server";

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export type FormState = {
  status: "idle" | "success" | "error";
  message: string;
};

import {
  MAX_FILE_SIZE,
  MAX_FILES,
  MAX_TOTAL_ATTACHMENT_BYTES,
  isBlockedAttachmentName,
} from "@/lib/upload";

const MIN_TIME_MS = 3000; // reject submissions faster than 3 seconds

export async function sendMessage(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  // Honeypot — bots fill this, humans don't see it
  const trap = formData.get("website")?.toString();
  if (trap) return { status: "error", message: "Something went wrong." };

  // Timing check — bots submit instantly
  const loadedAt = parseInt(formData.get("_t")?.toString() ?? "0", 10);
  if (!loadedAt || Date.now() - loadedAt < MIN_TIME_MS) {
    return { status: "error", message: "Something went wrong." };
  }

  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const subject = formData.get("subject")?.toString().trim();
  const message = formData.get("message")?.toString().trim();

  if (!name || !email || !message) {
    return { status: "error", message: "All fields are required." };
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return { status: "error", message: "Please enter a valid email address." };
  }

  const to = process.env.CONTACT_EMAIL;
  if (!to) return { status: "error", message: "Something went wrong." };

  const emailSubject = subject
    ? `[Contact Form] ${subject}`
    : `[Contact Form] Message from ${name}`;

  // Process attachments
  const rawFiles = formData.getAll("attachments");
  const attachments: { filename: string; content: Buffer }[] = [];
  let totalBytes = 0;
  for (const entry of rawFiles) {
    if (!(entry instanceof File) || entry.size === 0) continue;
    if (entry.size > MAX_FILE_SIZE) continue;
    if (isBlockedAttachmentName(entry.name)) continue;
    if (attachments.length >= MAX_FILES) break;
    // Skip oversized files but keep checking smaller ones — a 9 MB file
    // followed by a 100 KB file shouldn't drop the second silently.
    if (totalBytes + entry.size > MAX_TOTAL_ATTACHMENT_BYTES) continue;
    totalBytes += entry.size;
    attachments.push({
      filename: entry.name,
      content: Buffer.from(await entry.arrayBuffer()),
    });
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      replyTo: email,
      subject: emailSubject,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      headers: { "X-Source": "contact-form" },
      attachments,
    });

    return { status: "success", message: "Message sent. Thank you." };
  } catch (err) {
    console.error("Contact form send failed:", err);
    // Match the generic failure message used elsewhere so spammers can't
    // distinguish bot detection / config errors from real SMTP faults.
    return { status: "error", message: "Something went wrong." };
  }
}
