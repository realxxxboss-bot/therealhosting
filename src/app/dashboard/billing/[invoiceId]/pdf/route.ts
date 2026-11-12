import { requireViewer } from "@/lib/auth/session";
import { getInvoice } from "@/lib/data/client";
import { pdfResponse, renderInvoicePdf } from "@/lib/invoice-pdf";

export async function GET(_request: Request, ctx: RouteContext<"/dashboard/billing/[invoiceId]/pdf">): Promise<Response> {
  const { invoiceId } = await ctx.params;
  const viewer = await requireViewer();
  // getInvoice checks billing access and the viewer's account.
  const invoice = await getInvoice(viewer, invoiceId);
  if (!invoice) return new Response("Not found", { status: 404 });
  return pdfResponse(await renderInvoicePdf(invoice, viewer.account), `${invoice.number}.pdf`);
}
