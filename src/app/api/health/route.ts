import { sql } from "drizzle-orm";
import { connection } from "next/server";
import { getDb } from "@/lib/db";

/**
 * Health check for the container platform and uptime monitoring: 200 when the app can reach
 * its database, 503 when it can't. Says nothing about the data itself.
 */
export async function GET() {
  await connection();
  try {
    const db = await getDb();
    await db.execute(sql`select 1`);
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ ok: false }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
