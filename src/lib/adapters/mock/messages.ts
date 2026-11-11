import type { MessageAdapter, OutboundMessage } from "../types";

export interface OutboxEntry extends OutboundMessage {
  id: string;
  channel: "email" | "whatsapp";
  at: string;
}

/** Demo outbox: messages are recorded here instead of being sent. Shown in the admin panel. */
export const outbox: OutboxEntry[] = [];

function recorder(channel: "email" | "whatsapp", name: string): MessageAdapter {
  return {
    name,
    channel,
    async send(message) {
      const id = `msg_${outbox.length + 1}`;
      outbox.unshift({ ...message, id, channel, at: new Date().toISOString() });
      outbox.splice(50);
      return { id };
    },
  };
}

export const mockEmailAdapter = recorder("email", "Mock Resend");
export const mockWhatsAppAdapter = recorder("whatsapp", "Mock WhatsApp");
