import { sql } from "drizzle-orm";
import { hashPassword } from "@/lib/auth/password";
import { createSeed, DEMO_PASSWORD } from "@/lib/data/seed";
import type { Database } from "./index";
import * as t from "./schema";

/**
 * Loads the sample data set into an empty database. Used by the in-process sample
 * database and by `npm run db:seed` for a throwaway demo database. Never run it
 * against a database that holds real client data.
 */
export async function seedDatabase(db: Database, now: number): Promise<void> {
  const seed = createSeed(now);
  const passwordHash = await hashPassword(DEMO_PASSWORD);

  await db.transaction(async (tx) => {
    await tx.insert(t.users).values(seed.users.map((u) => ({ ...u, passwordHash })));
    await tx.insert(t.accounts).values(seed.accounts);
    await tx.insert(t.servers).values(seed.servers);
    await tx.insert(t.subscriptions).values(seed.subscriptions);
    await tx.insert(t.sites).values(seed.sites);
    await tx.insert(t.memberships).values(seed.memberships);
    await tx.insert(t.invites).values(seed.invites);
    await tx.insert(t.domains).values(seed.domains);
    await tx.insert(t.envVars).values(seed.envVars);
    await tx.insert(t.deployments).values(seed.deployments);
    await tx.insert(t.backups).values(seed.backups);
    if (seed.restoreRequests.length > 0) await tx.insert(t.restoreRequests).values(seed.restoreRequests);
    await tx.insert(t.mailboxes).values(seed.mailboxes);
    await tx.insert(t.paymentMethods).values(seed.paymentMethods);
    await tx.insert(t.invoices).values(seed.invoices);
    if (seed.payments.length > 0) await tx.insert(t.payments).values(seed.payments);
    await tx.insert(t.tickets).values(seed.tickets.map((ticket) => ({ ...ticket, messages: undefined })));
    await tx.insert(t.ticketMessages).values(seed.tickets.flatMap((ticket) => ticket.messages.map((m) => ({ ...m, ticketId: ticket.id }))));
    await tx.insert(t.notifications).values(seed.notifications);
    await tx.insert(t.notificationPrefs).values(seed.notificationPrefs);
    await tx.insert(t.auditLog).values(seed.auditLog);
    if (seed.adminNotes.length > 0) await tx.insert(t.adminNotes).values(seed.adminNotes);
    await tx.insert(t.emailTemplates).values(seed.emailTemplates).onConflictDoNothing();
    await tx.insert(t.settings).values({ key: "announcement", value: seed.announcement, updatedAt: seed.announcement.updatedAt });

    // Continue the human-facing numbers after the sample rows.
    await tx.execute(sql`select setval('invoice_number_seq', ${seed.counters.invoice})`);
    await tx.execute(sql`select setval(pg_get_serial_sequence('tickets', 'number'), ${seed.counters.ticket})`);
  });
}
