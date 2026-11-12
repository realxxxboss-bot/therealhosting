import "server-only";
import { and, eq } from "drizzle-orm";
import { getDb, schema as t, type Database, type Tx } from "@/lib/db";
import { newId } from "@/lib/db/ids";
import { checkUpload, safeFileName, type AllowedUploadType } from "@/lib/uploads";

export type CheckedFile = { name: string; mime: AllowedUploadType; size: number; data: Buffer };

/** Reads an uploaded file and checks its size, declared type and first bytes. */
export async function readUpload(file: File): Promise<{ ok: true; file: CheckedFile } | { ok: false; error: string }> {
  const data = Buffer.from(await file.arrayBuffer());
  const check = checkUpload({ size: data.length, type: file.type, head: data.subarray(0, 8) });
  if (!check.ok) return { ok: false, error: check.error };
  return { ok: true, file: { name: safeFileName(file.name), mime: check.mime, size: data.length, data } };
}

/** Stores a checked file privately and returns its id. */
export async function storeFile(db: Database | Tx, input: { accountId: string; uploadedBy: string; file: CheckedFile }): Promise<string> {
  const id = newId("file");
  await db.insert(t.files).values({ id, accountId: input.accountId, uploadedBy: input.uploadedBy, name: input.file.name, mime: input.file.mime, size: input.file.size, data: input.file.data });
  return id;
}

/** A stored file, limited to one account unless `accountId` is null (admin). */
export async function loadFile(fileId: string, accountId: string | null) {
  const db = await getDb();
  const where = accountId === null ? eq(t.files.id, fileId) : and(eq(t.files.id, fileId), eq(t.files.accountId, accountId));
  const [row] = await db.select().from(t.files).where(where);
  return row ?? null;
}

/** Response for a private download. Files are always sent as attachments, never rendered inline. */
export function fileResponse(file: { name: string; mime: string; data: Buffer }): Response {
  return new Response(new Uint8Array(file.data), {
    headers: {
      "Content-Type": file.mime,
      "Content-Length": String(file.data.length),
      "Content-Disposition": `attachment; filename="${file.name.replace(/"/g, "")}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
