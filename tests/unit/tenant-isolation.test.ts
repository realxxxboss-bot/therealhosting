import { and, eq } from "drizzle-orm";
import { beforeAll, describe, expect, it } from "vitest";
import type { Viewer } from "@/lib/auth/session";
import { ForbiddenError, getInvoice, getSite, getTicket, listActivity, listDomains, listEnvVars, listInvoices, listNotifications, listSites, listTeam, listTickets } from "@/lib/data/client";
import { fromRow, userColumns } from "@/lib/data/rows";
import type { Account } from "@/lib/data/types";
import { createSampleDatabase, schema as t, type Database } from "@/lib/db";

let db: Database;

async function viewerFor(userId: string, accountId: string): Promise<Viewer> {
  const [user] = await db.select(userColumns).from(t.users).where(eq(t.users.id, userId));
  const [account] = await db.select().from(t.accounts).where(eq(t.accounts.id, accountId));
  const [membership] = await db
    .select()
    .from(t.memberships)
    .where(and(eq(t.memberships.userId, userId), eq(t.memberships.accountId, accountId)));
  const acc = fromRow<Account>(account!);
  return { user: user!, account: acc, membership: membership!, accounts: [acc], impersonator: null };
}

beforeAll(async () => {
  db = await createSampleDatabase({ now: Date.parse("2026-11-11T12:00:00Z") });
  // The data functions use the shared handle; point it at this test database.
  (globalThis as unknown as { __zaffreDatabase?: Promise<Database> }).__zaffreDatabase = Promise.resolve(db);
}, 60_000);

describe("tenant isolation", () => {
  it("only lists the viewer's own sites", async () => {
    const owner = await viewerFor("usr_owner", "acc_uk");
    const sites = await listSites(owner);
    expect(sites).toHaveLength(6);
    expect(sites.every((s) => s.accountId === "acc_uk")).toBe(true);
  });

  it("can't open another account's site, invoice or ticket by id", async () => {
    const owner = await viewerFor("usr_owner", "acc_uk");
    const [agencySite] = await db.select().from(t.sites).where(eq(t.sites.accountId, "acc_agency"));
    const [agencyInvoice] = await db.select().from(t.invoices).where(eq(t.invoices.accountId, "acc_agency"));
    const [agencyTicket] = await db.select().from(t.tickets).where(eq(t.tickets.accountId, "acc_agency"));
    expect(await getSite(owner, agencySite!.id)).toBeNull();
    expect(await getInvoice(owner, agencyInvoice!.id)).toBeNull();
    if (agencyTicket) expect(await getTicket(owner, agencyTicket.id)).toBeNull();
    await expect(listEnvVars(owner, agencySite!.id)).rejects.toThrow(ForbiddenError);
    expect((await listInvoices(owner)).every((i) => i.accountId === "acc_uk")).toBe(true);
    expect((await listTickets(owner)).every((x) => x.accountId === "acc_uk")).toBe(true);
    expect((await listNotifications(owner)).every((n) => n.accountId === "acc_uk")).toBe(true);
    expect((await listActivity(owner)).every((e) => e.accountId === "acc_uk")).toBe(true);
  });

  it("limits a developer to their assigned sites", async () => {
    const dev = await viewerFor("usr_dev", "acc_uk");
    expect((await listSites(dev)).map((s) => s.id).sort()).toEqual(["site_1", "site_2"]);
    expect(await getSite(dev, "site_5")).toBeNull();
    expect((await listDomains(dev)).every((d) => d.siteId === "site_1" || d.siteId === "site_2")).toBe(true);
    expect(await listInvoices(dev)).toEqual([]);
    await expect(listTeam(dev)).rejects.toThrow(ForbiddenError);
  });

  it("shows billing-only members invoices but no sites", async () => {
    const billing = await viewerFor("usr_billing", "acc_uk");
    expect(await listSites(billing)).toEqual([]);
    expect((await listInvoices(billing)).length).toBeGreaterThan(0);
  });

  it("never returns password hashes or 2FA secrets with team members", async () => {
    const owner = await viewerFor("usr_owner", "acc_uk");
    const { members } = await listTeam(owner);
    expect(members.length).toBeGreaterThan(0);
    for (const m of members) {
      expect(Object.keys(m.user)).not.toContain("passwordHash");
      expect(Object.keys(m.user)).not.toContain("totpSecret");
    }
  });
});
