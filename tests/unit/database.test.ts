import { count, eq } from "drizzle-orm";
import { beforeAll, describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSeed } from "@/lib/data/seed";
import { createSampleDatabase, schema as t, type Database } from "@/lib/db";
import { newId } from "@/lib/db/ids";
import { nextSequenceValue } from "@/lib/db/sequences";

const NOW = Date.UTC(2026, 10, 12, 12, 0, 0);
let db: Database;

beforeAll(async () => {
  db = await createSampleDatabase({ now: NOW });
}, 60_000);

describe("database schema and sample data", () => {
  it("applies the migrations and loads every sample row", async () => {
    const seed = createSeed(NOW);
    const [users] = await db.select({ n: count() }).from(t.users);
    const [sites] = await db.select({ n: count() }).from(t.sites);
    const [invoices] = await db.select({ n: count() }).from(t.invoices);
    const [messages] = await db.select({ n: count() }).from(t.ticketMessages);
    expect(users?.n).toBe(seed.users.length);
    expect(sites?.n).toBe(seed.sites.length);
    expect(invoices?.n).toBe(seed.invoices.length);
    expect(messages?.n).toBe(seed.tickets.reduce((sum, ticket) => sum + ticket.messages.length, 0));
  });

  it("returns times as ISO strings and JSON columns as objects", async () => {
    const seed = createSeed(NOW);
    const [site] = await db.select().from(t.sites).where(eq(t.sites.id, seed.sites[0]!.id));
    expect(site?.createdAt).toBe(seed.sites[0]!.createdAt);
    const [invoice] = await db.select().from(t.invoices).where(eq(t.invoices.id, seed.invoices[0]!.id));
    expect(invoice?.lines).toEqual(seed.invoices[0]!.lines);
    const [member] = await db.select().from(t.memberships).where(eq(t.memberships.id, "mem_2"));
    expect(member?.siteIds).toEqual(["site_1", "site_2"]);
  });

  it("continues invoice and ticket numbers after the sample rows", async () => {
    const seed = createSeed(NOW);
    expect(await nextSequenceValue(db, "invoice_number_seq")).toBe(seed.counters.invoice + 1);
    const [ticket] = await db
      .insert(t.tickets)
      .values({ id: newId("tkt"), accountId: "acc_uk", subject: "Numbering check" })
      .returning({ number: t.tickets.number });
    expect(ticket?.number).toBe(seed.counters.ticket + 1);
  });

  it("refuses a second user with the same email", async () => {
    await expect(db.insert(t.users).values({ id: newId("usr"), name: "Copy", email: "owner@ukclient.example" })).rejects.toThrow();
  });

  it("removes an account's data when the account is deleted", async () => {
    await db.delete(t.accounts).where(eq(t.accounts.id, "acc_agency"));
    const [sites] = await db.select({ n: count() }).from(t.sites).where(eq(t.sites.accountId, "acc_agency"));
    const [invoices] = await db.select({ n: count() }).from(t.invoices).where(eq(t.invoices.accountId, "acc_agency"));
    expect(sites?.n).toBe(0);
    expect(invoices?.n).toBe(0);
    const [other] = await db.select({ n: count() }).from(t.sites).where(eq(t.sites.accountId, "acc_uk"));
    expect(other?.n).toBeGreaterThan(0);
  });
});

describe("password hashing", () => {
  it("verifies the right password and rejects others", async () => {
    const hash = await hashPassword("correct horse battery");
    expect(hash.startsWith("scrypt$")).toBe(true);
    expect(await verifyPassword("correct horse battery", hash)).toBe(true);
    expect(await verifyPassword("correct horse batterx", hash)).toBe(false);
    expect(await verifyPassword("anything", null)).toBe(false);
    expect(await verifyPassword("anything", "not-a-hash")).toBe(false);
  });

  it("salts every hash", async () => {
    expect(await hashPassword("same")).not.toBe(await hashPassword("same"));
  });

  it("stores hashed passwords for the sample users", async () => {
    const [user] = await db.select().from(t.users).where(eq(t.users.email, "owner@ukclient.example"));
    expect(await verifyPassword("demo", user?.passwordHash)).toBe(true);
  });
});

describe("ids", () => {
  it("creates prefixed, unique ids", () => {
    const ids = new Set(Array.from({ length: 500 }, () => newId("site")));
    expect(ids.size).toBe(500);
    expect([...ids][0]).toMatch(/^site_[0-9a-z]{12}$/);
  });
});
