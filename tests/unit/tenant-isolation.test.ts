import { beforeEach, describe, expect, it } from "vitest";
import type { Viewer } from "@/lib/auth/session";
import { createSeed } from "@/lib/data/seed";
import { db } from "@/lib/data/store";
import { ForbiddenError, getInvoice, getSite, getTicket, listDomains, listEnvVars, listInvoices, listSites, listTeam, listTickets } from "@/lib/data/client";

function viewerFor(userId: string, accountId: string): Viewer {
  const store = db();
  const user = store.users.find((u) => u.id === userId)!;
  const account = store.accounts.find((a) => a.id === accountId)!;
  const membership = store.memberships.find((m) => m.userId === userId && m.accountId === accountId)!;
  return { user, account, membership, accounts: [account], impersonator: null };
}

beforeEach(() => {
  (globalThis as unknown as { __zaffreDb?: unknown }).__zaffreDb = createSeed(Date.parse("2026-11-11T12:00:00Z"));
});

describe("tenant isolation", () => {
  it("only lists the viewer's own sites", () => {
    const owner = viewerFor("usr_owner", "acc_uk");
    const sites = listSites(owner);
    expect(sites).toHaveLength(6);
    expect(sites.every((s) => s.accountId === "acc_uk")).toBe(true);
  });

  it("can't open another account's site, invoice or ticket by id", () => {
    const owner = viewerFor("usr_owner", "acc_uk");
    const agencySite = db().sites.find((s) => s.accountId === "acc_agency")!;
    const agencyInvoice = db().invoices.find((i) => i.accountId === "acc_agency")!;
    const agencyTicket = db().tickets.find((t) => t.accountId === "acc_agency")!;
    expect(getSite(owner, agencySite.id)).toBeNull();
    expect(getInvoice(owner, agencyInvoice.id)).toBeNull();
    expect(getTicket(owner, agencyTicket.id)).toBeNull();
    expect(() => listEnvVars(owner, agencySite.id)).toThrow(ForbiddenError);
    expect(listInvoices(owner).every((i) => i.accountId === "acc_uk")).toBe(true);
    expect(listTickets(owner).every((t) => t.accountId === "acc_uk")).toBe(true);
  });

  it("limits a developer to their assigned sites", () => {
    const dev = viewerFor("usr_dev", "acc_uk");
    expect(listSites(dev).map((s) => s.id).sort()).toEqual(["site_1", "site_2"]);
    expect(getSite(dev, "site_5")).toBeNull();
    expect(listDomains(dev).every((d) => d.siteId === "site_1" || d.siteId === "site_2")).toBe(true);
    expect(listInvoices(dev)).toEqual([]);
    expect(() => listTeam(dev)).toThrow(ForbiddenError);
  });

  it("shows billing-only members invoices but no sites", () => {
    const billing = viewerFor("usr_billing", "acc_uk");
    expect(listSites(billing)).toEqual([]);
    expect(listInvoices(billing).length).toBeGreaterThan(0);
  });
});
