import { count, eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getDb, schema as t, type Database } from "@/lib/db";
import { newId } from "@/lib/db/ids";
import { seedDatabase } from "@/lib/db/seed";
import { nextSequenceValue } from "@/lib/db/sequences";
import { storeFile, loadFile } from "@/lib/files";
import { rateLimit } from "@/lib/rate-limit";

/**
 * The other tests run on the in-process database. This file runs the same schema, seed
 * and helpers on a real Postgres server, which CI provides through TEST_DATABASE_URL.
 * It expects an empty, throwaway database.
 */
const url = process.env.TEST_DATABASE_URL;
const shared = globalThis as unknown as { __zaffreDatabase?: Promise<Database> };
let db: Database;

describe.skipIf(!url)("real Postgres", () => {
  beforeAll(async () => {
    process.env.DATABASE_URL = url;
    shared.__zaffreDatabase = undefined;
    db = await getDb(); // Applies the migrations.
    await seedDatabase(db, Date.parse("2026-11-11T12:00:00Z"));
  }, 120_000);

  afterAll(() => {
    delete process.env.DATABASE_URL;
    shared.__zaffreDatabase = undefined;
  });

  it("migrates, seeds and reads rows in the shapes the app expects", async () => {
    const [sites] = await db.select({ n: count() }).from(t.sites);
    expect(sites?.n).toBeGreaterThan(0);
    const [site] = await db.select().from(t.sites).where(eq(t.sites.id, "site_1"));
    expect(site?.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    const [member] = await db.select().from(t.memberships).where(eq(t.memberships.id, "mem_2"));
    expect(member?.siteIds).toEqual(["site_1", "site_2"]);
    const [invoice] = await db.select().from(t.invoices).limit(1);
    expect(Array.isArray(invoice?.lines)).toBe(true);
  });

  it("hands out invoice and ticket numbers from the database", async () => {
    const first = await nextSequenceValue(db, "invoice_number_seq");
    expect(await nextSequenceValue(db, "invoice_number_seq")).toBe(first + 1);
    const [ticket] = await db.insert(t.tickets).values({ id: newId("tkt"), accountId: "acc_uk", subject: "Numbering" }).returning({ number: t.tickets.number });
    expect(ticket?.number).toBeGreaterThan(1044);
  });

  it("stores and returns uploaded bytes unchanged", async () => {
    const data = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0, 255, 1, 2, 3]);
    const id = await storeFile(db, { accountId: "acc_uk", uploadedBy: "usr_owner", file: { name: "proof.png", mime: "image/png", size: data.length, data } });
    const file = await loadFile(id, "acc_uk");
    expect(file && Buffer.compare(file.data, data)).toBe(0);
    expect(await loadFile(id, "acc_agency")).toBeNull();
  });

  it("rolls a transaction back as a whole", async () => {
    const id = newId("note");
    await expect(
      db.transaction(async (tx) => {
        await tx.insert(t.adminNotes).values({ id, accountId: "acc_uk", authorName: "Test", body: "never saved" });
        throw new Error("stop");
      }),
    ).rejects.toThrow("stop");
    expect(await db.select().from(t.adminNotes).where(eq(t.adminNotes.id, id))).toHaveLength(0);
  });

  it("counts rate limits atomically", async () => {
    const key = `pg:${newId("k")}`;
    const results = await Promise.all(Array.from({ length: 8 }, () => rateLimit(key, 5, 60_000)));
    expect(results.filter((r) => r.ok)).toHaveLength(5);
  });
});
