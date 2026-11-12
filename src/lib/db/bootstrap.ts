import { count } from "drizzle-orm";
import { createSeed } from "@/lib/data/seed";
import { defaultNotificationPrefs } from "@/lib/data/defaults";
import type { Database } from "./index";
import { newId } from "./ids";
import * as t from "./schema";

/**
 * First start against an empty real database: add the built-in email templates and,
 * when ADMIN_EMAIL is set, the first admin user. The admin has no password yet; they
 * get a one-time "choose a password" link by email (or in the server log when no
 * email provider is configured yet). Later starts do nothing.
 */
export async function bootstrapDatabase(db: Database): Promise<void> {
  const [users] = await db.select({ n: count() }).from(t.users);
  if ((users?.n ?? 0) > 0) return;

  const [templates] = await db.select({ n: count() }).from(t.emailTemplates);
  if ((templates?.n ?? 0) === 0) {
    const now = new Date().toISOString();
    await db.insert(t.emailTemplates).values(createSeed(Date.now()).emailTemplates.map((tpl) => ({ ...tpl, updatedAt: now }))).onConflictDoNothing();
  }

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    console.warn("[setup] The database has no users. Set ADMIN_EMAIL and restart to create the first admin.");
    return;
  }
  const userId = newId("usr");
  const created = await db.insert(t.users).values({ id: userId, name: process.env.ADMIN_NAME?.trim() || "Admin", email, isAdmin: true }).onConflictDoNothing().returning({ id: t.users.id });
  if (created.length === 0) return; // Another copy of the app got there first.
  await db.insert(t.notificationPrefs).values({ userId, ...defaultNotificationPrefs() });

  const [{ createPasswordLink, WELCOME_LINK_DAYS }, { getAdapters }] = await Promise.all([import("@/lib/auth/links"), import("@/lib/adapters")]);
  const link = await createPasswordLink(userId, WELCOME_LINK_DAYS * 86_400_000, db);
  const result = await getAdapters().email.send({
    to: email,
    subject: "Set up your Zaffre admin account",
    body: `Your Zaffre admin account is ready.\n\nOpen this link to choose your password. It works once and expires in ${WELCOME_LINK_DAYS} days.\n\n${link}`,
  });
  if (!process.env.RESEND_API_KEY || result.id === "failed") {
    // No working email yet, so the only way to deliver the link is the server log.
    console.warn(`[setup] First admin created for ${email}. Choose a password here (works once): ${link}`);
  }
}
