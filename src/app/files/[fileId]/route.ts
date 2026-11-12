import { eq } from "drizzle-orm";
import { can } from "@/lib/auth/permissions";
import { findUser, readSession, requireViewer } from "@/lib/auth/session";
import { getDb, schema as t } from "@/lib/db";
import { fileResponse, loadFile } from "@/lib/files";

/**
 * Private download for payment proofs and ticket attachments.
 * Admins may open any file. Clients may open files of their own account only,
 * and payment proofs only with billing access.
 */
export async function GET(_request: Request, ctx: RouteContext<"/files/[fileId]">): Promise<Response> {
  const { fileId } = await ctx.params;
  const notFound = new Response("Not found", { status: 404 });
  const session = await readSession();
  if (!session) return new Response("Sign in to open this file.", { status: 401 });

  const actor = await findUser(session.uid);
  if (actor?.isAdmin && !session.imp) {
    const file = await loadFile(fileId, null);
    return file ? fileResponse(file) : notFound;
  }

  const viewer = await requireViewer();
  const file = await loadFile(fileId, viewer.account.id);
  if (!file) return notFound;
  const db = await getDb();
  const [proof] = await db.select({ id: t.payments.id }).from(t.payments).where(eq(t.payments.proofFileId, file.id));
  if (proof && !can(viewer.membership, "billing:view")) return notFound;
  return fileResponse(file);
}
