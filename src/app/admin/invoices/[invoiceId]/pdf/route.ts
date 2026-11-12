import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/session";
import { fromRow } from "@/lib/data/rows";
import type { Account, Invoice } from "@/lib/data/types";
import { getDb, schema as t } from "@/lib/db";
import { pdfResponse, renderInvoicePdf } from "@/lib/invoice-pdf";

export async function GET(_request: Request, ctx: RouteContext<"/admin/invoices/[invoiceId]/pdf">): Promise<Response> {
  const { invoiceId } = await ctx.params;
  await requireAdmin();
  const db = await getDb();
  const [row] = await db
    .select({ invoice: t.invoices, account: t.accounts })
    .from(t.invoices)
    .innerJoin(t.accounts, eq(t.accounts.id, t.invoices.accountId))
    .where(eq(t.invoices.id, invoiceId));
  if (!row) return new Response("Not found", { status: 404 });
  const invoice = fromRow<Invoice>(row.invoice);
  return pdfResponse(await renderInvoicePdf(invoice, fromRow<Account>(row.account)), `${invoice.number}.pdf`);
}
