import type { NotificationPrefs } from "./types";

/** Notification settings a new user starts with. */
export function defaultNotificationPrefs(): Omit<NotificationPrefs, "userId"> {
  return {
    email: { site_down: true, site_up: true, invoice: true, payment_confirmed: true, ticket_reply: true, deploy: true, info: true },
    whatsapp: { site_down: true, site_up: true, invoice: false, payment_confirmed: false, ticket_reply: false, deploy: false, info: false },
  };
}
