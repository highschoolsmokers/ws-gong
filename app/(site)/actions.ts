"use server";

import nodemailer from "nodemailer";
import { issueToken, tokenIsValid } from "@/lib/form-token";
import {
  MAX_FILES,
  MAX_LENGTH,
  MAX_TOTAL_BYTES,
  isBlockedAttachmentName,
} from "@/lib/upload";

export type FormState = {
  status: "idle" | "success" | "error";
  message: string;
};

// Visitors see one generic failure for bot traps, config gaps and SMTP faults
// alike; the reason goes to the function log instead.
const fail = (reason: string, err?: unknown): FormState => {
  console.error(`Contact form rejected: ${reason}`, err ?? "");
  return {
    status: "error",
    message: "Something went wrong. Please try again.",
  };
};
const EMAIL = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Signs the anti-spam token. CONTACT_FORM_SECRET if set, else the SMTP
// password, which production already has; both stay on the server.
const tokenKey = () =>
  process.env.CONTACT_FORM_SECRET || process.env.SMTP_PASS || "";

const port = Number(process.env.SMTP_PORT) || 465;
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port,
  secure: port === 465,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

/** Called once, when a visitor first focuses the form. */
export async function issueFormToken(): Promise<string> {
  return issueToken(tokenKey());
}

export async function sendMessage(
  _prev: FormState,
  form: FormData,
): Promise<FormState> {
  const field = (k: string) => form.get(k)?.toString().trim() ?? "";
  if (field("contact_hp")) return fail("honeypot filled");

  const [name, email, subject, message] = "name email subject message"
    .split(" ")
    .map(field);
  if (!name || !email || !message)
    return {
      status: "error",
      message: "Name, email, and message are required.",
    };
  if (!EMAIL.test(email))
    return { status: "error", message: "Please enter a valid email address." };
  if (
    name.length > MAX_LENGTH.name ||
    subject.length > MAX_LENGTH.subject ||
    message.length > MAX_LENGTH.message
  )
    return {
      status: "error",
      message: `Please keep the name and subject under ${MAX_LENGTH.name} characters and the message under ${MAX_LENGTH.message.toLocaleString("en-US")}.`,
    };
  // Bot trap: no valid token, or the form went out faster than a person types.
  if (!tokenIsValid(field("_token"), tokenKey()))
    return fail("token missing, forged, too fresh, or stale");
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
