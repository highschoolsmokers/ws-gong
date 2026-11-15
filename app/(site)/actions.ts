"use server";

import nodemailer from "nodemailer";
import {
  MAX_FILE_SIZE,
  MAX_FILES,
  MAX_TOTAL_BYTES,
  isBlockedAttachmentName,
} from "@/lib/upload";

export type FormState = {
  status: "idle" | "success" | "error";
  message: string;
};

// One generic failure for bot traps, config gaps and SMTP faults alike, so a
// spammer can't tell which tripped.
const FAIL: FormState = { status: "error", message: "Something went wrong." };
const MIN_TIME_MS = 3000;
const EMAIL = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

export async function sendMessage(
  _prev: FormState,
  form: FormData,
): Promise<FormState> {
  const field = (k: string) => form.get(k)?.toString().trim() ?? "";
  // Honeypot filled, or submitted faster than a person types: a bot.
  const loadedAt = Number(field("_t"));
  if (field("website") || !loadedAt || Date.now() - loadedAt < MIN_TIME_MS)
    return FAIL;

  const [name, email, subject, message] = [
    "name",
    "email",
    "subject",
    "message",
  ].map(field);
  if (!name || !email || !message)
    return { status: "error", message: "All fields are required." };
  if (!EMAIL.test(email))
    return { status: "error", message: "Please enter a valid email address." };
  if (!process.env.CONTACT_EMAIL) return FAIL;

  // Skip oversized or blocked files but keep checking smaller ones after them.
  const attachments = [];
  let total = 0;
  for (const f of form.getAll("attachments")) {
    if (
      !(f instanceof File) ||
      !f.size ||
      f.size > MAX_FILE_SIZE ||
      isBlockedAttachmentName(f.name)
    )
      continue;
    if (attachments.length >= MAX_FILES) break;
    if (total + f.size > MAX_TOTAL_BYTES) continue;
    total += f.size;
    attachments.push({
      filename: f.name,
      content: Buffer.from(await f.arrayBuffer()),
    });
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.CONTACT_EMAIL,
      replyTo: email,
      subject: `[Contact Form] ${subject || `Message from ${name}`}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      headers: { "X-Source": "contact-form" },
      attachments,
    });
    return { status: "success", message: "Message sent. Thank you." };
  } catch (err) {
    console.error("Contact form send failed:", err);
    return FAIL;
  }
}
