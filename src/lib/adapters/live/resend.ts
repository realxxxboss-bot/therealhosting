import { site } from "@/config/site";
import type { MessageAdapter } from "../types";

/**
 * Sends platform emails through Resend's HTTP API. Used whenever RESEND_API_KEY is set.
 * A failed send is logged and reported as `failed`; it never undoes the action that
 * triggered it (the invoice, ticket or invite is already saved).
 */
export function createResendAdapter(apiKey: string): MessageAdapter {
  const from = process.env.EMAIL_FROM ?? `${site.name} <no-reply@${site.domain}>`;
  return {
    name: "Resend",
    channel: "email",
    async send(message) {
      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ from, to: [message.to], subject: message.subject, text: message.body, reply_to: site.contact.supportEmail }),
          signal: AbortSignal.timeout(10_000),
        });
        if (!response.ok) {
          console.error(`[email] Resend refused "${message.subject}": HTTP ${response.status}`);
          return { id: "failed" };
        }
        const data = (await response.json()) as { id?: string };
        return { id: data.id ?? "sent" };
      } catch (error) {
        console.error(`[email] Could not send "${message.subject}":`, error instanceof Error ? error.message : error);
        return { id: "failed" };
      }
    },
  };
}
