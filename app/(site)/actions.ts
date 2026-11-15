"use server";

import nodemailer from "nodemailer";
import {
  MAX_FILES,
  MAX_TOTAL_BYTES,
  isBlockedAttachmentName,
} from "@/lib/upload";

export type FormState = {
  status: "idle" | "success" | "error";
  message: string;
};

// Visitors see one generic failure for bot traps, config gaps and SMTP faults
// alike; the reason goes to the function log instead.
const FAIL: FormState = {
  status: "error",
  message: "Something went wrong. Please try again.",
};
const fail = (reason: string, err?: unknown) => {
  console.error(`Contact form rejected: ${reason}`, err ?? "");
  return FAIL;
};
const MIN_ELAPSED_MS = 3000;
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
  // Bot traps: the hidden field is filled, or the form went out faster than a
  // person types. Elapsed time is measured on the visitor's clock alone.
  if (field("contact_hp")) return fail("honeypot filled");
  if (!(Number(field("_elapsed")) >= MIN_ELAPSED_MS))
    return fail("submitted too fast");

  const [name, email, subject, message] = [
    "name",
    "email",
    "subject",
    "message",
  ].map(field);
  if (!name || !email || !message)
    return {
      status: "error",
      message: "Name, email, and message are required.",
    };
  if (!EMAIL.test(email))
    return { status: "error", message: "Please enter a valid email address." };
  if (!process.env.CONTACT_EMAIL || !process.env.SMTP_HOST)
    return fail("SMTP not configured");

  const attachments = [];
  let total = 0;
  for (const f of form.getAll("attachments")) {
    if (!(f instanceof File) || !f.size || isBlockedAttachmentName(f.name))
      continue;
    if (attachments.length >= MAX_FILES || total + f.size > MAX_TOTAL_BYTES)
      break;
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
    return fail("SMTP send failed", err);
  }
}
