"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export type FormState = {
  status: "idle" | "success" | "error";
  message: string;
};

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
  const message = formData.get("message")?.toString().trim();

  if (!name || !email || !message) {
    return { status: "error", message: "All fields are required." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { status: "error", message: "Please enter a valid email address." };
  }

  const to = process.env.CONTACT_EMAIL;
  if (!to) return { status: "error", message: "Something went wrong." };

  try {
    await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ?? "Contact Form <onboarding@resend.dev>",
      to,
      replyTo: email,
      subject: `Message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    });

    return { status: "success", message: "Message sent. Thank you." };
  } catch {
    return {
      status: "error",
      message: "Something went wrong. Please try again.",
    };
  }
}
